import { describe, expect, it } from 'vitest'
import { telLink, whatsappDigits, whatsappLink } from './phone'

describe('números de WhatsApp', () => {
  it('põe o indicativo de Moçambique quando falta', () => {
    expect(whatsappDigits('84 123 4567')).toBe('258841234567')
    expect(whatsappDigits('+258 84 123 4567')).toBe('258841234567')
    expect(whatsappDigits('00258 84-123-4567')).toBe('258841234567')
    expect(whatsappDigits('(258) 87.119.1481')).toBe('258871191481')
  })
  it('não mexe em números de outros países', () => {
    expect(whatsappDigits('+27 82 123 4567')).toBe('27821234567')
    expect(whatsappDigits('+351 912 345 678')).toBe('351912345678')
  })
  it('cria o link do WhatsApp, com mensagem opcional', () => {
    expect(whatsappLink('84 123 4567')).toBe('https://wa.me/258841234567')
    expect(whatsappLink('+258 84 123 4567', 'Olá Maria, tudo bem?')).toBe('https://wa.me/258841234567?text=Ol%C3%A1%20Maria%2C%20tudo%20bem%3F')
  })
  it('números incompletos ou vazios não geram link', () => {
    expect(whatsappLink('')).toBeUndefined()
    expect(whatsappLink('123')).toBeUndefined()
    expect(whatsappLink('abc')).toBeUndefined()
    expect(whatsappLink('1'.repeat(20))).toBeUndefined()
    expect(telLink('84 123 4567')).toBe('tel:+258841234567')
    expect(telLink('12')).toBeUndefined()
  })
})
