import { describe, expect, it } from 'vitest'
import { VIDEO_MAX_BYTES, humanSize, saveVideo } from './images'

const file = (type: string, size: number) => {
  const f = new File(['x'], 'v.bin', { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

describe('saveVideo', () => {
  it('recusa ficheiros que não são vídeo aceite', async () => {
    await expect(saveVideo(file('application/pdf', 1000))).rejects.toThrow(/MP4/)
    await expect(saveVideo(file('video/x-msvideo', 1000))).rejects.toThrow(/MP4/)
  })
  it('recusa vídeos acima de 50 MB e diz o tamanho', async () => {
    await expect(saveVideo(file('video/mp4', VIDEO_MAX_BYTES + 1))).rejects.toThrow(/máximo é 50 MB/)
  })
  it('sem ligação ao servidor não guarda (não cabe no navegador)', async () => {
    await expect(saveVideo(file('video/mp4', 1000))).rejects.toThrow(/ligado ao servidor/)
  })
  it('formata tamanhos', () => {
    expect(humanSize(52428800)).toBe('50,0 MB')
    expect(humanSize(2048)).toBe('2 KB')
  })
})
