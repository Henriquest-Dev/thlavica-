-- Tlhavika: esquema inicial. Pode ser executado mais de uma vez sem dar erro.
--
-- Leitura pública: catálogo, promoções, vídeos e contactos (o que o site mostra).
-- Escrita: só administradores (tabela `admins`).
-- Pedidos de cotação: qualquer visitante pode enviar um; só administradores os leem.
-- Propostas: só administradores.
-- Imagens: balde público `site`; só administradores enviam.

-- ---------------------------------------------------------------- administradores
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()))
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Cada administrador só vê a sua própria linha. Não há políticas de escrita:
-- novos administradores entram por SQL (ver supabase/admin.sql).
drop policy if exists "administrador vê a sua linha" on public.admins;
create policy "administrador vê a sua linha" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- tabelas de dados
-- Todas têm a mesma forma: um identificador, o documento em JSON (tal como o site o usa),
-- a posição (ordem de apresentação) e datas. O JSON dispensa uma migração a cada campo novo.
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create table if not exists public.catalog_products (   -- produtos criados no painel
  id text primary key,
  data jsonb not null,
  pos integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.catalog_overrides (  -- edições a produtos de origem (id = id do produto)
  id text primary key,
  data jsonb not null,
  pos integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.promos (
  id text primary key,
  data jsonb not null,
  pos integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.media_items (        -- carrossel de fotografias e vídeos
  id text primary key,
  data jsonb not null,
  pos integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.site_settings (      -- contactos do site (id = 'contactos')
  id text primary key,
  data jsonb not null,
  pos integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.proposals (          -- cotações preparadas
  id text primary key,
  data jsonb not null,
  pos integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.quote_requests (     -- pedidos de cotação dos visitantes
  id text primary key,
  data jsonb not null,
  pos integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_requests_pequeno check (octet_length(data::text) < 20000),
  constraint quote_requests_objeto check (jsonb_typeof(data) = 'object')
);

-- Segurança por linhas e data de atualização em todas
do $$
declare t text;
begin
  foreach t in array array['catalog_products','catalog_overrides','promos','media_items','site_settings','proposals','quote_requests']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end
$$;

-- Leitura pública, escrita só de administradores
do $$
declare t text;
begin
  foreach t in array array['catalog_products','catalog_overrides','promos','media_items','site_settings']
  loop
    execute format('drop policy if exists "leitura pública" on public.%I', t);
    execute format('create policy "leitura pública" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "administradores escrevem" on public.%I', t);
    execute format('create policy "administradores escrevem" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end
$$;

-- Só administradores
drop policy if exists "administradores gerem propostas" on public.proposals;
create policy "administradores gerem propostas" on public.proposals
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Pedidos: qualquer visitante envia (sempre como "nova"); só administradores leem e gerem.
drop policy if exists "qualquer visitante envia pedidos" on public.quote_requests;
create policy "qualquer visitante envia pedidos" on public.quote_requests
  for insert to anon, authenticated
  with check (data ->> 'estado' = 'nova');
drop policy if exists "administradores gerem pedidos" on public.quote_requests;
create policy "administradores gerem pedidos" on public.quote_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- imagens
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site', 'site', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- O balde é público: os ficheiros abrem por endereço, sem política de leitura (não se pode listar).
drop policy if exists "administradores enviam imagens" on storage.objects;
create policy "administradores enviam imagens" on storage.objects
  for insert to authenticated with check (bucket_id = 'site' and public.is_admin());
drop policy if exists "administradores trocam imagens" on storage.objects;
create policy "administradores trocam imagens" on storage.objects
  for update to authenticated using (bucket_id = 'site' and public.is_admin());
drop policy if exists "administradores apagam imagens" on storage.objects;
create policy "administradores apagam imagens" on storage.objects
  for delete to authenticated using (bucket_id = 'site' and public.is_admin());
