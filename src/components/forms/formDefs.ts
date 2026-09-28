import { applications, categories, products } from '../../data/products'
import { isEmail, isNuit, isPhone } from '../../lib/validation'

export type FormKind = 'cotacao' | 'grosso' | 'fornecedor'

export interface FieldDef {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number' | 'url'
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  hint?: string
  autoComplete?: string
  validate?: (v: string) => string | null
  wide?: boolean
}

const phone: FieldDef = {
  name: 'telefone',
  label: 'Telefone / WhatsApp',
  type: 'tel',
  required: true,
  placeholder: '+258 8X XXX XXXX',
  autoComplete: 'tel',
  validate: (v) => (isPhone(v) ? null : 'Indique um número válido, por exemplo +258 84 123 4567.'),
}

const email = (required: boolean): FieldDef => ({
  name: 'email',
  label: 'Email',
  type: 'email',
  required,
  autoComplete: 'email',
  validate: (v) => (!v && !required ? null : isEmail(v) ? null : 'Indique um email válido.'),
})

const productOptions = [
  { value: 'solucao-completa', label: 'Solução completa / ainda não sei' },
  ...categories.map((c) => ({ value: `categoria:${c.id}`, label: `${c.nome} (categoria)` })),
  ...products.map((p) => ({ value: p.id, label: p.nome })),
]

export const FORMS: Record<FormKind, { titulo: string; resumo: string; campos: FieldDef[] }> = {
  cotacao: {
    titulo: 'Pedir cotação',
    resumo: 'Para casas, empresas e projetos agrícolas. Responderemos com uma proposta para o seu caso.',
    campos: [
      { name: 'produto', label: 'Produto ou solução', type: 'select', required: true, options: productOptions, wide: true },
      { name: 'nome', label: 'Nome', required: true, autoComplete: 'name' },
      phone,
      email(false),
      { name: 'local', label: 'Local (cidade / província)', required: true, placeholder: 'Ex.: Matola, Maputo', autoComplete: 'address-level2' },
      { name: 'quantidade', label: 'Quantidade', type: 'number', placeholder: 'Ex.: 1' },
      {
        name: 'prazo',
        label: 'Prazo',
        type: 'select',
        options: [
          { value: 'urgente', label: 'Urgente (esta semana)' },
          { value: '1-mes', label: 'Dentro de 1 mês' },
          { value: '3-meses', label: 'Dentro de 3 meses' },
          { value: 'sem-data', label: 'Sem data definida' },
        ],
      },
      {
        name: 'uso',
        label: 'Uso pretendido',
        type: 'select',
        required: true,
        options: applications.map((a) => ({ value: a.id, label: a.nome })),
      },
      {
        name: 'mensagem',
        label: 'Detalhes',
        type: 'textarea',
        placeholder: 'Ex.: consumo aproximado, profundidade do furo, número de pessoas em casa…',
        wide: true,
      },
    ],
  },
  grosso: {
    titulo: 'Compra a grosso',
    resumo: 'Para revendedores, empresas e projetos com volume. Indique o que precisa e com que regularidade.',
    campos: [
      { name: 'empresa', label: 'Empresa', required: true, autoComplete: 'organization' },
      {
        name: 'nuit',
        label: 'NUIT (opcional)',
        validate: (v) => (!v || isNuit(v) ? null : 'O NUIT tem 9 dígitos.'),
      },
      { name: 'nome', label: 'Pessoa de contacto', required: true, autoComplete: 'name' },
      phone,
      email(true),
      {
        name: 'produtos',
        label: 'Produtos / categorias de interesse',
        type: 'textarea',
        required: true,
        placeholder: 'Ex.: bombas submersíveis 3", painéis de 600 W+',
        wide: true,
      },
      { name: 'volume', label: 'Volume estimado', required: true, placeholder: 'Ex.: 50 unidades' },
      {
        name: 'periodicidade',
        label: 'Periodicidade',
        type: 'select',
        required: true,
        options: [
          { value: 'pontual', label: 'Compra pontual' },
          { value: 'mensal', label: 'Mensal' },
          { value: 'trimestral', label: 'Trimestral' },
          { value: 'anual', label: 'Anual / contrato' },
        ],
      },
      { name: 'destino', label: 'Destino da entrega', required: true, placeholder: 'Cidade / província' },
      { name: 'mensagem', label: 'Mensagem', type: 'textarea', wide: true },
    ],
  },
  fornecedor: {
    titulo: 'Fornecedores',
    resumo: 'Fabricantes e distribuidores que queiram apresentar produtos à Tlhavika.',
    campos: [
      { name: 'empresa', label: 'Empresa', required: true, autoComplete: 'organization' },
      { name: 'pais', label: 'País', autoComplete: 'country-name' },
      { name: 'nome', label: 'Pessoa de contacto', required: true, autoComplete: 'name' },
      email(true),
      { ...phone, required: false, label: 'Telefone', validate: (v) => (!v || isPhone(v) ? null : 'Indique um número com indicativo, ex.: +86 …') },
      { name: 'website', label: 'Website', type: 'url', placeholder: 'https://' },
      { name: 'marcas', label: 'Marcas e produtos', type: 'textarea', required: true, wide: true },
      { name: 'mensagem', label: 'Mensagem', type: 'textarea', required: true, wide: true },
    ],
  },
}

export const ALL_FIELD_NAMES = Array.from(
  new Set(Object.values(FORMS).flatMap((f) => f.campos.map((c) => c.name))),
)
