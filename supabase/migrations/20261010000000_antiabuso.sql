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
