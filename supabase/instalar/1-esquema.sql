-- PASSO 1 de 3 — Esquema e segurança (tabelas, regras de acesso, fotos, limites, avisos).
-- Cole TUDO no Supabase → SQL Editor e carregue em Run. Não precisa de editar nada. Pode correr de novo sem problema.
-- Gerado a partir de supabase/migrations (as migrações 1, 2, 4 e 5; a 3 está substituída pela 4).

-- ===== 20261009000000_inicio.sql =====
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

-- ===== 20261010000000_antiabuso.sql =====
-- Proteção dos pedidos de cotação contra lixo e spam. Pode ser executado mais de uma vez.
--
-- 1. Cada pedido tem de ter nome e telefone e não pode ter campos gigantes.
-- 2. No máximo 60 pedidos em 10 minutos em todo o site (acima disso, o servidor recusa e o site
--    guarda o pedido para tentar mais tarde). Um visitante normal nunca chega perto disto.

alter table public.quote_requests drop constraint if exists quote_requests_campos;
alter table public.quote_requests add constraint quote_requests_campos check (
  char_length(id) <= 64
  -- coalesce: um campo em falta dá NULL, e um CHECK deixa passar NULL; aqui tem de reprovar
  and coalesce(jsonb_typeof(data -> 'nome') = 'string' and char_length(data ->> 'nome') between 1 and 120, false)
  and coalesce(jsonb_typeof(data -> 'telefone') = 'string' and char_length(data ->> 'telefone') between 3 and 40, false)
  and coalesce(char_length(data ->> 'local') <= 160, true)
  and coalesce(char_length(data ->> 'mensagem') <= 3000, true)
) not valid;  -- "not valid": vale para pedidos novos e alterados; não reprova os que já existem

create index if not exists quote_requests_created_idx on public.quote_requests (created_at desc);

-- security definer: o visitante não pode ler a tabela, mas a contagem tem de ver todos os pedidos
create or replace function public.limitar_pedidos() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if (select count(*) from public.quote_requests where created_at > now() - interval '10 minutes') >= 60 then
    raise exception 'Demasiados pedidos neste momento. Tente novamente dentro de alguns minutos.' using errcode = 'P0001';
  end if;
  return new;
end
$$;
revoke all on function public.limitar_pedidos() from public;

drop trigger if exists limitar_pedidos on public.quote_requests;
create trigger limitar_pedidos before insert on public.quote_requests
  for each row execute function public.limitar_pedidos();

-- ===== 20261012000000_avisos_email.sql =====
-- Avisos de novos pedidos de cotação por EMAIL (e, opcionalmente, ntfy). Pode ser executado mais de uma vez.
-- Este ficheiro é completo: não é preciso ter corrido o 20261011 antes.
--
-- Quando um visitante envia um pedido, a base de dados chama um pequeno script do Google (Apps Script, gratuito)
-- que envia um email à empresa. Nada para instalar. O ntfy (app no telemóvel) fica como opção para quem quiser.
-- Um aviso que falhe NUNCA impede o pedido de ser guardado.

do $$
begin
  create extension if not exists pg_net with schema extensions;
exception when others then
  raise notice 'pg_net não ficou ativo (%). Ative-o em Database → Extensions e volte a executar este ficheiro.', sqlerrm;
end
$$;

create table if not exists public.notify_config (
  id integer primary key check (id = 1),                 -- uma só linha
  ativo boolean not null default false,                   -- ntfy (opcional)
  ntfy_server text not null default 'https://ntfy.sh',
  ntfy_topic text not null,
  ntfy_token text,
  admin_url text not null default 'https://henriquest-dev.github.io/thlavica-/admin/cotacoes/',
  icon_url text not null default 'https://henriquest-dev.github.io/thlavica-/icon-192.png',
  updated_at timestamptz not null default now()
);

-- primeira execução deste ficheiro: o ntfy passa a ser opcional (fica desligado)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'notify_config')
     and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'notify_config' and column_name = 'email_ativo') then
    update public.notify_config set ativo = false;
  end if;
end
$$;

alter table public.notify_config alter column ativo set default false;
alter table public.notify_config add column if not exists icon_url text not null default 'https://henriquest-dev.github.io/thlavica-/icon-192.png';
alter table public.notify_config add column if not exists email_ativo boolean not null default false;
alter table public.notify_config add column if not exists email_url text;      -- endereço do script do Google
alter table public.notify_config add column if not exists email_chave text;     -- chave combinada com o script
alter table public.notify_config add column if not exists email_para text;      -- emails que recebem o aviso (separados por vírgula)
alter table public.notify_config enable row level security;

drop policy if exists "administradores gerem avisos" on public.notify_config;
create policy "administradores gerem avisos" on public.notify_config
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop trigger if exists set_updated_at on public.notify_config;
create trigger set_updated_at before update on public.notify_config
  for each row execute function public.set_updated_at();

insert into public.notify_config (id, ntfy_topic)
values (1, 'tlhavika-' || replace(gen_random_uuid()::text, '-', ''))
on conflict (id) do nothing;

create or replace function public.notificar_pedido() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  c public.notify_config%rowtype;
  quem text;
  texto text;
