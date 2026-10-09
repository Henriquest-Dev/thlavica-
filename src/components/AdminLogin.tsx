import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../lib/adminSession'
import { useUi } from './Ui'
import { Logo } from './Logo'
import { Ico } from './Ico'

/** Entrada do painel: abre ao carregar no ano (© 2026) do rodapé. */
export function AdminLogin() {
  const { loginOpen, closeLogin } = useUi()
  const nav = useNavigate()
  const first = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loginOpen) return
    first.current?.focus()
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
      <form
        className="alogin"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alogin-title"
        onSubmit={(e) => {
          e.preventDefault()
          signIn()
          closeLogin()
          nav('/admin')
        }}
      >
        <button type="button" className="popup__close" onClick={closeLogin} aria-label="Fechar">
          <Ico name="fechar" size={18} />
        </button>
        <Logo className="logo--dark" />
        <h2 id="alogin-title">Administração</h2>
        <p className="muted">Entre para gerir o catálogo, as cotações, as promoções e os vídeos.</p>
        <label>
          Email
          <input ref={first} type="email" autoComplete="username" placeholder="nome@empresa.co.mz" />
        </label>
        <label>
          Palavra-passe
          <input type="password" autoComplete="current-password" />
        </label>
        <button type="submit" className="pill pill--dark">
          Entrar
        </button>
        <p className="alogin__note">Protótipo: ainda não há contas nem proteção real. Os dados ficam só neste dispositivo.</p>
      </form>
    </div>
  )
}
