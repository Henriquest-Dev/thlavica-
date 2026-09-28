import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { categories } from '../data/products'
import { usePageMeta } from '../hooks/usePageMeta'

export default function About() {
  usePageMeta('Sobre', 'A Tlhavika é uma empresa moçambicana de soluções de energia solar e água, com sede em Maputo.')
  return (
    <div className="page">
      <header className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Localização">
            <Link to="/">Início</Link> <span aria-hidden="true">/</span> <span aria-current="page">Sobre</span>
          </nav>
          <h1 className="page-title">Sobre a Tlhavika</h1>
          <p className="page-lede">Soluções de energia solar e água em Moçambique.</p>
        </div>
      </header>
      <div className="container prose">
        <p>
          A Tlhavika é uma empresa moçambicana dedicada a soluções de energia solar e bombas de água. Reunimos num só
          lugar os equipamentos para captar, armazenar e utilizar energia solar e para levar água do furo à torneira.
        </p>
        <h2>O que fornecemos</h2>
        <ul className="ticks">
          {categories.map((c) => (
            <li key={c.id}>
              <Link to={`/catalogo?categoria=${c.id}`}>{c.nome}</Link> — {c.resumo}
            </li>
          ))}
        </ul>
        <h2>Marcas</h2>
        <p>
          Trabalhamos com equipamentos de vários fabricantes, como Dongyin, Astronergy e JA Solar. As marcas pertencem
          aos respetivos fabricantes.
        </p>
        <h2>Onde estamos</h2>
        <p>{site.contactos.morada.valor}</p>
        <div className="prose__cta">
          <Link className="btn btn--primary" to="/contacto">
            Contactar
          </Link>
          <Link className="btn btn--outline" to="/catalogo">
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}
