import { readdirSync, readFileSync } from 'node:fs'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
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
    -- pg_net falso: regista as chamadas (o real faz o POST em segundo plano)
    create schema net;
    create table net.calls (id serial primary key, url text, body jsonb, headers jsonb);
    create function net.http_post(url text, body jsonb default '{}', params jsonb default '{}', headers jsonb default '{}', timeout_milliseconds integer default 5000)
      returns bigint language plpgsql as $$ begin
        if current_setting('test.net_falha', true) = '1' then raise exception 'sem rede'; end if;
        insert into net.calls (url, body, headers) values (url, body, headers); return 1; end $$;
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
  // todas as migrações, por ordem, e cada uma duas vezes (têm de poder repetir-se sem erro)
  for (const f of readdirSync('supabase/migrations').sort()) {
    const sql = readFileSync(`supabase/migrations/${f}`, 'utf8')
    await db.exec(sql)
    await db.exec(sql)
  } // pode correr duas vezes sem erro
  await db.exec(`
    insert into auth.users values ('${ADMIN}', 'admin@x'), ('${VISITOR}', 'visitante@x');
    insert into public.admins values ('${ADMIN}');
    insert into public.promos (id, data) values ('p1', '{"titulo":"Promo"}');
  `)
}, 60_000)

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
    await as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('q1', '{"nome":"A","telefone":"+258 84 000 0000","estado":"nova"}')`))
    await fails(as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('q2', '{"nome":"A","telefone":"+258 84 000 0000","estado":"enviada"}')`)))
    await fails(as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('q3', '[1]')`)))
    await fails(as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('q4', '{"estado":"nova","x":"${'a'.repeat(21000)}"}')`)))
    expect((await as('anon', null, () => db.query('select * from public.quote_requests'))).rows).toHaveLength(0)
    expect(await count('quote_requests')).toBe(1)
  })

  it('recusa pedidos sem nome ou telefone e com campos gigantes', async () => {
    const ins = (id: string, d: object) => as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('${id}', '${JSON.stringify({ estado: 'nova', ...d })}')`))
    await fails(ins('v1', { telefone: '+258 84 000 0000' })) // sem nome
    await fails(ins('v2', { nome: 'A' })) // sem telefone
    await fails(ins('v3', { nome: 'x'.repeat(121), telefone: '+258 84 000 0000' }))
    await fails(ins('v4', { nome: 'A', telefone: '1' }))
    await fails(ins('v5', { nome: 'A', telefone: '+258 84 000 0000', mensagem: 'm'.repeat(3001) }))
    await fails(ins('i'.repeat(65), { nome: 'A', telefone: '+258 84 000 0000' }))
    await ins('v6', { nome: 'A', telefone: '+258 84 000 0000', local: 'Maputo', mensagem: 'Olá' })
    await db.exec(`delete from public.quote_requests where id = 'v6'`)
  })

  it('limita o número de pedidos por minuto, mesmo sem poder ler a tabela', async () => {
    const before = await count('quote_requests')
    let accepted = 0
    for (let i = 0; i < 70; i++) {
      try {
        await as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('flood${i}', '{"nome":"A","telefone":"+258 84 000 0000","estado":"nova"}')`))
        accepted++
      } catch {
        break
      }
    }
    expect(accepted).toBe(60 - before)
    await db.exec(`delete from public.quote_requests where id like 'flood%'`)
    expect(await count('quote_requests')).toBe(before)
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

