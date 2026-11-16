import { MediaCarousel } from '../components/MediaCarousel'
import { useMedia } from '../lib/promos'

/** Fotografias e vídeos do trabalho da empresa (geridos em Vídeos e fotos, no painel). Só aparece se houver itens ativos. */
export function Gallery() {
  const [items] = useMedia()
  if (!items.some((m) => m.ativo)) return null
  return (
    <section className="gal-sec" aria-labelledby="gal-title">
      <div className="wrap">
        <h2 id="gal-title" className="gal-sec__title">
          O nosso trabalho
        </h2>
        <p className="gal-sec__lead muted">Fotografias e vídeos de instalações e equipamentos.</p>
        <MediaCarousel />
      </div>
    </section>
  )
}
