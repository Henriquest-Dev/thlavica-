import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Sparkle } from 'lucide-react'
import { useProgress } from '../lib/useProgress'
import { img } from '../lib/asset'
import { Arrow } from '../components/Arrow'
import { SolutionIcon } from '../components/Icon'
import { solutions } from '../data/site'

/**
 * Hero com a composição da referência Solix: fotografia numa moldura de
 * cantos suaves, título à esquerda, cápsula com seta e recorte inferior
 * com as três soluções. Movimento subtil (referência Nicolai): aproximação
 * muito lenta e uma névoa leve. Ao descer, a moldura recua ligeiramente.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  return (
    <section ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="hero__sticky">
        <div className="hero__frame">
          <div className="hero__media">
            <img
              className="hero__img"
              src={img('hero', 1672)}
              srcSet={`${img('hero', 960)} 960w, ${img('hero', 1672)} 1672w`}
              sizes="100vw"
              alt="Paisagem com campo de painéis solares junto a um reservatório de água"
              fetchPriority="high"
            />
            <div className="hero__haze" aria-hidden="true" />
            <div className="hero__shade" aria-hidden="true" />
          </div>

          <div className="hero__content">
            <p className="hero__kicker">
              Energia solar e água em Moçambique <Sparkle size={14} strokeWidth={2} aria-hidden="true" />
            </p>
            <h1 id="hero-title" className="hero__title">
              Energia do sol, água onde precisa
            </h1>
            <p className="hero__lead">
              Painéis, inversores, baterias, bombas de água e termoacumuladores solares para casas, negócios e machambas.
            </p>
            <div className="hero__ctas">
              <Link to="/produtos" className="pill pill--light">
                Ver produtos
                <span className="pill__icon">
                  <Arrow size={14} />
                </span>
              </Link>
              <Link to="/contacto" className="pill pill--ghost">
                Pedir cotação
              </Link>
            </div>
          </div>

          <nav className="hero__band" aria-label="Soluções">
            {solutions.map((s) => (
              <Link key={s.id} to={`/solucoes/${s.id}`} className="hero__entry">
                <span className="hero__entry-icon">
                  <SolutionIcon name={s.icon} size={18} />
                </span>
                <span className="hero__entry-name">{s.name}</span>
                <span className="hero__entry-text">{s.short}</span>
              </Link>
            ))}
          </nav>
          <p className="hero__note">Imagem ilustrativa</p>
        </div>
      </div>
    </section>
  )
}
