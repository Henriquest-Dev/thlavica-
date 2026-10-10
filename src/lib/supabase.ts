import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ligação ao Supabase. Só existe se as duas variáveis estiverem definidas no build
 * (VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY). A chave "publishable" é feita para ir no
 * navegador: quem manda é a segurança por linhas (RLS) das tabelas, ver supabase/migrations.
 * Nunca pôr aqui a chave "secret"/service_role nem a palavra-passe da base de dados.
 */
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const remoteEnabled = Boolean(URL && KEY)

/** O painel pede "utilizador"; o Supabase Auth pede email. Este domínio é só interno (nunca recebe correio). */
export const ADMIN_EMAIL_DOMAIN = 'admin.tlhavika.local'
export const adminEmail = (user: string) => `${user.trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`

export const BUCKET = 'site'

let client: Promise<SupabaseClient> | null = null

/** O cliente carrega-se na primeira utilização (fora do carregamento inicial da página). */
export function getClient(): Promise<SupabaseClient> | null {
  if (!remoteEnabled) return null
  client ??= import('@supabase/supabase-js').then((m) => m.createClient(URL!, KEY!, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'tlh:sb-auth' } }))
  return client
}

/* ---------------------------------------------------------------- acesso leve para visitantes */
// Os visitantes só leem o catálogo e enviam pedidos: bastam duas chamadas `fetch` ao PostgREST.
// Assim a biblioteca do Supabase (cerca de 55 KB comprimida) só se descarrega no painel de administração.

export interface PublicRow {
  id: string
  data: unknown
  pos: number
}

const restHeaders = (): Record<string, string> => ({ apikey: KEY!, Authorization: `Bearer ${KEY}` })

/** Lê uma tabela de leitura pública (id, data, pos). Lança erro se o pedido falhar. */
export async function publicSelect(table: string, order: string): Promise<PublicRow[]> {
  const r = await fetch(`${URL}/rest/v1/${table}?select=id,data,pos&order=${order}`, { headers: restHeaders() })
  if (!r.ok) throw new Error(`${table}: ${r.status}`)
  return (await r.json()) as PublicRow[]
}

/** Insere uma linha como visitante. Devolve o erro do servidor (ex.: código 23505 = já existe) ou null. */
export async function publicInsert(table: string, row: { id: string; data: unknown }): Promise<{ code?: string; message: string } | null> {
  const r = await fetch(`${URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...restHeaders(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  })
  if (r.ok) return null
  const e = (await r.json().catch(() => ({}))) as { code?: string; message?: string }
  return { code: e.code, message: e.message ?? `${table}: ${r.status}` }
}
