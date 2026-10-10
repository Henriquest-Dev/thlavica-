import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FORMAT_LABEL, type Promo, type PromoFormat, type PromoStyle } from '../data/admin'
import { productImage, useCatalog, type CatalogProduct } from '../lib/catalog'
import { endInDays, MAX_PROMO_PRODUCTS, normalizePromo, promoLink, promoLive, promoProducts, promoStyle, usePromos } from '../lib/promos'
import { saveImage } from '../lib/images'
import { uid } from '../lib/store'
import { Ico } from '../components/Ico'
import { useFeedback } from './feedback'
import { Choice, Empty, Field, Modal, PageTitle, Panel, Switch } from './ui'

const blank = (formato: PromoFormat = 'faixa'): Promo => ({
  id: uid(),
  formato,
  titulo: '',
  texto: '',
  selo: '',
  cta: 'Ver promoção',
  destino: '/produtos',
  alvo: 'catalogo',
  produtos: [],
  inicio: '',
  fim: '',
  ativo: true,
})

function state(p: Promo): { label: string; cls: string } {
  if (!p.ativo) return { label: 'Pausada', cls: 'off' }
  if (promoLive(p)) return { label: 'No ar', cls: 'on' }
  if (p.inicio && Date.now() < new Date(p.inicio + 'T00:00:00').getTime()) return { label: 'Agendada', cls: 'ed' }
  return { label: 'Terminada', cls: 'off' }
}

const SELOS = ['-10%', '-15%', '-20%', '-25%', '-30%', 'Novo', 'Promoção']
const CTAS = ['Ver promoção', 'Ver produto', 'Pedir cotação', 'Saber mais']
const DURACOES = [
  { id: 'sem', label: 'Sem data de fim' },
  { id: '7', label: '7 dias' },
  { id: '15', label: '15 dias' },
  { id: '30', label: '30 dias' },
  { id: 'datas', label: 'Escolher datas' },
] as const
type Duracao = (typeof DURACOES)[number]['id']

const ESTILOS: { id: PromoStyle; label: string }[] = [
  { id: 'azul', label: 'Azul' },
  { id: 'ambar', label: 'Âmbar' },
  { id: 'claro', label: 'Claro' },
]

const FORMATOS: { id: PromoFormat; titulo: string; texto: string }[] = [
  { id: 'faixa', titulo: 'Faixa no topo', texto: 'Uma linha fina no cimo de todas as páginas.' },
  { id: 'destaque', titulo: 'Banner na página inicial', texto: 'Um bloco grande por baixo do cartaz.' },
  { id: 'popup', titulo: 'Janela que abre', texto: 'Abre sozinha, uma vez por visita.' },
]

/** Desenho pequeno de cada formato, para se perceber onde a promoção aparece. */
function FormatArt({ id }: { id: PromoFormat }) {
  return (
    <svg viewBox="0 0 64 44" width="64" height="44" aria-hidden="true">
      <rect x="1" y="1" width="62" height="42" rx="5" fill="#fff" stroke="#c9d3e0" />
      <rect x="1" y="1" width="62" height="7" rx="3" fill="#0e2f57" />
      {id === 'faixa' && <rect x="1" y="1" width="62" height="7" rx="3" fill="#f4b045" />}
      {id === 'destaque' && <rect x="7" y="22" width="50" height="16" rx="4" fill="#124e97" />}
      {id === 'popup' && (
        <>
          <rect x="1" y="8" width="62" height="35" fill="#0e2f57" opacity=".35" />
          <rect x="16" y="14" width="32" height="24" rx="4" fill="#fff" />
          <rect x="20" y="30" width="14" height="4" rx="2" fill="#f4b045" />
        </>
      )}
    </svg>
  )
}

