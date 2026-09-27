const BRANDS = ['Dongyin', 'Astronergy', 'JA Solar', 'Hanchus', 'Zjlmet']

/** Marcas dos produtos do catálogo (texto, sem usar logótipos de terceiros). */
export function Brands() {
  const row = [...BRANDS, ...BRANDS, ...BRANDS]
  return (
    <section className="brands" aria-label="Marcas no catálogo">
      <p className="brands__label wrap">Marcas no catálogo</p>
      <div className="brands__marquee" aria-hidden="true">
        <div className="brands__row">
          {[...row, ...row].map((b, i) => (
            <span key={i}>{b}</span>
          ))}
        </div>
      </div>
      <p className="visually-hidden">{BRANDS.join(', ')}</p>
    </section>
  )
}
