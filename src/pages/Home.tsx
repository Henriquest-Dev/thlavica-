import { Link } from 'react-router-dom'
import { Hero } from '../components/hero/Hero'
import { EnergyStory } from '../components/story/EnergyStory'
import { PumpStory } from '../components/story/PumpStory'
import { ProductCard } from '../components/product/ProductCard'
import { categories, products } from '../data/products'
import { site, whatsappLink } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { CategoryIcon } from '../components/CategoryIcon'
import { SEGMENTS } from '../data/segments'

const FEATURED = [
  'astronergy-astron7-625w',
  'dongyin-4sds-1500w',
  'dongyin-pkm80-dsk1',
  'termoacumulador-hibrido-200l',
  'dongyin-3sdm2-15',
  'hanchus-ess-3-5kw',
]

const SOCIAL = [
  { src: 'foto-16', alt: 'Termoacumulador solar instalado sobre um telhado de telha' },
  { src: 'foto-15', alt: 'Termoacumulador solar numa cobertura plana' },
  { src: 'foto-17', alt: 'Termoacumulador solar com tubos de vácuo' },
  { src: 'foto-34', alt: 'Vista aérea de uma torre com depósitos de água e painéis solares' },
]

export default function Home() {
  usePageMeta('', site.descricao)
  const featured = FEATURED.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products

  return (
    <>
      <Hero />
      <EnergyStory />
      <PumpStory />

      <section className="section" aria-labelledby="cat-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Catálogo</p>
            <h2 id="cat-title" className="section-title">Tudo o que um sistema de energia e água precisa</h2>
            <Link className="link-arrow" to="/catalogo">
              Ver catálogo completo
            </Link>
          </div>
          <ul className="category-grid">
            {categories.map((c) => {
              const count = products.filter((p) => p.categoria === c.id).length
              return (
                <li key={c.id}>
                  <Link className="category-tile" to={`/catalogo?categoria=${c.id}`}>
                    <CategoryIcon id={c.id} />
                    <span className="category-tile__name">{c.nome}</span>
                    <span className="category-tile__text">{c.resumo}</span>
                    <span className="category-tile__count">{count > 0 ? `${count} ${count === 1 ? 'produto' : 'produtos'}` : 'Sob consulta'}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Em destaque</p>
            <h2 id="featured-title" className="section-title">Equipamentos apresentados pela Tlhavika</h2>
            <p className="section-lede">Disponibilidade e preço confirmados em cada cotação.</p>
          </div>
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="seg-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Para quem</p>
            <h2 id="seg-title" className="section-title">Um percurso para cada tipo de cliente</h2>
          </div>
          <ul className="segment-grid">
            {SEGMENTS.map((s) => (
              <li key={s.id} className={`segment-card segment-card--${s.tone}`}>
                <h3>{s.titulo}</h3>
                <p>{s.resumo}</p>
                <div className="segment-card__links">
                  <Link className="btn btn--sm btn--primary" to={s.cta.to}>
                    {s.cta.label}
                  </Link>
                  <Link className="link-arrow" to={`/solucoes#${s.id}`}>
                    Saber mais
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--dark" aria-labelledby="social-title">
        <div className="container social">
          <div className="social__text">
            <p className="eyebrow eyebrow--light">No terreno</p>
            <h2 id="social-title" className="section-title">Acompanhe o trabalho da Tlhavika</h2>
            <p>
              Termoacumuladores, depósitos elevados e painéis solares, fotografados pela Tlhavika no terreno.
            </p>
            <div className="social__links">
              <a className="btn btn--light" href={site.redes.facebook} target="_blank" rel="noopener noreferrer">
                Ver no Facebook
              </a>
              <Link className="link-arrow link-arrow--light" to="/projetos">
                Projetos e aplicações
              </Link>
            </div>
          </div>
          <ul className="social__grid">
            {SOCIAL.map((s) => (
              <li key={s.src}>
                <img
                  src={`${import.meta.env.BASE_URL}img/fotos/${s.src}.webp`}
                  width={900}
                  height={900}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section cta-band" aria-labelledby="cta-title">
        <div className="container cta-band__inner">
          <div>
            <h2 id="cta-title" className="section-title">Diga-nos o que precisa</h2>
            <p>Envie o seu pedido com o local, o uso e o prazo. Preparamos uma cotação para o seu caso.</p>
          </div>
          <div className="cta-band__actions">
            <Link className="btn btn--primary btn--lg" to="/contacto?tipo=cotacao">
              Pedir cotação
            </Link>
            <a className="btn btn--whatsapp btn--lg" href={whatsappLink('Olá Tlhavika, gostaria de uma cotação.')} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
