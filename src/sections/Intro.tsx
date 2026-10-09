import { Link } from 'react-router-dom'

const STEPS = [
  { t: 'Diga-nos o que precisa', d: 'O local, o que quer alimentar ou bombear e o prazo.' },
  { t: 'Recebe uma proposta', d: 'Com os equipamentos certos para o seu caso e o preço na cotação.' },
  { t: 'Combinamos a entrega', d: 'Confirma a proposta e acertamos os próximos passos.' },
]

/** Apresentação e passos do pedido de cotação (aqui a numeração é uma sequência real). */
export function Intro() {
  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="wrap intro__grid">
        <div className="reveal">
          <h2 id="intro-title" className="intro__text">
            Tudo em energia solar, num só lugar: do painel à bomba de água, e ajuda para escolher o que serve o seu consumo.
          </h2>
          <Link to="/servicos#simuladores" className="intro__link">
            Estimar o que preciso
          </Link>
        </div>
        <ol className="intro__steps reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <span className="intro__n">{i + 1}</span>
              <span>
                <strong>{s.t}</strong>
                {s.d}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
