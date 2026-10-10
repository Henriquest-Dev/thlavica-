import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/** Corre o script do Google com um MailApp/ContentService falsos e confirma quem pode mandar emails. */
function load(chave: string) {
  const sent: Record<string, string>[] = []
  const src = readFileSync('supabase/apps-script/avisos.gs', 'utf8').replace(/const CHAVE = '.*'/, `const CHAVE = '${chave}'`)
  const run = new Function(
    'MailApp',
    'ContentService',
    `${src}; return doPost`,
  )(
    { sendEmail: (m: Record<string, string>) => sent.push(m) },
    { createTextOutput: (t: string) => ({ setMimeType: () => t }), MimeType: { JSON: 'json' } },
  ) as (e: { postData: { contents: string } }) => string
  const post = (o: object) => JSON.parse(run({ postData: { contents: JSON.stringify(o) } })) as { ok: boolean; motivo: string | null }
  return { post, sent }
}

describe('script de avisos por email (Apps Script)', () => {
  it('envia o email quando a chave está certa', () => {
    const { post, sent } = load('segredo-comprido-123')
    expect(post({ chave: 'segredo-comprido-123', para: 'a@b.pt', assunto: 'Assunto', texto: 'Corpo' })).toMatchObject({ ok: true })
    expect(sent).toEqual([{ to: 'a@b.pt', subject: 'Assunto', body: 'Corpo', name: 'Site Tlhavika' }])
  })

  it('recusa chave errada, em falta ou ainda por definir', () => {
    const { post, sent } = load('segredo-comprido-123')
    expect(post({ chave: 'outra', para: 'a@b.pt' }).ok).toBe(false)
    expect(post({ para: 'a@b.pt' }).ok).toBe(false)
    expect(sent).toHaveLength(0)
    const naoConfigurado = load('COLOQUE_AQUI_UMA_CHAVE_COMPRIDA')
    expect(naoConfigurado.post({ chave: 'COLOQUE_AQUI_UMA_CHAVE_COMPRIDA', para: 'a@b.pt' }).ok).toBe(false)
    expect(naoConfigurado.sent).toHaveLength(0)
  })

  it('só aceita emails válidos, no máximo 5, e ignora pedidos sem destinatário', () => {
    const { post, sent } = load('k')
    post({ chave: 'k', para: 'a@b.pt, lixo, c@d.pt,e@f.pt,g@h.pt,i@j.pt,k@l.pt,m@n.pt', assunto: 'x', texto: 'y' })
    expect(sent[0].to).toBe('a@b.pt,c@d.pt,e@f.pt,g@h.pt,i@j.pt')
    expect(post({ chave: 'k', para: 'lixo' })).toMatchObject({ ok: false, motivo: 'sem destinatários' })
    expect(sent).toHaveLength(1)
  })

  it('um pedido malformado não rebenta', () => {
    const { post } = load('k')
    expect(post({} as object).ok).toBe(false)
  })
})
