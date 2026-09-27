import { Link } from 'react-router-dom'
import { categories } from '../data/site'
import type { Product } from '../data/products'
import { asset } from '../lib/asset'
import { Arrow } from './Arrow'

export function ProductCard({ p, size = 'md' }: { p: Product; size?: 'md' | 'lg' }) {
  const cat = categories.find((c) => c.id === p.category)
  const spec = p.specs.find((s) => /Potência|Capacidade|Versões/.test(s.label) && s.value.length < 26)?.value
  return (
    <Link to={`/produtos/${p.id}`} className={`pc pc--${size}`}>
      <span className="pc__media">
        <img src={asset(`img/produtos/${p.img}.webp`)} alt={p.name} loading="lazy" />
      </span>
      <span className="pc__body">
        <span className="pc__cat">
          {cat?.name}
          {p.brand ? ` · ${p.brand}` : ''}
        </span>
        <span className="pc__name">
          {p.name}
          <Arrow size={14} />
        </span>
        {spec && <span className="pc__spec">{spec}</span>}
      </span>
    </Link>
  )
}
