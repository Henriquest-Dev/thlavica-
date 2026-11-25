/* Guarda o site no aparelho para abrir depressa com rede fraca.
 * - ficheiros do programa (/assets, com nome único): sempre da cópia guardada;
 * - imagens e letras: mostra a cópia e atualiza por trás;
 * - páginas: tenta a rede durante 4 s e, se demorar, mostra a última cópia guardada.
 * Pedidos à base de dados (outro endereço) nunca passam por aqui. */
const V = 'tlh-v2'

// guarda já a página inicial, para ela abrir mesmo sem rede logo na segunda visita
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.add(self.registration.scope)).catch(() => {}))
  self.skipWaiting()
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

const store = (req, res) => {
  if (res && res.ok && res.type === 'basic') {
    const copy = res.clone()
    caches.open(V).then((c) => c.put(req, copy)).catch(() => {})
  }
  return res
}

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  const path = url.pathname

  if (req.mode === 'navigate') {
    e.respondWith(
      (async () => {
        const cached = await caches.match(req)
        const net = fetch(req).then((r) => store(req, r))
        if (!cached) return net.catch(() => caches.match(req).then((c) => c || Response.error()))
        return Promise.race([net.catch(() => cached), new Promise((ok) => setTimeout(() => ok(cached), 4000))])
      })(),
    )
    return
  }

  if (path.includes('/assets/')) {
    e.respondWith(caches.match(req).then((c) => c || fetch(req).then((r) => store(req, r))))
    return
  }

  if (/\.(webp|png|jpe?g|svg|woff2?|ico|webmanifest)$/i.test(path)) {
    e.respondWith(
      caches.match(req).then((c) => {
        const net = fetch(req).then((r) => store(req, r)).catch(() => c)
        return c || net
      }),
    )
  }
})
