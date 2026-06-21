# Referência — Montagem do HTML, layouts e render (Passo 4)

Detalha como montar o `carrossel.html` e o `render.js` do `/lb-conteudo-carrossel`.
Fonte de verdade da marca: `identidade/design-guide.md` + os PNGs em `identidade/`.
Este arquivo traduz o design-guide em CSS/HTML pronto. Quando o design-guide mudar, este arquivo segue.

Regra de ouro: **fundo sempre escuro** (nunca branco). O "ritmo escuro ↔ claro ↔ destaque" do
SKILL.md significa variar **dentro da família dark**: escuro profundo → painel dark elevado →
slide de destaque com gradiente roxo→ciano. Nunca dois slides seguidos com o mesmo tratamento.

---

## Design tokens (CSS `:root`)

Colar no `<style>` do `carrossel.html`. São o design-guide virado em variáveis.

```css
:root{
  --bg-deep:#07070F;        /* fundo escuro profundo (default) */
  --bg-panel:#0F0F22;       /* painel dark elevado ("claro" do ritmo) */
  --roxo:#A24BFF;           /* primária neon */
  --ciano:#29C5FF;          /* secundária neon */
  --grad:linear-gradient(120deg,#A24BFF 0%,#29C5FF 100%); /* assinatura roxo→ciano */
  --txt:#FFFFFF;            /* texto principal */
  --txt-2:#C9C9D6;          /* body / secundário */
  --w:1080px; --h:1350px;   /* formato Instagram 4:5 */
}
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
.slide{
  width:var(--w);height:var(--h);position:relative;overflow:hidden;
  font-family:'Poppins','Inter',Arial,sans-serif;color:var(--txt);
  background:radial-gradient(120% 90% at 50% 0%,#120E2A 0%,var(--bg-deep) 60%);
  display:flex;flex-direction:column;justify-content:center;
  padding:110px 96px;
}
```

TikTok/Reels (só quando pedido): trocar `--h:1920px` e o padding vertical pra ~160px.

### Tipografia (escala 1080)
- **Headline:** Poppins 800, 48–72px, `letter-spacing:-.5px`, `line-height:1.1`, branco.
- **Palavra-chave do headline:** embrulhar em `.grad` (gradiente) ou cor `--roxo`. Só 1–2 palavras, nunca o título todo.
- **Body:** Poppins 400–500, 24–32px, `line-height:1.4`, cor `--txt-2`.
- **Label topo:** Poppins 600, 16–18px, `text-transform:uppercase`, `letter-spacing:3px`, cor `--ciano`.

```css
.grad{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.label{font-size:17px;font-weight:600;text-transform:uppercase;letter-spacing:3px;color:var(--ciano);margin-bottom:28px}
h1{font-size:64px;font-weight:800;letter-spacing:-.5px;line-height:1.1}
p{font-size:29px;font-weight:400;line-height:1.4;color:var(--txt-2)}
```

---

## Elementos de marca (snippets reutilizáveis)

**Moldura neon** (borda gradiente com glow) — usar na CAPA e no CTA FINAL:
```css
.frame{position:absolute;inset:40px;border-radius:32px;padding:2px;background:var(--grad);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  box-shadow:0 0 60px rgba(162,75,255,.35),inset 0 0 40px rgba(41,197,255,.15)}
```

**Textura de circuito/glow no fundo** (sutil, não competir com texto):
```css
.slide::before{content:'';position:absolute;inset:0;opacity:.10;pointer-events:none;
  background-image:radial-gradient(circle at 18% 22%,var(--ciano) 0 2px,transparent 3px),
                   radial-gradient(circle at 82% 78%,var(--roxo) 0 2px,transparent 3px);
  background-size:140px 140px}
```

**Hexágono com ícone/número** (container de destaque):
```css
.hex{width:150px;height:170px;display:grid;place-items:center;
  clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);
  background:var(--grad);box-shadow:0 0 40px rgba(162,75,255,.4)}
.hex span{font-size:64px;font-weight:800;color:#07070F}
```

**Pílula CTA** (glow gradiente):
```css
.cta{display:inline-block;padding:26px 56px;border-radius:999px;background:var(--grad);
  color:#0A0A18;font-weight:800;font-size:30px;box-shadow:0 0 50px rgba(41,197,255,.45)}
```

Regras: glow nas molduras/ícones, **não** no texto corrido. Sem clip-art, sem emoji decorativo,
sem gradiente arco-íris. Line-icons dentro de hexágono quando usar ícone.

---

## Os 6 layouts nomeados

Cada `<div class="slide ...">` usa um. Variar entre slides — nunca repetir o mesmo layout seguido.

| Layout | Uso | Fundo (ritmo) |
|--------|-----|---------------|
| **CAPA** | slide 1 / gancho | deep + moldura neon |
| **SOLO** | 1 ideia, texto centrado | painel elevado |
| **DUO** | label + título + body (corpo padrão) | deep |
| **NÚMERO** | passo numerado / lista | painel + hexágono |
| **CITAÇÃO** | frase de impacto / depoimento | destaque (gradiente) |
| **CTA FINAL** | último slide, CTA + logo | deep + moldura + pílula |

