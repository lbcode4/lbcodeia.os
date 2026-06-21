# Modo Clonagem — recriar site a partir de URL de referência

**Ativado quando:** o usuário fornecer uma URL (`http://` ou `https://`) no pedido.

Objetivo: mapear o site existente (estrutura, visual, copy) e recriar algo equivalente com a identidade e a mensagem do negócio atual. **Não copiar copy literal** — clonar padrão/estrutura, adaptar a voz.

Depois de montar o Mapa de Referência (passos abaixo), **continuar pelo Passo 1** do workflow normal — o Mapa substitui apenas o "design system genérico", não o contexto do negócio.

## 1. Buscar e analisar o site de referência

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

## 2. Tirar screenshot do site de referência (opcional mas recomendado)

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

## 3. Montar o Mapa de Referência

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

## 4. Adaptar à marca atual

Regra: o Mapa de Referência informa **estrutura e padrões** — identidade da marca atual tem prioridade em cores, fontes e voz.

| Elemento | Referência usa | Aplicar |
|----------|---------------|---------|
| Estrutura de seções | ✓ clonar ordem/lógica | Adaptar ao produto atual |
| Paleta | ✓ extrair lógica (claro/escuro, acento) | Substituir pelas cores do `design-guide.md` |
| Fontes | ✓ estilo (serif/sans, bold/light) | Usar fontes do `design-guide.md` se definidas |
| Copy structure | ✓ tipo de gancho, n° benefícios | Reescrever 100% com GCC + RETINA |
| Layout | ✓ clonar composição | Manter, ajustar ao conteúdo |

**Dica v2:** no Passo 3 (design system com `ui-ux-pro-max`), incluir keywords do estilo detectado no Mapa como parte da query de busca (ex: se referência é dark + minimalista → adicionar `"dark minimal"` nas keywords).
