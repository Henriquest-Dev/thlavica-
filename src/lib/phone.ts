/**
 * Números de telefone e WhatsApp.
 * O cliente escreve o número como quiser ("84 123 4567", "+258 84 123 4567", "0025884…"); aqui fica sempre só em
 * dígitos e com o indicativo de Moçambique (258) quando faltar, que é o formato que o WhatsApp precisa.
 */

/** Só dígitos, com o 258 à frente nos números moçambicanos sem indicativo (9 dígitos a começar por 8). */
export function whatsappDigits(phone: string): string {
  const d = phone.replace(/\D/g, '').replace(/^00/, '')
  return d.length === 9 && d.startsWith('8') ? `258${d}` : d
}

/** Link que abre a conversa no WhatsApp com esse número, ou undefined se o número não parece válido. */
export function whatsappLink(phone: string, text?: string): string | undefined {
  const d = whatsappDigits(phone)
  if (d.length < 10 || d.length > 15) return undefined
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

/** Link para ligar (tel:), com o indicativo. */
export function telLink(phone: string): string | undefined {
  const d = whatsappDigits(phone)
  return d.length >= 10 ? `tel:+${d}` : undefined
}
