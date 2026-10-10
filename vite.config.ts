import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Política de segurança de conteúdo. Só no build (o servidor de desenvolvimento precisa de scripts em linha).
 * O GitHub Pages não deixa definir cabeçalhos HTTP, por isso vai numa meta tag.
 * Imagens e vídeos podem vir de qualquer https (o painel aceita endereços externos); scripts só do próprio site.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://ntfy.sh https://script.google.com https://script.googleusercontent.com",
  'frame-src https://www.youtube-nocookie.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

function csp(): Plugin {
  return {
    name: 'csp',
    apply: 'build',
    transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' }],
  }
}

/** GitHub Pages: 404.html para rotas diretas e .nojekyll (robots.txt e sitemap.xml vêm do pré-renderizador). */
function pagesFiles(): Plugin {
  return {
    name: 'pages-files',
    apply: 'build',
    closeBundle() {
      const out = resolve(import.meta.dirname, 'dist')
      copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
      writeFileSync(resolve(out, '.nojekyll'), '')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), csp(), pagesFiles()],
  }
})
