import { Link } from 'react-router-dom'
import { activeDiscount, finalPrice, priceLabel } from '../lib/pricing'
import { categories, categoryPic } from '../data/site'
import { productImage, type CatalogProduct } from '../lib/catalog'
import { useQuoteList } from '../lib/quotes'
import { Arrow } from './Arrow'
import { Ico } from './Ico'
import { useUi } from './Ui'

export function AddToList({ p, className = '', label = false }: { p: CatalogProduct; className?: string; label?: boolean }) {
  const { has, add, remove } = useQuoteList()
  const { toast, openList } = useUi()
  const on = has(p.id)
  return (
    <button
      type="button"
      className={`addlist${on ? ' is-on' : ''} ${className}`}
      aria-pressed={on}
      aria-label={
        label
          ? `${on ? 'Na lista de cotação' : 'Adicionar à cotação'}: ${p.name}` // o nome acessível começa pelo texto visível
          : on
            ? `Retirar ${p.name} da lista de cotação`
            : `Adicionar ${p.name} à lista de cotação`
      }
      onClick={() => {
        if (on) remove(p.id)
        else {
          add(p.id)
          toast('Adicionado à lista de cotação', { label: 'Ver lista', run: openList })
        }
      }}
    >
      <Ico name={on ? 'visto' : 'mais'} size={label ? 16 : 18} />
      {label && <span>{on ? 'Na lista de cotação' : 'Adicionar à cotação'}</span>}
    </button>
  )
}

export function ProductCard({ p, size = 'md' }: { p: CatalogProduct; size?: 'md' | 'lg' }) {
  const cat = categories.find((c) => c.id === p.category)
  const chip = p.specs.find((s) => /Potência|Capacidade|Versões/.test(s.label) && s.value.length < 22)?.value
  const src = productImage(p)
  const off = activeDiscount(p)
  const price = finalPrice(p)
  return (
    <div className="pcw">
      <Link to={`/produtos/${p.id}`} className={`pc pc--${size}`}>
        <span className="pc__media">{src ? <img src={src} alt={p.name} loading="lazy" /> : <Ico name={categoryPic(p.category)} size={96} className="pc__picto" />}</span>
        {chip && <span className="pc__chip">{chip}</span>}
        {off > 0 && <span className="pc__sale">-{off}%</span>}
        <span className="pc__body">
          <span className="pc__cat">
            {cat?.name}
            {p.brand ? ` · ${p.brand}` : ''}
          </span>
          <span className="pc__name">{p.name}</span>
          {price !== undefined && (
            <span className="pc__price">
              {off > 0 && <s>{priceLabel(p.price!)}</s>} {priceLabel(price)}
            </span>
          )}
        </span>
        <span className="pc__go" aria-hidden="true">
          <Arrow size={14} />
        </span>
      </Link>
      <AddToList p={p} className="pc__add" />
    </div>
  )
}
