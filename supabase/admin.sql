-- Passo manual, depois de criar o utilizador do painel em Authentication → Users
-- ("Add user" → "Create new user", email <utilizador>@admin.tlhavika.local, com "Auto Confirm User").
-- Torna administradores os utilizadores confirmados desse domínio. Não leva palavra-passe:
-- esta fica só no Supabase.
--
-- Cole no SQL Editor e execute.
insert into public.admins (user_id)
select id from auth.users
where email like '%@admin.tlhavika.local' and email_confirmed_at is not null
on conflict do nothing;

-- Confirme: deve devolver uma linha por administrador.
select u.email, a.created_at from public.admins a join auth.users u on u.id = a.user_id;
