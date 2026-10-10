import type { jsPDF } from 'jspdf'
import type { Proposal } from '../data/admin'
import type { CompanyInfo, Contact } from '../data/site'
import { asset } from './asset'
import { DEFAULT_IVA, lineAmounts, proposalTotals } from './proposal'

/**
 * Cotação em PDF, no desenho do modelo da empresa (A4): logótipo e título no topo, dados da cotação à direita,
 * blocos DE / PARA, tabela de linhas, notas em baixo à esquerda, totais à direita e o valor a pagar em destaque.
 *
 * Interface: `downloadProposalPdf(proposal, company)` no painel, ou `buildProposalPdf` (devolve o documento).
 * Tudo se preenche sozinho a partir da cotação (nome do cliente, linhas, IVA, validade) e dos dados da empresa
 * em Contactos. O que estiver vazio (NUIT, dados de pagamento, vendedor…) simplesmente não aparece.
 */

export type PdfCompany = Pick<Contact, 'address' | 'phone' | 'email'> & CompanyInfo

export const COMPANY_NAME = 'TLHAVIKA, LDA'

/* medidas em pontos (A4 = 595 × 842), tiradas do modelo */
const L = 24
const R = 571
const COL = { qtd: 235, preco: 251, desc: 320, iva: 359, semIva: 479, comIva: 571 }
const TABLE = { head: 326, firstRow: 340, limit: 590 }
const FOOT = 603

const GREY = [138, 138, 138] as const
const INK = [34, 34, 34] as const
const SOFT = [224, 224, 224] as const

/** Texto seguro para as letras padrão do PDF (Latin-1): troca o que elas não têm. */
export function pdfText(s: string | undefined): string {
  return (s ?? '')
    .normalize('NFC')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[   ]/g, ' ')
    .replace(/[^\n -~¡-ÿ€]/gu, '?')
}

/** 12 345,60 MZN (espaço a separar milhares: as letras do PDF não têm o espaço fino do pt-PT). */
export function pdfMoney(n: number): string {
  const [i, d] = (Math.round(n * 100) / 100).toFixed(2).split('.')
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')},${d} MZN`
}

export const pdfDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

export function validUntil(p: Pick<Proposal, 'criadaEm' | 'validadeDias'>): Date {
  const d = new Date(p.criadaEm)
  d.setDate(d.getDate() + (p.validadeDias || 0))
  return d
}

/** Cotacao-COT-2026-001-Maria-Silva.pdf */
export function proposalFileName(p: Pick<Proposal, 'numero' | 'cliente'>): string {
  const slug = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  return ['Cotacao', slug(p.numero), slug(p.cliente.nome)].filter(Boolean).join('-') + '.pdf'
}

export interface PdfOptions {
  company: PdfCompany
  /** Logótipo em PNG (data URL). Sem ele, escreve-se o nome da empresa. */
  logo?: string
}

const LOGO_RATIO = 1632 / 400

