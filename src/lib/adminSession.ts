import { sha256, toHex } from './sha256'

/**
 * Acesso ao painel (protótipo).
 * A verificação é feita no navegador: o código só contém um resumo (hash)
 * das credenciais, nunca o utilizador nem a palavra-passe. Isto afasta
 * curiosos, mas não é segurança a sério: quem tiver o código pode tentar
 * adivinhar offline. A proteção real vem com contas na base de dados.
 */

const KEY = 'tlh:admin'
const SALT = 'tlhavika-admin-v1'
const ROUNDS = 20000
/** Resumo de `utilizador (minúsculas) + palavra-passe`. Para mudar as credenciais, gerar outro (ver README). */
export const CREDENTIAL_HASH = '6ab7bcb6e48318ad1d60cd8dc95b0ec0da401416efb276b4243bbd055fb13b96'

export function credentialHash(user: string, pass: string): string {
  const enc = new TextEncoder()
  const salt = enc.encode(SALT)
  let h = sha256(enc.encode(`${SALT}\n${user.trim().toLowerCase()}\n${pass}`))
  for (let i = 1; i < ROUNDS; i++) {
    const next = new Uint8Array(h.length + salt.length)
    next.set(h)
    next.set(salt, h.length)
    h = sha256(next)
  }
  return toHex(h)
}

export function checkCredentials(user: string, pass: string, expected = CREDENTIAL_HASH): boolean {
  return credentialHash(user, pass) === expected
}

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
