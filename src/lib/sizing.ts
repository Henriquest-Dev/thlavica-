/**
 * Dimensionamento orientativo (energia solar e bomba de água).
 * Funções puras: recebem os dados e devolvem números e o texto do pedido.
 * Os pressupostos estão em `ASSUMPTIONS` e aparecem nos resultados do site.
 */

export const ASSUMPTIONS = {
  sunHours: 5,
  systemEff: 0.75,
  panelW: 625,
  /** Aparelhos nem sempre ligados ao mesmo tempo. */
  simultaneity: 0.7,
  inverterMargin: 1.25,
  /** Profundidade de descarga útil da bateria de lítio. */
  depthOfDischarge: 0.8,
  pumpEff: 0.45,
  panelMargin: 1.3,
  /** Perdas na tubagem: 10% da altura vertical mais 1 m por 100 m. */
  frictionRate: 0.1,
}

export const INVERTERS_KW = [1, 1.5, 2, 3, 3.5, 5, 6, 8, 10, 12]

export interface ApplianceLine {
  nome: string
  w: number
  /** Horas de funcionamento por dia. */
  h: number
  qty: number
}

export interface SolarSizing {
  /** Consumo diário em Wh. */
  wh: number
  /** Potência de todos os aparelhos ligados, em W. */
  totalW: number
  inverterKw: number
  arrayW: number
  panels: number
  batteryKwh: number
}

export function sizeSolar(lines: ApplianceLine[], opt: { battery: boolean; nightPct: number }, a = ASSUMPTIONS): SolarSizing {
  const active = lines.filter((l) => l.qty > 0)
  const wh = active.reduce((n, l) => n + l.qty * l.w * l.h, 0)
  const totalW = active.reduce((n, l) => n + l.qty * l.w, 0)
  const need = totalW * a.simultaneity * a.inverterMargin
  const inverterKw = INVERTERS_KW.find((k) => k * 1000 >= need) ?? INVERTERS_KW[INVERTERS_KW.length - 1]
  const arrayW = wh / (a.sunHours * a.systemEff)
  const panels = wh ? Math.max(1, Math.ceil(arrayW / a.panelW)) : 0
  const batteryKwh = opt.battery ? (wh * (opt.nightPct / 100)) / a.depthOfDischarge / 1000 : 0
  return { wh, totalW, inverterKw, arrayW, panels, batteryKwh }
}

export function solarMessage(lines: ApplianceLine[], r: SolarSizing, a = ASSUMPTIONS): string {
  const fmt = (n: number, d = 1) => n.toLocaleString('pt-PT', { maximumFractionDigits: d })
  return [
    'Simulação (energia solar) feita no site:',
    ...lines.filter((l) => l.qty > 0).map((l) => `• ${l.qty} × ${l.nome} (${l.w} W, ${fmt(l.h)} h/dia)`),
    `Consumo diário estimado: ${fmt(r.wh / 1000)} kWh`,
    `Sugestão orientativa: ${r.panels} painéis de ${a.panelW} W, inversor de cerca de ${fmt(r.inverterKw)} kW${r.batteryKwh ? `, bateria de cerca de ${fmt(r.batteryKwh)} kWh` : ', sem baterias'}.`,
  ].join('\n')
}

export interface PumpInput {
  /** Profundidade da água, com rebaixamento (m). */
  depth: number
  /** Altura do depósito acima do solo (m). */
  lift: number
  /** Distância da tubagem até ao depósito (m). */
  dist: number
  /** Água necessária por dia (L). */
  liters: number
  /** Horas de sol úteis para bombear. */
  sunHours: number
}

export interface PumpSizing {
  head: number
  qm3h: number
  lmin: number
  hydW: number
  elecW: number
  arrayW: number
  panels: number
  /** Acima de 7 m de aspiração, só serve bomba submersível. */
  needsSubmersible: boolean
}

export function sizePump(i: PumpInput, a = ASSUMPTIONS): PumpSizing {
  const head = i.depth + i.lift + (i.depth + i.lift) * a.frictionRate + i.dist / 100
  const qm3h = i.liters / 1000 / i.sunHours
  const lmin = i.liters / i.sunHours / 60
  // ρ·g/3600 = 2,725 W por (m³/h · m)
  const hydW = 2.725 * qm3h * head
  const elecW = hydW / a.pumpEff
  const arrayW = elecW * a.panelMargin
  return { head, qm3h, lmin, hydW, elecW, arrayW, panels: Math.max(1, Math.ceil(arrayW / a.panelW)), needsSubmersible: i.depth > 7 }
}

export interface PumpLike {
  id: string
  name: string
  category: string
  specs: { label: string; value: string }[]
}

const nums = (s: string) => (s.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => Number(n.replace(',', '.')))

/** Pares caudal (L/min) / altura (m) do anúncio, quando o produto os tem. */
export function pumpCurve(p: PumpLike): { q: number; h: number }[] | null {
  const f = p.specs.find((s) => /^Caudal/.test(s.label))
  const a = p.specs.find((s) => /^Altura/.test(s.label))
  if (!f || !a) return null
  const fq = nums(f.value)
  const fh = nums(a.value)
  if (!fq.length || !fh.length) return null
  const toLmin = (n: number) => (/m³\/h/.test(f.value) ? (n * 1000) / 60 : /L\/h/.test(f.value) ? n / 60 : n)
  if (fq.length === fh.length) return fq.map((q, i) => ({ q: toLmin(q), h: fh[i] }))
  return [{ q: toLmin(Math.max(...fq)), h: Math.max(...fh) }]
}

/** Bombas solares do catálogo que, segundo o anúncio, cobrem o ponto de funcionamento. */
export function matchPumps<T extends PumpLike>(catalog: T[], need: { lmin: number; head: number }, limit = 3): T[] {
  return catalog
    .filter((p) => ['bombas-solares', 'bombas-submersiveis'].includes(p.category) && /solar|DC|PV/i.test(`${p.name} ${p.category}`))
    .filter((p) => pumpCurve(p)?.some((pt) => pt.q >= need.lmin && pt.h >= need.head))
    .slice(0, limit)
}

export function pumpMessage(i: PumpInput, r: PumpSizing): string {
  const fmt = (n: number) => Math.round(n).toLocaleString('pt-PT')
  return [
    'Simulação (bomba de água) feita no site:',
    `• Profundidade da água: ${i.depth} m · Altura até ao depósito: ${i.lift} m · Distância: ${i.dist} m`,
    `• Água por dia: ${fmt(i.liters)} L em ${i.sunHours} h de sol`,
    `Resultado orientativo: altura total de cerca de ${fmt(r.head)} m, caudal de ${fmt(r.lmin)} L/min, painéis de cerca de ${fmt(r.arrayW)} W.`,
  ].join('\n')
}
