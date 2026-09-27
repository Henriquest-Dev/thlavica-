import { useRef } from 'react'
import { useProgress } from '../lib/useProgress'
import { SolutionIcon } from '../components/Icon'
import { solutions } from '../data/site'

const TEXT =
  'Da energia para a casa à água para a machamba: a Tlhavika fornece equipamento solar e bombas de água, e ajuda a escolher o que serve o seu consumo.'

/** Declaração que acende palavra a palavra (referência Maya). */
export function Intro() {
  const ref = useRef<HTMLElement>(null)
  useProgress(ref)
  const words = TEXT.split(' ')
  return (
    <section ref={ref} className="intro" aria-label="Sobre a Tlhavika">
      <div className="intro__sticky">
        <p className="intro__text" style={{ '--n': words.length } as React.CSSProperties}>
          {words.map((w, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties}>
              {w}{' '}
            </span>
          ))}
        </p>
        <ul className="intro__pillars">
          {solutions.map((s, i) => (
            <li key={s.id} style={{ '--k': i } as React.CSSProperties}>
              <span className="intro__icon">
                <SolutionIcon name={s.icon} size={20} />
              </span>
              <span>
                <strong>{s.name}</strong>
                <br />
                {s.short}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
