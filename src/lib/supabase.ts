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
