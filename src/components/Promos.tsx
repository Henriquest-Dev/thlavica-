import { useEffect, useRef, useState } from 'react'
import { useLivePromo } from '../lib/promos'
import type { Promo } from '../data/admin'
import { SmartLink } from './Ui'
import { Ico } from './Ico'
import { Arrow } from './Arrow'

const seen = (id: string) => {
  try {
    return window.sessionStorage.getItem('tlh:seen:' + id) === '1'
  } catch {
    return false
  }
}
const markSeen = (id: string) => {
  try {
    window.sessionStorage.setItem('tlh:seen:' + id, '1')
  } catch {
    /* ignorar */
  }
}

/** Faixa de promoção no topo (fixa), criada no painel de administração. */
export function PromoStrip() {
  const promo = useLivePromo('faixa')
  const [closed, setClosed] = useState<string | null>(null)
  const visible = promo && !seen('strip-' + promo.id) && closed !== promo.id

  useEffect(() => {
    document.documentElement.style.setProperty('--strip', visible ? '40px' : '0px')
    return () => document.documentElement.style.setProperty('--strip', '0px')
  }, [visible])

  if (!promo || !visible) return null
  return (
    <div className="strip" role="region" aria-label="Promoção">
      <p>
        {promo.selo && <b>{promo.selo}</b>}
        <span>{promo.titulo}</span>
        {promo.texto && <span className="strip__text"> — {promo.texto}</span>}
      </p>
      <SmartLink to={promo.destino || '/produtos'} className="strip__cta">
        {promo.cta || 'Ver'} <Arrow size={13} />
      </SmartLink>
      <button
        type="button"
        className="strip__close"
        aria-label="Fechar aviso"
        onClick={() => {
          markSeen('strip-' + promo.id)
          setClosed(promo.id)
        }}
      >
        <Ico name="fechar" size={14} />
      </button>
    </div>
  )
}

/** Pop-up de promoção: aparece uma vez por visita, depois de uns segundos. */
export function PromoPopup() {
  const promo = useLivePromo('popup')
  const [shown, setShown] = useState<Promo | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!promo || seen('popup-' + promo.id)) return
    const t = window.setTimeout(() => setShown(promo), 2800)
    return () => window.clearTimeout(t)
  }, [promo])

  useEffect(() => {
    if (!shown) return
    closeBtn.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown])

  const close = () => {
    if (shown) markSeen('popup-' + shown.id)
    setShown(null)
  }

  if (!shown) return null
  return (
    <div className="ov ov--center" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="popup" role="dialog" aria-modal="true" aria-labelledby="popup-title">
        <button ref={closeBtn} type="button" className="popup__close" onClick={close} aria-label="Fechar promoção">
          <Ico name="fechar" size={18} />
        </button>
        {shown.imagem && <img className="popup__img" src={shown.imagem} alt="" />}
        <div className="popup__body">
          {shown.selo && <span className="selo">{shown.selo}</span>}
          <h2 id="popup-title">{shown.titulo}</h2>
          {shown.texto && <p>{shown.texto}</p>}
          <SmartLink to={shown.destino || '/produtos'} className="pill pill--dark" onClick={close}>
            {shown.cta || 'Ver promoção'}
            <span className="pill__icon">
              <Arrow size={12} />
            </span>
          </SmartLink>
          {shown.fim && <p className="popup__until">Válida até {new Date(shown.fim + 'T12:00:00').toLocaleDateString('pt-PT')}</p>}
        </div>
      </div>
    </div>
  )
}

/** Banner de promoção na página inicial. */
export function PromoBanner() {
  const promo = useLivePromo('destaque')
  if (!promo) return null
  return (
    <section className="pbanner wrap reveal" aria-label="Promoção">
      <div className="pbanner__card">
        <div className="pbanner__text">
          {promo.selo && <span className="selo">{promo.selo}</span>}
          <h2>{promo.titulo}</h2>
          {promo.texto && <p>{promo.texto}</p>}
          <SmartLink to={promo.destino || '/produtos'} className="pill pill--light">
            {promo.cta || 'Ver promoção'}
            <span className="pill__icon">
              <Arrow size={14} />
            </span>
          </SmartLink>
          {promo.fim && <small>Válida até {new Date(promo.fim + 'T12:00:00').toLocaleDateString('pt-PT')}</small>}
        </div>
        {promo.imagem && <img className="pbanner__img" src={promo.imagem} alt="" loading="lazy" />}
      </div>
    </section>
  )
}
