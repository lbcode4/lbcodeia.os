---
name: lb-negocio-site-v2
description: >
  Cria sites e landing pages de alta qualidade (HTML/CSS/JS) usando ui-ux-pro-max
  como motor de design (vs lb-negocio-site que usa frontend-design). Motor baseado em
  design system dinâmico: 67 estilos, 96 paletas, 57 font pairings. Calibrado pela
  identidade da marca e copy de conversão (GCC + RETINA). Renderiza preview Playwright.
  Modo Clonagem: se o usuário fornecer uma URL, faz WebFetch + screenshot Playwright do
  site de referência, mapeia estrutura/cores/fontes/copy pattern e recria site equivalente
  com a identidade e mensagem do negócio atual (keywords do estilo detectado alimentam o
  ui-ux-pro-max). Use /lb-negocio-site-v2 para comparar resultado visual com /lb-negocio-site.
---

# /lb-negocio-site-v2 — Sites e landing pages (motor ui-ux-pro-max)

Mesma proposta do `/lb-negocio-site` — site/landing com copy de conversão e identidade da marca — mas o motor de design é a skill **`ui-ux-pro-max`** (script Python) em vez de `frontend-design`.

**Diferença principal:** `ui-ux-pro-max` gera um design system contextual (paleta, tipografia, estilo, estrutura de seções, UX rules) com base nas keywords do negócio. Claude usa esse design system pra gerar HTML — resultado mais específico, menos genérico de IA.

## Dependências

- **`ui-ux-pro-max`** em `~/.claude/skills/ui-ux-pro-max/` — motor de design. Script: `~/.claude/skills/ui-ux-pro-max/scripts/search.py`
- **Identidade visual:** `identidade/design-guide.md`
- **Referências visuais:** PNGs/JPGs em `identidade/` (exceto `logo*`) — carregar via `Read`
- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Foco atual:** `_memoria/estrategia.md`
- **Framework de tráfego:** `_memoria/framework-trafego.md` — GCC, RETINA, ganchos
- **Playwright:** preview desktop + mobile
- **Outputs:** `marketing/sites/<tipo>-<nome>-<YYYY-MM-DD>/`

---

## Passo 0 — Tipo de site

Sempre perguntar:

> "Que tipo de site? (1) Landing de vendas [seu produto] · (2) Site demo pra empresa (prospecção) · (3) Institucional · (4) Landing de campanha/oferta específica"

---

## Passo 0b — Modo Clonagem (URL fornecida)

**Ativado quando:** o usuário fornecer uma URL (`http://` ou `https://`) no pedido.

Objetivo: mapear o site existente (estrutura, visual, copy) e recriar algo equivalente com a identidade e a mensagem do negócio atual. **Não copiar copy literal** — clonar padrão/estrutura, adaptar a voz.

### 1. Buscar e analisar o site de referência

```
WebFetch: <URL fornecida>
```

Do HTML retornado, extrair:

**Estrutura de seções (nesta ordem se existir):**
- Nav/header: logo + links + CTA
- Hero: headline + subheadline + CTA + imagem/vídeo
- Seções do corpo (nomes das seções, número, ordem)
- Social proof: depoimentos, logos, números
- Pricing / planos (se houver)
- FAQ (se houver)
- Footer: links, redes, contato

**Paleta de cores:**
- CSS variables (`:root { --primary: ... }`)
- `background`, `color`, `border-color` dominantes no `<style>` ou inline
- Classificar: primária, secundária, acento, fundo, texto

**Tipografia:**
- Links Google Fonts: `<link href="https://fonts.googleapis.com/...">` → extrair família(s)
- `font-family` no `<style>` ou CSS inline
- Classificar: fonte de título, fonte de corpo

**Layout:**
- Grid / flex no hero e nas seções
- Número de colunas nas seções de features/benefits
- Posição das imagens (esquerda/direita/centralizada/fundo)
- Estilo de CTA (botão sólido, outline, gradiente)

**Padrão de copy (estrutura, não texto literal):**
- Tipo de gancho no headline (pergunta / dado / transformação / segmentado)
- Tom (técnico / emocional / direto / narrativo)
- Número de benefícios listados
- Formato dos depoimentos (nome + cargo + empresa / anônimo / NPS)

### 2. Tirar screenshot do site de referência (opcional mas recomendado)

