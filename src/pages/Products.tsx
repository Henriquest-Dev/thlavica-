import { Link, useSearchParams } from 'react-router-dom'
import { categories, models, wa, type CategoryId } from '../data/site'
import { useReveal } from '../lib/useReveal'
import { useMeta } from '../lib/useMeta'
import { PageHead } from '../components/PageHead'
import { Arrow } from '../components/Arrow'

export default function Products() {
  const [params, setParams] = useSearchParams()
  const cat = (params.get('categoria') ?? '') as CategoryId | ''
  const current = categories.find((c) => c.id === cat)
  useMeta(current ? current.name : 'Produtos')
  useReveal(cat)
  const list = cat ? models.filter((m) => m.category === cat) : models

  return (
    <div className="page">
      <PageHead
        kicker="Produtos"
        title={current ? current.name : 'Catálogo'}
        lead="Modelos anunciados pela Tlhavika. As fichas técnicas são enviadas com a cotação, depois de confirmadas a especificação e a disponibilidade."
      />
      <div className="wrap">
        <div className="tabs" role="tablist" aria-label="Categorias">
          <button role="tab" aria-selected={!cat} onClick={() => setParams({}, { replace: true })}>
            Todos
          </button>
          {categories.map((c) => (
            <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setParams({ categoria: c.id }, { replace: true })}>
              {c.name}
            </button>
          ))}
        </div>

        {list.length > 0 ? (
          <ul className="plist">
            {list.map((m) => (
              <li key={m.id} className="plist__row reveal">
                <span className="plist__cat">{categories.find((c) => c.id === m.category)?.name}</span>
                <span className="plist__name">
                  {m.name}
                  {m.brand && <span className="muted"> · {m.brand}</span>}
                </span>
                {m.verified && m.specs ? (
                  <span className="plist__specs">{m.specs.map((s) => `${s.label}: ${s.value}`).join(' · ')}</span>
                ) : (
                  <span className="plist__specs muted">Ficha técnica em confirmação</span>
                )}
                <a className="pill pill--line-dark pill--sm" href={wa(`Olá Tlhavika, gostaria de uma cotação para: ${m.name}${m.brand ? ` (${m.brand})` : ''}.`)} target="_blank" rel="noopener noreferrer">
                  Pedir cotação <Arrow size={12} />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty reveal">
            <p className="h3">Gama em atualização</p>
            <p className="muted">Ainda não publicámos modelos nesta categoria. Diga-nos o que procura.</p>
            <Link to={`/contacto?categoria=${cat}`} className="pill pill--dark">
              Pedir cotação
              <span className="pill__icon">
                <Arrow size={12} />
              </span>
            </Link>
          </div>
        )}
        <p className="fine">As marcas pertencem aos respetivos fabricantes. Preços e stock não são publicados no site.</p>
      </div>
    </div>
  )
}
