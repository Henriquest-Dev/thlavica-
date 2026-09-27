import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories, contact, solutions, wa } from '../data/site'
import { products } from '../data/products'
import { useReveal } from '../lib/useReveal'
import { useMeta } from '../lib/useMeta'
import { PageHead } from '../components/PageHead'
import { Arrow } from '../components/Arrow'

const USES = ['Casa', 'Comércio', 'Agricultura', 'Instalação profissional']
const PHONE_RE = /^(\+?258)?\s?8[2-7]\s?\d{3}\s?\d{4}$|^\+\d[\d\s]{7,16}$/

/**
 * Pedido de cotação. Não há servidor: o formulário abre o WhatsApp com a
 * mensagem preenchida para o utilizador rever e enviar. Nunca se mostra
 * "enviado" — o pedido só chega quando o utilizador o envia no WhatsApp.
 */
export default function Contact() {
  const [params] = useSearchParams()
  useMeta('Contacto', 'Peça uma cotação à Tlhavika: energia solar, bombas de água e aquecimento solar.')
  useReveal()
  const pre = params.get('solucao') ?? (params.get('produto') ? `produto:${params.get('produto')}` : params.get('categoria') ? `categoria:${params.get('categoria')}` : '')
  const [v, setV] = useState({ nome: '', telefone: '', local: '', uso: '', interesse: pre, mensagem: '' })
  const [err, setErr] = useState<Record<string, string>>({})
  const [sent, setSent] = useState<null | { url: string; opened: boolean }>(null)

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setV({ ...v, [k]: e.target.value })
    setErr({ ...err, [k]: '' })
  }

  const label = (val: string) =>
    solutions.find((s) => s.id === val)?.name ?? products.find((p) => `produto:${p.id}` === val)?.name ?? categories.find((c) => `categoria:${c.id}` === val)?.name ?? val

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const n: Record<string, string> = {}
    if (!v.nome.trim()) n.nome = 'Indique o seu nome.'
    if (!PHONE_RE.test(v.telefone.trim())) n.telefone = 'Indique um número válido, ex.: 84 123 4567.'
    if (!v.local.trim()) n.local = 'Indique a cidade ou província.'
    if (!v.uso) n.uso = 'Escolha uma opção.'
    setErr(n)
    const first = Object.keys(n)[0]
    if (first) {
      document.getElementById(`f-${first}`)?.focus()
      return
    }
    const text = [
      'Olá Tlhavika, gostaria de uma cotação.',
      '',
      `Nome: ${v.nome}`,
      `Telefone: ${v.telefone}`,
      `Local: ${v.local}`,
      `Uso: ${v.uso}`,
      v.interesse && `Interesse: ${label(v.interesse)}`,
      v.mensagem && `Detalhes: ${v.mensagem}`,
    ]
      .filter(Boolean)
      .join('\n')
    const url = wa(text)
    const w = window.open(url, '_blank')
    if (w) w.opener = null
    setSent({ url, opened: Boolean(w) })
  }

  const field = (k: keyof typeof v, lab: string, input: React.ReactNode) => (
    <div className={`field${err[k] ? ' has-err' : ''}`}>
      <label htmlFor={`f-${k}`}>{lab}</label>
      {input}
      {err[k] && <p className="field__err">{err[k]}</p>}
    </div>
  )

  return (
    <div className="page">
      <PageHead kicker="Contacto" title={<>Pedir <em>cotação</em></>} lead="Diga-nos o local, o uso e o que precisa. Respondemos com uma proposta." />
      <div className="wrap contact">
        <form className="form reveal" onSubmit={submit} noValidate>
          <div className="form__grid">
            {field('nome', 'Nome *', <input id="f-nome" value={v.nome} onChange={set('nome')} autoComplete="name" />)}
            {field('telefone', 'Telefone / WhatsApp *', <input id="f-telefone" value={v.telefone} onChange={set('telefone')} inputMode="tel" autoComplete="tel" placeholder="+258 8X XXX XXXX" />)}
            {field('local', 'Local *', <input id="f-local" value={v.local} onChange={set('local')} placeholder="Cidade ou província" />)}
            {field(
              'uso',
              'Uso *',
              <select id="f-uso" value={v.uso} onChange={set('uso')}>
                <option value="">Escolher…</option>
                {USES.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>,
            )}
            <div className="field field--wide">
              <label htmlFor="f-interesse">Interesse</label>
              <select id="f-interesse" value={v.interesse} onChange={set('interesse')}>
                <option value="">Ainda não sei</option>
                <optgroup label="Soluções">
                  {solutions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Produtos">
                  {products.map((p) => (
                    <option key={p.id} value={`produto:${p.id}`}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Categorias">
                  {categories.map((c) => (
                    <option key={c.id} value={`categoria:${c.id}`}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="field field--wide">
              <label htmlFor="f-mensagem">Detalhes</label>
              <textarea id="f-mensagem" rows={4} value={v.mensagem} onChange={set('mensagem')} placeholder="Ex.: aparelhos e horas de uso, profundidade do furo, pessoas em casa…" />
            </div>
          </div>

          {sent && (
            <div className="notice" role="status">
              <p>
                <strong>{sent.opened ? 'Mensagem preparada no WhatsApp.' : 'Abra o WhatsApp para enviar.'}</strong> O pedido só chega à
                Tlhavika depois de carregar em Enviar no WhatsApp.
              </p>
              <a href={sent.url} target="_blank" rel="noopener noreferrer">
                Abrir WhatsApp
              </a>
            </div>
          )}

          <div className="form__foot">
            <button type="submit" className="pill pill--dark">
              Continuar no WhatsApp
              <span className="pill__icon">
                <Arrow size={12} />
              </span>
            </button>
            <p className="muted">Abre o WhatsApp com o pedido escrito, para rever e enviar.</p>
          </div>
        </form>

        <aside className="contact__side reveal">
          <p className="sol__h">Contacto direto</p>
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="contact__big">
            {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={contact.facebook} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </aside>
      </div>
    </div>
  )
}
