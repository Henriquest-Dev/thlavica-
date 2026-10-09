import { useCallback, useSyncExternalStore } from 'react'

/**
 * Armazenamento local do protótipo (localStorage).
 * Quando o Supabase for ligado, basta trocar a implementação de `read`/`write`
 * por chamadas à base de dados: os hooks e as páginas não mudam.
 */

const PREFIX = 'tlh:'
const listeners = new Set<() => void>()
const cache = new Map<string, { raw: string | null; value: unknown }>()

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key)
  } catch {
    return null
  }
}

function read<T>(key: string, fallback: T): T {
  const raw = readRaw(key)
  const hit = cache.get(key)
  if (hit && hit.raw === raw) return hit.value as T
  let value: T = fallback
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T
    } catch {
      value = fallback
    }
  }
  cache.set(key, { raw, value })
  return value
}

/** Devolve false se o navegador recusou gravar (por exemplo, memória cheia). */
export function writeStored<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    return false
  }
  listeners.forEach((l) => l())
  return true
}

export function removeStored(key: string) {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    /* sem armazenamento disponível */
  }
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(PREFIX)) cb()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

/** `fallback` tem de ser uma constante estável (fora do componente). */
export function useStored<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  )
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback)
      return writeStored(key, typeof next === 'function' ? (next as (p: T) => T)(prev) : next)
    },
    [key, fallback],
  )
  return [value, set] as const
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

/** Reduz uma imagem enviada para caber no armazenamento local. */
export function fileToDataUrl(file: File, max = 900, quality = 0.84): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      const ctx = c.getContext('2d')
      if (!ctx) return reject(new Error('Sem suporte de canvas'))
      ctx.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      const out = c.toDataURL('image/webp', quality)
      resolve(out.startsWith('data:image/webp') ? out : c.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem'))
    }
    img.src = url
  })
}
