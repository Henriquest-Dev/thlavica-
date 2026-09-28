import { Link } from 'react-router-dom'
import { EmptyState } from '../components/States'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFound() {
  usePageMeta('Página não encontrada')
  return (
    <div className="page container page--narrow">
      <EmptyState title="Página não encontrada" text="O endereço pode estar incorreto ou a página foi removida.">
        <div className="state__actions">
          <Link className="btn btn--primary" to="/">
            Ir para o início
          </Link>
          <Link className="btn btn--outline" to="/catalogo">
            Ver catálogo
          </Link>
        </div>
      </EmptyState>
    </div>
  )
}
