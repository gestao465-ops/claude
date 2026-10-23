# Demonstração — Plataforma Wheff

Tour de ~34 s pela plataforma Wheff, gravado no **modo demonstração** (dados fictícios, nada é salvo).

Telas: entrada → Painel geral (funil ao vivo) → Lançamentos → Dashboard → Calendário editorial → 12 agentes de IA → Financeiro.

| Arquivo | Uso |
|---|---|
| `wheff-plataforma-demo.mp4` (1440×900, 3,3 MB) | **Recomendado para o site** — leve e nítido |
| `wheff-plataforma-demo.webm` (1440×900, 2,5 MB) | Mesma coisa, ainda mais leve (Chrome/Firefox) |
| `wheff-plataforma-demo.gif` (960×600, 12,8 MB) | GIF de verdade, para onde vídeo não funciona |
| `wheff-plataforma-demo-leve.gif` (720×450, 6,7 MB) | GIF menor (e-mail, Notion, WhatsApp) |
| `wheff-plataforma-capa.jpg` | Imagem de capa (poster) do vídeo |

## Colar no site (Next.js / HTML)

Coloque os arquivos em `public/demos/` e use um vídeo que se comporta como GIF (toca sozinho, sem som, em loop):

```html
<video autoplay muted loop playsinline poster="/demos/wheff-plataforma-capa.jpg"
       style="width:100%;border-radius:16px">
  <source src="/demos/wheff-plataforma-demo.webm" type="video/webm" />
  <source src="/demos/wheff-plataforma-demo.mp4" type="video/mp4" />
</video>
```

## Regravar

`gravar-tour.mjs` abre a plataforma localmente (`python3 -m http.server 8765` na pasta do `wheff-plataforma`), entra no modo demonstração e grava os quadros em `frames/` com Playwright.