begin
  select * into c from public.notify_config where id = 1;
  if c.id is null then
    return new;
  end if;

  quem := concat_ws(' · ', nullif(new.data ->> 'nome', ''), nullif(new.data ->> 'local', ''));

  -- 1) email (via Google Apps Script)
  if c.email_ativo is true and coalesce(c.email_url, '') <> '' and coalesce(c.email_para, '') <> '' then
    begin
      texto := concat_ws(E'\n',
        'Chegou um novo pedido de cotação pelo site.',
        '',
        'Nome: ' || coalesce(new.data ->> 'nome', '-'),
        'Telefone: ' || coalesce(new.data ->> 'telefone', '-'),
        'Local: ' || coalesce(new.data ->> 'local', '-'),
        'Uso: ' || coalesce(new.data ->> 'uso', '-'),
        case when coalesce(new.data ->> 'interesse', '') <> '' then 'Interesse: ' || (new.data ->> 'interesse') end,
        case when coalesce(new.data ->> 'mensagem', '') <> '' then 'Mensagem: ' || (new.data ->> 'mensagem') end,
        '',
        'Para responder, abra o painel: ' || c.admin_url
      );
      perform net.http_post(
        url := c.email_url,
        body := jsonb_build_object(
          'chave', coalesce(c.email_chave, ''),
          'para', c.email_para,
          'assunto', 'Tlhavika: novo pedido de cotação' || coalesce(' — ' || nullif(quem, ''), ''),
          'texto', texto
        ),
        headers := jsonb_build_object('Content-Type', 'application/json')
      );
    exception when others then
      null;
    end;
  end if;

  -- 2) ntfy (opcional, app no telemóvel)
  if c.ativo is true and coalesce(c.ntfy_topic, '') <> '' then
    begin
      perform net.http_post(
        url := c.ntfy_server,
        body := jsonb_build_object(
          'topic', c.ntfy_topic,
          'title', 'Tlhavika: novo pedido de cotação',
          'message', coalesce(nullif(quem, ''), 'Abra o painel para ver o pedido.'),
          'priority', 4,
          'tags', jsonb_build_array('bell'),
          'click', c.admin_url,
          'icon', c.icon_url
        ),
        headers := jsonb_build_object('Content-Type', 'application/json')
          || case when coalesce(c.ntfy_token, '') <> '' then jsonb_build_object('Authorization', 'Bearer ' || c.ntfy_token) else '{}'::jsonb end
      );
    exception when others then
      null;
    end;
  end if;

  return new;
end
$$;
revoke all on function public.notificar_pedido() from public;

drop trigger if exists notificar_pedido on public.quote_requests;
create trigger notificar_pedido after insert on public.quote_requests
  for each row execute function public.notificar_pedido();

-- ===== 20261013000000_email_whatsapp.sql =====
-- O email de aviso passa a levar o link do WhatsApp do cliente (um toque abre a conversa).
-- Pode ser executado mais de uma vez. Precisa de o 20261012 já ter sido executado.

create or replace function public.notificar_pedido() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  c public.notify_config%rowtype;
  quem text;
  texto text;
  wa text;
begin
  select * into c from public.notify_config where id = 1;
  if c.id is null then
    return new;
  end if;

  quem := concat_ws(' · ', nullif(new.data ->> 'nome', ''), nullif(new.data ->> 'local', ''));

  -- número só com dígitos e com o 258 à frente quando falta (como no site), para o link do WhatsApp
  wa := regexp_replace(regexp_replace(coalesce(new.data ->> 'telefone', ''), '\D', '', 'g'), '^00', '');
  if length(wa) = 9 and wa like '8%' then
    wa := '258' || wa;
  end if;

  -- 1) email (via Google Apps Script)
  if c.email_ativo is true and coalesce(c.email_url, '') <> '' and coalesce(c.email_para, '') <> '' then
    begin
      texto := concat_ws(E'\n',
        'Chegou um novo pedido de cotação pelo site.',
        '',
        'Nome: ' || coalesce(new.data ->> 'nome', '-'),
        'Telefone: ' || coalesce(new.data ->> 'telefone', '-'),
        case when length(wa) between 10 and 15 then 'Falar no WhatsApp: https://wa.me/' || wa end,
        'Local: ' || coalesce(new.data ->> 'local', '-'),
        'Uso: ' || coalesce(new.data ->> 'uso', '-'),
        case when coalesce(new.data ->> 'interesse', '') <> '' then 'Interesse: ' || (new.data ->> 'interesse') end,
        case when coalesce(new.data ->> 'mensagem', '') <> '' then 'Mensagem: ' || (new.data ->> 'mensagem') end,
        '',
        'Para responder, abra o painel: ' || c.admin_url
      );
      perform net.http_post(
        url := c.email_url,
        body := jsonb_build_object(
          'chave', coalesce(c.email_chave, ''),
          'para', c.email_para,
          'assunto', 'Tlhavika: novo pedido de cotação' || coalesce(' — ' || nullif(quem, ''), ''),
          'texto', texto
        ),
        headers := jsonb_build_object('Content-Type', 'application/json')
      );
    exception when others then
      null;
    end;
  end if;

  -- 2) ntfy (opcional, app no telemóvel)
  if c.ativo is true and coalesce(c.ntfy_topic, '') <> '' then
    begin
      perform net.http_post(
        url := c.ntfy_server,
        body := jsonb_build_object(
          'topic', c.ntfy_topic,
          'title', 'Tlhavika: novo pedido de cotação',
          'message', coalesce(nullif(quem, ''), 'Abra o painel para ver o pedido.'),
          'priority', 4,
          'tags', jsonb_build_array('bell'),
          'click', c.admin_url,
          'icon', c.icon_url
        ),
        headers := jsonb_build_object('Content-Type', 'application/json')
          || case when coalesce(c.ntfy_token, '') <> '' then jsonb_build_object('Authorization', 'Bearer ' || c.ntfy_token) else '{}'::jsonb end
      );
    exception when others then
      null;
    end;
  end if;

  return new;
end
$$;
revoke all on function public.notificar_pedido() from public;

drop trigger if exists notificar_pedido on public.quote_requests;
create trigger notificar_pedido after insert on public.quote_requests
  for each row execute function public.notificar_pedido();

