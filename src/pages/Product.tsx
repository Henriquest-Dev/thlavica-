import { Link, useParams } from 'react-router-dom'
import { applicationName, categoryById, productById, products } from '../data/products'
import { showUnverifiedSpecs, whatsappLink } from '../config/site'
import { ProductImage } from '../components/product/ProductImage'
import { ProductCard } from '../components/product/ProductCard'
import { EmptyState } from '../components/States'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ProductPage() {
  const { id = '' } = useParams()
  const product = productById(id)

  usePageMeta(
    product ? product.nome : 'Produto não encontrado',
    product ? `${product.nome}. ${product.resumo} Peça cotação à Tlhavika.` : undefined,
    product?.recorte ? `/img/recortes/${product.recorte}.webp` : product?.imagens[0] ? `/img/anuncios/${product.imagens[0].src}-414.webp` : undefined,
  )

  if (!product) {
    return (
      <div className="page container page--narrow">
        <EmptyState title="Produto não encontrado" text="O produto que procura pode ter sido retirado ou o endereço está incorreto.">
          <Link className="btn btn--primary" to="/catalogo">
            Ir para o catálogo
          </Link>
        </EmptyState>
      </div>
    )
  }

  const cat = categoryById(product.categoria)
  const showSpecs = product.validacao === 'validado' || showUnverifiedSpecs
  const related = products
    .filter((p) => p.id !== product.id && (p.categoria === product.categoria || p.aplicacoes.some((a) => product.aplicacoes.includes(a))))
    .sort((a, b) => Number(b.categoria === product.categoria) - Number(a.categoria === product.categoria))
    .slice(0, 3)
  const quoteUrl = `/contacto?tipo=cotacao&produto=${product.id}`

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Localização">
          <Link to="/">Início</Link> <span aria-hidden="true">/</span> <Link to="/catalogo">Catálogo</Link>{' '}
          <span aria-hidden="true">/</span> <Link to={`/catalogo?categoria=${product.categoria}`}>{cat?.nome}</Link>{' '}
          <span aria-hidden="true">/</span> <span aria-current="page">{product.modelo ?? product.nome}</span>
        </nav>

        <div className="pdp">
          <div className="pdp__gallery">
            <ProductImage
              image={product.imagens[0]}
              recorte={product.recorte}
              alt={product.nome}
              sizes="(max-width: 900px) 92vw, 520px"
              eager
              className="pdp__main-img"
            />
          </div>

          <div className="pdp__info">
            <p className="product-card__cat">
              {cat?.nome}
              {product.marca && <span> · {product.marca}</span>}
            </p>
            <h1 className="pdp__title">{product.nome}</h1>
            {product.modelo && <p className="pdp__model">Modelo: {product.modelo}</p>}
            <p className="pdp__summary">{product.resumo}</p>

            <div className="pdp__cta">
              <Link className="btn btn--primary btn--lg" to={quoteUrl}>
                Pedir cotação
              </Link>
              <a
                className="btn btn--whatsapp btn--lg"
                href={whatsappLink(`Olá Tlhavika, gostaria de uma cotação para: ${product.nome}${product.modelo ? ` (${product.modelo})` : ''}.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </div>
            <p className="pdp__price-note">Preço e disponibilidade indicados na cotação.</p>

            <section className="pdp__block" aria-labelledby="specs-title">
              <h2 id="specs-title">Especificações</h2>
              {showSpecs && product.especificacoes.length > 0 ? (
                <>
                  <table className="spec-table">
                    <tbody>
                      {product.especificacoes.map((s) => (
                        <tr key={s.rotulo}>
                          <th scope="row">{s.rotulo}</th>
                          <td>{s.valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="muted">Especificações em validação. Peça a ficha técnica no pedido de cotação.</p>
              )}
            </section>

            <section className="pdp__block" aria-labelledby="apps-title">
              <h2 id="apps-title">Aplicações</h2>
              <ul className="chips">
                {product.aplicacoes.map((a) => (
                  <li key={a}>
                    <Link className="chip" to={`/catalogo?aplicacao=${a}`}>
                      {applicationName(a)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {showSpecs && product.incluidos && product.incluidos.length > 0 && (
              <section className="pdp__block" aria-labelledby="inc-title">
                <h2 id="inc-title">Incluído</h2>
                <ul className="ticks">
                  {product.incluidos.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="pdp__block" aria-labelledby="docs-title">
              <h2 id="docs-title">Documentos técnicos</h2>
              {product.documentos && product.documentos.length > 0 ? (
                <ul className="doc-list">
                  {product.documentos.map((d) => (
                    <li key={d.url}>
                      <a href={d.url} target="_blank" rel="noopener noreferrer">
                        {d.nome}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Ficha técnica disponível a pedido.</p>
              )}
            </section>

            <details className="pdp__source">
              <summary>Fonte da informação</summary>
              <ul>
                {product.fonte.map((f) => (
                  <li key={f.url}>
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                      {f.descricao}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>

        {related.length > 0 && (
          <section className="section section--flush" aria-labelledby="related-title">
            <h2 id="related-title" className="section-title section-title--sm">
              Produtos relacionados
            </h2>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="sticky-cta" role="region" aria-label="Pedir cotação">
        <span className="sticky-cta__name">{product.modelo ?? product.nome}</span>
        <Link className="btn btn--primary" to={quoteUrl}>
          Pedir cotação
        </Link>
      </div>
    </div>
  )
}
