import { describe, expect, it } from 'vitest'
import { parsePrice } from './catalogEdit'
import { activeDiscount, finalPrice, priceLabel, untilLabel } from './pricing'

const day = (iso: string, h = 12) => new Date(`${iso}T${String(h).padStart(2, '0')}:00:00`).getTime()

describe('desconto de produto', () => {
  it('sem desconto ou com valores inválidos, não conta', () => {
    expect(activeDiscount({})).toBe(0)
    expect(activeDiscount({ discount: 0 })).toBe(0)
    expect(activeDiscount({ discount: -5 })).toBe(0)
    expect(activeDiscount({ discount: 150 })).toBe(90)
  })

  it('vale até ao fim do último dia e depois deixa de contar', () => {
    const p = { discount: 20, discountUntil: '2026-10-25' }
    expect(activeDiscount(p, day('2026-10-25', 23))).toBe(20)
    expect(activeDiscount(p, day('2026-10-26', 1))).toBe(0)
    expect(activeDiscount({ discount: 20 }, day('2030-01-01'))).toBe(20)
  })

  it('o preço final aplica o desconto em vigor; sem preço não há preço final', () => {
    expect(finalPrice({ price: 15500, discount: 10 })).toBe(13950)
    expect(finalPrice({ price: 15500, discount: 10, discountUntil: '2020-01-01' })).toBe(15500)
    expect(finalPrice({ price: 99.99, discount: 33 })).toBe(66.99)
    expect(finalPrice({ discount: 10 })).toBeUndefined()
    expect(finalPrice({ price: 0 })).toBeUndefined()
  })

  it('formata o preço e a data', () => {
    expect(priceLabel(15500)).toMatch(/^15\D500 MZN$/)
    expect(priceLabel(1234.5)).toMatch(/1\D?234,50 MZN/)
    expect(untilLabel({ discount: 10, discountUntil: '2099-10-25' })).toBe('até 25/10/2099')
    expect(untilLabel({ discount: 10 })).toBe('')
    expect(untilLabel({ discount: 10, discountUntil: '2000-01-01' })).toBe('')
  })
})

describe('escrever o preço no painel', () => {
  it('aceita os formatos que as pessoas usam e ignora o que não é preço', () => {
    expect(parsePrice('15500')).toBe(15500)
    expect(parsePrice('15 500')).toBe(15500)
    expect(parsePrice('15.500,50')).toBe(15500.5)
    expect(parsePrice('15500.5')).toBe(15500.5)
    expect(parsePrice('15 500 MZN')).toBe(15500)
    expect(parsePrice('')).toBeUndefined()
    expect(parsePrice('abc')).toBeUndefined()
    expect(parsePrice('0')).toBeUndefined()
    expect(parsePrice('-20')).toBeUndefined()
  })
})
