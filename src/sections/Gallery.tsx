import { MediaCarousel } from '../components/MediaCarousel'
import { mediaAt, useMedia } from '../lib/promos'

/**
 * Fotografias e vídeos geridos em "Vídeos e fotos" no painel, no sítio que a empresa escolheu:
 * 'inicio' (secção na página inicial), 'topo' (por baixo do cartaz), 'produtos' (lista) ou 'produto:<id>'.
 * Só aparece se houver itens ativos para esse sítio.
 */
export function MediaSlot({ where, title, lead, className = '' }: { where: string; title?: string; lead?: string; className?: string }) {
  const [items] = useMedia()
  if (!mediaAt(items, where).length) return null
  return (
    <section className={`gal-sec ${className}`} aria-label={title ?? 'Fotografias e vídeos'}>
      <div className="wrap">
        {title && <h2 className="gal-sec__title">{title}</h2>}
        {lead && <p className="gal-sec__lead muted">{lead}</p>}
        <MediaCarousel where={where} />
      </div>
    </section>
  )
}

export const Gallery = () => <MediaSlot where="inicio" title="O nosso trabalho" lead="Fotografias e vídeos de instalações e equipamentos." />
