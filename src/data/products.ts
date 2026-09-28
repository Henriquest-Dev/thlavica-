/**
 * Catálogo editável da Tlhavika.
 *
 * Para acrescentar ou corrigir um produto, altere apenas este ficheiro.
 * Regras:
 *  - `validacao: 'por-validar'` = dados transcritos de anúncios públicos; o site
 *    mostra-os com o aviso "por validar" (ou esconde-os, conforme VITE_SHOW_UNVERIFIED_SPECS).
 *  - Nunca preencher especificações desconhecidas. Deixar o campo de fora.
 *  - Preços dos anúncios são históricos e NÃO são publicados.
 *  - As marcas pertencem aos respetivos fabricantes.
 */

export type CategoryId =
  | 'paineis'
  | 'inversores'
  | 'baterias'
  | 'bombas-pressurizadoras'
  | 'bombas-submersiveis'
  | 'bombagem-solar'
  | 'termoacumuladores'
  | 'acessorios'

export type ApplicationId = 'residencial' | 'empresas' | 'agricola' | 'abastecimento' | 'drenagem'

export interface Category {
  id: CategoryId
  nome: string
  resumo: string
}

export const categories: Category[] = [
  { id: 'paineis', nome: 'Painéis solares', resumo: 'Módulos fotovoltaicos para captar energia do sol.' },
  { id: 'inversores', nome: 'Inversores', resumo: 'Convertem e gerem a energia entre painéis, bateria e consumo.' },
  { id: 'baterias', nome: 'Baterias', resumo: 'Armazenamento para usar energia quando o sol não está disponível.' },
  { id: 'bombas-pressurizadoras', nome: 'Bombas pressurizadoras', resumo: 'Pressão estável para torneiras, chuveiros e rede doméstica.' },
  { id: 'bombas-submersiveis', nome: 'Bombas submersíveis', resumo: 'Extração de água de furos, poços e drenagem.' },
  { id: 'bombagem-solar', nome: 'Bombagem solar', resumo: 'Bombas alimentadas diretamente por painéis, com controlador.' },
  { id: 'termoacumuladores', nome: 'Termoacumuladores', resumo: 'Água quente com aquecimento solar.' },
  { id: 'acessorios', nome: 'Acessórios', resumo: 'Iluminação solar, motores e componentes complementares.' },
]

export const applications: { id: ApplicationId; nome: string }[] = [
  { id: 'residencial', nome: 'Residencial' },
  { id: 'empresas', nome: 'Empresas' },
  { id: 'agricola', nome: 'Agrícola / irrigação' },
  { id: 'abastecimento', nome: 'Abastecimento de água' },
  { id: 'drenagem', nome: 'Drenagem' },
]

export interface Spec {
  rotulo: string
  valor: string
}

export interface ProductImage {
  /** Nome base em /public/img/anuncios (sem sufixo -414.webp / -240.webp). */
  src: string
  alt: string
  /** true quando a imagem é um anúncio com texto sobreposto e não fotografia técnica. */
  anuncio: boolean
}

export interface Product {
  id: string
  categoria: CategoryId
  nome: string
  marca?: string
  modelo?: string
  resumo: string
  /** Potência nominal em watts, usada nos filtros. Só quando legível na fonte. */
  potenciaW?: number
  especificacoes: Spec[]
  aplicacoes: ApplicationId[]
  /** Itens incluídos — apenas quando comprovados. */
  incluidos?: string[]
  documentos?: { nome: string; url: string }[]
  imagens: ProductImage[]
  /** Recorte do produto sem fundo, em /public/img/recortes (preenchido abaixo). */
  recorte?: string
  fonte: { descricao: string; url: string }[]
  validacao: 'validado' | 'por-validar'
  disponibilidade?: 'em-stock' | 'sob-encomenda' | 'esgotado'
}

