import { Link } from 'react-router-dom'
import { img } from '../lib/asset'
import { useReveal } from '../lib/useReveal'
import { useSeo } from '../lib/seo'
import { PageHead } from '../components/PageHead'
import { PHOTOS } from '../data/site'

const USES = [
  { t: 'Casa', d: 'Energia para iluminação e eletrodomésticos, pressão nas torneiras e água quente para banhos.' },
  { t: 'Comércio', d: 'Lojas, escritórios e alojamentos que precisam de energia estável durante o dia e à noite.' },
  { t: 'Agricultura', d: 'Bombagem solar para rega e abeberamento, com depósitos elevados.' },
  { t: 'Instalação profissional', d: 'Instaladores e revendedores que precisam de equipamento e de apoio na escolha.' },
]

export default function Applications() {
  useSeo({
    title: 'Aplicações: casa, comércio e agricultura',
    description: 'Onde o equipamento solar e de água da Tlhavika é usado: energia para casas e negócios, bombagem solar para rega e abeberamento, água quente solar.',
    path: '/aplicacoes',
  })
  useReveal()
  return (
    <div className="page">
      <PageHead title="Aplicações" lead="Onde o equipamento solar e de água é usado, e o que resolve em cada caso." />
      <section className="wrap app__uses">
        {USES.map((u, i) => (
          <article key={u.t} className="reveal" style={{ '--d': `${i * 60}ms` } as React.CSSProperties}>
            <span className="muted">0{i + 1}</span>
            <h2 className="h3">{u.t}</h2>
            <p>{u.d}</p>
          </article>
        ))}
      </section>
      <section className="wrap">
        <ul className="app__photos">
          {PHOTOS.map((p) => (
            <li key={p.src} className="reveal">
              <img src={img(p.src)} alt={p.alt} width={414} height={414} loading="lazy" />
              <span>{p.caption}</span>
            </li>
          ))}
        </ul>
        <p className="fine">
          Fotografias publicadas pela Tlhavika na sua página. Local, cliente e características da instalação por confirmar.
        </p>
        <Link to="/contacto" className="pill pill--dark app__cta">
          Falar do meu caso
        </Link>
      </section>
    </div>
  )
}
