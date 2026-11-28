import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeroSlides, useHeroSlides, type Slide } from '../sections/Hero'
import { SIZE_CARTAZ, saveCarouselSettings, safeLink, useCarouselSettings, useMedia } from '../lib/promos'
import { VIDEO_MAX_BYTES, humanSize, saveImage, saveVideo } from '../lib/images'
import { asset, img } from '../lib/asset'
import { uid } from '../lib/store'
import type { MediaItem } from '../data/admin'
import { Ico } from '../components/Ico'
import { useFeedback } from './feedback'
import { Empty, Field, Modal, PageTitle, Panel, Switch } from './ui'
import { CarouselSettingsPanel, LinkSelect } from './mediaShared'

/**
 * O cartaz grande do início, num só sítio: ver como está, mudar a ordem, acrescentar fotografias
 * ou vídeos (na proporção certa) e escolher se o cartaz de origem da Tlhavika continua.
 */

const RATIO = 2.5 // 2000 × 800
const fileSrc = (u: string) => (/^(https?:|data:|blob:)/.test(u) ? u : asset(u))
const ORIGINAL: Slide = { key: 'origem', alt: 'Cartaz de origem da Tlhavika', original: true }

const isCartaz = (m: MediaItem) => (m.locais ?? []).includes('cartaz') && m.tipo !== 'youtube'

function ratioNote(w: number, h: number): string {
  const r = w / h
  if (Math.abs(r - RATIO) / RATIO < 0.12) return ''
  return r < RATIO
    ? `Esta imagem é mais alta do que o cartaz (${w} × ${h}). Vai ser cortada em cima e em baixo: veja na pré-visualização se o importante fica à vista.`
    : `Esta imagem é mais comprida do que o cartaz (${w} × ${h}). Vai ser cortada dos lados: veja na pré-visualização se o importante fica à vista.`
}

