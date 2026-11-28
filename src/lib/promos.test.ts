import { describe, expect, it } from 'vitest'
import type { Promo } from '../data/admin'
import { endInDays, MAX_PROMO_PRODUCTS, normalizePromo, promoLink, promoLive, promoProducts, promoStyle, mediaAt, mediaPlaces, cleanCarousel, safeLink } from './promos'

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

describe('onde aparece o carrossel', () => {
  const m = (locais?: string[], ativo = true) => ({ ativo, locais })
  it('itens antigos (sem locais) aparecem na página inicial', () => {
    expect(mediaPlaces(m())).toEqual(['inicio'])
    expect(mediaAt([m(), m(['topo'])], 'inicio')).toHaveLength(1)
  })
  it('cada item só aparece onde foi escolhido, e só se estiver ativo', () => {
    const l = [m(['topo', 'produto:cabo']), m(['produtos']), m(['topo'], false)]
    expect(mediaAt(l, 'topo')).toHaveLength(1)
    expect(mediaAt(l, 'produto:cabo')).toHaveLength(1)
    expect(mediaAt(l, 'produto:outro')).toHaveLength(0)
    expect(mediaAt(l, 'produtos')).toHaveLength(1)
  })
})

describe('carrossel e cartaz principal', () => {
  it('aceita só definições bem formadas', () => {
    expect(cleanCarousel(undefined)).toEqual({ auto: true, segundos: 5, cartazOrigem: true })
    expect(cleanCarousel({ auto: false, segundos: 99, cartazOrigem: 'x' })).toEqual({ auto: false, segundos: 30, cartazOrigem: true })
    expect(cleanCarousel({ segundos: 1 }).segundos).toBe(2)
  })

  it('as ligações só levam a páginas do próprio site', () => {
    expect(safeLink('/produtos/bomba-1')).toBe('/produtos/bomba-1')
    expect(safeLink('https://exemplo.com')).toBeUndefined()
    expect(safeLink('//exemplo.com')).toBeUndefined()
    expect(safeLink('javascript:alert(1)')).toBeUndefined()
    expect(safeLink(3)).toBeUndefined()
  })

  it('o cartaz principal e o pop-up mostram fotografias e vídeos do telemóvel, mas não o YouTube', () => {
    const items = [
      { id: 'a', tipo: 'imagem', ativo: true, locais: ['cartaz'] },
      { id: 'b', tipo: 'video', ativo: true, locais: ['cartaz', 'inicio', 'popup'] },
      { id: 'c', tipo: 'imagem', ativo: false, locais: ['cartaz'] },
      { id: 'd', tipo: 'youtube', ativo: true, locais: ['cartaz', 'popup', 'inicio'] },
    ]
    expect(mediaAt(items, 'cartaz').map((m) => m.id)).toEqual(['a', 'b'])
    expect(mediaAt(items, 'popup').map((m) => m.id)).toEqual(['b'])
    expect(mediaAt(items, 'inicio').map((m) => m.id)).toEqual(['b', 'd'])
  })
})
