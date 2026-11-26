import { useState } from 'react'
import { Link } from 'react-router-dom'
import { solutions, type Category } from '../data/site'
import { MAX_CATEGORIES, MAX_NAME, MAX_TEXT, PICTOS, isBaseCategory, newCategoryId, removeCategory, saveCategory, useCategories, type CategoryEdit } from '../lib/categories'
import { useCatalogEditor } from '../lib/catalogEdit'
import { productImage, type CatalogProduct } from '../lib/catalog'
import { Ico } from '../components/Ico'
import { useFeedback } from './feedback'
import { Choice, Empty, Field, Modal, PageTitle, Panel } from './ui'

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const areaName = (id: string) => solutions.find((s) => s.id === id)?.name ?? ''

/** Criar ou mudar uma categoria: nome, frase curta, área do site e ícone. */
function CategoryForm({ start, onClose }: { start: CategoryEdit & { isNew?: boolean }; onClose: () => void }) {
  const { toast } = useFeedback()
  const all = useCategories()
  const [c, setC] = useState(start)
  const [err, setErr] = useState('')
  const base = !start.isNew && isBaseCategory(start.id)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = c.name.trim()
    if (!name) return setErr('Escreva o nome da categoria.')
    if (all.some((x) => x.id !== c.id && norm(x.name) === norm(name))) return setErr('Já existe uma categoria com esse nome.')
    const id = start.isNew ? newCategoryId(name, all.map((x) => x.id)) : c.id
    const ok = saveCategory({ id, name, text: c.text.trim(), solution: c.solution, pic: c.pic })
    toast(ok ? (start.isNew ? 'Categoria criada. Já aparece no site.' : 'Categoria guardada') : 'Não foi possível guardar.', ok ? 'ok' : 'erro')
    if (ok) onClose()
  }

  return (
    <Modal title={start.isNew ? 'Nova categoria' : `Editar “${start.name}”`} onClose={onClose}>
      <form className="pform" onSubmit={submit} noValidate>
        <Field label="Nome *" hint="Como aparece no site, por exemplo “Iluminação solar”.">
          <input
            value={c.name}
            onChange={(e) => {
              setC({ ...c, name: e.target.value })
              setErr('')
            }}
            maxLength={MAX_NAME}
            autoFocus
          />
          {err && <span className="ferr">{err}</span>}
        </Field>
        <Field label="Frase curta" hint="Aparece por baixo do nome, por exemplo “Candeeiros e projetores com painel”.">
          <input value={c.text} onChange={(e) => setC({ ...c, text: e.target.value })} maxLength={MAX_TEXT} />
        </Field>
        {!base && (
          <Field label="Em que área do site aparece">
            <div className="choices">
              {solutions.map((s) => (
                <Choice key={s.id} on={c.solution === s.id} onClick={() => setC({ ...c, solution: s.id })}>
                  {s.name}
                </Choice>
              ))}
            </div>
          </Field>
        )}
        <Field label="Ícone" hint="Aparece nos produtos desta categoria que ainda não têm foto.">
          <div className="choices">
            {PICTOS.map((p) => (
              <Choice key={p.id} on={c.pic === p.id} onClick={() => setC({ ...c, pic: p.id })}>
                <Ico name={p.id} size={20} /> {p.label}
              </Choice>
            ))}
          </div>
        </Field>
        <div className="row row--end">
          <button type="button" className="btn btn--line" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn">
            {start.isNew ? 'Criar categoria' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/** Os produtos de uma categoria: juntar outros (com foto) ou passá-los para outra categoria. */
function CategoryProducts({ cat, onClose }: { cat: Category; onClose: () => void }) {
  const { toast } = useFeedback()
  const categories = useCategories()
  const { all, setCategory } = useCatalogEditor()
  const [q, setQ] = useState('')
  const inside = all.filter((p) => p.category === cat.id)
  const others = all.filter((p) => p.category !== cat.id && (!q || norm(`${p.name} ${p.brand ?? ''} ${p.model ?? ''}`).includes(norm(q)))).slice(0, 30)
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'sem categoria'

  const move = (p: CatalogProduct, to: string) => {
    if (setCategory(p, to)) toast(`“${p.name}” passou para ${catName(to)}`)
    else toast('Não foi possível guardar.', 'erro')
  }

  return (
    <Modal title={`Produtos em “${cat.name}”`} onClose={onClose} wide>
      <h3 className="sub">Nesta categoria ({inside.length})</h3>
      {inside.length === 0 ? (
        <p className="muted small">Ainda não há produtos aqui. Escolha-os em baixo.</p>
      ) : (
        <ul className="kited__list catp">
          {inside.map((p) => {
            const src = productImage(p, true)
            return (
              <li key={p.id}>
                <span className="kited__img">{src ? <img src={src} alt="" /> : <Ico name={cat.pic} size={22} />}</span>
                <span className="kited__name">
                  {p.name}
                  {p.hidden && <small className="muted"> · oculto</small>}
                </span>
                <select value="" onChange={(e) => e.target.value && move(p, e.target.value)} aria-label={`Passar ${p.name} para outra categoria`}>
                  <option value="">Passar para…</option>
                  {categories
                    .filter((c) => c.id !== cat.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </li>
            )
          })}
        </ul>
      )}

      <h3 className="sub">Juntar produtos a esta categoria</h3>
      <p className="muted small">Toque num produto para o pôr em “{cat.name}”. Sai da categoria onde estava.</p>
      <div className="picker">
        <input className="picker__search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar produto" aria-label="Procurar produto" />
        <ul className="picker__grid">
          {others.map((p) => {
            const src = productImage(p, true)
            return (
              <li key={p.id}>
                <button type="button" className="pick" onClick={() => move(p, cat.id)}>
                  <span className="pick__img">{src ? <img src={src} alt="" loading="lazy" /> : <Ico name="caixa" size={26} />}</span>
                  <span className="pick__name">{p.name}</span>
                  <small className="pick__from">{catName(p.category)}</small>
                </button>
              </li>
            )
          })}
          {others.length === 0 && <li className="picker__none">Nenhum produto com esse nome.</li>}
        </ul>
      </div>
      <div className="row row--end">
        <button type="button" className="btn" onClick={onClose}>
          Concluído
        </button>
      </div>
    </Modal>
  )
}

/** Categorias do site: criar novas, mudar nomes e escolher os produtos de cada uma. */
export default function CategoriesAdmin() {
  const categories = useCategories()
  const { all } = useCatalogEditor()
  const { toast, confirm } = useFeedback()
  const [form, setForm] = useState<(CategoryEdit & { isNew?: boolean }) | null>(null)
  const [open, setOpen] = useState<Category | null>(null)
  const count = (id: string) => all.filter((p) => p.category === id).length
  const full = categories.filter((c) => c.custom).length >= MAX_CATEGORIES

  return (
    <>
      <PageTitle
        title="Categorias"
        lead="As categorias aparecem em Produtos, no site. Crie as que precisar e escolha que produtos ficam em cada uma."
        action={
          <button type="button" className="btn" disabled={full} onClick={() => setForm({ id: '', name: '', text: '', solution: 'energia-solar', pic: 'candeeiro', isNew: true })}>
            + Nova categoria
          </button>
        }
      />
      <Panel>
        {categories.length === 0 ? (
          <Empty title="Sem categorias" />
        ) : (
          <ul className="alist">
            {categories.map((c) => {
              const n = count(c.id)
              return (
                <li key={c.id} className="arow">
                  <span className="arow__thumb catico">
                    <Ico name={c.pic} size={30} />
                  </span>
                  <div className="arow__main">
                    <strong>{c.name}</strong>
                    <small>
                      {areaName(c.solution)} · {n === 1 ? '1 produto' : `${n} produtos`}
                      {c.text ? ` · ${c.text}` : ''}
                    </small>
                    {c.custom && (
                      <span className="chips">
                        <em className="chip chip--new">Criada aqui</em>
                      </span>
                    )}
                  </div>
                  <div className="arow__act">
                    <button type="button" className="btn btn--sm" onClick={() => setOpen(c)}>
                      Produtos
                    </button>
                    <button type="button" className="btn btn--line btn--sm" onClick={() => setForm({ id: c.id, name: c.name, text: c.text, solution: c.solution, pic: c.pic })}>
                      Editar
                    </button>
                    <Link className="btn btn--line btn--sm" to={`/categoria/${c.id}`} target="_blank">
                      Ver no site
                    </Link>
                    {c.custom && (
                      <button
                        type="button"
                        className="btn btn--line btn--sm"
                        onClick={async () => {
                          if (n > 0) {
                            toast(`Primeiro passe os ${n} produto(s) de “${c.name}” para outra categoria (botão Produtos).`, 'erro')
                            return
                          }
                          if (await confirm({ title: `Apagar “${c.name}”?`, text: 'A categoria deixa de aparecer no site.', confirmLabel: 'Apagar', danger: true })) {
                            toast(removeCategory(c.id) ? 'Categoria apagada' : 'Não foi possível apagar.', 'ok')
                          }
                        }}
                      >
                        Apagar
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
      {form && <CategoryForm start={form} onClose={() => setForm(null)} />}
      {open && <CategoryProducts cat={categories.find((c) => c.id === open.id) ?? open} onClose={() => setOpen(null)} />}
    </>
  )
}
