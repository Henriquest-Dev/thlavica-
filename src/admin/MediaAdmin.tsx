import { useRef, useState } from 'react'
import { useMedia, youtubeId } from '../lib/promos'
import { fileToDataUrl, uid } from '../lib/store'
import { DEFAULT_MEDIA, type MediaItem, type MediaKind } from '../data/admin'
import { MediaCarousel } from '../components/MediaCarousel'
import { asset } from '../lib/asset'
import { Ico } from '../components/Ico'
import { Empty, Field, PageTitle, Panel } from './ui'

const KIND_LABEL: Record<MediaKind, string> = { imagem: 'Imagem', youtube: 'Vídeo do YouTube', video: 'Vídeo (ficheiro MP4)' }
const src = (u: string) => (/^(https?:|data:|blob:)/.test(u) ? u : asset(u))

export default function MediaAdmin() {
  const [items, setItems] = useMedia()
  const [tipo, setTipo] = useState<MediaKind>('imagem')
  const [url, setUrl] = useState('')
  const [titulo, setTitulo] = useState('')
  const [legenda, setLegenda] = useState('')
  const [err, setErr] = useState('')
  const file = useRef<HTMLInputElement>(null)

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
    if (!url.trim()) return setErr(tipo === 'imagem' ? 'Envie uma imagem ou cole o endereço dela.' : 'Cole o endereço do vídeo.')
    if (tipo === 'youtube' && !youtubeId(url.trim())) return setErr('Não reconheço esse endereço do YouTube. Cole o link da barra de endereços ou do botão Partilhar.')
    const item: MediaItem = { id: uid(), tipo, url: url.trim(), titulo: titulo.trim(), legenda: legenda.trim() || undefined, ativo: true }
    if (!setItems((l) => [...l, item])) return setErr('A memória do navegador está cheia. Use uma imagem mais pequena ou um endereço em vez de enviar o ficheiro.')
    setUrl('')
    setTitulo('')
    setLegenda('')
  }

  return (
    <>
      <PageTitle title="Vídeos e fotos" lead="Fotografias e vídeos que passam sozinhos neste painel. Mude a ordem com as setas e pause o que não quer mostrar." />

      <Panel title="Em rotação automática">
        <MediaCarousel />
      </Panel>

      <div className="two two--wide">
        <Panel title="Itens do carrossel">
          {items.length === 0 ? (
            <Empty title="O carrossel está vazio" text="Acrescente fotografias ou vídeos ao lado." action={<button type="button" className="btn btn--line" onClick={() => setItems(DEFAULT_MEDIA)}>Repor as fotografias de origem</button>} />
          ) : (
            <ul className="mlist">
              {items.map((m, i) => (
                <li key={m.id} className={m.ativo ? '' : 'is-off'}>
                  <span className="mlist__thumb">
                    {m.tipo === 'imagem' ? <img src={src(m.url)} alt="" /> : <Ico name="video" size={22} />}
                  </span>
                  <span className="mlist__t">
                    <strong>{m.titulo}</strong>
                    <small>{KIND_LABEL[m.tipo]}</small>
                  </span>
                  <span className="atable__act">
                    <button type="button" className="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${m.titulo}`}>
                      <Ico name="cima" size={16} />
                    </button>
                    <button type="button" className="icon" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Descer ${m.titulo}`}>
                      <Ico name="baixo" size={16} />
                    </button>
                    <button type="button" className="icon" onClick={() => setItems((l) => l.map((x) => (x.id === m.id ? { ...x, ativo: !x.ativo } : x)))} aria-pressed={m.ativo} aria-label={m.ativo ? `Pausar ${m.titulo}` : `Mostrar ${m.titulo}`} title={m.ativo ? 'Visível — clique para pausar' : 'Pausado — clique para mostrar'}>
                      <Ico name="olho" size={16} />
                    </button>
                    <button type="button" className="icon" onClick={() => window.confirm(`Retirar “${m.titulo}”?`) && setItems((l) => l.filter((x) => x.id !== m.id))} aria-label={`Retirar ${m.titulo}`}>
                      <Ico name="lixo" size={16} />
                    </button>
                  </span>
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
              {(Object.keys(KIND_LABEL) as MediaKind[]).map((k) => (
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
                      if (f) setUrl(await fileToDataUrl(f, 1400, 0.82))
                      e.target.value = ''
                    }}
                  />
                  <button type="button" className="btn btn--line" onClick={() => file.current?.click()}>
                    <Ico name="carregar" size={16} /> Enviar imagem
                  </button>
                </div>
              </div>
            ) : (
              <Field
                label={tipo === 'youtube' ? 'Endereço do YouTube *' : 'Endereço do ficheiro MP4 *'}
                hint={tipo === 'youtube' ? 'Ex.: https://youtu.be/…' : 'O vídeo tem de estar alojado online (por exemplo, no Supabase Storage). Os vídeos não cabem na memória do navegador.'}
              >
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" inputMode="url" />
              </Field>
            )}
            {err && (
              <p className="ferr" role="alert">
                {err}
              </p>
            )}
            <button type="submit" className="btn">
              Acrescentar ao carrossel
            </button>
          </form>
        </Panel>
      </div>
    </>
  )
}
