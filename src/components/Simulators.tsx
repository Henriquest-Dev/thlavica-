import { useId, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { ASSUMPTIONS, matchPumps, pumpMessage, sizePump, sizeSolar, solarMessage, type PumpInput } from '../lib/sizing'
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

function SolarSim() {
  const nav = useNavigate()
  const uid = useId()
  const [qty, setQty] = useState<Record<string, number>>({ led: 6, tv: 1, frig: 1, carreg: 1 })
  const [hours, setHours] = useState<Record<string, number>>({})
  const [battery, setBattery] = useState(true)
  const [night, setNight] = useState(50)

  const lines = useMemo(() => APPLIANCES.map((a) => ({ nome: a.nome, w: a.w, h: hours[a.id] ?? a.h, qty: qty[a.id] ?? 0 })), [qty, hours])
  const r = useMemo(() => sizeSolar(lines, { battery, nightPct: night }), [lines, battery, night])

  const send = () => {
    setPrefill(solarMessage(lines, r))
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
                  {r.panels} × {ASSUMPTIONS.panelW} W <small>({fmt(r.arrayW / 1000, 1)} kW)</small>
                </dd>
              </div>
              <div>
                <dt>Inversor</dt>
                <dd>cerca de {fmt(r.inverterKw, 1)} kW</dd>
              </div>
              <div>
                <dt>Bateria de lítio</dt>
                <dd>{r.batteryKwh ? `cerca de ${fmt(r.batteryKwh, 1)} kWh` : 'não incluída'}</dd>
              </div>
            </dl>
            <p className="sim__note">
              Estimativa orientativa: {ASSUMPTIONS.sunHours} horas de sol por dia, {Math.round(ASSUMPTIONS.systemEff * 100)}% de rendimento do sistema e aparelhos nem sempre ligados ao mesmo tempo. A proposta final depende do local e da ficha técnica dos equipamentos.
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

function PumpSim() {
  const nav = useNavigate()
  const catalog = useCatalog()
  const [input, setInput] = useState<PumpInput>({ depth: 30, lift: 8, dist: 20, liters: 2000, sunHours: 6 })
  const set = (k: keyof PumpInput) => (n: number) => setInput((v) => ({ ...v, [k]: n }))

  const r = useMemo(() => sizePump(input), [input])
  const matches = useMemo(() => matchPumps(catalog, { lmin: r.lmin, head: r.head }), [catalog, r])

  const num = (k: keyof PumpInput, min: number, max: number, step = 1) => (
    <input type="number" inputMode="decimal" min={min} max={max} step={step} value={input[k]} onChange={(e) => set(k)(Math.max(min, Math.min(max, Number(e.target.value) || min)))} />
  )

  const send = () => {
    setPrefill(pumpMessage(input, r))
    nav('/contacto')
  }

  return (
    <div className="sim">
      <div className="sim__in">
        <h3 className="sim__h">Dados do furo e do depósito</h3>
        <div className="sim__grid">
          <label>
            Profundidade da água <small>(metros, com o rebaixamento)</small>
            {num('depth', 1, 300)}
          </label>
          <label>
            Altura do depósito acima do solo <small>(metros)</small>
            {num('lift', 0, 100)}
          </label>
          <label>
            Distância da tubagem até ao depósito <small>(metros)</small>
            {num('dist', 0, 2000, 5)}
          </label>
          <label>
            Água necessária por dia <small>(litros)</small>
            {num('liters', 100, 200000, 100)}
          </label>
          <label>
            Horas de sol úteis para bombear
            <select value={input.sunHours} onChange={(e) => set('sunHours')(Number(e.target.value))}>
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
              cerca de {fmt(r.arrayW)} W <small>({r.panels} × {ASSUMPTIONS.panelW} W)</small>
            </dd>
          </div>
        </dl>
        {r.needsSubmersible && <p className="sim__note">Com a água a mais de 7 m de profundidade, use uma bomba submersível: as de superfície não conseguem aspirar tanta altura.</p>}
        {matches.length > 0 ? (
          <div className="sim__match">
            <p>Modelos do catálogo que cobrem este ponto (dados do anúncio, a confirmar):</p>
            <ul>
              {matches.map((p) => (
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
          Estimativa orientativa: perdas na tubagem de {Math.round(ASSUMPTIONS.frictionRate * 100)}% da altura vertical mais 1 m por cada 100 m, rendimento da bomba de {Math.round(ASSUMPTIONS.pumpEff * 100)}% e margem de {Math.round((ASSUMPTIONS.panelMargin - 1) * 100)}% nos painéis. A escolha final depende da curva da bomba e da ficha técnica.
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
