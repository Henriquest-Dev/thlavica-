import { useState } from 'react'
import { MAX_BANK_ACCOUNTS, cleanBankAccounts, defaultContact, useContact, type BankAccount, type Contact } from '../data/site'
import { removeStored, writeStored } from '../lib/store'
import { useFeedback } from './feedback'
import { whatsappDigits } from '../lib/phone'
import { NotifyPanel } from './NotifyPanel'
import { Field, PageTitle, Panel } from './ui'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


/** Contactos que aparecem no site (rodapé, Contacto, Sobre e links do WhatsApp). */
export default function Settings() {
  const current = useContact()
  const { toast } = useFeedback()
  const [v, setV] = useState<Contact>(current)
  const [err, setErr] = useState<Partial<Record<keyof Contact, string>>>({})
  const set = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setV({ ...v, [k]: e.target.value })
    setErr({ ...err, [k]: undefined })
  }

  const bancos = v.bancos ?? []
  const setBanco = (i: number, k: keyof BankAccount, value: string) => setV({ ...v, bancos: bancos.map((b, j) => (j === i ? { ...b, [k]: value } : b)) })
  const addBanco = () => setV({ ...v, bancos: [...bancos, { titular: v.empresa?.trim() || '', banco: '', conta: '', nib: '', swift: '' }] })
  const removeBanco = (i: number) => setV({ ...v, bancos: bancos.filter((_, j) => j !== i) })

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const n: typeof err = {}
    const wa = whatsappDigits(v.whatsapp)
    if (!v.phone.trim()) n.phone = 'Indique o telefone.'
    if (wa.length < 9 || wa.length > 15) n.whatsapp = 'Escreva o número completo, por exemplo +258 87 119 1481.'
    if (!EMAIL.test(v.email.trim())) n.email = 'Indique um email válido.'
    if (!v.address.trim()) n.address = 'Indique a morada.'
    if (v.facebook.trim() && !/^https?:\/\//.test(v.facebook.trim())) n.facebook = 'O endereço tem de começar por https://'
    setErr(n)
    if (Object.keys(n).length) return
    const next: Contact = {
      phone: v.phone.trim(),
      whatsapp: wa,
      email: v.email.trim(),
      address: v.address.trim(),
      facebook: v.facebook.trim(),
      // dados da cotação em PDF (vazio = não aparece)
      empresa: v.empresa?.trim() || undefined,
      nuit: v.nuit?.trim() || undefined,
      pagamento: v.pagamento?.trim() || undefined,
      condicoes: v.condicoes?.trim() || undefined,
      bancos: cleanBankAccounts(v.bancos),
    }
    setV(next)
    const ok = writeStored('settings', next)
    toast(ok ? 'Contactos guardados. Já aparecem no site.' : 'Não foi possível guardar.', ok ? 'ok' : 'erro')
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
            <Field label="WhatsApp *" hint="Pode escrever como quiser, por exemplo +258 87 119 1481.">
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
          <h3 className="sub">Dados da empresa na cotação em PDF</h3>
          <p className="muted small">Aparecem na cotação em PDF que o cliente recebe. O que deixar vazio não aparece.</p>
          <div className="grid2">
            <Field label="Nome da empresa" hint="Como deve aparecer, por exemplo TLHAVIKA, LDA.">
              <input value={v.empresa ?? ''} onChange={set('empresa')} placeholder="TLHAVIKA, LDA" />
            </Field>
            <Field label="NUIT da empresa">
              <input value={v.nuit ?? ''} onChange={set('nuit')} inputMode="numeric" />
            </Field>
            <Field label="Outros dados para pagamento" hint="Opcional: referência de pagamento ou outro texto livre. As contas bancárias ficam em baixo." wide>
              <textarea rows={2} value={v.pagamento ?? ''} onChange={set('pagamento')} />
            </Field>
            <Field label="Condições" hint="Prazo de entrega, garantia, o que está incluído…" wide>
              <textarea rows={3} value={v.condicoes ?? ''} onChange={set('condicoes')} />
            </Field>
          </div>
          <h3 className="sub">Dados bancários na cotação</h3>
          <p className="muted small">Aparecem no fim da cotação em PDF, em “Dados bancários” (até {MAX_BANK_ACCOUNTS} contas), para o cliente saber onde pagar.</p>
          <div className="banks">
            {bancos.map((b, i) => (
              <fieldset key={i} className="bank">
                <legend>Conta {i + 1}</legend>
                <div className="grid2">
                  <Field label="Titular" hint="Em nome de quem está a conta.">
                    <input value={b.titular} onChange={(e) => setBanco(i, 'titular', e.target.value)} placeholder="Tlhavika Sociedade Unipessoal, LDA" />
                  </Field>
                  <Field label="Banco">
                    <input value={b.banco} onChange={(e) => setBanco(i, 'banco', e.target.value)} placeholder="Millennium BIM" />
                  </Field>
                  <Field label="Número da conta">
                    <input value={b.conta} onChange={(e) => setBanco(i, 'conta', e.target.value)} inputMode="numeric" />
                  </Field>
                  <Field label="NIB" hint="21 números.">
                    <input value={b.nib} onChange={(e) => setBanco(i, 'nib', e.target.value)} inputMode="numeric" />
                  </Field>
                  <Field label="SWIFT" hint="Só para pagamentos do estrangeiro.">
                    <input value={b.swift} onChange={(e) => setBanco(i, 'swift', e.target.value)} />
                  </Field>
                </div>
                <button type="button" className="btn btn--line btn--sm" onClick={() => removeBanco(i)}>
                  Tirar esta conta
                </button>
              </fieldset>
            ))}
            {bancos.length < MAX_BANK_ACCOUNTS && (
              <button type="button" className="btn btn--line" onClick={addBanco}>
                + Adicionar conta bancária
              </button>
            )}
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
                toast('Contactos de origem repostos')
              }}
            >
              Repor os de origem
            </button>
          </div>
        </form>
      </Panel>
      <NotifyPanel />
    </>
  )
}
