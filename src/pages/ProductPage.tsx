import { Link, useParams } from 'react-router-dom'
import { categories, categoryPic, wa } from '../data/site'
import { productImage, useCatalog } from '../lib/catalog'
import { useMeta } from '../lib/useMeta'
import { useReveal } from '../lib/useReveal'
import { AddToList, ProductCard } from '../components/ProductCard'
import { Ico } from '../components/Ico'
import NotFound from './NotFound'

const FB = 'https://www.facebook.com/people/Tlhavika/61560557742444/'

export default function ProductPage() {
  const { id = '' } = useParams()
  const catalog = useCatalog()
  const p = catalog.find((x) => x.id === id)
  useMeta(p?.name ?? 'Produto não encontrado', p?.summary)
  useReveal(id)
  if (!p) return <NotFound />
  const cat = categories.find((c) => c.id === p.category)
  const related = catalog.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4)
  const text = `Olá Tlhavika, gostaria de uma cotação para: ${p.name}${p.brand ? ` (${p.brand})` : ''}.`
  const src = productImage(p)

  return (
    <div className="page">
      <div className="wrap pdp">
        <nav className="crumbs" aria-label="Localização">
          <Link to="/produtos">Catálogo</Link> / <Link to={`/produtos?categoria=${p.category}`}>{cat?.name}</Link>
        </nav>
        <div className="pdp__grid">
          <div className="pdp__media reveal">
            {src ? <img src={src} alt={p.name} /> : <Ico name={categoryPic(p.category)} size={160} className="pdp__picto" />}
            {p.illustrative && <span className="pdp__imgnote">Imagem ilustrativa</span>}
          </div>
          <div className="pdp__info reveal">
            <p className="pdp__cat">
              {cat?.name}
              {p.brand ? ` · ${p.brand}` : ''}
            </p>
            <h1 className="pdp__title">{p.name}</h1>
            {p.model && <p className="muted">Modelo {p.model}</p>}
            <p className="pdp__summary">{p.summary}</p>

            <div className="pdp__ctas">
              <a className="pill pill--dark" href={wa(text)} target="_blank" rel="noopener noreferrer">
                <Ico name="whatsapp" size={18} /> Pedir cotação pelo WhatsApp
              </a>
              <AddToList p={p} className="addlist--lg" label />
            </div>
            <p className="pdp__note">
              Preço e disponibilidade na cotação. Prefere escrever?{' '}
              <Link to={`/contacto?produto=${p.id}`}>Use o formulário</Link>.
            </p>

            {p.specs.length > 0 && (
              <section className="pdp__block" aria-labelledby="specs-t">
                <h2 id="specs-t" className="h3">
                  Especificações
                </h2>
                <dl className="specs">
                  {p.specs.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            {p.includes && p.includes.length > 0 && (
              <section className="pdp__block" aria-labelledby="incl-t">
                <h2 id="incl-t" className="h3">
                  Inclui
                </h2>
                <ul className="incl">
                  {p.includes.map((x) => (
                    <li key={x}>
                      <Ico name="visto" size={16} /> {x}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {!p.custom && (
              <a className="pdp__src" href={FB} target="_blank" rel="noopener noreferrer">
                Ver publicações na página da Tlhavika
              </a>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="related">
            <h2 className="h3">Na mesma categoria</h2>
            <ul className="pgrid">
              {related.map((r) => (
                <li key={r.id}>
                  <ProductCard p={r} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
