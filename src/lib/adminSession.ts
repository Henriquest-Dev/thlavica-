/** Sessão do painel (protótipo, sem autenticação real): vale enquanto o separador estiver aberto. */
const KEY = 'tlh:admin'

export function isAdmin(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function signIn() {
  try {
    window.sessionStorage.setItem(KEY, '1')
  } catch {
    /* ignorar */
  }
}

export function signOut() {
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    /* ignorar */
  }
}
