import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../lib/useProgress'
import { img } from '../lib/asset'
import { Arrow } from '../components/Arrow'
import { solutions } from '../data/site'

/**
 * Hero: composição da referência Solix (fotografia numa moldura de cantos
 * suaves sobre a mesma imagem desfocada, título à esquerda, faixa inferior)
 * com o movimento da referência Nicolai (aproximação lenta e névoa em duas
 * camadas). Ao fazer scroll, a moldura recolhe-se numa faixa e sobe (Maya).
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  return (
    <section ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="hero__sticky">
        <img className="hero__blur" src={img('hero-blur')} alt="" aria-hidden="true" />
        <div className="hero__dim" aria-hidden="true" />
        <div className="hero__frame">
          <div className="hero__media">
            <img
              className="hero__img"
              src={img('hero', 1672)}
              srcSet={`${img('hero', 960)} 960w, ${img('hero', 1672)} 1672w`}
              sizes="100vw"
              alt="Paisagem verde com campo de painéis solares junto a um reservatório de água"
              fetchPriority="high"
            />
            <div className="hero__mist hero__mist--1" aria-hidden="true" />
            <div className="hero__mist hero__mist--2" aria-hidden="true" />
            <div className="hero__shade" aria-hidden="true" />
          </div>

          <div className="hero__content">
            <p className="hero__kicker">Soluções solares em Moçambique</p>
            <h1 id="hero-title" className="hero__title">
              <span>Energia solar e água,</span>{' '}
              <span>do telhado ao furo</span>
            </h1>
            <p className="hero__lead">
              Painéis, inversores, baterias, bombas de água e termoacumuladores. Ajudamos a escolher o equipamento
              certo para o seu consumo.
            </p>
            <Link to="/contacto" className="pill pill--light">
              Pedir cotação
              <span className="pill__icon">
                <Arrow size={12} />
              </span>
            </Link>
          </div>

          <nav className="hero__band" aria-label="Soluções">
            {solutions.map((s) => (
              <Link key={s.id} to={`/solucoes/${s.id}`} className="hero__entry">
                <span className="hero__entry-n">{s.n}</span>
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