export async function buildProposalPdf(p: Proposal, { company, logo }: PdfOptions): Promise<jsPDF> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  doc.setProperties({ title: `Cotação ${p.numero}`, subject: `Cotação para ${pdfText(p.cliente.nome)}`, author: COMPANY_NAME })

  const iva = p.iva ?? DEFAULT_IVA
  const t = proposalTotals(p)
  const empresa = pdfText(company.empresa?.trim() || COMPANY_NAME)

  const font = (style: 'normal' | 'bold' | 'italic', size: number, color: readonly [number, number, number] = INK) => {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    doc.setTextColor(color[0], color[1], color[2])
  }
  const text = (s: string, x: number, y: number, align: 'left' | 'right' = 'left') => doc.text(pdfText(s), x, y, { align })
  const wrap = (s: string, w: number) => doc.splitTextToSize(pdfText(s), w) as string[]
  const rule = (y: number, width = 1) => {
    doc.setDrawColor(SOFT[0], SOFT[1], SOFT[2])
    doc.setLineWidth(width)
    doc.line(L, y, R, y)
  }

  /* ---------------------------------------------------------------- tabela: medir e partir em páginas */
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  const rows = p.linhas.map((l) => {
    const lines = wrap(l.descricao || '-', 190)
    return { l, lines, h: Math.max(lines.length, 1) * 9.6 + 16, a: lineAmounts(l, iva) }
  })
  const pages: (typeof rows)[] = [[]]
  let y = TABLE.firstRow
  for (const r of rows) {
    if (y + r.h > TABLE.limit && pages[pages.length - 1].length) {
      pages.push([])
      y = 102
    }
    pages[pages.length - 1].push(r)
    y += r.h
  }
  const footerOnNewPage = y > TABLE.limit
  const totalPages = pages.length + (footerOnNewPage ? 1 : 0)

  /* ---------------------------------------------------------------- cada página */
  pages.forEach((chunk, pi) => {
    if (pi > 0) doc.addPage()
    const first = pi === 0

    // cabeçalho
    font('bold', 18)
    text('COTAÇÃO', R, 38, 'right')
    if (first) {
      if (logo) doc.addImage(logo, 'PNG', 26, 52, 31 * LOGO_RATIO, 31)
      else {
        font('bold', 20)
        text(empresa, L, 78)
      }
    }
    if (first) {
      const meta: [string, string, boolean][] = [
        ['NÚMERO:', p.numero, true],
        ['DATA:', pdfDate(new Date(p.criadaEm)), true],
        ['VÁLIDA ATÉ:', pdfDate(validUntil(p)), false],
      ]
      if (p.vendedor?.trim()) meta.push(['VENDEDOR:', p.vendedor.trim().toUpperCase(), false])
      meta.push(['PÁGINA:', `${pi + 1}/${totalPages}`, false])
      let my = 60.5
      for (const [k, v, bold] of meta) {
        font('normal', 8, GREY)
        text(k, 409, my)
        font(bold ? 'bold' : 'normal', 8, bold ? INK : GREY)
        text(v, R, my, 'right')
        my += 12
      }
    } else {
      // páginas seguintes: só o número e a página, numa linha
      font('normal', 8, GREY)
      text(`${p.numero}  ·  ${pdfText(p.cliente.nome)}  ·  Página ${pi + 1}/${totalPages}`, R, 54, 'right')
    }

    if (first) {
      // DE / PARA
      font('bold', 8, GREY)
      text('DE', L, 185)
      text('PARA', 310, 185)
      font('bold', 12)
      text(empresa, L, 201)
      text(p.cliente.nome || 'Cliente', 310, 201)

      font('bold', 8)
      if (company.nuit?.trim()) {
        text('NUIT:', L, 217)
        font('normal', 8, GREY)
        text(company.nuit.trim(), L + 28, 217)
      }
      font('bold', 8)
      text('MORADA:', L, 231)
      font('normal', 8, GREY)
      let ay = 243
      for (const line of wrap(company.address, 250)) {
        text(line, L, ay)
        ay += 11
      }
      for (const extra of [company.phone && `Tel.: ${company.phone}`, company.email && `Email: ${company.email}`]) {
        if (extra) {
          text(extra, L, ay)
          ay += 11
        }
      }

      if (p.cliente.nuit?.trim()) {
        font('bold', 8)
        text('NUIT DO CLIENTE:', 310, 217)
        font('normal', 8, GREY)
        text(p.cliente.nuit.trim(), 310 + 76, 217)
      }
      font('bold', 8)
      text('TELEFONE:', 310, 231)
      text('LOCAL:', 444, 231)
      font('normal', 8, GREY)
      text(p.cliente.telefone || '-', 310, 243)
      let cy = 243
      for (const line of wrap(p.cliente.local || '-', 120)) {
        text(line, 444, cy)
        cy += 11
      }
    }

    // tabela
    const headY = first ? TABLE.head : 90
    rule(headY - 12, 1.2)
    font('italic', 8, GREY)
    text('Descrição', L, headY)
    text('Qtd.', COL.qtd, headY, 'right')
    text('Preço s/ IVA', COL.preco, headY)
    text('Desc. %', COL.desc, headY)
    text('IVA %', COL.iva, headY)
    text('Total s/ IVA', COL.semIva, headY, 'right')
    text('Total c/ IVA', COL.comIva, headY, 'right')
    rule(headY + 8, 1.2)

    let ry = first ? TABLE.firstRow : 102
    for (const r of chunk) {
      const base = ry + 10
      font('italic', 8)
      r.lines.forEach((line, i) => text(line, L, base + i * 9.6))
      font('bold', 8)
      text(String(r.l.qtd), COL.qtd - 2, base, 'right')
      font('normal', 8)
      text(pdfMoney(r.l.preco), COL.preco, base)
      text(`${(r.l.desconto ?? 0).toFixed(2).replace('.', ',')}%`, COL.desc, base)
      text(`${iva.toFixed(2).replace('.', ',')}%`, COL.iva, base)
      text(pdfMoney(r.a.semIva), COL.semIva, base, 'right')
      font('bold', 8)
      text(pdfMoney(r.a.comIva), COL.comIva, base, 'right')
      ry += r.h
      rule(ry - 2, 0.8)
    }
  })

  /* ---------------------------------------------------------------- rodapé (última página) */
  if (footerOnNewPage) doc.addPage()
  const noteLines: string[] = []
  const add = (s?: string) => {
    if (s?.trim()) {
      if (noteLines.length) noteLines.push('')
      noteLines.push(...wrap(s.trim(), 270))
    }
  }
  add(p.notas)
  add(company.pagamento)
  add(company.condicoes)

  rule(FOOT, 1.6)
  font('normal', 7.6)
  noteLines.slice(0, 22).forEach((line, i) => text(line, L, FOOT + 16 + i * 9.4))

  const total = (label: string, value: string, yy: number) => {
    font('normal', 8)
    text(label, 420, yy)
    font('bold', 8)
    text(value, R, yy, 'right')
  }
  total('Desconto total:', pdfMoney(t.desconto), FOOT + 18)
  total('Total sem IVA:', pdfMoney(t.subtotal), FOOT + 30)
  total(`IVA (${iva.toFixed(0)}%):`, pdfMoney(t.tax), FOOT + 42)
  total('Subtotal:', pdfMoney(t.total), FOOT + 54)
  total('Total geral:', pdfMoney(t.total), FOOT + 90)

  font('bold', 7.5, GREY)
  text('VALOR A PAGAR', R, 793, 'right')
  font('bold', 15)
  text(pdfMoney(t.total), R, 813, 'right')

  return doc
}

/** Lê o logótipo da Tlhavika (PNG do site) como data URL; sem ele o PDF usa o nome da empresa. */
export async function loadLogo(): Promise<string | undefined> {
  try {
    const r = await fetch(asset('img/logo-cotacao.png'))
    if (!r.ok) return undefined
    const blob = await r.blob()
    return await new Promise<string>((ok, fail) => {
      const f = new FileReader()
      f.onload = () => ok(String(f.result))
      f.onerror = () => fail(f.error)
      f.readAsDataURL(blob)
    })
  } catch {
    return undefined
  }
}

/** Gera e descarrega o PDF desta cotação. */
export async function downloadProposalPdf(p: Proposal, company: PdfCompany): Promise<void> {
  const doc = await buildProposalPdf(p, { company, logo: await loadLogo() })
  doc.save(proposalFileName(p))
}
