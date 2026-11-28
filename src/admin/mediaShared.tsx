import { useCatalog } from '../lib/catalog'
import { useCategories } from '../lib/categories'
import { CAROUSEL_SECONDS, saveCarouselSettings, useCarouselSettings } from '../lib/promos'
import { solutions } from '../data/site'
import { useFeedback } from './feedback'
import { Choice, Panel, Switch } from './ui'

/** "Ao tocar, abre": uma página do site, à escolha (ou nada). */
export function LinkSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const catalog = useCatalog()
  const categories = useCategories()
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Não abre nada</option>
      <optgroup label="Páginas">
        <option value="/produtos">Todos os produtos</option>
        <option value="/contacto">Pedir cotação</option>
        <option value="/servicos">Serviços</option>
        <option value="/sobre">Sobre nós</option>
        {solutions.map((x) => (
          <option key={x.id} value={`/solucoes/${x.id}`}>
            {x.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="Categorias">
        {categories.map((c) => (
          <option key={c.id} value={`/categoria/${c.id}`}>
            {c.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="Produtos">
        {catalog.map((c) => (
          <option key={c.id} value={`/produtos/${c.id}`}>
            {c.name}
          </option>
        ))}
      </optgroup>
    </select>
  )
}

/** Rotação automática, segundos em cada imagem e se o cartaz de origem continua no cartaz principal. */
export function CarouselSettingsPanel() {
  const conf = useCarouselSettings()
  const { toast } = useFeedback()
  const save = (patch: Partial<typeof conf>) => {
    if (!saveCarouselSettings({ ...conf, ...patch })) toast('Não foi possível guardar.', 'erro')
  }
  return (
    <Panel title="Como passa o carrossel">
      <div className="cconf">
        <Switch on={conf.auto} label="Passar sozinho de uma imagem para a seguinte" onChange={(v) => save({ auto: v })} />
        <div className="f">
          <span className="f__l">Tempo em cada fotografia</span>
          <div className="choices">
            {CAROUSEL_SECONDS.map((n) => (
              <Choice key={n} on={conf.segundos === n} disabled={!conf.auto} onClick={() => save({ segundos: n })}>
                {n} segundos
              </Choice>
            ))}
          </div>
        </div>
        <Switch on={conf.cartazOrigem} label="No cartaz principal, mostrar também o cartaz de origem da Tlhavika" onChange={(v) => save({ cartazOrigem: v })} />
        <p className="muted small">Os vídeos não passam a meio: o carrossel espera que acabem.</p>
      </div>
    </Panel>
  )
}
