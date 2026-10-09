import { useState } from 'react'
import { defaultContact, useContact, type Contact } from '../data/site'
import { removeStored, writeStored } from '../lib/store'
import { Field, PageTitle, Panel } from './ui'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Contactos que aparecem no site (rodapé, Contacto, Sobre e links do WhatsApp). */
export default function Settings() {
  const current = useContact()
  const [v, setV] = useState<Contact>(current)
  const [err, setErr] = useState<Partial<Record<keyof Contact, string>>>({})
  const [saved, setSaved] = useState(false)
  const set = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setV({ ...v, [k]: e.target.value })
    setSaved(false)
    setErr({ ...err, [k]: undefined })
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const n: typeof err = {}
    const wa = v.whatsapp.replace(/\D/g, '')
    if (!v.phone.trim()) n.phone = 'Indique o telefone.'
    if (wa.length < 9 || wa.length > 15) n.whatsapp = 'Use só dígitos com o indicativo, por exemplo 258871191481.'
    if (!EMAIL.test(v.email.trim())) n.email = 'Indique um email válido.'
    if (!v.address.trim()) n.address = 'Indique a morada.'
    if (v.facebook.trim() && !/^https?:\/\//.test(v.facebook.trim())) n.facebook = 'O endereço tem de começar por https://'
    setErr(n)
    if (Object.keys(n).length) return
    const next: Contact = { phone: v.phone.trim(), whatsapp: wa, email: v.email.trim(), address: v.address.trim(), facebook: v.facebook.trim() }
    setV(next)
    setSaved(writeStored('settings', next))
  }

  return (
    <>
      <PageTitle title="Contactos" lead="O que aparece no rodapé, em Contacto e Sobre, e para onde vão os botões do WhatsApp." />
      <Panel>
        <form className="pform settings" onSubmit={save} noValidate>
          <div className="grid2">
            <Field label="Telefone *" hint="Como aparece no site.">
              <input value={v.phone} onChange={set('phone')} inputMode="tel" />
              {err.phone && <span className="ferr">{err.phone}</span>}
            </Field>
            <Field label="WhatsApp *" hint="Só dígitos, com o indicativo (258…).">
              <input value={v.whatsapp} onChange={set('whatsapp')} inputMode="numeric" />
              {err.whatsapp && <span className="ferr">{err.whatsapp}</span>}
            </Field>
            <Field label="Email *">
              <input value={v.email} onChange={set('email')} type="email" />
              {err.email && <span className="ferr">{err.email}</span>}
            </Field>
            <Field label="Facebook" hint="Endereço da página.">
              <input value={v.facebook} onChange={set('facebook')} inputMode="url" />
              {err.facebook && <span className="ferr">{err.facebook}</span>}
            </Field>
            <Field label="Morada *" wide>
              <input value={v.address} onChange={set('address')} />
              {err.address && <span className="ferr">{err.address}</span>}
            </Field>
          </div>
          <div className="row">
            <button type="submit" className="btn">
              Guardar contactos
            </button>
            <button
              type="button"
              className="btn btn--line"
              onClick={() => {
                removeStored('settings')
                setV(defaultContact)
                setSaved(false)
              }}
            >
              Repor os de origem
            </button>
            {saved && (
              <span className="saved" role="status">
                Guardado. Já aparece no site.
              </span>
            )}
          </div>
        </form>
      </Panel>
    </>
  )
}
