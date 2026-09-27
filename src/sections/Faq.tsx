import { faqs } from '../data/site'

export function Faq() {
  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="wrap faq__grid">
        <h2 id="faq-title" className="h2 reveal">
          Perguntas <em>práticas</em>
        </h2>
        <div>
          {faqs.map((f) => (
            <details key={f.q} className="faq__item reveal">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
