/**
 * Wordmark tipográfico provisório. O pacote só tem o logótipo em imagens
 * rasterizadas de anúncios: substituir pelo ficheiro vetorial oficial.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return <span className={`wordmark ${className}`}>TLHAVIKA</span>
}
