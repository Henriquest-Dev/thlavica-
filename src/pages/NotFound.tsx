import { Link } from 'react-router-dom'
import { useMeta } from '../lib/useMeta'

export default function NotFound() {
  useMeta('Página não encontrada')
  return (
    <div className="page wrap nf">
      <p className="ph__kicker">404</p>
      <h1 className="ph__title">Página não encontrada</h1>
      <Link to="/" className="pill pill--dark">
        Voltar ao início
      </Link>
    </div>
  )
}
