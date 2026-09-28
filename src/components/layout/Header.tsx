import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'

export const NAV = [
  { to: '/', label: 'Início', end: true },
  { to: '/solucoes', label: 'Soluções' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/projetos', label: 'Projetos' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/contacto', label: 'Contacto' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const menuBtn = useRef<HTMLButtonElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const onHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        menuBtn.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus()
  }, [searchOpen])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/catalogo?q=${encodeURIComponent(term)}` : '/catalogo')
    setQ('')
  }

  const cls = ['site-header', scrolled || !onHome ? 'is-solid' : 'is-overlay', open ? 'is-open' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <header className={cls}>
      <div className="site-header__inner container">
        <Link to="/" className="site-header__logo" aria-label="TLHAVIKA — página inicial">
          <Logo />
        </Link>

        <nav className="site-nav" aria-label="Principal">
          <ul>
            {NAV.slice(1).map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end}>
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <form className={`header-search${searchOpen ? ' is-open' : ''}`} role="search" onSubmit={submitSearch}>
            <label htmlFor="header-search" className="visually-hidden">
              Pesquisar no catálogo
            </label>
            <input
              ref={searchInput}
              id="header-search"
              type="search"
              placeholder="Pesquisar produtos…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onBlur={() => !q && setSearchOpen(false)}
              tabIndex={searchOpen ? 0 : -1}
            />
            <button
              type={searchOpen ? 'submit' : 'button'}
              className="icon-btn"
              aria-label={searchOpen ? 'Pesquisar' : 'Abrir pesquisa'}
              onClick={(e) => {
                if (!searchOpen) {
                  e.preventDefault()
                  setSearchOpen(true)
                }
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </form>
          <Link to="/contacto?tipo=cotacao" className="btn btn--header">
            Pedir cotação
          </Link>
          <button
            ref={menuBtn}
            type="button"
            className="icon-btn menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="menu-toggle__bars" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label="Menu móvel">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end}>
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <form className="mobile-menu__search" role="search" onSubmit={submitSearch}>
          <label htmlFor="mobile-search" className="visually-hidden">
            Pesquisar no catálogo
          </label>
          <input id="mobile-search" type="search" placeholder="Pesquisar produtos…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="submit" className="btn btn--primary">
            Pesquisar
          </button>
        </form>
        <Link to="/contacto?tipo=cotacao" className="btn btn--primary btn--block">
          Pedir cotação
        </Link>
      </div>
    </header>
  )
}
