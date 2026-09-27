/**
 * Conteúdo editável do site.
 * Regra: preços, stock, garantias, especificações, número de clientes/projetos
 * e contactos adicionais só entram depois de confirmados pela Tlhavika.
 */

export const contact = {
  /** Observado no perfil público; confirmar antes da publicação final. */
  phone: '+258 87 119 1481',
  whatsapp: '258871191481',
  email: 'Tlhavika.solar@gmail.com',
  address: 'Av. de Moçambique, km 9,2 — Bairro do Zimpeto, Maputo',
  facebook: 'https://www.facebook.com/people/Tlhavika/61560557742444/',
  confirmed: false,
}

export const wa = (text: string) => `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`

export type SolutionId = 'energia-solar' | 'bombagem' | 'aquecimento-solar'

export interface Solution {
  id: SolutionId
  n: string
  name: string
  short: string
  lead: string
  image: string
  /** Recorte de produto em /img/produtos. */
  product: string
  imageAlt: string
  includes: string[]
  uses: string[]
  askUs: string[]
  categories: CategoryId[]
}

export const solutions: Solution[] = [
  {
    id: 'energia-solar',
    n: '01',
    name: 'Energia solar',
    short: 'Painéis, inversores e baterias',
    lead: 'Sistemas fotovoltaicos que convertem a luz do sol em eletricidade para a casa ou o negócio. Com baterias, parte dessa energia fica guardada para a noite ou para falhas de rede.',
    image: 'hero',
    product: 'painel-astronergy',
    imageAlt: 'Paisagem com campo de painéis solares junto a um reservatório de água',
    includes: ['Painéis solares fotovoltaicos', 'Inversores', 'Baterias', 'Estruturas e acessórios'],
    uses: ['Casas', 'Lojas e escritórios', 'Alojamentos', 'Pequenas unidades de produção'],
    askUs: [
      'Que aparelhos quer alimentar e durante quantas horas por dia',
      'Se tem ligação à rede e com que frequência falha',
      'Se precisa de energia à noite (baterias)',
      'Onde ficariam os painéis: telhado ou terreno',
    ],
    categories: ['paineis', 'inversores', 'baterias', 'acessorios'],
  },
  {
    id: 'bombagem',
    n: '02',
    name: 'Bombas de água',
    short: 'Superfície, submersíveis e solares',
    lead: 'Bombas para tirar água de furos e poços, encher depósitos, dar pressão às torneiras ou regar a machamba. As bombas solares funcionam diretamente com painéis, através de um controlador.',
    image: 'agua',
    product: 'bomba-4sds',
    imageAlt: 'Machamba com depósito elevado, painel solar e canal de rega',
    includes: ['Bombas pressurizadoras (superfície)', 'Bombas submersíveis para furos', 'Bombas solares com controlador', 'Motores e acessórios'],
    uses: ['Abastecimento de casas', 'Rega e agricultura', 'Depósitos elevados', 'Drenagem'],
    askUs: [
      'Profundidade do furo e nível da água',
      'Altura até ao depósito ou ponto de consumo',
      'Quantidade de água necessária por dia',
      'Se prefere alimentação pela rede ou por painéis',
    ],
    categories: ['bombas-superficie', 'bombas-submersiveis', 'bombas-solares', 'acessorios'],
  },
  {
    id: 'aquecimento-solar',
    n: '03',
    name: 'Aquecimento solar',
    short: 'Termoacumuladores solares',
    lead: 'Termoacumuladores que aquecem água com o calor do sol, através de tubos de vácuo, e a guardam num depósito isolado. É tecnologia solar térmica: aquece água, não produz eletricidade.',
    image: 'foto-17',
    product: 'termoacumulador',
    imageAlt: 'Termoacumulador solar com tubos de vácuo instalado numa cobertura',
    includes: ['Termoacumuladores de alta pressão', 'Termoacumuladores híbridos (com apoio elétrico)', 'Acessórios de instalação'],
    uses: ['Banhos e cozinha em casa', 'Alojamentos', 'Restaurantes e lavandarias'],
    askUs: [
      'Quantas pessoas usam água quente',
      'Se a rede de água tem pressão',
      'Tipo de cobertura: laje ou telha',
    ],
    categories: ['termoacumuladores', 'acessorios'],
  },
]

export type CategoryId =
  | 'paineis'
  | 'inversores'
  | 'baterias'
  | 'bombas-superficie'
  | 'bombas-submersiveis'
  | 'bombas-solares'
  | 'termoacumuladores'
  | 'acessorios'

export const categories: { id: CategoryId; name: string; solution: SolutionId; text: string }[] = [
  { id: 'paineis', name: 'Painéis solares', solution: 'energia-solar', text: 'Módulos fotovoltaicos.' },
  { id: 'inversores', name: 'Inversores', solution: 'energia-solar', text: 'Conversão e gestão da energia.' },
  { id: 'baterias', name: 'Baterias', solution: 'energia-solar', text: 'Armazenamento para a noite.' },
  { id: 'bombas-superficie', name: 'Bombas de superfície', solution: 'bombagem', text: 'Pressão para a rede da casa.' },
  { id: 'bombas-submersiveis', name: 'Bombas submersíveis', solution: 'bombagem', text: 'Extração de furos e poços.' },
  { id: 'bombas-solares', name: 'Bombas solares', solution: 'bombagem', text: 'Alimentadas por painéis.' },
  { id: 'termoacumuladores', name: 'Termoacumuladores', solution: 'aquecimento-solar', text: 'Água quente solar.' },
  { id: 'acessorios', name: 'Acessórios', solution: 'energia-solar', text: 'Cabos, estruturas, motores.' },
]

export const faqs = [
  {
    q: 'Qual é a diferença entre solar fotovoltaico e solar térmico?',
    a: 'O fotovoltaico usa painéis para produzir eletricidade. O térmico usa tubos ou coletores para aquecer água, que fica guardada num termoacumulador. São sistemas diferentes e podem existir na mesma casa.',
  },
  {
    q: 'Preciso de baterias?',
    a: 'Só se quiser usar energia solar quando não há sol, à noite ou durante falhas de rede. Sem baterias, o sistema alimenta o consumo durante o dia.',
  },
  {
    q: 'Bomba de superfície, submersível ou solar?',
    a: 'A de superfície dá pressão à água que já tem (por exemplo, de um depósito). A submersível trabalha dentro do furo ou poço. A solar é uma bomba alimentada diretamente por painéis, útil onde não há rede ou para rega durante o dia.',
  },
  {
    q: 'O que devo indicar no pedido de cotação?',
    a: 'O local, o uso (casa, comércio, agricultura), o prazo e o que souber sobre o consumo: aparelhos e horas de uso, profundidade do furo, número de pessoas em casa. Com isso preparamos uma proposta adequada.',
  },
]
