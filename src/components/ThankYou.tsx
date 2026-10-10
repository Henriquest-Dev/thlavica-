import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { img } from '../lib/asset'
import { Ico } from './Ico'

/**
 * Agradecimento depois de enviar um pedido de cotação. Diz ao cliente o que acontece a seguir
 * (a Tlhavika contacta-o pelo WhatsApp), sem o mandar para fora do site.
 */
export function ThankYou({ nome, telefone, onClose }: { nome: string; telefone: string; onClose: () => void }) {
  const first = nome.trim().split(/\s+/)[0] || ''
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    btn.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    const html = document.documentElement
    html.classList.add('menu-open')
    return () => {
      window.removeEventListener('keydown', esc)
      html.classList.remove('menu-open')
    }
  }, [onClose])

  return (
    <div className="ov ov--center" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="popup thanks" role="dialog" aria-modal="true" aria-labelledby="thanks-title">
        <button type="button" className="popup__close" onClick={onClose} aria-label="Fechar">
          <Ico name="fechar" size={18} />
        </button>
        <div className="thanks__photo">
          <img src={img('foto-17')} alt="" />
          <span className="thanks__tick" aria-hidden="true">
            <Ico name="visto" size={26} />
          </span>
        </div>
        <div className="thanks__body">
          <h2 id="thanks-title">{first ? `Obrigado, ${first}!` : 'Obrigado!'}</h2>
          <p className="thanks__lead">O seu pedido de cotação já está com a nossa equipa.</p>
          <p>
            Vamos analisar o que precisa e falar consigo pelo <strong>WhatsApp</strong>
            {telefone ? (
              <>
                , no número <strong>{telefone}</strong>
              </>
            ) : null}
            , com uma proposta pensada para si. Energia do sol e água onde precisa: é isso que queremos levar até si.
          </p>
          <div className="thanks__actions">
            <button ref={btn} type="button" className="pill pill--dark" onClick={onClose}>
              Voltar ao site
            </button>
            <Link to="/produtos" className="pill pill--line-dark" onClick={onClose}>
              Ver o catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
