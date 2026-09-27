import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../lib/useProgress'
import { img } from '../lib/asset'
import { Arrow } from '../components/Arrow'
import { solutions, type SolutionId } from '../data/site'

/** Palavra grande de cada solução no recorte inferior (à maneira dos números da referência). */
const WORD: Record<SolutionId, string> = {
  'energia-solar': 'Solar',
  bombagem: 'Bombas',
  'aquecimento-solar': 'Água quente',
}

/**
 * Hero com a composição da referência Solix: fotografia a ocupar a secção
 * toda, menu por cima, título à esquerda, uma cápsula com seta e, no canto
 * inferior esquerdo, um recorte com as três soluções (entram em sequência
 * e reagem ao passar o rato). Movimento subtil (referência Nicolai):
 * aproximação muito lenta e névoa leve.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  return (
    <section ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="hero__sticky">
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
          <p className="hero__kicker">Energia solar e água em Moçambique</p>
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
          </div>
        </div>

        <nav className="hero__band" aria-label="Soluções">
          {solutions.map((s, i) => (
            <Link key={s.id} to={`/solucoes/${s.id}`} className="hero__stat" style={{ '--i': i } as React.CSSProperties}>
              <span className="hero__stat-big">
                {WORD[s.id]}
                <span className="hero__stat-arrow" aria-hidden="true">
                  <Arrow size={14} />
                </span>
              </span>
              <span className="hero__stat-text">{s.short}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
