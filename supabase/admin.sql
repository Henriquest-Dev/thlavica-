-- Cria (ou repõe) o administrador do painel, só com utilizador e palavra-passe.
-- Não é preciso criar nada em Authentication → Users nem usar email: o site junta
-- "@admin.tlhavika.local" ao utilizador por trás, e ninguém o vê.
--
-- Altere as duas linhas abaixo, cole no SQL Editor e execute. Pode correr de novo para trocar
-- a palavra-passe. NÃO guarde a palavra-passe real neste ficheiro nem no Git.
do $$
declare
  utilizador text := 'COLOQUE_O_UTILIZADOR';
  palavra_passe text := 'COLOQUE_A_PALAVRA_PASSE';

  email_interno text := lower(trim(utilizador)) || '@admin.tlhavika.local';
  uid uuid;
begin
  if utilizador like 'COLOQUE_%' or palavra_passe like 'COLOQUE_%' then
    raise exception 'Preencha o utilizador e a palavra-passe nas duas primeiras linhas.';
  end if;
  if length(palavra_passe) < 6 then
    raise exception 'A palavra-passe deve ter pelo menos 6 caracteres.';
  end if;

  select id into uid from auth.users where email = email_interno;

  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', email_interno,
      extensions.crypt(palavra_passe, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(),
      '', '', '', '', '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), uid, uid::text,
      jsonb_build_object('sub', uid::text, 'email', email_interno, 'email_verified', true),
      'email', now(), now(), now()
    );
  else
    update auth.users
       set encrypted_password = extensions.crypt(palavra_passe, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = uid;
  end if;

  insert into public.admins (user_id) values (uid) on conflict do nothing;
end
$$;

-- Confirme: deve devolver uma linha por administrador.
select u.email, a.created_at from public.admins a join auth.users u on u.id = a.user_id;
