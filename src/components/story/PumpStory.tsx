import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { lerp, range, smooth, useScrollProgress } from '../../hooks/useScrollProgress'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

/**
 * Posições da bomba nos 12 frames SVG do pacote (source-assets/frames),
 * num palco de 1200 × 900. São aproximação/deslocação de uma ilustração —
 * não uma rotação 3D. Em vez de carregar 12 ficheiros, interpola-se
 * continuamente entre estes valores com transform.
 */
const FRAMES: [x: number, y: number, w: number][] = [
  [150.0, 92.5, 657.0],
  [158.45, 90.23, 692.86],
  [166.22, 87.95, 728.0],
  [172.67, 85.68, 761.68],
  [177.29, 83.41, 793.24],
  [179.69, 81.14, 822.02],
  [179.69, 78.86, 847.45],
  [177.29, 76.59, 869.0],
  [172.67, 74.32, 886.23],
  [166.22, 72.05, 898.79],
  [158.45, 69.77, 906.44],
  [150.0, 67.5, 909.0],
]
const BASE = FRAMES[0]
/** Frame estático para prefers-reduced-motion (indicação do LEIA-ME). */
const STATIC_FRAME = 5

function frameAt(t: number) {
  const f = Math.min(FRAMES.length - 1, Math.max(0, t * (FRAMES.length - 1)))
  const i = Math.min(FRAMES.length - 2, Math.floor(f))
  const k = f - i
  const a = FRAMES[i]
  const b = FRAMES[i + 1]
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)] as const
}

const PHASES = [
  {
    eyebrow: 'Bombas pressurizadoras',
    title: 'Pressão estável em casa',
    text: 'Uma bomba com controlador automático liga-se quando abre a torneira e desliga-se quando fecha, para chuveiros e torneiras com pressão regular.',
    links: [{ to: '/catalogo?categoria=bombas-pressurizadoras', label: 'Ver bombas pressurizadoras' }],
  },
  {
    eyebrow: 'Bombagem solar',
    title: 'Água do furo para a machamba',
    text: 'Painéis solares alimentam uma bomba submersível através do seu controlador. A água sobe do furo para o depósito e segue para a rega ou para o abastecimento.',
    links: [
      { to: '/catalogo?categoria=bombagem-solar', label: 'Ver bombagem solar' },
      { to: '/catalogo?categoria=bombas-submersiveis', label: 'Ver bombas submersíveis' },
    ],
  },
]

