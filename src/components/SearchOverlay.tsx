import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categories } from '../data/site'
import { useCatalog } from '../lib/catalog'
import { useUi } from './Ui'
import { Ico } from './Ico'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const PAGES = [
  { label: 'Catálogo completo', to: '/produtos', hint: 'Todos os produtos' },
  { label: 'Serviços', to: '/servicos', hint: 'Energia solar, bombas de água e aquecimento solar' },
  { label: 'Simulador solar', to: '/servicos#simuladores', hint: 'Estime painéis, inversor e bateria' },
  { label: 'Simulador de bomba', to: '/servicos#simuladores', hint: 'Estime caudal, altura e potência' },
  { label: 'Aplicações', to: '/aplicacoes', hint: 'Casa, comércio, agricultura' },
  { label: 'Sobre a Tlhavika', to: '/sobre', hint: 'Quem somos' },
  { label: 'Pedir cotação', to: '/contacto', hint: 'Formulário e WhatsApp' },
]

interface Hit {
  key: string
  label: string
  hint: string
  to: string
  kind: 'produto' | 'pagina'
}

/** Pesquisa rápida (tecla "/" ou Ctrl+K): produtos e páginas. */
export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUi()
  const products = useCatalog()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const back = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (searchOpen) {
      back.current = document.activeElement as HTMLElement
      setQ('')
      setSel(0)
      requestAnimationFrame(() => input.current?.focus())
      document.documentElement.classList.add('menu-open')
    } else {
      document.documentElement.classList.remove('menu-open')
      back.current?.focus?.()
    }
  }, [searchOpen])

  const hits = useMemo<Hit[]>(() => {
    const n = norm(q.trim())
    const prod: Hit[] = products
      .filter((p) => !n || norm(`${p.name} ${p.brand ?? ''} ${p.model ?? ''} ${p.specs.map((s) => s.value).join(' ')}`).includes(n))
      .slice(0, n ? 8 : 5)
      .map((p) => ({
        key: p.id,
        label: p.name,
        hint: `${categories.find((c) => c.id === p.category)?.name ?? ''}${p.brand ? ` · ${p.brand}` : ''}`,
        to: `/produtos/${p.id}`,
        kind: 'produto',
      }))
    const pages: Hit[] = PAGES.filter((p) => !n || norm(`${p.label} ${p.hint}`).includes(n)).map((p) => ({ key: p.label, label: p.label, hint: p.hint, to: p.to, kind: 'pagina' }))
    return [...prod, ...pages]
  }, [q, products])

  if (!searchOpen) return null

  const go = (h: Hit) => {
    closeSearch()
    nav(h.to)
  }

  return (
    <div className="ov" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && closeSearch()}>
      <div className="gs" role="dialog" aria-modal="true" aria-label="Pesquisar no site">
        <div className="gs__bar">
          <Ico name="pesquisa" size={20} />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setSel(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeSearch()
              else if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSel((s) => Math.min(hits.length - 1, s + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSel((s) => Math.max(0, s - 1))
              } else if (e.key === 'Enter' && hits[sel]) go(hits[sel])
            }}
            placeholder="Procurar produto, marca ou potência"
            aria-label="Pesquisar"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-list"
            aria-activedescendant={hits[sel] ? `sr-${sel}` : undefined}
          />
          <button type="button" className="gs__close" onClick={closeSearch} aria-label="Fechar pesquisa">
            <Ico name="fechar" size={18} />
          </button>
        </div>
        <ul id="search-list" className="gs__list" role="listbox">
          {hits.map((h, i) => (
            <li key={h.key} id={`sr-${i}`} role="option" aria-selected={i === sel}>
              <button type="button" className={i === sel ? 'is-sel' : ''} onMouseEnter={() => setSel(i)} onClick={() => go(h)}>
                <span className="gs__kind">{h.kind === 'produto' ? 'Produto' : 'Página'}</span>
                <span className="gs__label">{h.label}</span>
                <span className="gs__hint">{h.hint}</span>
              </button>
            </li>
          ))}
          {hits.length === 0 && <li className="gs__empty">Nada encontrado para “{q}”. Tente o nome da marca ou a potência, por exemplo “1500 W”.</li>}
        </ul>
        <p className="gs__foot">↑ ↓ para escolher · Enter para abrir · Esc para fechar</p>
      </div>
    </div>
  )
}
