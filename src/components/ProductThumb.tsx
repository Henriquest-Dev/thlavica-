import { categoryPic } from '../data/site'
import { productImage, type CatalogProduct } from '../lib/catalog'
import { Ico } from './Ico'
import { ProductPic } from './ProductPic'

/** Miniatura do produto; sem imagem, mostra o pictograma da categoria. */
export function ProductThumb({ p, size = 56 }: { p: CatalogProduct; size?: number }) {
  const src = productImage(p, true)
  return (
    <span className="thumb" style={{ width: size, height: size }}>
      {src ? <ProductPic src={src} alt="" lazy plain /> : <Ico name={categoryPic(p.category)} size={size * 0.55} />}
    </span>
  )
}
