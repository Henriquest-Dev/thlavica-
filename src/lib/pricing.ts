import { money } from './proposal'

/**
 * Preço e desconto de um produto. Ambos são opcionais: sem preço, o site mostra "confirmado na cotação".
 * O desconto pode ter data de fim; depois dela deixa de contar sozinho.
 */
export interface Priced {
  price?: number
  /** Desconto em percentagem (1–90). */
  discount?: number
  /** Último dia do desconto (AAAA-MM-DD). Vazio = sem data de fim. */
  discountUntil?: string
}

/** Percentagem de desconto em vigor (0 se não houver ou se já terminou). */
export function activeDiscount(p: Priced, now = Date.now()): number {
  const d = Math.round(p.discount ?? 0)
  if (d < 1) return 0
  if (p.discountUntil && now > new Date(p.discountUntil + 'T23:59:59').getTime()) return 0
  return Math.min(d, 90)
}

/** Preço a pagar, já com o desconto em vigor (undefined se o produto não tem preço). */
export function finalPrice(p: Priced, now = Date.now()): number | undefined {
  if (!p.price || p.price <= 0) return undefined
  return Math.round(p.price * (1 - activeDiscount(p, now) / 100) * 100) / 100
}

/** 15 500 MZN, sem decimais quando o valor é inteiro. */
export function priceLabel(n: number): string {
  return Number.isInteger(n) ? money(n).replace(',00 ', ' ') : money(n)
}

/** "até 25/10/2026" ou '' (sem data de fim). */
export function untilLabel(p: Priced): string {
  return p.discountUntil && activeDiscount(p) ? `até ${new Date(p.discountUntil + 'T12:00:00').toLocaleDateString('pt-PT')}` : ''
}
