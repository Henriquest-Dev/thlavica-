import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Ico } from './Ico'

export interface ZoomImage {
  src: string
  alt: string
}

const MIN = 1
const MAX = 5
const STEP = 1.5
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/**
 * Imagem em ecrã inteiro com zoom: botões + e −, roda do rato, dois dedos (pinça), duplo toque e arrastar.
 * Abre por cima da página (não mexe no seu tamanho) e fecha com Esc, o X ou um toque fora da imagem sem zoom.
 */
export function ImageZoom({ images, start = 0, onClose }: { images: ZoomImage[]; start?: number; onClose: () => void }) {
  const [i, setI] = useState(clamp(start, 0, images.length - 1))
  const [z, setZ] = useState({ s: 1, x: 0, y: 0 })
  const stage = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ d: number; s: number; x: number; y: number; px: number; py: number; moved: boolean } | null>(null)
  const lastTap = useRef(0)
  const [drag, setDrag] = useState(false)

  /** Mantém a imagem dentro do ecrã: não se pode arrastar para fora. */
  const fit = useCallback((s: number, x: number, y: number) => {
    const st = stage.current
    const im = img.current
    if (!st || !im || s <= 1) return { s: Math.max(MIN, s), x: 0, y: 0 }
    const w = im.offsetWidth * s
    const h = im.offsetHeight * s
    const mx = Math.max(0, (w - st.clientWidth) / 2)
    const my = Math.max(0, (h - st.clientHeight) / 2)
    return { s, x: clamp(x, -mx, mx), y: clamp(y, -my, my) }
  }, [])

  /** Zoom à volta de um ponto do ecrã (o centro, se não houver). */
  const zoomTo = useCallback(
    (s: number, cx?: number, cy?: number) =>
      setZ((cur) => {
        const ns = clamp(s, MIN, MAX)
        const st = stage.current
        if (!st || cx === undefined || cy === undefined) return fit(ns, (cur.x * ns) / cur.s, (cur.y * ns) / cur.s)
        const r = st.getBoundingClientRect()
        const ox = cx - (r.left + r.width / 2)
        const oy = cy - (r.top + r.height / 2)
        const k = ns / cur.s
        return fit(ns, ox - (ox - cur.x) * k, oy - (oy - cur.y) * k)
      }),
    [fit],
  )

  const go = useCallback(
    (d: number) => {
      if (images.length < 2) return
      setI((n) => (n + d + images.length) % images.length)
      setZ({ s: 1, x: 0, y: 0 })
    },
    [images.length],
  )

  // a página por trás não se mexe enquanto a imagem está aberta; ao fechar, o foco volta onde estava
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    closeBtn.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      prev?.focus?.()
    }
  }, [])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === '+' || e.key === '=') zoomTo(z.s * STEP)
      else if (e.key === '-') zoomTo(z.s / STEP)
      else if (e.key === '0') setZ({ s: 1, x: 0, y: 0 })
      else if (e.key === 'ArrowRight' && z.s === 1) go(1)
      else if (e.key === 'ArrowLeft' && z.s === 1) go(-1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose, zoomTo, go, z.s])

  // roda do rato (o React regista "wheel" como passivo, por isso vai à mão para poder travar o scroll)
  useEffect(() => {
    const st = stage.current
    if (!st) return
    const w = (e: WheelEvent) => {
      e.preventDefault()
      setZ((cur) => {
        const ns = clamp(cur.s * Math.exp(-e.deltaY * 0.0022), MIN, MAX)
        const r = st.getBoundingClientRect()
        const ox = e.clientX - (r.left + r.width / 2)
        const oy = e.clientY - (r.top + r.height / 2)
        const k = ns / cur.s
        return fit(ns, ox - (ox - cur.x) * k, oy - (oy - cur.y) * k)
      })
    }
    st.addEventListener('wheel', w, { passive: false })
    return () => st.removeEventListener('wheel', w)
  }, [fit])

  const down = (e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const ps = [...pointers.current.values()]
    const d = ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0
    gesture.current = { d, s: z.s, x: z.x, y: z.y, px: e.clientX, py: e.clientY, moved: false }
    setDrag(true)
  }

  const move = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    const ps = [...pointers.current.values()]
    if (ps.length > 1 && g.d > 0) {
      const d = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y)
      g.moved = true
      zoomTo(g.s * (d / g.d), (ps[0].x + ps[1].x) / 2, (ps[0].y + ps[1].y) / 2)
      return
    }
    const dx = e.clientX - g.px
    const dy = e.clientY - g.py
    if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true
    if (z.s > 1) setZ(fit(z.s, g.x + dx, g.y + dy))
  }

  const up = (e: React.PointerEvent) => {
    const g = gesture.current
    const wasPinch = pointers.current.size > 1
    pointers.current.delete(e.pointerId)
    if (pointers.current.size > 0) {
      // um dedo continua: recomeça a contar daqui (sem saltos)
      const [p] = [...pointers.current.values()]
      gesture.current = { d: 0, s: z.s, x: z.x, y: z.y, px: p.x, py: p.y, moved: true }
      return
    }
    gesture.current = null
    setDrag(false)
    if (!g || wasPinch) return
    // sem zoom, deslizar para o lado muda de fotografia
    if (z.s === 1 && Math.abs(e.clientX - g.px) > 60 && Math.abs(e.clientX - g.px) > Math.abs(e.clientY - g.py)) return go(e.clientX < g.px ? 1 : -1)
    if (g.moved) return
    // duplo toque: aproxima onde tocou, ou volta ao tamanho normal
    const now = Date.now()
    if (now - lastTap.current < 320) {
      lastTap.current = 0
      if (z.s > 1) setZ({ s: 1, x: 0, y: 0 })
      else zoomTo(2.5, e.clientX, e.clientY)
      return
    }
    lastTap.current = now
    // um toque fora da imagem, sem zoom, fecha
    if (z.s === 1 && e.target === stage.current) window.setTimeout(() => lastTap.current && onClose(), 330)
  }

  const cur = images[i]
  const pct = Math.round(z.s * 100)

  return createPortal(
    <div className="zoom" role="dialog" aria-modal="true" aria-label={`Ampliar: ${cur.alt}`}>
      <div className="zoom__bar">
        <span className="zoom__count" aria-live="polite">
          {images.length > 1 ? `${i + 1} / ${images.length}` : ''}
        </span>
        <button ref={closeBtn} type="button" className="zoom__btn" onClick={onClose} aria-label="Fechar">
          <Ico name="fechar" size={22} />
        </button>
      </div>

      <div
        ref={stage}
        className={`zoom__stage${z.s > 1 ? ' is-zoomed' : ''}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <img
          ref={img}
          key={cur.src}
          src={cur.src}
          alt={cur.alt}
          draggable={false}
          style={{ transform: `translate3d(${z.x}px, ${z.y}px, 0) scale(${z.s})` }}
          className={drag ? 'is-moving' : ''}
        />
      </div>

      {images.length > 1 && z.s === 1 && (
        <>
          <button type="button" className="zoom__btn zoom__nav zoom__nav--prev" onClick={() => go(-1)} aria-label="Imagem anterior">
            <Ico name="esq" size={22} />
          </button>
          <button type="button" className="zoom__btn zoom__nav zoom__nav--next" onClick={() => go(1)} aria-label="Imagem seguinte">
            <Ico name="dir" size={22} />
          </button>
        </>
      )}

      <div className="zoom__tools" role="group" aria-label="Zoom">
        <button type="button" className="zoom__btn" onClick={() => zoomTo(z.s / STEP)} disabled={z.s <= MIN} aria-label="Afastar">
          <Ico name="menos" size={20} />
        </button>
        <button type="button" className="zoom__pct" onClick={() => setZ({ s: 1, x: 0, y: 0 })} aria-label="Tamanho normal" title="Tamanho normal">
          {pct}%
        </button>
        <button type="button" className="zoom__btn" onClick={() => zoomTo(z.s * STEP)} disabled={z.s >= MAX} aria-label="Aproximar">
          <Ico name="mais" size={20} />
        </button>
      </div>
      <p className="zoom__hint">{z.s > 1 ? 'Arraste para ver outras partes' : 'Toque duas vezes ou use + para aproximar'}</p>
    </div>,
    document.body,
  )
}
