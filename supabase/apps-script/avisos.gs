/**
 * Avisos por email dos pedidos de cotação (Google Apps Script, gratuito).
 *
 * A base de dados (Supabase) chama este script sempre que chega um pedido; o script envia o email.
 * Instruções (5 minutos, uma só vez): README.md → "Avisos por email".
 *
 * Mude só a linha da CHAVE: escolha uma palavra-passe comprida e a mesma que cola no painel.
 */
const CHAVE = 'COLOQUE_AQUI_UMA_CHAVE_COMPRIDA'

// Manter o Supabase acordado: a conta gratuita pausa o projeto ao fim de 7 dias sem pedidos à base de dados.
// Cole aqui o endereço do projeto e a chave "publishable" (as mesmas do site; são públicas) e crie um
// acionador diário para a função manterAtivo (relógio no menu à esquerda → Adicionar acionador).
const SUPABASE_URL = 'COLOQUE_AQUI_O_ENDERECO_DO_SUPABASE'
const SUPABASE_CHAVE_PUBLICA = 'COLOQUE_AQUI_A_CHAVE_PUBLISHABLE'

function manterAtivo() {
  if (SUPABASE_URL.indexOf('COLOQUE_') === 0) return
  UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/site_settings?select=id&limit=1', {
    headers: { apikey: SUPABASE_CHAVE_PUBLICA },
    muteHttpExceptions: true,
  })
}

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
