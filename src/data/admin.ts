import type { BankAccount } from './site'
import type { Product } from './products'

export type QuoteStatus = 'nova' | 'em-preparacao' | 'enviada' | 'fechada'

export interface QuoteRequest {
  id: string
  criadoEm: string
  nome: string
  telefone: string
  local: string
  uso: string
  interesse?: string
  mensagem?: string
  /** Produtos da lista de cotação, com quantidade. */
  /** Preço (sem desconto) e desconto em vigor no site quando o cliente fez o pedido. */
  itens?: { produtoId: string; nome: string; qtd: number; preco?: number; desconto?: number; opcoes?: string; unidade?: 'm' }[]
  origem: 'formulario' | 'simulador' | 'lista'
  estado: QuoteStatus
  arquivada?: boolean
}

export interface ProposalLine {
  id: string
  produtoId?: string
  descricao: string
  qtd: number
  preco: number
  /** Desconto da linha em percentagem (0–100). */
  desconto?: number
  /** "m" = a quantidade são metros e o preço é por metro. */
  unidade?: 'm'
}

export interface Proposal {
  id: string
  numero: string
  pedidoId?: string
  criadaEm: string
  cliente: { nome: string; telefone: string; local: string; nuit?: string }
  /** Quem fez a cotação (aparece no PDF). */
  vendedor?: string
  linhas: ProposalLine[]
  /** IVA em percentagem (0 = sem IVA). */
  iva: number
  validadeDias: number
  /** Termo de pagamento (aparece em "Termos da proposta"), por exemplo "Pagamento na entrega". */
  termoPagamento?: string
  /** Prazo de entrega em dias (vazio = não aparece). */
  prazoEntrega?: number
  notas: string
  estado: 'rascunho' | 'enviada'
  /** Contas bancárias desta cotação (vazio = usa as contas guardadas em Contactos). */
  bancos?: BankAccount[]
}

export type PromoFormat = 'faixa' | 'destaque' | 'popup'

/** Aspeto da promoção: cores escolhidas por clique no painel. */
export type PromoStyle = 'azul' | 'ambar' | 'claro'

/** Para onde leva o botão da promoção. */
export type PromoTarget = 'produto' | 'catalogo' | 'cotacao' | 'simuladores' | 'link'

export interface Promo {
  id: string
  formato: PromoFormat
  titulo: string
  texto: string
  selo?: string
  cta: string
  /** Rota interna ou endereço completo (promoções antigas e destino "outro endereço"). */
  destino: string
  /** Produtos a que a promoção se aplica (até 4); aparecem na faixa, no banner e no pop-up. */
  produtos?: string[]
  /** Para onde leva o botão. Sem isto (promoções antigas), usa-se `destino`. */
  alvo?: PromoTarget
  /** Cores. Sem isto, cada formato tem a sua por omissão. */
  estilo?: PromoStyle
  imagem?: string
  inicio?: string
  fim?: string
  ativo: boolean
}

export type MediaKind = 'imagem' | 'youtube' | 'video'

export interface MediaItem {
  id: string
  tipo: MediaKind
  /** Imagem (endereço ou data URL), ID/endereço do YouTube ou ficheiro de vídeo. */
  url: string
  titulo: string
  legenda?: string
  ativo: boolean
  /** Onde aparece: 'inicio' (secção na página inicial), 'topo' (por baixo do cartaz), 'produtos' (lista de produtos), 'produto:<id>'. Vazio = 'inicio'. */
  locais?: string[]
}

export type CatalogOverride = Partial<Omit<Product, 'id'>> & { hidden?: boolean }

export type CustomProduct = Product & { custom: true; imgData?: string; hidden?: boolean }

export const STATUS_LABEL: Record<QuoteStatus, string> = {
  nova: 'Nova',
  'em-preparacao': 'Em preparação',
  enviada: 'Proposta enviada',
  fechada: 'Fechada',
}

export const FORMAT_LABEL: Record<PromoFormat, string> = {
  faixa: 'Faixa no topo',
  destaque: 'Banner na página inicial',
  popup: 'Pop-up',
}

/** Sem exemplos: o carrossel do painel começa vazio e a empresa acrescenta as suas fotografias e vídeos. */
export const DEFAULT_MEDIA: MediaItem[] = []
