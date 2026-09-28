import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HouseScene, type SceneMode } from './HouseScene'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

/**
 * Enquadramento da cena conforme a proporção do ecrã.
 * A casa ocupa x ≈ 290..1350 e assenta em y = 792. Em ecrãs largos a altura
 * visível é fixa; em ecrãs verticais alarga-se para caber a casa inteira.
 *
 * O palco é mais alto do que a hero (STAGE_EXTRA acima do topo) para que, na
 * transição, a câmara possa descer revelando céu em vez de um vazio.
 */
const STAGE_EXTRA = 0.2
const HOUSE_BASE_AT = 0.8

function computeViewBox(w: number, h: number): string {
  const stageH = Math.max(1, h) * (1 + STAGE_EXTRA)
  const aspect = Math.max(0.3, w / stageH)
  // Em ecrãs verticais aceita-se cortar a garagem e o depósito nas margens
  // (largura mínima 900) para a casa ganhar escala; a base sobe para deixar
  // espaço ao seletor.
  const portrait = w < h
  const minWidth = portrait ? 900 : 1120
  const baseAt = portrait ? 0.7 : HOUSE_BASE_AT
  const vbH = Math.max(930 * (1 + STAGE_EXTRA), minWidth / aspect)
  const vbW = vbH * aspect
  const anchor = (STAGE_EXTRA + baseAt) / (1 + STAGE_EXTRA)
  const x0 = 810 - vbW / 2
  const y0 = 792 - anchor * vbH
  return `${x0.toFixed(1)} ${y0.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`
}

const MODES: { id: SceneMode; label: string; hint: string }[] = [
  { id: 'day', label: 'Dia', hint: 'Os painéis captam energia' },
  { id: 'night', label: 'Noite', hint: 'A bateria assegura o consumo' },
]

export function Hero() {
  const [mode, setMode] = useState<SceneMode>('day')
  const [viewBox, setViewBox] = useState('0 0 1600 1000')
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const fogRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const update = () => setViewBox(computeViewBox(el.clientWidth, el.clientHeight))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // O cabeçalho adapta o contraste ao modo da hero.
  useEffect(() => {
    document.body.dataset.hero = mode
    return () => {
      delete document.body.dataset.hero
    }
  }, [mode])

  const choose = useCallback(
    (next: SceneMode) => {
      if (next === mode) return
      setMode(next)
      if (reduced) return
      const stage = stageRef.current
      const fog = fogRef.current
      if (!stage || !fog) return
      stage.getAnimations().forEach((a) => a.cancel())
      fog.getAnimations().forEach((a) => a.cancel())
      // Coreografia observada na referência: a cena desce e é envolvida por névoa
      // que sobe do chão; a meio da passagem troca a luz; a cena regressa à posição.
      const timing: KeyframeAnimationOptions = { duration: 1000, easing: 'cubic-bezier(.45,0,.2,1)' }
      stage.animate(
        [
          { transform: 'translate3d(0,0,0) scale(1)' },
          { transform: 'translate3d(0,13%,0) scale(1.06)', offset: 0.42 },
          { transform: 'translate3d(0,0,0) scale(1)' },
        ],
        timing,
      )
      fog.animate(
        [
          { opacity: 0, transform: 'translate3d(0,18%,0)' },
          { opacity: 0.94, transform: 'translate3d(0,0,0)', offset: 0.42 },
          { opacity: 0.94, transform: 'translate3d(0,-2%,0)', offset: 0.52 },
          { opacity: 0, transform: 'translate3d(0,-10%,0)' },
        ],
        timing,
      )
    },
    [mode, reduced],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = mode === 'day' ? 'night' : 'day'
      choose(next)
      requestAnimationFrame(() => {
        document.getElementById(`hero-mode-${next}`)?.focus()
      })
    }
  }

  return (
    <section ref={sectionRef} className="hero" data-mode={mode} aria-labelledby="hero-title">
      <div className="hero__stage" ref={stageRef}>
        <div className="hero__layer hero__layer--day">
          <HouseScene mode="day" viewBox={viewBox} />
        </div>
        <div className="hero__layer hero__layer--night">
          <HouseScene mode="night" viewBox={viewBox} />
        </div>
      </div>
      <div className="hero__mist" aria-hidden="true" />
      <div className="hero__bokeh" aria-hidden="true">
        <span className="hero__bokeh-l" />
        <span className="hero__bokeh-r" />
      </div>
      <div className="hero__fog" ref={fogRef} aria-hidden="true" />

      <div className="hero__content">
        <h1 id="hero-title" className="hero__title">
          <span className="hero__title-strong">Energia solar e água</span>
          <span className="hero__title-soft">
            do telhado <b>à torneira</b>
          </span>
        </h1>
        <div className="hero__ctas">
          <Link className="btn btn--primary" to="/contacto?tipo=cotacao">
            Pedir cotação
          </Link>
          <Link className="btn btn--glass" to="/catalogo">
            Explorar produtos
          </Link>
        </div>
      </div>

      <div className="hero__bottom">
        <div className="hero__switch" role="radiogroup" aria-label="Ver a casa de dia ou de noite" onKeyDown={onKeyDown}>
          {MODES.map((m) => (
            <button
              key={m.id}
              id={`hero-mode-${m.id}`}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              tabIndex={mode === m.id ? 0 : -1}
              className="hero__switch-btn"
              onClick={() => choose(m.id)}
            >
              <span className="hero__switch-label">{m.label}</span>
              <span className="hero__switch-hint">{m.hint}</span>
            </button>
          ))}
        </div>
        <p className="hero__lede">
          Painéis, inversores, baterias, bombas de água e termoacumuladores para casas, empresas e machambas em
          Moçambique.
        </p>
        <p className="hero__note">
          Ilustração de um sistema com painéis, inversor e bateria. O dimensionamento depende do consumo de cada caso.
        </p>
      </div>
    </section>
  )
}
