import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categoryPic, type CategoryId } from '../data/site'
import { useCategories } from '../lib/categories'
import { MAX_GALLERY, blankDraft, draftFromProduct, parsePrice, useCatalogEditor, type ProductDraft } from '../lib/catalogEdit'
import { MAX_KIT_ITEMS, kitSeparateTotal } from '../lib/kits'
import { money } from '../lib/proposal'
import { useCatalog, productImage } from '../lib/catalog'
import { MAX_OPTION_GROUPS, MAX_OPTION_VALUES, OPTION_PRESETS } from '../lib/variants'
import { PRODUCT_TYPES, SPEC_SUGGESTIONS, exampleFor, typeOfCategory } from '../lib/specPresets'
import { asset } from '../lib/asset'
import { saveImage } from '../lib/images'
import { activeDiscount, finalPrice, priceLabel } from '../lib/pricing'
import { Ico } from '../components/Ico'
import { ProductThumb } from '../components/ProductThumb'
import { useFeedback } from './feedback'
import { endInDays } from '../lib/promos'
import { Choice, Empty, Field, Modal, PageTitle, Panel, Switch } from './ui'

const DESCONTOS = [5, 10, 15, 20, 25, 30]

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)

/** "O que vem na caixa": cada item é uma etiqueta; escreve-se e carrega-se em Enter (ou em Adicionar). */
function IncludesEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = lines(value)
  const [text, setText] = useState('')
  const add = (t: string) => {
    const v = t.trim()
    if (!v || items.includes(v)) return setText('')
    onChange([...items, v].join('\n'))
    setText('')
  }
  return (
    <div className="inc">
      {items.length > 0 && (
        <ul className="inc__list">
          {items.map((it) => (
            <li key={it}>
              {it}
              <button type="button" aria-label={`Retirar ${it}`} onClick={() => onChange(items.filter((x) => x !== it).join('\n'))}>
                <Ico name="fechar" size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="inc__add">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(text)
            }
          }}
          placeholder="Ex.: Bomba, Cabo de 30 m, Manual…"
          aria-label="Novo item"
          maxLength={80}
        />
        <button type="button" className="btn btn--line" onClick={() => add(text)}>
          Adicionar
        </button>
      </div>
      <div className="choices">
        {['Bomba', 'Control box', 'Cabo', 'Manual', 'Garantia'].filter((x) => !items.includes(x)).map((x) => (
          <Choice key={x} on={false} onClick={() => add(x)}>
            + {x}
          </Choice>
        ))}
      </div>
    </div>
  )
}

/** Grupo de opções (ex.: Cor: Preto, Branco, Vermelho): o nome e os valores em etiquetas. */
function OptionsEditor({ value, onChange }: { value: { name: string; values: string[] }[]; onChange: (v: { name: string; values: string[] }[]) => void }) {
  const [draft, setDraft] = useState<Record<number, string>>({})
  const setGroup = (i: number, g: { name: string; values: string[] }) => onChange(value.map((x, j) => (j === i ? g : x)))
  const addValue = (i: number, raw: string) => {
    const g = value[i]
    const vals = raw.split(',').map((x) => x.trim()).filter(Boolean).filter((x) => !g.values.includes(x))
    if (vals.length) setGroup(i, { ...g, values: [...g.values, ...vals].slice(0, MAX_OPTION_VALUES) })
    setDraft({ ...draft, [i]: '' })
  }
  return (
    <div className="optg">
      {value.map((g, i) => (
        <fieldset key={i} className="optg__grp">
          <div className="optg__head">
            <input value={g.name} onChange={(e) => setGroup(i, { ...g, name: e.target.value })} placeholder="O que o cliente escolhe (ex.: Cor)" aria-label="Nome da escolha" maxLength={30} />
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              Tirar
            </button>
          </div>
          {g.values.length > 0 && (
            <ul className="inc__list">
              {g.values.map((v) => (
                <li key={v}>
                  {v}
                  <button type="button" aria-label={`Retirar ${v}`} onClick={() => setGroup(i, { ...g, values: g.values.filter((x) => x !== v) })}>
                    <Ico name="fechar" size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="inc__add">
            <input
              value={draft[i] ?? ''}
              onChange={(e) => setDraft({ ...draft, [i]: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addValue(i, draft[i] ?? '')
                }
              }}
              placeholder="Ex.: Preto (Enter para juntar)"
              aria-label="Nova opção"
              maxLength={40}
            />
            <button type="button" className="btn btn--line" onClick={() => addValue(i, draft[i] ?? '')}>
              Adicionar
            </button>
          </div>
        </fieldset>
      ))}
      {value.length < MAX_OPTION_GROUPS && (
        <div className="choices">
          {OPTION_PRESETS.filter((p) => !value.some((g) => g.name === p.name)).map((p) => (
            <Choice key={p.name} on={false} onClick={() => onChange([...value, { name: p.name, values: [...p.values] }])}>
              + {p.name}
              {p.values.length ? ` (${p.values.slice(0, 3).join(', ')}…)` : ''}
            </Choice>
          ))}
          <Choice on={false} onClick={() => onChange([...value, { name: '', values: [] }])}>
            + Outra escolha
          </Choice>
        </div>
      )}
    </div>
  )
}

/** Kit: escolher os produtos incluídos (pesquisa com foto) e a quantidade de cada um. */
function KitEditor({ selfId, value, onChange, onUseSum }: { selfId: string; value: { id: string; qtd: number }[]; onChange: (v: { id: string; qtd: number }[]) => void; onUseSum: (sum: number) => void }) {
  const catalog = useCatalog(true)
  const [q, setQ] = useState('')
  const list = catalog.filter((c) => c.id !== selfId && !c.kit?.length && (!q || norm(`${c.name} ${c.brand ?? ''} ${c.model ?? ''}`).includes(norm(q)))).slice(0, 24)
  const setQty = (id: string, qtd: number) => onChange(value.map((k) => (k.id === id ? { ...k, qtd: Math.max(1, Math.min(999, Math.round(qtd) || 1)) } : k)))
  const sum = kitSeparateTotal(value, catalog)
  return (
    <div className="kited">
      {value.length > 0 && (
        <ul className="kited__list">
          {value.map((k) => {
            const c = catalog.find((x) => x.id === k.id)
            const src = c ? productImage(c, true) : undefined
            return (
              <li key={k.id}>
                <span className="kited__img">{src ? <img src={src} alt="" /> : <Ico name="caixa" size={20} />}</span>
                <span className="kited__name">{c?.name ?? '(produto retirado)'}</span>
                <span className="qty" role="group" aria-label={`Quantidade de ${c?.name ?? ''}`}>
                  <button type="button" onClick={() => setQty(k.id, k.qtd - 1)} aria-label="Menos">
                    <Ico name="menos" size={14} />
                  </button>
                  <span>{k.qtd}</span>
                  <button type="button" onClick={() => setQty(k.id, k.qtd + 1)} aria-label="Mais">
                    <Ico name="mais" size={14} />
                  </button>
                </span>
                <button type="button" className="icon" aria-label={`Tirar ${c?.name ?? ''} do kit`} onClick={() => onChange(value.filter((x) => x.id !== k.id))}>
                  <Ico name="fechar" size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {sum !== undefined && (
        <p className="muted small">
          Em separado custaria {money(sum)}.{' '}
          <button type="button" className="linkbtn" onClick={() => onUseSum(sum)}>
            Usar este valor como preço do kit
          </button>
        </p>
      )}
      {value.length < MAX_KIT_ITEMS && (
        <div className="picker">
          <input className="picker__search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar produto para juntar ao kit" aria-label="Procurar produto" />
          <ul className="picker__grid">
            {list.map((c) => {
              const on = value.some((k) => k.id === c.id)
              const src = productImage(c, true)
              return (
                <li key={c.id}>
                  <button type="button" className={`pick${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => onChange(on ? value.filter((k) => k.id !== c.id) : [...value, { id: c.id, qtd: 1 }])}>
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
      )}
    </div>
  )
}

/** Cartão tal como aparece na lista de produtos do site, para ver o resultado enquanto se escreve. */
function Preview({ d, src }: { d: ProductDraft; src?: string }) {
  const categories = useCategories()
  const price = parsePrice(d.price)
  const off = activeDiscount({ discount: d.discount, discountUntil: d.discountUntil })
  const final = price ? finalPrice({ price, discount: d.discount, discountUntil: d.discountUntil }) : undefined
  const cat = categories.find((c) => c.id === d.category)
  const chip = d.specs.find((s) => /Potência|Capacidade|Versões/.test(s.label) && s.value.trim() && s.value.length < 22)?.value
  return (
    <aside className="prev" aria-label="Pré-visualização">
      <p className="prev__h">Assim aparece no site</p>
      <div className="pc pc--md pcprev" aria-hidden="true">
        <span className="pc__media">{src ? <img src={src} alt="" /> : <Ico name={categoryPic(d.category, categories)} size={96} className="pc__picto" />}</span>
        {chip && <span className="pc__chip">{chip}</span>}
        {off > 0 && <span className="pc__sale">-{off}%</span>}
        <span className="pc__body">
          <span className="pc__cat">
            {cat?.name}
            {d.brand.trim() ? ` · ${d.brand.trim()}` : ''}
          </span>
          <span className="pc__name">{d.name.trim() || 'Nome do produto'}</span>
          {final !== undefined && (
            <span className="pc__price">
              {off > 0 && price !== undefined && <s>{priceLabel(price)}</s>} {priceLabel(final)}
            </span>
          )}
        </span>
      </div>
      {d.hidden && <p className="prev__off">Este produto está oculto: não aparece no site.</p>}
    </aside>
  )
}

function ProductForm({ draft, onSave, onClose }: { draft: ProductDraft; onSave: (d: ProductDraft) => void; onClose: () => void }) {
  const categories = useCategories()
  const [d, setD] = useState(draft)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const galleryFile = useRef<HTMLInputElement>(null)
  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setD((x) => ({ ...x, [k]: v }))
  const preview = d.imgData ?? (d.img ? asset(`img/produtos/${d.img}.webp`) : undefined)
  const [descOutro, setDescOutro] = useState(d.discount > 0 && !DESCONTOS.includes(d.discount))
  const [dur, setDur] = useState<'sem' | '7' | '15' | '30' | 'data'>(d.discountUntil ? 'data' : 'sem')
  // tipo de produto: só ao criar (escolhe a categoria e as especificações com que começa)
  const [typeId, setTypeId] = useState<string | undefined>(draft.isNew ? undefined : typeOfCategory(draft.category)?.id)
  const lastSpec = useRef<HTMLInputElement>(null)
  const sugest = SPEC_SUGGESTIONS[d.category] ?? ['Potência', 'Alimentação', 'Dimensões', 'Peso', 'Garantia', 'Cor']
  const priceBad = d.price.trim() !== '' && parsePrice(d.price) === undefined

  const pickType = (id: string) => {
    const t = PRODUCT_TYPES.find((x) => x.id === id)
    if (!t) return
    setTypeId(id)
    setD((x) => ({
      ...x,
      category: t.category,
      // só substitui as especificações se ainda não escreveu nenhuma
      specs: x.specs.every((s) => !s.value.trim()) ? t.specs.map((label) => ({ label, value: '' })) : x.specs,
    }))
  }
  const addSpec = (label = '') => {
    set('specs', [...d.specs.filter((s) => s.label.trim() || s.value.trim()), { label, value: '' }])
    setTimeout(() => lastSpec.current?.focus(), 30)
  }
  const moveSpec = (i: number, to: number) => {
    if (to < 0 || to >= d.specs.length) return
    const next = [...d.specs]
    ;[next[i], next[to]] = [next[to], next[i]]
    set('specs', next)
  }
  const usedLabels = new Set(d.specs.map((s) => norm(s.label.trim())))

  /** Várias fotografias de uma vez (até ao máximo); as que falharem dizem porquê. */
  const uploadGallery = async (files: File[]) => {
    const room = MAX_GALLERY - d.gallery.length
    if (room <= 0) return
    setBusy(true)
    const urls: string[] = []
    let fail = ''
    for (const f of files.slice(0, room)) {
      try {
        urls.push(await saveImage(f, { folder: 'produtos', max: 1100 }))
      } catch (e) {
        fail = e instanceof Error ? e.message : 'Não foi possível processar uma das imagens.'
      }
    }
    if (urls.length) set('gallery', [...d.gallery, ...urls].slice(0, MAX_GALLERY))
    setErr(files.length > room ? `Só cabem mais ${room} fotografia(s); as outras ficaram de fora.` : fail)
    setBusy(false)
  }
  const moveGallery = (i: number, to: number) => {
    if (to < 0 || to >= d.gallery.length) return
    const next = [...d.gallery]
    ;[next[i], next[to]] = [next[to], next[i]]
    set('gallery', next)
  }

  const upload = async (f: File, target: 'main' | 'gallery') => {
    setBusy(true)
    try {
      const url = await saveImage(f, { folder: 'produtos', max: target === 'main' ? 900 : 1100 })
      if (target === 'main') set('imgData', url)
      else set('gallery', [...d.gallery, url].slice(0, MAX_GALLERY))
      setErr('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Não foi possível processar essa imagem.')
    }
    setBusy(false)
  }

  return (
    <Modal title={d.isNew ? 'Novo produto' : 'Editar produto'} onClose={onClose} wide>
      <form
        className="pform"
        onSubmit={(e) => {
          e.preventDefault()
          if (!d.name.trim()) return setErr('Indique o nome do produto.')
          if (priceBad) return setErr('O preço não é válido. Escreva só números, por exemplo 15 500.')
          if (d.category === 'kits' && (d.kit.length === 0 || (d.kit.length === 1 && d.kit[0].qtd < 2))) return setErr('Um kit precisa de pelo menos dois produtos (ou um produto em quantidade maior que 1).')
          onSave(d)
        }}
      >
        {d.isNew && (
          <div className="f">
            <span className="f__l">Que tipo de produto é?</span>
            <div className="choices" role="radiogroup" aria-label="Tipo de produto">
              {PRODUCT_TYPES.map((t) => (
                <Choice key={t.id} on={typeId === t.id} onClick={() => pickType(t.id)}>
                  {t.label}
                </Choice>
              ))}
            </div>
            <small className="muted">Ao escolher, já ficam as especificações certas para preencher.</small>
          </div>
        )}

        <div className="pform__grid">
          <div className="pform__main">
            <h3 className="sub sub--first">Identificação</h3>
            <div className="grid2">
              <Field label="Nome *" hint="Como o cliente lê no site. Ex.: Bomba submersível 4SA 6/21" wide>
                <input value={d.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex.: Painel solar 600 W" maxLength={120} />
              </Field>
              <Field label="Marca">
                <input value={d.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Ex.: Dongyin" maxLength={60} />
              </Field>
              <Field label="Modelo">
                <input value={d.model} onChange={(e) => set('model', e.target.value)} placeholder="Ex.: 4SA6/21" maxLength={60} />
              </Field>
              <Field label="Categoria *" hint="Falta uma categoria? Crie-a em Mais → Categorias.">
                <select value={d.category} onChange={(e) => set('category', e.target.value as CategoryId)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Aparece no site">
                <span className="check check--box">
                  <input type="checkbox" checked={!d.hidden} onChange={(e) => set('hidden', !e.target.checked)} />
                  <span>{d.hidden ? 'Oculto' : 'Visível'}</span>
                </span>
              </Field>
              <Field label="Resumo" hint="Uma ou duas frases: para que serve e o que o distingue." wide>
                <textarea rows={2} value={d.summary} onChange={(e) => set('summary', e.target.value)} placeholder="Uma frase sobre o produto." maxLength={300} />
              </Field>
            </div>

            <h3 className="sub">Preço e desconto (opcional)</h3>
            <div className="grid2">
              <Field label={d.unit === 'm' ? 'Preço por metro (MZN)' : 'Preço (MZN)'} hint="Deixe vazio se o preço só se dá na cotação.">
                <input value={d.price} onChange={(e) => set('price', e.target.value)} inputMode="decimal" placeholder="Ex.: 15 500" aria-invalid={priceBad} />
                {priceBad && <span className="ferr">Escreva só números, por exemplo 15 500.</span>}
              </Field>
            </div>
            <div className="f">
              <span className="f__l">Desconto neste produto</span>
              <div className="choices" role="radiogroup" aria-label="Desconto">
                <Choice on={d.discount === 0} onClick={() => { set('discount', 0); setDescOutro(false) }}>Sem desconto</Choice>
                {DESCONTOS.map((x) => (
                  <Choice key={x} on={d.discount === x && !descOutro} onClick={() => { set('discount', x); setDescOutro(false) }}>
                    -{x}%
                  </Choice>
                ))}
                <Choice on={descOutro} onClick={() => { setDescOutro(true); if (DESCONTOS.includes(d.discount)) set('discount', 0) }}>Outro</Choice>
              </div>
              {descOutro && (
                <input type="number" min={1} max={90} value={d.discount || ''} onChange={(e) => set('discount', Math.max(0, Math.min(90, Number(e.target.value) || 0)))} placeholder="Percentagem, ex.: 12" aria-label="Percentagem de desconto" />
              )}
            </div>
            {d.discount > 0 && (
              <div className="f">
                <span className="f__l">Quanto tempo dura o desconto?</span>
                <div className="choices" role="radiogroup" aria-label="Duração do desconto">
                  {([['sem', 'Sem data de fim'], ['7', '7 dias'], ['15', '15 dias'], ['30', '30 dias'], ['data', 'Escolher data']] as const).map(([id, label]) => (
                    <Choice
                      key={id}
                      on={dur === id}
                      onClick={() => {
                        setDur(id)
                        if (id === 'sem') set('discountUntil', '')
                        else if (id !== 'data') set('discountUntil', endInDays(Number(id)))
                      }}
                    >
                      {label}
                    </Choice>
                  ))}
                </div>
                {dur === 'data' && <input type="date" value={d.discountUntil} onChange={(e) => set('discountUntil', e.target.value)} aria-label="Último dia do desconto" />}
                {dur !== 'sem' && dur !== 'data' && d.discountUntil && <small className="muted">Termina no dia {new Date(d.discountUntil + 'T12:00').toLocaleDateString('pt-PT')}.</small>}
              </div>
            )}

            {(d.category === 'kits' || d.kit.length > 0) && (
              <>
                <h3 className="sub">Produtos do kit</h3>
                <p className="muted small">Escolha os produtos que vêm no kit e quantos de cada. O cliente vê a lista na página do kit e quanto poupa.</p>
                <KitEditor selfId={d.id} value={d.kit} onChange={(v) => set('kit', v)} onUseSum={(sum) => set('price', String(sum))} />
              </>
            )}

            <h3 className="sub">Como se vende</h3>
            <div className="f">
              <div className="choices" role="radiogroup" aria-label="Como se vende">
                <Choice on={d.unit === ''} onClick={() => set('unit', '')}>
                  Por unidade
                </Choice>
                <Choice on={d.unit === 'm'} onClick={() => set('unit', 'm')}>
                  Ao metro
                </Choice>
              </div>
              <small className="muted">
                {d.unit === 'm' ? 'O preço acima é por metro. O cliente escolhe quantos metros quer e vê o total.' : 'O preço acima é por cada unidade.'}
              </small>
            </div>

            <h3 className="sub">Opções para o cliente escolher</h3>
            <p className="muted small">Por exemplo a cor, ou a tensão. O cliente tem de escolher uma opção de cada antes de pedir. Deixe vazio se o produto só tem uma versão.</p>
            <OptionsEditor value={d.options} onChange={(v) => set('options', v)} />

            <h3 className="sub">Imagens</h3>
            <div className="imgup">
              <span className="imgup__box">{d.imgData ? <img src={d.imgData} alt="" /> : preview ? <img src={preview} alt="" /> : <Ico name="caixa" size={36} />}</span>
              <div>
                <input
                  ref={file}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    e.target.value = ''
                    if (f) await upload(f, 'main')
                  }}
                />
                <button type="button" className="btn btn--line" onClick={() => file.current?.click()} disabled={busy}>
                  <Ico name="carregar" size={16} /> {busy ? 'A processar…' : d.imgData ? 'Trocar imagem principal' : 'Enviar imagem principal'}
                </button>
                {d.imgData && (
                  <button type="button" className="btn btn--ghost" onClick={() => set('imgData', undefined)}>
                    Retirar
                  </button>
                )}
                <p className="muted small">É a imagem da lista e do topo da página do produto. Fundo limpo (recortado) fica melhor; uma fotografia também serve.</p>
              </div>
            </div>
            <div className="f">
              <span className="f__l">
                Mais fotografias do produto ({d.gallery.length} de {MAX_GALLERY})
              </span>
              <p className="muted small">Pode escolher várias de uma vez. Aparecem por baixo da imagem principal, na página do produto, e o cliente pode ampliá-las.</p>
              <ul className="gal">
                {d.gallery.map((g, i) => (
                  <li key={g + i}>
                    <img src={g} alt="" />
                    <button type="button" aria-label={`Retirar fotografia ${i + 1}`} onClick={() => set('gallery', d.gallery.filter((_, j) => j !== i))}>
                      <Ico name="fechar" size={12} />
                    </button>
                    {i > 0 && (
                      <button type="button" className="gal__left" aria-label={`Passar a fotografia ${i + 1} para trás`} title="Mudar a ordem" onClick={() => moveGallery(i, i - 1)}>
                        <Ico name="esq" size={12} />
                      </button>
                    )}
                  </li>
                ))}
                {d.gallery.length < MAX_GALLERY && (
                  <li>
                    <button type="button" className="gal__add" disabled={busy} onClick={() => galleryFile.current?.click()}>
                      <Ico name="mais" size={20} />
                      <span>{busy ? 'A enviar…' : 'Adicionar'}</span>
                    </button>
                  </li>
                )}
              </ul>
              <input
                ref={galleryFile}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? [])
                  e.target.value = ''
                  if (files.length) await uploadGallery(files)
                }}
              />
            </div>

            <h3 className="sub">Especificações técnicas</h3>
            <p className="muted small">Cada linha é um dado do produto (potência, caudal…). Pode mudar a ordem com as setas. O que ficar vazio não aparece.</p>
            <datalist id="spec-names">
              {sugest.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <ul className="specs-ed">
              {d.specs.map((s, i) => (
                <li key={i}>
                  <input
                    list="spec-names"
                    value={s.label}
                    placeholder="Ex.: Potência"
                    aria-label="Nome da especificação"
                    onChange={(e) => set('specs', d.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    maxLength={40}
                  />
                  <input
                    ref={i === d.specs.length - 1 ? lastSpec : undefined}
                    value={s.value}
                    placeholder={exampleFor(typeId, s.label) ? `Ex.: ${exampleFor(typeId, s.label)}` : 'Valor, com a unidade (ex.: 625 W)'}
                    aria-label="Valor"
                    onChange={(e) => set('specs', d.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                    maxLength={120}
                  />
                  <span className="specs-ed__act">
                    <button type="button" className="icon" aria-label="Subir" disabled={i === 0} onClick={() => moveSpec(i, i - 1)}>
                      <Ico name="cima" size={14} />
                    </button>
                    <button type="button" className="icon" aria-label="Descer" disabled={i === d.specs.length - 1} onClick={() => moveSpec(i, i + 1)}>
                      <Ico name="baixo" size={14} />
                    </button>
                    <button type="button" className="icon" aria-label="Retirar especificação" onClick={() => set('specs', d.specs.filter((_, j) => j !== i))}>
                      <Ico name="fechar" size={16} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="choices">
              {sugest.filter((x) => !usedLabels.has(norm(x))).slice(0, 8).map((x) => (
                <Choice key={x} on={false} onClick={() => addSpec(x)}>
                  + {x}
                </Choice>
              ))}
              <Choice on={false} onClick={() => addSpec()}>
                + Outra
              </Choice>
            </div>

            <h3 className="sub">O que vem na caixa</h3>
            <IncludesEditor value={d.includes} onChange={(v) => set('includes', v)} />

            <label className="check">
              <input type="checkbox" checked={d.featured} onChange={(e) => set('featured', e.target.checked)} />
              <span>Mostrar em “Produtos em destaque” na página inicial</span>
            </label>
          </div>
          <Preview d={d} src={preview} />
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
          <button type="submit" className="btn" disabled={busy}>
            Guardar produto
          </button>
        </div>
      </form>
    </Modal>
  )
}

/** Preço na lista: escreve-se e guarda-se ao sair do campo ou com Enter. */
function QuickPrice({ value, onSave, suffix = 'MZN' }: { value: number | undefined; onSave: (text: string) => void; suffix?: string }) {
  const [t, setT] = useState(value ? String(value) : '')
  useEffect(() => setT(value ? String(value) : ''), [value])
  const commit = () => {
    if (t.trim() === (value ? String(value) : '')) return
    if (t.trim() !== '' && parsePrice(t) === undefined) return setT(value ? String(value) : '')
    onSave(t)
  }
  return (
    <label className="qprice">
      <span className="visually-hidden">Preço em meticais</span>
      <input value={t} onChange={(e) => setT(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} inputMode="decimal" placeholder="Sem preço" />
      <span aria-hidden="true">{suffix}</span>
    </label>
  )
}

type Filter = 'todos' | 'visiveis' | 'ocultos' | 'novos' | 'sem-preco' | 'sem-imagem'

export default function CatalogAdmin() {
  const categories = useCategories()
  const { all, save, toggleHidden, remove, reset, duplicate, setPrice } = useCatalogEditor()
  const { toast, confirm } = useFeedback()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<'' | CategoryId>(() => params.get('categoria') ?? '')
  const [show, setShow] = useState<Filter>('todos')
  const [draft, setDraft] = useState<ProductDraft | null>(null)

  useEffect(() => {
    if (params.get('novo') === '1') {
      setParams({}, { replace: true })
      setDraft(blankDraft())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const noPrice = (p: (typeof all)[number]) => !p.price || p.price <= 0
  const noImage = (p: (typeof all)[number]) => !p.imgData && !p.img

  const rows = useMemo(
    () =>
      all.filter(
        (p) =>
          (!cat || p.category === cat) &&
          (show === 'todos' ||
            (show === 'visiveis' && !p.hidden) ||
            (show === 'ocultos' && p.hidden) ||
            (show === 'novos' && p.custom) ||
            (show === 'sem-preco' && (!p.price || p.price <= 0)) ||
            (show === 'sem-imagem' && !p.imgData && !p.img)) &&
          (!q || norm(`${p.name} ${p.brand ?? ''} ${p.model ?? ''}`).includes(norm(q))),
      ),
    [all, q, cat, show],
  )

  const counts: Record<Filter, number> = {
    todos: all.length,
    visiveis: all.filter((p) => !p.hidden).length,
    ocultos: all.filter((p) => p.hidden).length,
    novos: all.filter((p) => p.custom).length,
    'sem-preco': all.filter(noPrice).length,
    'sem-imagem': all.filter(noImage).length,
  }
  const FILTERS: [Filter, string][] = [
    ['todos', 'Todos'],
    ['visiveis', 'Visíveis'],
    ['ocultos', 'Ocultos'],
    ['sem-preco', 'Sem preço'],
    ['sem-imagem', 'Sem imagem'],
    ['novos', 'Criados aqui'],
  ]

  const onSave = (d: ProductDraft) => {
    if (save(d)) toast(d.isNew ? 'Produto criado' : 'Alterações guardadas')
    else toast('Memória cheia. Retire imagens grandes ou exporte os dados e apague produtos.', 'erro')
    setDraft(null)
  }

  return (
    <>
      <PageTitle
        title="Produtos"
        lead="Produtos que aparecem no site. Acrescente produtos, mude preços e fichas técnicas, troque imagens e oculte o que não está disponível."
        action={
          <button type="button" className="btn" onClick={() => setDraft(blankDraft())}>
            + Novo produto
          </button>
        }
      />
      <select className="filtersel" value={show} onChange={(e) => setShow(e.target.value as Filter)} aria-label="Estado dos produtos">
        {FILTERS.map(([id, label]) => (
          <option key={id} value={id}>
            {label} ({counts[id]})
          </option>
        ))}
      </select>
      <div className="atabs" role="tablist" aria-label="Estado dos produtos">
        {FILTERS.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={show === id} onClick={() => setShow(id)}>
            {label}
            <span>{counts[id]}</span>
          </button>
        ))}
      </div>
      <div className="toolbar">
        <label className="asearch">
          <Ico name="pesquisa" size={16} />
          <span className="visually-hidden">Pesquisar produtos</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar por nome, marca ou modelo" />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value as '' | CategoryId)} aria-label="Filtrar por categoria">
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <Panel>
        {rows.length === 0 ? (
          <Empty title="Nenhum produto encontrado" text="Mude a pesquisa, a categoria ou o estado." />
        ) : (
          <ul className="alist">
            {rows.map((p) => (
              <li key={p.id} className={`arow${p.hidden ? ' is-off' : ''}`}>
                <ProductThumb p={p} size={56} />
                <div className="arow__main">
                  <strong>{p.name}</strong>
                  <small>{[categories.find((c) => c.id === p.category)?.name, p.brand].filter(Boolean).join(' · ')}</small>
                  <span className="chips">
                    {p.custom && <em className="chip chip--new">Novo</em>}
                    {p.edited && <em className="chip chip--ed">Editado</em>}
                    {p.featured && <em className="chip chip--star">Destaque</em>}
                    {noPrice(p) && <em className="chip chip--warn">Sem preço</em>}
                    {p.unit === 'm' && <em className="chip chip--ed">Ao metro</em>}
                    {(p.options?.length ?? 0) > 0 && <em className="chip chip--ed">{p.options!.map((g) => g.name).join(' · ')}</em>}
                    {activeDiscount(p) > 0 && <em className="chip chip--new">-{activeDiscount(p)}%</em>}
                  </span>
                </div>
                <QuickPrice
                  value={p.price}
                  suffix={p.unit === 'm' ? 'MZN/m' : 'MZN'}
                  onSave={(t) => {
                    if (setPrice(p, t)) toast(t.trim() ? 'Preço guardado' : 'Preço retirado (fica “confirmado na cotação”)')
                    else toast('Memória cheia.', 'erro')
                  }}
                />
                <Switch on={!p.hidden} onChange={() => { toggleHidden(p); toast(p.hidden ? 'Produto visível no site' : 'Produto ocultado do site') }} label={p.hidden ? 'Oculto' : 'No site'} />
                <div className="arow__act">
                  <button type="button" className="btn btn--line btn--sm" onClick={() => setDraft(draftFromProduct(p))}>
                    <Ico name="editar" size={16} /> Editar
                  </button>
                  <button type="button" className="btn btn--line btn--sm" onClick={() => { duplicate(p); toast('Cópia criada (oculta)') }}>
                    <Ico name="copiar" size={16} /> Duplicar
                  </button>
                  {p.custom ? (
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={async () => {
                        if (await confirm({ title: `Eliminar “${p.name}”?`, text: 'O produto deixa de existir no site e no painel.', confirmLabel: 'Eliminar', danger: true })) {
                          remove(p)
                          toast('Produto eliminado')
                        }
                      }}
                    >
                      <Ico name="lixo" size={16} /> Eliminar
                    </button>
                  ) : (
                    p.edited && (
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => { reset(p); toast('Original reposto') }}>
                        Repor o original
                      </button>
                    )
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      {draft && <ProductForm key={draft.id} draft={draft} onSave={onSave} onClose={() => setDraft(null)} />}
    </>
  )
}
