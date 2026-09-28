export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

/** Aceita números moçambicanos (+258 8x xxx xxxx) e internacionais com indicativo. */
export function isPhone(v: string): boolean {
  const d = v.replace(/[\s().-]/g, '')
  if (/^(\+?258)?8[2-7]\d{7}$/.test(d)) return true
  if (/^(\+?258)?2\d{7,8}$/.test(d)) return true
  return /^\+\d{8,15}$/.test(d)
}

export const isNuit = (v: string) => /^\d{9}$/.test(v.replace(/\s/g, ''))
