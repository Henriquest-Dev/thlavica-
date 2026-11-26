import { describe, expect, it } from 'vitest'
import { cleanKit, kitContents, kitSeparateTotal } from './kits'

const cat = [
  { id: 'bomba', name: 'Bomba', price: 29000 },
  { id: 'painel', name: 'Painel', price: 9800, discount: 10 },
  { id: 'sem', name: 'Sem preço' },
]

describe('kits', () => {
  it('limpa componentes vindos do servidor', () => {
    expect(cleanKit('x')).toEqual([])
    expect(cleanKit([{ id: 'a', qtd: 2 }, { id: 'a', qtd: 5 }, { id: 'kit', qtd: 1 }, { id: '', qtd: 1 }, { id: 'b', qtd: 0 }, { id: 'c', qtd: 5000 }], 'kit')).toEqual([
      { id: 'a', qtd: 2 },
      { id: 'b', qtd: 1 },
      { id: 'c', qtd: 999 },
    ])
  })
  it('soma os componentes ao preço atual (com desconto) e descreve o conteúdo', () => {
    expect(kitSeparateTotal([{ id: 'bomba', qtd: 1 }, { id: 'painel', qtd: 6 }], cat)).toBe(29000 + 6 * 8820)
    expect(kitSeparateTotal([{ id: 'bomba', qtd: 1 }, { id: 'sem', qtd: 1 }], cat)).toBeUndefined()
    expect(kitContents([{ id: 'bomba', qtd: 1 }, { id: 'painel', qtd: 6 }, { id: 'apagado', qtd: 1 }], cat)).toBe('1× Bomba, 6× Painel')
  })
})
