import { describe, expect, it } from 'vitest'
import { noticeBody, parseEmails, SCRIPT_URL, topicUrl, validateEmail } from './notify'

const URL_OK = 'https://script.google.com/macros/s/AKfycbx_abc-123/exec'

describe('avisos: validação do email', () => {
  it('separa emails válidos e inválidos, por vírgula, espaço ou ponto e vírgula', () => {
    expect(parseEmails('a@b.pt, c@d.pt;lixo  e@f.pt')).toEqual({ ok: ['a@b.pt', 'c@d.pt', 'e@f.pt'], bad: ['lixo'] })
    expect(parseEmails('1@a.pt,2@a.pt,3@a.pt,4@a.pt,5@a.pt,6@a.pt').ok).toHaveLength(5)
    expect(parseEmails('')).toEqual({ ok: [], bad: [] })
  })

  it('só aceita o endereço de uma aplicação web do Google', () => {
    expect(SCRIPT_URL.test(URL_OK)).toBe(true)
    expect(SCRIPT_URL.test('https://evil.test/macros/s/abc/exec')).toBe(false)
    expect(SCRIPT_URL.test('http://script.google.com/macros/s/abc/exec')).toBe(false)
    expect(SCRIPT_URL.test('https://script.google.com/macros/s/abc/dev')).toBe(false)
  })

  it('explica o que falta antes de ligar', () => {
    expect(validateEmail('', URL_OK, 'chave-comprida-123')).toMatch(/pelo menos um email/)
    expect(validateEmail('a@b.pt, lixo', URL_OK, 'chave-comprida-123')).toMatch(/inválido: lixo/)
    expect(validateEmail('a@b.pt', 'https://x.test', 'chave-comprida-123')).toMatch(/endereço do script/)
    expect(validateEmail('a@b.pt', URL_OK, 'curta')).toMatch(/12 caracteres/)
    expect(validateEmail('a@b.pt', URL_OK, 'chave-comprida-123')).toBe('')
  })
})

describe('avisos: ntfy', () => {
  it('monta o endereço do tópico e o corpo do aviso', () => {
    expect(topicUrl({ ntfy_server: 'https://ntfy.sh/', ntfy_topic: 'tlhavika-abc' })).toBe('https://ntfy.sh/tlhavika-abc')
    expect(noticeBody({ ntfy_topic: 't', admin_url: 'https://x/admin/', icon_url: 'https://x/i.png' }, 'T', 'M')).toEqual({
      topic: 't', title: 'T', message: 'M', priority: 4, tags: ['bell'], click: 'https://x/admin/', icon: 'https://x/i.png',
    })
  })
})
