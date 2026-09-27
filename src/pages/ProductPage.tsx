import { Link, useParams } from 'react-router-dom'
import { Check, MessageCircle, Info } from 'lucide-react'
import { categories, wa } from '../data/site'
import { productById, products } from '../data/products'
import { asset } from '../lib/asset'
import { useMeta } from '../lib/useMeta'
import { useReveal } from '../lib/useReveal'
import { ProductCard } from '../components/ProductCard'
import { Arrow } from '../components/Arrow'
import NotFound from './NotFound'

const FB = 'https://www.facebook.com/people/Tlhavika/61560557742444/'

export default function ProductPage() {
  const { id = '' } = useParams()
  const p = productById(id)
  useMeta(p?.name ?? 'Produto não encontrado', p?.summary)
  useReveal(id)
  if (!p) return <NotFound />
  const cat = categories.find((c) => c.id === p.category)
  const related = products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4)
  const text = `Olá Tlhavika, gostaria de uma cotação para: ${p.name}${p.brand ? ` (${p.brand})` : ''}.`

  return (
    <div className="page">
      <div className="wrap pdp">
        <nav className="crumbs" aria-label="Localização">
          <Link to="/produtos">Produtos</Link> / <Link to={`/produtos?categoria=${p.category}`}>{cat?.name}</Link>
        </nav>
        <div className="pdp__grid">
          <div className="pdp__media reveal">
            <img src={asset(`img/produtos/${p.img}.webp`)} alt={p.name} />
            <span className="pdp__imgnote">{p.illustrative ? 'Imagem ilustrativa' : 'Imagem da publicação da Tlhavika'}</span>
          </div>
          <div className="pdp__info reveal">
            <p className="eyebrow eyebrow--dark">
              {cat?.name}
              {p.brand ? ` · ${p.brand}` : ''}
            </p>
            <h1 className="pdp__title">{p.name}</h1>
            {p.model && <p className="muted">Modelo {p.model}</p>}
            <p className="pdp__summary">{p.summary}</p>

            <dl className="specs">
              {p.specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
            {p.includes && (
              <ul className="incl">
                {p.includes.map((x) => (
                  <li key={x}>
                    <Check size={16} strokeWidth={2} aria-hidden="true" /> {x}
                  </li>
                ))}
              </ul>
            )}
            <p className="pdp__note">
              <Info size={15} strokeWidth={1.8} aria-hidden="true" /> Dados do anúncio da Tlhavika. Confirme a ficha técnica, o preço e a disponibilidade na cotação.
            </p>
            <div className="pdp__ctas">
              <a className="pill pill--dark" href={wa(text)} target="_blank" rel="noopener noreferrer">
                Pedir cotação
                <span className="pill__icon">
                  <Arrow size={14} />
                </span>
              </a>
              <Link className="pill pill--line-dark" to={`/contacto?produto=${p.id}`}>
                <MessageCircle size={16} strokeWidth={1.8} aria-hidden="true" /> Formulário
              </Link>
            </div>
            <a className="pdp__src" href={FB} target="_blank" rel="noopener noreferrer">
              Ver publicações na página da Tlhavika
            </a>
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
