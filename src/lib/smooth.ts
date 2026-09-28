import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/** Scroll suave com inércia (rato/touchpad). Desligado em ecrãs táteis e com reduced motion. */
let lenis: Lenis | null = null

export function initSmooth() {
  if (lenis) return lenis
  const fine = matchMedia('(pointer: fine)').matches
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!fine || reduced) return null
  lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.95 })
  const raf = (t: number) => {
    lenis?.raf(t)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
  return lenis
}

export const smooth = () => lenis

export function scrollTop() {
  lenis?.resize()
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}
