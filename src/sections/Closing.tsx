import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../lib/useProgress'
import { img } from '../lib/asset'
import { Arrow } from '../components/Arrow'
import { contact, wa } from '../data/site'

/** A imagem sobe do fundo e expande-se até ocupar o ecrã (fecho da referência Maya). */
export function Closing() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  return (
    <section ref={ref} className="cls" aria-labelledby="cls-title">
      <div className="cls__sticky">
        <div className="cls__frame">
          <img src={img('agua', 1672)} srcSet={`${img('agua', 960)} 960w, ${img('agua', 1672)} 1672w`} sizes="100vw" alt="" loading="lazy" />
          <div className="cls__shade" />
          <div className="cls__content">
            <p className="hero__kicker">Pedido de cotação</p>
            <h2 id="cls-title" className="cls__title">
              Conte-nos o que precisa. <em>Nós ajudamos a dimensionar.</em>
            </h2>
            <div className="cls__ctas">
              <Link to="/contacto" className="pill pill--light">
                Pedir cotação
                <span className="pill__icon">
                  <Arrow size={12} />
                </span>
              </Link>
              <a className="pill pill--ghost" href={wa('Olá Tlhavika, gostaria de uma cotação.')} target="_blank" rel="noopener noreferrer">
                WhatsApp {contact.phone}
              </a>
            </div>
          </div>
          <p className="hero__note">Imagem ilustrativa</p>
        </div>
      </div>
    </section>
  )
}
