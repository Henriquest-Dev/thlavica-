import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../lib/useProgress'
import { img } from '../lib/asset'
import { Arrow } from '../components/Arrow'
import { solutions } from '../data/site'

/**
 * "Por onde quer começar?": uma imagem cresce, divide-se em três painéis,
 * os painéis rodam e tornam-se três cartões — um por solução (referência Maya).
 */
export function Paths() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  return (
    <section ref={ref} className="paths" aria-labelledby="paths-title">
      <div className="paths__sticky">
        <h2 id="paths-title" className="paths__title">
          Por onde quer <em>começar?</em>
        </h2>
        <div className="paths__stage">
          {solutions.map((s, i) => (
            <div key={s.id} className={`panel panel--${i}`} style={{ '--k': i } as React.CSSProperties}>
              <div className="panel__inner">
                <div className="panel__face panel__front" style={{ backgroundImage: `url(${img('agua', 1672)})` }} aria-hidden="true" />
                <Link to={`/solucoes/${s.id}`} className={`panel__face panel__back card card--${i}`}>
                  <span className="card__img">
                    <img src={img(s.image, s.image.startsWith('foto') ? undefined : 960)} alt="" loading="lazy" />
                  </span>
                  <span className="card__n">{s.n}</span>
                  <span className="card__name">{s.name}</span>
                  <span className="card__text">{s.short}</span>
                  <span className="card__go">
                    Ver solução <Arrow size={12} />
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
