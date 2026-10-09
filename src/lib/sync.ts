import { hydrateStored, readStored, setWriteHook, writeStored } from './store'
import { getClient, remoteEnabled } from './supabase'
import type { QuoteRequest } from '../data/admin'

/**
 * Sincronização com o Supabase.
 *
 * Interface: `startSync()` (uma vez, ao arrancar), `pullNow()`, `submitQuote()`,
 * `useSyncStatus()` e `setAdminSession()`.
 * O resto da aplicação continua a ler e a gravar chaves em `store.ts`; este módulo
 * descarrega o servidor para essas chaves e devolve ao servidor o que o administrador grava,
 * enviando só a diferença (linhas novas ou alteradas e linhas apagadas).
 */

type Row = { id: string; data: unknown; pos: number }
type Shape = 'array' | 'record' | 'object'

interface Spec {
  key: string
  table: string
  shape: Shape
  /** Só administradores lêem e escrevem (propostas e pedidos). */
  admin?: boolean
  /** 'created' ordena do mais recente; a posição não conta. */
  order?: 'pos' | 'created'
  /** Se o servidor estiver vazio, a aplicação mantém o que tem (ex.: fotografias de origem). */
  keepWhenEmpty?: boolean
}

export const SPECS: Spec[] = [
  { key: 'catalog.custom', table: 'catalog_products', shape: 'array' },
  { key: 'catalog.overrides', table: 'catalog_overrides', shape: 'record' },
  { key: 'promos', table: 'promos', shape: 'array' },
  { key: 'media', table: 'media_items', shape: 'array', keepWhenEmpty: true },
  { key: 'settings', table: 'site_settings', shape: 'object' },
  { key: 'proposals', table: 'proposals', shape: 'array', admin: true },
  { key: 'quotes', table: 'quote_requests', shape: 'array', admin: true, order: 'created' },
]

const SETTINGS_ID = 'contactos'

/* ---------------------------------------------------------------- funções puras */

export function toRows(spec: Pick<Spec, 'shape' | 'order'>, value: unknown): Row[] {
  const flat = spec.order === 'created'
  if (spec.shape === 'array') return ((value as { id: string }[]) ?? []).map((d, i) => ({ id: d.id, data: d, pos: flat ? 0 : i }))
  if (spec.shape === 'record') return Object.entries((value as Record<string, unknown>) ?? {}).map(([id, d]) => ({ id, data: d, pos: 0 }))
  const obj = (value as Record<string, unknown>) ?? {}
  return Object.keys(obj).length ? [{ id: SETTINGS_ID, data: obj, pos: 0 }] : []
}

export function fromRows(spec: Pick<Spec, 'shape'>, rows: Row[]): unknown {
  if (spec.shape === 'array') return rows.map((r) => r.data)
  if (spec.shape === 'record') return Object.fromEntries(rows.map((r) => [r.id, r.data]))
  return rows[0]?.data ?? {}
}

const sig = (r: Row) => JSON.stringify([r.data, r.pos])

/** O que há que enviar para passar de `known` (o que o servidor tem) a `next` (o que a aplicação tem). */
export function diffRows(known: Map<string, string>, next: Row[]): { upsert: Row[]; remove: string[] } {
  const ids = new Set(next.map((r) => r.id))
  return {
    upsert: next.filter((r) => known.get(r.id) !== sig(r)),
    remove: [...known.keys()].filter((id) => !ids.has(id)),
  }
}

const online = () => typeof navigator === 'undefined' || navigator.onLine !== false

const isEmpty = (v: unknown) => (Array.isArray(v) ? v.length === 0 : v && typeof v === 'object' ? Object.keys(v).length === 0 : !v)

/* ---------------------------------------------------------------- estado */

export type SyncState = 'idle' | 'saving' | 'error' | 'offline'
interface Status {
  state: SyncState
  /** Última vez que se descarregou do servidor. */
  at: number
  error?: string
}

let status: Status = { state: 'idle', at: 0 }
const subs = new Set<() => void>()
const setStatus = (s: Partial<Status>) => {
  status = { ...status, ...s }
  subs.forEach((f) => f())
}
export const getSyncStatus = () => status
export const subscribeSync = (f: () => void) => (subs.add(f), () => void subs.delete(f))

const known = new Map<string, Map<string, string>>()
const dirty = new Set<string>()
const chains = new Map<string, Promise<void>>()
let admin = false
let first: Promise<void> | null = null

const loadDirty = () => readStored<string[]>('sync.dirty', []).forEach((k) => dirty.add(k))
const saveDirty = () => hydrateStored('sync.dirty', [...dirty])

/** Diz ao módulo se há uma sessão de administrador (só então se lêem e escrevem as tabelas privadas). */
export function setAdminSession(on: boolean) {
  const changed = on !== admin
  admin = on
  if (changed && on) void pullNow()
}

/* ---------------------------------------------------------------- servidor → aplicação */

