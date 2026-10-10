import { useEffect, useRef, type ReactNode } from 'react'
import { Ico } from '../components/Ico'

export function Panel({ title, action, children, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <header className="panel__head">
          {title && <h2>{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function PageTitle({ title, lead, action, keepLead }: { title: string; lead?: string; action?: ReactNode; keepLead?: boolean }) {
  return (
    <header className={`ptitle${keepLead ? ' ptitle--lead' : ''}`}>
      <div>
        <h1>{title}</h1>
        {lead && <p className="muted">{lead}</p>}
      </div>
      {action}
    </header>
  )
}

export function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`f${wide ? ' f--wide' : ''}`}>
      <span className="f__l">{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    document.documentElement.classList.add('menu-open')
    return () => {
      window.removeEventListener('keydown', esc)
      document.documentElement.classList.remove('menu-open')
      prev?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="amodal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`amodal__box${wide ? ' amodal__box--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar">
            <Ico name="fechar" size={18} />
          </button>
        </header>
        <div className="amodal__body">{children}</div>
      </div>
    </div>
  )
}

/** Interruptor com texto: mostra claramente se está ligado. */
export function Switch({ on, onChange, label, hideLabel }: { on: boolean; onChange: (v: boolean) => void; label: string; hideLabel?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={`switch${on ? ' is-on' : ''}`} onClick={() => onChange(!on)}>
      <span className="switch__track" aria-hidden="true">
        <span className="switch__thumb" />
      </span>
      <span className={hideLabel ? 'visually-hidden' : 'switch__label'}>{label}</span>
    </button>
  )
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="aempty">
      <p>
        <strong>{title}</strong>
      </p>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  )
}

export const dateFmt = (iso: string) =>
  new Date(iso).toLocaleString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export { money } from '../lib/proposal'

/** Botão de escolha (substitui os campos de texto): um toque seleciona. */
export function Choice({ on, onClick, children, disabled }: { on: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" role="radio" aria-checked={on} className="choice" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

