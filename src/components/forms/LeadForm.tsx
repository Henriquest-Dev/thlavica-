import { useMemo, useRef, useState } from 'react'
import { FORMS, type FieldDef, type FormKind } from './formDefs'
import { submitForm, type SubmitResult } from '../../lib/submit'
import { site, whatsappLink } from '../../config/site'

interface Props {
  kind: FormKind
  initial?: Record<string, string>
}

type Status = { state: 'idle' } | { state: 'sending' } | { state: 'done' } | { state: 'error'; result: SubmitResult }

const MIN_FILL_MS = 3000

function summary(kind: FormKind, values: Record<string, string>) {
  const def = FORMS[kind]
  const lines = def.campos
    .filter((c) => values[c.name])
    .map((c) => {
      const v = values[c.name]
      const opt = c.options?.find((o) => o.value === v)
      return `${c.label}: ${opt ? opt.label : v}`
    })
  return `${def.titulo} — site Tlhavika\n\n${lines.join('\n')}`
}

export function LeadForm({ kind, initial = {} }: Props) {
  const def = FORMS[kind]
  const startedAt = useRef(Date.now())
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<Record<string, string>>(() => ({ ...initial }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState(false)
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const idp = `f-${kind}`

  const validateField = (f: FieldDef, v: string): string | null => {
    const val = v.trim()
    if (f.required && !val) return 'Campo obrigatório.'
    if (val && f.validate) return f.validate(val)
    if (!val && f.validate && !f.required) return f.validate('')
    return null
  }

  const onChange = (name: string, v: string) => {
    setValues((s) => ({ ...s, [name]: v }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const onBlur = (f: FieldDef) => {
    const err = validateField(f, values[f.name] ?? '')
    setErrors((e) => ({ ...e, [f.name]: err ?? '' }))
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const honeypot = (form.elements.namedItem('bot-field') as HTMLInputElement | null)?.value
    const next: Record<string, string> = {}
    for (const f of def.campos) {
      const err = validateField(f, values[f.name] ?? '')
      if (err) next[f.name] = err
    }
    setErrors(next)
    setConsentError(!consent)
    const firstInvalid = def.campos.find((f) => next[f.name])
    if (firstInvalid || !consent) {
      const id = firstInvalid ? `${idp}-${firstInvalid.name}` : `${idp}-consent`
      document.getElementById(id)?.focus()
      return
    }
    // Anti-spam: honeypot preenchido ou envio instantâneo → ignora em silêncio aparente.
    if (honeypot || Date.now() - startedAt.current < MIN_FILL_MS) {
      setStatus({ state: 'error', result: { ok: false, reason: 'server' } })
      return
    }
    setStatus({ state: 'sending' })
    const payload: Record<string, string> = { consentimento: 'sim' }
    for (const f of def.campos) if (values[f.name]) payload[f.name] = values[f.name].trim()
    const result = await submitForm(kind, payload)
    setStatus(result.ok ? { state: 'done' } : { state: 'error', result })
    if (result.ok) formRef.current?.scrollIntoView({ block: 'center' })
  }

  const waText = useMemo(() => summary(kind, values), [kind, values])

  if (status.state === 'done') {
    return (
      <div className="form-result form-result--ok" role="status" tabIndex={-1} ref={(el) => el?.focus()}>
        <h3>Pedido enviado</h3>
        <p>Recebemos o seu pedido. A equipa da Tlhavika entrará em contacto pelo telefone ou email indicados.</p>
        <button type="button" className="btn btn--outline" onClick={() => { setValues({}); setConsent(false); setStatus({ state: 'idle' }); startedAt.current = Date.now() }}>
          Enviar outro pedido
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} className="lead-form" name={kind} method="POST" noValidate onSubmit={onSubmit} aria-describedby={`${idp}-desc`}>
      <p id={`${idp}-desc`} className="lead-form__desc">
        {def.resumo} <span className="req-note">Campos com * são obrigatórios.</span>
      </p>
      <input type="hidden" name="form-name" value={kind} />
      <p className="visually-hidden" aria-hidden="true">
        <label>
          Não preencher: <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <div className="lead-form__grid">
        {def.campos.map((f) => {
          const id = `${idp}-${f.name}`
          const err = errors[f.name]
          const common = {
            id,
            name: f.name,
            value: values[f.name] ?? '',
            required: f.required,
            'aria-invalid': err ? true : undefined,
            'aria-describedby': err ? `${id}-err` : f.hint ? `${id}-hint` : undefined,
            onBlur: () => onBlur(f),
          }
          return (
            <div key={f.name} className={`field${f.wide ? ' field--wide' : ''}${err ? ' has-error' : ''}`}>
              <label htmlFor={id}>
                {f.label}
                {f.required && <span aria-hidden="true"> *</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea {...common} rows={4} placeholder={f.placeholder} onChange={(e) => onChange(f.name, e.target.value)} />
              ) : f.type === 'select' ? (
                <select {...common} onChange={(e) => onChange(f.name, e.target.value)}>
                  <option value="">Selecione…</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...common}
                  type={f.type ?? 'text'}
                  placeholder={f.placeholder}
                  autoComplete={f.autoComplete}
                  min={f.type === 'number' ? 1 : undefined}
                  inputMode={f.type === 'tel' ? 'tel' : f.type === 'number' ? 'numeric' : undefined}
                  onChange={(e) => onChange(f.name, e.target.value)}
                />
              )}
              {f.hint && !err && <p id={`${id}-hint`} className="field__hint">{f.hint}</p>}
              {err && <p id={`${id}-err`} className="field__error">{err}</p>}
            </div>
          )
        })}
      </div>

      <div className={`consent${consentError ? ' has-error' : ''}`}>
        <input
          id={`${idp}-consent`}
          type="checkbox"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); setConsentError(false) }}
          aria-invalid={consentError || undefined}
          aria-describedby={consentError ? `${idp}-consent-err` : undefined}
        />
        <label htmlFor={`${idp}-consent`}>
          Autorizo a Tlhavika a usar estes dados para responder a este pedido. *
        </label>
        {consentError && <p id={`${idp}-consent-err`} className="field__error">É necessário o seu consentimento.</p>}
      </div>

      {status.state === 'error' && (
        <div className="form-result form-result--error" role="alert">
          {status.result.ok === false && status.result.reason === 'not-configured' ? (
            <>
              <h3>O envio online ainda não está ativo</h3>
              <p>A sua mensagem não foi enviada. Pode enviá-la já pelo WhatsApp ou por email — os dados preenchidos seguem na mensagem.</p>
            </>
          ) : (
            <>
              <h3>Não foi possível enviar</h3>
              <p>A sua mensagem não foi enviada. Verifique a ligação e tente novamente, ou contacte-nos diretamente.</p>
            </>
          )}
          <div className="form-result__actions">
            <a className="btn btn--whatsapp btn--sm" href={whatsappLink(waText)} target="_blank" rel="noopener noreferrer">
              Enviar pelo WhatsApp
            </a>
            <a
              className="btn btn--outline btn--sm"
              href={`mailto:${site.contactos.email.valor}?subject=${encodeURIComponent(def.titulo)}&body=${encodeURIComponent(waText)}`}
            >
              Enviar por email
            </a>
          </div>
        </div>
      )}

      <button type="submit" className="btn btn--primary btn--lg" disabled={status.state === 'sending'}>
        {status.state === 'sending' ? 'A enviar…' : def.titulo === 'Fornecedores' ? 'Enviar apresentação' : 'Enviar pedido'}
      </button>
    </form>
  )
}
