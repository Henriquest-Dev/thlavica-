import { Link } from 'react-router-dom'
import { SEGMENTS } from '../data/segments'
import { categoryById } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Solutions() {
  usePageMeta('Soluções', 'Soluções Tlhavika para casas, empresas, agricultura, abastecimento de água, compra a grosso e fornecedores.')
  return (
    <div className="page">
      <header className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Localização">
            <Link to="/">Início</Link> <span aria-hidden="true">/</span> <span aria-current="page">Soluções</span>
          </nav>
          <h1 className="page-title">Soluções</h1>
          <p className="page-lede">Energia solar e água para cada contexto. Cada proposta é preparada a partir do seu consumo, local e necessidades.</p>
          <nav className="chips" aria-label="Nesta página">
            {SEGMENTS.map((s) => (
              <a key={s.id} className="chip" href={`#${s.id}`}>
                {s.titulo}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <div className="container solutions">
        {SEGMENTS.map((s) => (
          <section key={s.id} id={s.id} className={`solution solution--${s.tone}`} aria-labelledby={`${s.id}-t`}>
            <div className="solution__head">
              <h2 id={`${s.id}-t`}>{s.titulo}</h2>
              <p>{s.resumo}</p>
            </div>
            <div className="solution__body">
              <ul className="ticks">
                {s.detalhe.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              {s.categorias.length > 0 && (
                <ul className="chips">
                  {s.categorias.map((c) => (
                    <li key={c}>
                      <Link className="chip" to={`/catalogo?categoria=${c}`}>
                        {categoryById(c)?.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link className="btn btn--primary" to={s.cta.to}>
                {s.cta.label}
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
