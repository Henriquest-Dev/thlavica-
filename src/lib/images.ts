import { BUCKET, getClient, remoteEnabled } from './supabase'
import { uid } from './store'

/**
 * Imagens enviadas no painel: reduzidas no navegador e guardadas
 * no balde `site` do Supabase (devolve o endereço público) ou, sem Supabase, como data URL.
 */

function resize(file: File, max: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      const ctx = c.getContext('2d')
      URL.revokeObjectURL(url)
      if (!ctx) return reject(new Error('Sem suporte de canvas'))
      ctx.drawImage(img, 0, 0, c.width, c.height)
      c.toBlob(
        (blob) => {
          if (blob) return resolve(blob)
          c.toBlob((jpg) => (jpg ? resolve(jpg) : reject(new Error('Não foi possível processar a imagem'))), 'image/jpeg', quality)
        },
        'image/webp',
        quality,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem'))
    }
    img.src = url
  })
}

const toDataUrl = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(new Error('Não foi possível ler a imagem'))
    r.readAsDataURL(b)
  })

export async function saveImage(file: File, opt: { max?: number; quality?: number; folder?: string } = {}): Promise<string> {
  const blob = await resize(file, opt.max ?? 900, opt.quality ?? 0.84)
  const c = remoteEnabled ? getClient() : null
  if (!c) return toDataUrl(blob)
  const client = await c
  const ext = blob.type === 'image/jpeg' ? 'jpg' : 'webp'
  const path = `${opt.folder ?? 'imagens'}/${uid()}.${ext}`
  const { error } = await client.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: '31536000' })
  if (error) throw new Error(error.message.includes('row-level security') ? 'Sem permissão para enviar imagens. Entre como administrador.' : `Não foi possível enviar a imagem: ${error.message}`)
  return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/** Vídeos: até 5 MB cada, para não pesar o servidor nem o carregamento do site. */
export const VIDEO_MAX_BYTES = 5 * 1024 * 1024
const VIDEO_TYPES: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mp4' }

export const humanSize = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.round(b / 1024)} KB`)

/**
 * Envia um vídeo (MP4, WebM ou o .mov do iPhone) para o balde `site` e devolve o endereço público.
 * Sem ligação ao servidor não dá para guardar vídeos (ficariam grandes demais para o navegador).
 */
export async function saveVideo(file: File, opt: { folder?: string } = {}): Promise<string> {
  const mime = file.type === 'video/quicktime' ? 'video/mp4' : file.type
  const ext = VIDEO_TYPES[file.type]
  if (!ext) throw new Error('Esse ficheiro não é um vídeo que o site aceite. Use MP4 (o normal do telemóvel) ou WebM.')
  if (file.size > VIDEO_MAX_BYTES)
    throw new Error(`O vídeo tem ${humanSize(file.size)} e o máximo é 5 MB. Use um vídeo curto (15 a 30 segundos) ou grave em qualidade mais baixa (720p ou 480p) e tente outra vez.`)
  const c = remoteEnabled ? getClient() : null
  if (!c) throw new Error('Para enviar vídeos o painel precisa de estar ligado ao servidor.')
  const client = await c
  const path = `${opt.folder ?? 'videos'}/${uid()}.${ext}`
  const { error } = await client.storage.from(BUCKET).upload(path, file, { contentType: mime, cacheControl: '31536000' })
  if (error) {
    if (error.message.includes('row-level security')) throw new Error('Sem permissão para enviar vídeos. Entre como administrador.')
    if (/mime|not supported/i.test(error.message)) throw new Error('O servidor ainda não aceita vídeos. Falta correr o SQL dos vídeos (quem instalou o site sabe).')
    if (/size|exceed|too large/i.test(error.message)) throw new Error('O vídeo é grande demais para o servidor (máximo 5 MB).')
    throw new Error(`Não foi possível enviar o vídeo: ${error.message}`)
  }
  return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
