-- PASSO 3 de 3 — Liga os avisos por email dos pedidos novos (Google Apps Script).
-- Altere só as DUAS linhas marcadas e execute. O email que recebe já está preenchido (pode pôr até 5, separados por vírgula).
-- Pode correr de novo para mudar o destinatário. Não guarde a chave verdadeira no Git.
do $$
declare
  endereco_script text := 'COLOQUE_AQUI_O_ENDERECO_DO_SCRIPT';   -- 1) o endereço que termina em /exec
  chave text := 'COLOQUE_AQUI_A_CHAVE';                        -- 2) a mesma chave que está no script do Google
  quem_recebe text := 'tlhavika.solar@gmail.com';
begin
  if endereco_script like 'COLOQUE_%' or chave like 'COLOQUE_%' then
    raise exception 'Preencha o endereço do script e a chave nas duas primeiras linhas.';
  end if;
  if endereco_script !~ '^https://script\.google\.com/.+/exec$' then
    raise exception 'O endereço do script deve começar por https://script.google.com e acabar em /exec.';
  end if;
  update public.notify_config
     set email_url = endereco_script, email_chave = chave, email_para = quem_recebe,
         email_ativo = true, updated_at = now()
   where id = 1;
end
$$;

-- Confirme: deve mostrar email_ativo = true e o email da Tlhavika.
select email_ativo, email_para, left(email_url, 40) as endereco from public.notify_config;
