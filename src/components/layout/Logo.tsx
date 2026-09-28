import { site } from '../../config/site'

/** Símbolo da Tlhavika (lâmpada com raios, vetorizado da publicação oficial) + nome. */
export function Logo({ className = '' }: { className?: string }) {
  if (site.logoSrc) return <img className={`logo ${className}`} src={site.logoSrc} alt={site.nome} height={32} />
  return (
    <span className={`logo logo--text ${className}`}>
      <img className="logo__mark" src={`${import.meta.env.BASE_URL}img/logo-simbolo.svg`} alt="" width={28} height={28} />
      {site.nome}
    </span>
  )
}
