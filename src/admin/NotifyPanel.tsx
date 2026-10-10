import { useEffect, useState } from 'react'
import { loadNotify, newTopic, notifyAvailable, saveNotify, sendTest, topicUrl, type NotifyConfig } from '../lib/notify'
import { useFeedback } from './feedback'
import { Field, Panel, Switch } from './ui'

const msg = (e: unknown) => (e instanceof Error ? e.message : 'Erro desconhecido.')

/** Avisos de novos pedidos no telemóvel e no computador (ver supabase/migrations/…_notificacoes.sql). */
export function NotifyPanel() {
  const { toast, confirm } = useFeedback()
  const [cfg, setCfg] = useState<NotifyConfig | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'missing' | 'error'>(notifyAvailable ? 'loading' : 'missing')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [token, setToken] = useState('')

  useEffect(() => {
    if (!notifyAvailable) return
    loadNotify()
      .then((c) => {
        setCfg(c)
        setToken(c?.ntfy_token ?? '')
        setState(c ? 'ok' : 'missing')
      })
      .catch((e) => {
        setError(msg(e))
        setState('error')
      })
  }, [])

  useEffect(() => {
    if (state !== 'missing' && state !== 'ok') return
    if (window.location.hash === '#avisos') document.getElementById('avisos')?.scrollIntoView({ block: 'start' })
  }, [state])

  const patch = async (p: Partial<NotifyConfig>, done?: string) => {
    if (!cfg) return
    setBusy(true)
    try {
      await saveNotify(p)
      setCfg({ ...cfg, ...p })
      if (done) toast(done)
    } catch (e) {
      toast(msg(e), 'erro')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel title="Avisos de novos pedidos">
      <div id="avisos" className="notify">
        {state === 'loading' && <p className="muted">A carregar…</p>}

        {state === 'missing' && (
          <p className="muted">
            {notifyAvailable
              ? 'Os avisos ainda não estão ativados na base de dados. Execute no Supabase o ficheiro supabase/migrations/20261011000000_notificacoes.sql e volte a abrir esta página.'
              : 'Os avisos precisam da ligação ao Supabase.'}
          </p>
        )}

        {state === 'error' && <p className="ferr">Não foi possível ler as definições: {error}</p>}

        {state === 'ok' && cfg && (
          <>
            <p className="notify__lead">
              Sempre que um cliente enviar um pedido de cotação, recebe um aviso no telemóvel ou no computador, mesmo com o painel fechado. Usa o
              ntfy, que é gratuito e não precisa de conta.
            </p>

            <div className="notify__row">
              <Switch on={cfg.ativo} onChange={(v) => patch({ ativo: v }, v ? 'Avisos ligados' : 'Avisos desligados')} label={cfg.ativo ? 'Avisos ligados' : 'Avisos desligados'} />
            </div>

            <ol className="notify__steps">
              <li>
                <strong>Telemóvel (Android ou iPhone):</strong> instale a app <b>ntfy</b> (Google Play ou App Store), toque em <b>+</b> e escreva o nome do
                tópico abaixo. Aceite as notificações.
              </li>
              <li>
                <strong>Computador:</strong> abra a ligação abaixo no Chrome ou no Edge, carregue em <b>Subscribe</b> e aceite as notificações. Em
                “Instalar”, na barra do navegador, fica como uma app.
              </li>
              <li>
                Carregue em <b>Enviar aviso de teste</b> e confirme que chega a todos os aparelhos.
              </li>
            </ol>

            <Field label="Nome do tópico (é a chave dos avisos: não o partilhe)" wide>
              <input readOnly value={cfg.ntfy_topic} onFocus={(e) => e.currentTarget.select()} />
            </Field>

            <div className="row">
              <a className="btn btn--line" href={topicUrl(cfg)} target="_blank" rel="noopener noreferrer">
                Abrir no navegador
              </a>
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  try {
                    await sendTest(cfg)
                    toast('Aviso de teste enviado. Veja o telemóvel e o computador.')
                  } catch (e) {
                    toast(msg(e), 'erro')
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Enviar aviso de teste
              </button>
              <button
                type="button"
                className="btn btn--line"
                disabled={busy}
                onClick={async () => {
                  if (await confirm({ title: 'Criar um tópico novo?', text: 'Os aparelhos subscritos deixam de receber avisos até subscreverem o novo nome. Use isto se suspeitar que alguém descobriu o tópico.', confirmLabel: 'Criar novo' }))
                    void patch({ ntfy_topic: newTopic() }, 'Tópico novo criado. Subscreva-o nos aparelhos.')
                }}
              >
                Criar tópico novo
              </button>
            </div>

            <details className="notify__adv">
              <summary>Avançado: token do ntfy</summary>
              <p className="muted">
                Se o teste disser que o limite diário foi atingido, crie uma conta gratuita em ntfy.sh, gere um token em Account → Access tokens e cole-o aqui.
                O limite passa a ser da sua conta e não do endereço partilhado do servidor.
              </p>
              <div className="row">
                <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="tk_…" aria-label="Token do ntfy" autoComplete="off" spellCheck={false} />
                <button type="button" className="btn btn--line" disabled={busy} onClick={() => patch({ ntfy_token: token.trim() || null }, token.trim() ? 'Token guardado' : 'Token removido')}>
                  Guardar token
                </button>
              </div>
            </details>
          </>
        )}
      </div>
    </Panel>
  )
}
