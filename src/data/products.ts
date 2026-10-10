/**
 * Catálogo — produtos apresentados nas publicações da Tlhavika no Facebook.
 * As especificações foram transcritas desses anúncios e são mostradas como
 * "dados do anúncio"; confirmar na cotação. Preços antigos não são publicados.
 * `img`: recorte do produto em /public/img/produtos (sem fundo), a partir do anúncio.
 */
import type { CategoryId } from './site'

export interface Product {
  id: string
  name: string
  brand?: string
  model?: string
  category: CategoryId
  summary: string
  img: string
  specs: { label: string; value: string }[]
  includes?: string[]
  /** Número da publicação de origem (source-assets/fontes.csv). */
  source: number
  featured?: boolean
  /** Preço em MZN (opcional). Sem preço, o site diz que é confirmado na cotação. */
  price?: number
  /** Desconto em percentagem (opcional) e último dia dele. */
  discount?: number
  discountUntil?: string
  /** Imagem ilustrativa (interpretação do anúncio), não fotografia do modelo. */
  illustrative?: boolean
}

export const products: Product[] = [
  {
    id: 'astronergy-astron7-625w',
    name: 'Painel bifacial ASTRON 7 2.0',
    brand: 'Astronergy',
    model: 'CHSM66RN(DG)/F-BH',
    category: 'paineis',
    summary: 'Módulo fotovoltaico bifacial de alta potência.',
    img: 'painel-astronergy',
    specs: [
      { label: 'Potência', value: '625 W' },
      { label: 'Tecnologia', value: 'Bifacial' },
    ],
    source: 1,
    featured: true,
  },
  {
    id: 'ja-solar-jam72s40-615w',
    name: 'Painel JAM72S40 MR',
    brand: 'JA Solar',
    model: 'JAM72S40 MR',
    category: 'paineis',
    summary: 'Módulo tipo-n de meia célula (half-cell).',
    img: 'painel-jasolar',
    specs: [
      { label: 'Potência', value: '615 W' },
      { label: 'Tecnologia', value: 'Tipo-n, meia célula' },
    ],
    source: 24,
  },
  {
    id: 'hanchus-ess-3-5kw',
    name: 'Sistema solar caseiro ESS 3,5 kW',
    brand: 'Hanchus',
    category: 'inversores',
    summary: 'Kit com inversor híbrido, bateria de lítio e painéis para uma casa.',
    img: 'kit-hanchus',
    specs: [
      { label: 'Inversor', value: 'Hanchus ESS 3000 W, 24 V, híbrido com MPPT' },
      { label: 'Bateria', value: 'Lítio 100 Ah, 24 V (2400 Wh)' },
      { label: 'Painéis', value: '2 × bifacial JA Solar 595 W' },
    ],
    source: 26,
    featured: true,
  },
  {
    id: 'dongyin-pkm60-dsk1',
    illustrative: true,
    name: 'Bomba pressurizadora PKM60 + DSK1',
    brand: 'Dongyin',
    model: 'PKM60 + DSK1',
    category: 'bombas-superficie',
    summary: 'Bomba de pressão com controlador automático.',
    img: 'bomba-pkm60',
    specs: [
      { label: 'Potência', value: '0,37 kW (0,5 HP)' },
      { label: 'Alimentação', value: 'AC 160–240 V' },
      { label: 'Altura máx.', value: '35 m' },
      { label: 'Caudal máx.', value: '35 L/min' },
    ],
    source: 5,
  },
  {
    id: 'dongyin-pkm80-dsk1',
    illustrative: true,
    name: 'Bomba pressurizadora PKM80 + DSK1',
    brand: 'Dongyin',
    model: 'PKM80 + DSK1',
    category: 'bombas-superficie',
    summary: 'Bomba de pressão com controlador automático.',
    img: 'bomba-pkm80',
    specs: [
      { label: 'Potência', value: '0,75 kW (1 HP)' },
      { label: 'Alimentação', value: 'AC 160–240 V' },
      { label: 'Altura máx.', value: '70 m' },
      { label: 'Caudal máx.', value: '50 L/min' },
    ],
    source: 6,
    featured: true,
  },
  ...(
    [
      ['3SDM2/8', '0,18 kW (0,25 HP)', '5 / 25 / 45 L/min', '34 / 29 / 14 m', 12],
      ['3SDM2/11', '0,25 kW (0,33 HP)', '5 / 25 / 45 L/min', '46 / 40 / 20 m', 11],
      ['3SDM2/15', '0,37 kW (0,5 HP)', '5 / 25 / 45 L/min', '63 / 54 / 27 m', 13],
      ['3SDM3/16', '0,55 kW (0,75 HP)', '10 / 40 / 65 L/min', '63 / 51 / 17 m', 14],
      ['3SDM3/21', '0,75 kW (1 HP)', '10 / 40 / 65 L/min', '82 / 67 / 23 m', 8],
    ] as const
  ).map(([model, power, flow, head, source]) => ({
    id: `dongyin-${model.toLowerCase().replace('/', '-')}`,
    name: `Bomba submersível 3" ${model}`,
    brand: 'Dongyin',
    model,
    category: 'bombas-submersiveis' as const,
    summary: 'Bomba submersível de 3 polegadas para furos, com control box e 30 m de cabo.',
    img: 'bomba-3sdm',
    specs: [
      { label: 'Potência', value: power },
      { label: 'Alimentação', value: '220–240 V, 50 Hz' },
      { label: 'Caudal', value: flow },
      { label: 'Altura', value: head },
    ],
    includes: ['Bomba', 'Control box', '30 m de cabo'],
    source,
    featured: model === '3SDM3/21',
  })),
  {
    id: 'bomba-4sa-16-17-4kw',
    name: 'Bomba submersível 4SA 16/17',
    model: '4SA 16/17',
    category: 'bombas-submersiveis',
    summary: 'Bomba trifásica para furos profundos e caudais elevados.',
    img: 'bomba-4sa',
    specs: [
      { label: 'Potência', value: '4 kW (5,5 HP)' },
      { label: 'Alimentação', value: 'AC 380 V' },
      { label: 'Caudal', value: '50 / 200 / 350 L/min' },
      { label: 'Altura', value: '102 / 75 / 37 m' },
      { label: 'Saída', value: '2"' },
    ],
    source: 23,
    featured: true,
  },
  {
    id: 'bomba-4sa-2-2kw-380v',
    name: 'Bomba submersível 4SA 2,2 kW (380 V)',
    model: 'Série 4SA',
    category: 'bombas-submersiveis',
    summary: 'Bomba submersível de 4 polegadas com quadro de controlo.',
    img: 'bomba-4sa-quadro',
    specs: [
      { label: 'Potência', value: '2,2 kW' },
      { label: 'Alimentação', value: '380 V' },
      { label: 'Caudal', value: '16,2 m³/h' },
      { label: 'Altura', value: '88 m' },
    ],
    source: 37,
  },
  {
    id: 'bomba-4sa-2-2kw-220v',
    name: 'Bomba submersível 4SA 2,2 kW (220 V)',
    model: 'Série 4SA',
    category: 'bombas-submersiveis',
    summary: 'Bomba submersível de 4 polegadas, versão monofásica.',
    img: 'bomba-4sa-220',
    specs: [
      { label: 'Potência', value: '2,2 kW' },
      { label: 'Alimentação', value: '220 V' },
      { label: 'Caudal', value: '16,2 m³/h' },
      { label: 'Altura', value: '88 m' },
    ],
    source: 38,
  },
  {
    id: 'bomba-4sd-1-5kw',
    name: 'Bomba submersível 4SD 1,5 kW',
    model: 'Série 4SD',
    category: 'bombas-submersiveis',
    summary: 'Bomba submersível de 4 polegadas para furos profundos.',
    img: 'bomba-4sd',
    specs: [
      { label: 'Potência', value: '1,5 kW' },
      { label: 'Alimentação', value: '220 / 380 V' },
      { label: 'Caudal', value: '8,4 m³/h' },
      { label: 'Altura', value: '108 m' },
    ],
    source: 33,
  },
  {
    id: 'bomba-drenagem-0-75kw',
    name: 'Bomba de drenagem 0,75 kW',
    category: 'bombas-submersiveis',
    summary: 'Bomba submersível para escoar água de zonas alagadas.',
    img: 'bomba-drenagem',
    specs: [
      { label: 'Potência', value: '0,75 kW (1 HP)' },
      { label: 'Caudal máx.', value: 'até 20 000 L/h' },
    ],
    source: 29,
  },
  {
    id: 'dongyin-3sds-800w',
    name: 'Bomba submersível solar híbrida 3"',
    brand: 'Dongyin',
    model: '3SDS 4.5-100-90 800AD',
    category: 'bombas-solares',
    summary: 'Funciona com painéis (DC) ou com a rede (AC), com control box.',
    img: 'bomba-3sds',
    specs: [
      { label: 'Potência', value: '800 W (1 HP)' },
      { label: 'Alimentação', value: 'DC 90–350 V / AC 220–240 V' },
      { label: 'Caudal', value: '20 / 40 / 60 L/min' },
      { label: 'Altura', value: '80 / 62 / 34 m' },
    ],
    includes: ['Bomba', 'Control box'],
    source: 7,
    featured: true,
  },
  {
    id: 'dongyin-4sds-1500w',
    name: 'Bomba submersível solar 4" 1500 W',
    brand: 'Dongyin',
    model: '4SDS 5-168-170',
    category: 'bombas-solares',
    summary: 'Bomba solar de 4 polegadas com control box.',
    img: 'bomba-4sds',
    specs: [
      { label: 'Potência', value: '1500 W (2 HP)' },
      { label: 'Caudal', value: '20 / 40 / 60 L/min' },
      { label: 'Altura', value: '139 / 109 / 71 m' },
    ],
    includes: ['Bomba', 'Control box'],
    source: 10,
  },
  {
    id: 'dongyin-4sds-2200w',
    name: 'Bomba submersível solar 4" 2200 W',
    brand: 'Dongyin',
    model: '4SDS 5-235-240-2200',
    category: 'bombas-solares',
    summary: 'Bomba solar de 4 polegadas para furos profundos.',
    img: 'bomba-4sds',
    specs: [
      { label: 'Potência', value: '2200 W (3 HP)' },
      { label: 'Alimentação', value: '220–400 V, 50 Hz' },
      { label: 'Caudal', value: '20 / 40 / 60 L/min' },
      { label: 'Altura', value: '194 / 152 / 99 m' },
    ],
    includes: ['Bomba', 'Control box'],
    source: 9,
  },
  {
    id: 'bomba-solar-zjlmet-400w',
    name: 'Kit bomba solar 400 W + 2 painéis',
    brand: 'Zjlmet',
    model: '48V/400W/3-4',
    category: 'bombas-solares',
    summary: 'Bomba solar de baixa potência com dois painéis, para pequenos caudais.',
    img: 'kit-bomba-400w',
    specs: [
      { label: 'Potência', value: '400 W, 48 V' },
      { label: 'Caudal', value: '5,4 m³/h' },
      { label: 'Altura', value: '90 m' },
    ],
    includes: ['Bomba', '2 painéis'],
    source: 39,
  },
  {
    id: 'bomba-solar-hibrida-1500w-kit',
    name: 'Kit bomba solar híbrida 1500 W + 4 painéis',
    model: '4SD 5/168/170-1500 AD',
    category: 'bombas-solares',
    summary: 'Bomba solar híbrida com quatro painéis, para furos profundos.',
    img: 'kit-bomba-1500w',
    specs: [
      { label: 'Potência', value: '1500 W' },
      { label: 'Caudal', value: '6 m³/h' },
      { label: 'Altura', value: '168 m' },
    ],
    includes: ['Bomba', '4 painéis'],
    source: 40,
    featured: true,
  },
  {
    id: 'motores-4',
    name: 'Motores para bombas de 4"',
    category: 'acessorios',
    summary: 'Motores de 1,5 a 7,5 kW, monofásicos (220 V) e trifásicos (380 V).',
    img: 'motores',
    specs: [
      { label: 'Potências', value: '1,5 / 2,2 / 4 / 5,5 / 7,5 kW' },
      { label: 'Alimentação', value: '220 V ou 380 V' },
    ],
    source: 35,
  },
  {
    id: 'termoacumulador-100l',
    name: 'Termoacumulador solar de alta pressão 100 L',
    category: 'termoacumuladores',
    summary: 'Aquecimento de água com tubos de vácuo e depósito isolado.',
    img: 'termoacumulador',
    specs: [
      { label: 'Capacidade', value: '100 L' },
      { label: 'Tipo', value: 'Alta pressão' },
    ],
    includes: ['Resistência', 'Válvula P/T', 'Haste de magnésio', 'Controlador'],
    source: 2,
    featured: true,
  },
  {
    id: 'termoacumulador-hibrido-200l',
    name: 'Termoacumulador solar híbrido 200 L',
    category: 'termoacumuladores',
    summary: 'Solar com apoio elétrico, para famílias maiores.',
    img: 'termoacumulador',
    specs: [
      { label: 'Capacidade', value: '200 L' },
      { label: 'Tipo', value: 'Híbrido, alta pressão' },
    ],
    source: 18,
  },
  {
    id: 'candeeiro-solar-rua',
    name: 'Candeeiro solar de rua',
    category: 'acessorios',
    summary: 'Iluminação exterior autónoma, com painel próprio e comando à distância.',
    img: 'candeeiro-solar',
    specs: [{ label: 'Versões', value: '300 W e 400 W' }],
    source: 25,
  },
]

export const productById = (id: string) => products.find((p) => p.id === id)
