import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { AdminLoginForm } from '../components/AdminLoginForm'
import { Logo } from '../components/Logo'
import { Ico, type IcoName } from '../components/Ico'
import { useStored } from '../lib/store'
import { isAdmin, signIn, signOut } from '../lib/adminSession'
import type { QuoteRequest } from '../data/admin'
import './admin.css'

const NO_QUOTES: QuoteRequest[] = []

const NAV: { to: string; label: string; icon: IcoName; end?: boolean }[] = [
  { to: '/admin', label: 'Resumo', icon: 'painel', end: true },
  { to: '/admin/cotacoes', label: 'Cotações', icon: 'cotacao' },
  { to: '/admin/catalogo', label: 'Catálogo', icon: 'caixa' },
  { to: '/admin/promocoes', label: 'Promoções', icon: 'etiqueta' },
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
          signIn()
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
              signOut()
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
