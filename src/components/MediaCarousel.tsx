import { useCallback, useEffect, useRef, useState } from 'react'
import { useMedia, youtubeId } from '../lib/promos'
import { asset } from '../lib/asset'
import type { MediaItem } from '../data/admin'
import { Ico } from './Ico'

const src = (u: string) => (/^(https?:|data:|blob:)/.test(u) ? u : asset(u))

function Slide({ m, active }: { m: MediaItem; active: boolean }) {
  const [playing, setPlaying] = useState(false)
  const [thumbFail, setThumbFail] = useState(false)
  useEffect(() => {
    if (!active) setPlaying(false)
  }, [active])

  if (m.tipo === 'imagem') return <img src={src(m.url)} alt={m.titulo} loading="lazy" draggable={false} />

  if (m.tipo === 'video')
    return <video src={src(m.url)} controls playsInline preload="metadata" aria-label={m.titulo} />

  const id = youtubeId(m.url)
  if (!id) return <div className="mc__bad">Endereço de vídeo inválido</div>
  if (playing)
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={m.titulo}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    )
  return (
    <button type="button" className="mc__play" onClick={() => setPlaying(true)} aria-label={`Ver vídeo: ${m.titulo}`}>
      {!thumbFail && <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" onError={() => setThumbFail(true)} />}
      <span className="mc__playicon">
        <Ico name="reproduzir" size={26} />
      </span>
    </button>
  )
}

/** Carrossel de fotografias e vídeos gerido no painel de administração. */
export function MediaCarousel({ autoplay = true }: { autoplay?: boolean }) {
  const [all] = useMedia()
  const items = all.filter((m) => m.ativo)
  const track = useRef<HTMLUListElement>(null)
  const [idx, setIdx] = useState(0)
  const [hold, setHold] = useState(false)

  const go = useCallback(
    (i: number) => {
      const el = track.current
      if (!el || !items.length) return
      const n = (i + items.length) % items.length
      const slide = el.children[n] as HTMLElement
      el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2, behavior: 'smooth' })
    },
    [items.length],
  )

  useEffect(() => {
    const el = track.current
    if (!el) return
    const on = () => {
      const mid = el.scrollLeft + el.clientWidth / 2
      let best = 0
      let bd = Infinity
      Array.from(el.children).forEach((c, i) => {
        const h = c as HTMLElement
        const d = Math.abs(h.offsetLeft + h.clientWidth / 2 - mid)
        if (d < bd) {
          bd = d
          best = i
        }
      })
      setIdx(best)
    }
    el.addEventListener('scroll', on, { passive: true })
    return () => el.removeEventListener('scroll', on)
  }, [items.length])

  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const current = items[idx]
  useEffect(() => {
    if (!autoplay || reduce || hold || items.length < 2 || current?.tipo !== 'imagem') return
    const t = window.setTimeout(() => go(idx + 1), 5500)
    return () => window.clearTimeout(t)
  }, [autoplay, reduce, hold, idx, items.length, current?.tipo, go])

  if (!items.length) return <p className="muted">Sem itens ativos no carrossel.</p>

  return (
    <div
      className="mc"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Fotografias e vídeos"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocusCapture={() => setHold(true)}
      onBlurCapture={() => setHold(false)}
    >
      <ul className="mc__track" ref={track}>
        {items.map((m, i) => (
          <li key={m.id} className={`mc__slide${i === idx ? ' is-active' : ''}`} aria-roledescription="slide" aria-label={`${i + 1} de ${items.length}`}>
            <div className="mc__media">
              <Slide m={m} active={i === idx} />
            </div>
            <div className="mc__cap">
              <strong>{m.titulo}</strong>
              {m.legenda && <span>{m.legenda}</span>}
            </div>
          </li>
        ))}
      </ul>
      <div className="mc__ctrl">
        <button type="button" onClick={() => go(idx - 1)} aria-label="Anterior">
          <Ico name="esq" size={20} />
        </button>
        <ol className="mc__dots">
          {items.map((m, i) => (
            <li key={m.id}>
              <button type="button" className={i === idx ? 'is-on' : ''} onClick={() => go(i)} aria-label={`Ir para ${m.titulo}`} aria-current={i === idx} />
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => go(idx + 1)} aria-label="Seguinte">
          <Ico name="dir" size={20} />
        </button>
      </div>
    </div>
  )
}
