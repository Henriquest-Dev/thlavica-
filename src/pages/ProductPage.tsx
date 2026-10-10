import { Link, useParams } from 'react-router-dom'
import { categories, categoryPic, wa } from '../data/site'
import { productImage, useCatalog } from '../lib/catalog'
import { breadcrumbSchema, fileUrl, productSchema, useSeo } from '../lib/seo'
import { activeDiscount, finalPrice, priceLabel, untilLabel } from '../lib/pricing'
import { useReveal } from '../lib/useReveal'
import { AddToList, ProductCard } from '../components/ProductCard'
import { Ico } from '../components/Ico'
import NotFound from './NotFound'

export default function ProductPage() {
  const { id = '' } = useParams()
  const catalog = useCatalog()
  const p = catalog.find((x) => x.id === id)
  const cat = categories.find((c) => c.id === p?.category)
  const pic = p ? productImage(p) : undefined
  useSeo({
    title: p ? `${p.name}${p.brand && !p.name.toLowerCase().includes(p.brand.toLowerCase()) ? ` · ${p.brand}` : ''}` : 'Produto não encontrado',
    description: p ? `${p.summary} Peça cotação à Tlhavika, em Maputo.` : undefined,
    path: `/produtos/${id}`,
    image: pic,
    noindex: !p,
    jsonLd: p
      ? [
          productSchema({ id: p.id, name: p.name, summary: p.summary, brand: p.brand, model: p.model, categoryName: cat?.name, imageUrl: fileUrl(pic) }),
          breadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Catálogo', path: '/produtos' },
            ...(cat ? [{ name: cat.name, path: `/categoria/${cat.id}` }] : []),
            { name: p.name, path: `/produtos/${p.id}` },
          ]),
        ]
      : [],
  })
  useReveal(id)
  if (!p) return <NotFound />
  const related = catalog.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4)
  const off = activeDiscount(p)
  const price = finalPrice(p)
  const text = `Olá Tlhavika, gostaria de uma cotação para: ${p.name}${p.brand ? ` (${p.brand})` : ''}.`
  const src = productImage(p)

  return (
    <div className="page">
      <div className="wrap pdp">
        <nav className="crumbs" aria-label="Localização">
          <Link to="/produtos">Catálogo</Link> / <Link to={`/categoria/${p.category}`}>{cat?.name}</Link>
        </nav>
        <div className="pdp__grid">
          <div className="pdp__media reveal">
            {src ? <img src={src} alt={p.name} /> : <Ico name={categoryPic(p.category)} size={160} className="pdp__picto" />}
          </div>
          <div className="pdp__info reveal">
            <p className="pdp__cat">
              {cat?.name}
              {p.brand ? ` · ${p.brand}` : ''}
            </p>
            <h1 className="pdp__title">{p.name}</h1>
            {p.model && <p className="muted">Modelo {p.model}</p>}
            <p className="pdp__summary">{p.summary}</p>
            {(price !== undefined || off > 0) && (
              <div className="pdp__price">
                {price !== undefined && (
                  <p className="pdp__now">
                    {off > 0 && <s>{priceLabel(p.price!)}</s>} <strong>{priceLabel(price)}</strong>
                  </p>
                )}
                {off > 0 && (
                  <p className="pdp__off">
                    <span className="selo">-{off}%</span> {untilLabel(p) ? `Desconto ${untilLabel(p)}` : 'Desconto em vigor'}
                  </p>
                )}
              </div>
            )}

            <div className="pdp__ctas">
              <Link className="pill pill--dark" to={`/contacto?produto=${p.id}`}>
                Pedir cotação
              </Link>
              <AddToList p={p} className="addlist--lg" label />
            </div>
            <p className="pdp__note">
              {p.price ? 'Preço de referência. ' : ''}Os valores finais e a disponibilidade são confirmados na cotação.{' '}
              <a className="optional" href={wa(text)} target="_blank" rel="noopener noreferrer">
                Prefere falar no WhatsApp?
              </a>
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
