import { useState } from 'react'

/**
 * Imagem de produto. Os recortes muito altos e estreitos (bombas submersíveis) ficavam quase invisíveis dentro do cartão:
 * quando a imagem é mais de 2,5 vezes mais alta do que larga, é posta na diagonal e ocupa o cartão todo.
 */
export function ProductPic({ src, alt, lazy = false }: { src: string; alt: string; lazy?: boolean }) {
  const [tall, setTall] = useState(false)
  return (
    <img
      src={src}
      alt={alt}
      loading={lazy ? 'lazy' : undefined}
      className={tall ? 'is-tall' : undefined}
      onLoad={(e) => setTall(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth * 2.5)}
    />
  )
}
