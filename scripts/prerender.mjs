// Pré-renderiza o site para SEO: abre cada página num navegador, guarda o HTML final em dist/<rota>/index.html
// e gera sitemap.xml e robots.txt. Assim o Google e as redes sociais veem título, descrição, conteúdo e
// dados estruturados sem executar JavaScript, e cada rota responde com 200 (e não com o 404 do GitHub Pages).
//
// Uso (depois de `vite build`): node scripts/prerender.mjs [modo]      ex.: node scripts/prerender.mjs ghpages
//
// - Descobre as rotas seguindo as ligações internas a partir da página inicial (o que não tem ligação não entra).
// - Usa os produtos e contactos publicados no Supabase (só leitura pública) para as páginas refletirem o painel.
// - Precisa do Playwright com Chromium (PLAYWRIGHT_BROWSERS_PATH ou CHROMIUM_PATH).
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'

const mode = process.argv[2] ?? 'production'
const root = resolve(import.meta.dirname, '..')
const dist = join(root, 'dist')

/* ---------- ambiente (.env, .env.<modo>, variáveis do sistema) ---------- */
const env = { ...process.env }
for (const f of ['.env', `.env.${mode}`]) {
  const p = join(root, f)
  if (!existsSync(p)) continue
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/)
    if (m && !line.trimStart().startsWith('#')) env[m[1]] ??= m[2]
  }
}
const base = (env.VITE_BASE_PATH || '/').replace(/\/?$/, '/')
const siteUrl = (env.VITE_SITE_URL || '').replace(/\/$/, '')
if (!siteUrl) throw new Error('Falta VITE_SITE_URL (ex.: https://exemplo.pt) para o canónico e o sitemap.')

/* ---------- Playwright ---------- */
function loadPlaywright() {
  const roots = [root, execSync('npm root -g', { encoding: 'utf8' }).trim() + '/']
  for (const r of roots) {
    try {
      return createRequire(join(r, 'noop.js'))('playwright')
    } catch {
      /* tenta o seguinte */
    }
  }
  throw new Error('Playwright não encontrado. Instale-o: npm i -D playwright (e o Chromium).')
}
const { chromium } = loadPlaywright()
const chromePath =
  env.CHROMIUM_PATH ||
  ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'].find((p) => existsSync(p))

/* ---------- dados publicados (para as páginas refletirem o painel) ---------- */
async function fromSupabase(table) {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) return null
  try {
    const r = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${table}?select=id,data,pos&order=pos.asc`, {
      headers: { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    })
    if (!r.ok) throw new Error(String(r.status))
    return await r.json()
  } catch (e) {
    console.warn(`  aviso: não foi possível ler ${table} do Supabase (${e.message}); uso os dados de origem.`)
    return null
  }
}
const [custom, overrides, settings] = await Promise.all([fromSupabase('catalog_products'), fromSupabase('catalog_overrides'), fromSupabase('site_settings')])
const seed = {}
if (custom) seed['tlh:catalog.custom'] = JSON.stringify(custom.map((r) => r.data))
if (overrides) seed['tlh:catalog.overrides'] = JSON.stringify(Object.fromEntries(overrides.map((r) => [r.id, r.data])))
if (settings?.[0]) seed['tlh:settings'] = JSON.stringify(settings[0].data)

/* ---------- servidor estático com o mesmo comportamento do GitHub Pages ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain' }
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (!p.startsWith(base)) {
    res.writeHead(404).end()
    return
  }
  p = p.slice(base.length)
  let file = join(dist, p)
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) file = join(dist, '404.html') // como o GitHub Pages: rota sem ficheiro → 404.html
  res.writeHead(file.endsWith('404.html') ? 404 : 200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
  res.end(readFileSync(file))
})
await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
const origin = `http://127.0.0.1:${server.address().port}`

/* ---------- rastreio ---------- */
const browser = await chromium.launch({ executablePath: chromePath, args: ['--no-sandbox'] })
const rel = (url) => {
  const u = new URL(url, origin)
  if (u.origin !== origin || !u.pathname.startsWith(base)) return null
  const path = '/' + u.pathname.slice(base.length).replace(/\/+$/, '')
  return path === '/admin' || path.startsWith('/admin/') ? null : path
}

const pages = new Map() // rota → html
const queue = ['/']
const seen = new Set(queue)
const broken = []

while (queue.length) {
  const route = queue.shift()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'pt-PT' })
  await ctx.addInitScript((data) => {
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v)
  }, seed)
  // sem rede externa (Supabase, YouTube…): o HTML estático é o conteúdo de origem + o que foi publicado acima
  await ctx.route('**/*', (r) => (r.request().url().startsWith(origin) ? r.continue() : r.abort()))
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`${origin}${base}${route.slice(1)}`, { waitUntil: 'networkidle' })
  await page.waitForFunction((r) => document.documentElement.dataset.seo === r, route, { timeout: 15000 }).catch(() => {})

  const noindex = await page.evaluate(() => document.querySelector('meta[name="robots"]')?.content.includes('noindex') ?? false)
  // percorre a página para que os elementos que aparecem ao rolar fiquem no estado final
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 40))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(400)

  const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.href))
  for (const l of links) {
    const r = rel(l)
    if (r && !seen.has(r)) {
      seen.add(r)
      queue.push(r)
    }
  }

  if (errors.length) console.warn(`  aviso ${route}: ${errors.join(' | ')}`)
  if (noindex) {
    broken.push(route)
  } else {
    const html = await page.evaluate((isHome) => {
      const h = document.documentElement
      h.className = '' // classes do scroll suave (lenis) e outras de estado
      h.removeAttribute('style')
      document.body.removeAttribute('style')
      document.body.className = ''
      if (!isHome) document.querySelectorAll('link[data-home]').forEach((n) => n.remove())
      delete h.dataset.seo
      return '<!doctype html>\n' + h.outerHTML
    }, route === '/')
    // ligações que o carregador do Vite acrescentou durante a visita (modulepreload) vêm com o endereço do servidor local
    pages.set(route, html.replaceAll(origin, ''))
  }
  await ctx.close()
}
await browser.close()
server.close()

/* ---------- ficheiros ---------- */
for (const [route, html] of pages) {
  const file = route === '/' ? join(dist, 'index.html') : join(dist, route.slice(1), 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

const today = new Date().toISOString().slice(0, 10)
const urls = [...pages.keys()].sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)))
const loc = (r) => (r === '/' ? `${siteUrl}/` : `${siteUrl}${r}/`)
const priority = (r) => (r === '/' ? '1.0' : r.startsWith('/produtos/') ? '0.6' : '0.8')
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((r) => `  <url>\n    <loc>${loc(r)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority(r)}</priority>\n  </url>`)
    .join('\n')}\n</urlset>\n`,
)
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: ${new URL(siteUrl).pathname.replace(/\/$/, '')}/admin/\n\nSitemap: ${siteUrl}/sitemap.xml\n`)

console.log(`Pré-renderizadas ${pages.size} páginas: ${urls.join(' ')}`)
if (broken.length) console.log(`Ignoradas (noindex): ${broken.join(' ')}`)
