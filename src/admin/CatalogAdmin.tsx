import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories, type CategoryId } from '../data/site'
import { blankDraft, draftFromProduct, useCatalogEditor, type ProductDraft } from '../lib/catalogEdit'
import { asset } from '../lib/asset'
import { fileToDataUrl } from '../lib/store'
import { Ico } from '../components/Ico'
import { ProductThumb } from '../components/ProductThumb'
import { useFeedback } from './feedback'
import { Empty, Field, Modal, PageTitle, Panel, Switch } from './ui'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function ProductForm({ draft, onSave, onClose }: { draft: ProductDraft; onSave: (d: ProductDraft) => void; onClose: () => void }) {
  const [d, setD] = useState(draft)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setD((x) => ({ ...x, [k]: v }))
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
  const { all, save, toggleHidden, remove, reset, duplicate } = useCatalogEditor()
  const { toast, confirm } = useFeedback()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<'' | CategoryId>('')
  const [show, setShow] = useState<'todos' | 'visiveis' | 'ocultos' | 'novos'>('todos')
  const [draft, setDraft] = useState<ProductDraft | null>(null)

  useEffect(() => {
    if (params.get('novo') === '1') {
      setParams({}, { replace: true })
      setDraft(blankDraft())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rows = useMemo(
    () =>
      all.filter(
        (p) =>
          (!cat || p.category === cat) &&
          (show === 'todos' || (show === 'visiveis' && !p.hidden) || (show === 'ocultos' && p.hidden) || (show === 'novos' && p.custom)) &&
          (!q || norm(`${p.name} ${p.brand ?? ''} ${p.model ?? ''}`).includes(norm(q))),
      ),
    [all, q, cat, show],
  )

  const counts = { todos: all.length, visiveis: all.filter((p) => !p.hidden).length, ocultos: all.filter((p) => p.hidden).length, novos: all.filter((p) => p.custom).length }

  const onSave = (d: ProductDraft) => {
    if (save(d)) toast(d.isNew ? 'Produto criado' : 'Alterações guardadas')
    else toast('Memória cheia. Retire imagens grandes ou exporte os dados e apague produtos.', 'erro')
    setDraft(null)
  }

  return (
    <>
      <PageTitle
        title="Catálogo"
        lead="Produtos que aparecem no site. Acrescente produtos, troque imagens e oculte o que não está disponível."
        action={
          <button type="button" className="btn" onClick={() => setDraft(blankDraft())}>
            + Novo produto
          </button>
        }
      />
      <select className="filtersel" value={show} onChange={(e) => setShow(e.target.value as typeof show)} aria-label="Estado dos produtos">
        <option value="todos">Todos ({counts.todos})</option>
        <option value="visiveis">Visíveis ({counts.visiveis})</option>
        <option value="ocultos">Ocultos ({counts.ocultos})</option>
        <option value="novos">Criados aqui ({counts.novos})</option>
      </select>
      <div className="atabs" role="tablist" aria-label="Estado dos produtos">
        {(
          [
            ['todos', 'Todos'],
            ['visiveis', 'Visíveis'],
            ['ocultos', 'Ocultos'],
            ['novos', 'Criados aqui'],
          ] as const
        ).map(([id, label]) => (
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
                  </span>
                </div>
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
