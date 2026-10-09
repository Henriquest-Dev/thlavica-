import { useSyncExternalStore } from 'react'

/** Verdadeiro enquanto a media query corresponde (ex.: "(max-width: 760px)"). */
export function useMatch(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
