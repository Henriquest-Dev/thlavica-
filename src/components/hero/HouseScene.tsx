/**
 * Cena da hero: casa moçambicana com painéis no telhado, depósito de água
 * elevado, inversor/bateria na parede e paisagem.
 *
 * A geometria é única; só a paleta muda entre dia e noite. As duas versões são
 * sobrepostas na hero e cruzadas por opacidade, por isso a casa nunca muda de
 * posição nem de desenho.
 *
 * Sistema de coordenadas: 0..1600 × 0..1000; o céu estende-se até y = -1400 e
 * o terreno de x = -700 a 2300 para permitir enquadramentos 9:16 a 21:9.
 */
import { memo } from 'react'

export type SceneMode = 'day' | 'night'

interface Palette {
  skyTop: string
  skyMid: string
  skyBottom: string
  hillFar: string
  hillNear: string
  treeFar: string
  ground: string
  groundFar: string
  wall: string
  wallShade: string
  wallSide: string
  trim: string
  roof: string
  roofShade: string
  roofEdge: string
  panel: string
  panelHi: string
  panelLine: string
  panelFrame: string
  glass: string
  glassHi: string
  door: string
  plant: string
  plantDark: string
  trunk: string
  tank: string
  tankHi: string
  steel: string
  path: string
  shadow: string
}

const DAY: Palette = {
  skyTop: '#7DB6E3',
  skyMid: '#BFDDF0',
  skyBottom: '#F3E6CB',
  hillFar: '#B7C6B4',
  hillNear: '#9BB090',
  treeFar: '#7E9774',
  ground: '#B9AE7C',
  groundFar: '#CFC394',
  wall: '#F4F0E8',
  wallShade: '#DCD5C8',
  wallSide: '#E6E0D4',
  trim: '#FFFFFF',
  roof: '#5E6B7C',
  roofShade: '#4B5667',
  roofEdge: '#3C4555',
  panel: '#1C3A73',
  panelHi: '#4F83D1',
  panelLine: '#6F9BE0',
  panelFrame: '#C9D2DE',
  glass: '#5C7690',
  glassHi: '#A8C2D9',
  door: '#6B4F3A',
  plant: '#5E8C43',
  plantDark: '#44703A',
  trunk: '#7A5B40',
  tank: '#1E4E9A',
  tankHi: '#3F78C9',
  steel: '#8A95A3',
  path: '#D9CDA8',
  shadow: 'rgba(40,50,40,0.28)',
}

const NIGHT: Palette = {
  skyTop: '#040A1C',
  skyMid: '#0C1A3A',
  skyBottom: '#253656',
  hillFar: '#16223C',
  hillNear: '#111B31',
  treeFar: '#0E1729',
  ground: '#141C2B',
  groundFar: '#1A2436',
  wall: '#343C50',
  wallShade: '#272E40',
  wallSide: '#2D3447',
  trim: '#4A5368',
  roof: '#1B2231',
  roofShade: '#151B28',
  roofEdge: '#0F141E',
  panel: '#0B1733',
  panelHi: '#2A4474',
  panelLine: '#23385F',
  panelFrame: '#39445A',
  glass: '#FFC874',
  glassHi: '#FFE2A8',
  door: '#3B2C22',
  plant: '#1B2A22',
  plantDark: '#121E18',
  trunk: '#2A2019',
  tank: '#12254A',
  tankHi: '#1E3A6E',
  steel: '#3A4354',
  path: '#262E3E',
  shadow: 'rgba(0,0,0,0.45)',
}

/** Estrelas determinísticas (sem Math.random para render estável). */
const STARS = Array.from({ length: 90 }, (_, i) => {
  const a = Math.sin(i * 91.7) * 10000
  const b = Math.sin(i * 47.3) * 10000
  return {
    x: -600 + (a - Math.floor(a)) * 2800,
    y: -1350 + (b - Math.floor(b)) * 1650,
    r: 0.8 + ((i * 37) % 10) / 6,
    d: (i % 7) * 0.6,
  }
})

const PANEL_COLS = 7
const PANEL_W = 44
const PANEL_GAP = 3
const PANEL_ROWS = [
  { y: 419, h: 55 },
  { y: 478, h: 58 },
]
const PANEL_X0 = 556

