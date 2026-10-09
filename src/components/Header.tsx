import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { Ico } from './Ico'
import { PromoStrip } from './Promos'
import { useUi } from './Ui'
import { useQuoteList } from '../lib/quotes'
import { smooth } from '../lib/smooth'

const LINKS = [
  { to: '/produtos', label: 'Catálogo' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/aplicacoes', label: 'Aplicações' },
  { to: '/sobre', label: 'Sobre' },
]

export function Header() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const { openSearch, openList } = useUi()
  const { items } = useQuoteList()
  const count = items.reduce((n, i) => n + i.qtd, 0)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (open) smooth()?.stop()
    else smooth()?.start()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  return (
    <>
      <PromoStrip />
      <header className={`hd${open ? ' hd--open' : ''}`}>
        <div className="hd__bar">
          <Link to="/" className="hd__logo" aria-label="Tlhavika — início">
            <Logo />
          </Link>
          <nav className="hd__nav" aria-label="Principal">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="hd__tools">
            <button type="button" className="hd__icon" onClick={openSearch} aria-label="Pesquisar (tecla /)">
              <Ico name="pesquisa" size={19} />
            </button>
            <button type="button" className="hd__icon" onClick={openList} aria-label={`Lista de cotação, ${count} ${count === 1 ? 'item' : 'itens'}`}>
              <Ico name="lista" size={19} />
              {count > 0 && <span className="hd__count">{count}</span>}
            </button>
          </div>
          <Link to="/contacto" className="pill pill--amber hd__cta">
            Pedir cotação
          </Link>
          <button type="button" className="hd__menu" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen((v) => !v)}>
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
    </>
  )
}
