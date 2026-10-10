import { getClient, remoteEnabled } from './supabase'

/**
 * Avisos de novos pedidos de cotação, com o ntfy (gratuito).
 * Quem envia é a base de dados (trigger em supabase/migrations/…_notificacoes.sql); este módulo só deixa
 * o administrador ver o tópico, ligar/desligar e mandar um aviso de teste. O tópico funciona como palavra-passe:
 * vive numa tabela que só administradores leem e nunca vai no código do site.
 */

export interface NotifyConfig {
  ativo: boolean
  ntfy_server: string
  ntfy_topic: string
  ntfy_token: string | null
  admin_url: string
  icon_url: string
  email_ativo: boolean
  email_url: string | null
  email_chave: string | null
  email_para: string | null
}

export const notifyAvailable = remoteEnabled

const COLUMNS = 'ativo,ntfy_server,ntfy_topic,ntfy_token,admin_url,icon_url,email_ativo,email_url,email_chave,email_para'

export async function loadNotify(): Promise<NotifyConfig | null> {
  const c = await getClient()
  if (!c) return null
  const { data, error } = await c.from('notify_config').select(COLUMNS).eq('id', 1).maybeSingle()
  // PGRST205: a tabela ainda não existe (migração por executar) → o painel explica o que fazer
  if (error?.code === 'PGRST205') return null
  if (error) throw new Error(error.message)
  return (data as NotifyConfig | null) ?? null
}

export async function saveNotify(patch: Partial<NotifyConfig>): Promise<void> {
  const c = await getClient()
  if (!c) throw new Error('Sem ligação ao Supabase.')
  const { error } = await c.from('notify_config').update(patch).eq('id', 1)
  if (error) throw new Error(error.message)
}

/** Tópico novo e impossível de adivinhar (128 bits). */
export function newTopic(): string {
  const b = crypto.getRandomValues(new Uint8Array(16))
  return `tlhavika-${[...b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

/** Endereço do tópico no ntfy: abre a versão web e serve para subscrever. */
export const topicUrl = (c: Pick<NotifyConfig, 'ntfy_server' | 'ntfy_topic'>) => `${c.ntfy_server.replace(/\/$/, '')}/${c.ntfy_topic}`

/** Corpo do aviso (o mesmo formato que a base de dados usa). */
export function noticeBody(c: Pick<NotifyConfig, 'ntfy_topic' | 'admin_url' | 'icon_url'>, title: string, message: string) {
  return { topic: c.ntfy_topic, title, message, priority: 4, tags: ['bell'], click: c.admin_url, icon: c.icon_url }
}

/** Envia um aviso de teste a partir do navegador, para confirmar que o telemóvel/computador o recebe. */
export async function sendTest(c: NotifyConfig): Promise<void> {
  const r = await fetch(c.ntfy_server, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(c.ntfy_token ? { Authorization: `Bearer ${c.ntfy_token}` } : {}) },
    body: JSON.stringify(noticeBody(c, 'Tlhavika: aviso de teste', 'Se vê isto, os avisos de novos pedidos estão a funcionar.')),
  })
  if (r.status === 429) throw new Error('O ntfy atingiu o limite diário deste endereço. Crie uma conta gratuita em ntfy.sh e cole o token em "Avançado".')
  if (!r.ok) throw new Error(`O ntfy recusou o aviso (${r.status}).`)
}

/* ---------------------------------------------------------------- email (Google Apps Script) */

const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const SCRIPT_URL = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/

/** Lista de emails separados por vírgula ou espaço; devolve só os válidos (máximo 5) e os que falharam. */
export function parseEmails(text: string): { ok: string[]; bad: string[] } {
  const all = text.split(/[\s,;]+/).filter(Boolean)
  return { ok: all.filter((e) => MAIL.test(e)).slice(0, 5), bad: all.filter((e) => !MAIL.test(e)) }
}

/** Mensagem de erro para os campos do email, ou '' se estiver tudo certo para ligar. */
export function validateEmail(para: string, url: string, chave: string): string {
  const { ok, bad } = parseEmails(para)
  if (!ok.length) return 'Indique pelo menos um email que vai receber os avisos.'
  if (bad.length) return `Email inválido: ${bad[0]}`
  if (!SCRIPT_URL.test(url.trim())) return 'O endereço do script tem de ser o que o Google dá no fim: https://script.google.com/macros/s/…/exec'
  if (chave.trim().length < 12) return 'A chave deve ter pelo menos 12 caracteres (a mesma que pôs no script).'
  return ''
}

/**
 * Pede ao script do Google que envie um email de teste. O navegador não consegue ler a resposta do Google
 * (é de outro site), por isso só se sabe que o pedido saiu: o resultado vê-se na caixa de entrada.
 */
export async function sendEmailTest(url: string, chave: string, para: string): Promise<void> {
  await fetch(url.trim(), {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ chave: chave.trim(), para, assunto: 'Tlhavika: email de teste', texto: 'Se recebeu este email, os avisos de novos pedidos de cotação estão a funcionar.' }),
  })
}
