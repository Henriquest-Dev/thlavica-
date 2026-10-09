import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStored, removeStored } from '../lib/store'
import { useCatalog } from '../lib/catalog'
import { promoLive } from '../lib/promos'
import { DEFAULT_MEDIA, STATUS_LABEL, type MediaItem, type Promo, type QuoteRequest, type Proposal } from '../data/admin'
import { Ico } from '../components/Ico'
import { PageTitle, Panel, dateFmt, Empty } from './ui'

const NO_Q: QuoteRequest[] = []
const NO_P: Promo[] = []
const NO_PR: Proposal[] = []
const MEDIA0: MediaItem[] = DEFAULT_MEDIA
const KEYS = ['quotes', 'proposals', 'promos', 'media', 'catalog.custom', 'catalog.overrides', 'list']

function usedKb() {
  let n = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('tlh:')) n += (k.length + (localStorage.getItem(k)?.length ?? 0)) * 2
    }
  } catch {
    return 0
  }
  return Math.round(n / 1024)
}

export default function Overview() {
  const [quotes] = useStored<QuoteRequest[]>('quotes', NO_Q)
  const [proposals] = useStored<Proposal[]>('proposals', NO_PR)
  const [promos] = useStored<Promo[]>('promos', NO_P)
  const [media] = useStored<MediaItem[]>('media', MEDIA0)
  const all = useCatalog(true)
  const shown = all.filter((p) => !p.hidden).length
  const open = quotes.filter((q) => !q.arquivada)
  const file = useRef<HTMLInputElement>(null)

  const exportAll = () => {
    const data: Record<string, unknown> = {}
    for (const k of KEYS) {
      const raw = localStorage.getItem('tlh:' + k)
      if (raw) data[k] = JSON.parse(raw)
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `tlhavika-dados-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importAll = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as Record<string, unknown>
      for (const k of KEYS) if (k in data) localStorage.setItem('tlh:' + k, JSON.stringify(data[k]))
      window.location.reload()
    } catch {
      window.alert('Ficheiro inválido. Use um ficheiro exportado por este painel.')
    }
  }

  const stats = [
    { n: open.filter((q) => q.estado === 'nova').length, l: 'Cotações novas', to: '/admin/cotacoes' },
    { n: open.filter((q) => q.estado === 'em-preparacao').length, l: 'Em preparação', to: '/admin/cotacoes' },
    { n: proposals.filter((p) => p.estado === 'enviada').length, l: 'Propostas enviadas', to: '/admin/cotacoes' },
    { n: `${shown}/${all.length}`, l: 'Produtos visíveis', to: '/admin/catalogo' },
    { n: promos.filter((p) => promoLive(p)).length, l: 'Promoções ativas', to: '/admin/promocoes' },
    { n: media.filter((m) => m.ativo).length, l: 'Itens no carrossel', to: '/admin/midia' },
  ]

  return (
    <>
      <PageTitle title="Resumo" lead="O que precisa de atenção hoje." />
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
        <Panel title="Pedidos recentes" action={<Link to="/admin/cotacoes">Ver todos</Link>}>
          {open.length === 0 ? (
            <Empty title="Ainda não há pedidos" text="Quando um visitante pedir cotação no site (formulário, simulador ou lista), aparece aqui." />
          ) : (
            <ul className="mini">
              {open.slice(0, 6).map((q) => (
                <li key={q.id}>
                  <Link to={`/admin/cotacoes?id=${q.id}`}>
                    <span>
                      <strong>{q.nome || 'Sem nome'}</strong>
                      <small>{dateFmt(q.criadoEm)}</small>
                    </span>
                    <em className={`chip chip--${q.estado}`}>{STATUS_LABEL[q.estado]}</em>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Atalhos">
          <ul className="quick">
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
              <Link to="/admin/cotacoes?nova=1">
                <Ico name="cotacao" size={20} /> Preparar uma cotação
              </Link>
            </li>
          </ul>
        </Panel>
      </div>

      <Panel title="Dados deste dispositivo">
        <p className="muted">
          Tudo o que cria aqui fica guardado neste navegador ({usedKb()} KB de cerca de 5 000 KB). Exporte uma cópia antes de limpar o navegador; ao ligar ao Supabase, esse ficheiro serve para passar os dados.
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
            onClick={() => {
              if (window.confirm('Apagar todos os dados guardados neste dispositivo (pedidos, propostas, promoções, vídeos e alterações ao catálogo)?')) {
                KEYS.forEach(removeStored)
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
