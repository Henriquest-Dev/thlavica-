import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories, type CategoryId } from '../data/site'
import type { CatalogOverride, CustomProduct } from '../data/admin'
import { useCatalog, type CatalogProduct } from '../lib/catalog'
import { asset } from '../lib/asset'
import { fileToDataUrl, uid, useStored } from '../lib/store'
import { Ico } from '../components/Ico'
import { ProductThumb } from '../components/ProductThumb'
import { Empty, Field, Modal, PageTitle, Panel } from './ui'

const NO_CUSTOM: CustomProduct[] = []
const NO_OVER: Record<string, CatalogOverride> = {}
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

interface Draft {
  id: string
  isNew: boolean
  custom: boolean
  name: string
  brand: string
  model: string
  category: CategoryId
  summary: string
  featured: boolean
  hidden: boolean
  specs: { label: string; value: string }[]
  includes: string
  imgData?: string
  img: string
}

const blank = (): Draft => ({
  id: 'c-' + uid(),
  isNew: true,
  custom: true,
  name: '',
  brand: '',
  model: '',
  category: 'paineis',
  summary: '',
  featured: false,
  hidden: false,
  specs: [{ label: 'Potência', value: '' }],
  includes: '',
  img: '',
})

const fromProduct = (p: CatalogProduct): Draft => ({
  id: p.id,
  isNew: false,
  custom: Boolean(p.custom),
  name: p.name,
  brand: p.brand ?? '',
  model: p.model ?? '',
  category: p.category,
  summary: p.summary,
  featured: Boolean(p.featured),
  hidden: Boolean(p.hidden),
  specs: p.specs.length ? p.specs.map((s) => ({ ...s })) : [{ label: '', value: '' }],
  includes: (p.includes ?? []).join('\n'),
  imgData: p.imgData,
  img: p.img,
})

