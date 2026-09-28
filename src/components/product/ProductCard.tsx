import { Link } from 'react-router-dom'
import { categoryById, type Product } from '../../data/products'
import { showUnverifiedSpecs } from '../../config/site'
import { ProductImage } from './ProductImage'

export function ProductCard({ product }: { product: Product }) {
  const showSpecs = product.validacao === 'validado' || showUnverifiedSpecs
  const specs = showSpecs ? product.especificacoes.slice(0, 3) : []
  return (
    <article className="product-card">
      <Link to={`/produto/${product.id}`} className="product-card__media" tabIndex={-1} aria-hidden="true">
        <ProductImage image={product.imagens[0]} recorte={product.recorte} alt={product.nome} />
      </Link>
      <div className="product-card__body">
        <p className="product-card__cat">
          {categoryById(product.categoria)?.nome}
          {product.marca && <span> · {product.marca}</span>}
        </p>
        <h3 className="product-card__title">
          <Link to={`/produto/${product.id}`}>{product.nome}</Link>
        </h3>
        {product.modelo && <p className="product-card__model">Modelo {product.modelo}</p>}
        {specs.length > 0 ? (
          <dl className="product-card__specs">
            {specs.map((s) => (
              <div key={s.rotulo}>
                <dt>{s.rotulo}</dt>
                <dd>{s.valor}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="product-card__pending">Especificações em validação — peça a ficha técnica.</p>
        )}
        <div className="product-card__actions">
          <Link className="btn btn--outline btn--sm" to={`/produto/${product.id}`}>
            Ver detalhes
          </Link>
          <Link className="btn btn--primary btn--sm" to={`/contacto?tipo=cotacao&produto=${product.id}`}>
            Pedir cotação
          </Link>
        </div>
      </div>
    </article>
  )
}
