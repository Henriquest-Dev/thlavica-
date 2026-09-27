import { Link } from 'react-router-dom'
import { categories, models } from '../data/site'

export function Categories() {
  return (
    <section className="cat" aria-labelledby="cat-title">
      <div className="wrap">
        <div className="cat__head reveal">
          <h2 id="cat-title" className="h2">
            Produtos por <em>categoria</em>
          </h2>
          <p>Preço, disponibilidade e ficha técnica confirmados em cada cotação.</p>
        </div>
        <ul className="cat__grid">
          {categories.map((c, i) => {
            const n = models.filter((m) => m.category === c.id).length
            return (
              <li key={c.id} className="reveal" style={{ '--d': `${(i % 4) * 60}ms` } as React.CSSProperties}>
                <Link to={`/produtos?categoria=${c.id}`} className="cat__item">
                  <span className="cat__name">{c.name}</span>
                  <span className="cat__text">{c.text}</span>
                  <span className="cat__count">{n ? `${n} ${n === 1 ? 'modelo anunciado' : 'modelos anunciados'}` : 'Sob consulta'}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
