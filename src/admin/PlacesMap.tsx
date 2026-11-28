import { Ico } from '../components/Ico'
import { MEDIA_PLACES, SIZE_CARROSSEL, placeAccepts } from '../lib/promos'

/**
 * Mapa das páginas do site, em blocos: mostra onde uma fotografia ou vídeo pode aparecer
 * (blocos a tracejado, que se escolhem com um toque) e onde não pode (blocos cinzentos).
 */

type Block = { label: string; place?: string; tall?: boolean; note?: string }
type Page = { title: string; blocks: Block[]; popup?: boolean }

const PAGES: Page[] = [
  {
    title: 'Página inicial',
    blocks: [
      { label: 'Menu do site' },
      { label: 'Cartaz principal', place: 'cartaz', tall: true },
      { label: 'Solar · Bombas · Água quente' },
      { label: 'Título e botões' },
      { label: 'Topo da página', place: 'topo' },
      { label: 'Texto, marcas e soluções' },
      { label: 'Antes dos destaques', place: 'destaques' },
      { label: 'Produtos em destaque', tall: true },
      { label: 'O nosso trabalho', place: 'inicio' },
      { label: 'Simuladores, perguntas e rodapé' },
    ],
  },
  {
    title: 'Pop-up (por cima do site)',
    popup: true,
    blocks: [{ label: 'Pop-up', place: 'popup', tall: true }],
  },
  {
    title: 'Lista de produtos',
    blocks: [
      { label: 'Menu do site' },
      { label: 'Título' },
      { label: 'Início da lista', place: 'produtos' },
      { label: 'Cartões dos produtos', tall: true },
      { label: 'Rodapé' },
    ],
  },
  {
    title: 'Página de uma categoria',
    blocks: [
      { label: 'Menu do site' },
      { label: 'Título' },
      { label: 'Início da categoria', place: '@categorias', note: 'Escolha as categorias' },
      { label: 'Cartões dos produtos', tall: true },
      { label: 'Rodapé' },
    ],
  },
  {
    title: 'Página de um produto',
    blocks: [
      { label: 'Menu do site' },
      { label: 'Fotografia, preço e botões', tall: true },
      { label: 'Ficha técnica' },
      { label: 'Fotografias e vídeos do produto', place: '@produtos', note: 'Escolha os produtos' },
      { label: 'Rodapé' },
    ],
  },
  {
    title: 'Serviços',
    blocks: [{ label: 'Menu do site' }, { label: 'Título' }, { label: 'Início da página', place: 'servicos' }, { label: 'Texto da página', tall: true }, { label: 'Rodapé' }],
  },
  {
    title: 'Sobre nós',
    blocks: [{ label: 'Menu do site' }, { label: 'Título' }, { label: 'Início da página', place: 'sobre' }, { label: 'Texto da página', tall: true }, { label: 'Rodapé' }],
  },
  {
    title: 'Pedir cotação',
    blocks: [{ label: 'Menu do site' }, { label: 'Título' }, { label: 'Início da página', place: 'contacto' }, { label: 'Formulário', tall: true }, { label: 'Rodapé' }],
  },
]

export function PlacesMap({
  value,
  onToggle,
  kind,
  prodsOn,
  catsOn,
  onProds,
  onCats,
}: {
  value: string[]
  onToggle: (place: string) => void
  /** Tipo do item: o cartaz e o pop-up não aceitam vídeos do YouTube. */
  kind?: string
  prodsOn: boolean
  catsOn: boolean
  onProds: () => void
  onCats: () => void
}) {
  return (
    <div className="pmap">
      <ul className="pmap__legend" aria-hidden="true">
        <li>
          <span className="pmap__key pmap__key--free" /> Pode aparecer aqui (toque para escolher)
        </li>
        <li>
          <span className="pmap__key pmap__key--on" /> Escolhido
        </li>
        <li>
          <span className="pmap__key pmap__key--no" /> Não pode aparecer
        </li>
      </ul>
      <div className="pmap__pages">
        {PAGES.map((pg) => (
          <figure key={pg.title} className="pmap__page">
            <figcaption>{pg.title}</figcaption>
            <div className={`pmap__frame${pg.popup ? ' pmap__frame--popup' : ''}`}>
              {pg.popup && <div className="pmap__ghost" aria-hidden="true" />}
              {pg.blocks.map((b, i) => {
                if (!b.place) {
                  return (
                    <div key={i} className={`pmap__b pmap__b--no${b.tall ? ' is-tall' : ''}`} title="Aqui não aparecem fotografias nem vídeos do carrossel">
                      {b.label}
                    </div>
                  )
                }
                const special = b.place.startsWith('@')
                const on = b.place === '@produtos' ? prodsOn : b.place === '@categorias' ? catsOn : value.includes(b.place)
                const blocked = !special && !placeAccepts(b.place, kind)
                const size = special ? SIZE_CARROSSEL : MEDIA_PLACES.find((x) => x.id === b.place)?.size
                return (
                  <button
                    key={i}
                    type="button"
                    className={`pmap__b pmap__b--free${on ? ' is-on' : ''}${b.tall ? ' is-tall' : ''}${blocked ? ' is-blocked' : ''}`}
                    aria-pressed={on}
                    disabled={blocked && !on}
                    onClick={() => (b.place === '@produtos' ? onProds() : b.place === '@categorias' ? onCats() : onToggle(b.place!))}
                    title={blocked ? 'Aqui não aceita vídeos do YouTube' : undefined}
                  >
                    {on && <Ico name="visto" size={14} />}
                    <span>{b.label}</span>
                    {(b.note || blocked) && <small>{blocked ? 'Sem YouTube' : b.note}</small>}
                    {size && <small className="pmap__size">{size}</small>}
                    {special && on && <small>(escolha em baixo)</small>}
                  </button>
                )
              })}
            </div>
          </figure>
        ))}
      </div>
    </div>
  )
}
