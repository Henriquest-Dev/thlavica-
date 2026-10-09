import { beforeEach, describe, expect, it } from 'vitest'
import { DATA_KEYS, clearData, exportData, importData, memoryAdapter, removeStored, setAdapter, updateStored, usageKb, writeStored } from './store'
import { saveQuoteRequest } from './quotes'

beforeEach(() => setAdapter(memoryAdapter()))

describe('store', () => {
  it('updateStored lê, transforma e grava de uma vez', () => {
    updateStored<number[]>('list', [], (l) => [...l, 1])
    updateStored<number[]>('list', [], (l) => [...l, 2])
    expect(JSON.parse(exportData()).list).toEqual([1, 2])
  })

  it('exporta só as chaves do painel e restaura-as', () => {
    writeStored('quotes', [{ id: 'q' }])
    writeStored('outra-coisa', 1)
    const json = exportData()
    expect(Object.keys(JSON.parse(json))).toEqual(['quotes'])

    clearData()
    expect(exportData()).toBe('{}')
    expect(importData(json)).toBe(1)
    expect(JSON.parse(exportData()).quotes).toEqual([{ id: 'q' }])
  })

  it('recusa ficheiros que não são do painel', () => {
    expect(() => importData('[]')).toThrow()
    expect(() => importData('{"x":1}')).toThrow()
    expect(() => importData('não é json')).toThrow()
  })

  it('clearData apaga todas as chaves do painel', () => {
    DATA_KEYS.forEach((k) => writeStored(k, [1]))
    clearData()
    expect(exportData()).toBe('{}')
  })

  it('usageKb cresce com os dados', () => {
    const before = usageKb()
    writeStored('media', 'x'.repeat(5000))
    expect(usageKb()).toBeGreaterThan(before)
  })

  it('removeStored retira uma chave', () => {
    writeStored('promos', [1])
    removeStored('promos')
    expect(exportData()).toBe('{}')
  })
})

describe('saveQuoteRequest', () => {
  it('acrescenta o pedido à frente, como nova', () => {
    saveQuoteRequest({ nome: 'A', telefone: '1', local: 'x', uso: 'Casa', origem: 'formulario' })
    saveQuoteRequest({ nome: 'B', telefone: '2', local: 'y', uso: 'Casa', origem: 'formulario' })
    const quotes = JSON.parse(exportData()).quotes
    expect(quotes.map((q: { nome: string }) => q.nome)).toEqual(['B', 'A'])
    expect(quotes[0].estado).toBe('nova')
  })
})
