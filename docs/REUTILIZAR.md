# Como reutilizar este sistema noutro projeto

Guia escrito a partir do projeto da Tlhavika (site + painel de administração + Supabase). Serve para montar o mesmo
sistema num cliente novo (ex.: Blackline Performance) sem reconstruir tudo. **Não contém palavras-passe nem chaves.**

Quem usa o painel não é técnico (mulheres e pessoas sem conhecimentos de informática): tudo o que for técnico fica
escondido (modo técnico `?tecnico=1`), e as escolhas fazem-se por cliques, não por campos de texto.

## 1. O que o sistema faz

- **Site público** (React + Vite, em português de Portugal): páginas pré-renderizadas para o Google, catálogo, pesquisa,
  lista de cotação, simuladores, promoções (faixa, banner, pop-up) e formulário de pedido de cotação.
- **Painel de administração** (`/admin`, entrada pelo "© ano" do rodapé): resumo, cotações, catálogo, promoções, vídeos e
  fotos, contactos. Muito bom no telemóvel (barra fixa, separadores em baixo).
- **Base de dados** (Supabase): catálogo, promoções, pedidos, propostas, contactos, imagens, administradores.
- **Avisos**: cada pedido novo envia um email à empresa (sem instalar nada), com o link do WhatsApp do cliente.
- **Cotação em PDF**: gerada no navegador, no desenho do modelo da empresa, com logótipo e nome do cliente automáticos.
- **Preço e desconto por produto** (opcionais), com duração; o desconto passa ao pedido e à cotação.

## 2. Ordem para montar num projeto novo

1. Copiar o projeto base e trocar a identidade: nome, cores (`src/styles.css`, variáveis `:root`), logótipo
   (`public/img/logo-simbolo.svg`, `public/img/logo-cotacao.png`), textos (`src/data/site.ts`), catálogo de origem
   (`src/data/products.ts`), categorias e soluções.
2. Criar o projeto no Supabase. Guardar **a URL e a chave `publishable`** em `.env.<modo>` (nunca a `secret`/`service_role`
   nem a palavra-passe da base de dados). Ver `.env.example`.
3. No SQL Editor, correr por ordem `supabase/migrations/*.sql` e depois `supabase/admin.sql` (cria o administrador só com
   utilizador e palavra-passe, sem email visível; editar as duas primeiras linhas e **não gravar a palavra-passe no Git**).
   Cada ficheiro pode correr mais de uma vez. O `20261011` está superado pelo `20261012`.
