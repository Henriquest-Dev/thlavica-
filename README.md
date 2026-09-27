# Tlhavika — website

Vite + React + TypeScript. Conteúdo editável em `src/data/site.ts`.

```bash
npm install
npm run dev            # desenvolvimento
npm run build          # dist/ para Netlify (index.html na raiz)
npm run build:ghpages  # dist/ para GitHub Pages (subcaminho /thlavica-/)
npm run images         # regenera public/img a partir de source-assets/ (Python + Pillow)
```

## Referências aplicadas

- **Composição (Solix):** hero com fotografia numa moldura arredondada sobre a mesma imagem desfocada, menu integrado, título à esquerda e faixa inferior com as três soluções.
- **Movimento da hero (Nicolai):** aproximação lenta da imagem e duas camadas de névoa a velocidades diferentes.
- **Scroll (Maya):** scroll suave com inércia (Lenis); a moldura recolhe numa faixa e sobe; declaração que acende palavra a palavra; imagem que se divide em três painéis que rodam até virarem cartões; lista de soluções com imagens reveladas; título grande que encolhe e dá lugar às fotografias; imagem final que sobe e se expande. A coreografia é CSS a partir de `--p` (progresso de cada secção). No telemóvel e com `prefers-reduced-motion`, as secções ficam estáticas.

## Assets usados

| Ficheiro | Origem | Uso |
|---|---|---|
| `hero-*.webp` | `01_hero_paisagem_solar` (imagem gerada, pacote de direção criativa) | Hero, Energia solar — identificada como ilustrativa |
| `agua-*.webp` | `02_agua_paisagem` (imagem gerada, pacote) | Painéis, Bombas de água, fecho — identificada como ilustrativa |
| `foto-15/16/17/34.webp` | Facebook Tlhavika (414 px) | Em contexto, Aplicações, Aquecimento solar — mostradas até 414 px |
| `nevoa-1/2.webp` | Geradas por script (ruído) | Névoa da hero |

`bomba.webp` (recorte ilustrativo) é gerada mas não está em uso.

## Por confirmar com a Tlhavika

1. Logótipo oficial em vetor (o site usa um wordmark tipográfico provisório).
2. Contactos: +258 87 119 1481 e Tlhavika.solar@gmail.com; morada.
3. Serviços: se a empresa também instala.
4. Fichas técnicas dos modelos anunciados (as especificações ficam ocultas até `verified: true`).
5. Direitos e identificação das fotografias do Facebook.
6. Fotografias reais em alta resolução para substituir as imagens ilustrativas.
7. Destino do formulário (hoje: WhatsApp, o utilizador revê e envia).