```javascript
// Se Playwright disponível — screenshot pra análise visual
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('<URL>');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/referencia-desktop.png', fullPage: true });
  const mobile = await browser.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto('<URL>');
  await mobile.waitForTimeout(2000);
  await mobile.screenshot({ path: '/tmp/referencia-mobile.png', fullPage: true });
  await browser.close();
})();
```

Ler as screenshots via `Read` pra análise visual da composição, hierarquia e ritmo.

### 3. Montar o Mapa de Referência

Produzir internamente (não mostrar pro usuário a menos que peça):

```markdown
## Mapa de Referência — <URL>

### Estrutura
- Seções em ordem: [nav] [hero] [seção X] [seção Y] ...

### Paleta
- Primária: #... | Secundária: #... | Acento: #... | Fundo: #... | Texto: #...

### Tipografia
- Títulos: <fonte> | Corpo: <fonte>

### Layout
- Hero: [descrição do layout]
- Features: [N colunas, posição de ícone/imagem]
- CTA style: [botão sólido / outline / gradiente, cor]

### Copy pattern
- Gancho headline: [tipo]
- Tom: [tom identificado]
- N benefícios: [N]
- Prova social: [formato]
```

### 4. Adaptar à marca atual

Regra: o Mapa de Referência informa **estrutura e padrões** — identidade da marca atual tem prioridade em cores, fontes e voz.

| Elemento | Referência usa | Aplicar |
|----------|---------------|---------|
| Estrutura de seções | ✓ clonar ordem/lógica | Adaptar ao produto atual |
| Paleta | ✓ extrair lógica (claro/escuro, acento) | Substituir pelas cores do `design-guide.md` |
| Fontes | ✓ estilo (serif/sans, bold/light) | Usar fontes do `design-guide.md` se definidas |
| Copy structure | ✓ tipo de gancho, n° benefícios | Reescrever 100% com GCC + RETINA |
| Layout | ✓ clonar composição | Manter, ajustar ao conteúdo |

Depois de montar o Mapa, **continuar pelo Passo 1** do workflow normal — o Mapa substitui apenas o "design system genérico", não o contexto do negócio.

**Dica v2:** no Passo 3 (design system com `ui-ux-pro-max`), incluir keywords do estilo detectado no Mapa como parte da query de busca (ex: se referência é dark + minimalista → adicionar `"dark minimal"` nas keywords).

---

| Tipo | Objetivo | CTA |
|------|----------|-----|
| **1. Landing [seu produto]** | Captar empresas como clientes | Agendar demo / WhatsApp |
| **2. Site demo empresa** | Material de demonstração/prospecção | Agendar consulta |
| **3. Institucional** | Presença da empresa | Falar com a gente |
| **4. Landing campanha** | Converter 1 oferta/lead magnet | Pegar a oferta |

---

## Workflow

### Passo 1 — Contexto e calibração

1. Ler `_memoria/empresa.md`, `_memoria/preferencias.md`, `_memoria/estrategia.md`
2. Ler `_memoria/framework-trafego.md` (GCC, RETINA, ganchos, Triângulo de Ouro)
3. Ler `identidade/design-guide.md` (cores, fontes, logo)
4. Carregar via `Read` as referências visuais em `identidade/` (exceto `logo*`)
5. Definir: tipo de site, público, objetivo de conversão, seções necessárias

### Passo 2 — Copy de conversão (GCC + RETINA)

Montar copy de TODAS as seções antes do visual. Nunca lorem ipsum.

- **Hero (Gancho):** headline com 1 dos 4 ganchos (pergunta / contraintuitivo / história / segmentado) + subheadline com promessa concreta + CTA primário
- **Corpo:** dor → mecanismo → features → prova (depoimento, número, logo)
- **CTA:** único, claro, repetido em hero / meio / fim
- Linguagem do público real (`preferencias.md`). Posicionamento **IA First** quando for [seu produto].

**CHECKPOINT:** mostrar copy completa por seção. Aguardar aprovação antes do design.

### Passo 3 — Gerar design system com ui-ux-pro-max

**3a. Extrair keywords do negócio** (indústria + tipo de site + estilo visual da marca):

```
<setor> <tipo_site> <estilo_keywords>
```

Exemplos:
- Clínica odontológica, landing de vendas, design-guide indica "clean, profissional" → `"dental healthcare clinic professional clean"`
- Agência de marketing, institucional, marca jovem → `"marketing agency service professional bold"`

