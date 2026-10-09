import { Ico } from '../components/Ico'
import { faqs } from '../data/site'

export function Faq() {
  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="wrap faq__grid">
        <div className="reveal">
          <p className="eyebrow eyebrow--dark">Dúvidas</p>
          <h2 id="faq-title" className="h2">
            Perguntas práticas
          </h2>
        </div>
        <div>
          {faqs.map((f) => (
            <details key={f.q} className="faq__item reveal">
              <summary>
                {f.q}
                <Ico name="mais" size={20} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
