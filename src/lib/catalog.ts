import { useMemo } from 'react'
import { products as base, type Product } from '../data/products'
import type { CatalogOverride, CustomProduct } from '../data/admin'
import { useStored } from './store'
import { asset } from './asset'
import { cleanOptions } from './variants'

const NO_CUSTOM: CustomProduct[] = []
const NO_OVERRIDES: Record<string, CatalogOverride> = {}

export type CatalogProduct = Product & { custom?: boolean; imgData?: string; hidden?: boolean; edited?: boolean }

/** União pura: produtos de origem com as edições aplicadas, mais os criados no painel. */
export function mergeCatalog(baseList: Product[], custom: CustomProduct[], over: Record<string, CatalogOverride>, includeHidden = false): CatalogProduct[] {
  const merged: CatalogProduct[] = baseList.map((p) => {
    const o = over[p.id]
    const m = o ? { ...p, ...o, id: p.id, edited: true } : p
    // os dados das opções e da unidade vêm do servidor: só se aceita o que está bem formado
    return m.options || m.unit ? { ...m, options: cleanOptions(m.options), unit: m.unit === 'm' ? ('m' as const) : undefined } : m
  })
  const all = [...merged, ...custom]
  return includeHidden ? all : all.filter((p) => !p.hidden)
}

/** Catálogo do site (sem ocultos) ou do painel (`includeHidden`). */
export function useCatalog(includeHidden = false): CatalogProduct[] {
  const [custom] = useStored<CustomProduct[]>('catalog.custom', NO_CUSTOM)
  const [over] = useStored<Record<string, CatalogOverride>>('catalog.overrides', NO_OVERRIDES)
  return useMemo(() => mergeCatalog(base, custom, over, includeHidden), [custom, over, includeHidden])
}

export function useProduct(id: string) {
  const list = useCatalog()
  return list.find((p) => p.id === id)
}

/** Endereço da imagem do produto (recorte do site, imagem enviada no painel ou nenhuma). */
export function productImage(p: CatalogProduct, thumb = false): string | undefined {
  if (p.imgData) return p.imgData
  // miniatura (440 px, cerca de 10 KB) para listas e cartões; a página do produto usa a imagem inteira
  if (p.img) return asset(`img/produtos/${p.img}${thumb ? '-t' : ''}.webp`) + `?v=${__BUILD__}`
  return undefined
}
