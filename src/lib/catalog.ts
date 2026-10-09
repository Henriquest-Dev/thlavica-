import { useMemo } from 'react'
import { products as base, type Product } from '../data/products'
import type { CatalogOverride, CustomProduct } from '../data/admin'
import { useStored } from './store'
import { asset } from './asset'

const NO_CUSTOM: CustomProduct[] = []
const NO_OVERRIDES: Record<string, CatalogOverride> = {}

export type CatalogProduct = Product & { custom?: boolean; imgData?: string; hidden?: boolean; edited?: boolean }

/** Catálogo = produtos de origem + produtos criados no painel, com as edições aplicadas. */
export function useCatalog(includeHidden = false): CatalogProduct[] {
  const [custom] = useStored<CustomProduct[]>('catalog.custom', NO_CUSTOM)
  const [over] = useStored<Record<string, CatalogOverride>>('catalog.overrides', NO_OVERRIDES)
  return useMemo(() => {
    const merged: CatalogProduct[] = base.map((p) => {
      const o = over[p.id]
      return o ? { ...p, ...o, id: p.id, edited: true } : p
    })
    const all = [...merged, ...custom]
    return includeHidden ? all : all.filter((p) => !p.hidden)
  }, [custom, over, includeHidden])
}

export function useProduct(id: string) {
  const list = useCatalog()
  return list.find((p) => p.id === id)
}

/** Endereço da imagem do produto (recorte do site, imagem enviada no painel ou nenhuma). */
export function productImage(p: CatalogProduct): string | undefined {
  if (p.imgData) return p.imgData
  if (p.img) return asset(`img/produtos/${p.img}.webp`)
  return undefined
}
