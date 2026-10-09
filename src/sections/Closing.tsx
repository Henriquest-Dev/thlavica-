import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Ico } from '../components/Ico'
import { useProgress } from '../lib/useProgress'
import { img } from '../lib/asset'
import { Arrow } from '../components/Arrow'
import { wa } from '../data/site'

/** A imagem sobe e expande-se até ocupar o ecrã (fecho da referência Maya). */
export function Closing() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  return (
    <section ref={ref} className="cls" aria-labelledby="cls-title">
      <div className="cls__sticky">
        <div className="cls__frame">
          <img src={img('foto-17')} alt="" loading="lazy" />
          <div className="cls__shade" />
          <div className="cls__content">
            <p className="hero__kicker">Pedido de cotação</p>
            <h2 id="cls-title" className="cls__title">
              Diga-nos o que precisa. Ajudamos a escolher.
            </h2>
            <div className="hero__ctas">
              <Link to="/contacto" className="pill pill--light">
                Pedir cotação
                <span className="pill__icon">
                  <Arrow size={14} />
                </span>
              </Link>
              <a className="pill pill--ghost" href={wa('Olá Tlhavika, gostaria de uma cotação.')} target="_blank" rel="noopener noreferrer">
                <Ico name="whatsapp" size={18} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
