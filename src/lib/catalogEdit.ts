import type { CategoryId } from '../data/site'
import type { CatalogOverride, CustomProduct } from '../data/admin'
import { updateStored, uid } from './store'
import { useCatalog, type CatalogProduct } from './catalog'

/**
 * Edição do catálogo no painel.
 * Interface: `useCatalogEditor()` devolve a lista completa e cinco ações.
 * Quem chama não sabe se um produto é de origem (guarda-se só a diferença,
 * em `catalog.overrides`) ou criado no painel (`catalog.custom`).
 */

export interface ProductDraft {
  id: string
  isNew: boolean
  custom: boolean
  name: string
  brand: string
  model: string
  category: CategoryId
  summary: string
  featured: boolean
  hidden: boolean
  /** Preço em MZN, como o utilizador o escreve (vazio = sem preço). */
  price: string
  /** Desconto em % (0 = sem desconto) e último dia dele. */
  discount: number
  discountUntil: string
  specs: { label: string; value: string }[]
  /** Um item por linha. */
  includes: string
  /** Fotografias extra (até 4). */
  gallery: string[]
  imgData?: string
  /** Recorte de origem (só leitura, para pré-visualizar). */
  img: string
}

export const MAX_GALLERY = 4

const NO_CUSTOM: CustomProduct[] = []
const NO_OVER: Record<string, CatalogOverride> = {}

export const blankDraft = (): ProductDraft => ({
  id: 'c-' + uid(),
  isNew: true,
  custom: true,
  name: '',
  brand: '',
  model: '',
  category: 'paineis',
  summary: '',
  featured: false,
  hidden: false,
  price: '',
  discount: 0,
  discountUntil: '',
  specs: [{ label: 'Potência', value: '' }],
  includes: '',
  gallery: [],
  img: '',
})

export const draftFromProduct = (p: CatalogProduct): ProductDraft => ({
  id: p.id,
  isNew: false,
  custom: Boolean(p.custom),
  name: p.name,
  brand: p.brand ?? '',
  model: p.model ?? '',
  category: p.category,
  summary: p.summary,
  featured: Boolean(p.featured),
  hidden: Boolean(p.hidden),
  price: p.price ? String(p.price) : '',
  discount: p.discount ?? 0,
  discountUntil: p.discountUntil ?? '',
  specs: p.specs.length ? p.specs.map((s) => ({ ...s })) : [{ label: '', value: '' }],
  includes: (p.includes ?? []).join('\n'),
  gallery: [...(p.gallery ?? [])],
  imgData: p.imgData,
  img: p.img,
})

/** Campos limpos (aparados, sem especificações vazias) prontos a gravar. */
export function draftFields(d: ProductDraft) {
  const includes = d.includes.split('\n').map((x) => x.trim()).filter(Boolean)
  return {
    name: d.name.trim(),
    brand: d.brand.trim() || undefined,
    model: d.model.trim() || undefined,
    category: d.category,
    summary: d.summary.trim(),
    specs: d.specs.filter((s) => s.label.trim() && s.value.trim()).map((s) => ({ label: s.label.trim(), value: s.value.trim() })),
    includes: includes.length ? includes : undefined,
    gallery: d.gallery.filter(Boolean).slice(0, MAX_GALLERY).length ? d.gallery.filter(Boolean).slice(0, MAX_GALLERY) : undefined,
    featured: d.featured,
    hidden: d.hidden,
    imgData: d.imgData,
    ...priceFields(d),
  }
}

/** Preço e desconto limpos: aceita "15 500,50" ou "15500.5"; sem preço válido não grava nada. */
export function parsePrice(text: string): number | undefined {
  const t = text.replace(/\s/g, '').replace(/MZN|MT/gi, '')
  const n = Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t)
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : undefined
}

function priceFields(d: Pick<ProductDraft, 'price' | 'discount' | 'discountUntil'>) {
  const discount = Math.round(d.discount) >= 1 ? Math.min(90, Math.round(d.discount)) : undefined
  return {
    price: parsePrice(d.price),
    discount,
    discountUntil: discount && d.discountUntil ? d.discountUntil : undefined,
  }
}

export function useCatalogEditor() {
  const all = useCatalog(true)

  const setCustom = (fn: (l: CustomProduct[]) => CustomProduct[]) => updateStored('catalog.custom', NO_CUSTOM, fn)
  const setOver = (fn: (o: Record<string, CatalogOverride>) => Record<string, CatalogOverride>) => updateStored('catalog.overrides', NO_OVER, fn)

  return {
    all,
    /** Grava um rascunho; devolve false se a memória do navegador estiver cheia. */
    save(d: ProductDraft): boolean {
      const f = draftFields(d)
      if (d.custom) {
        const prod: CustomProduct = { ...f, id: d.id, img: d.img, source: 0, custom: true }
        return setCustom((l) => (l.some((x) => x.id === d.id) ? l.map((x) => (x.id === d.id ? prod : x)) : [prod, ...l]))
      }
      // num produto de origem só se guarda a diferença; "vazio" tem de ser escrito (um campo em falta repunha o valor de origem)
      const edit = { ...f, price: f.price ?? 0, discount: f.discount ?? 0, discountUntil: f.discountUntil ?? '', includes: f.includes ?? [], gallery: f.gallery ?? [], brand: f.brand ?? '', model: f.model ?? '' }
      return setOver((o) => ({ ...o, [d.id]: edit }))
    },
    /** Muda só o preço (edição rápida na lista). Texto vazio tira o preço. */
    setPrice(p: CatalogProduct, text: string): boolean {
      const price = parsePrice(text)
      if (p.custom) return setCustom((l) => l.map((x) => (x.id === p.id ? { ...x, price } : x)))
      return setOver((o) => ({ ...o, [p.id]: { ...o[p.id], price: price ?? 0 } }))
    },
    toggleHidden(p: CatalogProduct) {
      if (p.custom) setCustom((l) => l.map((x) => (x.id === p.id ? { ...x, hidden: !x.hidden } : x)))
      else setOver((o) => ({ ...o, [p.id]: { ...o[p.id], hidden: !p.hidden } }))
    },
    /** Só produtos criados no painel se eliminam. */
    remove(p: CatalogProduct) {
      if (p.custom) setCustom((l) => l.filter((x) => x.id !== p.id))
    },
    /** Repõe um produto de origem tal como estava. */
    reset(p: CatalogProduct) {
      setOver((o) => {
        const { [p.id]: _drop, ...rest } = o
        void _drop
        return rest
      })
    },
    /** Cria uma cópia oculta, para editar sem mexer no original. */
    duplicate(p: CatalogProduct) {
      const copy: CustomProduct = { ...p, id: 'c-' + uid(), name: `${p.name} (cópia)`, custom: true, hidden: true, source: 0 }
      delete (copy as Partial<CatalogProduct>).edited
      setCustom((l) => [copy, ...l])
    },
  }
}
