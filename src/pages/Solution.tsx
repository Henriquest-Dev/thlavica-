import { Link, useParams } from 'react-router-dom'
import { categories, solutions, wa } from '../data/site'
import { useCatalog } from '../lib/catalog'
import { img } from '../lib/asset'
import { useReveal } from '../lib/useReveal'
import { breadcrumbSchema, useSeo } from '../lib/seo'
import { PageHead } from '../components/PageHead'
import { Arrow } from '../components/Arrow'
import NotFound from './NotFound'

export default function Solution() {
  const { id } = useParams()
  const models = useCatalog()
  const s = solutions.find((x) => x.id === id)
  useSeo({
    title: s ? `${s.name} em Moçambique` : 'Página não encontrada',
    description: s ? `${s.lead.split('. ')[0].replace(/\.$/, '')}. Peça cotação à Tlhavika.` : undefined,
    path: `/solucoes/${id}`,
    image: s ? `img/${s.image}.webp` : undefined,
    noindex: !s,
    jsonLd: s ? [breadcrumbSchema([{ name: 'Início', path: '/' }, { name: 'Serviços', path: '/servicos' }, { name: s.name, path: `/solucoes/${s.id}` }])] : [],
  })
  useReveal(id)
  if (!s) return <NotFound />
  const cats = categories.filter((c) => s.categories.includes(c.id))
  const others = solutions.filter((x) => x.id !== s.id)

  return (
    <div className="page">
      <PageHead back={{ to: '/servicos', label: 'Serviços' }} title={s.name} lead={s.lead} />

      <figure className="sol__figure wrap reveal">
        <img src={img(s.image)} alt={s.imageAlt} />
      </figure>

      <section className="wrap sol__grid">
        <div className="reveal">
          <h2 className="sol__h">Equipamento</h2>
          <ul className="sol__list">
            {s.includes.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="reveal">
          <h2 className="sol__h">Onde se usa</h2>
          <ul className="sol__list">
            {s.uses.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="reveal sol__ask">
          <h2 className="sol__h">Para preparar a cotação, diga-nos</h2>
          <ol>
            {s.askUs.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
          <div className="sol__ctas">
            <Link to={`/contacto?solucao=${s.id}`} className="pill pill--dark">
              Pedir cotação
              <span className="pill__icon">
                <Arrow size={12} />
              </span>
            </Link>
            <a className="pill pill--line-dark" href={wa(`Olá Tlhavika, gostaria de uma cotação: ${s.name}.`)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="wrap sol__cats">
        <h2 className="h2 reveal">Categorias</h2>
        <ul>
          {cats.map((c) => {
            const n = models.filter((m) => m.category === c.id).length
            return (
              <li key={c.id} className="reveal">
                <Link to={`/categoria/${c.id}`}>
                  <span>{c.name}</span>
                  <span className="muted">{n ? `${n} ${n === 1 ? 'produto' : 'produtos'}` : 'Sob consulta'}</span>
                  <Arrow />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <nav className="wrap sol__next" aria-label="Outras soluções">
        {others.map((o) => (
          <Link key={o.id} to={`/solucoes/${o.id}`} className="reveal">
            <span className="muted">{o.n}</span>
            <span className="sol__next-name">{o.name}</span>
            <Arrow size={18} />
          </Link>
        ))}
      </nav>
    </div>
  )
}
