import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { finalPrice, priceLabel } from '../lib/pricing'
import { money } from '../lib/proposal'
import { useQuoteList } from '../lib/quotes'
import { isMeters, missingOption, picksLabel, type Picks } from '../lib/variants'
import type { CatalogProduct } from '../lib/catalog'
import { Ico } from './Ico'
import { useUi } from './Ui'

const METROS = [5, 10, 20, 50, 100]

/**
 * Escolhas do cliente na página do produto: opções (cor…) e, se for vendido ao metro, quantos metros.
 * Só deixa pedir ou juntar à lista depois de escolher tudo, e diz o que falta.
 */
export function BuyOptions({ p }: { p: CatalogProduct }) {
  const nav = useNavigate()
  const { add } = useQuoteList()
  const { toast, openList } = useUi()
  const metros = isMeters(p)
  const initial = (): Picks => Object.fromEntries((p.options ?? []).filter((g) => g.values.length === 1).map((g) => [g.name, g.values[0]]))
  const [picks, setPicks] = useState<Picks>(initial)
  const [qtd, setQtd] = useState(metros ? 10 : 1)
  const [err, setErr] = useState('')
  useEffect(() => {
    setPicks(initial())
    setQtd(metros ? 10 : 1)
    setErr('')
    // só ao mudar de produto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id])

  const n = Math.max(1, Math.min(9999, Math.round(qtd) || 1))
  const unit = finalPrice(p)
  const label = picksLabel(picks)

  const check = (): boolean => {
    const falta = missingOption(p, picks)
    if (falta) {
      setErr(`Escolha uma opção em “${falta}” para continuar.`)
      return false
    }
    setErr('')
    return true
  }

  return (
    <div className="buy">
      {(p.options ?? []).map((g) => (
        <fieldset key={g.name} className="buy__grp">
          <legend>{g.name}</legend>
          <div className="buy__opts" role="radiogroup" aria-label={g.name}>
            {g.values.map((v) => (
              <button key={v} type="button" role="radio" aria-checked={picks[g.name] === v} className={`opt${picks[g.name] === v ? ' is-on' : ''}`} onClick={() => { setPicks({ ...picks, [g.name]: v }); setErr('') }}>
                {v}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="buy__grp">
        <span className="buy__l">{metros ? 'Quantos metros?' : 'Quantidade'}</span>
        <div className="buy__qty">
          <div className="qty" role="group" aria-label={metros ? 'Metros' : 'Quantidade'}>
            <button type="button" onClick={() => setQtd(n - 1)} aria-label="Menos" disabled={n <= 1}>
              <Ico name="menos" size={14} />
            </button>
            <input type="number" min={1} max={9999} inputMode="numeric" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} onBlur={() => setQtd(n)} aria-label={metros ? 'Metros' : 'Quantidade'} />
            <button type="button" onClick={() => setQtd(n + 1)} aria-label="Mais">
              <Ico name="mais" size={14} />
            </button>
          </div>
          {metros && <span className="buy__m">metros</span>}
        </div>
        {metros && (
          <div className="buy__quick" aria-label="Atalhos">
            {METROS.map((m) => (
              <button key={m} type="button" className={`opt opt--sm${n === m ? ' is-on' : ''}`} onClick={() => setQtd(m)}>
                {m} m
              </button>
            ))}
          </div>
        )}
        {unit !== undefined && (
          <p className="buy__sum" aria-live="polite">
            {metros ? `${n} m × ${priceLabel(unit)} = ` : n > 1 ? `${n} × ${priceLabel(unit)} = ` : ''}
            <strong>{money(unit * n)}</strong>
          </p>
        )}
      </div>

      {err && (
        <p className="ferr" role="alert">
          {err}
        </p>
      )}
      <div className="pdp__ctas">
        <button
          type="button"
          className="pill pill--dark"
          onClick={() => {
            if (!check()) return
            const q = new URLSearchParams({ produto: p.id, qtd: String(n) })
            if (label) q.set('opcoes', label)
            nav(`/contacto?${q.toString()}`)
          }}
        >
          Pedir cotação
        </button>
        <button
          type="button"
          className="addlist addlist--lg"
          onClick={() => {
            if (!check()) return
            add(p.id, picks, n)
            toast('Adicionado à lista de cotação', { label: 'Ver lista', run: openList })
          }}
        >
          <Ico name="mais" size={16} />
          <span>Adicionar à cotação</span>
        </button>
      </div>
    </div>
  )
}
