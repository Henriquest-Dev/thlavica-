import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Wordmark } from './Wordmark'
import { Arrow } from './Arrow'
import { smooth } from '../lib/smooth'

const LINKS = [
  { to: '/solucoes/energia-solar', label: 'Energia solar' },
  { to: '/solucoes/bombagem', label: 'Bombas de água' },
  { to: '/solucoes/aquecimento-solar', label: 'Aquecimento solar' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/aplicacoes', label: 'Aplicações' },
  { to: '/sobre', label: 'Sobre' },
]

export function Header() {
  const { pathname } = useLocation()
  const home = pathname === '/'
  const [compact, setCompact] = useState(!home)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
    if (!home) {
      setCompact(true)
      return
    }
    // Na página inicial o menu fica dentro da moldura da hero até ela sair.
    const on = () => setCompact(window.scrollY > window.innerHeight * 0.35)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [home, pathname])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (open) smooth()?.stop()
    else smooth()?.start()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  return (
    <header className={`hd${compact ? ' hd--compact' : ''}${open ? ' hd--open' : ''}`}>
      <div className="hd__bar">
        <Link to="/" className="hd__logo" aria-label="Tlhavika — início">
          <Wordmark />
        </Link>
        <nav className="hd__nav" aria-label="Principal">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/contacto" className="pill pill--line hd__cta">
          Contacto
          <span className="pill__icon">
            <Arrow size={12} />
          </span>
        </Link>
        <button
          type="button"
          className="hd__menu"
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
      <div id="menu" className="menu" hidden={!open}>
        <nav aria-label="Menu">
          {[{ to: '/', label: 'Início' }, ...LINKS, { to: '/contacto', label: 'Contacto' }].map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
