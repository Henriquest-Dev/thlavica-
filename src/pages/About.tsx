import { Link } from 'react-router-dom'
import { contact, solutions } from '../data/site'
import { useReveal } from '../lib/useReveal'
import { useMeta } from '../lib/useMeta'
import { PageHead } from '../components/PageHead'

export default function About() {
  useMeta('Sobre')
  useReveal()
  return (
    <div className="page">
      <PageHead
        kicker="Sobre"
        title="Tlhavika"
        lead="Empresa moçambicana ligada à energia solar e a soluções de água. Fornece painéis, inversores, baterias, bombas de água e termoacumuladores solares."
      />
      <section className="wrap about">
        <div className="reveal">
          <h2 className="sol__h">Áreas</h2>
          <ul className="sol__list">
            {solutions.map((s) => (
              <li key={s.id}>
                <Link to={`/solucoes/${s.id}`}>{s.name}</Link> — {s.short.toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal">
          <h2 className="sol__h">Contacto</h2>
          <p>
            {contact.phone}
            <br />
            {contact.email}
          </p>
          <Link to="/contacto" className="pill pill--dark">
            Contactar
          </Link>
        </div>
      </section>
    </div>
  )
}
