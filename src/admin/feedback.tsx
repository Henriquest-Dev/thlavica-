import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Ico } from '../components/Ico'

interface ConfirmOptions {
  title: string
  text?: string
  confirmLabel?: string
  /** Ação destrutiva: botão vermelho. */
  danger?: boolean
}

interface Feedback {
  /** Aviso curto e discreto ("Produto guardado"). */
  toast: (text: string, kind?: 'ok' | 'erro') => void
  /** Pede confirmação com uma janela do painel (não a do navegador). */
  confirm: (o: ConfirmOptions) => Promise<boolean>
}

const Ctx = createContext<Feedback | null>(null)

export function useFeedback() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFeedback fora do FeedbackProvider')
  return v
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ text: string; kind: 'ok' | 'erro'; id: number } | null>(null)
  const [ask, setAsk] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null)
  const timer = useRef(0)
  const yes = useRef<HTMLButtonElement>(null)

  const show = useCallback((text: string, kind: 'ok' | 'erro' = 'ok') => {
    setToast({ text, kind, id: Date.now() })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), kind === 'erro' ? 6000 : 3200)
  }, [])

  const confirm = useCallback((o: ConfirmOptions) => new Promise<boolean>((resolve) => setAsk({ ...o, resolve })), [])

  const answer = (ok: boolean) => {
    ask?.resolve(ok)
    setAsk(null)
  }

  useEffect(() => {
    if (!ask) return
    yes.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && answer(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask])

  const value = useMemo(() => ({ toast: show, confirm }), [show, confirm])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="atoast" role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`atoast__box atoast__box--${toast.kind}`}>
            <Ico name={toast.kind === 'ok' ? 'visto' : 'fechar'} size={18} />
            <span>{toast.text}</span>
          </div>
        )}
      </div>
      {ask && (
        <div className="amodal amodal--center" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && answer(false)}>
          <div className="adialog" role="alertdialog" aria-modal="true" aria-labelledby="adlg-t">
            <h2 id="adlg-t">{ask.title}</h2>
            {ask.text && <p>{ask.text}</p>}
            <div className="adialog__act">
              <button type="button" className="btn btn--line" onClick={() => answer(false)}>
                Cancelar
              </button>
              <button ref={yes} type="button" className={`btn${ask.danger ? ' btn--solid-danger' : ''}`} onClick={() => answer(true)}>
                {ask.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
