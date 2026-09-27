import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../lib/useProgress'
import { asset, img } from '../lib/asset'
import { Arrow } from '../components/Arrow'
import { SolutionIcon } from '../components/Icon'
import { solutions } from '../data/site'

/**
 * "Por onde quer começar?" — no computador (referência Maya) a fotografia
 * cresce, divide-se em três painéis e cada painel vira para mostrar uma
 * solução com o seu produto. No telemóvel: cartões que se empilham.
 */
export function Solutions() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  return (
    <section ref={ref} className="sol" aria-labelledby="sol-title">
      <div className="sol__sticky">
        <div className="sol__head">
          <p className="eyebrow">Soluções</p>
          <h2 id="sol-title" className="sol__title">
            Por onde quer começar?
          </h2>
        </div>
        <div className="sol__stage">
          {solutions.map((s, i) => (
            <div key={s.id} className="sol__panel" style={{ '--k': i } as React.CSSProperties}>
              <div className="sol__inner">
                <div className="sol__face sol__front" style={{ backgroundImage: `url(${img('hero', 1672)})` }} aria-hidden="true" />
                <Link to={`/solucoes/${s.id}`} className={`sol__face sol__back scard scard--${i}`}>
                  <span className="scard__top">
                    <span className="scard__icon">
                      <SolutionIcon name={s.icon} size={20} />
                    </span>
                    <span className="scard__n">{s.n}</span>
                  </span>
                  <span className="scard__product">
                    <img src={asset(`img/produtos/${s.product}.webp`)} alt="" loading="lazy" />
                  </span>
                  <span className="scard__name">{s.name}</span>
                  <span className="scard__text">{s.short}</span>
                  <span className="scard__go">
                    Ver solução <Arrow size={14} />
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
