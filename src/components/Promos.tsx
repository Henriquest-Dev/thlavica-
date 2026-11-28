import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { mediaAt, promoLink, promoProducts, promoStyle, safeLink, useLivePromo, useMedia } from '../lib/promos'
import { asset } from '../lib/asset'
import type { MediaItem } from '../data/admin'
import { productImage, useCatalog, type CatalogProduct } from '../lib/catalog'
import { categoryPic } from '../data/site'
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

/** Produtos a que a promoção se aplica: foto e nome, cada um leva à sua página. */
function PromoProducts({ list, onNavigate }: { list: CatalogProduct[]; onNavigate?: () => void }) {
  if (!list.length) return null
  return (
    <ul className="pprods" aria-label="Produtos em promoção">
      {list.map((p) => {
        const src = productImage(p, true)
        return (
          <li key={p.id}>
            <Link to={`/produtos/${p.id}`} className="pprods__item" onClick={onNavigate}>
              <span className="pprods__img">{src ? <img src={src} alt="" loading="lazy" /> : <Ico name={categoryPic(p.category)} size={28} />}</span>
              <span className="pprods__name">{p.name}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** Faixa de promoção no topo (fixa), criada no painel de administração. */
export function PromoStrip() {
  const promo = useLivePromo('faixa')
  const [closed, setClosed] = useState<string | null>(null)
  const catalog = useCatalog()
  const visible = promo && !seen('strip-' + promo.id) && closed !== promo.id

  useEffect(() => {
    document.documentElement.style.setProperty('--strip', visible ? '40px' : '0px')
    return () => document.documentElement.style.setProperty('--strip', '0px')
  }, [visible])

  if (!promo || !visible) return null
  return (
    <div className="strip" data-estilo={promoStyle(promo)} role="region" aria-label="Promoção">
      <p>
        {promo.selo && <b>{promo.selo}</b>}
        <span>{promo.titulo}</span>
        {promo.texto && <span className="strip__text"> — {promo.texto}</span>}
        {promoProducts(promo, catalog).length > 0 && (
          <span className="strip__text"> · {promoProducts(promo, catalog).map((x) => x.name).join(', ')}</span>
        )}
      </p>
      <SmartLink to={promoLink(promo)} className="strip__cta">
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
  const catalog = useCatalog()

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
      <div className="popup" data-estilo={promoStyle(shown)} role="dialog" aria-modal="true" aria-labelledby="popup-title">
        <button ref={closeBtn} type="button" className="popup__close" onClick={close} aria-label="Fechar promoção">
          <Ico name="fechar" size={18} />
        </button>
        {shown.imagem && <img className="popup__img" src={shown.imagem} alt="" />}
        <div className="popup__body">
          {shown.selo && <span className="selo">{shown.selo}</span>}
          <h2 id="popup-title">{shown.titulo}</h2>
          {shown.texto && <p>{shown.texto}</p>}
          <PromoProducts list={promoProducts(shown, catalog)} onNavigate={close} />
          <SmartLink to={promoLink(shown)} className="pill pill--dark" onClick={close}>
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

const fileSrc = (u: string) => (/^(https?:|data:|blob:)/.test(u) ? u : asset(u))

/**
 * Pop-up de "Vídeos e fotos" (sítio "Pop-up"): uma fotografia ou vídeo por cima do site, uma vez por visita.
 * Se houver uma promoção em pop-up ativa, essa tem prioridade (nunca aparecem os dois).
 */
export function MediaPopup() {
  const promo = useLivePromo('popup')
  const [media] = useMedia()
  const item = mediaAt(media, 'popup')[0]
  const [shown, setShown] = useState<MediaItem | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (promo || !item || seen('media-popup-' + item.id)) return
    const t = window.setTimeout(() => setShown(item), 2500)
    return () => window.clearTimeout(t)
  }, [promo, item])

  const close = () => {
    if (shown) markSeen('media-popup-' + shown.id)
    setShown(null)
  }

  useEffect(() => {
    if (!shown) return
    closeBtn.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown])

  if (!shown) return null
  const to = safeLink(shown.link)
  const pic =
    shown.tipo === 'video' ? (
      <video src={fileSrc(shown.url)} autoPlay muted loop playsInline controls aria-label={shown.titulo} />
    ) : (
      <img src={fileSrc(shown.url)} alt={shown.titulo} />
    )
  return (
    <div className="ov ov--center" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="mpop" role="dialog" aria-modal="true" aria-label={shown.titulo}>
        <button ref={closeBtn} type="button" className="popup__close" onClick={close} aria-label="Fechar">
          <Ico name="fechar" size={18} />
        </button>
        {to && shown.tipo !== 'video' ? (
          <Link to={to} onClick={close} className="mpop__media">
            {pic}
          </Link>
        ) : (
          <div className="mpop__media">{pic}</div>
        )}
        {(shown.legenda || to) && (
          <div className="mpop__cap">
            {shown.legenda && <p>{shown.legenda}</p>}
            {to && (
              <Link to={to} className="pill pill--dark" onClick={close}>
                Ver mais
                <span className="pill__icon">
                  <Arrow size={12} />
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Banner de promoção na página inicial. */
export function PromoBanner() {
  const promo = useLivePromo('destaque')
  const catalog = useCatalog()
  if (!promo) return null
  const list = promoProducts(promo, catalog)
  // sem foto própria, a promoção mostra a foto do primeiro produto
  const pic = promo.imagem ?? (list[0] ? productImage(list[0], true) : undefined)
  return (
    <section className="pbanner wrap" aria-label="Promoção">
      <div className="pbanner__card" data-estilo={promoStyle(promo)}>
        <div className="pbanner__text">
          {promo.selo && <span className="selo">{promo.selo}</span>}
          <h2>{promo.titulo}</h2>
          {promo.texto && <p>{promo.texto}</p>}
          {/* com um só produto e sem foto própria, a foto grande já é esse produto */}
          <PromoProducts list={promo.imagem || list.length > 1 ? list : []} />
          <SmartLink to={promoLink(promo)} className="pill pill--light">
            {promo.cta || 'Ver promoção'}
            <span className="pill__icon">
              <Arrow size={14} />
            </span>
          </SmartLink>
          {promo.fim && <small>Válida até {new Date(promo.fim + 'T12:00:00').toLocaleDateString('pt-PT')}</small>}
        </div>
        {pic && <img className={`pbanner__img${promo.imagem ? '' : ' pbanner__img--product'}`} src={pic} alt="" loading="lazy" />}
      </div>
    </section>
  )
}
