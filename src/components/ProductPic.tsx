import { useEffect, useRef, useState } from 'react'

/**
 * Imagem de produto, com animação de carregamento: enquanto a imagem não chega aparece um brilho a deslizar
 * (no cartão ou na moldura que a contém) e, quando chega, ela surge com um fade suave.
 * Os recortes muito altos e estreitos (bombas submersíveis) são postos na diagonal para ocuparem o cartão;
 * `plain` desliga isso (miniaturas).
 */
export function ProductPic({ src, alt, lazy = false, photo = false, plain = false }: { src: string; alt: string; lazy?: boolean; photo?: boolean; plain?: boolean }) {
  const [tall, setTall] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  // imagem que já estava na memória (ou veio na página pré-construída): não há "onLoad" a esperar
  useEffect(() => {
    setLoaded(false)
    const el = ref.current
    if (el?.complete && el.naturalWidth > 0) {
      setTall(el.naturalHeight > el.naturalWidth * 3.5)
      setLoaded(true)
    }
  }, [src])

  const cls = [!plain && (photo ? 'is-photo' : tall ? 'is-tall' : ''), 'pic', loaded ? 'is-loaded' : ''].filter(Boolean).join(' ')
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={lazy ? 'lazy' : undefined}
      decoding="async"
      className={cls}
      onLoad={(e) => {
        setTall(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth * 3.5)
        setLoaded(true)
      }}
      onError={() => setLoaded(true)}
    />
  )
}