function ProductForm({ draft, onSave, onClose }: { draft: Draft; onSave: (d: Draft) => void; onClose: () => void }) {
  const [d, setD] = useState(draft)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  const preview = d.imgData ?? (d.img ? asset(`img/produtos/${d.img}.webp`) : undefined)

  return (
    <Modal title={d.isNew ? 'Novo produto' : 'Editar produto'} onClose={onClose} wide>
      <form
        className="pform"
        onSubmit={(e) => {
          e.preventDefault()
          if (!d.name.trim()) return setErr('Indique o nome do produto.')
          onSave(d)
        }}
      >
        <div className="grid2">
          <Field label="Nome *" wide>
            <input value={d.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex.: Painel solar 600 W" />
          </Field>
          <Field label="Marca">
            <input value={d.brand} onChange={(e) => set('brand', e.target.value)} />
          </Field>
          <Field label="Modelo">
            <input value={d.model} onChange={(e) => set('model', e.target.value)} />
          </Field>
          <Field label="Categoria *">
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
          <Field label="Resumo" wide>
            <textarea rows={2} value={d.summary} onChange={(e) => set('summary', e.target.value)} placeholder="Uma frase sobre o produto." />
          </Field>
        </div>

        <h3 className="sub">Imagem</h3>
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
                if (!f) return
                setBusy(true)
                try {
                  set('imgData', await fileToDataUrl(f))
                  setErr('')
                } catch {
                  setErr('Não foi possível ler essa imagem.')
                }
                setBusy(false)
                e.target.value = ''
              }}
            />
            <button type="button" className="btn btn--line" onClick={() => file.current?.click()} disabled={busy}>
              <Ico name="carregar" size={16} /> {busy ? 'A processar…' : d.imgData ? 'Trocar imagem' : 'Enviar imagem'}
            </button>
            {d.imgData && (
              <button type="button" className="btn btn--ghost" onClick={() => set('imgData', undefined)}>
                Retirar
              </button>
            )}
            <p className="muted small">A imagem é reduzida para 900 px. Fundo limpo (recortado) fica melhor no site.</p>
          </div>
        </div>

        <h3 className="sub">Especificações</h3>
        <ul className="specs-ed">
          {d.specs.map((s, i) => (
            <li key={i}>
              <input value={s.label} placeholder="Ex.: Potência" aria-label="Nome da especificação" onChange={(e) => set('specs', d.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <input value={s.value} placeholder="Ex.: 625 W" aria-label="Valor" onChange={(e) => set('specs', d.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
              <button type="button" className="icon" aria-label="Retirar especificação" onClick={() => set('specs', d.specs.filter((_, j) => j !== i))}>
                <Ico name="fechar" size={16} />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn--ghost" onClick={() => set('specs', [...d.specs, { label: '', value: '' }])}>
          + Especificação
        </button>

        <div className="grid2">
          <Field label="Incluído (um por linha)" wide>
            <textarea rows={3} value={d.includes} onChange={(e) => set('includes', e.target.value)} />
          </Field>
        </div>
        <label className="check">
          <input type="checkbox" checked={d.featured} onChange={(e) => set('featured', e.target.checked)} />
          <span>Mostrar em “Produtos em destaque” na página inicial</span>
        </label>

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
            Guardar produto
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function CatalogAdmin() {
  const all = useCatalog(true)
  const [, setCustom] = useStored<CustomProduct[]>('catalog.custom', NO_CUSTOM)
  const [, setOver] = useStored<Record<string, CatalogOverride>>('catalog.overrides', NO_OVER)
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<'' | CategoryId>('')
  const [draft, setDraft] = useState<Draft | null>(null)

  useEffect(() => {
    if (params.get('novo') === '1') {
      setParams({}, { replace: true })
      setDraft(blank())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rows = useMemo(
    () => all.filter((p) => (!cat || p.category === cat) && (!q || norm(`${p.name} ${p.brand ?? ''} ${p.model ?? ''}`).includes(norm(q)))),
    [all, q, cat],
  )

  const warn = (ok: boolean) => !ok && window.alert('A memória do navegador está cheia. Retire imagens grandes ou exporte os dados e apague alguns produtos.')

  const save = (d: Draft) => {
    const specs = d.specs.filter((s) => s.label.trim() && s.value.trim()).map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
    const includes = d.includes.split('\n').map((x) => x.trim()).filter(Boolean)
    const common = {
      name: d.name.trim(),
      brand: d.brand.trim() || undefined,
      model: d.model.trim() || undefined,
      category: d.category,
      summary: d.summary.trim(),
      specs,
      includes: includes.length ? includes : undefined,
      featured: d.featured,
      hidden: d.hidden,
      imgData: d.imgData,
    }
    if (d.custom) {
      const prod: CustomProduct = { ...common, id: d.id, img: '', source: 0, custom: true }
      warn(setCustom((list) => (list.some((x) => x.id === d.id) ? list.map((x) => (x.id === d.id ? prod : x)) : [prod, ...list])))
    } else {
      warn(setOver((o) => ({ ...o, [d.id]: common })))
    }
    setDraft(null)
  }

  const toggle = (p: CatalogProduct) => {
    if (p.custom) setCustom((l) => l.map((x) => (x.id === p.id ? { ...x, hidden: !x.hidden } : x)))
    else setOver((o) => ({ ...o, [p.id]: { ...o[p.id], hidden: !p.hidden } }))
  }

  return (
    <>
      <PageTitle
        title="Catálogo"
        lead="Produtos que aparecem no site. Pode acrescentar produtos novos, trocar imagens e ocultar o que não está disponível."
        action={
          <button type="button" className="btn" onClick={() => setDraft(blank())}>
            + Novo produto
          </button>
        }
      />
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
          <Empty title="Nenhum produto encontrado" text="Mude a pesquisa ou a categoria." />
        ) : (
          <table className="atable atable--prod">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={p.hidden ? 'is-off' : ''}>
                  <td>
                    <span className="pcell">
                      <ProductThumb p={p} size={44} />
                      <span>
                        <strong>{p.name}</strong>
                        <small>{[p.brand, p.model].filter(Boolean).join(' · ')}</small>
                      </span>
                    </span>
                  </td>
                  <td>{categories.find((c) => c.id === p.category)?.name}</td>
                  <td>
                    <span className="chips">
                      <em className={`chip ${p.hidden ? 'chip--off' : 'chip--on'}`}>{p.hidden ? 'Oculto' : 'Visível'}</em>
                      {p.custom && <em className="chip chip--new">Novo</em>}
                      {p.edited && <em className="chip chip--ed">Editado</em>}
                      {p.featured && <em className="chip chip--star">Destaque</em>}
                    </span>
                  </td>
                  <td className="atable__act">
                    <button type="button" className="icon" onClick={() => setDraft(fromProduct(p))} aria-label={`Editar ${p.name}`}>
                      <Ico name="editar" size={16} />
                    </button>
                    <button type="button" className="icon" onClick={() => toggle(p)} aria-label={p.hidden ? `Mostrar ${p.name}` : `Ocultar ${p.name}`} title={p.hidden ? 'Mostrar no site' : 'Ocultar do site'}>
                      <Ico name="olho" size={16} />
                    </button>
                    {p.custom ? (
                      <button type="button" className="icon" onClick={() => window.confirm(`Eliminar “${p.name}”?`) && setCustom((l) => l.filter((x) => x.id !== p.id))} aria-label={`Eliminar ${p.name}`}>
                        <Ico name="lixo" size={16} />
                      </button>
                    ) : (
                      p.edited && (
                        <button
                          type="button"
                          className="icon"
                          onClick={() =>
                            setOver((o) => {
                              const { [p.id]: _drop, ...rest } = o
                              void _drop
                              return rest
                            })
                          }
                          aria-label={`Repor o original de ${p.name}`}
                          title="Repor o original"
                        >
                          <Ico name="esquerda" size={16} />
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      {draft && <ProductForm key={draft.id} draft={draft} onSave={save} onClose={() => setDraft(null)} />}
    </>
  )
}
