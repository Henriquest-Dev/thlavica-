import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStored, uid } from '../lib/store'
import { useCatalog } from '../lib/catalog'
import { STATUS_LABEL, type Proposal, type ProposalLine, type QuoteRequest, type QuoteStatus } from '../data/admin'
import { DEFAULT_IVA, lineFromProduct, newProposal, proposalMessage, proposalTotals } from '../lib/proposal'
import { Ico } from '../components/Ico'
import { useFeedback } from './feedback'
import { useMatch } from '../lib/useMatch'
import { Empty, Field, Modal, PageTitle, Panel, dateFmt, money } from './ui'

const NO_Q: QuoteRequest[] = []
const NO_PR: Proposal[] = []
const FILTERS: { id: 'todas' | QuoteStatus; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'nova', label: 'Novas' },
  { id: 'em-preparacao', label: 'Em preparação' },
  { id: 'enviada', label: 'Enviadas' },
  { id: 'fechada', label: 'Fechadas' },
]

const digits = (s: string) => s.replace(/\D/g, '')

/* ------------------------------------------------------------------ */

function ProposalEditor({ proposal, onSave, onClose }: { proposal: Proposal; onSave: (p: Proposal, send?: boolean) => void; onClose: () => void }) {
  const { toast } = useFeedback()
  const catalog = useCatalog(true)
  const [p, setP] = useState(proposal)
  const set = <K extends keyof Proposal>(k: K, v: Proposal[K]) => setP((x) => ({ ...x, [k]: v }))
  const setLine = (id: string, patch: Partial<ProposalLine>) => set('linhas', p.linhas.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const { subtotal: sub, tax, total } = proposalTotals(p)
  const iva = p.iva ?? DEFAULT_IVA
  const text = () => proposalMessage(p)

  return (
    <Modal title={`Cotação ${p.numero}`} onClose={onClose} wide>
      <div className="prop">
        <div className="prop__form">
          <div className="grid2">
            <Field label="Cliente">
              <input value={p.cliente.nome} onChange={(e) => set('cliente', { ...p.cliente, nome: e.target.value })} />
            </Field>
            <Field label="Telefone">
              <input value={p.cliente.telefone} onChange={(e) => set('cliente', { ...p.cliente, telefone: e.target.value })} inputMode="tel" />
            </Field>
            <Field label="Local" wide>
              <input value={p.cliente.local} onChange={(e) => set('cliente', { ...p.cliente, local: e.target.value })} />
            </Field>
          </div>

          <h3 className="sub">Produtos e preços</h3>
          <ul className="lines">
            {p.linhas.map((l) => (
              <li key={l.id}>
                <input
                  className="lines__desc"
                  value={l.descricao}
                  onChange={(e) => setLine(l.id, { descricao: e.target.value })}
                  placeholder="Descrição"
                  aria-label="Descrição"
                />
                <input className="lines__n" type="number" min={1} value={l.qtd} onChange={(e) => setLine(l.id, { qtd: Math.max(1, Number(e.target.value) || 1) })} aria-label="Quantidade" />
                <input className="lines__p" type="number" min={0} step="0.01" value={l.preco || ''} placeholder="Preço" onChange={(e) => setLine(l.id, { preco: Math.max(0, Number(e.target.value) || 0) })} aria-label="Preço unitário (MZN)" />
                <output>{money(l.qtd * l.preco)}</output>
                <button type="button" className="icon" onClick={() => set('linhas', p.linhas.filter((x) => x.id !== l.id))} aria-label="Retirar linha">
                  <Ico name="fechar" size={16} />
                </button>
              </li>
            ))}
          </ul>
          <div className="row">
            <select
              value=""
              onChange={(e) => {
                const prod = catalog.find((c) => c.id === e.target.value)
                if (prod) set('linhas', [...p.linhas, lineFromProduct(prod)])
              }}
              aria-label="Acrescentar produto do catálogo"
            >
              <option value="">+ Produto do catálogo…</option>
              {catalog.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn--line" onClick={() => set('linhas', [...p.linhas, { id: uid(), descricao: '', qtd: 1, preco: 0 }])}>
              + Linha livre
            </button>
          </div>

          <div className="grid2">
            <Field label="IVA (%)" hint="Ponha 0 para não mostrar IVA.">
              <input type="number" min={0} max={100} value={iva} onChange={(e) => set('iva', Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
            </Field>
            <Field label="Validade (dias)">
              <input type="number" min={1} max={365} value={p.validadeDias} onChange={(e) => set('validadeDias', Math.max(1, Number(e.target.value) || 1))} />
            </Field>
            <Field label="Notas para o cliente" wide>
              <textarea rows={3} value={p.notas} onChange={(e) => set('notas', e.target.value)} placeholder="Condições de pagamento, prazo de entrega, o que está incluído…" />
            </Field>
          </div>
        </div>

        <div className="prop__side">
          <article className="sheet" id="print-sheet">
            <header>
              <strong>TLHAVIKA</strong>
              <span>Proposta {p.numero}</span>
            </header>
            <p className="sheet__cli">
              {p.cliente.nome || 'Cliente'}
              {p.cliente.local ? ` · ${p.cliente.local}` : ''}
            </p>
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Qtd.</th>
                  <th>Preço</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {p.linhas.map((l) => (
                  <tr key={l.id}>
                    <td>{l.descricao || '—'}</td>
                    <td>{l.qtd}</td>
                    <td>{l.preco ? money(l.preco) : '—'}</td>
                    <td>{money(l.qtd * l.preco)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Subtotal</td>
                  <td>{money(sub)}</td>
                </tr>
                {iva > 0 && (
                  <tr>
                    <td colSpan={3}>IVA ({iva}%)</td>
                    <td>{money(tax)}</td>
                  </tr>
                )}
                <tr className="tot">
                  <td colSpan={3}>Total</td>
                  <td>{money(total)}</td>
                </tr>
              </tfoot>
            </table>
            <p className="sheet__n">Validade: {p.validadeDias} dias. {p.notas}</p>
          </article>
          <div className="row row--end">
            <button type="button" className="btn btn--line" onClick={() => navigator.clipboard?.writeText(text()).then(() => toast('Texto copiado'), () => toast('Não foi possível copiar', 'erro'))}>
              <Ico name="copiar" size={16} /> Copiar texto
            </button>
            <button type="button" className="btn btn--line" onClick={() => window.print()}>
              <Ico name="imprimir" size={16} /> Imprimir / PDF
            </button>
            {digits(p.cliente.telefone) && (
              <a className="btn btn--line" href={`https://wa.me/${digits(p.cliente.telefone)}?text=${encodeURIComponent(text())}`} target="_blank" rel="noopener noreferrer">
                <Ico name="whatsapp" size={16} /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="prop__foot row row--end">
        <button type="button" className="btn btn--line" onClick={() => onSave(p)}>
          Guardar rascunho
        </button>
        <button type="button" className="btn" onClick={() => onSave({ ...p, estado: 'enviada' }, true)}>
          Marcar como enviada
        </button>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

export default function Quotes() {
  const [quotes, setQuotes] = useStored<QuoteRequest[]>('quotes', NO_Q)
  const [proposals, setProposals] = useStored<Proposal[]>('proposals', NO_PR)
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('todas')
  const [editing, setEditing] = useState<Proposal | null>(null)
  const catalog = useCatalog(true)
  const { toast, confirm } = useFeedback()
  const mobile = useMatch('(max-width: 960px)')

  const list = useMemo(() => {
    const n = q.trim().toLowerCase()
    return quotes.filter(
      (r) => !r.arquivada && (filter === 'todas' || r.estado === filter) && (!n || `${r.nome} ${r.telefone} ${r.local} ${r.interesse ?? ''} ${(r.itens ?? []).map((i) => i.nome).join(' ')}`.toLowerCase().includes(n)),
    )
  }, [quotes, filter, q])
  // no telemóvel mostra-se a lista OU o pedido; no computador, os dois lado a lado
  const selId = params.get('id') ?? (mobile ? undefined : list[0]?.id)
  const sel = quotes.find((q) => q.id === selId)

  const startProposal = (q?: QuoteRequest) => {
    const existing = q && proposals.find((p) => p.pedidoId === q.id)
    setEditing(existing ?? newProposal(proposals, catalog, q))
  }

  // abrir o editor vindo do atalho "Preparar uma cotação"
  useEffect(() => {
    if (params.get('nova') === '1') {
      setParams({}, { replace: true })
      startProposal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setStatus = (id: string, estado: QuoteStatus) => setQuotes((all) => all.map((q) => (q.id === id ? { ...q, estado } : q)))

  const save = (p: Proposal, send?: boolean) => {
    setProposals((all) => (all.some((x) => x.id === p.id) ? all.map((x) => (x.id === p.id ? p : x)) : [p, ...all]))
    if (p.pedidoId) setStatus(p.pedidoId, send ? 'enviada' : 'em-preparacao')
    toast(send ? 'Cotação marcada como enviada' : 'Rascunho guardado')
    setEditing(null)
  }

  return (
    <>
      <PageTitle
        title="Cotações"
        lead="Pedidos recebidos pelo site e propostas preparadas para os clientes."
        action={
          <button type="button" className="btn" onClick={() => startProposal()}>
            + Nova cotação
          </button>
        }
      />
      <div className="toolbar">
        <label className="asearch">
          <Ico name="pesquisa" size={16} />
          <span className="visually-hidden">Pesquisar pedidos</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar por nome, telefone, local ou produto" />
        </label>
      </div>
      <select className="filtersel" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Estado dos pedidos">
        {FILTERS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label} ({quotes.filter((r) => !r.arquivada && (f.id === 'todas' || r.estado === f.id)).length})
          </option>
        ))}
      </select>
      <div className="atabs" role="tablist" aria-label="Estado dos pedidos">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
            <span>{quotes.filter((r) => !r.arquivada && (f.id === 'todas' || r.estado === f.id)).length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Panel>
          <Empty
            title={quotes.length ? 'Nenhum pedido neste estado' : 'Ainda não há pedidos'}
            text="Os pedidos feitos no formulário, nos simuladores e na lista de cotação do site aparecem aqui. Pode também preparar uma cotação do zero."
            action={
              <button type="button" className="btn" onClick={() => startProposal()}>
                Preparar uma cotação
              </button>
            }
          />
        </Panel>
      ) : (
        <div className="split">
          {(!mobile || !sel) && (
          <ul className="qlist" aria-label="Pedidos">
            {list.map((q) => (
              <li key={q.id}>
                <button type="button" className={q.id === sel?.id ? 'is-sel' : ''} onClick={() => setParams({ id: q.id }, { replace: true })}>
                  <span>
                    <strong>{q.nome || 'Sem nome'}</strong>
                    <small>
                      {dateFmt(q.criadoEm)}
                      {q.itens?.length ? ` · ${q.itens.length} produto${q.itens.length > 1 ? 's' : ''}` : ''}
                    </small>
                  </span>
                  <em className={`chip chip--${q.estado}`}>{STATUS_LABEL[q.estado]}</em>
                </button>
              </li>
            ))}
          </ul>
          )}

          {sel && (
            <Panel
              className="qdetail"
              title={sel.nome || 'Sem nome'}
              action={
                <select className="qstatus" value={sel.estado} onChange={(e) => setStatus(sel.id, e.target.value as QuoteStatus)} aria-label="Estado do pedido">
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              }
            >
              <button type="button" className="btn btn--ghost qback" onClick={() => setParams({}, { replace: true })}>
                <Ico name="esquerda" size={16} /> Todos os pedidos
              </button>
              <dl className="kv">
                <div>
                  <dt>Recebido</dt>
                  <dd>{dateFmt(sel.criadoEm)}</dd>
                </div>
                {sel.telefone && (
                  <div>
                    <dt>Telefone</dt>
                    <dd>
                      <a href={`tel:${digits(sel.telefone)}`}>{sel.telefone}</a> ·{' '}
                      <a href={`https://wa.me/${digits(sel.telefone)}`} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    </dd>
                  </div>
                )}
                {sel.local && (
                  <div>
                    <dt>Local</dt>
                    <dd>{sel.local}</dd>
                  </div>
                )}
                {sel.uso && (
                  <div>
                    <dt>Uso</dt>
                    <dd>{sel.uso}</dd>
                  </div>
                )}
                {sel.interesse && (
                  <div>
                    <dt>Interesse</dt>
                    <dd>{sel.interesse}</dd>
                  </div>
                )}
                <div>
                  <dt>Origem</dt>
                  <dd>{{ formulario: 'Formulário', simulador: 'Simulador', lista: 'Lista de cotação' }[sel.origem]}</dd>
                </div>
              </dl>
              {sel.itens && sel.itens.length > 0 && (
                <>
                  <h3 className="sub">Produtos pedidos</h3>
                  <ul className="plain">
                    {sel.itens.map((i) => (
                      <li key={i.produtoId}>
                        {i.qtd} × <Link to={`/produtos/${i.produtoId}`}>{i.nome}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {sel.mensagem && (
                <>
                  <h3 className="sub">Mensagem</h3>
                  <p className="msg">{sel.mensagem}</p>
                </>
              )}
              <div className="row">
                <button type="button" className="btn" onClick={() => startProposal(sel)}>
                  {proposals.some((p) => p.pedidoId === sel.id) ? 'Abrir a cotação' : 'Preparar a cotação'}
                </button>
                <button type="button" className="btn btn--line" onClick={() => {
                    setQuotes((all) => all.map((r) => (r.id === sel.id ? { ...r, arquivada: true } : r)))
                    setParams({}, { replace: true })
                    toast('Pedido arquivado')
                  }}>
                  Arquivar
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={async () => {
                    if (await confirm({ title: 'Eliminar este pedido?', text: 'Não é possível desfazer.', confirmLabel: 'Eliminar', danger: true })) {
                      setQuotes((all) => all.filter((r) => r.id !== sel.id))
                      setParams({}, { replace: true })
                      toast('Pedido eliminado')
                    }
                  }}
                >
                  <Ico name="lixo" size={16} /> Eliminar
                </button>
              </div>
            </Panel>
          )}
        </div>
      )}

      {proposals.length > 0 && (
        <Panel title="Cotações preparadas">
          <ul className="alist">
            {proposals.map((p) => (
              <li key={p.id} className="arow arow--promo">
                <span className={`chip chip--${p.estado === 'enviada' ? 'enviada' : 'em-preparacao'}`}>{p.estado === 'enviada' ? 'Enviada' : 'Rascunho'}</span>
                <div className="arow__main">
                  <strong>
                    {p.numero} · {p.cliente.nome || 'Sem cliente'}
                  </strong>
                  <small>Total {money(proposalTotals(p).total)}</small>
                </div>
                <span />
                <div className="arow__act">
                  <button type="button" className="btn btn--line btn--sm" onClick={() => setEditing(p)}>
                    <Ico name="editar" size={16} /> Abrir
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={async () => {
                      if (await confirm({ title: `Eliminar ${p.numero}?`, text: 'A cotação preparada é apagada. O pedido do cliente mantém-se.', confirmLabel: 'Eliminar', danger: true })) {
                        setProposals((all) => all.filter((x) => x.id !== p.id))
                        toast('Cotação eliminada')
                      }
                    }}
                  >
                    <Ico name="lixo" size={16} /> Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {editing && <ProposalEditor key={editing.id} proposal={editing} onSave={save} onClose={() => setEditing(null)} />}
    </>
  )
}
