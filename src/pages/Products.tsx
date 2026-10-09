import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Ico } from '../components/Ico'
import { categories, type CategoryId } from '../data/site'
import { useCatalog } from '../lib/catalog'
import { useReveal } from '../lib/useReveal'
import { useMeta } from '../lib/useMeta'
import { PageHead } from '../components/PageHead'
import { ProductCard } from '../components/ProductCard'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function Products() {
  const [params, setParams] = useSearchParams()
  const cat = (params.get('categoria') ?? '') as CategoryId | ''
  const products = useCatalog()
  const [q, setQ] = useState('')
  const current = categories.find((c) => c.id === cat)
  useMeta(current ? current.name : 'Produtos')
  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          (!cat || p.category === cat) &&
          (!q || norm(`${p.name} ${p.brand ?? ''} ${p.model ?? ''} ${p.specs.map((s) => s.value).join(' ')}`).includes(norm(q))),
      ),
    [cat, q, products],
  )
  useReveal(`${cat}-${q}`)

  return (
    <div className="page">
      <PageHead
        kicker="Catálogo"
        title={current ? current.name : 'Produtos'}
        lead="Equipamento apresentado pela Tlhavika. As especificações são as dos anúncios; preço, disponibilidade e ficha técnica são confirmados na cotação."
      />
      <div className="wrap">
        <div className="cat-bar">
          <div className="tabs" role="tablist" aria-label="Categorias">
            <button role="tab" aria-selected={!cat} onClick={() => setParams({}, { replace: true })}>
              Todos <span>{products.length}</span>
            </button>
            {categories.map((c) => {
              const n = products.filter((p) => p.category === c.id).length
              return (
                <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setParams({ categoria: c.id }, { replace: true })}>
                  {c.name} <span>{n}</span>
                </button>
              )
            })}
          </div>
          <label className="search">
            <Ico name="pesquisa" size={16} />
            <span className="visually-hidden">Pesquisar</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Modelo, marca, potência…" />
          </label>
        </div>

        {list.length ? (
          <ul className="pgrid">
            {list.map((p, i) => (
              <li key={p.id} className="reveal" style={{ '--d': `${(i % 4) * 50}ms` } as React.CSSProperties}>
                <ProductCard p={p} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <p className="h3">Sem resultados</p>
            <p className="muted">
              {cat === 'baterias' ? 'Ainda não publicámos baterias em separado. Veja o sistema Hanchus ou peça uma cotação.' : 'Experimente outro termo ou categoria.'}
            </p>
          </div>
        )}
        <p className="fine">As marcas pertencem aos respetivos fabricantes. Preços antigos dos anúncios não são publicados.</p>
      </div>
    </div>
  )
}
