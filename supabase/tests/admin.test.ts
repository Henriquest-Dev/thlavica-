import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'

/** `supabase/admin.sql` cria o administrador só com utilizador e palavra-passe (sem email visível). */

async function novaBase() {
  const db = new PGlite({ extensions: { pgcrypto } })
  await db.exec(`
    create schema extensions; create extension pgcrypto schema extensions;
    create publication supabase_realtime;
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (
      instance_id uuid, id uuid primary key, aud text, role text, email text unique, encrypted_password text,
      email_confirmed_at timestamptz, raw_app_meta_data jsonb, raw_user_meta_data jsonb,
      created_at timestamptz, updated_at timestamptz,
      confirmation_token text, recovery_token text, email_change_token_new text, email_change text,
      email_change_token_current text, phone_change text, phone_change_token text, reauthentication_token text
    );
    create table auth.identities (
      id uuid primary key, user_id uuid references auth.users (id), provider_id text, identity_data jsonb,
      provider text, last_sign_in_at timestamptz, created_at timestamptz, updated_at timestamptz
    );
    create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id serial primary key, bucket_id text, name text);
    alter table storage.objects enable row level security;
  `)
  await db.exec(readFileSync('supabase/migrations/20261009000000_inicio.sql', 'utf8'))
  return db
}
const script = (user: string, pass: string) =>
  readFileSync('supabase/admin.sql', 'utf8')
    .replace("'COLOQUE_O_UTILIZADOR'", `'${user}'`)
    .replace("'COLOQUE_A_PALAVRA_PASSE'", `'${pass}'`)

describe('admin.sql', { timeout: 60_000 }, () => {
  it('recusa correr com os valores por preencher', async () => {
    const db = await novaBase()
    await expect(db.exec(readFileSync('supabase/admin.sql', 'utf8'))).rejects.toThrow(/Preencha/)
  })

  it('cria o utilizador confirmado, com palavra-passe cifrada, e torna-o administrador', async () => {
    const db = await novaBase()
    await db.exec(script('Tlhavikadmin26', 'segredo-123'))
    const u = (await db.query(`select email, email_confirmed_at is not null as ok, encrypted_password = extensions.crypt('segredo-123', encrypted_password) as pw from auth.users`)).rows as { email: string; ok: boolean; pw: boolean }[]
    expect(u).toEqual([{ email: 'tlhavikadmin26@admin.tlhavika.local', ok: true, pw: true }])
    expect((await db.query('select count(*)::int as n from auth.identities')).rows).toEqual([{ n: 1 }])
    expect((await db.query('select count(*)::int as n from public.admins')).rows).toEqual([{ n: 1 }])
  })

  it('correr outra vez troca a palavra-passe sem duplicar nada', async () => {
    const db = await novaBase()
    await db.exec(script('admin1', 'primeira-1'))
    await db.exec(script('admin1', 'segunda-22'))
    const u = (await db.query(`select encrypted_password = extensions.crypt('segunda-22', encrypted_password) as novo, encrypted_password = extensions.crypt('primeira-1', encrypted_password) as velho from auth.users`)).rows
    expect(u).toEqual([{ novo: true, velho: false }])
    expect((await db.query('select count(*)::int as n from public.admins')).rows).toEqual([{ n: 1 }])
    expect((await db.query('select count(*)::int as n from auth.identities')).rows).toEqual([{ n: 1 }])
  })
})
