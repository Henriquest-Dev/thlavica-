import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FORMAT_LABEL, type Promo, type PromoFormat } from '../data/admin'
import { useCatalog } from '../lib/catalog'
import { promoLive, usePromos } from '../lib/promos'
import { fileToDataUrl, uid } from '../lib/store'
import { Ico } from '../components/Ico'
import { Empty, Field, Modal, PageTitle, Panel } from './ui'

const blank = (formato: PromoFormat = 'faixa'): Promo => ({
  id: uid(),
  formato,
  titulo: '',
  texto: '',
  selo: '',
  cta: 'Ver produtos',
  destino: '/produtos',
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

function Preview({ p }: { p: Promo }) {
  if (p.formato === 'faixa')
    return (
      <div className="pv pv--strip">
        <p>
          {p.selo && <b>{p.selo}</b>}
          <span>{p.titulo || 'Título da promoção'}</span>
          {p.texto && <span> — {p.texto}</span>}
        </p>
        <span className="pv__cta">{p.cta || 'Ver'} →</span>
      </div>
    )
  if (p.formato === 'popup')
    return (
      <div className="pv pv--popup">
        {p.imagem && <img src={p.imagem} alt="" />}
        <div>
          {p.selo && <span className="selo">{p.selo}</span>}
          <h3>{p.titulo || 'Título da promoção'}</h3>
          {p.texto && <p>{p.texto}</p>}
          <span className="pill pill--dark">{p.cta || 'Ver promoção'}</span>
        </div>
      </div>
    )
  return (
    <div className="pv pv--banner">
      <div>
        {p.selo && <span className="selo">{p.selo}</span>}
        <h3>{p.titulo || 'Título da promoção'}</h3>
        {p.texto && <p>{p.texto}</p>}
        <span className="pill pill--light">{p.cta || 'Ver promoção'}</span>
      </div>
      {p.imagem && <img src={p.imagem} alt="" />}
    </div>
  )
}

function PromoForm({ promo, onSave, onClose }: { promo: Promo; onSave: (p: Promo) => void; onClose: () => void }) {
  const catalog = useCatalog()
  const [p, setP] = useState(promo)
  const [err, setErr] = useState('')
  const set = <K extends keyof Promo>(k: K, v: Promo[K]) => setP((x) => ({ ...x, [k]: v }))
  const showImg = p.formato !== 'faixa'
  return (
    <Modal title={promo.titulo ? 'Editar promoção' : 'Nova promoção'} onClose={onClose} wide>
      <form
        className="pform promo"
        onSubmit={(e) => {
          e.preventDefault()
          if (!p.titulo.trim()) return setErr('Escreva o título da promoção.')
          if (p.inicio && p.fim && p.fim < p.inicio) return setErr('A data de fim é anterior à de início.')
          onSave({ ...p, titulo: p.titulo.trim() })
        }}
      >
        <div className="promo__cols">
          <div>
            <div className="seg" role="radiogroup" aria-label="Onde aparece">
              {(Object.keys(FORMAT_LABEL) as PromoFormat[]).map((f) => (
                <button key={f} type="button" role="radio" aria-checked={p.formato === f} onClick={() => set('formato', f)}>
                  {FORMAT_LABEL[f]}
                </button>
              ))}
            </div>
            <div className="grid2">
              <Field label="Título *" wide>
                <input value={p.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ex.: Bombas solares com preço especial" />
              </Field>
              <Field label="Texto" wide>
                <textarea rows={2} value={p.texto} onChange={(e) => set('texto', e.target.value)} placeholder="Condições em poucas palavras." />
              </Field>
              <Field label="Selo" hint="Ex.: -15%, Novo, Até 30 de junho.">
                <input value={p.selo ?? ''} onChange={(e) => set('selo', e.target.value)} maxLength={24} />
              </Field>
              <Field label="Texto do botão">
                <input value={p.cta} onChange={(e) => set('cta', e.target.value)} maxLength={28} />
              </Field>
              <Field label="O botão leva a" wide hint="Escolha uma página ou produto, ou cole um endereço completo.">
                <input list="destinos" value={p.destino} onChange={(e) => set('destino', e.target.value)} />
                <datalist id="destinos">
                  <option value="/produtos" label="Catálogo" />
                  <option value="/servicos#simuladores" label="Simuladores" />
                  <option value="/contacto" label="Pedir cotação" />
                  {catalog.map((c) => (
                    <option key={c.id} value={`/produtos/${c.id}`} label={c.name} />
                  ))}
                </datalist>
              </Field>
              <Field label="Começa em">
                <input type="date" value={p.inicio ?? ''} onChange={(e) => set('inicio', e.target.value)} />
              </Field>
              <Field label="Termina em">
                <input type="date" value={p.fim ?? ''} onChange={(e) => set('fim', e.target.value)} />
              </Field>
            </div>
            {showImg && (
              <div className="imgup">
                <span className="imgup__box">{p.imagem ? <img src={p.imagem} alt="" /> : <Ico name="etiqueta" size={32} />}</span>
                <div>
                  <label className="btn btn--line">
                    <Ico name="carregar" size={16} /> {p.imagem ? 'Trocar imagem' : 'Enviar imagem'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async (e) => {
                        const f = e.target.files?.[0]
                        if (f) set('imagem', await fileToDataUrl(f, 1100))
                        e.target.value = ''
                      }}
                    />
                  </label>
                  {p.imagem && (
                    <button type="button" className="btn btn--ghost" onClick={() => set('imagem', undefined)}>
                      Retirar
                    </button>
                  )}
                </div>
              </div>
            )}
            <label className="check">
              <input type="checkbox" checked={p.ativo} onChange={(e) => set('ativo', e.target.checked)} />
              <span>Ativa (aparece no site dentro das datas)</span>
            </label>
          </div>
          <div>
            <p className="sub">Pré-visualização</p>
            <Preview p={p} />
            <p className="muted small">
              {p.formato === 'faixa' && 'Mostra-se fixa no topo de todas as páginas. O visitante pode fechá-la.'}
              {p.formato === 'popup' && 'Abre uma vez por visita, poucos segundos depois de o visitante entrar.'}
              {p.formato === 'destaque' && 'Aparece na página inicial, por baixo do cartaz.'} Só uma promoção de cada tipo aparece ao mesmo tempo (a primeira ativa da lista).
            </p>
          </div>
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

  useEffect(() => {
    if (params.get('novo') === '1') {
      setParams({}, { replace: true })
      setEdit(blank())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = (p: Promo) => {
    if (!setPromos((l) => (l.some((x) => x.id === p.id) ? l.map((x) => (x.id === p.id ? p : x)) : [p, ...l]))) window.alert('A memória do navegador está cheia. Use uma imagem mais pequena.')
    setEdit(null)
  }

  return (
    <>
      <PageTitle
        title="Promoções"
        lead="Faixa no topo, banner na página inicial e pop-up. Cada promoção pode ter datas de início e fim."
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
          <ul className="plist">
            {promos.map((p) => {
              const st = state(p)
              return (
                <li key={p.id}>
                  <div className="plist__main">
                    <strong>{p.titulo}</strong>
                    <small>
                      {FORMAT_LABEL[p.formato]}
                      {p.inicio || p.fim ? ` · ${p.inicio ? new Date(p.inicio + 'T12:00').toLocaleDateString('pt-PT') : 'já'} → ${p.fim ? new Date(p.fim + 'T12:00').toLocaleDateString('pt-PT') : 'sem fim'}` : ''}
                    </small>
                  </div>
                  <em className={`chip chip--${st.cls}`}>{st.label}</em>
                  <div className="atable__act">
                    <button type="button" className="icon" onClick={() => setPromos((l) => l.map((x) => (x.id === p.id ? { ...x, ativo: !x.ativo } : x)))} aria-label={p.ativo ? `Pausar ${p.titulo}` : `Ativar ${p.titulo}`} title={p.ativo ? 'Pausar' : 'Ativar'}>
                      <Ico name={p.ativo ? 'olho' : 'reproduzir'} size={16} />
                    </button>
                    <button type="button" className="icon" onClick={() => setEdit(p)} aria-label={`Editar ${p.titulo}`}>
                      <Ico name="editar" size={16} />
                    </button>
                    <button type="button" className="icon" onClick={() => window.confirm(`Eliminar “${p.titulo}”?`) && setPromos((l) => l.filter((x) => x.id !== p.id))} aria-label={`Eliminar ${p.titulo}`}>
                      <Ico name="lixo" size={16} />
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
