import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { sha256, toHex } from './sha256'
import { CREDENTIAL_HASH, checkCredentials, credentialHash } from './adminSession'

describe('sha256', () => {
  it('coincide com a implementação do Node', () => {
    const enc = new TextEncoder()
    for (const s of ['', 'abc', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(64), 'a'.repeat(200), 'ação — çã']) {
      expect(toHex(sha256(enc.encode(s)))).toBe(createHash('sha256').update(s).digest('hex'))
    }
  })
})

describe('checkCredentials', () => {
  // Credenciais de teste: as verdadeiras nunca entram no repositório.
  const expected = credentialHash('Teste', 'segredo!')

  it('aceita as credenciais certas, sem distinguir maiúsculas no utilizador', () => {
    expect(checkCredentials('teste', 'segredo!', expected)).toBe(true)
    expect(checkCredentials('  TESTE ', 'segredo!', expected)).toBe(true)
  })

  it('recusa palavra-passe ou utilizador errados', () => {
    expect(checkCredentials('teste', 'Segredo!', expected)).toBe(false)
    expect(checkCredentials('teste', '', expected)).toBe(false)
    expect(checkCredentials('outro', 'segredo!', expected)).toBe(false)
  })

  it('o resumo guardado no código é um hash, não texto em claro', () => {
    expect(CREDENTIAL_HASH).toMatch(/^[0-9a-f]{64}$/)
    expect(checkCredentials('', '')).toBe(false)
  })
})
