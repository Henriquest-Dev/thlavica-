-- Avisos de novos pedidos de cotação (telemóvel e computador), com o ntfy (gratuito). Pode ser executado mais de uma vez.
--
-- Quando um visitante envia um pedido, a base de dados faz um POST ao ntfy.sh (via pg_net) e quem estiver
-- subscrito ao "tópico" recebe a notificação no Android, no iOS ou no computador. O tópico funciona como uma
-- palavra-passe: quem o souber pode receber (e enviar) avisos, por isso é gerado ao acaso e só os administradores o veem.
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
  ativo boolean not null default true,
  ntfy_server text not null default 'https://ntfy.sh',
  ntfy_topic text not null,
  ntfy_token text,                                        -- opcional: token de uma conta gratuita no ntfy (limite por conta e não por IP)
  admin_url text not null default 'https://henriquest-dev.github.io/thlavica-/admin/cotacoes/',
  updated_at timestamptz not null default now()
);
alter table public.notify_config enable row level security;

drop policy if exists "administradores gerem avisos" on public.notify_config;
create policy "administradores gerem avisos" on public.notify_config
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop trigger if exists set_updated_at on public.notify_config;
create trigger set_updated_at before update on public.notify_config
  for each row execute function public.set_updated_at();

-- tópico aleatório (128 bits), criado aqui e nunca guardado no Git
insert into public.notify_config (id, ntfy_topic)
values (1, 'tlhavika-' || replace(gen_random_uuid()::text, '-', ''))
on conflict (id) do nothing;

create or replace function public.notificar_pedido() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  c public.notify_config%rowtype;
  quem text;
begin
  select * into c from public.notify_config where id = 1;
  if c.id is null or c.ativo is not true or coalesce(c.ntfy_topic, '') = '' then
    return new;
  end if;

  quem := concat_ws(' · ', nullif(new.data ->> 'nome', ''), nullif(new.data ->> 'local', ''));

  begin
    perform net.http_post(
      url := c.ntfy_server,
      body := jsonb_build_object(
        'topic', c.ntfy_topic,
        'title', 'Novo pedido de cotação',
        'message', coalesce(nullif(quem, ''), 'Abra o painel para ver o pedido.'),
        'priority', 4,
        'tags', jsonb_build_array('bell'),
        'click', c.admin_url
      ),
      headers := jsonb_build_object('Content-Type', 'application/json')
        || case when coalesce(c.ntfy_token, '') <> '' then jsonb_build_object('Authorization', 'Bearer ' || c.ntfy_token) else '{}'::jsonb end
    );
  exception when others then
    null;  -- sem rede, sem pg_net ou ntfy em baixo: o pedido guarda-se na mesma
  end;

  return new;
end
$$;
revoke all on function public.notificar_pedido() from public;

drop trigger if exists notificar_pedido on public.quote_requests;
create trigger notificar_pedido after insert on public.quote_requests
  for each row execute function public.notificar_pedido();