### CAPA — gancho (máx 8 palavras)
```html
<div class="slide capa">
  <div class="frame"></div>
  <span class="label">O PROBLEMA REAL</span>
  <h1>Sua agenda ainda tem <span class="grad">horário vazio</span> às 14h?</h1>
  <p style="margin-top:36px">Arrasta pra ver como a IA resolve →</p>
</div>
```

### SOLO — uma ideia, centrado (fundo painel elevado)
```html
<div class="slide solo" style="background:var(--bg-panel)">
  <h1 style="text-align:center;max-width:760px;margin:0 auto">Resposta em <span class="grad">5 minutos</span> converte 8× mais.</h1>
</div>
```

### DUO — corpo padrão (label + título + body)
```html
<div class="slide duo">
  <span class="label">COMO FUNCIONA</span>
  <h1>O agente responde<br>enquanto você dorme</h1>
  <p style="margin-top:32px;max-width:820px">Lead chega 23h, recebe resposta na hora, agenda sozinho. Você acorda com a agenda cheia.</p>
</div>
```

### NÚMERO — passo/lista (hexágono com número)
```html
<div class="slide numero" style="background:var(--bg-panel)">
  <div class="hex"><span>1</span></div>
  <h1 style="margin-top:48px">Captura o lead</h1>
  <p style="margin-top:24px;max-width:820px">Formulário, DM ou WhatsApp — entra tudo no mesmo funil.</p>
</div>
```

### CITAÇÃO — frase de impacto (slide de destaque, fundo gradiente)
```html
<div class="slide citacao" style="background:var(--grad)">
  <h1 style="font-size:72px;color:#0A0A18;max-width:840px">"Saímos de 60% pra 90% de ocupação em 8 semanas."</h1>
  <p style="margin-top:32px;color:#0A0A18;font-weight:600">— Cliente, setor de serviços</p>
</div>
```
(Em slide de destaque o texto vira escuro `#0A0A18` pra contraste sobre o gradiente.)

### CTA FINAL — CTA + logo
```html
<div class="slide cta-final">
  <div class="frame"></div>
  <span class="label">BORA?</span>
  <h1>Quer isso rodando<br>no seu negócio?</h1>
  <a class="cta" style="margin-top:48px">Chama no WhatsApp →</a>
  <img src="../../identidade/logo.png" style="position:absolute;bottom:64px;left:96px;height:56px" alt="LBCode.IA">
</div>
```
CTA segue `_memoria/preferencias.md` (único e claro). Logo do `identidade/`.

---

## Montagem do `carrossel.html`

- **Um único arquivo**, todos os slides como `<div class="slide ...">` em sequência, **CSS inline** no `<head>`.
- Tokens no `:root`, classes utilitárias (`.grad/.label/.frame/.hex/.cta`) uma vez só.
- Carrossel: 5–10 slides (capa gancho · internos corpo · final CTA+logo). Post único: 1 slide.
- Aplicar o ritmo: nenhum par de slides vizinhos com mesmo `background`/layout.

Esqueleto:
```html
<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><style>
/* :root + classes utilitárias aqui */
</style></head><body>
  <div class="slide capa">…</div>
  <div class="slide duo">…</div>
  <div class="slide numero" style="background:var(--bg-panel)">…</div>
  <div class="slide citacao" style="background:var(--grad)">…</div>
  <div class="slide cta-final">…</div>
</body></html>
```

---

## `render.js` (Playwright → PNG 1080×1350)

Mesma pasta do `carrossel.html`. Tira screenshot de cada `.slide` no tamanho exato.
Rodar **da raiz do projeto** pra reutilizar o `node_modules` local (sem `npm install` toda vez):
`node saidas/marketing/conteudo/carrossel/<pasta>/render.js`

```js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const dir = __dirname;
  const out = path.join(dir, 'instagram');
  fs.mkdirSync(out, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(dir, 'carrossel.html'));

  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    const n = String(i + 1).padStart(2, '0');
    await slides[i].screenshot({ path: path.join(out, `slide-${n}.png`) });
  }
  await browser.close();
  console.log(`OK — ${slides.length} slides em ${out}`);
})();
```

TikTok 9:16: duplicar com `viewport {width:1080,height:1920}` e salvar em `tiktok/`.
Cada `.slide` deve ter a altura do viewport pro screenshot sair no formato certo
(o CSS `.slide{height:var(--h)}` já garante; pro 9:16, sobrescrever a altura no container).

---

## Checklist antes de renderizar
- [ ] Fundo escuro em todos (nenhum branco). Destaque = gradiente, não fundo claro.
- [ ] Gancho ≤ 8 palavras na CAPA, 1 palavra-chave em gradiente.
- [ ] 1 ideia por slide, body em `--txt-2`, ≥24px peso ≥400.
- [ ] Ritmo: sem layout/fundo repetido em slides vizinhos.
- [ ] CTA FINAL com pílula + logo do `identidade/`.
- [ ] Sequência de capa no feed considerada (alternar com a última publicada).
