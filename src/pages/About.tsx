import { Link } from 'react-router-dom'
import { contact, solutions, wa } from '../data/site'
import { img } from '../lib/asset'
import { useReveal } from '../lib/useReveal'
import { useMeta } from '../lib/useMeta'
import { PageHead } from '../components/PageHead'
import { Arrow } from '../components/Arrow'
import { Ico } from '../components/Ico'

export default function About() {
  useMeta('Sobre')
  useReveal()
  return (
    <div className="page">
      <PageHead
        title="Sobre a Tlhavika"
        lead="Empresa moçambicana de energia solar e soluções de água, em Maputo. Fornece painéis, inversores, baterias, bombas de água e termoacumuladores solares."
      />
      <section className="wrap about">
        <figure className="about__photo reveal">
          <img src={img('foto-16')} alt="Técnico junto a um termoacumulador solar Tlhavika num telhado de telha" loading="lazy" width={900} height={900} />
        </figure>
        <div className="about__body">
          <section className="reveal" aria-labelledby="ab-areas">
            <h2 id="ab-areas" className="h3">
              O que fornecemos
            </h2>
            <ul className="about__list">
              {solutions.map((s) => (
                <li key={s.id}>
                  <Link to={`/solucoes/${s.id}`}>
                    <span>{s.name}</span>
                    <span className="muted">{s.short}</span>
                    <Arrow size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="reveal" aria-labelledby="ab-onde">
            <h2 id="ab-onde" className="h3">
              Onde estamos
            </h2>
            <ul className="about__contact">
              <li>
                <Ico name="local" size={20} /> {contact.address}
              </li>
              <li>
                <Ico name="telefone" size={20} /> <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
              </li>
              <li>
                <Ico name="correio" size={20} /> <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            </ul>
            <div className="about__cta">
              <Link to="/contacto" className="pill pill--dark">
                Pedir cotação
                <span className="pill__icon">
                  <Arrow size={12} />
                </span>
              </Link>
              <a className="pill pill--line-dark" href={wa('Olá Tlhavika, gostaria de mais informações.')} target="_blank" rel="noopener noreferrer">
                <Ico name="whatsapp" size={18} /> WhatsApp
              </a>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
