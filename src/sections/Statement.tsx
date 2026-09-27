import { useRef } from 'react'
import { useProgress } from '../lib/useProgress'
import { categories } from '../data/site'

const TEXT =
  'A Tlhavika fornece equipamento solar e de água para casas, comércio e machambas. Energia para o dia e para a noite, água do furo à torneira, água quente com o calor do sol.'

/** Parágrafo que acende palavra a palavra com o scroll (referência Maya). */
export function Statement() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  const words = TEXT.split(' ')
  return (
    <section ref={ref} className="stm" aria-label="Sobre a Tlhavika">
      <div className="stm__sticky">
        <p className="stm__text" style={{ '--n': words.length } as React.CSSProperties}>
          {words.map((w, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties}>
              {w}{' '}
            </span>
          ))}
        </p>
        <ul className="stm__row" aria-label="Categorias">
          {categories.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
