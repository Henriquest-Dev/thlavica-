import { useEffect, useRef, type RefObject } from 'react'

/**
 * Chama `onProgress(p)` com o progresso (0..1) do scroll através de um elemento
 * alto que contém uma área sticky. 0 = topo do elemento no topo do viewport;
 * 1 = fundo do elemento no fundo do viewport.
 *
 * Uma única leitura de layout por frame (getBoundingClientRect) e escrita
 * direta em estilos via callback — sem re-render do React por frame.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, onProgress: (p: number) => void) {
  const cb = useRef(onProgress)
  cb.current = onProgress

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    let last = -1
    let active = false

    const measure = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0
      if (Math.abs(p - last) > 0.0005) {
        last = p
        cb.current(p)
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    // Só escuta o scroll enquanto a secção está perto do viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        const on = entry.isIntersecting
        if (on && !active) {
          window.addEventListener('scroll', schedule, { passive: true })
          window.addEventListener('resize', schedule)
          active = true
          schedule()
        } else if (!on && active) {
          window.removeEventListener('scroll', schedule)
          window.removeEventListener('resize', schedule)
          active = false
          measure()
        }
      },
      { rootMargin: '20% 0px' },
    )
    io.observe(el)
    measure()

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ref])
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
/** Progresso local de `p` entre `a` e `b`. */
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
export const smooth = (t: number) => t * t * (3 - 2 * t)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
