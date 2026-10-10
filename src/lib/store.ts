import { useCallback, useSyncExternalStore } from 'react'

/**
 * Armazenamento local do protótipo.
 *
 * Interface: `useStored`, `writeStored`, `updateStored`, `removeStored` e os
 * quatro gestores de dados (`exportData`, `importData`, `clearData`, `usageKb`).
 * Tudo o que mexe em chaves passa por aqui: nenhum outro módulo toca no
 * localStorage. O adaptador (localStorage em produção, memória nos testes)
 * troca-se com `setAdapter`; ao ligar ao Supabase, a base de dados entra como
 * um terceiro adaptador, com cópia em memória à frente.
 */

export interface Adapter {
  get(key: string): string | null
  set(key: string, value: string): boolean
  remove(key: string): void
  keys(): string[]
}

const PREFIX = 'tlh:'

const local: Adapter = {
  get: (k) => {
    try {
      return window.localStorage.getItem(PREFIX + k)
    } catch {
      return null
    }
  },
  set: (k, v) => {
    try {
      window.localStorage.setItem(PREFIX + k, v)
      return true
    } catch {
      return false
    }
  },
  remove: (k) => {
    try {
      window.localStorage.removeItem(PREFIX + k)
    } catch {
      /* sem armazenamento disponível */
    }
  },
  keys: () => {
    try {
      return Object.keys(window.localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .map((k) => k.slice(PREFIX.length))
    } catch {
      return []
    }
  },
}

/** Adaptador em memória: usado pelos testes. */
export function memoryAdapter(initial: Record<string, string> = {}): Adapter {
  const m = new Map(Object.entries(initial))
  return {
    get: (k) => m.get(k) ?? null,
    set: (k, v) => (m.set(k, v), true),
    remove: (k) => void m.delete(k),
    keys: () => [...m.keys()],
  }
}

let adapter: Adapter = local
/** Chamado depois de cada gravação feita pela aplicação (não pelas de `hydrateStored`). Usado pela sincronização. */
let writeHook: ((key: string) => void) | null = null
export function setWriteHook(fn: ((key: string) => void) | null) {
  writeHook = fn
}
const listeners = new Set<() => void>()
const cache = new Map<string, { raw: string | null; value: unknown }>()

export function setAdapter(a: Adapter) {
  adapter = a
  cache.clear()
  listeners.forEach((l) => l())
}

const emit = () => listeners.forEach((l) => l())

function read<T>(key: string, fallback: T): T {
  const raw = adapter.get(key)
  // Sem nada gravado devolve-se sempre o valor por omissão de quem pergunta (não se guarda em cache:
  // dois leitores da mesma chave podem ter omissões diferentes).
  if (raw === null) return fallback
  const hit = cache.get(key)
  if (hit && hit.raw === raw) return hit.value as T
  let value: T = fallback
  try {
    value = JSON.parse(raw) as T
  } catch {
    value = fallback
  }
  cache.set(key, { raw, value })
  return value
}

/** Leitura pontual (fora de componentes). Dentro de componentes use `useStored`. */
export function readStored<T>(key: string, fallback: T): T {
  return read(key, fallback)
}

/** Devolve false se o navegador recusou gravar (por exemplo, memória cheia). */
export function writeStored<T>(key: string, value: T): boolean {
  const ok = adapter.set(key, JSON.stringify(value))
  if (ok) {
    emit()
    writeHook?.(key)
  }
  return ok
}

/** Grava o que veio do servidor, sem o devolver ao servidor. */
export function hydrateStored<T>(key: string, value: T): boolean {
  const ok = adapter.set(key, JSON.stringify(value))
  if (ok) emit()
  return ok
}

/** Lê, transforma e grava de uma só vez (sem ler duas vezes a mesma chave). */
export function updateStored<T>(key: string, fallback: T, fn: (prev: T) => T): boolean {
  return writeStored(key, fn(read(key, fallback)))
}

export function removeStored(key: string) {
  adapter.remove(key)
  emit()
  writeHook?.(key)
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(PREFIX)) cb()
  }
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
  }
}

/** `fallback` tem de ser uma constante estável (fora do componente). */
export function useStored<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  )
  const set = useCallback((next: T | ((prev: T) => T)) => (typeof next === 'function' ? updateStored(key, fallback, next as (p: T) => T) : writeStored(key, next)), [key, fallback])
  return [value, set] as const
}

/* ---- Gestão dos dados do painel (cópia, restauro e limpeza) ---- */

/** Chaves que fazem parte dos dados do painel. A lista de cotação do visitante também. */
export const DATA_KEYS = ['quotes', 'proposals', 'promos', 'media', 'catalog.custom', 'catalog.overrides', 'settings', 'list'] as const

export function exportData(): string {
  const data: Record<string, unknown> = {}
  for (const k of DATA_KEYS) {
    const raw = adapter.get(k)
    if (raw !== null) data[k] = JSON.parse(raw)
  }
  return JSON.stringify(data, null, 2)
}

/** Devolve quantas chaves foram restauradas; lança erro se o ficheiro não for deste painel. */
export function importData(json: string): number {
  const data = JSON.parse(json) as Record<string, unknown>
  if (typeof data !== 'object' || data === null || Array.isArray(data)) throw new Error('Ficheiro inválido')
  let n = 0
  for (const k of DATA_KEYS) {
    if (k in data) {
      adapter.set(k, JSON.stringify(data[k]))
      writeHook?.(k)
      n++
    }
  }
  if (!n) throw new Error('Ficheiro sem dados do painel')
  cache.clear()
  emit()
  return n
}

/** Limpa a cópia deste aparelho. Com o Supabase ligado, os dados do servidor mantêm-se e voltam a carregar. */
export function clearData() {
  DATA_KEYS.forEach((k) => adapter.remove(k))
  cache.clear()
  emit()
}

/** Espaço usado, em KB (cada carácter ocupa 2 bytes no localStorage). */
export function usageKb(): number {
  let n = 0
  for (const k of adapter.keys()) n += (k.length + PREFIX.length + (adapter.get(k)?.length ?? 0)) * 2
  return Math.round(n / 1024)
}

/* ---- Utilitários ---- */

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