async function pullSpec(spec: Spec) {
  const c = await getClient()
  if (!c) return
  if (dirty.has(spec.key)) return flush(spec.key)
  let q = c.from(spec.table).select('id,data,pos')
  q = spec.order === 'created' ? q.order('created_at', { ascending: false }) : q.order('pos', { ascending: true })
  const { data, error } = await q
  if (error) throw error
  const rows = (data ?? []) as Row[]
  const local = readStored<unknown>(spec.key, null)
  if (rows.length === 0 && admin && !isEmpty(local) && !spec.keepWhenEmpty) {
    // Servidor ainda vazio e este aparelho tem dados do protótipo: sobem para o servidor.
    known.set(spec.key, new Map())
    return flush(spec.key)
  }
  known.set(spec.key, new Map(rows.map((r) => [r.id, sig(r)])))
  if (rows.length === 0 && spec.keepWhenEmpty) return
  hydrateStored(spec.key, fromRows(spec, rows))
}

export async function pullNow(): Promise<void> {
  if (!remoteEnabled) return
  try {
    await Promise.all(SPECS.filter((s) => admin || !s.admin).map(pullSpec))
    setStatus({ state: dirty.size ? 'error' : 'idle', at: Date.now(), error: undefined })
  } catch (e) {
    setStatus({ state: online() ? 'error' : 'offline', error: message(e) })
  }
}

/* ---------------------------------------------------------------- aplicação → servidor */

function flush(key: string): Promise<void> {
  const run = async () => {
    const spec = SPECS.find((s) => s.key === key)
    const c = spec && admin ? await getClient() : null
    if (!spec || !c) return
    await first
    const prev = known.get(key) ?? new Map<string, string>()
    const rows = toRows(spec, readStored<unknown>(key, spec.shape === 'array' ? [] : {}))
    const { upsert, remove } = diffRows(prev, rows)
    if (!upsert.length && !remove.length) {
      if (dirty.delete(key)) saveDirty()
      return
    }
    setStatus({ state: 'saving' })
    try {
      if (upsert.length) {
        const { error } = await c.from(spec.table).upsert(upsert)
        if (error) throw error
      }
      if (remove.length) {
        const { error } = await c.from(spec.table).delete().in('id', remove)
        if (error) throw error
      }
      known.set(key, new Map(rows.map((r) => [r.id, sig(r)])))
      if (dirty.delete(key)) saveDirty()
      setStatus({ state: dirty.size ? 'error' : 'idle', error: undefined })
    } catch (e) {
      dirty.add(key)
      saveDirty()
      setStatus({ state: online() ? 'error' : 'offline', error: message(e) })
    }
  }
  const next = (chains.get(key) ?? Promise.resolve()).then(run, run)
  chains.set(key, next)
  return next
}

function onWrite(key: string) {
  if (!remoteEnabled || !admin) return
  if (SPECS.some((s) => s.key === key)) void flush(key)
}

/** Tenta de novo o que ficou por enviar. */
export function retryNow() {
  return Promise.all([...dirty].map(flush)).then(() => undefined)
}

/* ---------------------------------------------------------------- pedidos dos visitantes */

/** Envia o pedido; se não houver rede, fica na caixa de saída e segue na próxima visita. */
export async function submitQuote(q: QuoteRequest): Promise<void> {
  try {
    const c = await getClient()
    if (!c) throw new Error('sem cliente')
    const { error } = await c.from('quote_requests').insert({ id: q.id, data: q })
    if (error) throw error
  } catch {
    writeStored('quotes.outbox', [...readStored<QuoteRequest[]>('quotes.outbox', []), q])
  }
}

async function flushOutbox() {
  const out = readStored<QuoteRequest[]>('quotes.outbox', [])
  if (!out.length) return
  const c = await getClient()
  if (!c) return
  const left: QuoteRequest[] = []
  for (const q of out) {
    const { error } = await c.from('quote_requests').insert({ id: q.id, data: q })
    // 23505 = já existe (foi enviado antes): conta como entregue
    if (error && error.code !== '23505') left.push(q)
  }
  hydrateStored('quotes.outbox', left)
}

/* ---------------------------------------------------------------- arranque */

/** Liga a sincronização às gravações e faz a primeira descarga. */
export function connect() {
  loadDirty()
  setWriteHook(onWrite)
  first = pullNow().then(flushOutbox)
}

let started = false
export function startSync() {
  if (started || !remoteEnabled) return
  started = true
  connect()
  const again = () => {
    if (document.visibilityState === 'visible' && Date.now() - status.at > (admin ? 15_000 : 60_000)) void pullNow()
  }
  document.addEventListener('visibilitychange', again)
  window.addEventListener('online', () => void retryNow().then(pullNow))
  window.setInterval(() => {
    if (admin && document.visibilityState === 'visible') void pullNow()
  }, 30_000)
}

function message(e: unknown): string {
  const m = (e as { message?: string })?.message
  return m ? m : 'Erro desconhecido'
}