**3b. Rodar design system search:**

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --design-system -p "<Nome do Projeto>"
```

**3c. Rodar stack guidelines (sempre html-tailwind):**

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "layout responsive landing" --stack html-tailwind
```

**3d. Suplementar com domínios específicos conforme necessidade:**

```bash
# Mais opções de estilo se o padrão não encaixar na marca
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "<estilo da marca>" --domain style

# Estrutura de landing + estratégia de CTA
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "hero social-proof CTA" --domain landing

# UX e acessibilidade
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux
```

**3e. Reconciliar design system com identidade da marca:**

O `ui-ux-pro-max` retorna sugestões — mas a identidade da marca tem prioridade. Regra:

| Elemento | Prioridade |
|----------|-----------|
| Cores primárias | `identidade/design-guide.md` overrida o design system |
| Fontes | `design-guide.md` se definidas; caso contrário usar sugestão do script |
| Estilo visual | Combinar: tipo de estilo do script + tom da marca |
| Estrutura de seções | Design system (mais contextual que template genérico) |
| UX rules (touch targets, contraste, spacing) | SEMPRE aplicar do ui-ux-pro-max |

### Passo 4 — Build HTML

Com copy aprovada (Passo 2) + design system reconciliado (Passo 3):

- HTML single-file sempre que possível (Tailwind CDN, Google Fonts via `<link>`)
- Aplicar paleta, tipografia, estilo e estrutura de seções do design system
- Seguir Pre-Delivery Checklist do ui-ux-pro-max:
  - Sem emojis como ícones (usar SVG Heroicons/Lucide inline)
  - `cursor-pointer` em todos elementos clicáveis
  - Hover states com `transition-colors duration-200`
  - Contraste mínimo 4.5:1 texto normal
  - Viewport meta, responsive em 375/768/1024/1440px
  - `prefers-reduced-motion` se usar animações
- CTA único e claro, cores da identidade da marca

### Passo 5 — Preview Playwright

```javascript
// render.js — desktop (1440px) + mobile (390px)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const htmlPath = path.resolve(__dirname, 'index.html');
  const previewDir = path.resolve(__dirname, 'preview');
  if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir);

  // Desktop
  const desktop = await browser.newPage();
  await desktop.setViewportSize({ width: 1440, height: 900 });
  await desktop.goto(`file://${htmlPath}`);
  await desktop.waitForTimeout(1000);
  await desktop.screenshot({ path: `${previewDir}/desktop.png`, fullPage: true });

  // Mobile
  const mobile = await browser.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(`file://${htmlPath}`);
  await mobile.waitForTimeout(1000);
  await mobile.screenshot({ path: `${previewDir}/mobile.png`, fullPage: true });

  await browser.close();
  console.log('Preview gerado em preview/desktop.png e preview/mobile.png');
})();
```

Rodar: `node render.js`

Mostrar previews. Aguardar aprovação antes de finalizar.

### Passo 6 — Salvar e organizar

```
marketing/sites/<tipo>-<nome>-<YYYY-MM-DD>/
  copy.md               ← copy aprovada + tipo + objetivo de conversão
  design-system.md      ← output do ui-ux-pro-max reconciliado com identidade
  index.html
  render.js
  preview/
    desktop.png
    mobile.png
```

Salvar também o design system reconciliado em `design-system.md` — útil pra iterações futuras e comparação com v1.

### Passo 7 — Próximos passos (opcional)

- Landing/campanha → "Quer campanha de tráfego pra essa LP?" (`/lb-meta-campanha-whatsapp` ou `/lb-google-ads`)
- Qualquer → "Quer conteúdo divulgando?" (`/lb-conteudo-carrossel`)

---

## Regras

- Sempre rodar `ui-ux-pro-max --design-system` antes de escrever HTML — é o motor de design, não opcional
- Identidade da marca (`design-guide.md`) overrida cores/fontes do script quando há conflito
- Copy antes do design. Nunca lorem ipsum
- CHECKPOINT de copy (Passo 2) e preview (Passo 5) — não pular aprovação
- Salvar `design-system.md` com o output reconciliado
- Preview sempre desktop + mobile
- Output em `marketing/sites/<tipo>-<nome>-<YYYY-MM-DD>/`
- Nome da marca sempre **[seu produto]** (capitalização exata)
