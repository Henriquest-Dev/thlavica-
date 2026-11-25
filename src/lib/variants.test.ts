import { describe, expect, it } from 'vitest'
import { cleanOptions, lineKey, missingOption, needsChoice, picksLabel } from './variants'

describe('opções do produto', () => {
  it('uma combinação diferente é uma linha diferente', () => {
    expect(lineKey('cabo', { Cor: 'Preto' })).toBe('cabo|Cor: Preto')
    expect(lineKey('cabo', { Cor: 'Preto' })).not.toBe(lineKey('cabo', { Cor: 'Branco' }))
    expect(lineKey('cabo')).toBe('cabo')
    expect(lineKey('cabo', {})).toBe('cabo')
  })
  it('mostra as escolhas e diz o que falta', () => {
    expect(picksLabel({ Cor: 'Preto', Tensão: '220 V' })).toBe('Cor: Preto · Tensão: 220 V')
    const p = { options: [{ name: 'Cor', values: ['Preto'] }, { name: 'Tensão', values: ['220 V'] }] }
    expect(missingOption(p, { Cor: 'Preto' })).toBe('Tensão')
    expect(missingOption(p, { Cor: 'Preto', Tensão: '220 V' })).toBeUndefined()
  })
  it('só se adiciona de um toque o que não tem escolhas nem metros', () => {
    expect(needsChoice({})).toBe(false)
    expect(needsChoice({ unit: 'm' })).toBe(true)
    expect(needsChoice({ options: [{ name: 'Cor', values: ['Preto'] }] })).toBe(true)
  })
  it('limpa opções vindas do servidor', () => {
    expect(cleanOptions('x')).toEqual([])
    expect(cleanOptions([{ name: ' Cor ', values: ['Preto', 'Preto', ' ', 'Branco', 5] }, { name: 'Cor', values: ['x'] }, { name: '', values: ['y'] }, { name: 'Vazio', values: [] }])).toEqual([{ name: 'Cor', values: ['Preto', 'Branco'] }])
    expect(cleanOptions(Array.from({ length: 6 }, (_, i) => ({ name: `G${i}`, values: ['a'] }))).length).toBe(3)
  })
})
