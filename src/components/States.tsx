import type { ReactNode } from 'react'

export function Loading({ label = 'A carregar…' }: { label?: string }) {
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="state state--empty">
      <h2 className="state__title">{title}</h2>
      {text && <p>{text}</p>}
      {children}
    </div>
  )
}

export function ErrorState({ title, text, onRetry }: { title: string; text?: string; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <h2 className="state__title">{title}</h2>
      {text && <p>{text}</p>}
      {onRetry && (
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}
