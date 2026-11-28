import { MAX_BANK_ACCOUNTS, type BankAccount } from '../data/site'
import { Field } from './ui'

/** Contas bancárias (titular, banco, conta, NIB, SWIFT) que aparecem em "Dados bancários" na cotação em PDF. */
export function BankAccountsEditor({ value, onChange, titular = '' }: { value: BankAccount[]; onChange: (v: BankAccount[]) => void; titular?: string }) {
  const setBanco = (i: number, k: keyof BankAccount, v: string) => onChange(value.map((b, j) => (j === i ? { ...b, [k]: v } : b)))
  return (
    <div className="banks">
      {value.map((b, i) => (
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
          <button type="button" className="btn btn--line btn--sm" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            Tirar esta conta
          </button>
        </fieldset>
      ))}
      {value.length < MAX_BANK_ACCOUNTS && (
        <button type="button" className="btn btn--line" onClick={() => onChange([...value, { titular, banco: '', conta: '', nib: '', swift: '' }])}>
          + Adicionar conta bancária
        </button>
      )}
    </div>
  )
}
