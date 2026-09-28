import { useEffect, type RefObject } from 'react'

/**
 * Escreve --p (0..1) no elemento: progresso do scroll através dele.
 * mode 'sticky': 0 quando o topo chega ao topo do ecrã, 1 quando o fundo chega ao fundo.
 * mode 'enter': 0 quando o topo entra por baixo do ecrã, 1 quando chega ao topo.
 * Toda a coreografia é feita em CSS a partir de --p (sem re-render do React).
 */
export function useProgress(ref: RefObject<HTMLElement | null>, mode: 'sticky' | 'enter' = 'sticky') {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let last = -1
    const measure = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p =
        mode === 'sticky'
          ? Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)))
          : Math.min(1, Math.max(0, (vh - r.top) / vh))
      if (Math.abs(p - last) > 0.0003) {
        last = p
        el.style.setProperty('--p', p.toFixed(4))
      }
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ref, mode])
}