4. Mudar nos SQL os endereços do site (`admin_url`, `icon_url` em `notify_config`) para o domínio do novo cliente.
5. Avisos por email (uma vez por cliente): criar um projeto em script.google.com, colar `supabase/apps-script/avisos.gs`,
   pôr uma chave comprida em `CHAVE`, implementar como **Aplicação Web, acesso: Qualquer pessoa**, autorizar (aviso "app não
   verificada": Avançadas → Ir para o projeto), copiar o endereço `/exec`. No painel (`?tecnico=1`): colar o endereço e a
   chave, o email que recebe, enviar o teste e ligar o interruptor. Mudar o email que recebe não exige repetir nada.
6. Desligar "Allow new users to sign up" (Authentication → Sign In / Providers) e trocar as palavras-passe depois dos testes.
7. `.env.<modo>` com `VITE_BASE_PATH`, `VITE_SITE_URL` e as duas do Supabase. `npm run build:<modo>` compila,
   pré-renderiza e gera `sitemap.xml` e `robots.txt`. Publicar a pasta `dist` (GitHub Pages: ramo `gh-pages` + `.nojekyll`).
8. Verificar: `node scripts/verificar-supabase.mjs <utilizador> <palavra-passe>` (com as variáveis do Supabase no ambiente).
9. Entregar: preencher em Contactos o NUIT e os dados de pagamento do cliente (só aparecem no PDF se preenchidos).

## 3. Arquitetura (o que copiar e porquê)

| Parte | Ficheiros | Ideia |
|---|---|---|
| Armazenamento | `src/lib/store.ts`, `sync.ts`, `supabase.ts` | Tudo passa por chaves `tlh:*` (`useStored`); `sync.ts` descarrega do servidor e envia só a diferença. Visitantes usam `fetch` direto à API REST (sem a biblioteca do Supabase); só o painel carrega o cliente. |
| Segurança | `supabase/migrations`, `supabase/tests` | RLS: leitura pública do que o site mostra; escrita só de administradores (`admins` + `is_admin()`); pedidos: qualquer visitante insere (só "nova"), só administradores leem. Limites de tamanho e máximo de pedidos por minuto. Testado em PGlite. |
| Painel | `src/admin/*` | `ui.tsx` (Panel, Field, Modal, Switch, Choice), `feedback.tsx` (toasts e confirmações), `tech.ts` (modo técnico). |
| Promoções | `src/lib/promos.ts`, `PromosAdmin.tsx`, `src/components/Promos.tsx` | Formulário por cliques; produtos escolhidos aparecem na faixa, banner e pop-up. |
| Preços | `src/lib/pricing.ts`, `catalogEdit.ts` | Preço e desconto opcionais, com data de fim que expira sozinha. |
| Cotação | `src/lib/proposal.ts`, `proposalPdf.ts`, `Quotes.tsx` | Totais com desconto por linha e IVA; PDF com jsPDF (carregado só ao descarregar). |
| WhatsApp | `src/lib/phone.ts` | Número → `wa.me` com 258 acrescentado quando falta. |
| SEO | `src/lib/seo.ts`, `scripts/prerender.mjs` | `useSeo` por página; o pré-renderizador abre cada rota e grava HTML estático (200 no GitHub Pages), sitemap, robots. |
| Avisos | `NotifyPanel.tsx`, `notify.ts`, `avisos.gs`, migrações 12 e 13 | Trigger na BD (`pg_net`) chama o script do Google, que envia o email. Falhas nunca impedem o pedido. |

## 4. Armadilhas já encontradas (não repetir)

- **Cache de leitura**: `read()` não pode guardar em cache o valor por omissão de quem pergunta (dois leitores da mesma chave com
  omissões diferentes davam `null` e o painel rebentava depois do login). Já corrigido em `store.ts`.
- **Animação de entrada (`reveal`)** só observa o que existe ao montar: um elemento que chega depois (promoção vinda do
  servidor) ficava invisível. Não pôr `reveal` em conteúdo carregado depois.
- **CSP** (meta no build) apanhou bugs reais: precisa de `font-src data:`, e o HTML pré-renderizado não pode levar o endereço
  do servidor local (substituir a origem no pré-renderizador). Testar sempre com a CSP ativa.
- **GitHub Pages**: o `robots.txt` só é lido na raiz do domínio; submeter o `sitemap.xml` no Search Console, ou usar domínio
  próprio. Rotas sem ficheiro respondem 404, por isso pré-renderizar cada rota. Produtos novos pedem novo build.
- **Apps Script**: o "Quem tem acesso" tem de ser "Qualquer pessoa"; a autorização pode acabar numa página de erro do Drive
  (normal): abrir Deploy → Manage deployments e copiar o endereço. O editor é difícil no telemóvel.
- **Migrações em testes**: se um teste volta a aplicar uma migração antiga depois da nova, a função fica desatualizada.
  Reaplicar sempre a mais recente.
- **Restrições SQL com NULL**: um `CHECK` deixa passar NULL. Usar `coalesce(..., false)` para campos obrigatórios.
- **`pkill -f` dentro do próprio comando** mata o comando (o texto do `pkill` casa consigo mesmo): fazer noutra chamada.
- **Dados de teste**: apagar sempre o que o teste criou (pedidos, promoções, imagens no Storage) e nunca o que é do cliente.
- **Texto para o cliente final**: sem prazos nem garantias inventados; NUIT, dados bancários e preços só os que a empresa confirmar.

## 5. O que perguntar ao cliente novo antes de começar

Nome legal e NUIT; morada e contactos; logótipo; catálogo (produtos, fotos com fundo limpo); modelo de cotação em PDF;
quem recebe os avisos (email); se há domínio próprio; textos que não podem aparecer; quem usa o painel e em que aparelho.

## 6. Como pedir isto a uma nova sessão

Abrir o novo projeto, dar este ficheiro e dizer: *"Monta o mesmo sistema da Tlhavika para <cliente>: copia a
arquitetura do `docs/REUTILIZAR.md`, troca a identidade e o catálogo, e gera os SQL por ordem."*
