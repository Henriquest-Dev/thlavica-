import { useState } from 'react'
import type { ProductImage as Img } from '../../data/products'

interface Props {
  image?: Img
  /** Recorte sem fundo em /img/recortes — preferido quando existe. */
  recorte?: string
  alt?: string
  sizes?: string
  eager?: boolean
  className?: string
}

/** Imagem de produto: recorte limpo sobre fundo neutro ou, sem recorte, a imagem da publicação. */
export function ProductImage({ image, recorte, alt, sizes = '(max-width: 600px) 50vw, 300px', eager, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  if (recorte && !failed) {
    return (
      <div className={`product-img product-img--cutout ${className}`}>
        <img
          src={`${import.meta.env.BASE_URL}img/recortes/${recorte}.webp`}
          alt={alt ?? image?.alt ?? ''}
          width={600}
          height={600}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }
  if (!image || failed) {
    return (
      <div className={`product-img product-img--missing ${className}`} role="img" aria-label="Fotografia do produto a disponibilizar">
        <span>Fotografia a disponibilizar</span>
      </div>
    )
  }
  const base = `${import.meta.env.BASE_URL}img/anuncios/${image.src}`
  return (
    <div className={`product-img ${className}`}>
      <img
        src={`${base}-414.webp`}
        srcSet={`${base}-240.webp 240w, ${base}-414.webp 414w`}
        sizes={sizes}
        width={414}
        height={414}
        alt={image.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
