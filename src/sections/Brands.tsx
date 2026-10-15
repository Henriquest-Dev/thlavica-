import { asset } from '../lib/asset'

/** Logótipos das marcas com que a Tlhavika trabalha (ficheiros em public/img/marcas, com fundo transparente). */
const BRANDS = [
  { id: 'sungrow', name: 'Sungrow', w: 282, h: 46 },
  { id: 'growatt', name: 'Growatt', w: 291, h: 63 },
  { id: 'luxpower', name: 'LuxPower', w: 296, h: 69 },
  { id: 'dyness', name: 'Dyness', w: 242, h: 60 },
  { id: 'deye', name: 'Deye', w: 155, h: 67 },
  { id: 'trinasolar', name: 'Trina Solar', w: 225, h: 63 },
  { id: 'jasolar', name: 'JA Solar', w: 213, h: 49 },
  { id: 'canadiansolar', name: 'Canadian Solar', w: 289, h: 57 },
  { id: 'invt', name: 'INVT', w: 124, h: 63 },
  { id: 'must', name: 'MUST', w: 163, h: 59 },
  { id: 'veichi', name: 'Veichi', w: 182, h: 47 },
]

export function Brands() {
  const row = [...BRANDS, ...BRANDS]
  return (
    <section className="brands" aria-label="Marcas">
      <p className="brands__label wrap">Marcas com que trabalhamos</p>
      <div className="brands__marquee" aria-hidden="true">
        <div className="brands__row">
          {[...row, ...row].map((b, i) => (
            <img key={i} src={asset(`img/marcas/${b.id}.webp`)} alt="" width={b.w} height={b.h} loading="lazy" decoding="async" />
          ))}
        </div>
      </div>
      <p className="visually-hidden">{BRANDS.map((b) => b.name).join(', ')}</p>
    </section>
  )
}
