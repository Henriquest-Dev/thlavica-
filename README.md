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

## Identidade

Cores retiradas das publicações da Tlhavika: azul-marinho `#0e2f57`, azul `#124e97`, âmbar `#f4b045` e laranja `#ef7d24` (a faixa tricolor dos anúncios). O símbolo da lâmpada com casa e raios (`public/img/logo-simbolo.svg`) foi reconstruído em vetor a partir da publicação oficial; substituir pelo ficheiro original quando existir. Ícones: Lucide.

## Scroll

- **Computador (referência Maya):** Lenis; hero que recua; declaração palavra a palavra; fotografia que se divide em três painéis e vira para três cartões com produto; faixa horizontal de produtos comandada pelo scroll; "Em contexto"; imagem final que se expande.
- **Telemóvel (sistema próprio):** scroll nativo; cartões de soluções que se empilham (sticky); carrosséis deslizáveis para produtos e fotografias.

## Assets

| Ficheiro | Origem |
|---|---|
| `hero-*`, `agua-*` | Cenas ilustrativas do pacote de direção criativa (imagens geradas; identificadas no site) |
| `foto-15/16/17/34` | Facebook Tlhavika, ampliadas x4 com Real-ESRGAN (`source-assets/ampliadas`) |
| `produtos/*` | Produtos recortados (BiRefNet) dos anúncios ampliados (`source-assets/produtos`); bombas pressurizadoras usam o recorte ilustrativo do kit |
| `nevoa-2` | Névoa gerada por script |

## Por confirmar com a Tlhavika

1. Logótipo oficial em vetor (o símbolo foi reconstruído a partir da publicação).
2. Contactos: +258 87 119 1481 e Tlhavika.solar@gmail.com; morada.
3. Serviços: se a empresa também instala.
4. Especificações dos 24 produtos (transcritas dos anúncios, `src/data/products.ts`) e disponibilidade atual.
5. Direitos e identificação das fotografias do Facebook.
6. Fotografias reais em alta resolução para substituir as imagens ilustrativas.
7. Destino do formulário (hoje: WhatsApp, o utilizador revê e envia).
