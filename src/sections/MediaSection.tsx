import { Link } from 'react-router-dom'
import { MediaCarousel } from '../components/MediaCarousel'
import { Arrow } from '../components/Arrow'

/** Fotografias e vídeos geridos no painel de administração. */
export function MediaSection() {
  return (
    <section className="media" aria-labelledby="media-title">
      <div className="wrap">
        <div className="media__head reveal">
          <h2 id="media-title" className="h2">
            No terreno
          </h2>
          <Link to="/aplicacoes" className="media__link">
            Ver aplicações <Arrow size={16} />
          </Link>
        </div>
      </div>
      <div className="reveal">
        <MediaCarousel />
      </div>
    </section>
  )
}
