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
