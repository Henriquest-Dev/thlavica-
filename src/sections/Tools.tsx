import { Link } from 'react-router-dom'
import { Ico } from '../components/Ico'
import { Arrow } from '../components/Arrow'

/** Convite aos simuladores (a ferramenta completa está em Serviços). */
export function Tools() {
  return (
    <section className="tools" aria-labelledby="tools-title">
      <div className="wrap tools__grid">
        <div className="reveal">
          <h2 id="tools-title" className="h2">
            Faça as contas antes de pedir cotação
          </h2>
          <p className="tools__lead">Indique os aparelhos que usa ou a profundidade do furo e veja uma estimativa do que precisa. Leva dois minutos e segue já para o pedido.</p>
        </div>
        <ul className="tools__cards">
          <li className="reveal">
            <Link to="/servicos#simuladores">
              <Ico name="painel" size={44} />
              <span className="tools__name">Quantos painéis preciso?</span>
              <span className="tools__text">Escolha os aparelhos e veja painéis, inversor e bateria.</span>
              <span className="tools__go">
                Estimar <Arrow size={14} />
              </span>
            </Link>
          </li>
          <li className="reveal" style={{ '--d': '90ms' } as React.CSSProperties}>
            <Link to="/servicos#simuladores">
              <Ico name="submersivel" size={44} />
              <span className="tools__name">Que bomba preciso?</span>
              <span className="tools__text">Com a profundidade e a água por dia, veja caudal, altura e painéis.</span>
              <span className="tools__go">
                Estimar <Arrow size={14} />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
