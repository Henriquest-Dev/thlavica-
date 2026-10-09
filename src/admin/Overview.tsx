import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { clearData, exportData, importData, useStored, usageKb } from '../lib/store'
import { useCatalog } from '../lib/catalog'
import { promoLive } from '../lib/promos'
import { DEFAULT_MEDIA, FORMAT_LABEL, STATUS_LABEL, type MediaItem, type Promo, type QuoteRequest, type Proposal } from '../data/admin'
import { Ico } from '../components/Ico'
import { MediaCarousel } from '../components/MediaCarousel'
import { money, proposalTotals } from '../lib/proposal'
import { useFeedback } from './feedback'
import { PageTitle, Panel, dateFmt, Empty } from './ui'

const NO_Q: QuoteRequest[] = []
const NO_P: Promo[] = []
const NO_PR: Proposal[] = []
const MEDIA0: MediaItem[] = DEFAULT_MEDIA

export default function Overview() {
  const { toast, confirm } = useFeedback()
  const [quotes] = useStored<QuoteRequest[]>('quotes', NO_Q)
  const [proposals] = useStored<Proposal[]>('proposals', NO_PR)
  const [promos] = useStored<Promo[]>('promos', NO_P)
  const [media] = useStored<MediaItem[]>('media', MEDIA0)
  const all = useCatalog(true)
  const shown = all.filter((p) => !p.hidden).length
  const open = quotes.filter((q) => !q.arquivada)
  const file = useRef<HTMLInputElement>(null)

  const exportAll = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }))
    a.download = `tlhavika-dados-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Cópia descarregada')
  }

  const importAll = async (f: File) => {
    try {
      const n = importData(await f.text())
      toast(`Dados restaurados (${n} secções)`)
    } catch {
      toast('Ficheiro inválido. Use um ficheiro exportado por este painel.', 'erro')
    }
  }

  const live = promos.filter((p) => promoLive(p))
  const sentValue = proposals.filter((p) => p.estado === 'enviada').reduce((n, p) => n + proposalTotals(p).total, 0)
  const toAnswer = open.filter((q) => q.estado === 'nova' || q.estado === 'em-preparacao')

  const stats = [
    { n: open.filter((q) => q.estado === 'nova').length, l: 'Cotações novas', to: '/admin/cotacoes' },
    { n: open.filter((q) => q.estado === 'em-preparacao').length, l: 'Em preparação', to: '/admin/cotacoes' },
    { n: proposals.filter((p) => p.estado === 'enviada').length, l: sentValue ? `Propostas enviadas · ${money(sentValue)}` : 'Propostas enviadas', to: '/admin/cotacoes' },
    { n: `${shown}/${all.length}`, l: 'Produtos visíveis', to: '/admin/catalogo' },
    { n: live.length, l: 'Promoções no ar', to: '/admin/promocoes' },
    { n: media.filter((m) => m.ativo).length, l: 'Itens no carrossel', to: '/admin/midia' },
  ]

  return (
    <>
      <PageTitle keepLead title="Resumo" lead={toAnswer.length ? `${toAnswer.length} ${toAnswer.length === 1 ? 'pedido espera' : 'pedidos esperam'} resposta.` : 'Nada à espera de resposta.'} />

      <Panel title="Para responder" action={<Link to="/admin/cotacoes">Ver todos os pedidos</Link>} className="panel--lead">
        {toAnswer.length === 0 ? (
          <Empty title="Sem pedidos por responder" text="Quando um visitante pedir cotação no site (formulário, simulador ou lista), aparece aqui." />
        ) : (
          <ul className="mini">
            {toAnswer.slice(0, 6).map((q) => (
              <li key={q.id}>
                <Link to={`/admin/cotacoes?id=${q.id}`}>
                  <span>
                    <strong>{q.nome || 'Sem nome'}</strong>
                    <small>
                      {dateFmt(q.criadoEm)}
                      {q.itens?.length ? ` · ${q.itens.length} produto${q.itens.length > 1 ? 's' : ''}` : ''}
                      {q.local ? ` · ${q.local}` : ''}
                    </small>
                  </span>
                  <em className={`chip chip--${q.estado}`}>{STATUS_LABEL[q.estado]}</em>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <ul className="stats">
        {stats.map((s) => (
          <li key={s.l}>
            <Link to={s.to}>
              <strong>{s.n}</strong>
              <span>{s.l}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="two">
        <Panel title="No ar agora" action={<Link to="/admin/promocoes">Gerir</Link>}>
          {live.length === 0 ? (
            <Empty title="Nenhuma promoção no ar" text="Crie uma faixa, um banner ou um pop-up para destacar uma oferta." />
          ) : (
            <ul className="mini">
              {live.map((p) => (
                <li key={p.id}>
                  <Link to="/admin/promocoes">
                    <span>
                      <strong>{p.titulo}</strong>
                      <small>{FORMAT_LABEL[p.formato]}</small>
                    </span>
                    <em className="chip chip--on">No ar</em>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Atalhos">
          <ul className="quick">
            <li>
              <Link to="/admin/cotacoes?nova=1">
                <Ico name="cotacao" size={20} /> Preparar uma cotação
              </Link>
            </li>
            <li>
              <Link to="/admin/catalogo?novo=1">
                <Ico name="caixa" size={20} /> Adicionar um produto
              </Link>
            </li>
            <li>
              <Link to="/admin/promocoes?novo=1">
                <Ico name="etiqueta" size={20} /> Criar uma promoção
              </Link>
            </li>
            <li>
              <Link to="/admin/midia">
                <Ico name="video" size={20} /> Pôr um vídeo no carrossel
              </Link>
            </li>
            <li>
              <Link to="/admin/contactos">
                <Ico name="telefone" size={20} /> Atualizar os contactos
              </Link>
            </li>
          </ul>
        </Panel>
      </div>

      <Panel title="Vídeos e fotos em rotação" action={<Link to="/admin/midia">Gerir</Link>}>
        <MediaCarousel />
      </Panel>

      <Panel title="Dados deste dispositivo">
        <p className="muted">
          Tudo o que cria aqui fica guardado neste navegador ({usageKb()} KB de cerca de 5 000 KB). Exporte uma cópia antes de limpar o navegador; ao ligar ao Supabase, esse ficheiro serve para passar os dados.
        </p>
        <div className="row">
          <button type="button" className="btn btn--line" onClick={exportAll}>
            <Ico name="carregar" size={16} className="flip" /> Exportar dados
          </button>
          <button type="button" className="btn btn--line" onClick={() => file.current?.click()}>
            <Ico name="carregar" size={16} /> Importar dados
          </button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importAll(e.target.files[0])} />
          <button
            type="button"
            className="btn btn--danger"
            onClick={async () => {
              if (await confirm({ title: 'Apagar todos os dados?', text: 'Pedidos, propostas, promoções, vídeos, contactos e alterações ao catálogo deste aparelho. Exporte uma cópia antes, se precisar.', confirmLabel: 'Apagar tudo', danger: true })) {
                clearData()
                toast('Dados apagados')
              }
            }}
          >
            <Ico name="lixo" size={16} /> Apagar dados
          </button>
        </div>
      </Panel>
    </>
  )
}
