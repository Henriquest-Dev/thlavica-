# TLHAVIKA — website

Site comercial da Tlhavika (energia solar e água, Moçambique). Vite + React + TypeScript, CSS próprio e dados locais editáveis.

## Comandos

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:5173
npm run build      # gera dist/ (index.html na raiz)
npm run preview    # serve dist/ localmente
npm run images     # regenera as imagens WebP a partir de source-assets/ (requer Python + Pillow)
```

## Configuração (`.env`, ver `.env.example`)

| Variável | Uso |
|---|---|
| `VITE_SITE_URL` | Domínio final. Sem ele não se gera `sitemap.xml` nem URLs canónicos. |
| `VITE_FORM_MODE` | `netlify` (Netlify Forms) ou `endpoint` (POST JSON para `VITE_FORM_ENDPOINT`). Vazio = envio desativado. |
| `VITE_FORM_ENDPOINT` | URL do serviço de formulários quando `VITE_FORM_MODE=endpoint`. |
| `VITE_SHOW_UNVERIFIED_SPECS` | `false` esconde as especificações ainda não validadas. |

Os formulários só mostram sucesso quando o servidor responde 2xx. Sem destino configurado, o utilizador vê que a mensagem **não** foi enviada e pode enviá-la por WhatsApp ou email com os dados já preenchidos.

## Publicar na Netlify

- **Com Git:** `netlify.toml` já define o build, o redirect SPA e `VITE_FORM_MODE=netlify`.
- **Upload manual:** criar `.env` com `VITE_FORM_MODE=netlify` (e `VITE_SITE_URL`), correr `npm run build` e arrastar a pasta `dist/`. O `_redirects` para as rotas SPA já vai incluído.
- Ativar a deteção de formulários em *Site settings → Forms*. Os formulários estáticos (`cotacao`, `grosso`, `fornecedor`) estão em `index.html`.

## Onde editar

- `src/data/products.ts` — catálogo (categorias, produtos, especificações, imagens, fontes, estado de validação), faixas de potência e estudos de caso.
- `src/data/segments.ts` — percursos de cliente (Soluções).
- `src/config/site.ts` — contactos, logótipo, redes e serviços confirmados.
- `source-assets/` — pacote original (anúncios, recorte da bomba, frames SVG, `fontes.csv`).

## Animações

- **Hero Dia/Noite** (`src/components/hero/`): uma única cena vetorial com duas paletas sobrepostas, por isso a casa nunca muda de posição. A transição reproduz a coreografia do vídeo de referência: a câmara desce, a névoa sobe do chão, a luz muda a meio e a cena regressa (cerca de 1 s, Web Animations API). Suporta teclado (setas).
- **Captar → Armazenar → Utilizar** (`EnergyStory`): secção sticky de 240vh (200vh no telemóvel). O scroll comanda uma câmara que percorre um diagrama único, desenha os cabos e enche a bateria e o depósito.
- **Bomba e bombagem solar** (`PumpStory`): 220vh (180vh no telemóvel). Interpola continuamente as posições dos 12 SVG de `frames/` (um só `<img>` com `transform`, sem carregar 12 ficheiros) e depois transita para uma aplicação numa machamba, com ligação ao catálogo.
- Tudo com `requestAnimationFrame`, `transform`/`opacity` e uma só leitura de layout por frame. O scroll só é escutado quando a secção está visível. Com `prefers-reduced-motion`, as secções ficam estáticas e todo o conteúdo continua visível.

## Por confirmar com a Tlhavika antes de publicar

1. **Logótipo oficial** em vetor (SVG). O site usa o nome em texto e um favicon provisório. Colocar em `public/` e definir `site.logoSrc`.
2. **Contactos:** telefones `+258 87 119 1481` / `+258 84 635 2982`, WhatsApp, `info@tlhavika.co.mz` e a morada em Zimpeto. Todos foram lidos em anúncios; confirmar e pôr `confirmado: true`.
3. **Especificações de todos os produtos**, que foram transcritas de anúncios e estão marcadas “por validar”. Em particular: a marca da bomba 4SA 16/17 e da bomba de drenagem, a composição do Hanchus ESS 3,5 kW e a alimentação da 4SDS 1500 W (o anúncio é ambíguo).
4. **Garantias:** os anúncios dos termoacumuladores dizem 1 ano num sítio e 18 meses noutro. Não foram publicadas.
5. **Instalação e assistência técnica:** só aparecem como afirmação depois de confirmadas (`site.servicosConfirmados`).
6. **Fotografias técnicas** de produto em alta resolução com fundo transparente. As atuais são anúncios de 414 px com preços históricos gravados (etiquetadas “preço não atual”).
7. **Baterias:** ainda não há modelos. A categoria mostra “gama em atualização”.
8. **Autorização de uso** das fotografias e marcas de terceiros (Dongyin, Astronergy, JA Solar, Hanchus).
9. **Domínio final** (`VITE_SITE_URL`) e o **destino dos formulários**.
10. **Estudos de caso reais**, com autorização dos clientes (`caseStudies` em `products.ts`).
