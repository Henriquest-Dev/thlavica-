import type { CategoryId } from '../data/site'

/**
 * Ajudas para o painel de produtos: tipos de produto (um clique escolhe a categoria e põe as especificações
 * certas) e nomes de especificações para sugerir. O texto das especificações é livre.
 */

export interface ProductType {
  id: string
  label: string
  category: CategoryId
  /** Especificações com que o produto novo começa (só os nomes; o valor preenche-se). */
  specs: string[]
  /** Exemplo de valor, para ajudar a escrever. */
  example: Record<string, string>
}

export const PRODUCT_TYPES: ProductType[] = [
  { id: 'painel', label: 'Painel solar', category: 'paineis', specs: ['Potência', 'Tecnologia', 'Dimensões', 'Peso', 'Garantia'], example: { Potência: '625 W', Tecnologia: 'Bifacial', Dimensões: '2382 × 1134 mm' } },
  { id: 'inversor', label: 'Inversor ou bateria', category: 'inversores', specs: ['Potência', 'Tensão', 'Tipo'], example: { Potência: '3000 W', Tensão: '24 V' } },
  { id: 'sub', label: 'Bomba submersível', category: 'bombas-submersiveis', specs: ['Potência', 'Alimentação', 'Caudal', 'Altura', 'Altura máx.', 'Imersão máx.', 'Peso'], example: { Potência: '2,2 kW (3 HP)', Alimentação: '380–415 V, 50 Hz, trifásica', Caudal: '90 / 180 / 270 L/min', Altura: '68 / 52 / 21 m' } },
  { id: 'solar', label: 'Bomba solar', category: 'bombas-solares', specs: ['Potência', 'Alimentação', 'Caudal', 'Altura', 'Altura máx.', 'Peso'], example: { Potência: '1500 W (2 HP)', Alimentação: 'DC 160–240 V', Caudal: '20 / 40 / 60 L/min', Altura: '139 / 109 / 71 m' } },
  { id: 'superficie', label: 'Bomba de superfície', category: 'bombas-superficie', specs: ['Potência', 'Alimentação', 'Altura máx.', 'Caudal máx.'], example: { Potência: '0,75 kW (1 HP)', 'Altura máx.': '70 m' } },
  { id: 'parte', label: 'Parte hidráulica', category: 'partes-hidraulicas', specs: ['Código', 'Motor a usar', 'Caudal', 'Altura', 'Altura máx.'], example: { Código: '4SD6/15', 'Motor a usar': '1,5 kW (2 HP), 4"', Caudal: '40 / 80 / 120 L/min', Altura: '100 / 83 / 52 m' } },
  { id: 'motor', label: 'Motor submersível', category: 'motores', specs: ['Código', 'Potência', 'Alimentação', 'Corrente', 'Peso'], example: { Código: '150380M', Potência: '1,5 kW (2 HP)', Alimentação: '380 V, 50 Hz, trifásico', Corrente: '3,9 A' } },
  { id: 'termo', label: 'Termoacumulador', category: 'termoacumuladores', specs: ['Capacidade', 'Tipo'], example: { Capacidade: '200 L', Tipo: 'Alta pressão' } },
  { id: 'acessorio', label: 'Motor, controlador ou outro', category: 'acessorios', specs: ['Potência', 'Alimentação'], example: { Potência: '2,2 kW', Alimentação: '380–415 V' } },
]

/** Nomes de especificações a sugerir, por categoria (a primeira lista é a mais usada). */
const BASE = ['Potência', 'Alimentação', 'Peso', 'Garantia', 'Dimensões', 'Cor']
export const SPEC_SUGGESTIONS: Record<CategoryId, string[]> = {
  paineis: ['Potência', 'Tecnologia', 'Dimensões', 'Peso', 'Eficiência', 'Garantia'],
  inversores: ['Potência', 'Tensão', 'Tipo', 'Bateria', 'Painéis', 'Eficiência', ...BASE.slice(2)],
  baterias: ['Capacidade', 'Tensão', 'Tecnologia', 'Ciclos de vida', 'Peso', 'Garantia'],
  'bombas-superficie': ['Potência', 'Alimentação', 'Altura máx.', 'Caudal máx.', 'Entrada / saída', 'Peso'],
  'bombas-submersiveis': ['Potência', 'Alimentação', 'Caudal', 'Altura', 'Caudal máx.', 'Altura máx.', 'Imersão máx.', 'Água até', 'Rotação', 'Saída', 'Peso'],
  'bombas-solares': ['Potência', 'Alimentação', 'Caudal', 'Altura', 'Caudal máx.', 'Altura máx.', 'Imersão máx.', 'Saída', 'Peso'],
  'partes-hidraulicas': ['Código', 'Motor a usar', 'Caudal', 'Altura', 'Altura máx.', 'Frequência'],
  motores: ['Código', 'Potência', 'Alimentação', 'Corrente', 'Rendimento', 'Comprimento', 'Peso'],
  termoacumuladores: ['Capacidade', 'Tipo', 'Pressão', 'Tubos', 'Material do depósito', 'Garantia'],
  acessorios: ['Potência', 'Alimentação', 'Corrente', 'Proteção', 'Rotação', 'Imersão máx.', 'Água até', 'Peso', 'Cor'],
}

export const exampleFor = (typeId: string | undefined, label: string): string => PRODUCT_TYPES.find((t) => t.id === typeId)?.example[label] ?? ''
export const typeOfCategory = (c: CategoryId): ProductType | undefined => PRODUCT_TYPES.find((t) => t.category === c)
