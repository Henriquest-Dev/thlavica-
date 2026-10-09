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