export function PumpStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pumpRef = useRef<HTMLDivElement>(null)
  const calloutsRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const cropsRef = useRef<SVGGElement>(null)
  const flowRef = useRef<SVGGElement>(null)
  const size = useRef({ w: 600, h: 450 })
  const lastP = useRef(0)
  const [phase, setPhase] = useState(0)
  const reduced = usePrefersReducedMotion()

  const apply = (p: number) => {
    lastP.current = p
    const { w, h } = size.current
    const q = reduced ? 0 : p
    const [x, y, fw] = reduced ? FRAMES[STATIC_FRAME] : frameAt(smooth(range(q, 0.02, 0.48)))
    const s = fw / BASE[2]
    const dx = ((x - BASE[0]) / 1200) * w
    const dy = ((y - BASE[1]) / 900) * h

    // Saída da bomba para dar lugar à aplicação.
    const out = smooth(range(q, 0.52, 0.68))
    const pump = pumpRef.current
    if (pump) {
      pump.style.transform = `translate3d(${(dx - out * w * 0.18).toFixed(1)}px, ${(dy + out * h * 0.1).toFixed(1)}px, 0) scale(${(s * (1 - out * 0.45)).toFixed(4)})`
      pump.style.opacity = (1 - out).toFixed(3)
    }
    if (ringRef.current) ringRef.current.style.opacity = (1 - out).toFixed(3)
    if (calloutsRef.current) {
      const c = reduced ? 1 : range(q, 0.4, 0.48) * (1 - range(q, 0.5, 0.56))
      calloutsRef.current.style.opacity = c.toFixed(3)
      calloutsRef.current.style.visibility = c < 0.01 ? 'hidden' : 'visible'
    }
    const inn = smooth(range(q, 0.58, 0.78))
    if (appRef.current) {
      appRef.current.style.opacity = inn.toFixed(3)
      appRef.current.style.transform = `translate3d(0, ${((1 - inn) * 8).toFixed(2)}%, 0) scale(${(0.94 + 0.06 * inn).toFixed(4)})`
    }
    if (bgRef.current) bgRef.current.style.opacity = inn.toFixed(3)
    if (cropsRef.current) cropsRef.current.style.setProperty('--grow', smooth(range(q, 0.76, 0.94)).toFixed(3))
    if (flowRef.current) flowRef.current.style.opacity = range(q, 0.72, 0.8).toFixed(3)

    const ph = q < 0.56 ? 0 : 1
    setPhase((prev) => (prev === ph ? prev : ph))
  }

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      size.current = { w: el.clientWidth, h: el.clientHeight }
      apply(lastP.current)
    })
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  useScrollProgress(sectionRef, apply)

  return (
    <section ref={sectionRef} className={`pump-story${reduced ? ' is-static' : ''}`} aria-labelledby="pump-story-title">
      <div className="pump-story__sticky">
        <div className="pump-story__bg pump-story__bg--field" ref={bgRef} aria-hidden="true" />
        <div className="pump-story__inner">
          <div className="pump-story__text" aria-live="polite">
            <h2 id="pump-story-title" className="visually-hidden">
              Bombas de água e bombagem solar
            </h2>
            {PHASES.map((ph, i) => (
              <div key={ph.title} className={`ps-phase${(reduced || i === phase) ? ' is-active' : ''}`} aria-hidden={!reduced && i !== phase}>
                <p className="eyebrow">{ph.eyebrow}</p>
                <h3 className="ps-phase__title">{ph.title}</h3>
                <p className="ps-phase__text">{ph.text}</p>
                <div className="ps-phase__links">
                  {ph.links.map((l) => (
                    <Link key={l.to} className="btn btn--light btn--sm" to={l.to} tabIndex={!reduced && i !== phase ? -1 : undefined}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pump-story__stage" ref={stageRef}>
            <div className="pump-story__ring" ref={ringRef} aria-hidden="true" />
            <div className="pump-story__pump" ref={pumpRef}>
              <img
                src={`${import.meta.env.BASE_URL}img/produto/bomba-ilustrativa-720.webp`}
                srcSet={`${import.meta.env.BASE_URL}img/produto/bomba-ilustrativa-720.webp 720w, ${import.meta.env.BASE_URL}img/produto/bomba-ilustrativa-1200.webp 1200w`}
                sizes="(max-width: 800px) 90vw, 50vw"
                width={1200}
                height={800}
                alt="Ilustração de uma bomba pressurizadora com controlador automático"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="pump-story__callouts" ref={calloutsRef} aria-hidden="true">
              <span className="callout" style={{ left: '31%', top: '27%' }}>Controlador</span>
              <span className="callout callout--right" style={{ left: '69%', top: '44%' }}>Motor elétrico</span>
              <span className="callout" style={{ left: '27%', top: '58%' }}>Entrada de água</span>
            </div>

            <div className="pump-story__app" ref={appRef} aria-hidden={phase === 0 && !reduced}>
              <svg viewBox="0 0 1200 900" overflow="visible" role="img" aria-label="Ilustração de bombagem solar: painéis alimentam uma bomba num furo, que enche um depósito elevado ligado à rega de uma machamba.">
                <defs>
                  <linearGradient id="ps-panel" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#4C86DA" />
                    <stop offset="0.6" stopColor="#1B3C7A" />
                  </linearGradient>
                  <linearGradient id="ps-soil" x1="0" y1="540" x2="0" y2="1200" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#B98A55" />
                    <stop offset="1" stopColor="#8A5F36" />
                  </linearGradient>
                </defs>
                {/* Terreno */}
                <path d="M-900 566 C -300 548, 300 540, 900 546 S 1800 552, 2100 560 L 2100 1500 L -900 1500 Z" fill="url(#ps-soil)" />
                {/* Sulcos da machamba */}
                {Array.from({ length: 6 }, (_, i) => (
                  <path key={i} d={`M${520 + i * 20} ${600 + i * 50} L ${1200} ${590 + i * 56}`} stroke="#7A5230" strokeWidth="10" strokeLinecap="round" opacity="0.55" />
                ))}
                {/* Culturas */}
                <g ref={cropsRef} className="ps-crops">
                  {Array.from({ length: 6 }, (_, row) =>
                    Array.from({ length: 9 }, (_, c) => {
                      const x = 560 + row * 18 + c * 72
                      const y = 594 + row * 52 - c * 1.2
                      const sc = 0.7 + row * 0.08
                      return (
                        <g key={`${row}-${c}`} transform={`translate(${x} ${y}) scale(${sc})`}>
                          <g className="ps-crop">
                            <path d="M0 0 C -4 -20, -18 -30, -30 -30 C -20 -20, -8 -14, 0 0 Z" fill="#4E9A3E" />
                            <path d="M0 0 C 4 -24, 18 -36, 30 -36 C 20 -24, 8 -16, 0 0 Z" fill="#62B24C" />
                            <path d="M0 0 C -2 -26, 0 -40, 4 -48 C 6 -36, 4 -20, 0 0 Z" fill="#3E8A34" />
                          </g>
                        </g>
                      )
                    }),
                  )}
                </g>
                {/* Painéis */}
                <g>
                  <line x1="110" y1="520" x2="110" y2="600" stroke="#6E7F96" strokeWidth="7" />
                  <line x1="300" y1="470" x2="300" y2="600" stroke="#6E7F96" strokeWidth="7" />
                  {[0, 1].map((i) => (
                    <g key={i}>
                      <path d={`M${60 + i * 130} 540 L ${186 + i * 130} 540 L ${220 + i * 130} 410 L ${94 + i * 130} 410 Z`} fill="#D6DEE8" />
                      <path d={`M${64 + i * 130} 536 L ${182 + i * 130} 536 L ${215 + i * 130} 414 L ${97 + i * 130} 414 Z`} fill="url(#ps-panel)" />
                    </g>
                  ))}
                </g>
                {/* Controlador */}
                <rect x="360" y="500" width="54" height="70" rx="6" fill="#F1F5FA" />
                <rect x="370" y="512" width="34" height="18" rx="3" fill="#19B8E6" />
                <line x1="387" y1="570" x2="387" y2="604" stroke="#6E7F96" strokeWidth="6" />
                {/* Furo e bomba submersível */}
                <rect x="440" y="560" width="30" height="340" fill="#4F3520" />
                <rect x="446" y="780" width="18" height="80" rx="6" fill="#D5DCE6" />
                {/* Depósito elevado */}
                <g stroke="#6E7F96" strokeWidth="6">
                  <line x1="498" y1="380" x2="490" y2="580" />
                  <line x1="598" y1="380" x2="606" y2="580" />
                  <line x1="498" y1="480" x2="598" y2="480" strokeWidth="4" />
                </g>
                <rect x="486" y="250" width="124" height="134" rx="18" fill="#1E4E9A" />
                <ellipse cx="548" cy="252" rx="62" ry="8" fill="#3F78C9" />

                <g ref={flowRef} opacity="0">
                  {/* Cabo de energia */}
                  <path className="ps-flow ps-flow--energy" d="M300 520 H 360" />
                  <path className="ps-flow ps-flow--energy" d="M387 570 V 600 H 455 V 780" />
                  {/* Água */}
                  <path className="ps-flow ps-flow--water" d="M455 780 V 230 H 540 V 252" />
                  <path className="ps-flow ps-flow--water" d="M600 370 C 650 380, 640 560, 700 580 H 1200" />
                  <path className="ps-flow ps-flow--water" d="M700 580 V 880" />
                </g>
              </svg>
              <ul className="pump-story__labels">
                <li style={{ left: '12%', top: '38%' }}>Painéis</li>
                <li style={{ left: '30%', top: '66%' }}>Controlador</li>
                <li style={{ left: '38%', top: '94%' }}>Bomba no furo</li>
                <li style={{ left: '46%', top: '22%' }}>Depósito</li>
                <li style={{ left: '78%', top: '96%' }}>Machamba</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
