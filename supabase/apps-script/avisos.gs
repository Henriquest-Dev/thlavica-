/**
 * Avisos por email dos pedidos de cotação (Google Apps Script, gratuito).
 *
 * A base de dados (Supabase) chama este script sempre que chega um pedido; o script envia o email.
 * Instruções (5 minutos, uma só vez): README.md → "Avisos por email".
 *
 * Mude só a linha da CHAVE: escolha uma palavra-passe comprida e a mesma que cola no painel.
 */
const CHAVE = 'COLOQUE_AQUI_UMA_CHAVE_COMPRIDA'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents)
    if (CHAVE.indexOf('COLOQUE_') === 0 || d.chave !== CHAVE) return resposta(false, 'chave')

    const para = String(d.para || '')
      .split(',')
      .map(function (s) { return s.trim() })
      .filter(function (s) { return EMAIL.test(s) })
      .slice(0, 5)
      .join(',')
    if (!para) return resposta(false, 'sem destinatários')

    MailApp.sendEmail({
      to: para,
      subject: String(d.assunto || 'Novo pedido de cotação').slice(0, 200),
      body: String(d.texto || '').slice(0, 5000),
      name: 'Site Tlhavika',
    })
    return resposta(true)
  } catch (err) {
    return resposta(false, 'erro')
  }
}

function resposta(ok, motivo) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok, motivo: motivo || null })).setMimeType(ContentService.MimeType.JSON)
}
