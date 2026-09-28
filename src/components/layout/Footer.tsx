import { Link } from 'react-router-dom'
import { site, telLink, whatsappLink } from '../../config/site'
import { categories } from '../../data/products'
import { Logo } from './Logo'

export function Footer() {
  const c = site.contactos
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo className="logo--light" />
          <p>Energia solar e soluções de água em Moçambique.</p>
          <a className="link-arrow link-arrow--light" href={site.redes.facebook} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </div>
        <nav aria-label="Catálogo">
          <h2 className="site-footer__title">Catálogo</h2>
          <ul>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link to={`/catalogo?categoria=${cat.id}`}>{cat.nome}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Empresa">
          <h2 className="site-footer__title">Empresa</h2>
          <ul>
            <li><Link to="/solucoes">Soluções</Link></li>
            <li><Link to="/projetos">Projetos e aplicações</Link></li>
            <li><Link to="/sobre">Sobre</Link></li>
            <li><Link to="/contacto?tipo=grosso">Compra a grosso</Link></li>
            <li><Link to="/contacto?tipo=fornecedor">Fornecedores</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="site-footer__title">Contacto</h2>
          <address>
            <ul>
              <li><a href={telLink(c.telefone)}>{c.telefone.valor}</a></li>
              <li><a href={telLink(c.telefoneAlternativo)}>{c.telefoneAlternativo.valor}</a></li>
              <li><a href={`mailto:${c.email.valor}`}>{c.email.valor}</a></li>
              <li><a href={whatsappLink('Olá Tlhavika, gostaria de mais informações.')} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li>{c.morada.valor}</li>
            </ul>
          </address>
        </div>
      </div>
      <div className="container site-footer__legal">
        <p>© {new Date().getFullYear()} {site.nome}. As marcas de equipamentos pertencem aos respetivos fabricantes.</p>
        <p>Preços, disponibilidade e especificações sujeitos a confirmação na cotação.</p>
      </div>
    </footer>
  )
}
