import { useEffect, useState } from 'react'
import { ProductPic } from '../components/ProductPic'
import { Link, useParams } from 'react-router-dom'
import { categoryPic, wa } from '../data/site'
import { useCategories } from '../lib/categories'
import { productImage, useCatalog } from '../lib/catalog'
import { breadcrumbSchema, fileUrl, productSchema, useSeo } from '../lib/seo'
import { activeDiscount, finalPrice, priceLabel, untilLabel } from '../lib/pricing'
import { useReveal } from '../lib/useReveal'
import { AddToList, ProductCard } from '../components/ProductCard'
import { BuyOptions } from '../components/BuyOptions'
import { MediaSlot } from '../sections/Gallery'
import { needsChoice, unitSuffix } from '../lib/variants'
import { kitLines, kitSeparateTotal } from '../lib/kits'
import { ProductThumb } from '../components/ProductThumb'
import { Ico } from '../components/Ico'
import { ImageZoom } from '../components/ImageZoom'
import NotFound from './NotFound'

export default function ProductPage() {
  const categories = useCategories()
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
          productSchema({ id: p.id, name: p.name, summary: p.summary, brand: p.brand, model: p.model, categoryName: cat?.name, imageUrl: fileUrl(pic), price: finalPrice(p), priceUntil: activeDiscount(p) ? p.discountUntil : undefined }),
          breadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Produtos', path: '/produtos' },
            ...(cat ? [{ name: cat.name, path: `/categoria/${cat.id}` }] : []),
            { name: p.name, path: `/produtos/${p.id}` },
          ]),
        ]
      : [],
  })
  useReveal(id)
  // fotografia extra escolhida (-1 = a principal); volta à principal ao mudar de produto
  const [gi, setGi] = useState(-1)
  const [zoom, setZoom] = useState(false)
  useEffect(() => {
    setGi(-1)
    setZoom(false)
  }, [id])
  if (!p) return <NotFound />
  const related = catalog.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4)
  const off = activeDiscount(p)
  const price = finalPrice(p)
  const text = `Olá Tlhavika, gostaria de uma cotação para: ${p.name}${p.brand ? ` (${p.brand})` : ''}.`
  const src = productImage(p)
  const kit = kitLines(p.kit, catalog)
  const separate = kitSeparateTotal(p.kit, catalog)
  // imagens que se podem ampliar: a principal e as fotografias extra
  const zoomImgs = [...(src ? [{ src, alt: p.name }] : []), ...(p.gallery ?? []).map((g, i) => ({ src: g, alt: `${p.name}, fotografia ${i + 1}` }))]
  const zoomStart = gi >= 0 ? gi + (src ? 1 : 0) : 0

  return (
    <div className="page">
      <div className="wrap pdp">
        <nav className="crumbs" aria-label="Localização">
          <Link to="/produtos">Produtos</Link> / <Link to={`/categoria/${p.category}`}>{cat?.name}</Link>
        </nav>
        <div className="pdp__grid">
          <div className="pdp__media reveal">
            {gi >= 0 && p.gallery?.[gi] ? (
              <ProductPic src={p.gallery[gi]} alt={`${p.name}, fotografia ${gi + 1}`} photo />
            ) : src ? (
              <ProductPic src={src} alt={p.name} photo={p.photo && !p.imgData} />
            ) : (
              <Ico name={categoryPic(p.category, categories)} size={160} className="pdp__picto" />
            )}
            {zoomImgs.length > 0 && (
              <button type="button" className="pdp__zoom" onClick={() => setZoom(true)} aria-label={`Ampliar a imagem de ${p.name}`}>
                <span className="pdp__zoomicon" aria-hidden="true">
                  <Ico name="pesquisa" size={18} />
                  <Ico name="mais" size={12} />
                </span>
              </button>
            )}
            {(p.gallery?.length ?? 0) > 0 && (
              <div className="pdp__thumbs" role="group" aria-label="Fotografias do produto">
                {src && (
                  <button type="button" className={gi < 0 ? 'is-on' : ''} aria-label="Imagem principal" aria-pressed={gi < 0} onClick={() => setGi(-1)}>
                    <img src={src} alt="" />
                  </button>
                )}
                {p.gallery!.map((g, i) => (
                  <button key={g + i} type="button" className={gi === i ? 'is-on' : ''} aria-label={`Fotografia ${i + 1}`} aria-pressed={gi === i} onClick={() => setGi(i)}>
                    <img src={g} alt="" />
                  </button>
                ))}
              </div>
            )}
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
                    {off > 0 && <s>{priceLabel(p.price!)}</s>} <strong>{priceLabel(price)}{unitSuffix(p)}</strong>
                  </p>
                )}
                {off > 0 && (
                  <p className="pdp__off">
                    <span className="selo">-{off}%</span> {untilLabel(p) ? `Desconto ${untilLabel(p)}` : 'Desconto em vigor'}
                  </p>
                )}
              </div>
            )}

            {needsChoice(p) ? (
              <BuyOptions p={p} />
            ) : (
              <div className="pdp__ctas">
                <Link className="pill pill--dark" to={`/contacto?produto=${p.id}`}>
                  Pedir cotação
                </Link>
                <AddToList p={p} className="addlist--lg" label />
              </div>
            )}
            <p className="pdp__note">
              {p.price ? 'Preço de referência. ' : ''}Os valores finais e a disponibilidade são confirmados na cotação.{' '}
              <a className="optional" href={wa(text)} target="_blank" rel="noopener noreferrer">
                Prefere falar no WhatsApp?
              </a>
            </p>

            {kit.length > 0 && (
              <section className="pdp__block" aria-labelledby="kit-t">
                <h2 id="kit-t" className="h3">
                  Este kit inclui
                </h2>
                <ul className="kitl">
                  {kit.map(({ item, p: c }) => (
                    <li key={c.id}>
                      <ProductThumb p={c} size={52} />
                      <Link to={`/produtos/${c.id}`} className="kitl__name">
                        <strong>{item.qtd}×</strong> {c.name}
                      </Link>
                      {finalPrice(c) !== undefined && <span className="kitl__price">{priceLabel(finalPrice(c)! * item.qtd)}</span>}
                    </li>
                  ))}
                </ul>
                {separate !== undefined && price !== undefined && separate > price && (
                  <p className="kitl__save">
                    Comprados em separado: <s>{priceLabel(separate)}</s> · No kit poupa <strong>{priceLabel(separate - price)}</strong>
                  </p>
                )}
              </section>
            )}

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

        <MediaSlot where={`produto:${p.id}`} title="Fotografias e vídeos" className="gal-sec--pdp" />

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
      {zoom && zoomImgs.length > 0 && <ImageZoom images={zoomImgs} start={zoomStart} onClose={() => setZoom(false)} />}
    </div>
  )
}
