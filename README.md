# Tlhavika — website

Vite + React + TypeScript. Conteúdo base em `src/data/site.ts` e `src/data/products.ts`.

```bash
npm install
npm run dev            # desenvolvimento
npm run build          # dist/ para Netlify (index.html na raiz)
npm run build:ghpages  # dist/ para GitHub Pages (subcaminho /thlavica-/)
npm test               # testes dos módulos de src/lib (vitest)
npm run images         # regenera public/img a partir de source-assets/ (Python + Pillow)
```

## O que tem

- **Início:** cartaz da Tlhavika (`public/img/banner-*.webp`) a toda a largura; as três áreas (Solar, Bombas, Água quente) ficam por cima do cartaz, com fade; no telemóvel o cartaz desliza para o lado. Por baixo: título, passos do pedido, fotografia que se divide em três cartões (computador) ou cartões empilhados (telemóvel), produtos em destaque, simuladores, marcas e perguntas frequentes.
- **Menu:** Catálogo, Serviços, Aplicações, Sobre, Pedir cotação; pesquisa rápida (tecla `/` ou `Ctrl+K`) e lista de cotação.
- **Serviços:** as três áreas de trabalho e dois simuladores (energia solar; bomba de água). Os resultados são estimativas orientativas e seguem para o pedido de cotação.
- **Lista de cotação:** o visitante junta produtos e envia por WhatsApp ou formulário. O pedido também fica guardado para o painel (neste dispositivo).
- **Ícones:** conjunto próprio em `src/components/Ico.tsx` (sem biblioteca).

## Administração (protótipo) — `/admin`

Entrada com utilizador e palavra-passe verificados no navegador (só o hash está no código; para mudar: `node scripts/admin-hash.mjs <utilizador> <palavra-passe>` e colar o resultado em `CREDENTIAL_HASH`, `src/lib/adminSession.ts`). Não é segurança a sério: quem tiver o código pode tentar adivinhar offline; a proteção real vem com contas no Supabase. Os dados ficam no `localStorage` do navegador (prefixo `tlh:`), em `src/lib/store.ts`.

| Secção | O que faz |
|---|---|
| Resumo | Números, atalhos, exportar/importar/apagar dados (JSON). |
| Cotações | Pedidos recebidos (formulário, simulador, lista), estados, preparação de cotações com preços e IVA, copiar texto, WhatsApp, imprimir/PDF. |
| Catálogo | Adicionar produtos, editar os existentes, enviar imagens (reduzidas a 900 px), ocultar, repor o original. |
| Promoções | Faixa no topo, banner na página inicial e pop-up, com datas de início/fim e pré-visualização. |
| Vídeos e fotos | Carrossel automático do painel: imagens, YouTube e MP4 por endereço; ordem, pausa e remoção. |
| Contactos | Telefone, WhatsApp, email, morada e Facebook que aparecem no site (rodapé, Contacto, Sobre e links do WhatsApp). |

Para ligar ao Supabase: trocar `readRaw`/`writeStored` em `src/lib/store.ts` por chamadas à base de dados (os hooks `useStored`, `useCatalog`, `useMedia`, `usePromos` e `useQuoteList` mantêm-se) e passar os dados com "Exportar dados".

## Ligação ao Supabase

Sem variáveis de ambiente, tudo funciona só neste navegador (protótipo). Com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (ver `.env.example`), o site lê e o painel grava no Supabase.

Preparar o projeto (uma vez):

