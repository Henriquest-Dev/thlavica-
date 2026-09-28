import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../lib/useProgress'
import { img } from '../lib/asset'

export const PHOTOS = [
  { src: 'foto-16', alt: 'Técnico junto a um termoacumulador solar Tlhavika num telhado de telha', caption: 'Termoacumulador em telhado de telha' },
  { src: 'foto-15', alt: 'Técnica ao lado de um termoacumulador solar Tlhavika numa laje', caption: 'Termoacumulador em laje' },
  { src: 'foto-17', alt: 'Termoacumulador solar Tlhavika com tubos de vácuo numa cobertura', caption: 'Tubos de vácuo e depósito' },
  { src: 'foto-34', alt: 'Vista aérea de uma torre com depósitos de água e painéis solares', caption: 'Depósitos elevados e painéis solares' },
]

/** "Em contexto": título grande que encolhe e dá lugar às fotografias (referência Maya). */
export function Context() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  return (
    <section ref={ref} className="ctx" aria-labelledby="ctx-title">
      <div className="ctx__sticky">
        <h2 id="ctx-title" className="ctx__title">
          Em contexto
        </h2>
        <ul className="ctx__row">
          {PHOTOS.map((p, i) => (
            <li key={p.src} className="ctx__item" style={{ '--k': i } as React.CSSProperties}>
              <img src={img(p.src)} alt={p.alt} loading="lazy" width={900} height={900} />
              <span>{p.caption}</span>
            </li>
          ))}
        </ul>
        <p className="ctx__note">
          Fotografias publicadas pela Tlhavika. <Link to="/aplicacoes">Ver aplicações</Link>
        </p>
      </div>
    </section>
  )
}
