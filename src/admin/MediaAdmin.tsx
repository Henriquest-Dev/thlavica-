import { useRef, useState } from 'react'
import { useMedia, youtubeId } from '../lib/promos'
import { VIDEO_MAX_BYTES, humanSize, saveImage, saveVideo } from '../lib/images'
import { uid } from '../lib/store'
import { type MediaItem, type MediaKind } from '../data/admin'
import { MediaCarousel } from '../components/MediaCarousel'
import { asset } from '../lib/asset'
import { Ico } from '../components/Ico'
import { useFeedback } from './feedback'
import { Empty, Field, PageTitle, Panel, Switch } from './ui'

const KIND_LABEL: Record<MediaKind, string> = { imagem: 'Fotografia', video: 'Vídeo do telemóvel', youtube: 'Vídeo do YouTube' }
const TIPOS: MediaKind[] = ['imagem', 'video', 'youtube']
const src = (u: string) => (/^(https?:|data:|blob:)/.test(u) ? u : asset(u))

export default function MediaAdmin() {
  const [items, setItems] = useMedia()
  const { toast, confirm } = useFeedback()
  const [tipo, setTipo] = useState<MediaKind>('imagem')
  const [url, setUrl] = useState('')
  const [titulo, setTitulo] = useState('')
  const [legenda, setLegenda] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const videoFile = useRef<HTMLInputElement>(null)

  const move = (i: number, d: number) =>
    setItems((l) => {
      const n = [...l]
      const j = i + d
      if (j < 0 || j >= n.length) return l
      ;[n[i], n[j]] = [n[j], n[i]]
      return n
    })

  const add = () => {
    setErr('')
    if (!titulo.trim()) return setErr('Escreva um título.')
    if (busy) return setErr('Espere que o envio termine.')
    if (!url.trim()) return setErr(tipo === 'imagem' ? 'Envie uma fotografia primeiro.' : tipo === 'video' ? 'Envie o vídeo primeiro.' : 'Cole o endereço do vídeo.')
    if (tipo === 'youtube' && !youtubeId(url.trim())) return setErr('Não reconheço esse endereço do YouTube. Cole o link da barra de endereços ou do botão Partilhar.')
    const item: MediaItem = { id: uid(), tipo, url: url.trim(), titulo: titulo.trim(), legenda: legenda.trim() || undefined, ativo: true }
    if (!setItems((l) => [...l, item])) return setErr('A memória do navegador está cheia. Use uma imagem mais pequena ou um endereço em vez de enviar o ficheiro.')
    setUrl('')
    setTitulo('')
    setLegenda('')
    toast('Acrescentado ao carrossel')
  }

  return (
    <>
      <PageTitle title="Vídeos e fotos" lead="Fotografias e vídeos que aparecem na página inicial, na secção “O nosso trabalho”. Mude a ordem com as setas e pause o que não quer mostrar." />

      {items.some((m) => m.ativo) && (
        <Panel title="Em rotação automática">
          <MediaCarousel />
        </Panel>
      )}

      <div className="two two--wide">
        <Panel title="Itens do carrossel">
          {items.length === 0 ? (
            <Empty title="Ainda não há fotografias nem vídeos" text="Acrescente a primeira fotografia ou vídeo ao lado." />
          ) : (
            <ul className="alist">
              {items.map((m, i) => (
                <li key={m.id} className={`arow${m.ativo ? '' : ' is-off'}`}>
                  <span className="arow__thumb">{m.tipo === 'imagem' ? <img src={src(m.url)} alt="" /> : m.tipo === 'video' ? <video src={`${src(m.url)}#t=0.1`} preload="metadata" muted playsInline aria-hidden="true" /> : <Ico name="video" size={24} />}</span>
                  <div className="arow__main">
                    <strong>{m.titulo}</strong>
                    <small>{KIND_LABEL[m.tipo]}</small>
                  </div>
                  <Switch on={m.ativo} label={m.ativo ? 'Visível' : 'Pausado'} onChange={(v) => setItems((l) => l.map((x) => (x.id === m.id ? { ...x, ativo: v } : x)))} />
                  <div className="arow__act">
                    <button type="button" className="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${m.titulo}`} title="Subir">
                      <Ico name="cima" size={18} />
                    </button>
                    <button type="button" className="icon" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Descer ${m.titulo}`} title="Descer">
                      <Ico name="baixo" size={18} />
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={async () => {
                        if (await confirm({ title: `Retirar “${m.titulo}”?`, text: 'Deixa de passar no carrossel.', confirmLabel: 'Retirar', danger: true })) {
                          setItems((l) => l.filter((x) => x.id !== m.id))
                          toast('Item retirado')
                        }
                      }}
                    >
                      <Ico name="lixo" size={16} /> Retirar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Acrescentar">
          <form
            className="pform"
            onSubmit={(e) => {
              e.preventDefault()
              add()
            }}
          >
            <div className="seg" role="radiogroup" aria-label="Tipo de item">
              {TIPOS.map((k) => (
                <button key={k} type="button" role="radio" aria-checked={tipo === k} onClick={() => { setTipo(k); setUrl('') }}>
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>
            <Field label="Título *">
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </Field>
            <Field label="Legenda">
              <input value={legenda} onChange={(e) => setLegenda(e.target.value)} />
            </Field>
            {tipo === 'imagem' ? (
              <div className="imgup">
                <span className="imgup__box">{url ? <img src={src(url)} alt="" /> : <Ico name="video" size={28} />}</span>
                <div>
                  <input
                    ref={file}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (f) {
                        try {
                          setUrl(await saveImage(f, { max: 1400, quality: 0.82, folder: 'carrossel' }))
                          setErr('')
                        } catch (e2) {
                          setErr(e2 instanceof Error ? e2.message : 'Não foi possível processar essa imagem.')
                        }
                      }
                      e.target.value = ''
                    }}
                  />
                  <button type="button" className="btn btn--line" onClick={() => file.current?.click()}>
                    <Ico name="carregar" size={16} /> Enviar fotografia
                  </button>
                </div>
              </div>
            ) : tipo === 'video' ? (
              <div className="imgup">
                <span className="imgup__box">{url ? <video src={`${src(url)}#t=0.1`} preload="metadata" muted playsInline /> : <Ico name="video" size={28} />}</span>
                <div>
                  <input
                    ref={videoFile}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      e.target.value = ''
                      if (!f) return
                      setErr('')
                      setBusy(true)
                      try {
                        setUrl(await saveVideo(f, { folder: 'videos' }))
                        if (!titulo.trim()) setTitulo(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 60))
                      } catch (e2) {
                        setUrl('')
                        setErr(e2 instanceof Error ? e2.message : 'Não foi possível enviar o vídeo.')
                      }
                      setBusy(false)
                    }}
                  />
                  <button type="button" className="btn btn--line" onClick={() => videoFile.current?.click()} disabled={busy}>
                    <Ico name="carregar" size={16} /> {busy ? 'A enviar o vídeo… não feche' : url ? 'Trocar o vídeo' : 'Escolher vídeo do telemóvel'}
                  </button>
                  <p className="muted small">MP4 ou WebM, até {humanSize(VIDEO_MAX_BYTES).replace(',0', '')}. Um vídeo de 1 minuto em 720p costuma ter 20 a 40 MB. Demora um pouco a enviar.</p>
                </div>
              </div>
            ) : (
              <Field
                label="Link do vídeo no YouTube *"
                hint="No YouTube, abra o vídeo, toque em Partilhar, Copiar link e cole aqui."
              >
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" inputMode="url" />
              </Field>
            )}
            {err && (
              <p className="ferr" role="alert">
                {err}
              </p>
            )}
            <button type="submit" className="btn" disabled={busy}>
              Acrescentar ao carrossel
            </button>
          </form>
        </Panel>
      </div>
    </>
  )
}