const fb = (n: string) =>
  `https://www.facebook.com/photo.php?fbid=${n}&set=pb.61560557742444.-2207520000&type=3`

const ad = (n: string, alt: string): ProductImage => ({ src: `facebook_${n}`, alt, anuncio: true })

export const products: Product[] = [
  {
    id: 'astronergy-astron7-625w',
    categoria: 'paineis',
    nome: 'Painel bifacial Astronergy ASTRON 7 2.0 — 625 W',
    marca: 'Astronergy',
    modelo: 'CHSM66RN(DG)/F-BH',
    resumo: 'Módulo fotovoltaico bifacial da série ASTRON 7 2.0.',
    potenciaW: 625,
    especificacoes: [
      { rotulo: 'Potência nominal', valor: '625 W' },
      { rotulo: 'Tecnologia', valor: 'Bifacial' },
      { rotulo: 'Série', valor: 'ASTRON 7 2.0' },
    ],
    aplicacoes: ['residencial', 'empresas', 'agricola'],
    imagens: [ad('01', 'Anúncio do painel Astronergy ASTRON 7 2.0 de 625 W')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122230149332351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'ja-solar-jam72s40-615w',
    categoria: 'paineis',
    nome: 'Painel JA Solar JAM72S40 MR — 615 W',
    marca: 'JA Solar',
    modelo: 'JAM72S40 MR',
    resumo: 'Módulo fotovoltaico monocristalino de alta potência.',
    potenciaW: 615,
    especificacoes: [{ rotulo: 'Potência nominal', valor: '615 W' }],
    aplicacoes: ['residencial', 'empresas', 'agricola'],
    imagens: [ad('24', 'Anúncio do painel JA Solar JAM72S40 MR de 615 W')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122211156308351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'hanchus-ess-3-5kw',
    categoria: 'inversores',
    nome: 'Sistema solar doméstico Hanchus ESS 3,5 kW',
    marca: 'Hanchus',
    modelo: 'ESS 3.5 kW',
    resumo: 'Conjunto de armazenamento e conversão para uso doméstico. Composição a confirmar.',
    potenciaW: 3500,
    especificacoes: [{ rotulo: 'Potência', valor: '3,5 kW' }],
    aplicacoes: ['residencial'],
    imagens: [ad('26', 'Anúncio do sistema solar doméstico Hanchus ESS 3,5 kW')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122208244394351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'dongyin-pkm60-dsk1',
    categoria: 'bombas-pressurizadoras',
    nome: 'Bomba pressurizadora Dongyin PKM60 + DSK1',
    marca: 'Dongyin',
    modelo: 'PKM60 + DSK1',
    resumo: 'Bomba de pressão periférica com controlador automático.',
    potenciaW: 370,
    especificacoes: [
      { rotulo: 'Potência', valor: '0,37 kW (0,5 HP)' },
      { rotulo: 'Alimentação', valor: 'AC 160–240 V' },
      { rotulo: 'Altura máxima', valor: '35 m' },
      { rotulo: 'Caudal máximo', valor: '35 L/min' },
    ],
    aplicacoes: ['residencial', 'abastecimento'],
    imagens: [ad('05', 'Anúncio da bomba pressurizadora Dongyin PKM60 com controlador DSK1')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122227152782351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'dongyin-pkm80-dsk1',
    categoria: 'bombas-pressurizadoras',
    nome: 'Bomba pressurizadora Dongyin PKM80 + DSK1',
    marca: 'Dongyin',
    modelo: 'PKM80 + DSK1',
    resumo: 'Bomba de pressão periférica com controlador automático.',
    potenciaW: 750,
    especificacoes: [
      { rotulo: 'Potência', valor: '0,75 kW (1 HP)' },
      { rotulo: 'Alimentação', valor: 'AC 160–240 V' },
      { rotulo: 'Altura máxima', valor: '70 m' },
      { rotulo: 'Caudal máximo', valor: '50 L/min' },
    ],
    aplicacoes: ['residencial', 'empresas', 'abastecimento'],
    imagens: [ad('06', 'Anúncio da bomba pressurizadora Dongyin PKM80 com controlador DSK1')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122227152770351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'dongyin-3sdm2-8',
    categoria: 'bombas-submersiveis',
    nome: 'Bomba submersível 3" Dongyin 3SDM2/8',
    marca: 'Dongyin',
    modelo: '3SDM2/8',
    resumo: 'Bomba submersível de 3 polegadas com control box.',
    potenciaW: 180,
    especificacoes: [
      { rotulo: 'Potência', valor: '0,18 kW (0,25 HP)' },
      { rotulo: 'Alimentação', valor: '220–240 V, 50 Hz' },
      { rotulo: 'Diâmetro', valor: '3"' },
      { rotulo: 'Altura (a 5 / 25 / 45 L/min)', valor: '34 / 29 / 14 m' },
    ],
    aplicacoes: ['residencial', 'abastecimento', 'agricola'],
    incluidos: ['Bomba', 'Control box', '30 m de cabo'],
    imagens: [ad('12', 'Anúncio da bomba submersível Dongyin 3SDM2/8')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122227149752351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'dongyin-3sdm2-11',
    categoria: 'bombas-submersiveis',
    nome: 'Bomba submersível 3" Dongyin 3SDM2/11',
    marca: 'Dongyin',
    modelo: '3SDM2/11',
    resumo: 'Bomba submersível de 3 polegadas com control box.',
    potenciaW: 250,
    especificacoes: [
      { rotulo: 'Potência', valor: '0,25 kW (0,33 HP)' },
      { rotulo: 'Alimentação', valor: '220–240 V, 50 Hz' },
      { rotulo: 'Diâmetro', valor: '3"' },
      { rotulo: 'Altura (a 5 / 25 / 45 L/min)', valor: '46 / 40 / 20 m' },
    ],
    aplicacoes: ['residencial', 'abastecimento', 'agricola'],
    incluidos: ['Bomba', 'Control box', '30 m de cabo'],
    imagens: [ad('11', 'Anúncio da bomba submersível Dongyin 3SDM2/11')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122227149866351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'dongyin-3sdm2-15',
    categoria: 'bombas-submersiveis',
    nome: 'Bomba submersível 3" Dongyin 3SDM2/15',
    marca: 'Dongyin',
    modelo: '3SDM2/15',
    resumo: 'Bomba submersível de 3 polegadas com control box.',
    potenciaW: 370,
    especificacoes: [
      { rotulo: 'Potência', valor: '0,37 kW (0,5 HP)' },
      { rotulo: 'Alimentação', valor: '220–240 V, 50 Hz' },
      { rotulo: 'Diâmetro', valor: '3"' },
      { rotulo: 'Altura (a 5 / 25 / 45 L/min)', valor: '63 / 54 / 27 m' },
    ],
    aplicacoes: ['residencial', 'abastecimento', 'agricola'],
    incluidos: ['Bomba', 'Control box', '30 m de cabo'],
    imagens: [ad('13', 'Anúncio da bomba submersível Dongyin 3SDM2/15')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122227149740351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'dongyin-3sdm3-16',
    categoria: 'bombas-submersiveis',
    nome: 'Bomba submersível 3" Dongyin 3SDM3/16',
    marca: 'Dongyin',
    modelo: '3SDM3/16',
    resumo: 'Bomba submersível de 3 polegadas com control box.',
    potenciaW: 550,
    especificacoes: [
      { rotulo: 'Potência', valor: '0,55 kW (0,75 HP)' },
      { rotulo: 'Alimentação', valor: '220–240 V, 50 Hz' },
      { rotulo: 'Diâmetro', valor: '3"' },
      { rotulo: 'Altura (a 10 / 40 / 65 L/min)', valor: '63 / 51 / 17 m' },
    ],
    aplicacoes: ['residencial', 'abastecimento', 'agricola'],
    incluidos: ['Bomba', 'Control box', '30 m de cabo'],
    imagens: [ad('14', 'Anúncio da bomba submersível Dongyin 3SDM3/16')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122227149728351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'dongyin-3sdm3-21',
    categoria: 'bombas-submersiveis',
    nome: 'Bomba submersível 3" Dongyin 3SDM3/21',
    marca: 'Dongyin',
    modelo: '3SDM3/21',
    resumo: 'Bomba submersível de 3 polegadas com control box.',
    potenciaW: 750,
    especificacoes: [
      { rotulo: 'Potência', valor: '0,75 kW (1 HP)' },
      { rotulo: 'Alimentação', valor: '220–240 V, 50 Hz' },
      { rotulo: 'Diâmetro', valor: '3"' },
      { rotulo: 'Altura (a 10 / 40 / 65 L/min)', valor: '82 / 67 / 23 m' },
    ],
    aplicacoes: ['residencial', 'abastecimento', 'agricola'],
    incluidos: ['Bomba', 'Control box', '30 m de cabo'],
    imagens: [ad('08', 'Anúncio da bomba submersível Dongyin 3SDM3/21')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122227151294351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'bomba-4sa-16-17-4kw',
    categoria: 'bombas-submersiveis',
    nome: 'Bomba submersível 4SA 16/17 — 4 kW',
    modelo: '4SA 16/17',
    resumo: 'Bomba submersível trifásica para furos de maior profundidade. Marca a confirmar.',
    potenciaW: 4000,
    especificacoes: [
      { rotulo: 'Potência', valor: '4 kW (5,5 HP)' },
      { rotulo: 'Alimentação', valor: 'AC 380 V' },
      { rotulo: 'Caudal (L/min)', valor: '50 / 200 / 350' },
      { rotulo: 'Altura (m)', valor: '102 / 75 / 37' },
      { rotulo: 'Saída', valor: '2"' },
    ],
    aplicacoes: ['agricola', 'abastecimento', 'empresas'],
    imagens: [ad('23', 'Anúncio da bomba submersível 4SA 16/17 de 4 kW')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122211405950351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'bomba-drenagem-0-75kw',
    categoria: 'bombas-submersiveis',
    nome: 'Bomba submersível de drenagem — 0,75 kW',
    resumo: 'Bomba para escoamento de água em zonas alagadas. Marca e modelo a confirmar.',
    potenciaW: 750,
    especificacoes: [
      { rotulo: 'Potência', valor: '0,75 kW' },
      { rotulo: 'Caudal máximo', valor: 'até 20 000 L/h' },
    ],
    aplicacoes: ['drenagem', 'residencial', 'empresas'],
    imagens: [
      ad('29', 'Anúncio da bomba de drenagem de 0,75 kW'),
      ad('31', 'Anúncio com comparação antes e depois da drenagem'),
    ],
    fonte: [
      { descricao: 'Anúncio Facebook Tlhavika', url: fb('122204337500351924') },
      { descricao: 'Anúncio Facebook Tlhavika', url: fb('122204211356351924') },
    ],
    validacao: 'por-validar',
  },
  {
    id: 'dongyin-3sds-800w-hibrida',
    categoria: 'bombagem-solar',
    nome: 'Bomba submersível solar híbrida 3" Dongyin — 800 W',
    marca: 'Dongyin',
    modelo: '3SDS 4.5-100-90-800AD',
    resumo: 'Bomba solar híbrida: funciona com painéis (DC) ou rede (AC), com control box.',
    potenciaW: 800,
    especificacoes: [
      { rotulo: 'Potência', valor: '800 W (1 HP)' },
      { rotulo: 'Alimentação', valor: 'DC 90–350 V / AC 220–240 V' },
      { rotulo: 'Diâmetro', valor: '3"' },
      { rotulo: 'Altura (a 20 / 40 / 60 L/min)', valor: '80 / 62 / 34 m' },
    ],
    aplicacoes: ['agricola', 'abastecimento', 'residencial'],
    incluidos: ['Bomba', 'Control box'],
    imagens: [ad('07', 'Anúncio da bomba submersível solar híbrida Dongyin de 800 W')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122227152266351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'dongyin-4sds-1500w',
    categoria: 'bombagem-solar',
    nome: 'Bomba submersível solar 4" Dongyin — 1500 W',
    marca: 'Dongyin',
    modelo: '4SDS 5-168-170',
    resumo: 'Bomba solar de 4 polegadas com control box.',
    potenciaW: 1500,
    especificacoes: [
      { rotulo: 'Potência', valor: '1500 W (2 HP)' },
      { rotulo: 'Diâmetro', valor: '4"' },
      { rotulo: 'Altura (a 20 / 40 / 60 L/min)', valor: '139 / 109 / 71 m' },
    ],
    aplicacoes: ['agricola', 'abastecimento'],
    incluidos: ['Bomba', 'Control box'],
    imagens: [ad('10', 'Anúncio da bomba submersível solar Dongyin de 1500 W')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122227150670351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'dongyin-4sds-2200w',
    categoria: 'bombagem-solar',
    nome: 'Bomba submersível solar 4" Dongyin — 2200 W',
    marca: 'Dongyin',
    modelo: '4SDS 5-235-240-2200',
    resumo: 'Bomba solar de 4 polegadas com control box, para furos profundos.',
    potenciaW: 2200,
    especificacoes: [
      { rotulo: 'Potência', valor: '2200 W (3 HP)' },
      { rotulo: 'Diâmetro', valor: '4"' },
      { rotulo: 'Altura (a 20 / 40 / 60 L/min)', valor: '194 / 152 / 99 m' },
    ],
    aplicacoes: ['agricola', 'abastecimento', 'empresas'],
    incluidos: ['Bomba', 'Control box'],
    imagens: [ad('09', 'Anúncio da bomba submersível solar Dongyin de 2200 W')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122227150688351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'termoacumulador-alta-pressao-100l',
    categoria: 'termoacumuladores',
    nome: 'Termoacumulador solar de alta pressão — 100 L',
    resumo: 'Aquecedor solar de água com tubos de vácuo e depósito de 100 litros.',
    especificacoes: [
      { rotulo: 'Capacidade', valor: '100 L' },
      { rotulo: 'Tipo', valor: 'Alta pressão' },
    ],
    aplicacoes: ['residencial'],
    imagens: [
      ad('02', 'Anúncio do termoacumulador de alta pressão de 100 L'),
      ad('15', 'Termoacumulador solar instalado numa cobertura'),
      ad('17', 'Termoacumulador solar com tubos de vácuo'),
    ],
    fonte: [
      { descricao: 'Anúncio Facebook Tlhavika', url: fb('122229651008351924') },
      { descricao: 'Publicação Facebook Tlhavika', url: fb('122226711956351924') },
    ],
    validacao: 'por-validar',
  },
  {
    id: 'termoacumulador-hibrido-200l',
    categoria: 'termoacumuladores',
    nome: 'Termoacumulador solar híbrido — 200 L',
    resumo: 'Aquecedor solar de água com apoio elétrico e depósito de 200 litros.',
    especificacoes: [
      { rotulo: 'Capacidade', valor: '200 L' },
      { rotulo: 'Tipo', valor: 'Híbrido, alta pressão' },
    ],
    aplicacoes: ['residencial', 'empresas'],
    imagens: [
      ad('18', 'Anúncio do termoacumulador solar híbrido'),
      ad('19', 'Anúncio do termoaquecedor solar híbrido de alta pressão'),
      ad('16', 'Termoacumulador solar instalado sobre telhado de telha'),
    ],
    fonte: [
      { descricao: 'Anúncio Facebook Tlhavika', url: fb('122224814648351924') },
      { descricao: 'Anúncio Facebook Tlhavika', url: fb('122222791778351924') },
    ],
    validacao: 'por-validar',
  },
  {
    id: 'candeeiro-solar-rua',
    categoria: 'acessorios',
    nome: 'Candeeiro solar de rua (300 W / 400 W)',
    resumo: 'Iluminação exterior autónoma com painel integrado e comando.',
    especificacoes: [{ rotulo: 'Versões anunciadas', valor: '300 W e 400 W' }],
    aplicacoes: ['residencial', 'empresas'],
    imagens: [ad('25', 'Anúncio do candeeiro solar de rua')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122208268898351924') }],
    validacao: 'por-validar',
  },
  {
    id: 'motores-para-bombas',
    categoria: 'acessorios',
    nome: 'Motores para bombas submersíveis',
    resumo: 'Motores de várias potências para bombas submersíveis. Lista de modelos a confirmar.',
    especificacoes: [],
    aplicacoes: ['agricola', 'abastecimento', 'empresas'],
    imagens: [ad('35', 'Anúncio com motores e bombas submersíveis')],
    fonte: [{ descricao: 'Anúncio Facebook Tlhavika', url: fb('122199851960351924') }],
    validacao: 'por-validar',
  },
]

/** Recortes limpos (sem fundo) feitos a partir dos anúncios, em /public/img/recortes. */
const RECORTES: Record<string, string> = {
  'astronergy-astron7-625w': 'painel-astronergy',
  'ja-solar-jam72s40-615w': 'painel-jasolar',
  'hanchus-ess-3-5kw': 'kit-hanchus',
  'dongyin-pkm60-dsk1': 'bomba-pkm60',
  'dongyin-pkm80-dsk1': 'bomba-pkm80',
  'dongyin-3sdm2-8': 'bomba-3sdm',
  'dongyin-3sdm2-11': 'bomba-3sdm',
  'dongyin-3sdm2-15': 'bomba-3sdm',
  'dongyin-3sdm3-16': 'bomba-3sdm',
  'dongyin-3sdm3-21': 'bomba-3sdm',
  'bomba-4sa-16-17-4kw': 'bomba-4sa',
  'bomba-drenagem-0-75kw': 'bomba-drenagem',
  'dongyin-3sds-800w-hibrida': 'bomba-3sds',
  'dongyin-4sds-1500w': 'bomba-4sds',
  'dongyin-4sds-2200w': 'bomba-4sds',
  'termoacumulador-alta-pressao-100l': 'termoacumulador',
  'termoacumulador-hibrido-200l': 'termoacumulador',
  'candeeiro-solar-rua': 'candeeiro-solar',
  'motores-para-bombas': 'motores',
}
for (const p of products) p.recorte = RECORTES[p.id]

export const categoryById = (id: string) => categories.find((c) => c.id === id)
export const productById = (id: string) => products.find((p) => p.id === id)
export const applicationName = (id: ApplicationId) => applications.find((a) => a.id === id)?.nome ?? id

export const brands = Array.from(new Set(products.map((p) => p.marca).filter(Boolean))) as string[]

export const powerRanges = [
  { id: 'ate-500', nome: 'Até 0,5 kW', min: 0, max: 500 },
  { id: '500-1000', nome: '0,5 – 1 kW', min: 501, max: 1000 },
  { id: '1000-3000', nome: '1 – 3 kW', min: 1001, max: 3000 },
  { id: 'mais-3000', nome: 'Mais de 3 kW', min: 3001, max: Infinity },
]

/** Projetos concluídos — preencher apenas com casos reais e autorizados. */
export interface CaseStudy {
  id: string
  titulo: string
  local: string
  aplicacao: ApplicationId
  descricao: string
  imagem?: string
}
export const caseStudies: CaseStudy[] = []
