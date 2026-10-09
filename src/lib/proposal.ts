import type { Proposal, ProposalLine, QuoteRequest } from '../data/admin'
import { uid } from './store'

/** Cotações preparadas no painel: numeração, totais e texto para enviar ao cliente. */

export const money = (n: number) => `${n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MZN`

export const DEFAULT_IVA = 16

export function proposalTotals(p: Pick<Proposal, 'linhas' | 'iva'>) {
  const subtotal = p.linhas.reduce((n, l) => n + l.qtd * l.preco, 0)
  const tax = subtotal * ((p.iva ?? DEFAULT_IVA) / 100)
  return { subtotal, tax, total: subtotal + tax }
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
}

const label = (p: CatalogRef) => p.name + (p.brand ? ` (${p.brand})` : '')

export function newProposal(existing: Pick<Proposal, 'numero'>[], catalog: CatalogRef[], request?: QuoteRequest): Proposal {
  const linhas: ProposalLine[] = (request?.itens ?? []).map((i) => {
    const prod = catalog.find((c) => c.id === i.produtoId)
    return { id: uid(), produtoId: i.produtoId, descricao: prod ? label(prod) : i.nome, qtd: i.qtd, preco: 0 }
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
  return { id: uid(), produtoId: p.id, descricao: label(p), qtd: 1, preco: 0 }
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
