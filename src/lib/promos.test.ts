import { describe, expect, it } from 'vitest'
import type { Promo } from '../data/admin'
import { endInDays, MAX_PROMO_PRODUCTS, normalizePromo, promoLink, promoLive, promoProducts, promoStyle } from './promos'

const base: Promo = { id: 'p', formato: 'faixa', titulo: 'T', texto: '', cta: 'Ver', destino: '/produtos', ativo: true }

describe('promoLink', () => {
  it('leva ao produto escolhido, ao catálogo, à cotação ou aos simuladores', () => {
    expect(promoLink({ ...base, alvo: 'produto', produtos: ['bomba-x', 'outro'] })).toBe('/produtos/bomba-x')
    expect(promoLink({ ...base, alvo: 'produto', produtos: [] })).toBe('/produtos')
    expect(promoLink({ ...base, alvo: 'catalogo' })).toBe('/produtos')
    expect(promoLink({ ...base, alvo: 'cotacao' })).toBe('/contacto')
    expect(promoLink({ ...base, alvo: 'simuladores' })).toBe('/servicos#simuladores')
  })
  it('promoções antigas continuam a usar o endereço guardado', () => {
    expect(promoLink({ ...base, destino: '/produtos/abc' })).toBe('/produtos/abc')
    expect(promoLink({ ...base, destino: '' })).toBe('/produtos')
    expect(promoLink({ ...base, alvo: 'link', destino: 'https://exemplo.pt' })).toBe('https://exemplo.pt')
  })
})

describe('promoProducts', () => {
  const cat = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }, { id: 'f' }]
  it('respeita a ordem escolhida, ignora os que já não existem e limita a quantidade', () => {
    expect(promoProducts({ produtos: ['c', 'x', 'a'] }, cat).map((p) => p.id)).toEqual(['c', 'a'])
    expect(promoProducts({ produtos: ['a', 'b', 'c', 'd', 'e', 'f'] }, cat)).toHaveLength(MAX_PROMO_PRODUCTS)
    expect(promoProducts({}, cat)).toEqual([])
  })
})

describe('promoStyle / normalizePromo / endInDays', () => {
  it('cada formato tem cores por omissão e a escolha manda', () => {
    expect(promoStyle({ formato: 'faixa' })).toBe('ambar')
    expect(promoStyle({ formato: 'destaque' })).toBe('azul')
    expect(promoStyle({ formato: 'popup' })).toBe('claro')
    expect(promoStyle({ formato: 'popup', estilo: 'azul' })).toBe('azul')
  })

  it('deduz a escolha a partir do endereço das promoções antigas', () => {
    expect(normalizePromo({ ...base, destino: '/produtos/bomba-x' })).toMatchObject({ alvo: 'produto', produtos: ['bomba-x'] })
    expect(normalizePromo({ ...base, destino: '/contacto' }).alvo).toBe('cotacao')
    expect(normalizePromo({ ...base, destino: '/servicos#simuladores' }).alvo).toBe('simuladores')
    expect(normalizePromo({ ...base, destino: '/produtos' }).alvo).toBe('catalogo')
    expect(normalizePromo({ ...base, destino: 'https://x.pt' }).alvo).toBe('link')
    const ja = { ...base, alvo: 'cotacao' as const }
    expect(normalizePromo(ja)).toBe(ja)
  })

  it('calcula a data de fim e a promoção termina nesse dia', () => {
    expect(endInDays(7, new Date(2026, 9, 10))).toBe('2026-10-17')
    expect(endInDays(30, new Date(2026, 11, 20))).toBe('2027-01-19')
    const fim = endInDays(1, new Date(2026, 9, 10))
    expect(promoLive({ ...base, fim }, new Date(2026, 9, 11, 22).getTime())).toBe(true)
    expect(promoLive({ ...base, fim }, new Date(2026, 9, 12, 1).getTime())).toBe(false)
  })
})
