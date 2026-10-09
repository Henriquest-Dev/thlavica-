import { useId, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCatalog, type CatalogProduct } from '../lib/catalog'
import { setPrefill } from '../lib/quotes'
import { Ico } from './Ico'
import { Arrow } from './Arrow'

const fmt = (n: number, d = 0) => n.toLocaleString('pt-PT', { minimumFractionDigits: d, maximumFractionDigits: d })

/* ------------------------------------------------------------------ */
/* Energia solar                                                       */
/* ------------------------------------------------------------------ */

interface Appliance {
  id: string
  nome: string
  w: number
  h: number
}

const APPLIANCES: Appliance[] = [
  { id: 'led', nome: 'Lâmpada LED', w: 10, h: 5 },
  { id: 'vent', nome: 'Ventoinha', w: 60, h: 6 },
  { id: 'tv', nome: 'Televisor', w: 100, h: 5 },
  { id: 'frig', nome: 'Frigorífico', w: 150, h: 8 },
  { id: 'arca', nome: 'Arca congeladora', w: 200, h: 8 },
  { id: 'pc', nome: 'Computador portátil', w: 65, h: 6 },
  { id: 'carreg', nome: 'Router e carregadores', w: 20, h: 24 },
  { id: 'bomba', nome: 'Bomba pressurizadora', w: 750, h: 1 },
  { id: 'ac', nome: 'Ar condicionado', w: 1000, h: 4 },
  { id: 'ferro', nome: 'Ferro de engomar', w: 1000, h: 0.5 },
]

const SUN_HOURS = 5
const SYSTEM_EFF = 0.75
const PANEL_W = 625
const INVERTERS = [1, 1.5, 2, 3, 3.5, 5, 6, 8, 10, 12]