describe('avisos de novos pedidos (ntfy)', () => {
  const calls = async () => (await db.query('select url, body, headers from net.calls order by id')).rows as { url: string; body: Record<string, unknown>; headers: Record<string, string> }[]
  const novo = (id: string) => as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('${id}', '{"nome":"Maria","local":"Matola","telefone":"+258 84 000 0000","estado":"nova"}')`))
  beforeEach(async () => {
    await db.exec(`delete from net.calls; delete from public.quote_requests where id like 'n-%'; set test.net_falha = '0'; update public.notify_config set ativo = true, ntfy_token = null, email_ativo = false`)
  })

  it('cria o tópico aleatório uma vez e não o troca ao repetir a migração', async () => {
    const t = ((await db.query('select ntfy_topic from public.notify_config')).rows[0] as { ntfy_topic: string }).ntfy_topic
    expect(t).toMatch(/^tlhavika-[0-9a-f]{32}$/)
    await db.exec(readFileSync('supabase/migrations/20261012000000_avisos_email.sql', 'utf8'))
    expect(((await db.query('select ntfy_topic from public.notify_config')).rows[0] as { ntfy_topic: string }).ntfy_topic).toBe(t)
  })

  it('um pedido novo envia o aviso com nome e local (sem telefone)', async () => {
    await novo('n-1')
    const c = await calls()
    expect(c).toHaveLength(1)
    expect(c[0].url).toBe('https://ntfy.sh')
    expect(c[0].body).toMatchObject({ title: 'Tlhavika: novo pedido de cotação', message: 'Maria · Matola', priority: 4, icon: expect.stringMatching(/icon-192\.png$/) })
    expect(JSON.stringify(c[0].body)).not.toContain('258')
    expect(c[0].headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('com token, envia-o; desligado, não envia nada', async () => {
    await db.exec(`update public.notify_config set ntfy_token = 'tk_abc'`)
    await novo('n-2')
    expect((await calls())[0].headers.Authorization).toBe('Bearer tk_abc')
    await db.exec(`delete from net.calls; update public.notify_config set ativo = false`)
    await novo('n-3')
    expect(await calls()).toHaveLength(0)
  })

  it('se o aviso falhar, o pedido guarda-se na mesma', async () => {
    await db.exec(`set test.net_falha = '1'`)
    await novo('n-4')
    expect(((await db.query(`select count(*)::int as n from public.quote_requests where id = 'n-4'`)).rows[0] as { n: number }).n).toBe(1)
  })

  it('pedidos recusados não avisam, e só administradores veem o tópico', async () => {
    await fails(as('anon', null, () => ok(`insert into public.quote_requests (id, data) values ('n-5', '{"nome":"A","estado":"nova"}')`)))
    expect(await calls()).toHaveLength(0)
    expect((await as('anon', null, () => db.query('select * from public.notify_config'))).rows).toHaveLength(0)
    expect((await as('authenticated', VISITOR, () => db.query('select * from public.notify_config'))).rows).toHaveLength(0)
    expect((await as('authenticated', ADMIN, () => db.query('select * from public.notify_config'))).rows).toHaveLength(1)
    await as('anon', null, () => ok(`update public.notify_config set ntfy_topic = 'hackeado'`)) // sem política: afeta 0 linhas
    expect(((await db.query('select ntfy_topic from public.notify_config')).rows[0] as { ntfy_topic: string }).ntfy_topic).not.toBe('hackeado')
  })

  describe('por email (Apps Script)', () => {
    const URL_ = 'https://script.google.com/macros/s/ABC/exec'
    const configurar = (extra = '') => db.exec(`update public.notify_config set ativo = false, email_ativo = true, email_url = '${URL_}', email_chave = 'segredo', email_para = 'empresa@exemplo.pt'; ${extra}`)

    it('envia o email com os dados do pedido e a ligação ao painel', async () => {
      await configurar()
      await novo('n-6')
      const c = await calls()
      expect(c).toHaveLength(1)
      expect(c[0].url).toBe(URL_)
      expect(c[0].body).toMatchObject({ chave: 'segredo', para: 'empresa@exemplo.pt', assunto: 'Tlhavika: novo pedido de cotação — Maria · Matola' })
      const texto = (c[0].body as { texto: string }).texto
      expect(texto).toContain('Nome: Maria')
      expect(texto).toContain('Telefone: +258 84 000 0000')
      expect(texto).toContain('/admin/cotacoes/')
    })

    it('desligado, sem endereço ou sem destinatários, não envia', async () => {
      await configurar(`update public.notify_config set email_ativo = false`)
      await novo('n-7')
      await configurar(`update public.notify_config set email_url = null`)
      await novo('n-8')
      await configurar(`update public.notify_config set email_para = ''`)
      await novo('n-9')
      expect(await calls()).toHaveLength(0)
    })

    it('email e ntfy podem estar ligados ao mesmo tempo, e um erro não bloqueia o pedido', async () => {
      await configurar(`update public.notify_config set ativo = true`)
      await novo('n-10')
      expect((await calls()).map((x) => x.url)).toEqual([URL_, 'https://ntfy.sh'])
      await db.exec(`set test.net_falha = '1'`)
      await novo('n-11')
      expect(((await db.query(`select count(*)::int as n from public.quote_requests where id = 'n-11'`)).rows[0] as { n: number }).n).toBe(1)
    })

    it('o ntfy fica desligado por omissão e as chaves do email só se veem como administrador', async () => {
      expect(((await db.query(`select column_default from information_schema.columns where table_name = 'notify_config' and column_name = 'ativo'`)).rows[0] as { column_default: string }).column_default).toBe('false')
      await configurar()
      expect((await as('anon', null, () => db.query('select email_chave from public.notify_config'))).rows).toHaveLength(0)
      expect((await as('authenticated', ADMIN, () => db.query('select email_chave from public.notify_config'))).rows).toEqual([{ email_chave: 'segredo' }])
    })
  })
})
