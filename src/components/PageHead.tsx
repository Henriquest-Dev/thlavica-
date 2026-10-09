import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Ico } from './Ico'

/** Cabeçalho das páginas interiores: o título diz onde está; o "voltar" só aparece onde há um nível acima. */
export function PageHead({ back, title, lead, children }: { back?: { to: string; label: string }; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="ph wrap">
      {back && (
        <Link to={back.to} className="ph__back reveal">
          <Ico name="esquerda" size={16} /> {back.label}
        </Link>
      )}
      <h1 className="ph__title reveal">{title}</h1>
      {lead && <p className="ph__lead reveal">{lead}</p>}
      {children}
    </header>
  )
}
