import { useMemo } from 'react'
import { useStored } from './store'
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
