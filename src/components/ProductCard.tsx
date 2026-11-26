import { Link } from 'react-router-dom'
import { activeDiscount, finalPrice, priceLabel } from '../lib/pricing'
import { categoryPic } from '../data/site'
import { useCategories } from '../lib/categories'
import { productImage, type CatalogProduct } from '../lib/catalog'
import { useQuoteList } from '../lib/quotes'
import { Arrow } from './Arrow'
import { ProductPic } from './ProductPic'
import { Ico } from './Ico'
import { needsChoice, unitSuffix } from '../lib/variants'
import { useUi } from './Ui'

export function AddToList({ p, className = '', label = false }: { p: CatalogProduct; className?: string; label?: boolean }) {
  const { items, has, add, remove, restore } = useQuoteList()
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
        if (on) {
          const before = items
          remove(p.id)
          toast('Retirado da lista de cotação', { label: 'Desfazer', run: () => restore(before) })
        } else {
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
  const categories = useCategories()
  const cat = categories.find((c) => c.id === p.category)
  const chip = p.specs.find((s) => /Potência|Capacidade|Versões/.test(s.label) && s.value.length < 22)?.value
  const src = productImage(p, true)
  const off = activeDiscount(p)
  const price = finalPrice(p)
  return (
    <div className="pcw">
      <Link to={`/produtos/${p.id}`} className={`pc pc--${size}`}>
        <span className="pc__media">{src ? <ProductPic src={src} alt={p.name} lazy photo={p.photo && !p.imgData} /> : <Ico name={categoryPic(p.category, categories)} size={96} className="pc__picto" />}</span>
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
              {off > 0 && <s>{priceLabel(p.price!)}</s>} {priceLabel(price)}{unitSuffix(p)}
            </span>
          )}
        </span>
        <span className="pc__go" aria-hidden="true">
          <Arrow size={14} />
        </span>
      </Link>
      {needsChoice(p) ? (
        <Link to={`/produtos/${p.id}`} className="addlist pc__add" aria-label={`Escolher opções de ${p.name}`}>
          <Ico name="mais" size={18} />
        </Link>
      ) : (
        <AddToList p={p} className="pc__add" />
      )}
    </div>
  )
}
