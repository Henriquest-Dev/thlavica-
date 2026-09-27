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
 * Hero com a composição da referência Solix: a fotografia ocupa o ecrã todo,
 * escurecida e desfocada fora de uma moldura branca fina; dentro da moldura
 * fica nítida. Menu dentro da moldura, título à esquerda, uma cápsula com
 * seta e, no canto inferior esquerdo, um recorte com as três soluções.
 * Movimento subtil (referência Nicolai): aproximação muito lenta e névoa leve.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  const src = img('hero', 1672)
  const srcSet = `${img('hero', 960)} 960w, ${img('hero', 1672)} 1672w`
  return (
    <section ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="hero__sticky">
        <div className="hero__media hero__media--outer" aria-hidden="true">
          <img className="hero__img" src={src} srcSet={srcSet} sizes="100vw" alt="" />
          <div className="hero__haze" />
        </div>

        <div className="hero__frame">
          <div className="hero__media hero__media--inner">
            <img
              className="hero__img"
              src={src}
              srcSet={srcSet}
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
            {solutions.map((s) => (
              <Link key={s.id} to={`/solucoes/${s.id}`} className="hero__stat">
                <span className="hero__stat-big">{WORD[s.id]}</span>
                <span className="hero__stat-text">{s.short}</span>
              </Link>
            ))}
          </nav>
        </div>

        <p className="hero__credit">Imagem ilustrativa</p>
      </div>
    </section>
  )
}
