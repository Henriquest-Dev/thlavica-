import { beforeEach, describe, expect, it } from 'vitest'
import { memoryAdapter, setAdapter, writeStored } from '../lib/store'
import { defaultContact, getContact, wa } from './site'

beforeEach(() => setAdapter(memoryAdapter()))

describe('contactos', () => {
  it('sem alterações usa os de origem', () => {
    expect(getContact()).toEqual(defaultContact)
    expect(wa('Olá')).toBe(`https://wa.me/${defaultContact.whatsapp}?text=Ol%C3%A1`)
  })

  it('o que o painel guardar sobrepõe-se, incluindo no link do WhatsApp', () => {
    writeStored('settings', { phone: '+258 84 000 0000', whatsapp: '258840000000' })
    expect(getContact().phone).toBe('+258 84 000 0000')
    expect(getContact().email).toBe(defaultContact.email)
    expect(wa('x')).toContain('wa.me/258840000000')
  })
})
