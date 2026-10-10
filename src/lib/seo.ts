import { useEffect } from 'react'
import { defaultContact, faqs, useContact, type Contact } from '../data/site'

/**
 * SEO: título, descrição, endereço canónico, Open Graph, Twitter e dados estruturados (JSON-LD).
 *
 * Interface: `useSeo({ title, description, path, ... })` em cada página.
 * O resto (construtores do JSON-LD, limites de tamanho) é puro e testado em `seo.test.ts`.
 * No build, `scripts/prerender.mjs` guarda o HTML que isto produz em cada rota, para que
 * os motores de busca e as redes sociais vejam tudo sem executar JavaScript.
 */

export const SITE_NAME = 'Tlhavika'
export const DEFAULT_TITLE = 'Tlhavika — Energia solar e bombas de água em Moçambique'
export const DEFAULT_DESCRIPTION =
  'Painéis solares, inversores, baterias, bombas de água e termoacumuladores solares para casas, negócios e machambas em Moçambique. Peça cotação à Tlhavika.'
export const OG_IMAGE = 'img/og-tlhavika.jpg'

/** Endereço público do site, sem barra final (inclui o caminho base, ex.: /thlavica-). */
export function siteUrl(): string {
  const set = import.meta.env.VITE_SITE_URL as string | undefined
  if (set) return set.replace(/\/$/, '')
  if (typeof window === 'undefined') return ''
  return window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '')
}

/** Endereço absoluto de um ficheiro (imagem, ícone…). */
export function absolute(path: string): string {
  return `${siteUrl()}/${path.replace(/^\//, '')}`
}

/**
 * Endereço absoluto de qualquer imagem: aceita endereços completos, caminhos que já levam a base
 * (/thlavica-/img/x.webp, como devolve `asset()`) e caminhos relativos a /public (img/x.webp).
 * Dados em base64 não servem para partilha e devolvem undefined.
 */
export function fileUrl(p: string | undefined): string | undefined {
  if (!p || p.startsWith('data:') || p.startsWith('blob:')) return undefined
  if (/^https?:/.test(p)) return p
  if (p.startsWith('/')) return `${new URL(siteUrl() || 'http://localhost').origin}${p}`
  return absolute(p)
}

/**
 * Endereço absoluto de uma página. Leva barra final porque é assim que o GitHub Pages serve cada
 * rota pré-renderizada (/produtos redireciona para /produtos/); o canónico tem de ser o endereço final.
 */
export function pageUrl(path: string): string {
  const p = path.replace(/^\/+|\/+$/g, '')
  return p ? `${siteUrl()}/${p}/` : `${siteUrl()}/`
}

/** Corta a descrição para caber nos resultados de pesquisa (cerca de 155 caracteres), sem partir palavras. */
export function trimDescription(text: string, max = 155): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 60)).replace(/[,;:.\s-]+$/, '')}…`
}

/** "Página · Tlhavika", sem repetir a marca nem passar dos ~60 caracteres úteis. */
export function pageTitle(title: string): string {
  if (!title) return DEFAULT_TITLE
  return /tlhavika/i.test(title) ? title : `${title} · ${SITE_NAME}`
}

type Json = Record<string, unknown>

/** Empresa local: nome, contactos e morada (só o que a Tlhavika confirmou no site). */
export function organizationSchema(c: Pick<Contact, 'phone' | 'email' | 'address' | 'facebook'> = defaultContact): Json {
  const [street, area] = c.address.split(/\s+—\s+/)
  return {
    '@type': 'LocalBusiness',
    '@id': `${pageUrl('/')}#empresa`,
    name: SITE_NAME,
    url: pageUrl('/'),
    logo: absolute('img/logo-simbolo.svg'),
    image: absolute(OG_IMAGE),
    description: DEFAULT_DESCRIPTION,
    telephone: c.phone,
    email: c.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [street, area].filter(Boolean).join(', '),
      addressLocality: 'Maputo',
      addressCountry: 'MZ',
    },
    areaServed: { '@type': 'Country', name: 'Moçambique' },
    sameAs: [c.facebook].filter((u) => /^https:\/\//.test(u)),
  }
}

export function websiteSchema(): Json {
  return { '@type': 'WebSite', '@id': `${pageUrl('/')}#site`, url: pageUrl('/'), name: SITE_NAME, inLanguage: 'pt-PT' }
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: pageUrl(it.path) })),
  }
}

export interface ProductLike {
  id: string
  name: string
  summary: string
  brand?: string
  model?: string
  imageUrl?: string
  categoryName?: string
  /** Preço a pagar em MZN (já com desconto). Só se a Tlhavika o publicou no painel. */
  price?: number
  /** Último dia em que esse preço vale (AAAA-MM-DD). */
  priceUntil?: string
}

/** Preço só se existir no painel; a disponibilidade nunca se publica (a Tlhavika confirma-a na cotação). */
export function productSchema(p: ProductLike): Json {
  return {
    '@type': 'Product',
    name: p.name,
    description: p.summary,
    url: pageUrl(`/produtos/${p.id}`),
    ...(p.imageUrl ? { image: p.imageUrl } : {}),
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    ...(p.model ? { model: p.model } : {}),
    ...(p.categoryName ? { category: p.categoryName } : {}),
    ...(p.price && p.price > 0
      ? {
          offers: {
            '@type': 'Offer',
            price: p.price.toFixed(2),
            priceCurrency: 'MZN',
            url: pageUrl(`/produtos/${p.id}`),
            ...(p.priceUntil ? { priceValidUntil: p.priceUntil } : {}),
          },
        }
      : {}),
  }
}

/** Perguntas frequentes que estão visíveis na página inicial. */
export function faqSchema(list: { q: string; a: string }[] = faqs): Json {
  return {
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

export interface SeoInput {
  /** Título curto da página ("" = página inicial). */
  title: string
  description?: string
  /** Caminho da página, a começar por "/" (ex.: "/produtos/painel-x"). */
  path: string
  /** Imagem de partilha (caminho em /public ou endereço completo). */
  image?: string
  /** Páginas que não devem aparecer nos motores de busca. */
  noindex?: boolean
  /** Dados estruturados específicos desta página. */
  jsonLd?: Json[]
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(graph: Json[]) {
  let el = document.head.querySelector<HTMLScriptElement>('script[data-seo="ld"]')
  if (!graph.length) return el?.remove()
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.dataset.seo = 'ld'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

/** Aplica o SEO da página ao <head>. O JSON-LD de cada página leva sempre a empresa e o site. */
export function useSeo(input: SeoInput) {
  const contact = useContact()
  const { title, description, path, image, noindex, jsonLd } = input
  const ld = JSON.stringify(jsonLd ?? [])
  const phone = contact.phone
  const email = contact.email
  const address = contact.address
  const facebook = contact.facebook
  useEffect(() => {
    const full = pageTitle(title)
    const desc = trimDescription(description || DEFAULT_DESCRIPTION)
    const url = pageUrl(path)
    const pic = fileUrl(image) ?? absolute(OG_IMAGE)
    document.title = full
    setMeta('name', 'description', desc)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    setLink('canonical', url)
    setMeta('property', 'og:type', path === '/' ? 'website' : 'article')
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'pt_PT')
    setMeta('property', 'og:title', full)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', pic)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', full)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image', pic)
    setJsonLd(
      noindex
        ? []
        : [organizationSchema({ phone, email, address, facebook }), websiteSchema(), ...(JSON.parse(ld) as Json[])],
    )
    document.documentElement.dataset.seo = path
  }, [title, description, path, image, noindex, ld, phone, email, address, facebook])
}