export default function CartazAdmin() {
  const [media, setMedia] = useMedia()
  const conf = useCarouselSettings()
  const slides = useHeroSlides()
  const { toast, confirm } = useFeedback()
  const items = media.filter(isCartaz)
  const [edit, setEdit] = useState<MediaItem | null>(null)

  // novo item
  const [draft, setDraft] = useState<{ url: string; tipo: 'imagem' | 'video'; titulo: string; link: string; note: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const photo = useRef<HTMLInputElement>(null)
  const video = useRef<HTMLInputElement>(null)

  const nameOf = (f: File) => f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 60)

  const pickPhoto = async (f: File) => {
    setErr('')
    setBusy(true)
    try {
      const size = await new Promise<{ w: number; h: number }>((ok) => {
        const u = URL.createObjectURL(f)
        const im = new Image()
        im.onload = () => {
          ok({ w: im.naturalWidth, h: im.naturalHeight })
          URL.revokeObjectURL(u)
        }
        im.onerror = () => ok({ w: 0, h: 0 })
        im.src = u
      })
      const url = await saveImage(f, { max: 2000, quality: 0.85, folder: 'cartaz' })
      setDraft({ url, tipo: 'imagem', titulo: nameOf(f), link: '', note: size.w ? ratioNote(size.w, size.h) : '' })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Não foi possível usar essa imagem.')
    }
    setBusy(false)
  }

  const pickVideo = async (f: File) => {
    setErr('')
    setBusy(true)
    try {
      const url = await saveVideo(f, { folder: 'videos' })
      setDraft({ url, tipo: 'video', titulo: nameOf(f), link: '', note: '' })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Não foi possível enviar o vídeo.')
    }
    setBusy(false)
  }

  const add = () => {
    if (!draft) return
    const item: MediaItem = { id: uid(), tipo: draft.tipo, url: draft.url, titulo: draft.titulo.trim() || 'Cartaz', ativo: true, locais: ['cartaz'], ...(safeLink(draft.link) ? { link: draft.link } : {}) }
    if (!setMedia((l) => [...l, item])) return setErr('Não foi possível guardar. A imagem pode ser grande demais.')
    setDraft(null)
    toast('Acrescentado ao cartaz. Já passa no site.')
  }

  /** Troca a posição com o item do cartaz anterior ou seguinte (a ordem é a do carrossel). */
  const move = (id: string, d: -1 | 1) =>
    setMedia((l) => {
      const idx = l.findIndex((m) => m.id === id)
      const order = l.map((m, i) => (isCartaz(m) ? i : -1)).filter((i) => i >= 0)
      const at = order.indexOf(idx)
      const other = order[at + d]
      if (other === undefined) return l
      const n = [...l]
      ;[n[idx], n[other]] = [n[other], n[idx]]
      return n
    })

  const remove = async (m: MediaItem) => {
    const others = (m.locais ?? []).filter((x) => x !== 'cartaz')
    if (!(await confirm({ title: `Tirar “${m.titulo}” do cartaz?`, text: others.length ? 'Continua nos outros sítios onde está (Vídeos e fotos).' : 'Deixa de aparecer no site.', confirmLabel: 'Tirar', danger: true }))) return
    setMedia((l) => (others.length ? l.map((x) => (x.id === m.id ? { ...x, locais: others } : x)) : l.filter((x) => x.id !== m.id)))
    toast('Tirado do cartaz')
  }

  const preview = slides.length ? slides : [ORIGINAL]

  return (
    <>
      <PageTitle
        title="Cartaz do início"
        lead="O banner grande no topo da página inicial (“Energia solar e bombas de água”). Acrescente fotografias ou vídeos: passam uns atrás dos outros, em carrossel."
      />

      <Panel title="Como está agora no site">
        <div className="cz__prev">
          <HeroSlides slides={preview} mobile={false} />
        </div>
        <p className="muted small">
          {preview.length > 1 ? `${preview.length} imagens a passar, ${conf.auto ? `${conf.segundos} segundos cada` : 'só com as setas (rotação automática desligada)'}.` : 'Só o cartaz de origem. Acrescente imagens em baixo para virar carrossel.'}
        </p>
      </Panel>

      <Panel title="Imagens do cartaz, por ordem">
        <ul className="alist">
          <li className={`arow arow--media${conf.cartazOrigem || items.length === 0 ? '' : ' is-off'}`}>
            <span className="arow__thumb cz__thumb">
              <img src={img('banner-800')} alt="" />
            </span>
            <div className="arow__main">
              <strong>Cartaz de origem da Tlhavika</strong>
              <small>“Energia solar e bombas de água”, com os contactos</small>
              {items.length === 0 && <small className="muted">Aparece sempre enquanto não houver outras imagens.</small>}
            </div>
            <Switch on={conf.cartazOrigem} label={conf.cartazOrigem ? 'Mostrar (fica em 1.º)' : 'Escondido'} onChange={(v) => saveCarouselSettings({ ...conf, cartazOrigem: v })} />
          </li>
          {items.map((m, i) => (
            <li key={m.id} className={`arow arow--media${m.ativo ? '' : ' is-off'}`}>
              <span className="arow__thumb cz__thumb">{m.tipo === 'video' ? <video src={`${fileSrc(m.url)}#t=0.1`} preload="metadata" muted playsInline aria-hidden="true" /> : <img src={fileSrc(m.url)} alt="" />}</span>
              <div className="arow__main">
                <strong>{m.titulo}</strong>
                <small>
                  {m.tipo === 'video' ? 'Vídeo (sem som)' : 'Fotografia'}
                  {m.link ? ` · ao tocar abre ${m.link}` : ''}
                </small>
              </div>
              <Switch on={m.ativo} label={m.ativo ? 'Visível' : 'Pausado'} onChange={(v) => setMedia((l) => l.map((x) => (x.id === m.id ? { ...x, ativo: v } : x)))} />
              <div className="arow__act">
                <button type="button" className="btn btn--line btn--sm" onClick={() => setEdit(m)}>
                  Editar
                </button>
                <button type="button" className="icon" onClick={() => move(m.id, -1)} disabled={i === 0} aria-label={`Subir ${m.titulo}`} title="Subir">
                  <Ico name="cima" size={18} />
                </button>
                <button type="button" className="icon" onClick={() => move(m.id, 1)} disabled={i === items.length - 1} aria-label={`Descer ${m.titulo}`} title="Descer">
                  <Ico name="baixo" size={18} />
                </button>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => remove(m)}>
                  <Ico name="lixo" size={16} /> Tirar
                </button>
              </div>
            </li>
          ))}
        </ul>
        {items.length === 0 && <Empty title="Ainda não há imagens próprias no cartaz" text="Acrescente a primeira em baixo." />}
      </Panel>

      <Panel title="Acrescentar ao cartaz">
        <div className="cz__add">
          <div className="cz__frame" aria-label={`Proporção do cartaz: ${SIZE_CARTAZ}`}>
            {draft ? (
              draft.tipo === 'video' ? (
                <video src={fileSrc(draft.url)} muted autoPlay loop playsInline />
              ) : (
                <img src={fileSrc(draft.url)} alt="Pré-visualização" />
              )
            ) : (
              <span className="cz__frame-label">
                <strong>{SIZE_CARTAZ}</strong>
                <span>Largura 2,5 vezes a altura</span>
              </span>
            )}
          </div>
          <ul className="cz__tips">
            <li>
              <strong>Medida certa:</strong> 2000 × 800 píxeis (ou 1500 × 600). Fica igual no computador e no telemóvel.
            </li>
            <li>
              <strong>Texto:</strong> deixe-o longe das bordas, porque os cantos do cartaz têm as setas e os pontos.
            </li>
            <li>
              <strong>Vídeo:</strong> MP4 do telemóvel até {humanSize(VIDEO_MAX_BYTES).replace(',0', '')}, curto (10 a 20 segundos), gravado na horizontal. Passa sem som.
            </li>
          </ul>
        </div>

        {draft ? (
          <div className="pform">
            {draft.note && (
              <p className="cz__warn" role="status">
                {draft.note}
              </p>
            )}
            <div className="grid2">
              <Field label="Nome (para si; não aparece no cartaz)">
                <input value={draft.titulo} onChange={(e) => setDraft({ ...draft, titulo: e.target.value })} maxLength={60} />
              </Field>
              <Field label="Ao tocar no cartaz, abre" hint="Opcional. Por exemplo, a página de uma promoção ou de um produto.">
                <LinkSelect value={draft.link} onChange={(v) => setDraft({ ...draft, link: v })} />
              </Field>
            </div>
            <div className="row">
              <button type="button" className="btn" onClick={add}>
                Acrescentar ao cartaz
              </button>
              <button type="button" className="btn btn--line" onClick={() => setDraft(null)}>
                Escolher outra
              </button>
            </div>
          </div>
        ) : (
          <div className="row">
            <button type="button" className="btn" disabled={busy} onClick={() => photo.current?.click()}>
              <Ico name="carregar" size={16} /> {busy ? 'A preparar…' : 'Enviar fotografia'}
            </button>
            <button type="button" className="btn btn--line" disabled={busy} onClick={() => video.current?.click()}>
              <Ico name="video" size={16} /> Enviar vídeo (até {humanSize(VIDEO_MAX_BYTES).replace(',0', '')})
            </button>
          </div>
        )}
        {err && (
          <p className="ferr" role="alert">
            {err}
          </p>
        )}
        <input
          ref={photo}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) void pickPhoto(f)
          }}
        />
        <input
          ref={video}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) void pickVideo(f)
          }}
        />
      </Panel>

      <CarouselSettingsPanel />

      <p className="note-link">
        Quer pôr fotografias noutros sítios (pop-up, antes dos produtos em destaque, páginas de produtos…)? Veja o mapa em <Link to="/admin/midia">Vídeos e fotos</Link>.
      </p>

      {edit && (
        <Modal title={`Editar: ${edit.titulo}`} onClose={() => setEdit(null)}>
          <div className="pform">
            <Field label="Nome">
              <input value={edit.titulo} onChange={(e) => setEdit({ ...edit, titulo: e.target.value })} maxLength={60} />
            </Field>
            <Field label="Ao tocar no cartaz, abre">
              <LinkSelect value={edit.link ?? ''} onChange={(v) => setEdit({ ...edit, link: v || undefined })} />
            </Field>
          </div>
          <div className="row row--end">
            <button type="button" className="btn btn--line" onClick={() => setEdit(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setMedia((l) => l.map((x) => (x.id === edit.id ? { ...edit, titulo: edit.titulo.trim() || x.titulo, link: safeLink(edit.link) } : x)))
                setEdit(null)
                toast('Guardado')
              }}
            >
              Guardar
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
