import { useMemo } from 'react'
import { useStored } from './store'
import type { Promo, PromoFormat, MediaItem } from '../data/admin'
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
