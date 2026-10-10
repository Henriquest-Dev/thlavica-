import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { useQuoteList } from '../lib/quotes'
import { wa } from '../data/site'
import { useUi } from './Ui'
import { Ico } from './Ico'
import { ProductThumb } from './ProductThumb'

/** Painel lateral com a lista de cotação do visitante. */
export function QuoteDrawer() {
  const { listOpen, closeList } = useUi()
  const { items, remove, setQty, clear } = useQuoteList()
  const catalog = useCatalog(true)
  const nav = useNavigate()

  useEffect(() => {
    if (!listOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeList()
    window.addEventListener('keydown', onKey)
    document.documentElement.classList.add('menu-open')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('menu-open')
    }
  }, [listOpen, closeList])

  if (!listOpen) return null

  const rows = items
    .map((i) => ({ ...i, p: catalog.find((p) => p.id === i.id) }))
    .filter((r): r is typeof r & { p: NonNullable<typeof r.p> } => Boolean(r.p))

  const message = () =>
    ['Olá Tlhavika, gostaria de uma cotação para:', '', ...rows.map((r) => `• ${r.qtd} × ${r.p.name}${r.p.brand ? ` (${r.p.brand})` : ''}`)].join('\n')

  return (
    <div className="ov ov--drawer" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && closeList()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Lista de cotação">
        <header className="drawer__head">
          <h2>Lista de cotação</h2>
          <button type="button" className="drawer__close" onClick={closeList} aria-label="Fechar lista" autoFocus>
            <Ico name="fechar" size={18} />
          </button>
        </header>
        {rows.length === 0 ? (
          <div className="drawer__empty">
            <p>A lista está vazia.</p>
            <p className="muted">Em cada produto, use “Adicionar à cotação”. Reunimos tudo num só pedido.</p>
            <button
              type="button"
              className="pill pill--dark"
              onClick={() => {
                closeList()
                nav('/produtos')
              }}
            >
              Ver o catálogo
            </button>
          </div>
        ) : (
          <>
            <ul className="drawer__list">
              {rows.map((r) => (
                <li key={r.id}>
                  <ProductThumb p={r.p} />
                  <div className="drawer__info">
                    <span className="drawer__name">{r.p.name}</span>
                    <span className="muted">{r.p.brand ?? ''}</span>
                    <div className="qty" role="group" aria-label={`Quantidade de ${r.p.name}`}>
                      <button type="button" onClick={() => setQty(r.id, r.qtd - 1)} aria-label="Menos uma unidade">
                        <Ico name="menos" size={14} />
                      </button>
                      <span aria-live="polite">{r.qtd}</span>
                      <button type="button" onClick={() => setQty(r.id, r.qtd + 1)} aria-label="Mais uma unidade">
                        <Ico name="mais" size={14} />
                      </button>
                    </div>
                  </div>
                  <button type="button" className="drawer__rm" onClick={() => remove(r.id)} aria-label={`Retirar ${r.p.name}`}>
                    <Ico name="fechar" size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <footer className="drawer__foot">
              <button
                type="button"
                className="pill pill--dark"
                onClick={() => {
                  closeList()
                  nav('/contacto?lista=1')
                }}
              >
                Pedir cotação
              </button>
              <a className="drawer__alt optional" href={wa(message())} target="_blank" rel="noopener noreferrer">
                Prefere falar no WhatsApp?
              </a>
              <button type="button" className="drawer__clear" onClick={clear}>
                Limpar a lista
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
