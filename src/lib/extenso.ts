/**
 * Valor por extenso em português de Portugal, para as cotações: 39 999,96 →
 * "Trinta e nove mil novecentos e noventa e nove Meticais e noventa e seis centavos".
 */

const UNI = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove']
const DEZ = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
const CEN = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

/** 1–999 */
function ate999(n: number): string {
  if (n === 100) return 'cem'
  const c = Math.floor(n / 100)
  const r = n % 100
  const partes: string[] = []
  if (c) partes.push(CEN[c])
  if (r) partes.push(r < 20 ? UNI[r] : DEZ[Math.floor(r / 10)] + (r % 10 ? ` e ${UNI[r % 10]}` : ''))
  return partes.join(' e ')
}

/** "e" entre dois grupos só quando o resto é menor que 100 ou é um número redondo de centenas. */
const liga = (resto: number) => (resto < 100 || resto % 100 === 0 ? ' e ' : ' ')

function inteiro(n: number): string {
  if (n === 0) return 'zero'
  const grupos: [number, string, string][] = [
    [1_000_000_000, 'mil milhões', 'mil milhões'],
    [1_000_000, 'milhão', 'milhões'],
    [1000, 'mil', 'mil'],
  ]
  let resto = n
  let out = ''
  for (const [v, um, varios] of grupos) {
    const q = Math.floor(resto / v)
    if (!q) continue
    resto -= q * v
    // "mil" sozinho (1 000) não leva "um"
    const txt = v === 1000 && q === 1 ? 'mil' : `${inteiro(q)} ${q === 1 ? um : varios}`
    out += (out ? ' ' : '') + txt
    if (resto) out += liga(resto).trimEnd()
  }
  if (resto) out += (out ? ' ' : '') + ate999(resto)
  return out.replace(/\s+/g, ' ').trim()
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Valor em meticais por extenso. Devolve "" se o valor não for um número positivo. */
export function valorPorExtenso(valor: number): string {
  if (!Number.isFinite(valor) || valor <= 0) return ''
  const total = Math.round(valor * 100)
  const mt = Math.floor(total / 100)
  const cts = total % 100
  const partes: string[] = []
  if (mt) partes.push(`${inteiro(mt)} ${mt === 1 ? 'Metical' : mt % 1_000_000 === 0 ? 'de Meticais' : 'Meticais'}`)
  if (cts) partes.push(`${inteiro(cts)} ${cts === 1 ? 'centavo' : 'centavos'}`)
  return cap(partes.join(' e '))
}
