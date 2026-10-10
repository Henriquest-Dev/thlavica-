import { useEffect, useRef } from 'react'
import { useStored } from '../lib/store'
import type { QuoteRequest } from '../data/admin'
import { useFeedback } from './feedback'

const NONE: QuoteRequest[] = []

/**
 * Com o painel aberto: mostra um aviso quando chega um pedido novo e põe o número no título do separador,
 * "(2) Administração". Os avisos com o painel fechado vêm do ntfy (ver NotifyPanel).
 */
export function QuoteWatcher() {
  const [quotes] = useStored<QuoteRequest[]>('quotes', NONE)
  const { toast } = useFeedback()
  const fresh = quotes.filter((q) => q.estado === 'nova' && !q.arquivada).length
  const prev = useRef<number | null>(null)

  useEffect(() => {
    if (prev.current !== null && fresh > prev.current) toast(fresh - prev.current === 1 ? 'Chegou um pedido de cotação novo.' : `Chegaram ${fresh - prev.current} pedidos de cotação novos.`)
    prev.current = fresh
  }, [fresh, toast])

  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, '')
    document.title = fresh > 0 ? `(${fresh}) ${base}` : base
    return () => {
      document.title = document.title.replace(/^\(\d+\)\s*/, '')
    }
  }, [fresh])

  return null
}
