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
