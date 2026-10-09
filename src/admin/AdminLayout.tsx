import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Ico, type IcoName } from '../components/Ico'
import { useStored } from '../lib/store'
import type { QuoteRequest } from '../data/admin'
import './admin.css'

const NO_QUOTES: QuoteRequest[] = []
const KEY = 'tlh:admin'

const NAV: { to: string; label: string; icon: IcoName; end?: boolean }[] = [
  { to: '/admin', label: 'Resumo', icon: 'painel', end: true },
  { to: '/admin/cotacoes', label: 'Cotações', icon: 'cotacao' },
  { to: '/admin/catalogo', label: 'Catálogo', icon: 'caixa' },
  { to: '/admin/promocoes', label: 'Promoções', icon: 'etiqueta' },
  { to: '/admin/midia', label: 'Vídeos e fotos', icon: 'video' },
]

function Gate({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="adm adm--gate">
      <form
        className="gate"
        onSubmit={(e) => {
          e.preventDefault()
          onEnter()
        }}
      >
        <Logo className="logo--dark" />
        <h1>Administração</h1>
        <p className="muted">Gerir catálogo, cotações, promoções e vídeos do site.</p>
        <label>
          Email
          <input type="email" autoComplete="username" placeholder="nome@empresa.co.mz" />
        </label>
        <label>
          Palavra-passe
          <input type="password" autoComplete="current-password" />
        </label>
        <button type="submit" className="btn">
          Entrar
        </button>
        <p className="gate__note">
          Protótipo: ainda não há contas nem proteção real. Os dados ficam só neste dispositivo e passam para a base de dados (Supabase) numa fase seguinte.
        </p>
        <Link to="/" className="gate__back">
          Voltar ao site
        </Link>
      </form>
    </div>
  )
}

export default function AdminLayout() {
  const [ok, setOk] = useState(() => {
    try {
      return window.sessionStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })
  const [quotes] = useStored<QuoteRequest[]>('quotes', NO_QUOTES)
  const fresh = quotes.filter((q) => q.estado === 'nova' && !q.arquivada).length

  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex'
    document.head.appendChild(m)
    const t = document.title
    document.title = 'Administração — Tlhavika'
    return () => {
      m.remove()
      document.title = t
    }
  }, [])

  if (!ok)
    return (
      <Gate
        onEnter={() => {
          try {
            window.sessionStorage.setItem(KEY, '1')
          } catch {
            /* ignorar */
          }
          setOk(true)
        }}
      />
    )

  return (
    <div className="adm">
      <aside className="adm__side">
        <Link to="/admin" className="adm__brand" aria-label="Administração Tlhavika">
          <Logo />
        </Link>
        <nav aria-label="Administração">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <Ico name={n.icon} size={18} />
              <span>{n.label}</span>
              {n.to.endsWith('cotacoes') && fresh > 0 && <b className="adm__badge">{fresh}</b>}
            </NavLink>
          ))}
        </nav>
        <div className="adm__foot">
          <Link to="/">
            <Ico name="olho" size={18} /> Ver o site
          </Link>
          <button
            type="button"
            onClick={() => {
              try {
                window.sessionStorage.removeItem(KEY)
              } catch {
                /* ignorar */
              }
              setOk(false)
            }}
          >
            <Ico name="sair" size={18} /> Sair
          </button>
        </div>
      </aside>
      <main className="adm__main" id="main">
        <p className="adm__proto">Protótipo: os dados ficam neste dispositivo até ligar ao Supabase.</p>
        <Outlet />
      </main>
    </div>
  )
}
