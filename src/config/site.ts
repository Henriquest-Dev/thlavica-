/**
 * Dados institucionais editáveis.
 *
 * `confirmado: false` indica valores lidos em anúncios públicos que ainda têm de
 * ser confirmados pela Tlhavika antes da publicação.
 */

export interface ContactValue {
  valor: string
  confirmado: boolean
}

export const site = {
  nome: 'TLHAVIKA',
  descricao:
    'Soluções de energia solar e água em Moçambique: painéis, inversores, baterias, bombas de água, bombagem solar e termoacumuladores.',
  /** Substituir por ficheiro vetorial oficial (ex.: '/logo-tlhavika.svg'). Enquanto for null, usa-se o nome em texto. */
  logoSrc: null as string | null,
  /** Domínio final, via VITE_SITE_URL. Nunca inventado. */
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || '',

  contactos: {
    telefone: { valor: '+258 87 119 1481', confirmado: false } as ContactValue,
    telefoneAlternativo: { valor: '+258 84 635 2982', confirmado: false } as ContactValue,
    /** Apenas dígitos, com indicativo. Usado nos links wa.me. */
    whatsapp: { valor: '258871191481', confirmado: false } as ContactValue,
    email: { valor: 'Tlhavika.solar@gmail.com', confirmado: false } as ContactValue,
    morada: {
      valor: 'Av. de Moçambique, km 9,2 — Bairro do Zimpeto, Maputo',
      confirmado: false,
    } as ContactValue,
  },

  redes: {
    facebook: 'https://www.facebook.com/people/Tlhavika/61560557742444/',
  },

  /** Serviços só aparecem como afirmação quando confirmados pela empresa. */
  servicosConfirmados: {
    instalacao: false,
    assistenciaTecnica: false,
    entregaNacional: false,
  },
}

export const showUnverifiedSpecs = import.meta.env.VITE_SHOW_UNVERIFIED_SPECS !== 'false'

export function whatsappLink(texto: string): string {
  return `https://wa.me/${site.contactos.whatsapp.valor}?text=${encodeURIComponent(texto)}`
}

export function telLink(v: ContactValue): string {
  return `tel:${v.valor.replace(/\s+/g, '')}`
}