1. **Esquema e segurança:** `supabase login`, `supabase link --project-ref ezmbcwaxcjumgucbatpg` e `supabase db push` (a pasta `supabase/` já existe: não correr `supabase init`). Ou colar no SQL Editor, por ordem, `supabase/migrations/20261009000000_inicio.sql` (esquema e segurança) e `20261010000000_antiabuso.sql` (limites dos pedidos e máximo de 60 pedidos em 10 minutos).
2. **Administrador (sem email):** abrir `supabase/admin.sql`, preencher o utilizador e a palavra-passe nas duas primeiras linhas e executar no SQL Editor. Cria o utilizador e torna-o administrador; correr de novo troca a palavra-passe. O painel pede só utilizador e palavra-passe; o domínio interno `@admin.tlhavika.local` é acrescentado por trás. Não guardar a palavra-passe no Git.
3. **Recomendado:** Authentication → Sign In / Providers → Email → desligar "Allow new users to sign up".
4. Pôr as duas variáveis em `.env.ghpages` (ou `.env.local`) e voltar a compilar.

O que o site pode ler sem conta: catálogo, promoções, vídeos e contactos. Qualquer visitante pode **enviar** um pedido de cotação, mas só administradores o leem. Propostas e escrita no site: só administradores (tabela `admins`). Imagens: balde público `site`, só administradores enviam. `supabase/tests/migracao.test.ts` confirma estas regras num Postgres em memória.

Os dados do protótipo que estiverem no aparelho do administrador sobem para o Supabase na primeira entrada (se o servidor estiver vazio). Se um envio falhar (sem rede), fica marcado como "por guardar" e repete-se; os pedidos dos visitantes sem rede ficam numa caixa de saída e seguem na visita seguinte.

Nunca pôr no código nem no repositório a palavra-passe da base de dados nem a chave `secret`/`service_role`.

Os visitantes não carregam a biblioteca do Supabase: leem o catálogo e enviam pedidos com `fetch` direto à API REST (`publicSelect`/`publicInsert` em `supabase.ts`). A biblioteca só carrega no painel.

## Avisos de novos pedidos por email

A empresa não quer instalar apps: quando um visitante envia um pedido de cotação, a base de dados avisa por **email** (para o Gmail da empresa) e a empresa abre o painel e responde ao cliente. Nada para instalar. É gratuito: o email sai de um pequeno script do Google (Apps Script) chamado pela base de dados (`pg_net`).

Instalação (uma vez por site, ~5 minutos):

