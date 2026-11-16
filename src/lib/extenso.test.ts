import { describe, expect, it } from 'vitest'
import { valorPorExtenso } from './extenso'

describe('valorPorExtenso', () => {
  it('é o do exemplo do sistema da empresa', () => {
    expect(valorPorExtenso(39999.96)).toBe('Trinta e nove mil novecentos e noventa e nove Meticais e noventa e seis centavos')
  })
  it('liga com "e" só quando o resto é pequeno ou redondo', () => {
    expect(valorPorExtenso(1000)).toBe('Mil Meticais')
    expect(valorPorExtenso(1020)).toBe('Mil e vinte Meticais')
    expect(valorPorExtenso(1500)).toBe('Mil e quinhentos Meticais')
    expect(valorPorExtenso(2345)).toBe('Dois mil trezentos e quarenta e cinco Meticais')
    expect(valorPorExtenso(101000)).toBe('Cento e um mil Meticais')
  })
  it('trata cem, cento e os números pequenos', () => {
    expect(valorPorExtenso(100)).toBe('Cem Meticais')
    expect(valorPorExtenso(1)).toBe('Um Metical')
    expect(valorPorExtenso(115)).toBe('Cento e quinze Meticais')
    expect(valorPorExtenso(0.5)).toBe('Cinquenta centavos')
    expect(valorPorExtenso(0.01)).toBe('Um centavo')
  })
  it('milhões', () => {
    expect(valorPorExtenso(1_000_000)).toBe('Um milhão de Meticais')
    expect(valorPorExtenso(2_500_000)).toBe('Dois milhões e quinhentos mil Meticais')
    expect(valorPorExtenso(1_234_567.89)).toBe('Um milhão duzentos e trinta e quatro mil quinhentos e sessenta e sete Meticais e oitenta e nove centavos')
  })
  it('valores inválidos dão texto vazio', () => {
    expect(valorPorExtenso(0)).toBe('')
    expect(valorPorExtenso(-5)).toBe('')
    expect(valorPorExtenso(NaN)).toBe('')
  })
})
