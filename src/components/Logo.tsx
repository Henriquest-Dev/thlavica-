import { asset } from '../lib/asset'

/**
 * Logótipo: símbolo (lâmpada com raios) vetorizado a partir da publicação
 * oficial da Tlhavika no Facebook + nome em texto. Substituir pelo ficheiro
 * vetorial oficial quando existir.
 */
export function Logo({ light = true, className = '' }: { light?: boolean; className?: string }) {
  return (
    <span className={`logo${light ? ' logo--light' : ''} ${className}`}>
      <img src={asset('img/logo-simbolo.svg')} alt="" width={30} height={30} />
      <span>TLHAVIKA</span>
    </span>
  )
}