1. No SQL Editor do Supabase, executar `supabase/migrations/20261012000000_avisos_email.sql` (completo; não precisa do 20261011).
2. Em [script.google.com](https://script.google.com) → **Novo projeto**, colar `supabase/apps-script/avisos.gs` e trocar `COLOQUE_AQUI_UMA_CHAVE_COMPRIDA` por uma chave comprida (anotá-la).
3. **Implementar → Nova implementação → Aplicação Web**, "Quem tem acesso": **Qualquer pessoa**. Autorizar (o Google avisa que a app não está verificada: Avançadas → Ir para o projeto). Copiar o endereço que termina em `/exec`.
4. No painel: **Contactos → Avisos de novos pedidos por email** → colar o endereço e a chave, confirmar o email da empresa, **Guardar**, **Enviar email de teste**, e ligar o interruptor.

O script usa a conta Google de quem o criou para enviar: criá-lo com a conta Gmail da empresa evita depender de uma conta pessoal. O email leva nome, telefone, local, uso e mensagem do pedido e a ligação ao painel. Se o aviso falhar, o pedido guarda-se na mesma. O script só envia se a chave estiver certa (e para no máximo 5 emails válidos).

Opcional, para técnicos: o mesmo trigger também pode avisar pelo ntfy (app no telemóvel), desligado por omissão (secção no fim de Contactos). Com o painel aberto, `QuoteWatcher` mostra um aviso e o número de pedidos novos no título do separador.

## SEO e publicação

`npm run build:ghpages` compila, **pré-renderiza** cada página (`scripts/prerender.mjs`) e gera `sitemap.xml` e `robots.txt`. Cada rota passa a ter o seu `index.html` com título, descrição, endereço canónico, Open Graph/Twitter, dados estruturados (LocalBusiness, WebSite, FAQPage, Product, BreadcrumbList) e o conteúdo, e responde com 200 (o GitHub Pages devolveria 404 às rotas só de JavaScript). O `<head>` de cada página vem de `useSeo` em `src/lib/seo.ts`.

- As rotas descobrem-se seguindo as ligações a partir da página inicial. As páginas de produto e de categoria usam os produtos e contactos **publicados no Supabase** à hora do build: depois de criar ou editar produtos no painel, voltar a correr `npm run build:ghpages` e publicar, para o Google ver as páginas novas.
- Precisa do Playwright com Chromium (`CHROMIUM_PATH` se não estiver no sítio habitual). `VITE_SITE_URL` (em `.env.ghpages`) define o endereço público usado no canónico e no sitemap.
- **Domínio próprio:** o Google só lê `robots.txt` na raiz do domínio. Em `…github.io/thlavica-/` o ficheiro não é lido; submeter `sitemap.xml` no Google Search Console resolve, e um domínio próprio é o ideal (mudar `VITE_SITE_URL` e `VITE_BASE_PATH`).
- Segurança do site: política de segurança de conteúdo (meta `Content-Security-Policy`, só no build), ligações sociais só `https`, campos do formulário com limite de tamanho, campo-isco anti-robôs e limite de pedidos no servidor. O GitHub Pages não permite cabeçalhos HTTP próprios (HSTS, X-Frame-Options); um domínio atrás do Cloudflare ou Netlify permite-os.

## Estrutura (módulos em `src/lib`)

Cada módulo tem uma interface pequena e esconde a lógica; os testes (`*.test.ts`) passam pela interface.

| Módulo | Interface | Esconde |
|---|---|---|
| `store.ts` | `useStored`, `writeStored`, `updateStored`, `exportData`, `importData`, `clearData`, `usageKb` | O adaptador de armazenamento (localStorage; memória nos testes; Supabase depois), a cache e a lista de chaves do painel |
| `sizing.ts` | `sizeSolar`, `sizePump`, `matchPumps`, `solarMessage`, `pumpMessage` | Pressupostos e fórmulas dos simuladores |
| `proposal.ts` | `newProposal`, `proposalTotals`, `proposalMessage`, `nextNumber` | Numeração, IVA e texto da cotação |
| `catalog.ts` / `catalogEdit.ts` | `useCatalog`, `useCatalogEditor` | Como se juntam produtos de origem, edições e produtos criados no painel |
| `sync.ts` / `supabase.ts` | `startSync`, `pullNow`, `submitQuote`, `setAdminSession`, `useSyncStatus` | Descarregar o servidor para as chaves de `store.ts`, enviar só a diferença do que o administrador grava, repetir o que falhou |
| `images.ts` | `saveImage` | Reduzir a imagem e guardá-la no balde `site` (ou como data URL sem Supabase) |
| `adminAuth.ts` | `signInAdmin`, `restoreAdmin`, `signOutAdmin` | Supabase Auth com verificação de `admins`, ou o resumo local sem Supabase |
| `quotes.ts` | `useQuoteList`, `saveQuoteRequest` | Lista de cotação do visitante e caixa de entrada do painel |

## Identidade

Cores das publicações da Tlhavika: azul-marinho `#0e2f57`, azul `#124e97`, âmbar `#f4b045` e laranja `#ef7d24`. O símbolo da lâmpada (`public/img/logo-simbolo.svg`) foi reconstruído em vetor; substituir pelo ficheiro original quando existir.

## Assets

| Ficheiro | Origem |
|---|---|
| `banner-*` | Cartaz enviado pela Tlhavika (completo, 1200, 800 e a metade esquerda) |
| `foto-15/16/17/34` | Facebook Tlhavika, ampliadas x4 com Real-ESRGAN (`source-assets/ampliadas`) |
| `produtos/*` | Produtos recortados (BiRefNet) dos anúncios ampliados (`source-assets/produtos`) |

## Por confirmar com a Tlhavika

1. Logótipo oficial em vetor.
2. Contactos: +258 87 119 1481, Tlhavika.solar@gmail.com e morada.
3. Preços, stock, garantias e serviços (instalação, assistência) — não são afirmados no site.
