import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Crumb = { to: string; label: string };

/** Cabeçalho das páginas interiores, com o caminho de navegação por cima do título. */
export function PageHead({
  trail = [],
  title,
  lead,
  children,
}: {
  trail?: Crumb[];
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="ph wrap">
      {trail.length > 0 && (
        <nav className="crumbs reveal" aria-label="Localização">
          <Link to="/">Início</Link>
          {trail.map((c) => (
            <span key={c.to}>
              <span aria-hidden="true">/</span>
              <Link to={c.to}>{c.label}</Link>
            </span>
          ))}
        </nav>
      )}
      <h1 className="ph__title reveal">{title}</h1>
      {lead && <p className="ph__lead reveal">{lead}</p>}
      {children}
    </header>
  );
}
