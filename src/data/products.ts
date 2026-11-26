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
  /** A imagem é uma fotografia (recorte retangular), não um recorte do produto sem fundo. */
  photo?: boolean
  /** Escolhas do cliente (ex.: Cor: Preto, Branco, Vermelho). O cliente tem de escolher uma de cada grupo. */
  options?: { name: string; values: string[] }[]
  /** "m" = vendido ao metro: o preço é por metro e o cliente escolhe quantos metros. Vazio = por unidade. */
  unit?: 'm' | ''
  /** Kit (combo): produtos do catálogo que fazem parte deste produto, com a quantidade de cada um. */
  kit?: { id: string; qtd: number }[]
  /** Fotografias extra (endereços), até 4, mostradas por baixo da imagem principal na página do produto. */
  gallery?: string[]
}

/** Potência em HP de cada potência em kW (para as fichas). */
const HP: Record<string, string> = {"0.37": "0,5", "0.55": "0,75", "0.75": "1", "1.1": "1,5", "1.5": "2", "2.2": "3", "3.0": "4", "4.0": "5,5", "5.5": "7,5", "7.5": "10"}

const catalogo: Product[] = [
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
    id: 'dongyin-pkm60-dsk1',
    illustrative: true,
    name: 'Bomba de pressão PKM60 + controlador de pressão',
    brand: 'Dongyin',
    model: 'PKM60 KIT',
    category: 'bombas-superficie',
    summary: 'Bomba de pressão de 0,37 kW com controlador automático de pressão, para dar pressão à água da casa.',
    price: 4350,
    img: 'bomba-pkm60',
    specs: [
      { label: 'Potência', value: '0,37 kW (0,5 HP)' },
      { label: 'Alimentação', value: '230 V' },
      { label: 'Altura máx.', value: '35 m' },
      { label: 'Caudal máx.', value: '35 L/min' },
    ],
    source: 5,
  },
  {
    id: 'dongyin-pkm80-dsk1',
    illustrative: true,
    name: 'Bomba de pressão PKM80 + controlador de pressão',
    brand: 'Dongyin',
    model: 'PKM80 KIT',
    category: 'bombas-superficie',
    summary: 'Bomba de pressão de 0,75 kW com controlador automático de pressão, para casas maiores e depósitos.',
    price: 6100,
    img: 'bomba-pkm80',
    specs: [
      { label: 'Potência', value: '0,75 kW (1 HP)' },
      { label: 'Alimentação', value: '230 V' },
      { label: 'Altura máx.', value: '70 m' },
      { label: 'Caudal máx.', value: '50 L/min' },
    ],
    source: 6,
    featured: true,
  },
  // Electrobombas de 3": bomba + motor + control box + 30 m de cabo. Preço oficial e desempenho do catálogo DONGYIN 2026, pp. 5–8.
  ...(
    [
      ['3SDM2/8', '0,18 kW (0,25 HP)', 7550, '10 / 25 / 40', '33 / 29 / 19', '34', ''],
      ['3SDM2/11', '0,25 kW (0,33 HP)', 8000, '10 / 25 / 40', '45 / 40 / 27', '47', '10,6 kg'],
      ['3SDM2/15', '0,37 kW (0,5 HP)', 8250, '10 / 25 / 40', '62 / 54 / 36', '64', ''],
      ['3SDM3/16', '0,55 kW (0,75 HP)', 9500, '20 / 40 / 60', '60 / 51 / 26', '64', '13,1 kg'],
      ['3SDM3/21', '0,75 kW (1 HP)', 10000, '20 / 40 / 60', '78 / 67 / 34', '84', '14,9 kg'],
    ] as const
  ).map(([model, power, price, flow, head, hmax, kg]) => ({
    id: `dongyin-${model.toLowerCase().replace('/', '-')}`,
    name: `Bomba submersível 3" ${model} (completa)`,
    brand: 'Dongyin',
    model,
    category: 'bombas-submersiveis' as const,
    summary: 'Bomba submersível de 3 polegadas pronta a instalar: bomba, motor, control box e 30 m de cabo.',
    img: 'bomba-3sdm',
    price,
    specs: [
      { label: 'Potência', value: power },
      { label: 'Alimentação', value: '220–240 V, 50 Hz, monofásica' },
      { label: 'Caudal', value: `${flow} L/min` },
      { label: 'Altura', value: `${head} m` },
      { label: 'Altura máx.', value: `${hmax} m` },
      { label: 'Água até', value: '35 °C' },
      { label: 'Rotação', value: '2850 r/min' },
      ...(kg ? [{ label: 'Peso', value: kg }] : []),
    ],
    includes: ['Bomba', 'Motor', 'Control box', '30 m de cabo'],
    source: 0,
    featured: model === '3SDM3/21',
  })),
  // Partes hidráulicas (sem motor). Código, modelo, kW, preço oficial (MZN), alturas (m) nos caudais indicados, altura a caudal zero.
  // Fonte: lista de preços da Tlhavika e catálogo DONGYIN 2026 (50 Hz), pp. 14–31. Quando o código da lista não existe no catálogo,
  // usa-se a curva do modelo de catálogo com a mesma potência (ex.: 4SD8/17 → 4SD8/15, 2,2 kW).
  ...(
    [
  ['4SD2/9', '4SD2/8-9', '0.37', 6330, [62, 55, 33], 64, '15 / 30 / 50'],
  ['4SD2/12', '4SD2/11-12', '0.55', 7120, [83, 73, 44], 85, '15 / 30 / 50'],
  ['4SD2/15', '4SD2/14-15', '0.75', 7630, [104, 91, 55], 106, '15 / 30 / 50'],
  ['4SD2/21', '4SD2/20-21', '1.1', 9360, [146, 127, 77], 149, '15 / 30 / 50'],
  ['4SD2/28', '4SD2/26-28', '1.5', 9330, [187, 164, 99], 191, '15 / 30 / 50'],
  ['4SD2/37', '4SD2/37', '2.2', 13000, [256, 225, 136], 262, '15 / 30 / 50'],
  ['4SD4/6', '4SD4/5-6', '0.37', 6330, [41, 37, 23], 44, '20 / 50 / 90'],
  ['4SD4/8', '4SD4/7-8', '0.55', 6480, [55, 49, 30], 59, '20 / 50 / 90'],
  ['4SD4/10', '4SD4/9-10', '0.75', 7050, [69, 61, 38], 74, '20 / 50 / 90'],
  ['4SD4/14', '4SD4/13-14', '1.1', 7840, [96, 86, 53], 103, '20 / 50 / 90'],
  ['4SD4/19', '4SD4/17-19', '1.5', 9790, [123, 111, 68], 132, '20 / 50 / 90'],
  ['4SD4/24', '4SD4/24', '2.2', 13000, [165, 147, 91], 177, '20 / 50 / 90'],
  ['4SD6/7', '4SD6/7', '0.75', 6330, [46, 39, 24], 50, '40 / 80 / 120'],
  ['4SD6/11', '4SD6/11', '1.1', 6800, [73, 61, 38], 79, '40 / 80 / 120'],
  ['4SD6/15', '4SD6/15', '1.5', 8280, [100, 83, 52], 108, '40 / 80 / 120'],
  ['4SD6/20', '4SD6/20', '2.2', 13000, [139, 116, 72], 151, '40 / 80 / 120'],
  ['4SD6/26', '4SD6/26', '3.0', 11880, [179, 150, 93], 194, '40 / 80 / 120'],
  ['4SD6/35', '4SD6/35', '4.0', 17570, [226, 189, 117], 244, '40 / 80 / 120'],
  ['4SD8/17', '4SD8/17-18', '2.2', 13000, [97, 84, 57], 105, '40 / 100 / 160'],
  ['4SD8/24', '4SD8/21-24', '3.0', 14000, [136, 118, 80], 146, '40 / 100 / 160'],
  ['4SD8/29', '4SD8/28-29', '4.0', 16065, [175, 151, 103], 188, '40 / 100 / 160'],
  ['4SD8/37', '4SD8/37-40', '5.5', 17820, [214, 185, 126], 230, '40 / 100 / 160'],
  ['4SD8/45', '4SD8/45', '7.5', 22601, [259, 224, 153], 279, '40 / 100 / 160'],
  ['4SD10/9', '4SD10/9', '1.5', 7560, [55, 49, 27], 61, '60 / 120 / 210'],
  ['4SD10/13', '4SD10/13', '2.2', 13000, [79, 71, 39], 88, '60 / 120 / 210'],
  ['4SD10/17', '4SD10/17', '3.0', 10300, [104, 93, 51], 115, '60 / 120 / 210'],
  ['4SD10/23', '4SD10/23', '4.0', 13000, [134, 120, 66], 148, '60 / 120 / 210'],
  ['4SD10/32', '4SD10/32', '7.5', 18000, [207, 186, 102], 229, '60 / 120 / 210'],
  ['4SD12/12', '4SD12/11-12', '2.2', 13000, [74, 58, 36], 81, '60 / 150 / 240'],
  ['4SD12/16', '4SD12/15-16', '3.0', 15785, [98, 78, 48], 108, '60 / 150 / 240'],
  ['4SD12/20', '4SD12/19-20', '4.0', 18860, [123, 97, 60], 135, '60 / 150 / 240'],
  ['4SD12/23', '4SD12/23', '5.5', 22037, [153, 122, 75], 169, '60 / 150 / 240'],
  ['4SD12/26', '4SD12/26', '5.5', 22037, [153, 122, 75], 169, '60 / 150 / 240'],
  ['4SD12/32', '4SD12/32', '7.5', 26445, [184, 146, 90], 203, '60 / 150 / 240'],
  ['4SD16/9', '4SD16/9', '2.2', 10639, [55, 44, 30], 63, '100 / 200 / 300'],
  ['4SD16/12', '4SD16/12', '3.0', 12505, [72, 57, 39], 82, '100 / 200 / 300'],
  ['4SD16/16-17', '4SD16/16-17', '4.0', 16000, [94, 75, 51], 107, '100 / 200 / 300'],
  ['4SD16/20', '4SD16/20', '5.5', 18040, [116, 93, 63], 133, '100 / 200 / 300'],
  ['4SD16/25', '4SD16/25', '7.5', 21689, [138, 110, 75], 158, '100 / 200 / 300'],
  ['4SP15-20', '4SP15-20', '5.5', 32000, [117, 103, 77], 128, '60 / 150 / 270'],
  ['4SP15-26', '4SP15-26', '7.5', 40000, [152, 134, 100], 166, '60 / 150 / 270'],
    ] as const
  ).map(([code, desc, kw, price, heads, h0, flows]) => ({
    id: `parte-hidraulica-${code.toLowerCase().replace(/[/]/g, '-')}`,
    name: `Parte hidráulica ${code} (${kw.replace('.', ',')} kW)`,
    brand: 'Dongyin',
    model: desc,
    category: 'partes-hidraulicas' as const,
    summary: `Parte hidráulica (corpo de bomba, sem motor) de bomba submersível de 4 polegadas. Monta num motor submersível 4" de ${kw.replace('.', ',')} kW.`,
    img: code.startsWith('4SP') ? 'bomba-4sp' : 'bomba-4sa',
    illustrative: true,
    price,
    specs: [
      { label: 'Código', value: code },
      { label: 'Motor a usar', value: `${kw.replace('.', ',')} kW (${HP[kw]} HP), 4"` },
      ...(heads
        ? [
            { label: 'Caudal', value: `${flows} L/min` },
            { label: 'Altura', value: `${heads.join(' / ')} m` },
            { label: 'Altura máx.', value: `${h0} m` },
          ]
        : [{ label: 'Caudal e altura', value: 'Confirmados na cotação' }]),
      { label: 'Frequência', value: '50 Hz' },
      { label: 'Rotação', value: '2850 r/min' },
      { label: 'Água até', value: '35 °C' },
      { label: 'Areia máx.', value: '0,25 %' },
      { label: 'Furo mínimo', value: '4" (100 mm)' },
    ],
    includes: ['Parte hidráulica (sem motor)'],
    source: 0,
  })),
  // Motores submersíveis 4". Código, tensão, kW, preço oficial (MZN), referência DONGYIN, corrente (A), rendimento (%), comprimento (mm), peso (kg).
  // Fonte: lista de preços da Tlhavika e catálogo DONGYIN 2026, pp. 91–92. Vazio = não localizado no catálogo.
  ...(
    [
      ['37220M', '220', '0.37', 7610, '4YSM370', '3,5', '57', '386', '7,4'],
      ['55220M', '220', '0.55', 8118, '4YSM550', '5', '60', '411', '8,6'],
      ['75220M', '220', '0.75', 9342, '4YSM750', '5,8', '63', '431', '9,6'],
      ['110220M', '220', '1.1', 11070, '4YSM1100', '8,1', '66', '476', '11,7'],
      ['150220M', '220', '1.5', 12915, '4YSM1500', '10', '68', '536', '14,5'],
      ['220220M', '220', '2.2', 16000, '4YSM2200', '15,8', '69', '626', '18,7'],
      ['37380M', '380', '0.37', 7800, '', '', '', '', ''],
      ['55380M', '380', '0.55', 8500, '4YS550', '1,7', '61', '386', '7,4'],
      ['75380M', '380', '0.75', 9300, '4YS750', '2', '64', '411', '8,6'],
      ['110380M', '380', '1.1', 10800, '4YS1100', '3,1', '67', '456', '10,8'],
      ['150380M', '380', '1.5', 12500, '4YS1500', '3,9', '69', '506', '13,1'],
      ['220380M', '380', '2.2', 15000, '4YS2200', '5,8', '71', '576', '16,4'],
      ['300380M', '380', '3.0', 21500, '4YS3000', '7,1', '72', '666', '20,2'],
      ['400380M', '380', '4.0', 25000, '4YS4000', '9,8', '74', '747', '24,5'],
      ['550380M', '380', '5.5', 27000, '4YS5500', '12,1', '75', '847', '29,2'],
      ['750380M', '380', '7.5', 30000, '4YS7500', '14,5', '76', '917', '33'],
    ] as const
  ).map(([code, volt, kw, price, ref, amps, eff, len, kg]) => ({
    id: `motor-${code.toLowerCase()}`,
    name: `Motor submersível 4" ${volt} V ${kw.replace('.', ',')} kW`,
    brand: 'Dongyin',
    model: ref || code,
    category: 'motores' as const,
    summary: `Motor submersível de 4 polegadas, ${volt === '220' ? 'monofásico (220 V)' : 'trifásico (380 V)'}, para montar com uma parte hidráulica de ${kw.replace('.', ',')} kW.`,
    img: 'motor-4',
    illustrative: true,
    price,
    specs: [
      { label: 'Código', value: code },
      { label: 'Potência', value: `${kw.replace('.', ',')} kW (${HP[kw]} HP)` },
      { label: 'Alimentação', value: volt === '220' ? '220 V, 50 Hz, monofásico' : '380 V, 50 Hz, trifásico' },
      ...(amps ? [{ label: 'Corrente', value: `${amps} A` }] : []),
      ...(eff ? [{ label: 'Rendimento', value: `${eff} %` }] : []),
      ...(len ? [{ label: 'Comprimento', value: `${len} mm` }] : []),
      ...(kg ? [{ label: 'Peso', value: `${kg} kg` }] : []),
    ],
    source: 0,
  })),
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
  // Bombas solares e híbridas (AD = funcionam com painéis ou com a rede). Preço oficial e desempenho do catálogo DONGYIN Solar 2026.
  {
    id: 'dongyin-3sds-400w',
    name: 'Bomba solar 3" 400 W',
    brand: 'Dongyin',
    model: '3SD4.5-55-60-400',
    category: 'bombas-solares',
    summary: 'Bomba solar submersível de 3 polegadas que liga diretamente aos painéis, através do controlador 3DYS-60-400.',
    img: 'bomba-3sds',
    price: 15500,
    specs: [
      { label: 'Potência', value: '400 W (0,55 HP)' },
      { label: 'Tensão nominal', value: '60 V DC (trabalha entre 65 e 100 V)' },
      { label: 'Caudal', value: '10 / 20 / 40 / 60 L/min' },
      { label: 'Altura', value: '48 / 42 / 30 / 14 m' },
      { label: 'Altura máx.', value: '55 m' },
      { label: 'Água até', value: '35 °C' },
    ],
    includes: ['Bomba'],
    source: 0,
  },
  {
    id: 'dongyin-3sds-800w',
    name: 'Bomba solar híbrida 3" 800 W',
    brand: 'Dongyin',
    model: '3SD4.5-100-90-800 (AD)',
    category: 'bombas-solares',
    summary: 'Bomba híbrida de 3 polegadas: funciona com painéis solares (DC) ou com a rede (AC), através do controlador 4DYS-90-800AD.',
    img: 'bomba-4sds',
    price: 22300,
    specs: [
      { label: 'Potência', value: '800 W (1 HP)' },
      { label: 'Tensão nominal', value: '90 V' },
      { label: 'Alimentação', value: 'DC 90–350 V / AC 220–240 V' },
      { label: 'Caudal', value: '20 / 40 / 60 / 70 L/min' },
      { label: 'Altura', value: '80 / 62 / 34 / 16 m' },
      { label: 'Altura máx.', value: '100 m' },
    ],
    includes: ['Bomba'],
    source: 7,
    featured: true,
  },
  {
    id: 'dongyin-4sds-1500w',
    name: 'Bomba solar híbrida 4" 1500 W',
    brand: 'Dongyin',
    model: '4SD5-168-170-1500 (AD)',
    category: 'bombas-solares',
    summary: 'Bomba híbrida de 4 polegadas para furos profundos: funciona com painéis solares ou com a rede.',
    img: 'bomba-4sds',
    price: 27000,
    specs: [
      { label: 'Potência', value: '1500 W (2 HP)' },
      { label: 'Tensão nominal', value: '170 V' },
      { label: 'Caudal', value: '20 / 40 / 60 / 80 L/min' },
      { label: 'Altura', value: '139 / 109 / 71 / 15 m' },
      { label: 'Altura máx.', value: '168 m' },
      { label: 'Água até', value: '35 °C' },
    ],
    includes: ['Bomba'],
    source: 10,
  },
  {
    id: 'dongyin-4sds-2200w',
    name: 'Bomba solar híbrida 4" 2200 W',
    brand: 'Dongyin',
    model: '4SD5-235-240-2200 (AD)',
    category: 'bombas-solares',
    summary: 'Bomba híbrida de 4 polegadas para furos muito profundos: funciona com painéis solares ou com a rede.',
    img: 'bomba-4sds',
    price: 29000,
    specs: [
      { label: 'Potência', value: '2200 W (3 HP)' },
      { label: 'Tensão nominal', value: '240 V' },
      { label: 'Caudal', value: '20 / 40 / 60 / 80 L/min' },
      { label: 'Altura', value: '194 / 152 / 99 / 22 m' },
      { label: 'Altura máx.', value: '235 m' },
    ],
    includes: ['Bomba'],
    source: 9,
    featured: true,
  },
  {
    id: 'kit-bomba-solar-2200w',
    name: 'Kit bomba solar 2200 W + control box + 6 painéis',
    brand: 'Dongyin',
    model: '4SD5-235-240-2200 (AD)',
    category: 'kits',
    summary: 'Tudo para tirar água de um furo profundo só com o sol: bomba híbrida de 2200 W, control box e 6 painéis solares.',
    img: '',
    price: 78000,
    kit: [
      { id: 'dongyin-4sds-2200w', qtd: 1 },
      { id: 'astronergy-astron7-625w', qtd: 6 },
    ],
    specs: [
      { label: 'Potência da bomba', value: '2200 W (3 HP)' },
      { label: 'Caudal', value: '20 / 40 / 60 / 80 L/min' },
      { label: 'Altura', value: '194 / 152 / 99 / 22 m' },
    ],
    includes: ['Bomba solar híbrida 2200 W', 'Control box', '6 painéis solares'],
    source: 0,
    featured: true,
  },
  {
    id: 'controlador-solar-3dys-60-400',
    name: 'Controlador solar 3DYS-60-400',
    brand: 'Dongyin',
    model: '3DYS-60-400',
    category: 'acessorios',
    summary: 'Controlador para a bomba solar de 400 W, com ecrã e botões de comando.',
    img: 'ctrl-3dys-400',
    specs: [
      { label: 'Potência da bomba', value: '400 W' },
      { label: 'Corrente máx. de entrada', value: '18 A' },
      { label: 'Painéis em série', value: '2 × 280–340 W' },
      { label: 'Tensão ideal dos painéis', value: '65–100 V (nunca acima de 105 V)' },
    ],
    source: 0,
  },
  {
    id: 'controlador-solar-4dys-90-800ad',
    name: 'Controlador solar 4DYS-90-800AD',
    brand: 'Dongyin',
    model: '4DYS-90-800AD',
    category: 'acessorios',
    summary: 'Controlador da bomba solar híbrida de 800 W, funciona com painéis ou com a rede.',
    img: 'ctrl-4dys-800',
    specs: [
      { label: 'Potência da bomba', value: '800 W' },
      { label: 'Corrente máx. de entrada', value: 'DC 18 A / AC 15 A' },
      { label: 'Tensão AC', value: '220–240 V' },
      { label: 'Painéis em série', value: '3 × 350–400 W ou 2 × 540–600 W' },
      { label: 'Tensão ideal dos painéis', value: '90–350 V (nunca acima de 380 V)' },
    ],
    source: 0,
  },
  {
    id: 'control-box-dya-t06',
    name: 'Caixa de comando automática trifásica DYA-T06',
    brand: 'Dongyin',
    model: 'DYA-T06',
    category: 'acessorios',
    summary: 'Caixa de comando com ecrã LCD para bombas submersíveis trifásicas: protege o motor e mostra o estado da bomba.',
    img: 'ctrl-dya-t06',
    specs: [
      { label: 'Alimentação', value: '380 V trifásico, 50/60 Hz' },
      { label: 'Potência do motor', value: '0,37–7,5 kW' },
      { label: 'Proteção', value: 'IP22' },
      { label: 'Temperatura de trabalho', value: '−25 a +55 °C' },
      { label: 'Humidade', value: '20–90 % (sem condensação)' },
      { label: 'Protege contra', value: 'Sobrecarga, motor bloqueado, funcionamento a seco (sem sensor), subtensão, sobretensão, falta de fase e picos de tensão' },
      { label: 'Outras funções', value: 'Ecrã LCD com o estado da bomba, memória após falha de energia, calibração por botão' },
      { label: 'Dimensões', value: '205 × 160 × 80 mm' },
    ],
    source: 0,
  },
  {
    id: 'inversor-bomba-solar-ke300',
    name: 'Inversor para bomba solar KE300',
    brand: 'Micno',
    model: 'KE300A-01 / KE300P / AE300-01',
    category: 'inversores',
    summary: 'Inversor para bombas solares, em versões monofásica e trifásica.',
    img: 'inversor-ke300',
    specs: [
      { label: 'KE300-01 (1 fase, 220 V)', value: '0,4–5,5 kW' },
      { label: 'AE300-01 (3 fases, 220 V)', value: '0,4–11 kW' },
      { label: 'KE300P (3 fases, 380 V)', value: '0,75–110 kW' },
    ],
    source: 0,
  },
  {
    id: 'cabo-solar',
    name: 'Cabo solar',
    category: 'acessorios',
    summary: 'Cabo para ligar os painéis solares. Vendido ao metro: escolha a cor e quantos metros precisa.',
    img: 'cabo-solar',
    unit: 'm',
    options: [{ name: 'Cor', values: ['Vermelho', 'Preto'] }],
    specs: [],
    source: 0,
  },
  {
    id: 'cabo-submersivel-plano',
    name: 'Cabo azul para bombas submersíveis',
    category: 'acessorios',
    summary: 'Cabo flexível de cobre para ligar bombas submersíveis. Vendido ao metro: escolha a cor e quantos metros precisa.',
    img: 'cabo-submersivel',
    unit: 'm',
    options: [{ name: 'Cor', values: ['Azul', 'Preto', 'Branco', 'Vermelho'] }],
    specs: [],
    source: 0,
  },
  {
    id: 'inversor-growatt-spf-5000es',
    name: 'Inversor solar Growatt SPF 5000 ES',
    brand: 'Growatt',
    model: 'SPF 5000 ES',
    category: 'inversores',
    summary: 'Inversor solar de 5 kW para sistemas com baterias de 48 V, com onda sinusoidal pura.',
    img: 'inv-growatt',
    specs: [
      { label: 'Potência', value: '5000 W' },
      { label: 'Tensão da bateria', value: '48 V (lítio ou chumbo)' },
      { label: 'Entrada solar máx.', value: '450 V DC' },
      { label: 'Saída', value: '230 V AC, onda sinusoidal pura' },
      { label: 'Corrente de carga máx.', value: '100 A' },
      { label: 'Em paralelo', value: 'até 6 unidades' },
    ],
    source: 0,
  },
  {
    id: 'inversor-luxpower-sna5000',
    name: 'Inversor solar LuxPower SNA 5000',
    brand: 'LuxPower',
    model: 'SNA5000 WPV',
    category: 'inversores',
    summary: 'Inversor de 5 kW com dois seguidores solares (MPPT) para baterias de 48 V.',
    img: 'inv-luxpower',
    specs: [
      { label: 'Potência', value: '5000 W / 5000 VA' },
      { label: 'Pico de arranque', value: '10 000 VA' },
      { label: 'Tensão da bateria', value: '48 V' },
      { label: 'Entradas solares (MPPT)', value: '2, de 120 a 385 V' },
      { label: 'Saída', value: 'Onda sinusoidal pura' },
    ],
    source: 0,
  },
  {
    id: 'inversor-hanchu-ess',
    name: 'Inversor híbrido Hanchu ESS',
    brand: 'Hanchu ESS',
    category: 'inversores',
    summary: 'Inversor híbrido de parede com seguidor solar (MPPT), para sistemas com bateria de lítio.',
    img: 'inv-hanchu',
    specs: [
      { label: 'Potência', value: '3000 W' },
      { label: 'Tensão da bateria', value: '24 V' },
      { label: 'Tipo', value: 'Híbrido, com MPPT' },
    ],
    source: 26,
  },
  {
    id: 'inversor-deye-hibrido',
    name: 'Inversor híbrido trifásico Deye',
    brand: 'Deye',
    category: 'inversores',
    summary: 'Inversor híbrido trifásico para casas e negócios, com baterias de lítio. Modelo e potência a confirmar na cotação.',
    img: 'inv-deye',
    specs: [{ label: 'Tipo', value: 'Híbrido, trifásico' }],
    source: 0,
  },
  {
    id: 'bateria-hanchu-lv-5-12',
    name: 'Bateria de lítio Hanchu ESS 5,12 kWh',
    brand: 'Hanchu ESS',
    model: 'HOME-ESS-LV-5.12K',
    category: 'baterias',
    summary: 'Bateria de lítio de baixa tensão para guardar a energia solar da casa.',
    img: 'bat-hanchu',
    specs: [
      { label: 'Capacidade', value: '5,12 kWh' },
      { label: 'Tensão', value: '51,2 V' },
      { label: 'Tecnologia', value: 'Lítio ferro-fosfato (LFP)' },
      { label: 'Corrente de carga e descarga', value: '100 A' },
      { label: 'Profundidade de descarga', value: '95 %' },
    ],
    source: 0,
  },
  {
    id: 'bateria-dyness-powerbox',
    name: 'Bateria de lítio Dyness',
    brand: 'Dyness',
    category: 'baterias',
    summary: 'Bateria de lítio de parede, de baixa tensão (48 V), para sistemas solares domésticos. Modelo e capacidade a confirmar na cotação.',
    img: 'bat-dyness',
    specs: [
      { label: 'Tecnologia', value: 'Lítio ferro-fosfato (LiFePO4)' },
      { label: 'Tensão', value: '48 V (baixa tensão)' },
    ],
    source: 0,
  },
  {
    id: 'bateria-deye-rack-hv',
    name: 'Bateria de lítio Deye em armário (alta tensão)',
    brand: 'Deye',
    category: 'baterias',
    summary: 'Armário de baterias de lítio de alta tensão, com módulos empilháveis, para negócios e instalações maiores. Capacidade a confirmar na cotação.',
    img: 'bat-deye-rack',
    specs: [
      { label: 'Tipo', value: 'Alta tensão, módulos empilháveis' },
      { label: 'Tecnologia', value: 'Lítio' },
    ],
    source: 0,
  },
  {
    id: 'control-box-dym-s04',
    name: 'Caixa de comando manual monofásica DYM-S04',
    brand: 'Dongyin',
    model: 'DYM-S04',
    category: 'acessorios',
    summary: 'Caixa de comando manual para bombas submersíveis monofásicas até 3 kW (4 HP).',
    img: 'ctrl-dym-s04',
    specs: [
      { label: 'Tipo', value: 'Manual, monofásica' },
      { label: 'Potência do motor', value: 'até 3 kW (4 HP)' },
      { label: 'Comando', value: 'Interruptor com luz indicadora' },
    ],
    source: 0,
  },
  {
    id: 'control-box-dym-03',
    name: 'Caixa de comando manual monofásica DYM-S03',
    brand: 'Dongyin',
    model: 'DYM-S03',
    category: 'acessorios',
    summary: 'Caixa de comando manual para bombas submersíveis monofásicas até 1,5 kW (2 HP).',
    img: 'ctrl-dym-03',
    specs: [
      { label: 'Tipo', value: 'Manual, monofásica' },
      { label: 'Potência do motor', value: 'até 1,5 kW (2 HP)' },
      { label: 'Comando', value: 'Interruptor com luz indicadora' },
    ],
    source: 0,
  },
  {
    id: 'quadro-protecao-dc',
    name: 'Quadro de proteção DC para painéis solares',
    category: 'acessorios',
    summary: 'Quadro com seccionador e proteção contra descargas, para a ligação dos painéis ao inversor.',
    img: 'quadro-dc',
    specs: [{ label: 'Inclui', value: 'Seccionador, descarregadores de sobretensão e fusíveis' }],
    source: 0,
  },
  {
    id: 'cabos-solares-mc4',
    name: 'Cabos solares com conectores MC4',
    category: 'acessorios',
    summary: 'Cabos vermelho e preto com conectores MC4 já montados, para ligar painéis solares.',
    img: 'cabo-mc4',
    specs: [{ label: 'Cores', value: 'Vermelho (positivo) e preto (negativo)' }, { label: 'Conectores', value: 'MC4' }],
    source: 0,
  },
  {
    id: 'bomba-pressurizadora-manometro',
    name: 'Bomba pressurizadora com controlador e manómetro',
    category: 'bombas-superficie',
    summary: 'Bomba de superfície com controlador automático de pressão e manómetro.',
    img: 'bomba-pressurizadora-ctrl',
    specs: [{ label: 'Controlo', value: 'Automático, com manómetro' }],
    source: 0,
  },
  {
    id: 'termoacumulador-100l',
    name: 'Termoacumulador solar de alta pressão 100 L',
    brand: 'Tlhavika',
    category: 'termoacumuladores',
    summary: 'Aquecimento de água com tubos de vácuo e depósito isolado.',
    img: 'termo-100',
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
    brand: 'Tlhavika',
    category: 'termoacumuladores',
    summary: 'Solar com apoio elétrico, para famílias maiores.',
    img: 'termo-200',
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

/**
 * PREÇOS DE EXEMPLO (MZN), só para ver o site completo. NÃO são preços da Tlhavika.
 * Substituir pelos preços reais no painel (Catálogo → produto → Preço); o que for guardado no painel prevalece sobre isto.
 * [preço, desconto %, desconto válido até]
 */
const PRECOS_EXEMPLO: Record<string, [number, number?, string?]> = {
  'astronergy-astron7-625w': [9800],
  'ja-solar-jam72s40-615w': [8900, 10, '2026-12-31'],
  'bomba-drenagem-0-75kw': [9500],
  'controlador-solar-3dys-60-400': [7800],
  'controlador-solar-4dys-90-800ad': [11500],
  'control-box-dya-t06': [5200],
  'inversor-bomba-solar-ke300': [42000],
  'termoacumulador-100l': [24500],
  'termoacumulador-hibrido-200l': [46500],
  'candeeiro-solar-rua': [6200],
  'inversor-growatt-spf-5000es': [62000],
  'inversor-luxpower-sna5000': [58000],
  'inversor-hanchu-ess': [72000],
  'inversor-deye-hibrido': [185000],
  'bateria-hanchu-lv-5-12': [95000],
  'bateria-dyness-powerbox': [88000],
  'bateria-deye-rack-hv': [420000],
  'control-box-dym-s04': [4200],
  'control-box-dym-03': [3900],
  'quadro-protecao-dc': [7500],
  'cabo-solar': [95],
  'cabo-submersivel-plano': [110],
  'cabos-solares-mc4': [950],
  'bomba-pressurizadora-manometro': [12800],
}

export const products: Product[] = catalogo.map((p) => {
  const e = PRECOS_EXEMPLO[p.id]
  return e ? { ...p, price: e[0], ...(e[1] ? { discount: e[1], discountUntil: e[2] } : {}) } : p
})

export const productById = (id: string) => products.find((p) => p.id === id)
