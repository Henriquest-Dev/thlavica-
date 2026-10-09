import { useEffect, useRef, useState } from 'react'
import { checkCredentials } from '../lib/adminSession'

/**
 * Formulário de entrada do painel, usado no ecrã do /admin e na janela aberta pelo rodapé.
 * `onSuccess` corre depois de as credenciais serem aceites.
 */
export function AdminLoginForm({ onSuccess, autoFocus = true }: { onSuccess: () => void; autoFocus?: boolean }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [fails, setFails] = useState(0)
  const first = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) first.current?.focus()
  }, [autoFocus])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    // pequeno atraso, que cresce a cada falha, para tornar a tentativa em massa mais lenta
    window.setTimeout(() => {
      if (checkCredentials(user, pass)) {
        onSuccess()
        return
      }
      setFails((n) => n + 1)
      setPass('')
      setError('Utilizador ou palavra-passe incorretos.')
      setBusy(false)
    }, 350 + fails * 600)
  }

  return (
    <form className="lform" onSubmit={submit}>
      <label>
        Utilizador
        <input ref={first} value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} />
      </label>
      <label>
        Palavra-passe
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
      </label>
      {error && (
        <p className="lform__err" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="pill pill--dark" disabled={busy || !user || !pass}>
        {busy ? 'A verificar…' : 'Entrar'}
      </button>
    </form>
  )
}
