import { describe, expect, it } from 'vitest'
import type { QuoteRequest } from '../data/admin'
import { DEFAULT_IVA, newProposal, nextNumber, proposalMessage, proposalTotals } from './proposal'

describe('nextNumber', () => {
  it('começa em 001 e segue o maior número do ano', () => {
    expect(nextNumber([], 2026)).toBe('COT-2026-001')
    expect(nextNumber([{ numero: 'COT-2026-001' }, { numero: 'COT-2026-004' }], 2026)).toBe('COT-2026-005')
  })

  it('não repete números depois de apagar uma cotação', () => {
    expect(nextNumber([{ numero: 'COT-2026-003' }], 2026)).toBe('COT-2026-004')
  })

  it('ignora outros anos', () => {
    expect(nextNumber([{ numero: 'COT-2025-009' }], 2026)).toBe('COT-2026-001')
  })
})

describe('proposalTotals', () => {
  const linhas = [
    { id: '1', descricao: 'A', qtd: 2, preco: 1000 },
    { id: '2', descricao: 'B', qtd: 1, preco: 500 },
  ]
  it('soma linhas e aplica o IVA', () => {
    expect(proposalTotals({ linhas, iva: 16 })).toEqual({ subtotal: 2500, tax: 400, total: 2900 })
  })
  it('IVA 0 não acrescenta nada', () => {
    expect(proposalTotals({ linhas, iva: 0 }).total).toBe(2500)
  })
})

describe('newProposal', () => {
  const request: QuoteRequest = {
    id: 'r1',
    criadoEm: '2026-01-01T00:00:00Z',
    nome: 'Maria',
    telefone: '84 123 4567',
    local: 'Matola',
    uso: 'Casa',
    itens: [{ produtoId: 'p1', nome: 'Painel antigo', qtd: 2 }],
    origem: 'lista',
    estado: 'nova',
  }

  it('traz o cliente e as linhas do pedido, com o nome atual do catálogo', () => {
    const p = newProposal([], [{ id: 'p1', name: 'Painel 625 W', brand: 'Astronergy' }], request)
    expect(p.pedidoId).toBe('r1')
    expect(p.cliente).toEqual({ nome: 'Maria', telefone: '84 123 4567', local: 'Matola' })
    expect(p.linhas).toMatchObject([{ produtoId: 'p1', descricao: 'Painel 625 W (Astronergy)', qtd: 2, preco: 0 }])
    expect(p.iva).toBe(DEFAULT_IVA)
  })

  it('sem pedido começa com uma linha livre', () => {
    expect(newProposal([], []).linhas).toHaveLength(1)
  })
})

describe('proposalMessage', () => {
  it('inclui totais e validade', () => {
    const p = newProposal([], [])
    p.cliente.nome = 'Ana'
    p.linhas = [{ id: '1', descricao: 'Bomba', qtd: 1, preco: 1000 }]
    const msg = proposalMessage(p)
    expect(msg).toContain('Cliente: Ana')
    expect(msg).toContain('1 × Bomba')
    expect(msg).toContain('IVA (16%)')
    expect(msg).toContain('Validade: 15 dias.')
  })
})
