import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { products } from './src/data/products.ts'

const STATIC_ROUTES = ['/', '/solucoes', '/catalogo', '/projetos', '/sobre', '/contacto']

/**
 * Gera robots.txt e sitemap.xml no build.
 * O domínio vem de VITE_SITE_URL (ex.: https://www.exemplo.co.mz). Sem domínio
 * configurado não se gera sitemap — não se inventa um domínio.
 */
function seoFiles(siteUrl: string | undefined): Plugin {
  return {
    name: 'tlhavika-seo-files',
    apply: 'build',
    closeBundle() {
      const out = resolve(import.meta.dirname, 'dist')
      const base = siteUrl?.replace(/\/$/, '')
      const robots = ['User-agent: *', 'Allow: /']
      if (base) {
        const urls = [...STATIC_ROUTES, ...products.map((p) => `/produto/${p.id}`)]
        const xml =
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n') +
          '\n</urlset>\n'
        writeFileSync(resolve(out, 'sitemap.xml'), xml)
        robots.push(`Sitemap: ${base}/sitemap.xml`)
      } else {
        console.warn('[seo] VITE_SITE_URL não definido: sitemap.xml não gerado.')
      }
      writeFileSync(resolve(out, 'robots.txt'), robots.join('\n') + '\n')
      // GitHub Pages: 404.html devolve a app para rotas diretas; .nojekyll evita o processamento Jekyll.
      copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
      writeFileSync(resolve(out, '.nojekyll'), '')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Subcaminho de publicação: '/' na Netlify; '/<repositório>/' no GitHub Pages.
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), seoFiles(env.VITE_SITE_URL)],
  }
})
