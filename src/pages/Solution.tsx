import { Link, useParams } from 'react-router-dom'
import { categories, solutions, wa } from '../data/site'
import { products as models } from '../data/products'
import { img } from '../lib/asset'
import { useReveal } from '../lib/useReveal'
import { useMeta } from '../lib/useMeta'
import { PageHead } from '../components/PageHead'
import { Arrow } from '../components/Arrow'
import NotFound from './NotFound'

export default function Solution() {
  const { id } = useParams()
  const s = solutions.find((x) => x.id === id)
  useMeta(s?.name ?? 'Página não encontrada', s?.lead)
  useReveal(id)
  if (!s) return <NotFound />
  const cats = categories.filter((c) => s.categories.includes(c.id))
  const photo = s.image.startsWith('foto')
  const others = solutions.filter((x) => x.id !== s.id)

  return (
    <div className="page">
      <PageHead kicker={`${s.n} · Solução`} title={s.name} lead={s.lead} />

      <figure className={`sol__figure wrap reveal${photo ? ' sol__figure--photo' : ''}`}>
        <img src={img(s.image, photo ? undefined : 1672)} alt={s.imageAlt} />
        <figcaption>{s.imageNote}</figcaption>
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
                <Link to={`/produtos?categoria=${c.id}`}>
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
