import { Link } from 'react-router-dom'
import { useMeta } from '../lib/useMeta'

export default function NotFound() {
  useMeta('Página não encontrada')
  return (
    <div className="page wrap nf">
      <h1 className="ph__title">Página não encontrada</h1>
      <p className="ph__lead">O endereço pode estar errado ou a página foi retirada.</p>
      <Link to="/" className="pill pill--dark">
        Voltar ao início
      </Link>
    </div>
  )
}
