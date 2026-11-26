import { describe, expect, it } from 'vitest'
import { categories } from '../data/site'
import { categoriesOfSolution, cleanCategoryEdits, mergeCategories, newCategoryId, slugify } from './categories'

describe('categorias', () => {
  it('cria ids de endereço sem acentos e sem repetir', () => {
    expect(slugify('Iluminação Solar!')).toBe('iluminacao-solar')
    expect(newCategoryId('Baterias', categories.map((c) => c.id))).toBe('baterias-2')
    expect(newCategoryId('  ', [])).toBe('categoria')
  })

  it('aceita só edições bem formadas', () => {
    const v = cleanCategoryEdits([
      { id: 'iluminacao', name: 'Iluminação', text: 'x', solution: 'energia-solar', pic: 'painel' },
      { id: 'iluminacao', name: 'Repetida' },
      { id: 'Mau ID', name: 'X' },
      { id: 'sem-nome', name: '' },
      { id: 'estranha', name: 'Estranha', solution: 'javascript:', pic: '<svg>' },
      null,
    ])
    expect(v.map((c) => c.id)).toEqual(['iluminacao', 'estranha'])
    expect(v[1]).toMatchObject({ solution: 'energia-solar', pic: 'candeeiro' })
    expect(cleanCategoryEdits('nada')).toEqual([])
  })

  it('junta as de origem (com o nome mudado) e as novas', () => {
    const list = mergeCategories([
      { id: 'paineis', name: 'Painéis fotovoltaicos', text: 'Novo texto', solution: 'energia-solar', pic: 'painel' },
      { id: 'iluminacao', name: 'Iluminação', text: '', solution: 'bombagem', pic: 'candeeiro' },
    ])
    expect(list).toHaveLength(categories.length + 1)
    expect(list.find((c) => c.id === 'paineis')?.name).toBe('Painéis fotovoltaicos')
    expect(list.find((c) => c.id === 'paineis')?.custom).toBeUndefined()
    expect(list.at(-1)).toMatchObject({ id: 'iluminacao', custom: true })
    const bomb = categoriesOfSolution(list, 'bombagem', ['bombas-solares'])
    expect(bomb.map((c) => c.id)).toEqual(['bombas-solares', 'iluminacao'])
  })
})
