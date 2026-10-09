import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AdminLoginForm } from '../components/AdminLoginForm'
import { Logo } from '../components/Logo'
import { Ico, type IcoName } from '../components/Ico'
import { useStored } from '../lib/store'
import { isAdmin, signIn, signOut } from '../lib/adminSession'
import type { QuoteRequest } from '../data/admin'
import { FeedbackProvider } from './feedback'
import './admin.css'

const NO_QUOTES: QuoteRequest[] = []

interface Item {
  to: string
  label: string
  icon: IcoName
  end?: boolean
}

/** Os quatro destinos de todos os dias; o resto fica em "Mais". */
const MAIN: Item[] = [
  { to: '/admin', label: 'Resumo', icon: 'painel', end: true },
  { to: '/admin/cotacoes', label: 'Cotações', icon: 'cotacao' },
  { to: '/admin/catalogo', label: 'Catálogo', icon: 'caixa' },
  { to: '/admin/promocoes', label: 'Promoções', icon: 'etiqueta' },
]
const MORE: Item[] = [
  { to: '/admin/midia', label: 'Vídeos e fotos', icon: 'video' },
  { to: '/admin/contactos', label: 'Contactos', icon: 'telefone' },
]

function Gate({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="adm adm--gate">
      <div className="gate">
        <Logo className="logo--dark" />
        <h1>Administração</h1>
        <p className="muted">Gerir catálogo, cotações, promoções e vídeos do site.</p>
        <AdminLoginForm onSuccess={onEnter} />
        <p className="gate__note">Protótipo: a verificação é feita neste navegador. A proteção real chega com a base de dados (Supabase).</p>
        <Link to="/" className="gate__back">
          Voltar ao site
        </Link>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [ok, setOk] = useState(isAdmin)
  const [more, setMore] = useState(false)
  const [quotes] = useStored<QuoteRequest[]>('quotes', NO_QUOTES)
  const { pathname } = useLocation()
  const fresh = quotes.filter((q) => q.estado === 'nova' && !q.arquivada).length
  const current = [...MAIN, ...MORE].find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))

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

  useEffect(() => setMore(false), [pathname])

  if (!ok)
    return (
      <Gate
        onEnter={() => {
          signIn()
          setOk(true)
        }}
      />
    )

  const logout = () => {
    signOut()
    setOk(false)
  }

  const link = (n: Item) => (
    <NavLink key={n.to} to={n.to} end={n.end}>
      <Ico name={n.icon} size={22} />
      <span>{n.label}</span>
      {n.to.endsWith('cotacoes') && fresh > 0 && <b className="adm__badge">{fresh}</b>}
    </NavLink>
  )

  return (
    <FeedbackProvider>
      <div className="adm">
        {/* Computador: barra lateral fixa */}
        <aside className="adm__side">
          <Link to="/admin" className="adm__brand" aria-label="Administração Tlhavika">
            <Logo />
          </Link>
          <nav aria-label="Administração">{[...MAIN, ...MORE].map(link)}</nav>
          <div className="adm__foot">
            <Link to="/">
              <Ico name="olho" size={20} /> Ver o site
            </Link>
            <button type="button" onClick={logout}>
              <Ico name="sair" size={20} /> Sair
            </button>
            <p>Protótipo · os dados ficam neste aparelho</p>
          </div>
        </aside>

        {/* Telemóvel: barra de cima fixa e menu em baixo; nada desliza para os lados */}
        <header className="adm__bar">
          <Link to="/admin" className="adm__barlogo" aria-label="Administração Tlhavika">
            <img src={`${import.meta.env.BASE_URL}img/logo-simbolo.svg`} alt="" width={28} height={28} />
          </Link>
          <p className="adm__bartitle">{current?.label ?? 'Administração'}</p>
          <Link to="/" className="adm__barsite">
            Ver o site
          </Link>
        </header>

        <main className="adm__main" id="main">
          <Outlet />
        </main>

        <nav className="adm__tabs" aria-label="Administração">
          {MAIN.map(link)}
          <button type="button" className={MORE.some((m) => pathname.startsWith(m.to)) ? 'is-on' : ''} aria-expanded={more} onClick={() => setMore((v) => !v)}>
            <Ico name="mais" size={22} />
            <span>Mais</span>
          </button>
        </nav>

        {more && (
          <div className="amodal amodal--sheet" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setMore(false)}>
            <div className="asheet" role="dialog" aria-modal="true" aria-label="Mais opções">
              {MORE.map((n) => (
                <NavLink key={n.to} to={n.to}>
                  <Ico name={n.icon} size={22} /> {n.label}
                </NavLink>
              ))}
              <Link to="/">
                <Ico name="olho" size={22} /> Ver o site
              </Link>
              <button type="button" onClick={logout}>
                <Ico name="sair" size={22} /> Sair
              </button>
              <p>Protótipo · os dados ficam neste aparelho</p>
            </div>
          </div>
        )}
      </div>
    </FeedbackProvider>
  )
}
