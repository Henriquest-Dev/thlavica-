import { useState } from 'react'
import { Ico } from '../components/Ico'
import { useSearchParams } from 'react-router-dom'
import { categories, solutions, useContact, wa } from '../data/site'
import { useCatalog } from '../lib/catalog'
import { activeDiscount } from '../lib/pricing'
import { saveQuoteRequest, takePrefill, useQuoteList } from '../lib/quotes'
import { useReveal } from '../lib/useReveal'
import { useSeo } from '../lib/seo'
import { PageHead } from '../components/PageHead'
import { Arrow } from '../components/Arrow'
import { ThankYou } from '../components/ThankYou'

const USES = ['Casa', 'Comércio', 'Agricultura', 'Instalação profissional']
const PHONE_RE = /^(\+?258)?\s?8[2-7]\s?\d{3}\s?\d{4}$|^\+\d[\d\s]{7,16}$/

/**
 * Pedido de cotação. Ao enviar, o pedido fica guardado (aparece no painel da empresa e gera um aviso) e o cliente
 * vê um agradecimento. O WhatsApp é só uma opção à parte, para quem preferir falar já.
 */
export default function Contact() {
  const [params] = useSearchParams()
  const contact = useContact()
  useSeo({
    title: 'Pedir cotação e contactos',
    description: 'Peça uma cotação à Tlhavika: energia solar, bombas de água e aquecimento solar. Fale connosco por telefone, WhatsApp ou email, em Maputo.',
    path: '/contacto',
  })
  useReveal()
  const pre = params.get('solucao') ?? (params.get('produto') ? `produto:${params.get('produto')}` : params.get('categoria') ? `categoria:${params.get('categoria')}` : '')
  const products = useCatalog()
  const { items: listed, clear: clearList } = useQuoteList()
  const fromList = params.get('lista') === '1'
  const listLines = listed
    .map((i) => ({ ...i, p: products.find((p) => p.id === i.id) }))
    .filter((r): r is typeof r & { p: NonNullable<typeof r.p> } => Boolean(r.p))
  const [v, setV] = useState(() => ({ nome: '', telefone: '', local: '', uso: '', interesse: pre, mensagem: takePrefill() }))
  const [err, setErr] = useState<Record<string, string>>({})
  const [thanks, setThanks] = useState<null | { nome: string; telefone: string }>(null)

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setV({ ...v, [k]: e.target.value })
    setErr({ ...err, [k]: '' })
  }

  // produto escolhido no formulário (vindo da página do produto ou do campo Interesse)
  const picked = v.interesse.startsWith('produto:') ? products.find((p) => `produto:${p.id}` === v.interesse) : undefined
  const itemOf = (p: (typeof products)[number], qtd: number) => {
    const desconto = activeDiscount(p)
    return { produtoId: p.id, nome: p.name, qtd, ...(p.price ? { preco: p.price } : {}), ...(desconto ? { desconto } : {}) }
  }

  const label = (val: string) =>
    solutions.find((s) => s.id === val)?.name ?? products.find((p) => `produto:${p.id}` === val)?.name ?? categories.find((c) => `categoria:${c.id}` === val)?.name ?? val

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // campo-isco: as pessoas não o veem nem o preenchem; os robôs preenchem tudo
    const trap = (e.currentTarget.elements.namedItem('website') as HTMLInputElement | null)?.value
    const n: Record<string, string> = {}
    if (!v.nome.trim()) n.nome = 'Indique o seu nome.'
    if (!PHONE_RE.test(v.telefone.trim())) n.telefone = 'Indique o número do seu WhatsApp, ex.: 84 123 4567.'
    if (!v.local.trim()) n.local = 'Indique a cidade ou província.'
    if (!v.uso) n.uso = 'Escolha uma opção.'
    setErr(n)
    const first = Object.keys(n)[0]
    if (first) {
      document.getElementById(`f-${first}`)?.focus()
      return
    }
    const items = fromList
      ? listLines.map((r) => itemOf(r.p, r.qtd))
      : picked
        ? [itemOf(picked, 1)]
        : undefined
    if (!trap)
      saveQuoteRequest({
        nome: v.nome.trim(),
        telefone: v.telefone.trim(),
        local: v.local.trim(),
        uso: v.uso,
        interesse: v.interesse ? label(v.interesse) : undefined,
        mensagem: v.mensagem.trim() || undefined,
        itens: items,
        origem: fromList ? 'lista' : v.mensagem.startsWith('Simulação') ? 'simulador' : 'formulario',
      })
    setThanks({ nome: v.nome.trim(), telefone: v.telefone.trim() })
  }

  const closeThanks = () => {
    setThanks(null)
    if (fromList) clearList()
    setV({ nome: '', telefone: '', local: '', uso: '', interesse: '', mensagem: '' })
  }

  /** Para quem prefere falar já no WhatsApp (opcional): mensagem preparada com o que já escreveu. */
  const whatsappText = () =>
    [
      'Olá Tlhavika, gostaria de uma cotação.',
      v.nome.trim() && `Nome: ${v.nome.trim()}`,
      v.interesse && `Interesse: ${label(v.interesse)}`,
      fromList && listLines.length > 0 && `Produtos:\n${listLines.map((r) => `• ${r.qtd} × ${r.p.name}`).join('\n')}`,
      v.mensagem.trim() && `Detalhes: ${v.mensagem.trim()}`,
    ]
      .filter(Boolean)
      .join('\n')

  const field = (k: keyof typeof v, lab: string, input: React.ReactNode) => (
    <div className={`field${err[k] ? ' has-err' : ''}`}>
      <label htmlFor={`f-${k}`}>{lab}</label>
      {input}
      {err[k] && <p className="field__err">{err[k]}</p>}
    </div>
  )

  return (
    <div className="page">
      <PageHead title="Pedir cotação" lead="Diga-nos o local, o uso e o que precisa. Respondemos com uma proposta." />
      <div className="wrap contact">
        <form className="form reveal" onSubmit={submit} noValidate>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
          <div className="form__grid">
            {field('nome', 'Nome *', <input id="f-nome" value={v.nome} onChange={set('nome')} autoComplete="name" maxLength={120} />)}
            {field(
              'telefone',
              'Número do WhatsApp *',
              <>
                <input id="f-telefone" value={v.telefone} onChange={set('telefone')} inputMode="tel" autoComplete="tel" maxLength={40} placeholder="+258 8X XXX XXXX" aria-describedby="f-telefone-dica" />
                <small id="f-telefone-dica" className="field__hint">
                  Escreva o número que tem WhatsApp: é por lá que lhe respondemos.
                </small>
              </>,
            )}
            {field('local', 'Local *', <input id="f-local" value={v.local} onChange={set('local')} maxLength={160} placeholder="Cidade ou província" />)}
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
              <textarea id="f-mensagem" rows={4} maxLength={3000} value={v.mensagem} onChange={set('mensagem')} placeholder="Ex.: aparelhos e horas de uso, profundidade do furo, pessoas em casa…" />
            </div>
          </div>

          {picked && activeDiscount(picked) > 0 && (
            <p className="promo-note" role="status">
              <span className="selo">-{activeDiscount(picked)}%</span> O produto escolhido tem desconto. Fica registado no seu pedido.
            </p>
          )}

          {fromList && listLines.length > 0 && (
            <div className="field field--wide listbox">
              <p className="sol__h">Produtos da lista de cotação</p>
              <ul>
                {listLines.map((r) => (
                  <li key={r.id}>
                    <span>{r.qtd} ×</span> {r.p.name}
                    {activeDiscount(r.p) > 0 && <span className="selo selo--sm"> -{activeDiscount(r.p)}%</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="form__foot">
            <button type="submit" className="pill pill--dark">
              Enviar pedido de cotação
              <span className="pill__icon">
                <Arrow size={12} />
              </span>
            </button>
            <p className="muted">
              Respondemos com uma proposta, pelo WhatsApp.{' '}
              <a className="optional" href={wa(whatsappText())} target="_blank" rel="noopener noreferrer">
                Prefere falar já no WhatsApp?
              </a>
            </p>
          </div>
        </form>

        <aside className="contact__side reveal">
          <p className="sol__h">Contacto direto</p>
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="contact__big">
            {contact.phone}
          </a>
          <a href={wa('Olá Tlhavika, gostaria de mais informações.')} target="_blank" rel="noopener noreferrer">
            <Ico name="whatsapp" size={18} /> WhatsApp
          </a>
          <a href={`mailto:${contact.email}`}>
            <Ico name="correio" size={18} /> {contact.email}
          </a>
          <p className="contact__addr">
            <Ico name="local" size={18} /> {contact.address}
          </p>
          <a href={contact.facebook} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </aside>
      </div>
      {thanks && <ThankYou nome={thanks.nome} telefone={thanks.telefone} onClose={closeThanks} />}
    </div>
  )
}