function Preview({ p, products }: { p: Promo; products: CatalogProduct[] }) {
  const estilo = promoStyle(p)
  const pic = p.imagem ?? (products[0] ? productImage(products[0]) : undefined)
  const tiles = products.length > 0 && (
    <span className="pv__prods">
      {products.map((x) => {
        const src = productImage(x)
        return (
          <span key={x.id} className="pv__prod">
            {src ? <img src={src} alt="" /> : null}
            <span>{x.name}</span>
          </span>
        )
      })}
    </span>
  )
  if (p.formato === 'faixa')
    return (
      <div className="pv pv--strip" data-estilo={estilo}>
        <p>
          {p.selo && <b>{p.selo}</b>}
          <span>{p.titulo || 'O título da promoção'}</span>
          {p.texto && <span> — {p.texto}</span>}
          {products.length > 0 && <span> · {products.map((x) => x.name).join(', ')}</span>}
        </p>
        <span className="pv__cta">{p.cta || 'Ver'}</span>
      </div>
    )
  if (p.formato === 'popup')
    return (
      <div className="pv pv--popup" data-estilo={estilo}>
        {p.imagem && <img src={p.imagem} alt="" />}
        <div>
          {p.selo && <span className="selo">{p.selo}</span>}
          <h3>{p.titulo || 'O título da promoção'}</h3>
          {p.texto && <p>{p.texto}</p>}
          {tiles}
          <span className="pv__btn">{p.cta || 'Ver promoção'}</span>
        </div>
      </div>
    )
  return (
    <div className="pv pv--banner" data-estilo={estilo}>
      <div>
        {p.selo && <span className="selo">{p.selo}</span>}
        <h3>{p.titulo || 'O título da promoção'}</h3>
        {p.texto && <p>{p.texto}</p>}
        {tiles}
        <span className="pv__btn">{p.cta || 'Ver promoção'}</span>
      </div>
      {pic && <img src={pic} alt="" />}
    </div>
  )
}

/** Escolha dos produtos em promoção: cartões com foto, tocar para escolher. */
function ProductPicker({ chosen, onChange }: { chosen: string[]; onChange: (ids: string[]) => void }) {
  const catalog = useCatalog()
  const [q, setQ] = useState('')
  const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const list = catalog.filter((c) => !q || norm(`${c.name} ${c.brand ?? ''} ${c.model ?? ''}`).includes(norm(q)))
  const full = chosen.length >= MAX_PROMO_PRODUCTS
  const toggle = (id: string) => onChange(chosen.includes(id) ? chosen.filter((x) => x !== id) : full ? chosen : [...chosen, id])
  return (
    <div className="picker">
      <p className="picker__count" aria-live="polite">
        {chosen.length === 0 ? 'Nenhum produto escolhido. A promoção vale para a loja em geral.' : `${chosen.length} de ${MAX_PROMO_PRODUCTS} produtos escolhidos`}
      </p>
      <input className="picker__search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar produto pelo nome" aria-label="Procurar produto" />
      <ul className="picker__grid">
        {list.map((c) => {
          const on = chosen.includes(c.id)
          const src = productImage(c)
          return (
            <li key={c.id}>
              <button type="button" className={`pick${on ? ' is-on' : ''}`} aria-pressed={on} disabled={!on && full} onClick={() => toggle(c.id)}>
                <span className="pick__img">{src ? <img src={src} alt="" loading="lazy" /> : <Ico name="caixa" size={26} />}</span>
                <span className="pick__name">{c.name}</span>
                {on && (
                  <span className="pick__tick" aria-hidden="true">
                    <Ico name="visto" size={14} />
                  </span>
                )}
              </button>
            </li>
          )
        })}
        {list.length === 0 && <li className="picker__none">Nenhum produto com esse nome.</li>}
      </ul>
    </div>
  )
}

