/**
 * Envio de formulários. O destino é explícito e configurado por variáveis de ambiente:
 *
 *  VITE_FORM_MODE=netlify   → Netlify Forms (os formulários estáticos equivalentes estão em index.html).
 *  VITE_FORM_MODE=endpoint  → POST JSON para VITE_FORM_ENDPOINT (Formspree, Getform, API própria…).
 *  vazio                    → envio desativado.
 *
 * Só se devolve sucesso quando o servidor responde 2xx. Nunca se simula um envio.
 */

export type SubmitResult = { ok: true } | { ok: false; reason: 'not-configured' | 'network' | 'server'; status?: number }

const MODE = (import.meta.env.VITE_FORM_MODE as string | undefined)?.trim() || ''
const ENDPOINT = (import.meta.env.VITE_FORM_ENDPOINT as string | undefined)?.trim() || ''

export function formsConfigured(): boolean {
  if (MODE === 'netlify') return !import.meta.env.DEV
  if (MODE === 'endpoint') return Boolean(ENDPOINT)
  return false
}

export async function submitForm(formName: string, data: Record<string, string>): Promise<SubmitResult> {
  if (!formsConfigured()) return { ok: false, reason: 'not-configured' }
  try {
    let res: Response
    if (MODE === 'netlify') {
      const body = new URLSearchParams({ 'form-name': formName, ...data })
      res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
    } else {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _form: formName, ...data }),
      })
    }
    return res.ok ? { ok: true } : { ok: false, reason: 'server', status: res.status }
  } catch {
    return { ok: false, reason: 'network' }
  }
}
