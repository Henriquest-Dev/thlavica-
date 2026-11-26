import type { Product } from '../data/products'
import { finalPrice } from './pricing'

/**
 * Kits (combos): um produto que junta vários produtos do catálogo, cada um com a sua quantidade.
 * O kit tem o seu próprio preço; o site mostra o que inclui e quanto se poupa face a comprar em separado.
 */

export type KitItem = { id: string; qtd: number }

export const MAX_KIT_ITEMS = 12

/** Aceita só componentes bem formados (os dados vêm do servidor): sem repetidos, sem o próprio kit, quantidades 1–999. */
export function cleanKit(list: unknown, selfId?: string): KitItem[] {
  if (!Array.isArray(list)) return []
  const out: KitItem[] = []
  for (const x of list) {
    const id = typeof x?.id === 'string' ? x.id.slice(0, 80) : ''
    const qtd = Math.max(1, Math.min(999, Math.round(Number(x?.qtd)) || 1))
    if (id && id !== selfId && !out.some((o) => o.id === id)) out.push({ id, qtd })
  }
  return out.slice(0, MAX_KIT_ITEMS)
}

type Ref = Pick<Product, 'id' | 'name' | 'price' | 'discount' | 'discountUntil'> & { kit?: KitItem[] }

/** Componentes do kit que ainda existem no catálogo, com o produto. */
export function kitLines<T extends Ref>(kit: KitItem[] | undefined, catalog: T[]): { item: KitItem; p: T }[] {
  return (kit ?? []).map((item) => ({ item, p: catalog.find((c) => c.id === item.id) })).filter((r): r is { item: KitItem; p: T } => Boolean(r.p))
}

/** Soma dos componentes ao preço atual (undefined se algum não tiver preço). */
export function kitSeparateTotal<T extends Ref>(kit: KitItem[] | undefined, catalog: T[]): number | undefined {
  const lines = kitLines(kit, catalog)
  if (!lines.length) return undefined
  let sum = 0
  for (const { item, p } of lines) {
    const v = finalPrice(p)
    if (v === undefined) return undefined
    sum += v * item.qtd
  }
  return Math.round(sum * 100) / 100
}

/** "1× Bomba solar 2200 W, 6× Painel 625 W" (para o pedido, a cotação e o email). */
export function kitContents<T extends Ref>(kit: KitItem[] | undefined, catalog: T[]): string {
  return kitLines(kit, catalog)
    .map(({ item, p }) => `${item.qtd}× ${p.name}`)
    .join(', ')
}
