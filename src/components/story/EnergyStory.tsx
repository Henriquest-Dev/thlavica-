import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { lerp, range, smooth, useScrollProgress } from '../../hooks/useScrollProgress'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

/**
 * Secção sticky "Captar → Armazenar → Utilizar".
 * O progresso do scroll comanda uma câmara (translate/scale de um grupo SVG)
 * que percorre um único diagrama com relações espaciais fixas:
 * painéis → inversor/bateria → casa e água.
 */

const STEPS = [
  {
    n: '01',
    title: 'Captar',
    text: 'Os painéis solares convertem a luz do sol em energia elétrica durante o dia.',
    link: { to: '/catalogo?categoria=paineis', label: 'Ver painéis' },
  },
  {
    n: '02',
    title: 'Armazenar',
    text: 'O inversor gere essa energia. Se o sistema incluir baterias, o excedente fica guardado para mais tarde.',
    link: { to: '/catalogo?categoria=inversores', label: 'Ver inversores e baterias' },
  },
  {
    n: '03',
    title: 'Utilizar',
    text: 'A energia alimenta a casa, os equipamentos e a bomba que leva a água do furo ao depósito e à torneira.',
    link: { to: '/catalogo?categoria=bombagem-solar', label: 'Ver bombagem solar' },
  },
]

type Cam = { p: number; cx: number; cy: number; s: number }
const CAMERA: Cam[] = [
  { p: 0, cx: 360, cy: 450, s: 1.55 },
  { p: 0.22, cx: 360, cy: 450, s: 1.55 },
  { p: 0.32, cx: 815, cy: 520, s: 1.7 },
  { p: 0.54, cx: 815, cy: 520, s: 1.7 },
  { p: 0.64, cx: 1300, cy: 540, s: 1.35 },
  { p: 0.82, cx: 1300, cy: 540, s: 1.35 },
  { p: 0.95, cx: 800, cy: 470, s: 1 },
  { p: 1, cx: 800, cy: 470, s: 1 },
]

function cameraAt(p: number) {
  for (let i = 0; i < CAMERA.length - 1; i++) {
    const a = CAMERA[i]
    const b = CAMERA[i + 1]
    if (p <= b.p) {
      const t = smooth(range(p, a.p, b.p))
      return { cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), s: lerp(a.s, b.s, t) }
    }
  }
  return CAMERA[CAMERA.length - 1]
}

const PATHS = {
  pv: 'M560 500 H 640 V 470 H 700',
  bat: 'M800 520 H 830',
  house: 'M760 400 V 330 H 1010 V 600 H 1070',
  pump: 'M1380 650 H 1450 V 830',
  pipe: 'M1478 830 V 380 H 1490',
  tap: 'M1460 470 V 520 H 1380',
}

