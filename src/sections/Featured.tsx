import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../lib/useProgress'
import { products } from '../data/products'
import { ProductCard } from '../components/ProductCard'
import { Arrow } from '../components/Arrow'

/** Produtos em destaque: faixa horizontal comandada pelo scroll (computador) ou deslizável (telemóvel). */
export function Featured() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  const list = products.filter((p) => p.featured)
  return (
    <section ref={ref} className="feat" aria-labelledby="feat-title" style={{ '--count': list.length } as React.CSSProperties}>
      <div className="feat__sticky">
        <div className="feat__head wrap">
          <div>
            <p className="eyebrow eyebrow--dark">Catálogo</p>
            <h2 id="feat-title" className="h2">
              Produtos em destaque
            </h2>
          </div>
          <Link to="/produtos" className="pill pill--dark">
            Ver os {products.length} produtos
            <span className="pill__icon">
              <Arrow size={14} />
            </span>
          </Link>
        </div>
        <div className="feat__viewport">
          <ul className="feat__track">
            {list.map((p) => (
              <li key={p.id}>
                <ProductCard p={p} size="lg" />
              </li>
            ))}
          </ul>
        </div>
        <p className="feat__note wrap">Imagens dos produtos a partir das publicações da Tlhavika. Preço e disponibilidade na cotação.</p>
      </div>
    </section>
  )
}
