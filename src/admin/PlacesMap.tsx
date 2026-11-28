import { Ico } from '../components/Ico'

/**
 * Mapa das páginas do site, em blocos: mostra onde uma fotografia ou vídeo pode aparecer
 * (blocos a tracejado, que se escolhem com um toque) e onde não pode (blocos cinzentos).
 */

type Block = { label: string; place?: string; tall?: boolean; note?: string }
type Page = { title: string; blocks: Block[] }

const PAGES: Page[] = [
  {
    title: 'Página inicial',
    blocks: [
      { label: 'Menu do site' },
      { label: 'Cartaz principal', place: 'cartaz', tall: true, note: 'Só fotografias' },
      { label: 'Topo da página', place: 'topo' },
      { label: 'Texto, marcas e áreas' },
      { label: 'Produtos em destaque' },
      { label: 'O nosso trabalho', place: 'inicio' },
      { label: 'Perguntas e rodapé' },
    ],
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
  video,
  prodsOn,
  catsOn,
  onProds,
  onCats,
}: {
  value: string[]
  onToggle: (place: string) => void
  /** É um vídeo: o cartaz principal não o aceita. */
  video?: boolean
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
            <div className="pmap__frame">
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
                const blocked = video && b.place === 'cartaz'
                return (
                  <button
                    key={i}
                    type="button"
                    className={`pmap__b pmap__b--free${on ? ' is-on' : ''}${b.tall ? ' is-tall' : ''}${blocked ? ' is-blocked' : ''}`}
                    aria-pressed={on}
                    disabled={blocked && !on}
                    onClick={() => (b.place === '@produtos' ? onProds() : b.place === '@categorias' ? onCats() : onToggle(b.place!))}
                    title={blocked ? 'O cartaz principal só aceita fotografias' : undefined}
                  >
                    {on && <Ico name="visto" size={14} />}
                    <span>{b.label}</span>
                    {(b.note || blocked) && <small>{blocked ? 'Só fotografias' : b.note}</small>}
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
