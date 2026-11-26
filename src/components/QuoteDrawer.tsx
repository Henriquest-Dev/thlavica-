import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { itemKey, useQuoteList } from '../lib/quotes'
import { isMeters, picksLabel, qtyLabel } from '../lib/variants'
import { wa } from '../data/site'
import { finalPrice, priceLabel } from '../lib/pricing'
import { useUi } from './Ui'
import { Ico } from './Ico'
import { ProductThumb } from './ProductThumb'

/** Painel lateral com a lista de cotação do visitante. */
export function QuoteDrawer() {
  const { listOpen, closeList, toast } = useUi()
  const { items, remove, setQty, clear, restore } = useQuoteList()
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

  // preço de referência de cada linha (com desconto em vigor); o total só aparece se todas tiverem preço
  const lineTotal = (r: (typeof rows)[number]) => {
    const u = finalPrice(r.p)
    return u === undefined ? undefined : Math.round(u * r.qtd * 100) / 100
  }
  const totals = rows.map(lineTotal)
  const total = totals.every((t) => t !== undefined) ? totals.reduce<number>((a, t) => a + (t ?? 0), 0) : undefined
  const undo = (text: string) => {
    const before = items
    return () => toast(text, { label: 'Desfazer', run: () => restore(before) })
  }

  const message = () =>
    [
      'Olá Tlhavika, gostaria de uma cotação para:',
      '',
      ...rows.map((r) => `• ${qtyLabel(r.qtd, isMeters(r.p))}${isMeters(r.p) ? ' de' : ' ×'} ${r.p.name}${picksLabel(r.opcoes) ? ` (${picksLabel(r.opcoes)})` : r.p.brand ? ` (${r.p.brand})` : ''}`),
    ].join('\n')

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
              Ver os produtos
            </button>
          </div>
        ) : (
          <>
            <ul className="drawer__list">
              {rows.map((r) => {
                const key = itemKey(r)
                const m = isMeters(r.p)
                return (
                  <li key={key}>
                    <ProductThumb p={r.p} />
                    <div className="drawer__info">
                      <span className="drawer__name">{r.p.name}</span>
                      <span className="muted">{picksLabel(r.opcoes) || (r.p.brand ?? '')}</span>
                      <div className="qty" role="group" aria-label={`${m ? 'Metros' : 'Quantidade'} de ${r.p.name}`}>
                        <button type="button" onClick={() => setQty(key, r.qtd - (m ? 5 : 1))} aria-label={m ? 'Menos 5 metros' : 'Menos uma unidade'}>
                          <Ico name="menos" size={14} />
                        </button>
                        <span aria-live="polite">{qtyLabel(r.qtd, m)}</span>
                        <button type="button" onClick={() => setQty(key, r.qtd + (m ? 5 : 1))} aria-label={m ? 'Mais 5 metros' : 'Mais uma unidade'}>
                          <Ico name="mais" size={14} />
                        </button>
                      </div>
                    </div>
                    <span className="drawer__price">{lineTotal(r) !== undefined ? priceLabel(lineTotal(r)!) : <span className="muted">Na cotação</span>}</span>
                    <button
                      type="button"
                      className="drawer__rm"
                      onClick={() => {
                        const done = undo(`${r.p.name} retirado da lista`)
                        remove(key)
                        done()
                      }} aria-label={`Retirar ${r.p.name}${picksLabel(r.opcoes) ? ` (${picksLabel(r.opcoes)})` : ''}`}>
                      <Ico name="fechar" size={16} />
                    </button>
                  </li>
                )
              })}
            </ul>
            <footer className="drawer__foot">
              <p className="drawer__total">
                <span>
                  {rows.length} {rows.length === 1 ? 'produto' : 'produtos'}
                  {total !== undefined ? ' · total de referência' : ''}
                </span>
                {total !== undefined ? <strong>{priceLabel(total)}</strong> : <span className="muted">Alguns preços vêm na cotação</span>}
              </p>
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
              <button
                type="button"
                className="drawer__clear"
                onClick={() => {
                  const done = undo('Lista limpa')
                  clear()
                  done()
                }}
              >
                Limpar a lista
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
