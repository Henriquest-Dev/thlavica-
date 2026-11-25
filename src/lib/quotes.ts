import { useCallback } from 'react'
import { useStored, updateStored, uid } from './store'
import { remoteEnabled } from './supabase'
import { submitQuote } from './sync'
import type { QuoteRequest } from '../data/admin'
import { lineKey, type Picks } from './variants'

export interface ListItem {
  id: string
  qtd: number
  /** O que o cliente escolheu (ex.: { Cor: 'Preto' }). Cada combinação é uma linha da lista. */
  opcoes?: Picks
}

export const itemKey = (i: ListItem) => lineKey(i.id, i.opcoes)
const EMPTY_LIST: ListItem[] = []
const EMPTY_QUOTES: QuoteRequest[] = []

/** Lista de cotação do visitante: produtos que quer incluir no pedido. */
export function useQuoteList() {
  const [items, setItems] = useStored<ListItem[]>('list', EMPTY_LIST)
  /** Junta à lista. Se a mesma combinação já lá está, soma a quantidade. */
  const add = useCallback(
    (id: string, opcoes?: Picks, qtd = 1) =>
      setItems((prev) => {
        const key = lineKey(id, opcoes)
        const n = Math.max(1, Math.min(9999, Math.round(qtd) || 1))
        return prev.some((i) => itemKey(i) === key)
          ? prev.map((i) => (itemKey(i) === key ? { ...i, qtd: Math.min(9999, i.qtd + n) } : i))
          : [...prev, { id, qtd: n, ...(opcoes && Object.keys(opcoes).length ? { opcoes } : {}) }]
      }),
    [setItems],
  )
  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => itemKey(i) !== key)), [setItems])
  const setQty = useCallback(
    (key: string, qtd: number) => setItems((prev) => prev.map((i) => (itemKey(i) === key ? { ...i, qtd: Math.max(1, Math.min(9999, Math.round(qtd) || 1)) } : i))),
    [setItems],
  )
  const clear = useCallback(() => setItems([]), [setItems])
  return { items, add, remove, setQty, clear, has: (id: string) => items.some((i) => i.id === id) }
}

/** Guarda o pedido para o painel de administração (neste dispositivo, até ligar ao Supabase). */
export function saveQuoteRequest(q: Omit<QuoteRequest, 'id' | 'criadoEm' | 'estado'>): boolean {
  const next: QuoteRequest = { ...q, id: uid(), criadoEm: new Date().toISOString(), estado: 'nova' }
  if (remoteEnabled) {
    // vai para o Supabase (ou para a caixa de saída, se não houver rede)
    void submitQuote(next)
    return true
  }
  return updateStored<QuoteRequest[]>('quotes', EMPTY_QUOTES, (all) => [next, ...all])
}

/** Texto pré-preenchido para o formulário de contacto (vindo dos simuladores). */
const PREFILL = 'tlh:prefill'
export function setPrefill(text: string) {
  try {
    window.sessionStorage.setItem(PREFILL, text)
  } catch {
    /* ignorar */
  }
}
export function takePrefill(): string {
  try {
    const v = window.sessionStorage.getItem(PREFILL) ?? ''
    window.sessionStorage.removeItem(PREFILL)
    return v
  } catch {
    return ''
  }
}
