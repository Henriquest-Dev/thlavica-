import type { CategoryId } from './products'

export interface Segment {
  id: string
  titulo: string
  resumo: string
  detalhe: string[]
  categorias: CategoryId[]
  cta: { to: string; label: string }
  tone: 'sun' | 'cyan' | 'green' | 'navy' | 'orange' | 'slate'
}

/** Percursos de cliente. Textos editáveis; não incluem promessas de poupança ou garantia. */
export const SEGMENTS: Segment[] = [
  {
    id: 'residencial',
    titulo: 'Casas e famílias',
    resumo: 'Energia solar, água quente e pressão de água para o dia a dia em casa.',
    detalhe: [
      'Painéis, inversor e, se desejar, baterias para usar energia depois do pôr do sol.',
      'Termoacumuladores solares para água quente.',
      'Bombas pressurizadoras para chuveiros e torneiras.',
    ],
    categorias: ['paineis', 'inversores', 'baterias', 'termoacumuladores', 'bombas-pressurizadoras'],
    cta: { to: '/contacto?tipo=cotacao&uso=residencial', label: 'Pedir cotação' },
    tone: 'sun',
  },
  {
    id: 'empresas',
    titulo: 'Empresas',
    resumo: 'Equipamentos para lojas, escritórios, alojamentos e instalações de serviço.',
    detalhe: [
      'Sistemas fotovoltaicos dimensionados para o consumo do negócio.',
      'Abastecimento e pressurização de água.',
      'Iluminação solar exterior.',
    ],
    categorias: ['paineis', 'inversores', 'baterias', 'bombas-pressurizadoras', 'acessorios'],
    cta: { to: '/contacto?tipo=cotacao&uso=empresas', label: 'Pedir cotação' },
    tone: 'navy',
  },
  {
    id: 'agricola',
    titulo: 'Agricultura e machambas',
    resumo: 'Bombagem solar e bombas submersíveis para rega e abeberamento.',
    detalhe: [
      'Bombas solares com controlador, alimentadas por painéis.',
      'Bombas submersíveis de 3" e 4" para furos.',
      'Indique a profundidade do furo e o caudal necessário para uma proposta adequada.',
    ],
    categorias: ['bombagem-solar', 'bombas-submersiveis', 'paineis'],
    cta: { to: '/contacto?tipo=cotacao&uso=agricola', label: 'Pedir cotação' },
    tone: 'green',
  },
  {
    id: 'abastecimento',
    titulo: 'Abastecimento de água',
    resumo: 'Do furo ao depósito e à torneira, para casas, comunidades e instituições.',
    detalhe: [
      'Bombas submersíveis e solares para extração.',
      'Bombas pressurizadoras para distribuição.',
      'Bombas de drenagem para zonas alagadas.',
    ],
    categorias: ['bombas-submersiveis', 'bombagem-solar', 'bombas-pressurizadoras'],
    cta: { to: '/contacto?tipo=cotacao&uso=abastecimento', label: 'Pedir cotação' },
    tone: 'cyan',
  },
  {
    id: 'grosso',
    titulo: 'Compra a grosso',
    resumo: 'Para revendedores e projetos com volume ou compras regulares.',
    detalhe: [
      'Indique empresa, NUIT (opcional), volume, periodicidade e destino.',
      'Proposta comercial conforme quantidades e disponibilidade.',
    ],
    categorias: [],
    cta: { to: '/contacto?tipo=grosso', label: 'Pedido a grosso' },
    tone: 'orange',
  },
  {
    id: 'fornecedores',
    titulo: 'Fornecedores',
    resumo: 'Fabricantes e distribuidores que queiram apresentar produtos.',
    detalhe: ['Envie as marcas, gamas de produto e contactos comerciais.'],
    categorias: [],
    cta: { to: '/contacto?tipo=fornecedor', label: 'Apresentar produtos' },
    tone: 'slate',
  },
]
