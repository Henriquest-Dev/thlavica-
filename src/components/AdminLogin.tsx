import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUi } from './Ui'
import { AdminLoginForm } from './AdminLoginForm'
import { Logo } from './Logo'
import { Ico } from './Ico'

/** Entrada do painel: abre ao carregar no ano (© 2026) do rodapé. */
export function AdminLogin() {
  const { loginOpen, closeLogin } = useUi()
  const nav = useNavigate()

  useEffect(() => {
    if (!loginOpen) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && closeLogin()
    window.addEventListener('keydown', esc)
    document.documentElement.classList.add('menu-open')
    return () => {
      window.removeEventListener('keydown', esc)
      document.documentElement.classList.remove('menu-open')
    }
  }, [loginOpen, closeLogin])

  if (!loginOpen) return null
  return (
    <div className="ov ov--center" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && closeLogin()}>
      <div className="alogin" role="dialog" aria-modal="true" aria-labelledby="alogin-title">
        <button type="button" className="popup__close" onClick={closeLogin} aria-label="Fechar">
          <Ico name="fechar" size={18} />
        </button>
        <Logo className="logo--dark" />
        <h2 id="alogin-title">Administração</h2>
        <p className="muted">Entre para gerir o catálogo, as cotações, as promoções e os vídeos.</p>
        <AdminLoginForm
          onSuccess={() => {
            closeLogin()
            nav('/admin')
          }}
        />
      </div>
    </div>
  )
}
