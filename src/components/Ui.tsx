import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface UiState {
  searchOpen: boolean
  listOpen: boolean
  loginOpen: boolean
  openSearch: () => void
  closeSearch: () => void
  openList: () => void
  closeList: () => void
  openLogin: () => void
  closeLogin: () => void
  toast: (text: string, action?: { label: string; run: () => void }) => void
}

const Ctx = createContext<UiState | null>(null)

export function useUi() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useUi fora do UiProvider')
  return v
}

interface ToastData {
  text: string
  action?: { label: string; run: () => void }
}

/** Estado partilhado: pesquisa rápida, lista de cotação e avisos curtos. */
export function UiProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearch] = useState(false)
  const [listOpen, setList] = useState(false)
  const [loginOpen, setLogin] = useState(false)
  const [toastData, setToast] = useState<ToastData | null>(null)
  const timer = useRef<number>(0)

  const toast = useCallback((text: string, action?: ToastData['action']) => {
    setToast({ text, action })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 4200)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearch(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const value = useMemo<UiState>(
    () => ({
      searchOpen,
      listOpen,
      loginOpen,
      openSearch: () => setSearch(true),
      closeSearch: () => setSearch(false),
      openList: () => setList(true),
      closeList: () => setList(false),
      openLogin: () => setLogin(true),
      closeLogin: () => setLogin(false),
      toast,
    }),
    [searchOpen, listOpen, loginOpen, toast],
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toast" role="status" aria-live="polite">
        {toastData && (
          <div className="toast__box" key={toastData.text}>
            <span>{toastData.text}</span>
            {toastData.action && (
              <button
                type="button"
                onClick={() => {
                  toastData.action?.run()
                  setToast(null)
                }}
              >
                {toastData.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </Ctx.Provider>
  )
}

/** Ligação que aceita rota interna ("/produtos") ou endereço externo. */
export function SmartLink({ to, children, className, onClick }: { to: string; children: ReactNode; className?: string; onClick?: () => void }) {
  if (/^https?:\/\//.test(to))
    return (
      <a href={to} className={className} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {children}
      </a>
    )
  return (
    <Link to={/^\/(?!\/)/.test(to) ? to : `/${to.replace(/^\/+/, '')}`} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
