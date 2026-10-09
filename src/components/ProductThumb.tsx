import { categoryPic } from '../data/site'
import { productImage, type CatalogProduct } from '../lib/catalog'
import { Ico } from './Ico'

/** Miniatura do produto; sem imagem, mostra o pictograma da categoria. */
export function ProductThumb({ p, size = 56 }: { p: CatalogProduct; size?: number }) {
  const src = productImage(p)
  return (
    <span className="thumb" style={{ width: size, height: size }}>
      {src ? <img src={src} alt="" loading="lazy" /> : <Ico name={categoryPic(p.category)} size={size * 0.55} />}
    </span>
  )
}
