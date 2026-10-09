import { describe, expect, it } from 'vitest'
import { ASSUMPTIONS, matchPumps, pumpCurve, sizePump, sizeSolar, solarMessage } from './sizing'

const line = (w: number, h: number, qty: number, nome = 'Aparelho') => ({ nome, w, h, qty })

describe('sizeSolar', () => {
  it('soma o consumo diário e dimensiona painéis e inversor', () => {
    const r = sizeSolar([line(100, 5, 2)], { battery: false, nightPct: 50 })
    expect(r.wh).toBe(1000)
    expect(r.panels).toBe(1)
    expect(r.inverterKw).toBe(1)
    expect(r.batteryKwh).toBe(0)
  })

  it('a bateria cobre a parte do consumo sem sol, com a profundidade de descarga', () => {
    const r = sizeSolar([line(100, 5, 2)], { battery: true, nightPct: 50 })
    expect(r.batteryKwh).toBeCloseTo((1000 * 0.5) / ASSUMPTIONS.depthOfDischarge / 1000)
  })

  it('sem aparelhos não propõe nada', () => {
    const r = sizeSolar([line(100, 5, 0)], { battery: true, nightPct: 50 })
    expect(r).toMatchObject({ wh: 0, panels: 0, batteryKwh: 0 })
  })

  it('escolhe o menor inversor que cobre a carga com margem', () => {
    // 3 000 W × 0,7 × 1,25 = 2 625 W → 3 kW
    expect(sizeSolar([line(1000, 1, 3)], { battery: false, nightPct: 0 }).inverterKw).toBe(3)
  })

  it('o texto do pedido lista os aparelhos e a sugestão', () => {
    const lines = [line(100, 5, 2, 'Televisor')]
    const msg = solarMessage(lines, sizeSolar(lines, { battery: false, nightPct: 0 }))
    expect(msg).toContain('2 × Televisor')
    expect(msg).toContain('sem baterias')
  })
})

describe('sizePump', () => {
  const input = { depth: 30, lift: 8, dist: 20, liters: 2000, sunHours: 6 }

  it('soma altura vertical, perdas na tubagem e distância', () => {
    const r = sizePump(input)
    expect(r.head).toBeCloseTo(38 + 3.8 + 0.2)
    expect(r.lmin).toBeCloseTo(2000 / 6 / 60)
  })

  it('a potência elétrica segue a hidráulica e o rendimento', () => {
    const r = sizePump(input)
    expect(r.elecW).toBeCloseTo(r.hydW / ASSUMPTIONS.pumpEff)
    expect(r.panels).toBeGreaterThanOrEqual(1)
  })

  it('só pede submersível acima de 7 m de profundidade', () => {
    expect(sizePump({ ...input, depth: 7 }).needsSubmersible).toBe(false)
    expect(sizePump({ ...input, depth: 8 }).needsSubmersible).toBe(true)
  })
})

describe('matchPumps', () => {
  const pump = (id: string, caudal: string, altura: string, name = 'Bomba solar') => ({
    id,
    name,
    category: 'bombas-solares',
    specs: [
      { label: 'Caudal', value: caudal },
      { label: 'Altura', value: altura },
    ],
  })

  it('lê os pares caudal/altura do anúncio', () => {
    expect(pumpCurve(pump('a', '20 / 40 / 60 L/min', '80 / 62 / 34 m'))).toEqual([
      { q: 20, h: 80 },
      { q: 40, h: 62 },
      { q: 60, h: 34 },
    ])
  })

  it('converte m³/h para L/min', () => {
    expect(pumpCurve(pump('a', '6 m³/h', '168 m'))?.[0].q).toBeCloseTo(100)
  })

  it('só devolve bombas que cobrem o ponto de funcionamento', () => {
    const catalog = [pump('fraca', '20 / 40 L/min', '30 / 20 m'), pump('boa', '20 / 40 / 60 L/min', '80 / 62 / 34 m')]
    expect(matchPumps(catalog, { lmin: 38, head: 60 }).map((p) => p.id)).toEqual(['boa'])
    expect(matchPumps(catalog, { lmin: 38, head: 500 })).toEqual([])
  })

  it('ignora produtos sem caudal e altura', () => {
    expect(matchPumps([{ id: 'x', name: 'Bomba solar', category: 'bombas-solares', specs: [] }], { lmin: 1, head: 1 })).toEqual([])
  })
})
