import { adminEmail, getClient, remoteEnabled } from './supabase'
import { checkCredentials, isAdmin, signIn, signOut } from './adminSession'
import { setAdminSession } from './sync'

/**
 * Entrada e saída do painel.
 * Com o Supabase ligado, a conta é do Supabase Auth e só conta quem estiver na tabela `admins`.
 * Sem ele (protótipo local), verifica o resumo das credenciais no navegador.
 */

export type SignInResult = { ok: true } | { ok: false; error: string }

const WRONG = 'Utilizador ou palavra-passe incorretos.'

/** O utilizador da sessão é administrador? (a política de `admins` só deixa ver a própria linha) */
async function sessionIsAdmin(): Promise<boolean> {
  const c = getClient()
  if (!c) return false
  const client = await c
  const { data: s } = await client.auth.getSession()
  if (!s.session) return false
  const { data, error } = await client.from('admins').select('user_id').eq('user_id', s.session.user.id).maybeSingle()
  return !error && Boolean(data)
}

export async function signInAdmin(user: string, pass: string): Promise<SignInResult> {
  if (!remoteEnabled) {
    if (!checkCredentials(user, pass)) return { ok: false, error: WRONG }
    signIn()
    return { ok: true }
  }
  try {
    const client = await getClient()!
    const { error } = await client.auth.signInWithPassword({ email: adminEmail(user), password: pass })
    if (error) {
      if (/invalid login|credentials/i.test(error.message)) return { ok: false, error: WRONG }
      if (/fetch|network|timeout/i.test(error.message)) return { ok: false, error: 'Sem ligação ao servidor. Tente de novo.' }
      return { ok: false, error: `Não foi possível entrar: ${error.message}` }
    }
    if (!(await sessionIsAdmin())) {
      await client.auth.signOut()
      return { ok: false, error: 'Esta conta não tem permissão de administrador.' }
    }
    signIn()
    setAdminSession(true)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Sem ligação ao servidor. Tente de novo.' }
  }
}

/** Ao abrir o painel: a sessão guardada continua válida? */
export async function restoreAdmin(): Promise<boolean> {
  if (!remoteEnabled) return isAdmin()
  try {
    const ok = await sessionIsAdmin()
    if (ok) signIn()
    else signOut()
    setAdminSession(ok)
    return ok
  } catch {
    // sem rede: mantém a sessão deste separador, se houver
    return isAdmin()
  }
}

export async function signOutAdmin(): Promise<void> {
  signOut()
  setAdminSession(false)
  if (!remoteEnabled) return
  try {
    await (await getClient()!).auth.signOut()
  } catch {
    /* sem rede: a sessão local já foi apagada */
  }
}
