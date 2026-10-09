import { useCallback } from 'react'
import { useStored, writeStored, uid } from './store'
import type { QuoteRequest } from '../data/admin'

export interface ListItem {
  id: string
  qtd: number
}
const EMPTY_LIST: ListItem[] = []
const EMPTY_QUOTES: QuoteRequest[] = []

/** Lista de cotação do visitante: produtos que quer incluir no pedido. */
export function useQuoteList() {
  const [items, setItems] = useStored<ListItem[]>('list', EMPTY_LIST)
  const add = useCallback(
    (id: string) => setItems((prev) => (prev.some((i) => i.id === id) ? prev : [...prev, { id, qtd: 1 }])),
    [setItems],
  )
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), [setItems])
  const setQty = useCallback(
    (id: string, qtd: number) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qtd: Math.max(1, Math.min(999, qtd || 1)) } : i))),
    [setItems],
  )
  const clear = useCallback(() => setItems([]), [setItems])
  return { items, add, remove, setQty, clear, has: (id: string) => items.some((i) => i.id === id) }
}

/** Guarda o pedido para o painel de administração (neste dispositivo, até ligar ao Supabase). */
export function saveQuoteRequest(q: Omit<QuoteRequest, 'id' | 'criadoEm' | 'estado'>): boolean {
  let all: QuoteRequest[] = EMPTY_QUOTES
  try {
    const raw = window.localStorage.getItem('tlh:quotes')
    if (raw) all = JSON.parse(raw) as QuoteRequest[]
  } catch {
    all = EMPTY_QUOTES
  }
  const next: QuoteRequest = { ...q, id: uid(), criadoEm: new Date().toISOString(), estado: 'nova' }
  return writeStored('quotes', [next, ...all])
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
