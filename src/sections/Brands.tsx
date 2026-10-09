/** Marcas que aparecem no cartaz da Tlhavika (texto, sem usar logótipos de terceiros). */
const BRANDS = ['Dongyin', 'Growatt', 'LuxPower', 'Sungrow', 'Veichi', 'JA Solar', 'Deye', 'Dyness', 'Hanchu ESS', 'Canadian Solar', 'Astronergy']

export function Brands() {
  const row = [...BRANDS, ...BRANDS]
  return (
    <section className="brands" aria-label="Marcas">
      <p className="brands__label wrap">Marcas com que trabalhamos</p>
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
