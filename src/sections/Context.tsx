import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../lib/useProgress'
import { img } from '../lib/asset'

export const PHOTOS = [
  { src: 'foto-16', alt: 'Técnico junto a um termoacumulador solar num telhado de telha', caption: 'Termoacumulador solar em cobertura de telha' },
  { src: 'foto-15', alt: 'Técnica a instalar um termoacumulador solar numa laje', caption: 'Instalação de termoacumulador em laje' },
  { src: 'foto-17', alt: 'Termoacumulador solar com tubos de vácuo numa cobertura', caption: 'Tubos de vácuo e depósito' },
  { src: 'foto-34', alt: 'Vista aérea de uma torre com depósitos de água e painéis solares', caption: 'Depósitos elevados e painéis solares' },
]

/** Título grande que encolhe e dá lugar às fotografias (referência Maya, "Featured work"). */
export function Context() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  return (
    <section ref={ref} className="ctx" aria-labelledby="ctx-title">
      <div className="ctx__sticky">
        <h2 id="ctx-title" className="ctx__title">
          Em <em>contexto</em>
        </h2>
        <ul className="ctx__row">
          {PHOTOS.map((p, i) => (
            <li key={p.src} className="ctx__item" style={{ '--k': i } as React.CSSProperties}>
              <img src={img(p.src)} alt={p.alt} loading="lazy" width={414} height={414} />
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