interface Props {
  mode: SceneMode
  /** Enquadramento calculado pela hero consoante a proporção do ecrã. */
  viewBox: string
}

function HouseSceneBase({ mode, viewBox }: Props) {
  const p = mode === 'day' ? DAY : NIGHT
  const night = mode === 'night'
  const id = (s: string) => `${mode}-${s}`
  const url = (s: string) => `url(#${id(s)})`

  const windows = [
    { x: 466, w: 66 },
    { x: 552, w: 66 },
    { x: 638, w: 66 },
    { x: 724, w: 66 },
  ]

  return (
    <svg
      className="house-scene"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="-1400" x2="0" y2="700" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="0.62" stopColor={p.skyMid} />
          <stop offset="1" stopColor={p.skyBottom} />
        </linearGradient>
        <linearGradient id={id('ground')} x1="0" y1="620" x2="0" y2="1100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.groundFar} />
          <stop offset="1" stopColor={p.ground} />
        </linearGradient>
        <linearGradient id={id('panel')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.panelHi} />
          <stop offset="0.55" stopColor={p.panel} />
          <stop offset="1" stopColor={p.panel} />
        </linearGradient>
        <linearGradient id={id('roof')} x1="0" y1="400" x2="0" y2="570" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.roofShade} />
          <stop offset="1" stopColor={p.roof} />
        </linearGradient>
        <linearGradient id={id('tank')} x1="0" x2="1">
          <stop offset="0" stopColor={p.tank} />
          <stop offset="0.35" stopColor={p.tankHi} />
          <stop offset="1" stopColor={p.tank} />
        </linearGradient>
        <linearGradient id={id('glass')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.glassHi} />
          <stop offset="1" stopColor={p.glass} />
        </linearGradient>
        <radialGradient id={id('sun')}>
          <stop offset="0" stopColor="#FFF6D8" />
          <stop offset="0.18" stopColor="#FFE9A6" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#FFD66B" stopOpacity="0.25" />
          <stop offset="1" stopColor="#FFD66B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('moon')}>
          <stop offset="0" stopColor="#F4F1E6" />
          <stop offset="0.12" stopColor="#E9E6DA" />
          <stop offset="0.16" stopColor="#B9C6E6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#8FA3D6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('spill')}>
          <stop offset="0" stopColor="#FFBE5C" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFBE5C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('lamp')}>
          <stop offset="0" stopColor="#FFE3A3" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#FFC867" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFB84D" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('cone')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD58A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFD58A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('haze')} x1="0" y1="520" x2="0" y2="700" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.skyBottom} stopOpacity="0" />
          <stop offset="1" stopColor={p.skyBottom} stopOpacity={night ? 0.35 : 0.55} />
        </linearGradient>
      </defs>

      {/* Céu */}
      <rect x="-700" y="-1400" width="3000" height="2100" fill={url('sky')} />

      {night ? (
        <g className="scene-stars">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#E8EEFF" style={{ animationDelay: `${s.d}s` }} />
          ))}
          <circle cx="1270" cy="170" r="260" fill={url('moon')} />
          <circle cx="1270" cy="170" r="30" fill="#F6F3E9" />
          <circle cx="1282" cy="162" r="27" fill={p.skyMid} opacity="0.18" />
        </g>
      ) : (
        <g>
          <circle cx="1260" cy="150" r="420" fill={url('sun')} />
          <g className="scene-clouds" fill="#FFFFFF">
            <g opacity="0.75">
              <ellipse cx="240" cy="210" rx="130" ry="26" />
              <ellipse cx="300" cy="192" rx="80" ry="30" />
              <ellipse cx="190" cy="198" rx="60" ry="20" />
            </g>
            <g opacity="0.6">
              <ellipse cx="860" cy="90" rx="110" ry="20" />
              <ellipse cx="910" cy="76" rx="64" ry="22" />
            </g>
            <g opacity="0.5">
              <ellipse cx="-260" cy="60" rx="140" ry="24" />
              <ellipse cx="1900" cy="260" rx="150" ry="24" />
            </g>
          </g>
        </g>
      )}

      {/* Colinas */}
      <path
        d="M-700 600 C -500 520, -300 560, -120 530 S 240 470, 420 520 S 760 560, 960 510 S 1320 460, 1520 520 S 1900 560, 2300 500 L 2300 700 L -700 700 Z"
        fill={p.hillFar}
      />
      <path
        d="M-700 640 C -420 590, -200 620, 60 596 S 460 570, 700 606 S 1100 620, 1320 590 S 1800 580, 2300 610 L 2300 720 L -700 720 Z"
        fill={p.hillNear}
      />

      {/* Árvores distantes: acácias e coqueiros */}
      <g fill={p.treeFar}>
        <path d="M60 612 l4 -60 l4 60 z" />
        <ellipse cx="64" cy="548" rx="70" ry="16" />
        <ellipse cx="44" cy="540" rx="40" ry="12" />
        <path d="M1560 612 l4 -54 l4 54 z" />
        <ellipse cx="1564" cy="556" rx="62" ry="14" />
        <path d="M-260 616 l3 -40 l3 40 z" />
        <ellipse cx="-257" cy="574" rx="44" ry="10" />
        <path d="M1980 610 l3 -44 l3 44 z" />
        <ellipse cx="1983" cy="564" rx="50" ry="11" />
      </g>
      <rect x="-700" y="520" width="3000" height="180" fill={url('haze')} />

      {/* Terreno */}
      <path d="M-700 650 C 0 630, 1000 626, 2300 648 L 2300 1800 L -700 1800 Z" fill={url('ground')} />
      <path d="M1000 790 C 1030 850, 1080 920, 1130 1000 L 1010 1000 C 1000 930, 990 860, 1010 790 Z" fill={p.path} opacity="0.9" />

      {/* Coqueiro à esquerda */}
      <g>
        <path d="M150 800 C 160 700, 175 600, 208 480" stroke={p.trunk} strokeWidth="14" fill="none" strokeLinecap="round" />
        <g fill={p.plantDark}>
          <path d="M208 480 C 150 450, 100 470, 60 520 C 110 485, 160 480, 208 486 Z" />
          <path d="M208 480 C 260 440, 320 450, 360 500 C 310 470, 260 470, 208 486 Z" />
          <path d="M208 480 C 190 420, 150 400, 110 410 C 160 425, 190 450, 206 486 Z" />
          <path d="M208 480 C 240 420, 290 405, 330 420 C 280 430, 240 455, 210 486 Z" />
          <path d="M208 480 C 170 490, 140 530, 136 580 C 160 540, 185 505, 210 488 Z" />
          <path d="M208 480 C 250 495, 275 530, 280 570 C 258 535, 232 505, 208 488 Z" />
        </g>
      </g>

      {/* Sombra da casa */}
      <ellipse cx="820" cy="800" rx="620" ry="34" fill={p.shadow} />

      {/* Anexo esquerdo (garagem) */}
      <rect x="296" y="596" width="140" height="196" fill={p.wallSide} />
      <rect x="288" y="586" width="156" height="14" fill={p.trim} />
      <rect x="312" y="652" width="108" height="140" fill={p.wallShade} />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x="312" y={660 + i * 19} width="108" height="2" fill={p.roofEdge} opacity="0.25" />
      ))}

      {/* Corpo principal */}
      <rect x="430" y="560" width="480" height="232" fill={p.wall} />
      <rect x="430" y="560" width="480" height="18" fill={p.wallShade} opacity="0.8" />
      {/* Inversor e bateria na parede lateral */}
      <g>
        <rect x="438" y="600" width="18" height="30" rx="2" fill={night ? '#3A4358' : '#E3E7EE'} stroke={p.roofEdge} strokeWidth="1" />
        <rect x="438" y="636" width="18" height="40" rx="2" fill={night ? '#2E3649' : '#D4DAE3'} stroke={p.roofEdge} strokeWidth="1" />
        <circle className={night ? 'scene-led' : undefined} cx="447" cy="610" r="2.2" fill={night ? '#3CFF9E' : '#2BB673'} />
        <rect x="441" y="664" width="12" height="8" fill={night ? '#36E08A' : '#9FD8B7'} opacity={night ? 0.9 : 0.8} />
      </g>

      {/* Janelas */}
      {windows.map((w) => (
        <g key={w.x}>
          <rect x={w.x - 4} y="606" width={w.w + 8} height="126" fill={p.trim} />
          <rect x={w.x} y="610" width={w.w} height="118" fill={url('glass')} />
          <rect x={w.x + w.w / 2 - 1.5} y="610" width="3" height="118" fill={p.trim} />
          <rect x={w.x} y="660" width={w.w} height="3" fill={p.trim} />
          {!night && <path d={`M${w.x + 6} 614 l18 0 l-14 44 l-18 0 z`} fill="#FFFFFF" opacity="0.25" />}
        </g>
      ))}

      {/* Telhado principal (quatro águas) */}
      <path d="M372 568 L 556 402 L 1030 402 L 1080 568 Z" fill={url('roof')} />
      {/* Chapa ondulada */}
      <g stroke={p.roofEdge} strokeWidth="1.2" opacity="0.35">
        {Array.from({ length: 34 }, (_, i) => {
          const x = 385 + i * 20
          return <line key={i} x1={x} y1="566" x2={556 + (x - 372) * (474 / 708)} y2="404" />
        })}
      </g>
      <path d="M366 566 L 1086 566 L 1086 578 L 366 578 Z" fill={p.roofEdge} />

      {/* Painéis fotovoltaicos */}
      <g className="scene-panels">
        {PANEL_ROWS.map((row, r) =>
          Array.from({ length: PANEL_COLS }, (_, c) => {
            const x = PANEL_X0 + c * (PANEL_W + PANEL_GAP) - r * 10
            const w = PANEL_W + r * 1.4
            return (
              <g key={`${r}-${c}`}>
                <rect x={x - 1.5} y={row.y - 1.5} width={w + 3} height={row.h + 3} fill={p.panelFrame} />
                <rect x={x} y={row.y} width={w} height={row.h} fill={url('panel')} />
                <line x1={x} y1={row.y + row.h / 3} x2={x + w} y2={row.y + row.h / 3} stroke={p.panelLine} strokeWidth="0.8" opacity="0.6" />
                <line x1={x} y1={row.y + (2 * row.h) / 3} x2={x + w} y2={row.y + (2 * row.h) / 3} stroke={p.panelLine} strokeWidth="0.8" opacity="0.6" />
                <line x1={x + w / 2} y1={row.y} x2={x + w / 2} y2={row.y + row.h} stroke={p.panelLine} strokeWidth="0.8" opacity="0.6" />
              </g>
            )
          }),
        )}
        {!night && (
          <path className="scene-glint" d="M540 540 L 600 414 L 640 414 L 580 540 Z" fill="#FFFFFF" opacity="0.18" />
        )}
      </g>

      {/* Ala frontal com empena */}
      <rect x="896" y="566" width="276" height="232" fill={p.wall} />
      <rect x="896" y="566" width="8" height="232" fill={p.wallShade} />
      <path d="M868 572 L 1034 434 L 1200 572 Z" fill={p.wallShade} />
      <path d="M884 572 L 1034 448 L 1184 572 Z" fill={p.wall} />
      {/* Beiral da empena */}
      <path d="M852 580 L 1034 424 L 1216 580 L 1200 586 L 1034 444 L 868 586 Z" fill={p.trim} />
      <path d="M1034 424 L 1216 580 L 1236 572 L 1054 418 Z" fill={p.roof} />
      <path d="M1034 424 L 852 580 L 836 574 L 1016 420 Z" fill={p.roofShade} />
      <circle cx="1034" cy="512" r="14" fill={p.wallShade} />
      <circle cx="1034" cy="512" r="9" fill={url('glass')} />

      {/* Porta envidraçada */}
      <rect x="990" y="640" width="88" height="152" fill={p.trim} />
      <rect x="996" y="646" width="37" height="146" fill={url('glass')} />
      <rect x="1035" y="646" width="37" height="146" fill={url('glass')} />
      <rect x="1030" y="706" width="3" height="16" fill={p.roofEdge} />
      <rect x="1035" y="706" width="3" height="16" fill={p.roofEdge} />
      {/* Janelas laterais da ala */}
      <rect x="918" y="640" width="52" height="92" fill={p.trim} />
      <rect x="922" y="644" width="44" height="84" fill={url('glass')} />
      <rect x="1098" y="640" width="52" height="92" fill={p.trim} />
      <rect x="1102" y="644" width="44" height="84" fill={url('glass')} />

      {/* Apliques de parede */}
      <rect x="978" y="652" width="6" height="12" rx="1" fill={night ? '#FFE3A3' : p.roofEdge} />
      <rect x="1084" y="652" width="6" height="12" rx="1" fill={night ? '#FFE3A3' : p.roofEdge} />
      {night && (
        <g className="scene-lights">
          <path d="M981 662 L 950 800 L 1012 800 Z" fill={url('cone')} />
          <path d="M1087 662 L 1056 800 L 1118 800 Z" fill={url('cone')} />
          <circle cx="981" cy="658" r="40" fill={url('lamp')} />
          <circle cx="1087" cy="658" r="40" fill={url('lamp')} />
          {windows.map((w) => (
            <ellipse key={w.x} cx={w.x + w.w / 2} cy="820" rx="70" ry="26" fill={url('spill')} />
          ))}
          <ellipse cx="1034" cy="830" rx="120" ry="34" fill={url('spill')} />
        </g>
      )}

      {/* Degrau */}
      <rect x="976" y="792" width="116" height="10" fill={p.wallShade} />

      {/* Acácia (atrás do depósito) */}
      <g>
        <path d="M1480 800 C 1486 720, 1500 650, 1520 590" stroke={p.trunk} strokeWidth="10" fill="none" />
        <path d="M1520 594 C 1540 560, 1570 540, 1600 540" stroke={p.trunk} strokeWidth="6" fill="none" />
        <ellipse cx="1540" cy="560" rx="120" ry="30" fill={p.plantDark} />
        <ellipse cx="1580" cy="540" rx="80" ry="22" fill={p.plant} />
        <ellipse cx="1500" cy="548" rx="60" ry="18" fill={p.plant} />
      </g>
      {/* Depósito de água elevado */}
      <g>
        <g stroke={p.steel} strokeWidth="5">
          <line x1="1262" y1="566" x2="1252" y2="800" />
          <line x1="1338" y1="566" x2="1348" y2="800" />
          <line x1="1262" y1="566" x2="1348" y2="700" strokeWidth="3" />
          <line x1="1338" y1="566" x2="1252" y2="700" strokeWidth="3" />
          <line x1="1256" y1="700" x2="1344" y2="700" strokeWidth="3" />
        </g>
        <rect x="1248" y="558" width="104" height="10" fill={p.steel} />
        <path d="M1252 476 Q 1252 462 1266 460 L 1334 460 Q 1348 462 1348 476 L 1348 558 L 1252 558 Z" fill={url('tank')} />
        <ellipse cx="1300" cy="461" rx="48" ry="7" fill={p.tankHi} />
        {[486, 510, 534].map((y) => (
          <rect key={y} x="1252" y={y} width="96" height="2.5" fill={p.tank} opacity="0.7" />
        ))}
        <path d="M1300 558 L 1300 610 Q 1300 620 1290 620 L 1180 620" stroke={p.steel} strokeWidth="4" fill="none" />
      </g>

      <g>
        <ellipse cx="890" cy="790" rx="46" ry="30" fill={p.plantDark} />
        <ellipse cx="872" cy="780" rx="30" ry="24" fill={p.plant} />
        <ellipse cx="1190" cy="788" rx="42" ry="30" fill={p.plantDark} />
        <ellipse cx="1206" cy="776" rx="26" ry="22" fill={p.plant} />
        <ellipse cx="300" cy="796" rx="56" ry="26" fill={p.plantDark} />
        <ellipse cx="460" cy="794" rx="40" ry="20" fill={p.plant} />
        <ellipse cx="1500" cy="800" rx="70" ry="28" fill={p.plantDark} />
      </g>
    </svg>
  )
}

export const HouseScene = memo(HouseSceneBase)
