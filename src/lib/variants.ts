import type { Product } from '../data/products'

/**
 * Opções que o cliente escolhe (cor…) e venda ao metro.
 * Uma escolha é um objeto { Cor: 'Preto' }; na lista de cotação cada combinação é uma linha própria.
 */

export type Picks = Record<string, string>

export const MAX_OPTION_GROUPS = 3
export const MAX_OPTION_VALUES = 12

type Sellable = Pick<Product, 'options' | 'unit'>

export const hasOptions = (p: Sellable) => Boolean(p.options?.length)
/** Produtos que não se podem adicionar com um só toque: têm de escolher uma opção ou os metros. */
export const needsChoice = (p: Sellable) => hasOptions(p) || p.unit === 'm'

/** "Cor: Preto · Tamanho: 10 mm" (ordem estável, para comparar e mostrar). */
export function picksLabel(picks: Picks | undefined): string {
  return Object.entries(picks ?? {})
    .filter(([k, v]) => k && v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')
}

/** Chave de uma linha da lista: o produto e a combinação escolhida. */
export const lineKey = (id: string, picks?: Picks) => {
  const l = picksLabel(picks)
  return l ? `${id}|${l}` : id
}

/** Vendido ao metro? Serve para o produto (`unit`) e para as linhas do pedido e da cotação (`unidade`). */
export const isMeters = (x: { unit?: 'm' | ''; unidade?: 'm' }) => x.unit === 'm' || x.unidade === 'm'

/** Sufixo do preço: " / m" ao metro, nada por unidade. */
export const unitSuffix = (p: { unit?: 'm' | '' }) => (p.unit === 'm' ? ' / m' : '')

export function qtyLabel(qtd: number, metros: boolean): string {
  return metros ? `${qtd} m` : String(qtd)
}

/** Primeiro grupo de opções ainda por escolher (para dizer ao cliente o que falta). */
export function missingOption(p: Pick<Product, 'options'>, picks: Picks): string | undefined {
  return p.options?.find((g) => !picks[g.name])?.name
}

/** Limpa as opções que vêm do servidor ou do painel: texto curto, sem repetições, no máximo 3 grupos de 12 valores. */
export function cleanOptions(list: unknown): { name: string; values: string[] }[] {
  if (!Array.isArray(list)) return []
  const out: { name: string; values: string[] }[] = []
  for (const g of list) {
    const name = typeof g?.name === 'string' ? g.name.trim().slice(0, 30) : ''
    const raw: unknown[] = Array.isArray(g?.values) ? g.values : []
    const values = [...new Set(raw.filter((v): v is string => typeof v === 'string').map((v) => v.trim().slice(0, 40)).filter(Boolean))].slice(0, MAX_OPTION_VALUES)
    if (name && values.length && !out.some((o) => o.name === name)) out.push({ name, values })
  }
  return out.slice(0, MAX_OPTION_GROUPS)
}

/** Atalhos do painel: um clique cria o grupo com valores comuns. */
export const OPTION_PRESETS: { name: string; values: string[] }[] = [
  { name: 'Cor', values: ['Preto', 'Branco', 'Vermelho', 'Azul'] },
  { name: 'Tensão', values: ['220 V', '380 V'] },
  { name: 'Tamanho', values: [] },
]
