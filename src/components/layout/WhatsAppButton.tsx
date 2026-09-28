import { useLocation } from 'react-router-dom'
import { whatsappLink } from '../../config/site'
import { productById } from '../../data/products'

export function WhatsAppButton() {
  const { pathname } = useLocation()
  const m = pathname.match(/^\/produto\/(.+)$/)
  const product = m ? productById(m[1]) : undefined
  const text = product
    ? `Olá Tlhavika, gostaria de uma cotação para: ${product.nome}.`
    : 'Olá Tlhavika, gostaria de mais informações sobre os vossos produtos.'
  return (
    <a className="wa-float" href={whatsappLink(text)} target="_blank" rel="noopener noreferrer" aria-label="Falar pelo WhatsApp">
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.2.6 4.4 1.7 6.3L3 29l7.3-1.9c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.7 12.7-12.6S23 3 16 3zm0 23.2c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-4.3 1.1 1.2-4.2-.3-.4a10.4 10.4 0 0 1-1.6-5.5C5.3 9.8 10.1 5.2 16 5.2S26.6 9.8 26.6 15.6 21.9 26.2 16 26.2zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.8 5 .8.4 1.4.6 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4z"
        />
      </svg>
    </a>
  )
}
