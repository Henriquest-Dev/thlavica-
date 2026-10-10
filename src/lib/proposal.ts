import type { Proposal, ProposalLine, QuoteRequest } from '../data/admin'
import { activeDiscount } from './pricing'
import { uid } from './store'

/** Cotações preparadas no painel: numeração, totais e texto para enviar ao cliente. */

export const money = (n: number) => `${n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MZN`

export const DEFAULT_IVA = 16

/** Valores de uma linha: bruto, desconto, total sem IVA e total com IVA. */
export function lineAmounts(l: Pick<ProposalLine, 'qtd' | 'preco' | 'desconto'>, iva: number = DEFAULT_IVA) {
  const bruto = l.qtd * l.preco
  const desconto = bruto * (Math.min(100, Math.max(0, l.desconto ?? 0)) / 100)
  const semIva = bruto - desconto
  return { bruto, desconto, semIva, comIva: semIva * (1 + iva / 100) }
}

export function proposalTotals(p: Pick<Proposal, 'linhas' | 'iva'>) {
  const iva = p.iva ?? DEFAULT_IVA
  const parts = p.linhas.map((l) => lineAmounts(l, iva))
  const bruto = parts.reduce((n, x) => n + x.bruto, 0)
  const desconto = parts.reduce((n, x) => n + x.desconto, 0)
  const subtotal = bruto - desconto // total sem IVA, já com os descontos
  const tax = subtotal * (iva / 100)
  return { bruto, desconto, subtotal, tax, total: subtotal + tax }
}

/** COT-AAAA-NNN, a seguir ao maior número já usado nesse ano (não repete depois de apagar). */
export function nextNumber(existing: Pick<Proposal, 'numero'>[], year = new Date().getFullYear()): string {
  const re = new RegExp(`^COT-${year}-(\\d+)$`)
  const last = existing.reduce((m, p) => Math.max(m, Number(re.exec(p.numero)?.[1] ?? 0)), 0)
  return `COT-${year}-${String(last + 1).padStart(3, '0')}`
}

interface CatalogRef {
  id: string
  name: string
  brand?: string
  price?: number
  discount?: number
  discountUntil?: string
}

const label = (p: CatalogRef) => p.name + (p.brand ? ` (${p.brand})` : '')

export function newProposal(existing: Pick<Proposal, 'numero'>[], catalog: CatalogRef[], request?: QuoteRequest): Proposal {
  const linhas: ProposalLine[] = (request?.itens ?? []).map((i) => {
    const prod = catalog.find((c) => c.id === i.produtoId)
    // o preço e o desconto que o cliente viu no site passam para a cotação (a empresa ajusta, se precisar)
    const preco = i.preco ?? prod?.price ?? 0
    const desconto = i.desconto ?? (prod ? activeDiscount(prod) : 0)
    return { id: uid(), produtoId: i.produtoId, descricao: prod ? label(prod) : i.nome, qtd: i.qtd, preco, ...(desconto ? { desconto } : {}) }
  })
  return {
    id: uid(),
    numero: nextNumber(existing),
    pedidoId: request?.id,
    criadaEm: new Date().toISOString(),
    cliente: { nome: request?.nome ?? '', telefone: request?.telefone ?? '', local: request?.local ?? '' },
    linhas: linhas.length ? linhas : [{ id: uid(), descricao: '', qtd: 1, preco: 0 }],
    iva: DEFAULT_IVA,
    validadeDias: 15,
    notas: '',
    estado: 'rascunho',
  }
}

export function lineFromProduct(p: CatalogRef): ProposalLine {
  const desconto = activeDiscount(p)
  return { id: uid(), produtoId: p.id, descricao: label(p), qtd: 1, preco: p.price ?? 0, ...(desconto ? { desconto } : {}) }
}

export function proposalMessage(p: Proposal): string {
  const { subtotal, tax, total } = proposalTotals(p)
  return [
    `Proposta ${p.numero} — Tlhavika`,
    `Cliente: ${p.cliente.nome}${p.cliente.local ? ` (${p.cliente.local})` : ''}`,
    '',
    ...p.linhas.map((l) => `• ${l.qtd} × ${l.descricao}: ${money(l.qtd * l.preco)}`),
    '',
    `Subtotal: ${money(subtotal)}`,
    (p.iva ?? DEFAULT_IVA) ? `IVA (${p.iva ?? DEFAULT_IVA}%): ${money(tax)}` : '',
    `Total: ${money(total)}`,
    `Validade: ${p.validadeDias} dias.`,
    p.notas ? `\n${p.notas}` : '',
  ]
    .filter((x) => x !== '')
    .join('\n')
}