export function EnergyStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const camRef = useRef<SVGGElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const r = useRef<Record<string, SVGElement | null>>({})
  const [step, setStep] = useState(0)
  const reduced = usePrefersReducedMotion()

  const set = (k: string) => (el: SVGElement | null) => {
    r.current[k] = el
  }

  const apply = (p: number) => {
    const cam = reduced ? { cx: 800, cy: 470, s: 1 } : cameraAt(p)
    camRef.current?.setAttribute(
      'transform',
      `translate(${(800 - cam.cx * cam.s).toFixed(2)} ${(450 - cam.cy * cam.s).toFixed(2)}) scale(${cam.s.toFixed(4)})`,
    )
    const q = reduced ? 1 : p
    const el = r.current
    const draw = (k: string, t: number) => {
      const e = el[k]
      if (e) e.style.strokeDashoffset = String(1 - t)
      const f = el[k + 'Flow']
      if (f) f.style.opacity = String(t > 0.98 ? 1 : 0)
    }
    const op = (k: string, v: number) => {
      const e = el[k]
      if (e) e.style.opacity = v.toFixed(3)
    }
    const scaleY = (k: string, v: number) => {
      const e = el[k]
      if (e) e.style.transform = `scaleY(${v.toFixed(3)})`
    }

    op('rays', 0.25 + 0.75 * range(q, 0, 0.14))
    op('pvGlow', 0.28 * range(q, 0.04, 0.2) * (1 - 0.6 * range(q, 0.3, 0.4)))
    draw('pv', range(q, 0.1, 0.3))
    draw('bat', range(q, 0.3, 0.36))
    scaleY('batFill', 0.06 + 0.94 * range(q, 0.34, 0.56))
    op('invScreen', 0.3 + 0.7 * range(q, 0.28, 0.34))
    draw('house', range(q, 0.56, 0.68))
    op('windows', range(q, 0.64, 0.72))
    draw('pump', range(q, 0.68, 0.76))
    draw('pipe', range(q, 0.72, 0.82))
    scaleY('water', 0.04 + 0.96 * range(q, 0.78, 0.92))
    draw('tap', range(q, 0.86, 0.92))
    op('drops', range(q, 0.9, 0.94))
    op('labels', reduced ? 1 : range(q, 0.9, 0.97))

    if (barRef.current) barRef.current.style.transform = `scaleX(${q.toFixed(4)})`
    const s = q < 0.3 ? 0 : q < 0.62 ? 1 : 2
    setStep((prev) => (prev === s ? prev : s))
  }

  useScrollProgress(sectionRef, apply)

  const line = (k: keyof typeof PATHS, cls: string) => (
    <>
      <path d={PATHS[k]} className={`es-line es-line--${cls}`} pathLength={1} ref={set(k)} />
      <path d={PATHS[k]} className={`es-flow es-flow--${cls}`} pathLength={1} ref={set(k + 'Flow')} />
    </>
  )

  return (
    <section
      ref={sectionRef}
      className={`energy-story${reduced ? ' is-static' : ''}`}
      aria-labelledby="energy-story-title"
    >
      <div className="energy-story__sticky">
        <div className="energy-story__text">
          <p className="eyebrow">Como funciona um sistema solar</p>
          <h2 id="energy-story-title" className="energy-story__title">
            Captar. Armazenar. Utilizar.
          </h2>
          <div className="energy-story__progress" aria-hidden="true">
            <div className="energy-story__bar" ref={barRef} />
          </div>
          <ol className="energy-story__steps">
            {STEPS.map((s, i) => (
              <li key={s.n} className={`es-step${i === step ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}>
                <span className="es-step__n">{s.n}</span>
                <div>
                  <h3 className="es-step__title">{s.title}</h3>
                  <p className="es-step__text">{s.text}</p>
                  <Link className="link-arrow" to={s.link.to}>
                    {s.link.label}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="energy-story__stage">
          <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Diagrama: painéis solares ligados a um inversor e bateria, que alimentam uma casa e uma bomba de água que enche um depósito.">
            <defs>
              <linearGradient id="es-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0E2B5E" />
                <stop offset="1" stopColor="#1A4C8F" />
              </linearGradient>
              <linearGradient id="es-panel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#4C86DA" />
                <stop offset="0.6" stopColor="#1B3C7A" />
              </linearGradient>
              <radialGradient id="es-sun">
                <stop offset="0" stopColor="#FFE9A0" />
                <stop offset="0.3" stopColor="#FFC21A" stopOpacity="0.6" />
                <stop offset="1" stopColor="#FFC21A" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="es-warm">
                <stop offset="0" stopColor="#FFD27A" stopOpacity="0.7" />
                <stop offset="1" stopColor="#FFD27A" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="es-water" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5CD6F5" />
                <stop offset="1" stopColor="#1596C8" />
              </linearGradient>
              <linearGradient id="es-ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#123A73" />
                <stop offset="1" stopColor="#0A2350" />
              </linearGradient>
            </defs>

            <g ref={camRef}>
              <rect x="-800" y="-600" width="3200" height="2100" fill="url(#es-sky)" />
              {/* Terreno e subsolo */}
              <rect x="-800" y="700" width="3200" height="800" fill="url(#es-ground)" />
              <line x1="-800" y1="700" x2="2400" y2="700" stroke="#2F6DB8" strokeWidth="2" />

              {/* Sol */}
              <g ref={set('rays')}>
                <circle cx="250" cy="170" r="220" fill="url(#es-sun)" />
                <circle cx="250" cy="170" r="54" fill="#FFC21A" />
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i * Math.PI) / 6
                  return (
                    <line
                      key={i}
                      x1={250 + Math.cos(a) * 76}
                      y1={170 + Math.sin(a) * 76}
                      x2={250 + Math.cos(a) * 104}
                      y2={170 + Math.sin(a) * 104}
                      stroke="#FFC21A"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  )
                })}
                <path d="M300 250 L 420 430" stroke="#FFD65C" strokeWidth="3" strokeDasharray="10 14" opacity="0.7" />
                <path d="M250 260 L 300 440" stroke="#FFD65C" strokeWidth="3" strokeDasharray="10 14" opacity="0.7" />
              </g>

              {/* Estrutura de painéis */}
              <g>
                <line x1="170" y1="560" x2="170" y2="700" stroke="#8FA6C4" strokeWidth="8" />
                <line x1="520" y1="560" x2="520" y2="700" stroke="#8FA6C4" strokeWidth="8" />
                <line x1="250" y1="440" x2="250" y2="700" stroke="#8FA6C4" strokeWidth="8" />
                <line x1="470" y1="440" x2="470" y2="700" stroke="#8FA6C4" strokeWidth="8" />
                {[0, 1, 2].map((i) => {
                  const x = 130 + i * 146
                  return (
                    <g key={i}>
                      <path d={`M${x} 570 L ${x + 140} 570 L ${x + 176} 420 L ${x + 36} 420 Z`} fill="#D6DEE8" />
                      <path d={`M${x + 4} 566 L ${x + 136} 566 L ${x + 170} 424 L ${x + 38} 424 Z`} fill="url(#es-panel)" />
                      {[1, 2, 3].map((k) => (
                        <line key={k} x1={x + 4 + 8.5 * k * 1.12} y1={566 - 35.5 * k} x2={x + 136 + 8.5 * k} y2={566 - 35.5 * k} stroke="#7FA6E6" strokeWidth="1.2" opacity="0.7" />
                      ))}
                      {[1, 2].map((k) => (
                        <line key={k} x1={x + 4 + 44 * k} y1="566" x2={x + 38 + 44 * k} y2="424" stroke="#7FA6E6" strokeWidth="1.2" opacity="0.7" />
                      ))}
                    </g>
                  )
                })}
                <path ref={set('pvGlow')} d="M134 566 L 566 566 L 602 424 L 166 424 Z" fill="#FFE27A" opacity="0" style={{ mixBlendMode: 'screen' }} />
              </g>

              {/* Inversor */}
              <g>
                <rect x="700" y="390" width="100" height="150" rx="12" fill="#F1F5FA" />
                <rect x="700" y="390" width="100" height="18" rx="9" fill="#DCE4EE" />
                <rect ref={set('invScreen')} x="718" y="424" width="64" height="36" rx="4" fill="#19B8E6" />
                <circle cx="730" cy="486" r="5" fill="#2BD17E" />
                <rect x="744" y="482" width="40" height="6" rx="3" fill="#C5D0DE" />
                <rect x="744" y="496" width="30" height="6" rx="3" fill="#C5D0DE" />
              </g>
              {/* Bateria */}
              <g>
                <rect x="830" y="420" width="104" height="240" rx="12" fill="#F1F5FA" />
                <rect x="856" y="408" width="52" height="16" rx="4" fill="#C5D0DE" />
                <rect x="846" y="440" width="72" height="200" rx="6" fill="#0A2350" />
                <rect ref={set('batFill')} className="es-origin-bottom" x="846" y="440" width="72" height="200" rx="6" fill="#2BD17E" />
                <path d="M890 500 L 872 548 L 888 548 L 876 590 L 906 534 L 890 534 L 902 500 Z" fill="#FFFFFF" opacity="0.9" />
              </g>
              <line x1="660" y1="700" x2="960" y2="700" stroke="#2F6DB8" strokeWidth="2" />
              <rect x="690" y="660" width="260" height="40" rx="4" fill="#123A73" />

              {/* Casa */}
              <g>
                <path d="M1060 470 L 1225 330 L 1390 470 Z" fill="#FFC21A" />
                <rect x="1080" y="468" width="290" height="232" fill="#F1F5FA" />
                <rect x="1110" y="510" width="80" height="80" rx="4" fill="#1B3C7A" />
                <rect x="1260" y="510" width="80" height="80" rx="4" fill="#1B3C7A" />
                <g ref={set('windows')} opacity="0">
                  <circle cx="1150" cy="550" r="110" fill="url(#es-warm)" />
                  <circle cx="1300" cy="550" r="110" fill="url(#es-warm)" />
                  <rect x="1110" y="510" width="80" height="80" rx="4" fill="#FFD27A" />
                  <rect x="1260" y="510" width="80" height="80" rx="4" fill="#FFD27A" />
                </g>
                <rect x="1196" y="600" width="58" height="100" rx="3" fill="#0A2350" />
                {/* Torneira */}
                <path d="M1380 520 h 16 v 16" stroke="#C5D0DE" strokeWidth="8" fill="none" strokeLinecap="round" />
                <g ref={set('drops')} opacity="0">
                  <circle className="es-drop" cx="1396" cy="552" r="5" fill="#5CD6F5" />
                  <circle className="es-drop es-drop--2" cx="1396" cy="552" r="5" fill="#5CD6F5" />
                </g>
              </g>

              {/* Depósito e furo */}
              <g>
                <g stroke="#8FA6C4" strokeWidth="6">
                  <line x1="1432" y1="460" x2="1426" y2="700" />
                  <line x1="1528" y1="460" x2="1534" y2="700" />
                  <line x1="1432" y1="560" x2="1528" y2="560" strokeWidth="4" />
                </g>
                <rect x="1420" y="340" width="120" height="124" rx="16" fill="#0A2350" stroke="#5B8FD8" strokeWidth="4" />
                <g clipPath="url(#es-tank-clip)">
                  <rect ref={set('water')} className="es-origin-bottom" x="1424" y="344" width="112" height="116" fill="url(#es-water)" />
                </g>
                <clipPath id="es-tank-clip">
                  <rect x="1424" y="344" width="112" height="116" rx="13" />
                </clipPath>
                {/* Furo */}
                <rect x="1462" y="700" width="32" height="170" fill="#061A3D" stroke="#2F6DB8" strokeWidth="2" />
                <rect x="1466" y="800" width="24" height="60" rx="6" fill="#C5D0DE" />
                <rect x="1466" y="812" width="24" height="4" fill="#8FA6C4" />
              </g>

              {/* Linhas de energia e água */}
              {line('pv', 'energy')}
              {line('bat', 'energy')}
              {line('house', 'energy')}
              {line('pump', 'energy')}
              {line('pipe', 'water')}
              {line('tap', 'water')}

              {/* Legendas da vista geral */}
              <g ref={set('labels')} className="es-labels" opacity="0">
                <text x="350" y="630">Painéis</text>
                <text x="815" y="730">Inversor + bateria</text>
                <text x="1225" y="740">Casa</text>
                <text x="1480" y="320">Depósito</text>
                <text x="1440" y="846" textAnchor="end">Bomba</text>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </section>
  )
}
