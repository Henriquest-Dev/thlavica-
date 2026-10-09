import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { solutions, useContact, wa } from '../data/site'
import { useUi } from './Ui'

export function Footer() {
  const { openLogin } = useUi()
  const contact = useContact()
  return (
    <footer className="ft">
      <div className="wrap ft__grid">
        <div>
          <Logo className="ft__mark" />
          <p className="ft__lead">Energia solar e soluções de água em Moçambique.</p>
        </div>
        <nav aria-label="Soluções">
          <p className="ft__h">Soluções</p>
          {solutions.map((s) => (
            <Link key={s.id} to={`/solucoes/${s.id}`}>
              {s.name}
            </Link>
          ))}
        </nav>
        <nav aria-label="Empresa">
          <p className="ft__h">Tlhavika</p>
          <Link to="/produtos">Catálogo</Link>
          <Link to="/servicos">Serviços</Link>
          <Link to="/aplicacoes">Aplicações</Link>
          <Link to="/sobre">Sobre</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>
        <div>
          <p className="ft__h">Contacto</p>
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
          <a href={wa('Olá Tlhavika, gostaria de mais informações.')} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={contact.facebook} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </div>
      </div>
      <div className="wrap ft__legal">
        <p>
          <button type="button" className="ft__year" onClick={openLogin} aria-label="Entrar na administração">
            © {new Date().getFullYear()}
          </button>{' '}
          Tlhavika
        </p>
        <p>As marcas de equipamentos pertencem aos respetivos fabricantes. Preços e disponibilidade na cotação.</p>
      </div>
    </footer>
  )
}
