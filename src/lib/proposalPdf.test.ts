import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { Proposal } from '../data/admin'
import { buildProposalPdf, pdfDate, pdfMoney, pdfText, proposalFileName, validUntil } from './proposalPdf'

const company = {
  empresa: 'TLHAVIKA, LDA',
  nuit: '400123456',
  address: 'Av. de Moçambique, km 9,2 — Bairro do Zimpeto, Maputo',
  phone: '+258 87 119 1481',
  email: 'Tlhavika.solar@gmail.com',
  pagamento: 'Transferência bancária\nBanco: Exemplo\nNIB: 0000 0000 0000 0000 0000 0',
  condicoes: 'Preços válidos pelo prazo indicado. Entrega a combinar.',
}

const base: Proposal = {
  id: 'p1',
  numero: 'COT-2026-001',
  criadaEm: '2026-10-11T10:00:00.000Z',
  cliente: { nome: 'Maria da Conceição Silva', telefone: '+258 84 123 4567', local: 'Matola, Maputo', nuit: '' },
  linhas: [
    { id: 'a', descricao: 'Bomba submersível 3" 3SDM2/11 (Dongyin)', qtd: 2, preco: 15500, desconto: 5 },
    { id: 'b', descricao: 'Painel bifacial ASTRON 7 2.0 (Astronergy), 625 W, com estrutura e cabos incluídos para instalação', qtd: 4, preco: 8200 },
  ],
  iva: 16,
  validadeDias: 15,
  notas: 'Instalação não incluída.',
  vendedor: 'Ana',
  estado: 'rascunho',
}

describe('ajudas do PDF', () => {
  it('formata dinheiro, datas e nomes de ficheiro', () => {
    expect(pdfMoney(10120)).toBe('10 120,00 MZN')
    expect(pdfMoney(1234567.891)).toBe('1 234 567,89 MZN')
    expect(pdfMoney(0)).toBe('0,00 MZN')
    expect(pdfDate(new Date(2026, 5, 11))).toBe('11/06/2026')
    expect(pdfDate(validUntil({ criadaEm: new Date(2026, 5, 11, 12).toISOString(), validadeDias: 7 }))).toBe('18/06/2026')
    expect(proposalFileName(base)).toBe('Cotacao-COT-2026-001-Maria-da-Conceicao-Silva.pdf')
    expect(proposalFileName({ numero: 'COT-2026-002', cliente: { nome: '', telefone: '', local: '' } })).toBe('Cotacao-COT-2026-002.pdf')
  })

  it('troca o que as letras do PDF não têm, mantendo acentos', () => {
    expect(pdfText('Instalação “completa” — 2 × painéis…')).toBe('Instalação "completa" - 2 × painéis...')
    expect(pdfText('ok 😀')).toBe('ok ?')
    expect(pdfText(undefined)).toBe('')
  })
})

describe('buildProposalPdf', () => {
  it('gera uma página A4 com o logótipo e guarda um exemplo para ver', async () => {
    const logo = `data:image/png;base64,${readFileSync('public/img/logo-cotacao.png').toString('base64')}`
    const doc = await buildProposalPdf(base, { company, logo })
    expect(doc.getNumberOfPages()).toBe(1)
    expect(doc.internal.pageSize.getWidth()).toBeCloseTo(595.28, 1)
    mkdirSync('node_modules/.cache', { recursive: true })
    writeFileSync('node_modules/.cache/cotacao-exemplo.pdf', Buffer.from(doc.output('arraybuffer')))
  })

  it('divide em várias páginas quando há muitas linhas, com o rodapé só no fim', async () => {
    const linhas = Array.from({ length: 30 }, (_, i) => ({ id: `l${i}`, descricao: `Produto número ${i + 1} com uma descrição razoavelmente comprida para ocupar espaço`, qtd: 1, preco: 1000 + i }))
    const doc = await buildProposalPdf({ ...base, linhas }, { company })
    expect(doc.getNumberOfPages()).toBeGreaterThan(1)
    writeFileSync('node_modules/.cache/cotacao-longa.pdf', Buffer.from(doc.output('arraybuffer')))
  })

  it('funciona sem logótipo, sem vendedor e sem dados opcionais da empresa', async () => {
    const doc = await buildProposalPdf({ ...base, vendedor: '', notas: '' }, { company: { address: 'Maputo', phone: '', email: '' } })
    expect(doc.getNumberOfPages()).toBe(1)
  })
})
