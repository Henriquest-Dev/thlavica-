// Confirma que o Supabase está preparado: tabelas, segurança e entrada do administrador.
// Uso: node scripts/verificar-supabase.mjs <utilizador> <palavra-passe>
// Lê VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY do ambiente ou de .env.local / .env.ghpages.
import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = { ...process.env }
for (const f of ['.env.ghpages', '.env.local']) {
  if (!existsSync(f)) continue
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
    if (m && !line.trimStart().startsWith('#')) env[m[1]] ??= m[2]
  }
}
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
const [user, pass] = process.argv.slice(2)
if (!url || !key) throw new Error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (ver .env.example).')

let falhas = 0
const ok = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`)
  if (!cond) falhas++
}
const novo = () => createClient(url, key, { auth: { persistSession: false } })

// 1. Visitante (sem conta)
const anon = novo()
for (const t of ['catalog_products', 'catalog_overrides', 'promos', 'media_items', 'site_settings']) {
  const r = await anon.from(t).select('id').limit(1)
  ok(!r.error, `visitante lê ${t}${r.error ? ` (${r.error.message})` : ''}`)
}
const w = await anon.from('promos').insert({ id: 'teste-visitante', data: {} })
ok(Boolean(w.error), 'visitante NÃO escreve em promos')
const q = await anon.from('quote_requests').select('id').limit(1)
ok(!q.error && q.data.length === 0, 'visitante NÃO lê pedidos')
const p = await anon.from('proposals').select('id').limit(1)
ok(!p.error && p.data.length === 0, 'visitante NÃO lê propostas')

// 2. Administrador
if (user && pass) {
  const c = novo()
  const email = `${user.trim().toLowerCase()}@admin.tlhavika.local`
  const l = await c.auth.signInWithPassword({ email, password: pass })
  ok(!l.error, `entrada do administrador${l.error ? ` (${l.error.message})` : ''}`)
  if (!l.error) {
    const a = await c.from('admins').select('user_id').maybeSingle()
    ok(Boolean(a.data), 'a conta está na tabela admins (correr supabase/admin.sql se falhar)')
    const id = `teste-${Date.now()}`
    const ins = await c.from('promos').insert({ id, data: { titulo: 'teste' } })
    ok(!ins.error, `administrador escreve em promos${ins.error ? ` (${ins.error.message})` : ''}`)
    const del = await c.from('promos').delete().eq('id', id)
    ok(!del.error, 'administrador apaga o que criou')
    const rq = await c.from('quote_requests').select('id').limit(1)
    ok(!rq.error, 'administrador lê pedidos')
    await c.auth.signOut()
  }
} else {
  console.log('(passe <utilizador> <palavra-passe> para testar também a entrada do administrador)')
}
console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTudo certo.')
process.exit(falhas ? 1 : 0)
