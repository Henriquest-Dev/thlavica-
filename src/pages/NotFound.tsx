import { Link, useLocation } from 'react-router-dom'
import { useSeo } from '../lib/seo'

export default function NotFound() {
  const { pathname } = useLocation()
  useSeo({ title: 'Página não encontrada', path: pathname, noindex: true })
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
