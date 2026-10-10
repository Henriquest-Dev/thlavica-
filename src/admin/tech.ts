import { useSearchParams } from 'react-router-dom'

/**
 * Modo técnico: mostra as definições que só interessam a quem instalou o site (ligação ao Google, ntfy, cópias de
 * dados). Abre-se uma vez com `?tecnico=1` no endereço e fica ligado até fechar o separador. A empresa nunca o vê.
 */
export function useTech(): boolean {
  const [params] = useSearchParams()
  try {
    if (params.get('tecnico') === '1') window.sessionStorage.setItem('tlh:tech', '1')
    return window.sessionStorage.getItem('tlh:tech') === '1'
  } catch {
    return params.get('tecnico') === '1'
  }
}
