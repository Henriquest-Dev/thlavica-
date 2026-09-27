import { Link } from 'react-router-dom'
import { img } from '../lib/asset'
import { Arrow } from '../components/Arrow'

export const PHOTOS = [
  { src: 'foto-16', alt: 'Técnico junto a um termoacumulador solar Tlhavika num telhado de telha', caption: 'Termoacumulador em telhado de telha' },
  { src: 'foto-15', alt: 'Técnica ao lado de um termoacumulador solar Tlhavika numa laje', caption: 'Termoacumulador em laje' },
  { src: 'foto-17', alt: 'Termoacumulador solar Tlhavika com tubos de vácuo numa cobertura', caption: 'Tubos de vácuo e depósito' },
  { src: 'foto-34', alt: 'Vista aérea de uma torre com depósitos de água e painéis solares', caption: 'Depósitos elevados e painéis solares' },
]

/** Fotografias reais publicadas pela Tlhavika, em grelha editorial. */
export function Context() {
  return (
    <section className="ctx" aria-labelledby="ctx-title">
      <div className="wrap">
        <div className="ctx__head reveal">
          <h2 id="ctx-title" className="h2">
            No terreno
          </h2>
          <Link to="/aplicacoes" className="ctx__link">
            Aplicações <Arrow size={16} />
          </Link>
        </div>
        <ul className="ctx__grid">
          {PHOTOS.map((p, i) => (
            <li key={p.src} className="ctx__item reveal" style={{ '--d': `${i * 80}ms` } as React.CSSProperties}>
              <figure>
                <span className="ctx__img">
                  <img src={img(p.src)} alt={p.alt} loading="lazy" width={900} height={900} />
                </span>
                <figcaption>{p.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
