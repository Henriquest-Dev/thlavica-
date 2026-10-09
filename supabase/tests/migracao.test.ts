import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { PGlite } from '@electric-sql/pglite'

/**
 * Aplica a migração num Postgres em memória (PGlite), com um esquema `auth` e `storage`
 * mínimo que imita o do Supabase, e confirma quem pode ler e escrever o quê.
 */

const ADMIN = '00000000-0000-0000-0000-0000000000a1'
const VISITOR = '00000000-0000-0000-0000-0000000000b2'

let db: PGlite

async function as<T>(role: 'anon' | 'authenticated', sub: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${sub ?? ''}', false);`)
  try {
    return await fn()
  } finally {
    await db.exec('reset role')
  }
}
const ok = async (sql: string) => {
  await db.query(sql)
}
const fails = (p: Promise<unknown>) => expect(p).rejects.toThrow()
const count = async (table: string) => Number(((await db.query(`select count(*) as n from public.${table}`)).rows[0] as { n: string | number }).n)

beforeAll(async () => {
  db = new PGlite()
  await db.exec(`
    create publication supabase_realtime;
    create role anon nologin; create role authenticated nologin; create role service_role nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id serial primary key, bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema auth, storage to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    grant all on all tables in schema storage to anon, authenticated;
    grant all on all sequences in schema storage to anon, authenticated;
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on functions to anon, authenticated;
  `)
  const sql = readFileSync('supabase/migrations/20261009000000_inicio.sql', 'utf8')
  await db.exec(sql)
  await db.exec(sql) // pode correr duas vezes sem erro
  await db.exec(`
    insert into auth.users values ('${ADMIN}', 'admin@x'), ('${VISITOR}', 'visitante@x');
    insert into public.admins values ('${ADMIN}');
    insert into public.promos (id, data) values ('p1', '{"titulo":"Promo"}');
  `)
})

describe('visitante sem conta (anon)', () => {
  it('lê o que o site mostra', async () => {
    for (const t of ['catalog_products', 'catalog_overrides', 'promos', 'media_items', 'site_settings']) {
      await as('anon', null, () => ok(`select * from public.${t}`))
    }
    expect((await as('anon', null, () => db.query('select * from public.promos'))).rows).toHaveLength(1)
  })

  it('não escreve no site', async () => {
    await fails(as('anon', null, () => ok(`insert into public.promos (id, data) values ('x', '{}')`)))
    // sem política de escrita, o update/delete afeta 0 linhas
    await as('anon', null, () => ok(`update public.promos set data = '{"titulo":"hackeado"}'`))
    await as('anon', null, () => ok(`delete from public.promos`))
    expect(await count('promos')).toBe(1)
    expect((await db.query('select data from public.promos')).rows[0]).toEqual({ data: { titulo: 'Promo' } })
  })

  it('envia pedidos de cotação, só como "nova", e não os lê', async () => {
    await as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('q1', '{"nome":"A","estado":"nova"}')`))
    await fails(as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('q2', '{"nome":"A","estado":"enviada"}')`)))
    await fails(as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('q3', '[1]')`)))
    await fails(as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('q4', '{"estado":"nova","x":"${'a'.repeat(21000)}"}')`)))
    expect((await as('anon', null, () => db.query('select * from public.quote_requests'))).rows).toHaveLength(0)
    expect(await count('quote_requests')).toBe(1)
  })

  it('não vê propostas nem administradores, nem envia imagens', async () => {
    expect((await as('anon', null, () => db.query('select * from public.proposals'))).rows).toHaveLength(0)
    await fails(as('anon', null, () => ok(`insert into public.proposals (id, data) values ('x', '{}')`)))
    expect((await as('anon', null, () => db.query('select * from public.admins'))).rows).toHaveLength(0)
    await fails(as('anon', null, () => ok(`insert into storage.objects (bucket_id, name) values ('site', 'a.webp')`)))
  })
})

describe('utilizador com conta mas sem ser administrador', () => {
  it('não escreve nem lê pedidos', async () => {
    await fails(as('authenticated', VISITOR, () => ok(`insert into public.promos (id, data) values ('x', '{}')`)))
    expect((await as('authenticated', VISITOR, () => db.query('select * from public.quote_requests'))).rows).toHaveLength(0)
    await fails(as('authenticated', VISITOR, () => ok(`insert into public.admins (user_id) values ('${VISITOR}')`)))
    await fails(as('authenticated', VISITOR, () => ok(`insert into storage.objects (bucket_id, name) values ('site', 'b.webp')`)))
  })
})

describe('administrador', () => {
  it('gere o site', async () => {
    await as('authenticated', ADMIN, async () => {
      await ok(`insert into public.promos (id, data, pos) values ('p2', '{"titulo":"Outra"}', 1)`)
      await ok(`update public.promos set data = '{"titulo":"Editada"}' where id = 'p2'`)
      await ok(`insert into public.catalog_products (id, data) values ('c1', '{}')`)
      await ok(`insert into public.catalog_overrides (id, data) values ('astronergy-astron7-625w', '{"hidden":true}')`)
      await ok(`insert into public.media_items (id, data) values ('m1', '{}')`)
      await ok(`insert into public.site_settings (id, data) values ('contactos', '{}')`)
      await ok(`insert into public.proposals (id, data) values ('pr1', '{}')`)
      await ok(`delete from public.promos where id = 'p2'`)
    })
    expect(await count('promos')).toBe(1)
  })

  it('lê e gere os pedidos', async () => {
    const rows = (await as('authenticated', ADMIN, () => db.query('select id from public.quote_requests'))).rows
    expect(rows).toHaveLength(1)
    await as('authenticated', ADMIN, () => ok(`update public.quote_requests set data = jsonb_set(data, '{estado}', '"enviada"') where id = 'q1'`))
    expect(((await db.query(`select data->>'estado' as e from public.quote_requests where id='q1'`)).rows[0] as { e: string }).e).toBe('enviada')
  })

  it('envia imagens para o balde do site, e só para esse', async () => {
    await as('authenticated', ADMIN, () => ok(`insert into storage.objects (bucket_id, name) values ('site', 'c.webp')`))
    await fails(as('authenticated', ADMIN, () => ok(`insert into storage.objects (bucket_id, name) values ('outro', 'c.webp')`)))
  })

  it('vê a sua linha em admins', async () => {
    expect((await as('authenticated', ADMIN, () => db.query('select * from public.admins'))).rows).toHaveLength(1)
  })
})

describe('esquema', () => {
  it('o balde é público e só aceita imagens', async () => {
    const b = (await db.query(`select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'site'`)).rows[0] as { public: boolean; file_size_limit: string | number; allowed_mime_types: string[] }
    expect(b.public).toBe(true)
    expect(Number(b.file_size_limit)).toBe(5242880)
    expect(b.allowed_mime_types).toContain('image/webp')
  })

  it('atualiza updated_at ao editar', async () => {
    const before = (await db.query(`select updated_at from public.promos where id = 'p1'`)).rows[0] as { updated_at: Date }
    await new Promise((r) => setTimeout(r, 20))
    await db.query(`update public.promos set data = '{"titulo":"Promo 2"}' where id = 'p1'`)
    const after = (await db.query(`select updated_at from public.promos where id = 'p1'`)).rows[0] as { updated_at: Date }
    expect(+after.updated_at).toBeGreaterThan(+before.updated_at)
  })
})
