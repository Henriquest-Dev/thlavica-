import { Link } from 'react-router-dom'
import { solutions } from '../data/site'
import { useReveal } from '../lib/useReveal'
import { useMeta } from '../lib/useMeta'
import { PageHead } from '../components/PageHead'
import { Simulators } from '../components/Simulators'
import { Ico } from '../components/Ico'
import { Arrow } from '../components/Arrow'

export default function Services() {
  useMeta('Serviços', 'Energia solar, bombas de água e aquecimento solar: o que a Tlhavika fornece e simuladores para estimar o que precisa.')
  useReveal()
  return (
    <div className="page">
      <PageHead kicker="Serviços" title="O que fornecemos e como ajudamos a escolher" lead="Três áreas de trabalho e duas ferramentas para estimar o que precisa antes de pedir cotação." />

      <section className="wrap svc" aria-label="Áreas de trabalho">
        {solutions.map((s) => (
          <article key={s.id} className="svc__row reveal">
            <Ico name={s.pic} size={56} className="svc__ico" />
            <div className="svc__main">
              <h2 className="h3">{s.name}</h2>
              <p>{s.lead}</p>
            </div>
            <ul className="svc__list">
              {s.includes.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <Link to={`/solucoes/${s.id}`} className="svc__go">
              Ver equipamento <Arrow size={14} />
            </Link>
          </article>
        ))}
      </section>

      <section id="simuladores" className="wrap svc__sims" aria-labelledby="sims-title">
        <div className="reveal">
          <h2 id="sims-title" className="h2">
            Simuladores
          </h2>
          <p className="svc__lead">Valores orientativos para preparar o pedido. A proposta final depende do local e da ficha técnica dos equipamentos.</p>
        </div>
        <Simulators />
      </section>
    </div>
  )
}
