import { Link } from 'react-router-dom'
import { applications, applicationName, caseStudies } from '../data/products'
import { EmptyState } from '../components/States'
import { usePageMeta } from '../hooks/usePageMeta'

const APP_TEXT: Record<string, string> = {
  residencial: 'Sistemas fotovoltaicos, água quente solar e pressurização para habitações.',
  empresas: 'Energia e água para comércio, serviços e alojamento.',
  agricola: 'Bombagem solar para rega e abeberamento em machambas.',
  abastecimento: 'Extração em furos, depósitos elevados e distribuição.',
  drenagem: 'Escoamento de água em zonas alagadas.',
}

export default function Projects() {
  usePageMeta('Projetos e aplicações', 'Aplicações das soluções Tlhavika em casas, empresas, agricultura e abastecimento de água.')
  return (
    <div className="page">
      <header className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Localização">
            <Link to="/">Início</Link> <span aria-hidden="true">/</span> <span aria-current="page">Projetos</span>
          </nav>
          <h1 className="page-title">Projetos e aplicações</h1>
          <p className="page-lede">Onde os nossos equipamentos são utilizados.</p>
        </div>
      </header>
      <div className="container">
        <ul className="app-grid">
          {applications.map((a) => (
            <li key={a.id} className="app-card">
              <h2>{a.nome}</h2>
              <p>{APP_TEXT[a.id]}</p>
              <Link className="link-arrow" to={`/catalogo?aplicacao=${a.id}`}>
                Ver produtos
              </Link>
            </li>
          ))}
        </ul>

        <section className="section section--flush" aria-labelledby="cases-title">
          <h2 id="cases-title" className="section-title section-title--sm">
            Estudos de caso
          </h2>
          {caseStudies.length > 0 ? (
            <ul className="case-grid">
              {caseStudies.map((c) => (
                <li key={c.id} className="case-card">
                  {c.imagem && <img src={c.imagem} alt="" loading="lazy" />}
                  <p className="product-card__cat">
                    {applicationName(c.aplicacao)} · {c.local}
                  </p>
                  <h3>{c.titulo}</h3>
                  <p>{c.descricao}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Estudos de caso em preparação"
              text="Vamos publicar aqui projetos concluídos, com autorização dos clientes. Entretanto, conte-nos o seu projeto."
            >
              <Link className="btn btn--primary" to="/contacto?tipo=cotacao">
                Falar do meu projeto
              </Link>
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  )
}
