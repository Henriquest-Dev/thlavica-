import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('VITE_SITE_URL', 'https://exemplo.test/thlavica-/')
})

async function load() {
  return import('./seo')
}

describe('contactos vindos do servidor', () => {
  it('só aceita ligações https para a rede social', async () => {
    const { mergeContact, defaultContact } = await import('../data/site')
    expect(mergeContact({ facebook: 'javascript:alert(1)' }).facebook).toBe(defaultContact.facebook)
    expect(mergeContact({ facebook: 'http://inseguro.test' }).facebook).toBe(defaultContact.facebook)
    expect(mergeContact({ facebook: 'https://facebook.com/tlhavika' }).facebook).toBe('https://facebook.com/tlhavika')
    expect(mergeContact({ phone: '+258 1' }).phone).toBe('+258 1')
  })
})

describe('seo', () => {
  it('monta endereços absolutos sem barras a mais', async () => {
    const { absolute, pageUrl, siteUrl } = await load()
    expect(siteUrl()).toBe('https://exemplo.test/thlavica-')
    expect(absolute('/')).toBe('https://exemplo.test/thlavica-/')
    expect(pageUrl('/produtos/x')).toBe('https://exemplo.test/thlavica-/produtos/x/')
    expect(pageUrl('/')).toBe('https://exemplo.test/thlavica-/')
    expect(pageUrl('sobre/')).toBe('https://exemplo.test/thlavica-/sobre/')
    expect(absolute('img/og.jpg')).toBe('https://exemplo.test/thlavica-/img/og.jpg')
  })

  it('fileUrl não duplica a base nem aceita imagens em base64', async () => {
    const { fileUrl } = await load()
    expect(fileUrl('/thlavica-/img/produtos/x.webp')).toBe('https://exemplo.test/thlavica-/img/produtos/x.webp')
    expect(fileUrl('img/x.webp')).toBe('https://exemplo.test/thlavica-/img/x.webp')
    expect(fileUrl('https://cdn.test/a.jpg')).toBe('https://cdn.test/a.jpg')
    expect(fileUrl('data:image/png;base64,AAAA')).toBeUndefined()
    expect(fileUrl(undefined)).toBeUndefined()
  })

  it('corta a descrição em palavras inteiras', async () => {
    const { trimDescription } = await load()
    const long = 'Painéis solares, inversores, baterias, bombas de água e termoacumuladores solares para casas, negócios e machambas em Moçambique. Peça cotação à Tlhavika e receba uma resposta.'
    const t = trimDescription(long)
    expect(t.length).toBeLessThanOrEqual(155)
    expect(t.endsWith('…')).toBe(true)
    expect(long.startsWith(t.slice(0, -1))).toBe(true)
    expect(trimDescription('  curta   demais ')).toBe('curta demais')
  })

  it('o título leva a marca uma só vez', async () => {
    const { pageTitle, DEFAULT_TITLE } = await load()
    expect(pageTitle('')).toBe(DEFAULT_TITLE)
    expect(pageTitle('Catálogo')).toBe('Catálogo · Tlhavika')
    expect(pageTitle('Sobre a Tlhavika')).toBe('Sobre a Tlhavika')
  })

  it('o produto só leva preço se existir, e nunca stock', async () => {
    const { productSchema } = await load()
    const p = productSchema({ id: 'p1', name: 'Bomba X', summary: 'Resumo', brand: 'Marca', model: 'M1' })
    expect(p['@type']).toBe('Product')
    expect(p).not.toHaveProperty('offers')
    const comPreco = productSchema({ id: 'p1', name: 'Bomba X', summary: 'Resumo', price: 13175, priceUntil: '2026-12-31' }) as Record<string, any>
    expect(comPreco.offers).toEqual({ '@type': 'Offer', price: '13175.00', priceCurrency: 'MZN', url: 'https://exemplo.test/thlavica-/produtos/p1/', priceValidUntil: '2026-12-31' })
    expect(comPreco.offers).not.toHaveProperty('availability')
    expect(productSchema({ id: 'p1', name: 'x', summary: 'y', price: 0 })).not.toHaveProperty('offers')
    expect(p.url).toBe('https://exemplo.test/thlavica-/produtos/p1/')
    expect(p.brand).toEqual({ '@type': 'Brand', name: 'Marca' })
  })

  it('a empresa leva morada e só liga a redes com https', async () => {
    const { organizationSchema } = await load()
    const o = organizationSchema({ phone: '+258 1', email: 'a@b.c', address: 'Av. X, km 9 — Zimpeto, Maputo', facebook: 'javascript:alert(1)' }) as Record<string, any>
    expect(o.address.addressCountry).toBe('MZ')
    expect(o.address.streetAddress).toBe('Av. X, km 9, Zimpeto, Maputo')
    expect(o.sameAs).toEqual([])
  })

  it('a lista de migalhas é ordenada e com endereços completos', async () => {
    const { breadcrumbSchema } = await load()
    const b = breadcrumbSchema([{ name: 'Início', path: '/' }, { name: 'Catálogo', path: '/produtos' }]) as Record<string, any>
    expect(b.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2])
    expect(b.itemListElement[1].item).toBe('https://exemplo.test/thlavica-/produtos/')
  })

  it('as perguntas frequentes vêm das mesmas que estão na página', async () => {
    const { faqSchema } = await load()
    const f = faqSchema([{ q: 'P?', a: 'R.' }]) as Record<string, any>
    expect(f.mainEntity[0].acceptedAnswer.text).toBe('R.')
  })
})