function SolarSim() {
  const nav = useNavigate()
  const uid = useId()
  const [qty, setQty] = useState<Record<string, number>>({ led: 6, tv: 1, frig: 1, carreg: 1 })
  const [hours, setHours] = useState<Record<string, number>>({})
  const [battery, setBattery] = useState(true)
  const [night, setNight] = useState(50)

  const r = useMemo(() => {
    let wh = 0
    let w = 0
    const lines: string[] = []
    for (const a of APPLIANCES) {
      const q = qty[a.id] ?? 0
      if (!q) continue
      const h = hours[a.id] ?? a.h
      wh += q * a.w * h
      w += q * a.w
      lines.push(`${q} × ${a.nome} (${a.w} W, ${fmt(h, h % 1 ? 1 : 0)} h/dia)`)
    }
    const peak = w * 0.7
    const inverter = INVERTERS.find((k) => k * 1000 >= peak * 1.25) ?? INVERTERS[INVERTERS.length - 1]
    const arrayW = wh / (SUN_HOURS * SYSTEM_EFF)
    const panels = Math.max(wh ? 1 : 0, Math.ceil(arrayW / PANEL_W))
    const batteryKwh = battery ? (wh * (night / 100)) / 0.8 / 1000 : 0
    return { wh, w, peak, inverter, arrayW, panels, batteryKwh, lines }
  }, [qty, hours, battery, night])

  const send = () => {
    setPrefill(
      [
        'Simulação (energia solar) feita no site:',
        ...r.lines.map((l) => `• ${l}`),
        `Consumo diário estimado: ${fmt(r.wh / 1000, 1)} kWh`,
        `Sugestão orientativa: ${r.panels} painéis de ${PANEL_W} W, inversor de cerca de ${fmt(r.inverter, 1)} kW${r.batteryKwh ? `, bateria de cerca de ${fmt(r.batteryKwh, 1)} kWh` : ', sem baterias'}.`,
      ].join('\n'),
    )
    nav('/contacto')
  }

  return (
    <div className="sim">
      <div className="sim__in">
        <h3 className="sim__h">O que quer alimentar?</h3>
        <ul className="appl">
          {APPLIANCES.map((a) => {
            const q = qty[a.id] ?? 0
            return (
              <li key={a.id} className={q ? 'is-on' : ''}>
                <div className="appl__name">
                  <span>{a.nome}</span>
                  <small>{a.w} W</small>
                </div>
                {q > 0 && (
                  <label className="appl__h">
                    <span className="visually-hidden">Horas por dia de {a.nome}</span>
                    <input type="number" min={0.5} max={24} step={0.5} value={hours[a.id] ?? a.h} onChange={(e) => setHours({ ...hours, [a.id]: Math.max(0.5, Math.min(24, Number(e.target.value) || 0.5)) })} />
                    <small>h/dia</small>
                  </label>
                )}
                <div className="qty" role="group" aria-label={`Quantidade: ${a.nome}`}>
                  <button type="button" onClick={() => setQty({ ...qty, [a.id]: Math.max(0, q - 1) })} aria-label="Menos um">
                    <Ico name="menos" size={14} />
                  </button>
                  <span aria-live="polite">{q}</span>
                  <button type="button" onClick={() => setQty({ ...qty, [a.id]: Math.min(30, q + 1) })} aria-label="Mais um">
                    <Ico name="mais" size={14} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        <fieldset className="sim__opt">
          <legend className="visually-hidden">Baterias</legend>
          <label className="check">
            <input type="checkbox" checked={battery} onChange={(e) => setBattery(e.target.checked)} />
            <span>Quero usar energia à noite ou quando falha a rede (com baterias)</span>
          </label>
          {battery && (
            <label className="sim__sel" htmlFor={`${uid}-night`}>
              Parte do consumo que acontece sem sol
              <select id={`${uid}-night`} value={night} onChange={(e) => setNight(Number(e.target.value))}>
                <option value={30}>Cerca de 30%</option>
                <option value={50}>Cerca de 50%</option>
                <option value={70}>Cerca de 70%</option>
                <option value={100}>Quase tudo (100%)</option>
              </select>
            </label>
          )}
        </fieldset>
      </div>

      <div className="sim__out" aria-live="polite">
        {r.wh === 0 ? (
          <p className="sim__empty">Escolha pelo menos um aparelho para ver a estimativa.</p>
        ) : (
          <>
            <p className="sim__lead">Consumo estimado</p>
            <p className="sim__big">
              {fmt(r.wh / 1000, 1)} <small>kWh por dia</small>
            </p>
            <dl className="sim__rows">
              <div>
                <dt>Painéis solares</dt>
                <dd>
                  {r.panels} × {PANEL_W} W <small>({fmt(r.arrayW / 1000, 1)} kW)</small>
                </dd>
              </div>
              <div>
                <dt>Inversor</dt>
                <dd>cerca de {fmt(r.inverter, 1)} kW</dd>
              </div>
              <div>
                <dt>Bateria de lítio</dt>
                <dd>{r.batteryKwh ? `cerca de ${fmt(r.batteryKwh, 1)} kWh` : 'não incluída'}</dd>
              </div>
            </dl>
            <p className="sim__note">
              Estimativa orientativa: {SUN_HOURS} horas de sol por dia, {Math.round(SYSTEM_EFF * 100)}% de rendimento do sistema e aparelhos nem sempre ligados ao mesmo tempo. A proposta final depende do local e da ficha técnica dos equipamentos.
            </p>
            <button type="button" className="pill pill--dark" onClick={send}>
              Pedir cotação com esta estimativa
              <span className="pill__icon">
                <Arrow size={12} />
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Bomba de água                                                       */
/* ------------------------------------------------------------------ */

const nums = (s: string) => (s.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => Number(n.replace(',', '.')))

/** Pares caudal (L/min) / altura (m) do anúncio, quando o produto os tem. */
function curve(p: CatalogProduct): { q: number; h: number }[] | null {
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

function PumpSim() {
  const nav = useNavigate()
  const catalog = useCatalog()
  const [depth, setDepth] = useState(30)
  const [lift, setLift] = useState(8)
  const [dist, setDist] = useState(20)
  const [liters, setLiters] = useState(2000)
  const [sun, setSun] = useState(6)

  const r = useMemo(() => {
    const friction = (depth + lift) * 0.1 + dist / 100
    const head = depth + lift + friction
    const qm3h = liters / 1000 / sun
    const lmin = (liters / sun) / 60
    const hydW = 2.725 * qm3h * head
    const elecW = hydW / 0.45
    const arrayW = elecW * 1.3
    const panels = Math.max(1, Math.ceil(arrayW / PANEL_W))
    const matches = catalog
      .filter((p) => ['bombas-solares', 'bombas-submersiveis'].includes(p.category) && /solar|DC|PV/i.test(`${p.name} ${p.category}`))
      .filter((p) => {
        const c = curve(p)
        return c ? c.some((pt) => pt.q >= lmin && pt.h >= head) : false
      })
      .slice(0, 3)
    return { head, qm3h, lmin, elecW, arrayW, panels, matches }
  }, [depth, lift, dist, liters, sun, catalog])

  const num = (v: number, set: (n: number) => void, min: number, max: number, step = 1) => (
    <input type="number" inputMode="decimal" min={min} max={max} step={step} value={v} onChange={(e) => set(Math.max(min, Math.min(max, Number(e.target.value) || min)))} />
  )

  const send = () => {
    setPrefill(
      [
        'Simulação (bomba de água) feita no site:',
        `• Profundidade da água: ${depth} m · Altura até ao depósito: ${lift} m · Distância: ${dist} m`,
        `• Água por dia: ${fmt(liters)} L em ${sun} h de sol`,
        `Resultado orientativo: altura total de cerca de ${fmt(r.head)} m, caudal de ${fmt(r.lmin)} L/min, painéis de cerca de ${fmt(r.arrayW)} W.`,
      ].join('\n'),
    )
    nav('/contacto')
  }

  return (
    <div className="sim">
      <div className="sim__in">
        <h3 className="sim__h">Dados do furo e do depósito</h3>
        <div className="sim__grid">
          <label>
            Profundidade da água <small>(metros, com o rebaixamento)</small>
            {num(depth, setDepth, 1, 300)}
          </label>
          <label>
            Altura do depósito acima do solo <small>(metros)</small>
            {num(lift, setLift, 0, 100)}
          </label>
          <label>
            Distância da tubagem até ao depósito <small>(metros)</small>
            {num(dist, setDist, 0, 2000, 5)}
          </label>
          <label>
            Água necessária por dia <small>(litros)</small>
            {num(liters, setLiters, 100, 200000, 100)}
          </label>
          <label>
            Horas de sol úteis para bombear
            <select value={sun} onChange={(e) => setSun(Number(e.target.value))}>
              {[4, 5, 6, 7, 8].map((h) => (
                <option key={h} value={h}>
                  {h} horas
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="sim__hint">A OMS indica 50 a 100 litros por pessoa e por dia para as necessidades básicas. Para rega, o consumo depende da cultura e da área.</p>
      </div>

      <div className="sim__out" aria-live="polite">
        <p className="sim__lead">Bomba necessária (estimativa)</p>
        <p className="sim__big">
          {fmt(r.lmin)} <small>L/min a {fmt(r.head)} m</small>
        </p>
        <dl className="sim__rows">
          <div>
            <dt>Caudal</dt>
            <dd>
              {fmt(r.qm3h, 1)} m³/h <small>({fmt(r.lmin)} L/min)</small>
            </dd>
          </div>
          <div>
            <dt>Altura total</dt>
            <dd>cerca de {fmt(r.head)} m</dd>
          </div>
          <div>
            <dt>Potência elétrica da bomba</dt>
            <dd>cerca de {fmt(r.elecW)} W</dd>
          </div>
          <div>
            <dt>Painéis solares</dt>
            <dd>
              cerca de {fmt(r.arrayW)} W <small>({r.panels} × {PANEL_W} W)</small>
            </dd>
          </div>
        </dl>
        {depth > 7 && <p className="sim__note">Com a água a mais de 7 m de profundidade, use uma bomba submersível: as de superfície não conseguem aspirar tanta altura.</p>}
        {r.matches.length > 0 ? (
          <div className="sim__match">
            <p>Modelos do catálogo que cobrem este ponto (dados do anúncio, a confirmar):</p>
            <ul>
              {r.matches.map((p) => (
                <li key={p.id}>
                  <Link to={`/produtos/${p.id}`}>{p.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="sim__note">Nenhum modelo do catálogo cobre este ponto com os dados do anúncio. Peça-nos uma proposta: podemos propor outra solução.</p>
        )}
        <p className="sim__note">
          Estimativa orientativa: perdas na tubagem de 10% da altura vertical mais 1 m por cada 100 m, rendimento da bomba de 45% e margem de 30% nos painéis. A escolha final depende da curva da bomba e da ficha técnica.
        </p>
        <button type="button" className="pill pill--dark" onClick={send}>
          Pedir cotação com esta estimativa
          <span className="pill__icon">
            <Arrow size={12} />
          </span>
        </button>
      </div>
    </div>
  )
}

export function Simulators() {
  const [tab, setTab] = useState<'solar' | 'bomba'>('solar')
  return (
    <div className="sims">
      <div className="sims__tabs" role="tablist" aria-label="Simuladores">
        <button type="button" role="tab" id="tab-solar" aria-selected={tab === 'solar'} aria-controls="panel-sim" onClick={() => setTab('solar')}>
          <Ico name="painel" size={28} /> Energia solar
        </button>
        <button type="button" role="tab" id="tab-bomba" aria-selected={tab === 'bomba'} aria-controls="panel-sim" onClick={() => setTab('bomba')}>
          <Ico name="submersivel" size={28} /> Bomba de água
        </button>
      </div>
      <div id="panel-sim" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'solar' ? <SolarSim /> : <PumpSim />}
      </div>
    </div>
  )
}
