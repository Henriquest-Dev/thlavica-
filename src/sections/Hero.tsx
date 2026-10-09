import { useState } from 'react'
import { Link } from 'react-router-dom'
import { img } from '../lib/asset'
import { useMatch } from '../lib/useMatch'
import { Arrow } from '../components/Arrow'
import { solutions, type SolutionId } from '../data/site'

/** Palavra grande de cada solução (à maneira dos números da referência). */
const WORD: Record<SolutionId, string> = {
  'energia-solar': 'Solar',
  bombagem: 'Bombas',
  'aquecimento-solar': 'Água quente',
}

const ALT =
  'Tlhavika Dongyin: tudo em energia solar num só lugar. Painéis solares, termoacumuladores solares, inversores, baterias de lítio e equipamento para soluções completas de energia solar. Marcas: Growatt, LuxPower, Sungrow, Veichi, JA Solar, Deye, Dyness, Hanchu ESS e Canadian Solar.'

/** Telemóvel: o cartaz é largo, por isso mostra-se com a altura certa e desliza-se para o lado. */
function MobileBanner() {
  const [moved, setMoved] = useState(false)
  return (
    <div className="hero__m">
      <div className="hero__mtrack" onScroll={() => setMoved(true)}>
        <img src={img('banner-1877')} alt={ALT} width={1877} height={838} fetchPriority="high" />
      </div>
      {!moved && (
        <span className="hero__mhint" aria-hidden="true">
          Deslize →
        </span>
      )}
    </div>
  )
}

/**
 * Início: o cartaz da Tlhavika ocupa a largura toda; por baixo, o título,
 * o pedido de cotação e as três áreas (entram em sequência e reagem ao rato).
 */
export function Hero() {
  const mobile = useMatch('(max-width: 760px)')
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__banner">
        {mobile ? (
          <MobileBanner />
        ) : (
          <img
            className="hero__img"
            src={img('banner-1877')}
            srcSet={`${img('banner-800')} 800w, ${img('banner-1200')} 1200w, ${img('banner-1877')} 1877w`}
            sizes="100vw"
            alt={ALT}
            width={1877}
            height={838}
            fetchPriority="high"
          />
        )}
        <nav className="hero__band" aria-label="Áreas de trabalho">
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

      <div className="hero__body wrap">
        <div className="hero__text">
          <h1 id="hero-title" className="hero__title">
            Energia do sol, água onde precisa
          </h1>
          <div className="hero__side">
            <p className="hero__lead">Painéis, inversores, baterias, bombas de água e termoacumuladores solares para casas, negócios e machambas.</p>
            <div className="hero__ctas">
              <Link to="/contacto" className="pill pill--light">
                Pedir cotação
                <span className="pill__icon">
                  <Arrow size={14} />
                </span>
              </Link>
              <Link to="/produtos" className="pill pill--ghost">
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
