import { useMemo } from 'react'
import { updateStored, useStored } from './store'
import type { Promo, PromoFormat, PromoStyle, PromoTarget, MediaItem } from '../data/admin'
import { DEFAULT_MEDIA } from '../data/admin'

const NO_PROMOS: Promo[] = []
const DEFAULT_MEDIA_LIST: MediaItem[] = DEFAULT_MEDIA

export function promoLive(p: Promo, now = Date.now()) {
  if (!p.ativo) return false
  if (p.inicio && now < new Date(p.inicio + 'T00:00:00').getTime()) return false
  if (p.fim && now > new Date(p.fim + 'T23:59:59').getTime()) return false
  return true
}

export function usePromos() {
  return useStored<Promo[]>('promos', NO_PROMOS)
}

export function useLivePromo(format: PromoFormat): Promo | undefined {
  const [promos] = usePromos()
  return useMemo(() => promos.find((p) => p.formato === format && promoLive(p)), [promos, format])
}

export function useMedia() {
  return useStored<MediaItem[]>('media', DEFAULT_MEDIA_LIST)
}

/** Onde um vídeo ou fotografia pode aparecer (além de 'produto:<id>', para um produto em concreto). */
export const MEDIA_PLACES: { id: string; label: string; hint: string; onlyImages?: boolean }[] = [
  { id: 'cartaz', label: 'Cartaz principal (banner)', hint: 'No lugar do cartaz grande do início, a passar uns atrás dos outros. Só fotografias; use imagens largas, por exemplo 2000 × 800.', onlyImages: true },
  { id: 'topo', label: 'Topo da página inicial', hint: 'Logo por baixo do cartaz, a primeira coisa que o cliente vê' },
  { id: 'inicio', label: 'Página inicial (mais abaixo)', hint: 'Na secção “O nosso trabalho”' },
  { id: 'produtos', label: 'Lista de produtos', hint: 'No início da página Produtos' },
  { id: 'servicos', label: 'Serviços', hint: 'No início da página Serviços' },
  { id: 'sobre', label: 'Sobre nós', hint: 'No início da página Sobre' },
  { id: 'contacto', label: 'Pedir cotação', hint: 'No início da página do formulário' },
]

/* ---------------------------------------------------------------- como passa o carrossel */

export interface CarouselSettings {
  /** Passa sozinho de uma imagem para a seguinte. */
  auto: boolean
  /** Segundos em cada fotografia (os vídeos esperam pelo menos 7). */
  segundos: number
  /** O cartaz de origem continua a aparecer no cartaz principal, antes das fotografias do painel. */
  cartazOrigem: boolean
}

export const CAROUSEL_DEFAULTS: CarouselSettings = { auto: true, segundos: 5, cartazOrigem: true }
export const CAROUSEL_SECONDS = [3, 5, 8, 12]

/** Os dados vêm do servidor: só se aceita o que está bem formado. */
export function cleanCarousel(v: unknown): CarouselSettings {
  const o = (v && typeof v === 'object' ? v : {}) as Partial<Record<keyof CarouselSettings, unknown>>
  const seg = Number(o.segundos)
  return {
    auto: typeof o.auto === 'boolean' ? o.auto : CAROUSEL_DEFAULTS.auto,
    segundos: Number.isFinite(seg) ? Math.min(30, Math.max(2, Math.round(seg))) : CAROUSEL_DEFAULTS.segundos,
    cartazOrigem: typeof o.cartazOrigem === 'boolean' ? o.cartazOrigem : CAROUSEL_DEFAULTS.cartazOrigem,
  }
}

const NO_SETTINGS: { carrossel?: unknown } = {}

export function useCarouselSettings(): CarouselSettings {
  const [s] = useStored<{ carrossel?: unknown }>('settings', NO_SETTINGS)
  return useMemo(() => cleanCarousel(s.carrossel), [s.carrossel])
}

export function saveCarouselSettings(c: CarouselSettings): boolean {
  return updateStored<{ carrossel?: unknown }>('settings', NO_SETTINGS, (s) => ({ ...s, carrossel: cleanCarousel(c) }))
}

/** Ligação de uma fotografia: só endereços do próprio site (ex.: /produtos/x), nunca externos. */
export const safeLink = (v: unknown): string | undefined => (typeof v === 'string' && /^\/[a-z0-9/_-]*$/i.test(v) && !v.startsWith('//') ? v : undefined)

/** Locais de um item; sem nada guardado (itens antigos), aparece na página inicial. */
export const mediaPlaces = (m: { locais?: string[] }): string[] => (m.locais && m.locais.length ? m.locais : ['inicio'])

/** Itens ativos que aparecem em determinado sítio. */
export const mediaAt = <T extends { ativo: boolean; locais?: string[]; tipo?: string }>(items: T[], where: string): T[] =>
  items.filter((m) => m.ativo && mediaPlaces(m).includes(where) && (where !== 'cartaz' || m.tipo === 'imagem'))

export function youtubeId(v: string): string | null {
  const m = v.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/) ?? v.match(/^([\w-]{11})$/)
  return m ? m[1] : null
}

/* ---------------------------------------------------------------- regras das promoções */

export const MAX_PROMO_PRODUCTS = 4

/** Endereço a que o botão leva. Promoções antigas (sem `alvo`) usam o `destino` guardado. */
export function promoLink(p: Pick<Promo, 'alvo' | 'produtos' | 'destino'>): string {
  switch (p.alvo) {
    case 'produto':
      return p.produtos?.[0] ? `/produtos/${p.produtos[0]}` : '/produtos'
    case 'catalogo':
      return '/produtos'
    case 'cotacao':
      return '/contacto'
    case 'simuladores':
      return '/servicos#simuladores'
    default:
      return p.destino || '/produtos'
  }
}

/** Cores por omissão de cada formato. */
export function promoStyle(p: Pick<Promo, 'estilo' | 'formato'>): PromoStyle {
  return p.estilo ?? (p.formato === 'faixa' ? 'ambar' : p.formato === 'destaque' ? 'azul' : 'claro')
}

/** Produtos da promoção que ainda existem e estão visíveis no catálogo, pela ordem escolhida. */
export function promoProducts<T extends { id: string }>(p: Pick<Promo, 'produtos'>, catalog: T[]): T[] {
  const out: T[] = []
  for (const id of p.produtos ?? []) {
    const hit = catalog.find((c) => c.id === id)
    if (hit) out.push(hit)
  }
  return out.slice(0, MAX_PROMO_PRODUCTS)
}

/**
 * Promoções criadas antes de existirem as escolhas por clique: deduz o `alvo` (e o produto) do endereço
 * guardado, para o painel as mostrar já escolhidas. Não altera o que o site mostra.
 */
export function normalizePromo(p: Promo): Promo {
  if (p.alvo) return p
  const d = p.destino || '/produtos'
  const prod = d.match(/^\/produtos\/([^/?#]+)$/)
  let alvo: PromoTarget = 'link'
  if (prod) alvo = 'produto'
  else if (d === '/produtos' || d === '/') alvo = 'catalogo'
  else if (d === '/contacto') alvo = 'cotacao'
  else if (d.startsWith('/servicos')) alvo = 'simuladores'
  return { ...p, alvo, produtos: p.produtos?.length ? p.produtos : prod ? [prod[1]] : [] }
}

/** Data de fim "daqui a N dias" (formato AAAA-MM-DD, hora local). */
export function endInDays(days: number, from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
