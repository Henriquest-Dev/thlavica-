import type { ReactNode } from 'react'

export function PageHead({ kicker, title, lead, children }: { kicker: string; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="ph wrap">
      <p className="ph__kicker reveal">{kicker}</p>
      <h1 className="ph__title reveal">{title}</h1>
      {lead && <p className="ph__lead reveal">{lead}</p>}
      {children}
    </header>
  )
}
