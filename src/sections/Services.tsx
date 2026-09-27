import { Link } from 'react-router-dom'
import { img } from '../lib/asset'
import { solutions } from '../data/site'

/** Lista de soluções em linhas, com imagem que se abre ao entrar (referência Maya, "With our services"). */
export function Services() {
  return (
    <section className="svc" aria-labelledby="svc-title">
      <div className="wrap">
        <h2 id="svc-title" className="svc__title reveal">
          O que <em>fornecemos</em>
        </h2>
        <ol className="svc__list">
          {solutions.map((s) => (
            <li key={s.id} className="svc__row reveal">
              <span className="svc__n">{s.n}</span>
              <h3 className="svc__name">
                <Link to={`/solucoes/${s.id}`}>{s.name}</Link>
              </h3>
              <ul className="svc__items">
                {s.includes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <Link to={`/solucoes/${s.id}`} className="svc__img" tabIndex={-1} aria-hidden="true">
                <img src={img(s.image, s.image.startsWith('foto') ? undefined : 960)} alt="" loading="lazy" />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
