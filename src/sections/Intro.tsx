import { Link } from 'react-router-dom'
import { contact, wa } from '../data/site'
import { products } from '../data/products'

/** Apresentação curta e factual: quem é, onde está, como se pede. */
export function Intro() {
  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="wrap intro__grid">
        <h2 id="intro-title" className="intro__text reveal">
          Equipamento solar e bombas de água, escolhido a partir do que a sua casa, loja ou machamba realmente consome.
        </h2>
        <div className="intro__side reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
          <p>
            A Tlhavika fornece painéis, inversores, baterias, bombas e termoacumuladores solares. Diga-nos o que precisa de alimentar ou
            bombear e preparamos uma proposta.
          </p>
          <dl className="intro__facts">
            <div>
              <dt>Morada</dt>
              <dd>{contact.address}</dd>
            </div>
            <div>
              <dt>Pedidos</dt>
              <dd>
                <a href={wa('Olá Tlhavika, gostaria de uma cotação.')} target="_blank" rel="noopener noreferrer">
                  WhatsApp {contact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt>Catálogo</dt>
              <dd>
                <Link to="/produtos">Ver os {products.length} produtos</Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
