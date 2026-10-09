import { describe, expect, it } from 'vitest'
import type { CatalogOverride, CustomProduct } from '../data/admin'
import type { Product } from '../data/products'
import { mergeCatalog } from './catalog'
import { blankDraft, draftFields } from './catalogEdit'

const base = (id: string): Product => ({ id, name: `Produto ${id}`, category: 'paineis', summary: '', img: id, specs: [], source: 1 })
const custom = (id: string, hidden = false): CustomProduct => ({ ...base(id), img: '', custom: true, hidden })

describe('mergeCatalog', () => {
  it('aplica as edições aos produtos de origem e junta os criados no painel', () => {
    const list = mergeCatalog([base('a'), base('b')], [custom('c')], { a: { name: 'Novo nome' } })
    expect(list.map((p) => p.name)).toEqual(['Novo nome', 'Produto b', 'Produto c'])
    expect(list[0].edited).toBe(true)
    expect(list[0].id).toBe('a')
  })

  it('o site não vê ocultos; o painel vê tudo', () => {
    const args: [Product[], CustomProduct[], Record<string, CatalogOverride>] = [[base('a'), base('b')], [custom('c', true)], { b: { hidden: true } }]
    expect(mergeCatalog(...args).map((p) => p.id)).toEqual(['a'])
    expect(mergeCatalog(...args, true).map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('draftFields', () => {
  it('apara textos, descarta especificações vazias e separa os incluídos', () => {
    const d = { ...blankDraft(), name: '  Painel  ', brand: ' ', specs: [{ label: 'Potência', value: '600 W ' }, { label: '', value: 'x' }], includes: 'Cabo\n\n  Suporte ' }
    const f = draftFields(d)
    expect(f.name).toBe('Painel')
    expect(f.brand).toBeUndefined()
    expect(f.specs).toEqual([{ label: 'Potência', value: '600 W' }])
    expect(f.includes).toEqual(['Cabo', 'Suporte'])
  })
})
