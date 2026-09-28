import { useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LeadForm } from '../components/forms/LeadForm'
import { FORMS, type FormKind } from '../components/forms/formDefs'
import { site, telLink, whatsappLink } from '../config/site'
import { productById } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'

const KINDS: FormKind[] = ['cotacao', 'grosso', 'fornecedor']

export default function Contact() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tipo') as FormKind | null
  const kind: FormKind = raw && KINDS.includes(raw) ? raw : 'cotacao'
  const produto = params.get('produto') ?? ''
  const uso = params.get('uso') ?? ''
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const product = productById(produto)
  const c = site.contactos

  usePageMeta('Contacto', 'Peça uma cotação à Tlhavika, faça um pedido de compra a grosso ou apresente-se como fornecedor.')

  const select = (k: FormKind) => {
    const next = new URLSearchParams(params)
    next.set('tipo', k)
    if (k !== 'cotacao') {
      next.delete('produto')
      next.delete('uso')
    }
    setParams(next, { replace: true })
  }

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = -1
    if (e.key === 'ArrowRight') n = (i + 1) % KINDS.length
    if (e.key === 'ArrowLeft') n = (i - 1 + KINDS.length) % KINDS.length
    if (e.key === 'Home') n = 0
    if (e.key === 'End') n = KINDS.length - 1
    if (n < 0) return
    e.preventDefault()
    select(KINDS[n])
    tabRefs.current[KINDS[n]]?.focus()
  }

  const initial: Record<string, string> = {}
  if (kind === 'cotacao') {
    if (produto) initial.produto = produto
    if (uso) initial.uso = uso
    else if (product) initial.uso = product.aplicacoes[0]
  }

  return (
    <div className="page">
      <header className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Localização">
            <Link to="/">Início</Link> <span aria-hidden="true">/</span> <span aria-current="page">Contacto</span>
          </nav>
          <h1 className="page-title">Fale connosco</h1>
          <p className="page-lede">Escolha o tipo de pedido. Respondemos pelo contacto que indicar.</p>
        </div>
      </header>

      <div className="container contact">
        <div className="contact__main">
          <div className="tabs" role="tablist" aria-label="Tipo de pedido">
            {KINDS.map((k, i) => (
              <button
                key={k}
                ref={(el) => {
                  tabRefs.current[k] = el
                }}
                id={`tab-${k}`}
                role="tab"
                type="button"
                aria-selected={kind === k}
                aria-controls={`panel-${k}`}
                tabIndex={kind === k ? 0 : -1}
                className="tabs__tab"
                onClick={() => select(k)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {FORMS[k].titulo}
              </button>
            ))}
          </div>
          <div id={`panel-${kind}`} role="tabpanel" aria-labelledby={`tab-${kind}`} className="tabs__panel">
            {product && kind === 'cotacao' && (
              <p className="contact__product">
                Pedido para: <strong>{product.nome}</strong>
              </p>
            )}
            <LeadForm key={`${kind}-${produto}-${uso}`} kind={kind} initial={initial} />
          </div>
        </div>

        <aside className="contact__aside" aria-label="Contactos diretos">
          <div className="contact-card">
            <h2>Contactos diretos</h2>
            <ul>
              <li>
                <span>Telefone</span>
                <a href={telLink(c.telefone)}>{c.telefone.valor}</a>
                <a href={telLink(c.telefoneAlternativo)}>{c.telefoneAlternativo.valor}</a>
              </li>
              <li>
                <span>Email</span>
                <a href={`mailto:${c.email.valor}`}>{c.email.valor}</a>
              </li>
              <li>
                <span>Morada</span>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.morada.valor + ', Moçambique')}`} target="_blank" rel="noopener noreferrer">
                  {c.morada.valor}
                </a>
              </li>
            </ul>
            <a className="btn btn--whatsapp btn--block" href={whatsappLink('Olá Tlhavika, gostaria de mais informações.')} target="_blank" rel="noopener noreferrer">
              Falar pelo WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
