import { useEffect, useId, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { applications, brands, categories, categoryById, powerRanges, products, type Product } from '../data/products'
import { ProductCard } from '../components/product/ProductCard'
import { EmptyState } from '../components/States'
import { usePageMeta } from '../hooks/usePageMeta'

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

function matches(p: Product, q: string) {
  if (!q) return true
  const hay = norm(
    [p.nome, p.marca, p.modelo, p.resumo, categoryById(p.categoria)?.nome, ...p.especificacoes.map((s) => s.valor)]
      .filter(Boolean)
      .join(' '),
  )
  return norm(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((t) => hay.includes(t))
}

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const cat = params.get('categoria') ?? ''
  const brand = params.get('marca') ?? ''
  const power = params.get('potencia') ?? ''
  const app = params.get('aplicacao') ?? ''
  const [draft, setDraft] = useState(q)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const searchId = useId()

  useEffect(() => setDraft(q), [q])

  const category = categoryById(cat)
  usePageMeta(
    category ? category.nome : 'Catálogo',
    category
      ? `${category.nome}: ${category.resumo} Peça cotação à Tlhavika.`
      : 'Catálogo Tlhavika: painéis solares, inversores, baterias, bombas de água, bombagem solar, termoacumuladores e acessórios.',
  )

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const range = powerRanges.find((r) => r.id === power)
  const results = useMemo(
    () =>
      products.filter(
        (p) =>
          (!cat || p.categoria === cat) &&
          (!brand || p.marca === brand) &&
          (!app || p.aplicacoes.includes(app as never)) &&
          (!range || (p.potenciaW !== undefined && p.potenciaW >= range.min && p.potenciaW <= range.max)) &&
          matches(p, q),
      ),
    [cat, brand, app, range, q],
  )

  const active = [q, cat, brand, power, app].filter(Boolean).length

  const radio = (key: string, current: string, items: { id: string; nome: string; n?: number }[], allLabel: string) => (
    <ul className="filter-list">
      <li>
        <label className="filter-opt">
          <input type="radio" name={key} checked={!current} onChange={() => update(key, '')} />
          <span>{allLabel}</span>
        </label>
      </li>
      {items.map((it) => (
        <li key={it.id}>
          <label className="filter-opt">
            <input type="radio" name={key} checked={current === it.id} onChange={() => update(key, it.id)} />
            <span>{it.nome}</span>
            {it.n !== undefined && <span className="filter-opt__n">{it.n}</span>}
          </label>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="page">
      <header className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Localização">
            <Link to="/">Início</Link> <span aria-hidden="true">/</span>{' '}
            {category ? <Link to="/catalogo">Catálogo</Link> : <span aria-current="page">Catálogo</span>}
            {category && (
              <>
                {' '}
                <span aria-hidden="true">/</span> <span aria-current="page">{category.nome}</span>
              </>
            )}
          </nav>
          <h1 className="page-title">{category ? category.nome : 'Catálogo'}</h1>
          <p className="page-lede">
            {category
              ? category.resumo
              : 'Painéis, inversores, baterias, bombas e termoacumuladores. Preço e disponibilidade confirmados em cada cotação.'}
          </p>
          <form
            className="catalog-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              update('q', draft.trim())
            }}
          >
            <label htmlFor={searchId} className="visually-hidden">
              Pesquisar produtos
            </label>
            <input
              id={searchId}
              type="search"
              value={draft}
              placeholder="Pesquisar por nome, marca ou modelo (ex.: 3SDM, 625 W)"
              onChange={(e) => {
                setDraft(e.target.value)
                if (!e.target.value) update('q', '')
              }}
            />
            <button className="btn btn--primary" type="submit">
              Pesquisar
            </button>
          </form>
        </div>
      </header>

      <div className="container catalog">
        <button
          type="button"
          className="btn btn--outline catalog__filters-toggle"
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          Filtros{active > 0 ? ` (${active})` : ''}
        </button>

        <aside id="catalog-filters" className={`catalog__filters${filtersOpen ? ' is-open' : ''}`} aria-label="Filtros">
          <fieldset>
            <legend>Categoria</legend>
            {radio(
              'categoria',
              cat,
              categories.map((c) => ({ id: c.id, nome: c.nome, n: products.filter((p) => p.categoria === c.id).length })),
              'Todas',
            )}
          </fieldset>
          <fieldset>
            <legend>Marca</legend>
            {radio('marca', brand, brands.map((b) => ({ id: b, nome: b })), 'Todas')}
          </fieldset>
          <fieldset>
            <legend>Potência</legend>
            {radio('potencia', power, powerRanges, 'Qualquer')}
          </fieldset>
          <fieldset>
            <legend>Aplicação</legend>
            {radio('aplicacao', app, applications, 'Todas')}
          </fieldset>
          {active > 0 && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setParams({}, { replace: true })}>
              Limpar filtros
            </button>
          )}
        </aside>

        <section className="catalog__results" aria-labelledby="results-title">
          <h2 id="results-title" className="catalog__count" aria-live="polite">
            {results.length} {results.length === 1 ? 'produto' : 'produtos'}
          </h2>
          {results.length > 0 ? (
            <div className="product-grid product-grid--catalog">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={cat && !products.some((p) => p.categoria === cat) ? 'Gama em atualização' : 'Nenhum produto encontrado'}
              text={
                cat && !products.some((p) => p.categoria === cat)
                  ? 'Ainda não publicámos modelos nesta categoria. Diga-nos o que procura e enviamos opções disponíveis.'
                  : 'Experimente outros termos ou limpe os filtros. Também pode pedir-nos diretamente o equipamento que procura.'
              }
            >
              <div className="state__actions">
                {active > 0 && (
                  <button type="button" className="btn btn--outline" onClick={() => setParams({}, { replace: true })}>
                    Limpar filtros
                  </button>
                )}
                <Link className="btn btn--primary" to={`/contacto?tipo=cotacao${cat ? `&produto=categoria:${cat}` : ''}`}>
                  Pedir cotação
                </Link>
              </div>
            </EmptyState>
          )}
          <p className="catalog__note">
            As marcas pertencem aos respetivos fabricantes. Ficha técnica, preço e disponibilidade na cotação.
          </p>
        </section>
      </div>
    </div>
  )
}
