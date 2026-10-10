import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { QuoteRequest } from '../data/admin'

/** Servidor falso, em memória, com a parte do cliente Supabase que a sincronização usa. */
function fakeServer() {
  const tables = new Map<string, Map<string, { id: string; data: unknown; pos: number }>>()
  const calls: string[] = []
  let failNext: string | null = null
  const t = (n: string) => tables.get(n) ?? tables.set(n, new Map()).get(n)!
  const client = {
    from(table: string) {
      return {
        select() {
          const q = {
            order: () => q,
            then: (ok: (v: unknown) => unknown) => ok({ data: [...t(table).values()].sort((a, b) => a.pos - b.pos), error: null }),
          }
          return q
        },
        async upsert(rows: { id: string; data: unknown; pos: number }[]) {
          calls.push(`upsert ${table} ${rows.map((r) => r.id).join(',')}`)
          if (failNext) return { error: { message: failNext, code: 'x' } }
          rows.forEach((r) => t(table).set(r.id, r))
          return { error: null }
        },
        delete: () => ({
          async in(_c: string, ids: string[]) {
            calls.push(`delete ${table} ${ids.join(',')}`)
            if (failNext) return { error: { message: failNext, code: 'x' } }
            ids.forEach((i) => t(table).delete(i))
            return { error: null }
          },
        }),
        async insert(row: { id: string; data: unknown }) {
          calls.push(`insert ${table} ${row.id}`)
          if (failNext) return { error: { message: failNext, code: 'x' } }
          t(table).set(row.id, { ...row, pos: 0 })
          return { error: null }
        },
      }
    },
  }
  return {
    client,
    tables,
    calls,
    t,
    fail: (m: string | null) => (failNext = m),
    failing: () => failNext,
  }
}

let server: ReturnType<typeof fakeServer>

async function load() {
  vi.resetModules()
  vi.doMock('./supabase', () => ({
    remoteEnabled: true,
    getClient: () => Promise.resolve(server.client),
    adminEmail: (u: string) => u,
    BUCKET: 'site',
    // acesso de visitante: lê e insere no mesmo servidor falso
    publicSelect: async (table: string) => [...server.t(table).values()].sort((a, b) => a.pos - b.pos),
    publicInsert: async (table: string, row: { id: string; data: unknown }) => {
      server.calls.push(`insert ${table} ${row.id}`)
      if (server.failing()) throw new Error(server.failing()!)
      server.t(table).set(row.id, { ...row, pos: 0 })
      return null
    },
  }))
  const store = await import('./store')
  store.setAdapter(store.memoryAdapter())
  const sync = await import('./sync')
  return { store, sync }
}

const flushAsync = () => new Promise((r) => setTimeout(r, 20))

beforeEach(() => {
  server = fakeServer()
})

describe('toRows / fromRows / diffRows', () => {
  it('converte as três formas e volta ao mesmo valor', async () => {
    const { sync } = await load()
    const arr = [{ id: 'a', x: 1 }, { id: 'b', x: 2 }]
    expect(sync.fromRows({ shape: 'array' }, sync.toRows({ shape: 'array' }, arr))).toEqual(arr)
    const rec = { p1: { hidden: true } }
    expect(sync.fromRows({ shape: 'record' }, sync.toRows({ shape: 'record' }, rec))).toEqual(rec)
    expect(sync.toRows({ shape: 'object' }, {})).toEqual([])
    expect(sync.fromRows({ shape: 'object' }, sync.toRows({ shape: 'object' }, { phone: '1' }))).toEqual({ phone: '1' })
  })

  it('só envia o que mudou ou foi apagado', async () => {
    const { sync } = await load()
    const rows = sync.toRows({ shape: 'array' }, [{ id: 'a', v: 1 }, { id: 'b', v: 2 }])
    const known = new Map(rows.map((r) => [r.id, JSON.stringify([r.data, r.pos])]))
    const next = sync.toRows({ shape: 'array' }, [{ id: 'a', v: 1 }, { id: 'c', v: 3 }])
    const d = sync.diffRows(known, next)
    expect(d.upsert.map((r) => r.id)).toEqual(['c'])
    expect(d.remove).toEqual(['b'])
  })

  it('pedidos ordenados por data não mudam de posição quando chega um novo', async () => {
    const { sync } = await load()
    const a = sync.toRows({ shape: 'array', order: 'created' }, [{ id: 'q2' }, { id: 'q1' }])
    expect(a.map((r) => r.pos)).toEqual([0, 0])
  })
})

