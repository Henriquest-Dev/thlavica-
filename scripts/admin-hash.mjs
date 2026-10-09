// Gera o resumo (hash) das credenciais do painel para colar em CREDENTIAL_HASH (src/lib/adminSession.ts).
// Uso: node scripts/admin-hash.mjs <utilizador> <palavra-passe>
import { createHash } from 'node:crypto'

const [user, pass] = process.argv.slice(2)
if (!user || !pass) {
  console.error('Uso: node scripts/admin-hash.mjs <utilizador> <palavra-passe>')
  process.exit(1)
}
const SALT = 'tlhavika-admin-v1'
const sha = (b) => createHash('sha256').update(b).digest()
let h = sha(Buffer.from(`${SALT}\n${user.trim().toLowerCase()}\n${pass}`))
for (let i = 1; i < 20000; i++) h = sha(Buffer.concat([h, Buffer.from(SALT)]))
console.log(h.toString('hex'))
