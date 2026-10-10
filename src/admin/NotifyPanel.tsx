import { useEffect, useState } from 'react'
import { useContact } from '../data/site'
import {
  loadNotify,
  newTopic,
  notifyAvailable,
  parseEmails,
  saveNotify,
  sendEmailTest,
  sendTest,
  topicUrl,
  validateEmail,
  type NotifyConfig,
} from '../lib/notify'
import { useFeedback } from './feedback'
import { Field, Panel, Switch } from './ui'

const msg = (e: unknown) => (e instanceof Error ? e.message : 'Erro desconhecido.')

/** Avisos de novos pedidos: email (principal) e ntfy (opcional). Ver supabase/migrations/…_avisos_email.sql. */
export function NotifyPanel() {
  const { toast, confirm } = useFeedback()
  const contact = useContact()
  const [cfg, setCfg] = useState<NotifyConfig | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'missing' | 'error'>(notifyAvailable ? 'loading' : 'missing')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [para, setPara] = useState('')
  const [url, setUrl] = useState('')
  const [chave, setChave] = useState('')
  const [formErr, setFormErr] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    if (!notifyAvailable) return
    loadNotify()
      .then((c) => {
        setCfg(c)
        setPara(c?.email_para || contact.email)
        setUrl(c?.email_url ?? '')
        setChave(c?.email_chave ?? '')
        setToken(c?.ntfy_token ?? '')
        setState(c ? 'ok' : 'missing')
      })
      .catch((e) => {
        setError(msg(e))
        setState('error')
      })
    // só ao abrir a página
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (state !== 'missing' && state !== 'ok') return
    if (window.location.hash === '#avisos') document.getElementById('avisos')?.scrollIntoView({ block: 'start' })
  }, [state])

  const patch = async (p: Partial<NotifyConfig>, done?: string) => {
    if (!cfg) return false
    setBusy(true)
    try {
      await saveNotify(p)
      setCfg({ ...cfg, ...p })
      if (done) toast(done)
      return true
    } catch (e) {
      toast(msg(e), 'erro')
      return false
    } finally {
      setBusy(false)
    }
  }

  const saveEmail = async () => {
    const problem = validateEmail(para, url, chave)
    setFormErr(problem)
    if (problem) return false
    return patch({ email_para: parseEmails(para).ok.join(', '), email_url: url.trim(), email_chave: chave.trim() }, 'Definições do email guardadas.')
  }

  return (
    <div id="avisos">
      <Panel title="Avisos de novos pedidos por email">
        <div className="notify">
          {state === 'loading' && <p className="muted">A carregar…</p>}

          {state === 'missing' && (
            <p className="muted">
              {notifyAvailable
                ? 'Os avisos ainda não estão ativados na base de dados. Execute no Supabase o ficheiro supabase/migrations/20261012000000_avisos_email.sql e volte a abrir esta página.'
                : 'Os avisos precisam da ligação ao Supabase.'}
            </p>
          )}

          {state === 'error' && <p className="ferr">Não foi possível ler as definições: {error}</p>}

          {state === 'ok' && cfg && (
            <>
              <p className="notify__lead">
                Sempre que um cliente pedir uma cotação, a empresa recebe um email com o nome, o telefone e o pedido, e com a ligação para abrir o painel.
                Não é preciso instalar nada.
              </p>

              <Switch
                on={cfg.email_ativo}
                onChange={async (v) => {
                  if (v) {
                    const problem = validateEmail(para, url, chave)
                    setFormErr(problem)
                    if (problem) return toast('Preencha primeiro os dados abaixo.', 'erro')
                    if (await saveEmail()) await patch({ email_ativo: true }, 'Avisos por email ligados')
                  } else {
                    await patch({ email_ativo: false }, 'Avisos por email desligados')
                  }
                }}
                label={cfg.email_ativo ? 'Avisos por email ligados' : 'Avisos por email desligados'}
              />

              <div className="grid2">
                <Field label="Receber os avisos em" hint="Um ou mais emails, separados por vírgula." wide>
                  <input value={para} onChange={(e) => setPara(e.target.value)} inputMode="email" placeholder="empresa@exemplo.com" />
                </Field>
              </div>
              {formErr && <p className="ferr">{formErr}</p>}

              <details className="notify__adv" open={!cfg.email_url}>
                <summary>Ligação ao Google (configuração técnica, feita uma só vez por quem instalou o site)</summary>
                <div className="grid2">
                <Field label="Endereço do script do Google" hint="Dado pelo Google no passo 5 das instruções.">
                    <input value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" placeholder="https://script.google.com/macros/s/…/exec" spellCheck={false} />
                  </Field>
                  <Field label="Chave" hint="A mesma que está no script.">
                    <input type="password" value={chave} onChange={(e) => setChave(e.target.value)} autoComplete="off" spellCheck={false} />
                  </Field>
                </div>
              </details>

              <div className="row">
                <button type="button" className="btn" disabled={busy} onClick={() => void saveEmail()}>
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn btn--line"
                  disabled={busy}
                  onClick={async () => {
                    const problem = validateEmail(para, url, chave)
                    setFormErr(problem)
                    if (problem) return
                    setBusy(true)
                    try {
                      await sendEmailTest(url, chave, parseEmails(para).ok.join(','))
                      toast('Pedido de teste enviado. O email chega à caixa de entrada em cerca de um minuto (veja também o spam).')
                    } catch {
                      toast('Não foi possível contactar o Google. Confirme o endereço do script.', 'erro')
                    } finally {
                      setBusy(false)
                    }
                  }}
                >
                  Enviar email de teste
                </button>
              </div>

              <details className="notify__adv">
                <summary>Como ligar (feito uma só vez por quem instala o site)</summary>
                <ol className="notify__steps">
                  <li>Abra <b>script.google.com</b> com uma conta Google e carregue em <b>Novo projeto</b>.</li>
                  <li>Apague o que lá está e cole o conteúdo do ficheiro <b>supabase/apps-script/avisos.gs</b> (está no repositório do site).</li>
                  <li>Na linha <b>const CHAVE</b>, escolha uma palavra-passe comprida (por exemplo, 20 letras e números) e anote-a.</li>
                  <li>Carregue em <b>Implementar → Nova implementação → Tipo: Aplicação Web</b>. Em “Quem tem acesso”, escolha <b>Qualquer pessoa</b>. Autorize quando o Google pedir.</li>
                  <li>Copie o <b>endereço da aplicação Web</b> (termina em /exec) para o campo acima, cole a chave, ponha o email da empresa e carregue em <b>Guardar</b>.</li>
                  <li>Carregue em <b>Enviar email de teste</b> e depois ligue o interruptor.</li>
                </ol>
              </details>
            </>
          )}
        </div>
      </Panel>

      {state === 'ok' && cfg && (
        <Panel title="Opções técnicas">
          <details className="notify__adv">
            <summary>Avisos por app no telemóvel (ntfy)</summary>
            <div className="notify">
            <p className="notify__lead">
              Alternativa gratuita ao email: um aviso no telemóvel ou no computador através da app ntfy. Só é necessária se alguém quiser os avisos
              também por aí; a empresa não precisa disto.
            </p>
            <Switch on={cfg.ativo} onChange={(v) => patch({ ativo: v }, v ? 'ntfy ligado' : 'ntfy desligado')} label={cfg.ativo ? 'ntfy ligado' : 'ntfy desligado'} />
            <Field label="Tópico do ntfy (funciona como palavra-passe)" wide>
              <input readOnly value={cfg.ntfy_topic} onFocus={(e) => e.currentTarget.select()} />
            </Field>
            <div className="row">
              <a className="btn btn--line" href={topicUrl(cfg)} target="_blank" rel="noopener noreferrer">
                Abrir no navegador
              </a>
              <button
                type="button"
                className="btn btn--line"
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  try {
                    await sendTest(cfg)
                    toast('Aviso de teste enviado para o ntfy.')
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
                  if (await confirm({ title: 'Criar um tópico novo?', text: 'Os aparelhos subscritos deixam de receber avisos até subscreverem o novo nome.', confirmLabel: 'Criar novo' }))
                    void patch({ ntfy_topic: newTopic() }, 'Tópico novo criado.')
                }}
              >
                Criar tópico novo
              </button>
            </div>
            <details className="notify__adv">
              <summary>Token do ntfy (se o teste disser que o limite diário foi atingido)</summary>
              <div className="row">
                <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="tk_…" aria-label="Token do ntfy" autoComplete="off" spellCheck={false} />
                <button type="button" className="btn btn--line" disabled={busy} onClick={() => patch({ ntfy_token: token.trim() || null }, token.trim() ? 'Token guardado' : 'Token removido')}>
                  Guardar token
                </button>
              </div>
            </details>
            </div>
          </details>
        </Panel>
      )}
    </div>
  )
}
