import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** GitHub Pages: 404.html para rotas diretas, .nojekyll e robots.txt. */
function pagesFiles(): Plugin {
  return {
    name: 'pages-files',
    apply: 'build',
    closeBundle() {
      const out = resolve(import.meta.dirname, 'dist')
      copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
      writeFileSync(resolve(out, '.nojekyll'), '')
      writeFileSync(resolve(out, 'robots.txt'), 'User-agent: *\nAllow: /\n')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), pagesFiles()],
  }
})
