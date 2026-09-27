import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../lib/useProgress'
import { asset, img } from '../lib/asset'
import { Arrow } from '../components/Arrow'
import { solutions } from '../data/site'

/**
 * No computador (referência Maya) a fotografia cresce e divide-se em três
 * painéis; em cada painel sobe, como uma cortina, o cartão da solução.
 * No telemóvel: cartões que se empilham ao descer.
 */
export function Solutions() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  return (
    <section ref={ref} className="sol" aria-labelledby="sol-title">
      <div className="sol__sticky">
        <h2 id="sol-title" className="sol__title">
          Três áreas de trabalho
        </h2>
        <div className="sol__stage">
          {solutions.map((s, i) => (
            <div key={s.id} className="sol__panel" style={{ '--k': i } as React.CSSProperties}>
              <div className="sol__inner">
                <div className="sol__face sol__front" style={{ backgroundImage: `url(${img('hero', 1672)})` }} aria-hidden="true" />
                <Link to={`/solucoes/${s.id}`} className={`sol__face sol__back scard scard--${i}`}>
                  <span className="scard__name">{s.name}</span>
                  <span className="scard__text">{s.short}</span>
                  <span className="scard__product">
                    <img src={asset(`img/produtos/${s.product}.webp`)} alt="" loading="lazy" />
                  </span>
                  <span className="scard__go">
                    Ver {s.name.toLowerCase()} <Arrow size={14} />
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
