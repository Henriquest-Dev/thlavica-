import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ico } from '../components/Ico'
import { asset } from '../lib/asset'
import { mediaAt, safeLink, useCarouselSettings, useMedia } from '../lib/promos'
import { img } from '../lib/asset'
import { useMatch } from '../lib/useMatch'
import { Arrow } from '../components/Arrow'
import { solutions, type SolutionId } from '../data/site'

/** Palavra grande de cada solução (à maneira dos números da referência). */
const WORD: Record<SolutionId, string> = {
  'energia-solar': 'Solar',
  bombagem: 'Bombas',
  'aquecimento-solar': 'Água quente',
}

const ALT =
  'Tlhavika, soluções energéticas: energia solar e bombas de água para residências, comércios, agricultura e indústria. Painéis solares, inversores, baterias, bombas e termoacumuladores solares.'

/** Telemóvel: o cartaz mostra-se inteiro, à largura do ecrã (sem deslizar). */
function MobileBanner() {
  return (
    <div className="hero__m">
      <img src={img('banner-1200')} alt={ALT} width={1200} height={480} fetchPriority="high" decoding="async" />
    </div>
  )
}

const fileSrc = (u: string) => (/^(https?:|data:|blob:)/.test(u) ? u : asset(u))

export type Slide = { key: string; src?: string; alt: string; link?: string; original?: boolean; video?: boolean }

/** Vídeo do cartaz: sem som, só corre quando está à vista; ao acabar passa ao seguinte. */
function HeroVideo({ src, on, loop, onEnded, label }: { src: string; on: boolean; loop: boolean; onEnded: () => void; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (on) {
      v.currentTime = 0
      void v.play().catch(() => {})
    } else v.pause()
  }, [on])
  return <video ref={ref} src={src} muted playsInline loop={loop} preload="metadata" aria-label={label} onEnded={onEnded} />
}

/** Slides do cartaz principal: o de origem (se estiver ligado) e as fotografias e vídeos escolhidos no painel. */
export function useHeroSlides(): Slide[] {
  const [media] = useMedia()
  const conf = useCarouselSettings()
  const custom: Slide[] = mediaAt(media, 'cartaz').map((m) => ({ key: m.id, src: fileSrc(m.url), alt: m.titulo, link: safeLink(m.link), video: m.tipo === 'video' }))
  return custom.length ? [...(conf.cartazOrigem ? [{ key: 'origem', alt: ALT, original: true }] : []), ...custom] : []
}

/**
 * Cartaz principal com as fotografias escolhidas no painel ("Cartaz principal"): passam umas atrás das outras,
 * com setas e pontos; o cartaz de origem pode continuar a ser o primeiro.
 */
export function HeroSlides({ slides, mobile }: { slides: Slide[]; mobile: boolean }) {
  const conf = useCarouselSettings()
  const [i, setI] = useState(0)
  const [hold, setHold] = useState(false)
  const n = slides.length
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    if (i >= n) setI(0)
  }, [i, n])
  useEffect(() => {
    // num vídeo espera que ele acabe
    if (!conf.auto || reduce || hold || n < 2 || slides[i]?.video) return
    const t = window.setTimeout(() => setI((x) => (x + 1) % n), conf.segundos * 1000)
    return () => window.clearTimeout(t)
  }, [conf.auto, conf.segundos, reduce, hold, n, i, slides])
  const go = (d: number) => setI((x) => (x + d + n) % n)
  // deslizar com o dedo muda de imagem
  const tx = useRef<number | null>(null)

  return (
    <div
      className="hs"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Cartaz"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocusCapture={() => setHold(true)}
      onBlurCapture={() => setHold(false)}
      onTouchStart={(e) => (tx.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const start = tx.current
        tx.current = null
        if (start === null || n < 2) return
        const dx = e.changedTouches[0].clientX - start
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
      }}
    >
      {slides.map((s, k) => {
        const on = k === i
        const pic = s.original ? (
          mobile ? (
            <img src={img('banner-1200')} alt={s.alt} width={1200} height={480} fetchPriority={k === 0 ? 'high' : undefined} decoding="async" />
          ) : (
            <img
              src={img('banner-1983')}
              srcSet={`${img('banner-800')} 800w, ${img('banner-1200')} 1200w, ${img('banner-1600')} 1600w, ${img('banner-1983')} 1983w`}
              sizes="100vw"
              alt={s.alt}
              width={1983}
              height={793}
              fetchPriority={k === 0 ? 'high' : undefined}
            />
          )
        ) : s.video ? (
          <HeroVideo src={s.src!} on={on} loop={n < 2} label={s.alt} onEnded={() => conf.auto && go(1)} />
        ) : (
          <img src={s.src} alt={s.alt} loading={k === 0 ? 'eager' : 'lazy'} decoding="async" draggable={false} />
        )
        return (
          <div key={s.key} className={`hs__slide${on ? ' is-on' : ''}`} aria-hidden={!on} aria-roledescription="slide" aria-label={`${k + 1} de ${n}`}>
            {s.link ? (
              <Link to={s.link} tabIndex={on ? 0 : -1}>
                {pic}
              </Link>
            ) : (
              pic
            )}
          </div>
        )
      })}
      {n > 1 && (
        <div className="hs__ctrl">
          <button type="button" onClick={() => go(-1)} aria-label="Imagem anterior">
            <Ico name="esq" size={18} />
          </button>
          <ol className="hs__dots">
            {slides.map((s, k) => (
              <li key={s.key}>
                <button type="button" className={k === i ? 'is-on' : ''} onClick={() => setI(k)} aria-label={`Ir para a imagem ${k + 1}`} aria-current={k === i} />
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => go(1)} aria-label="Imagem seguinte">
            <Ico name="dir" size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Início: o cartaz da Tlhavika ocupa a largura toda; por baixo, o título,
 * o pedido de cotação e as três áreas (entram em sequência e reagem ao rato).
 */
export function Hero() {
  const mobile = useMatch('(max-width: 760px)')
  const slides = useHeroSlides()
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__banner">
        {slides.length ? (
          <HeroSlides slides={slides} mobile={mobile} />
        ) : mobile ? (
          <MobileBanner />
        ) : (
          <img
            className="hero__img"
            src={img('banner-1983')}
            srcSet={`${img('banner-800')} 800w, ${img('banner-1200')} 1200w, ${img('banner-1600')} 1600w, ${img('banner-1983')} 1983w`}
            sizes="100vw"
            alt={ALT}
            width={1983}
            height={793}
            fetchPriority="high"
          />
        )}
        <nav className="hero__band" aria-label="Áreas de trabalho">
          {solutions.map((s, i) => (
            <Link key={s.id} to={`/solucoes/${s.id}`} className="hero__stat" style={{ '--i': i } as React.CSSProperties}>
              <span className="hero__stat-big">
                {WORD[s.id]}
                <span className="hero__stat-arrow" aria-hidden="true">
                  <Arrow size={14} />
                </span>
              </span>
              <span className="hero__stat-text">{s.short}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="hero__body wrap">
        <div className="hero__text">
          <h1 id="hero-title" className="hero__title">
            Energia do sol, água onde precisa
          </h1>
          <div className="hero__side">
            <p className="hero__lead">Painéis, inversores, baterias, bombas de água e termoacumuladores solares para casas, negócios e machambas.</p>
            <div className="hero__ctas">
              <Link to="/contacto" className="pill pill--light">
                Pedir cotação
                <span className="pill__icon">
                  <Arrow size={14} />
                </span>
              </Link>
              <Link to="/produtos" className="pill pill--ghost">
                Ver produtos
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