describe('pull', () => {
  it('visitante descarrega só o que é público', async () => {
    server.t('promos').set('p1', { id: 'p1', data: { id: 'p1', titulo: 'Promo' }, pos: 0 })
    server.t('quote_requests').set('q1', { id: 'q1', data: { id: 'q1' }, pos: 0 })
    const { store, sync } = await load()
    await sync.pullNow()
    expect(store.readStored('promos', [])).toEqual([{ id: 'p1', titulo: 'Promo' }])
    expect(store.readStored('quotes', 'nada')).toBe('nada')
  })

  it('administrador descarrega também pedidos e propostas', async () => {
    server.t('quote_requests').set('q1', { id: 'q1', data: { id: 'q1', nome: 'A' }, pos: 0 })
    const { store, sync } = await load()
    sync.setAdminSession(true)
    await flushAsync()
    expect(store.readStored('quotes', [])).toEqual([{ id: 'q1', nome: 'A' }])
  })

  it('servidor vazio mantém as fotografias de origem do carrossel', async () => {
    const { store, sync } = await load()
    store.hydrateStored('media', [{ id: 'm', titulo: 'origem' }])
    await sync.pullNow()
    expect(store.readStored('media', [])).toEqual([{ id: 'm', titulo: 'origem' }])
  })

  it('administrador com dados do protótipo e servidor vazio: os dados sobem em vez de se perderem', async () => {
    const { store, sync } = await load()
    store.hydrateStored('promos', [{ id: 'p1', titulo: 'Do protótipo' }])
    sync.setAdminSession(true)
    await flushAsync()
    expect(server.t('promos').get('p1')?.data).toEqual({ id: 'p1', titulo: 'Do protótipo' })
    expect(store.readStored('promos', [])).toEqual([{ id: 'p1', titulo: 'Do protótipo' }])
  })
})

describe('gravar como administrador', () => {
  it('envia só a diferença', async () => {
    server.t('promos').set('a', { id: 'a', data: { id: 'a' }, pos: 0 })
    server.t('promos').set('b', { id: 'b', data: { id: 'b' }, pos: 1 })
    const { store, sync } = await load()
    sync.connect()
    sync.setAdminSession(true)
    await flushAsync()
    server.calls.length = 0
    store.writeStored('promos', [{ id: 'a' }, { id: 'c' }])
    await flushAsync()
    expect(server.calls).toEqual(['upsert promos c', 'delete promos b'])
    expect([...server.t('promos').keys()].sort()).toEqual(['a', 'c'])
  })

  it('se falhar, guarda como por enviar, não perde o valor local e volta a tentar', async () => {
    const { store, sync } = await load()
    sync.connect()
    sync.setAdminSession(true)
    await flushAsync()
    server.fail('sem rede')
    store.writeStored('promos', [{ id: 'z', titulo: 'Nova' }])
    await flushAsync()
    expect(sync.getSyncStatus().state).toBe('error')
    expect(store.readStored('sync.dirty', [])).toEqual(['promos'])

    // um pull no meio não pode apagar o que ficou por enviar
    await sync.pullNow()
    expect(store.readStored('promos', [])).toEqual([{ id: 'z', titulo: 'Nova' }])

    server.fail(null)
    await sync.retryNow()
    expect(server.t('promos').get('z')?.data).toEqual({ id: 'z', titulo: 'Nova' })
    expect(store.readStored('sync.dirty', ['x'])).toEqual([])
    expect(sync.getSyncStatus().state).toBe('idle')
  })

  it('sem sessão de administrador não envia nada', async () => {
    const { store, sync } = await load()
    sync.connect()
    await flushAsync()
    store.writeStored('promos', [{ id: 'z' }])
    await flushAsync()
    expect(server.calls).toEqual([])
  })
})

describe('submitQuote', () => {
  const q = { id: 'q9', nome: 'A', estado: 'nova' } as unknown as QuoteRequest

  it('insere o pedido', async () => {
    const { sync } = await load()
    await sync.submitQuote(q)
    expect(server.t('quote_requests').get('q9')?.data).toEqual(q)
  })

  it('sem rede, guarda na caixa de saída', async () => {
    const { store, sync } = await load()
    server.fail('sem rede')
    await sync.submitQuote(q)
    expect(store.readStored('quotes.outbox', [])).toEqual([q])
  })
})