function PromoForm({ promo, onSave, onClose }: { promo: Promo; onSave: (p: Promo) => void; onClose: () => void }) {
  const catalog = useCatalog()
  const [p, setP] = useState(() => normalizePromo(promo))
  const [err, setErr] = useState('')
  const [dur, setDur] = useState<Duracao>(promo.fim ? 'datas' : 'sem')
  const [seloOutro, setSeloOutro] = useState(Boolean(p.selo && !SELOS.includes(p.selo)))
  const [ctaOutro, setCtaOutro] = useState(Boolean(p.cta && !CTAS.includes(p.cta)))
  const set = <K extends keyof Promo>(k: K, v: Promo[K]) => setP((x) => ({ ...x, [k]: v }))
  const chosen = p.produtos ?? []
  const products = promoProducts(p, catalog)
  const showImg = p.formato !== 'faixa'

  const pickProducts = (ids: string[]) =>
    setP((x) => {
      const first = catalog.find((c) => c.id === ids[0])
      return {
        ...x,
        produtos: ids,
        // um só produto: o botão leva a ele; sem produtos, volta ao catálogo
        alvo: ids.length > 0 && x.alvo !== 'cotacao' && x.alvo !== 'simuladores' ? 'produto' : ids.length === 0 && x.alvo === 'produto' ? 'catalogo' : x.alvo,
        titulo: !x.titulo.trim() && first ? first.name : x.titulo,
      }
    })

  const pickDuration = (d: Duracao) => {
    setDur(d)
    if (d === 'sem') setP((x) => ({ ...x, inicio: '', fim: '' }))
    else if (d !== 'datas') setP((x) => ({ ...x, inicio: '', fim: endInDays(Number(d)) }))
  }

  return (
    <Modal title={promo.titulo ? 'Editar promoção' : 'Nova promoção'} onClose={onClose} wide>
      <form
        className="pform promo"
        onSubmit={(e) => {
          e.preventDefault()
          if (!p.titulo.trim()) return setErr('Escreva o título da promoção.')
          if (p.inicio && p.fim && p.fim < p.inicio) return setErr('A data em que termina é anterior à data em que começa.')
          const alvo = p.alvo === 'produto' && chosen.length === 0 ? 'catalogo' : p.alvo
          const final: Promo = { ...p, titulo: p.titulo.trim(), alvo, produtos: chosen }
          onSave({ ...final, destino: promoLink(final) })
        }}
      >
        <div className="promo__cols">
          <div className="promo__steps">
            <section className="pstep">
              <h3 className="pstep__t">Onde quer mostrar?</h3>
              <div className="fmtcards" role="radiogroup" aria-label="Onde aparece">
                {FORMATOS.map((f) => (
                  <button key={f.id} type="button" role="radio" aria-checked={p.formato === f.id} className="fmtcard" onClick={() => set('formato', f.id)}>
                    <FormatArt id={f.id} />
                    <strong>{f.titulo}</strong>
                    <small>{f.texto}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="pstep">
              <h3 className="pstep__t">Que produtos estão em promoção?</h3>
              <ProductPicker chosen={chosen} onChange={pickProducts} />
            </section>

            <section className="pstep">
              <h3 className="pstep__t">O que quer dizer?</h3>
              <Field label="Título *" wide>
                <input value={p.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ex.: Bombas solares com preço especial" />
              </Field>
              <Field label="Mais uma frase (opcional)" wide>
                <input value={p.texto} onChange={(e) => set('texto', e.target.value)} placeholder="Ex.: Válido até acabar o stock" maxLength={120} />
              </Field>
              <div className="f">
                <span className="f__l">Desconto ou destaque</span>
                <div className="choices" role="radiogroup" aria-label="Desconto ou destaque">
                  <Choice on={!p.selo && !seloOutro} onClick={() => { set('selo', ''); setSeloOutro(false) }}>Nenhum</Choice>
                  {SELOS.map((x) => (
                    <Choice key={x} on={p.selo === x && !seloOutro} onClick={() => { set('selo', x); setSeloOutro(false) }}>
                      {x}
                    </Choice>
                  ))}
                  <Choice on={seloOutro} onClick={() => { setSeloOutro(true); if (SELOS.includes(p.selo ?? '')) set('selo', '') }}>Outro</Choice>
                </div>
                {seloOutro && <input value={p.selo ?? ''} onChange={(e) => set('selo', e.target.value)} maxLength={24} placeholder="Ex.: 2 por 1" aria-label="Escreva o destaque" />}
              </div>
            </section>

            <section className="pstep">
              <h3 className="pstep__t">Quanto tempo dura?</h3>
              <div className="choices" role="radiogroup" aria-label="Duração">
                {DURACOES.map((d) => (
                  <Choice key={d.id} on={dur === d.id} onClick={() => pickDuration(d.id)}>
                    {d.label}
                  </Choice>
                ))}
              </div>
              {dur !== 'sem' && dur !== 'datas' && p.fim && <p className="muted small">Termina no dia {new Date(p.fim + 'T12:00').toLocaleDateString('pt-PT')}.</p>}
              {dur === 'datas' && (
                <div className="grid2">
                  <Field label="Começa no dia" hint="Deixe vazio para começar já.">
                    <input type="date" value={p.inicio ?? ''} onChange={(e) => set('inicio', e.target.value)} />
                  </Field>
                  <Field label="Termina no dia">
                    <input type="date" value={p.fim ?? ''} onChange={(e) => set('fim', e.target.value)} />
                  </Field>
                </div>
              )}
            </section>

            <section className="pstep">
              <h3 className="pstep__t">O que acontece ao tocar no botão?</h3>
              <div className="f">
                <span className="f__l">O botão leva a</span>
                <div className="choices" role="radiogroup" aria-label="O botão leva a">
                  <Choice on={p.alvo === 'produto'} disabled={chosen.length === 0} onClick={() => set('alvo', 'produto')}>
                    {chosen.length > 1 ? 'Ao primeiro produto' : 'Ao produto'}
                  </Choice>
                  <Choice on={p.alvo === 'catalogo'} onClick={() => set('alvo', 'catalogo')}>Ao catálogo</Choice>
                  <Choice on={p.alvo === 'cotacao'} onClick={() => set('alvo', 'cotacao')}>Ao pedido de cotação</Choice>
                  <Choice on={p.alvo === 'simuladores'} onClick={() => set('alvo', 'simuladores')}>Aos simuladores</Choice>
                  {p.alvo === 'link' && <Choice on onClick={() => undefined}>Outro endereço (mantido)</Choice>}
                </div>
                {chosen.length === 0 && <p className="muted small">Escolha um produto acima para o botão poder levar a ele.</p>}
              </div>
              <div className="f">
                <span className="f__l">O que diz o botão</span>
                <div className="choices" role="radiogroup" aria-label="Texto do botão">
                  {CTAS.map((x) => (
                    <Choice key={x} on={p.cta === x && !ctaOutro} onClick={() => { set('cta', x); setCtaOutro(false) }}>
                      {x}
                    </Choice>
                  ))}
                  <Choice on={ctaOutro} onClick={() => { setCtaOutro(true); if (CTAS.includes(p.cta)) set('cta', '') }}>Outro</Choice>
                </div>
                {ctaOutro && <input value={p.cta} onChange={(e) => set('cta', e.target.value)} maxLength={28} placeholder="Ex.: Quero aproveitar" aria-label="Escreva o texto do botão" />}
              </div>
            </section>

            <section className="pstep">
              <h3 className="pstep__t">Aspeto</h3>
              <div className="f">
                <span className="f__l">Cor</span>
                <div className="swatches" role="radiogroup" aria-label="Cor da promoção">
                  {ESTILOS.map((e) => (
                    <button key={e.id} type="button" role="radio" aria-checked={promoStyle(p) === e.id} className={`swatch swatch--${e.id}`} onClick={() => set('estilo', e.id)}>
                      <span aria-hidden="true" />
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
              {showImg && (
                <div className="imgup">
                  <span className="imgup__box">{p.imagem ? <img src={p.imagem} alt="" /> : products[0] && productImage(products[0]) ? <img src={productImage(products[0])} alt="" /> : <Ico name="etiqueta" size={32} />}</span>
                  <div>
                    <p className="muted small">{p.imagem ? 'Foto própria da promoção.' : products.length ? 'A foto do produto aparece automaticamente. Se quiser, use outra.' : 'Pode juntar uma foto (opcional).'}</p>
                    <label className="btn btn--line">
                      <Ico name="carregar" size={16} /> {p.imagem ? 'Trocar a foto' : 'Escolher outra foto'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={async (e) => {
                          const f = e.target.files?.[0]
                          if (f) {
                            try {
                              set('imagem', await saveImage(f, { max: 1100, folder: 'promocoes' }))
                              setErr('')
                            } catch (er) {
                              setErr(er instanceof Error ? er.message : 'Não foi possível usar essa foto.')
                            }
                          }
                          e.target.value = ''
                        }}
                      />
                    </label>
                    {p.imagem && (
                      <button type="button" className="btn btn--ghost" onClick={() => set('imagem', undefined)}>
                        Tirar a foto
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>

            <Switch on={p.ativo} onChange={(v) => set('ativo', v)} label="Promoção ligada (aparece no site nas datas escolhidas)" />
          </div>

          <aside className="promo__side">
            <p className="sub">Como vai ficar</p>
            <Preview p={p} products={products} />
            <p className="muted small">
              {p.formato === 'faixa' && 'Fica fixa no topo de todas as páginas. O visitante pode fechá-la.'}
              {p.formato === 'popup' && 'Abre sozinha uma vez por visita, poucos segundos depois de o visitante entrar.'}
              {p.formato === 'destaque' && 'Aparece na página inicial, por baixo do cartaz.'} Só aparece uma promoção de cada tipo ao mesmo tempo (a primeira ligada da lista).
            </p>
          </aside>
        </div>
        {err && (
          <p className="ferr" role="alert">
            {err}
          </p>
        )}
        <div className="row row--end">
          <button type="button" className="btn btn--line" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn">
            Guardar promoção
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function PromosAdmin() {
  const [promos, setPromos] = usePromos()
  const [params, setParams] = useSearchParams()
  const [edit, setEdit] = useState<Promo | null>(null)
  const { toast, confirm } = useFeedback()

  useEffect(() => {
    if (params.get('novo') === '1') {
      setParams({}, { replace: true })
      setEdit(blank())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = (p: Promo) => {
    const isNew = !promos.some((x) => x.id === p.id)
    if (setPromos((l) => (l.some((x) => x.id === p.id) ? l.map((x) => (x.id === p.id ? p : x)) : [p, ...l]))) toast(isNew ? 'Promoção criada' : 'Alterações guardadas')
    else toast('Memória cheia. Use uma imagem mais pequena.', 'erro')
    setEdit(null)
  }

  const fmt = (d: string) => new Date(d + 'T12:00').toLocaleDateString('pt-PT')

  return (
    <>
      <PageTitle
        title="Promoções"
        lead="Anúncios no site: uma faixa no topo, um banner na página inicial ou uma janela que abre. Escolha os produtos e as cores com um toque."
        action={
          <button type="button" className="btn" onClick={() => setEdit(blank())}>
            + Nova promoção
          </button>
        }
      />
      <Panel>
        {promos.length === 0 ? (
          <Empty
            title="Ainda não há promoções"
            text="Crie uma promoção para a destacar no site. Pode começar por uma faixa no topo, que é a mais simples."
            action={
              <button type="button" className="btn" onClick={() => setEdit(blank())}>
                Criar a primeira promoção
              </button>
            }
          />
        ) : (
          <ul className="alist">
            {promos.map((p) => {
              const st = state(p)
              return (
                <li key={p.id} className={`arow arow--promo${p.ativo ? '' : ' is-off'}`}>
                  <span className={`chip chip--${st.cls}`}>{st.label}</span>
                  <div className="arow__main">
                    <strong>{p.titulo}</strong>
                    <small>
                      {FORMAT_LABEL[p.formato]}
                      {p.inicio || p.fim ? ` · ${p.inicio ? fmt(p.inicio) : 'já'} → ${p.fim ? fmt(p.fim) : 'sem fim'}` : ''}
                    </small>
                  </div>
                  <Switch
                    on={p.ativo}
                    label={p.ativo ? 'Ativa' : 'Pausada'}
                    onChange={(v) => {
                      setPromos((l) => l.map((x) => (x.id === p.id ? { ...x, ativo: v } : x)))
                      toast(v ? 'Promoção ativada' : 'Promoção pausada')
                    }}
                  />
                  <div className="arow__act">
                    <button type="button" className="btn btn--line btn--sm" onClick={() => setEdit(p)}>
                      <Ico name="editar" size={16} /> Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={async () => {
                        if (await confirm({ title: `Eliminar “${p.titulo}”?`, text: 'Deixa de aparecer no site.', confirmLabel: 'Eliminar', danger: true })) {
                          setPromos((l) => l.filter((x) => x.id !== p.id))
                          toast('Promoção eliminada')
                        }
                      }}
                    >
                      <Ico name="lixo" size={16} /> Eliminar
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
      {edit && <PromoForm key={edit.id} promo={edit} onSave={save} onClose={() => setEdit(null)} />}
    </>
  )
}
