# 🎬 Vídeo 07 — `/lb-conteudo-carrossel`

> **Bloco 2 — Conteúdo.** Duração alvo: 8–10 min · Sem front.
> Primeira skill que gera **artefato visual real** — ótimo gancho de vídeo.

## 🎯 Objetivo do vídeo
Criar carrosséis/posts visuais pra Instagram, TikTok e LinkedIn com framework RETINA + GCC. Gera HTML estilizado, renderiza em PNG 1080x1350 via Playwright e entrega a legenda pronta no final.

## 💡 Dor → solução
- **Dor:** criar carrossel é lento (design + copy + exportar) e geralmente sai genérico.
- **Solução:** um comando que aplica posicionamento + copy de conversão e cospe os PNGs prontos.

## 🧠 Framework por trás
- **RETINA:** cada slide reforça posicionamento/diferenciação.
- **GCC:** gatilho no slide 1, copy no meio, conversão (CTA) no final.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-conteudo-carrossel em .claude/skills/lb-conteudo-carrossel/SKILL.md.

Objetivo: criar carrosséis e posts visuais pra Instagram/TikTok/LinkedIn.
- Aplica RETINA (posicionamento por slide) + GCC (gatilho->copy->conversão).
- Lê _memoria/ e identidade/design-guide.md pra calibrar tom e visual.
- Gera HTML estilizado e renderiza PNG 1080x1350 via Playwright.
- Suporta: carrossel de texto puro, carrossel com foto IA, e post único.
- Entrega a legenda pronta no final.
- Gatilhos: "carrossel", "post", "conteúdo pro instagram", /lb-conteudo-carrossel.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-conteudo-carrossel em .claude/skills/lb-conteudo-carrossel/SKILL.md.
É a skill central de conteúdo visual: tema -> HTMLs estilizados + PNGs prontos + legenda.

FRONTMATTER:
- name: lb-conteudo-carrossel
- description: Cria carrosséis e posts visuais pra Instagram, TikTok, LinkedIn com
  RETINA + GCC. Gera HTML estilizado + renderiza PNG 1080x1350 via Playwright, com
  legenda pronta. Suporta carrossel texto puro, carrossel com foto IA e post único.
  Use quando pedir "carrossel", "post", "conteúdo pro instagram", "criar imagem",
  "gerar foto", "post educativo", /lb-conteudo-carrossel.

DEPENDÊNCIAS (ler ANTES):
- _memoria/framework-trafego.md (OBRIGATÓRIO — RETINA, GCC, 4 ganchos)
- identidade/design-guide.md (ler antes de qualquer visual)
- TODAS as imagens .png/.jpg de identidade/ exceto logo* — carregar VISUALMENTE via
  tool Read antes de criar qualquer slide (são a verdade do estilo; o design-guide é só
  resumo). Se a pasta não tiver refs, avisar que o resultado fica mais genérico e seguir.
- _memoria/empresa.md, _memoria/preferencias.md
- Playwright (render HTML->PNG), Gemini/OpenAI (foto IA, ver reference/prompts-imagem.md)
- Outputs em saidas/marketing/conteudo/carrossel/<tema>-<YYYY-MM-DD>/

TIPOS DE CONTEÚDO (perguntar se não claro): (1) carrossel texto puro (educacional,
clean, sem foto), (2) carrossel com foto (capa com personagem, gradient overlay),
(3) post único (frase/dado/depoimento). Todos 1080x1350 (4:5).

ESTILO: editorial, calmo, premium. Sem clip-art, emoji decorativo, gradiente arco-íris
ou template genérico de IA. Ritmo: alternar fundo escuro<->claro<->destaque, nunca dois
slides seguidos iguais. Considerar a ÚLTIMA capa publicada pra alternar no feed.
Layouts nomeados (CAPA/SOLO/DUO/NÚMERO/CITAÇÃO/CTA FINAL) e a montagem do HTML completo
ficam num arquivo reference/template-html.md.

WORKFLOW:
Passo 0 — classificar 1 dos 6 tipos RETINA (Relacionamento, Engajamento, Transformação,
  Interação, Níveis de consciência, Autoridade); se o usuário não disser, PERGUNTAR
  (senão só gera T+A e mata a diversidade). Buscar 2-3 referências em 3 fontes
  (Biblioteca de Anúncios Meta, Instagram pelo termo, pasta inspiracoes/) e salvar em
  .../referencias/.
Passo 1 — ler as dependências e carregar as imagens de identidade/ via Read; definir
  tema, ângulo e tipo (1/2/3).
Passo 2 — texto na estrutura GCC: Gancho (slide 1, oferecer 3 opções de tipos
  diferentes: pergunta/contraintuitivo/história/segmentado), Corpo (1 ideia por slide,
  frases naturais, sem bullets), CTA (slide final único + logo). Carrossel 5-10 slides.
  CHECKPOINT OBRIGATÓRIO: mostrar o texto completo e terminar com "Texto pronto. Aprova
  ou quer ajustar antes de eu criar as imagens?" — NÃO avançar sem aprovação explícita.
Passo 3 — fotos IA (só tipo 2): prompt em inglês, sem rostos/texto/logos, default
  gemini-2.5-flash-image com 2-3 PNGs de identidade/ como referência, gerar em paralelo
  (run_in_background), aprovar cada foto. Detalhe em reference/prompts-imagem.md.
Passo 4 — visuais: um único carrossel.html (slides como <div class="slide">, CSS inline)
  + render.js (Playwright, screenshot 1080x1350 por slide). Rodar "node render.js" da
  raiz (reaproveita node_modules). Mostrar slide 1, 2 e CTA final.
Passo 5 — salvar e organizar a pasta: texto.md, referencias/, fotos, carrossel.html,
  render.js, instagram/slide-01..NN.png, tiktok/ (se 9:16 pedido), legenda.md,
  legenda-linkedin.md (se pedido).
Passo 6 — oferecer virar artigo de blog via /lb-conteudo-publicar.

LEGENDA — gerar SEMPRE automaticamente ao fim (salvar legenda.md, sem o usuário pedir):
Hook + Contexto + CTA pra arrastar + bloco de oferta/contato + 10-15 hashtags
(público + nicho + local).

REGRAS: sempre ler design-guide.md antes do visual; 1080x1350 sempre (9:16 só se pedido);
linguagem segue preferencias.md estritamente; considerar sequência de capa; fotos IA
sempre em inglês, sem rostos identificáveis ("only hands, no face..."), sempre aprovar;
um só carrossel.html + render.js com CSS inline; não repetir layout entre slides.

Crie também reference/template-html.md (layouts + HTML) e reference/prompts-imagem.md
(modelos, prompts de foto IA, scripts, paralelização).
```

## ⚙️ Como funciona
1. Roda `/lb-conteudo-carrossel` + tema.
2. Gera copy slide a slide (RETINA+GCC).
3. Monta HTML → renderiza PNG via Playwright.
4. Devolve PNGs + legenda.

## 🎥 Roteiro de gravação
1. **Gancho:** "Carrossel pronto, no meu tom, em menos de 2 minutos."
2. Roda o comando com um tema do nicho.
3. Mostra os PNGs abrindo na pasta `saidas/`.
4. Lê a legenda gerada.
5. **Fechamento:** "Carrossel é estático. No próximo: roteiro de Reels."

## 🗣️ Gancho de abertura pronto
> "Vou criar um carrossel completo — design, copy e legenda — sem abrir o Canva. E com o framework de posicionamento embutido em cada slide."

## ✅ Demonstração ao vivo
- PNGs 1080x1350 + legenda.

## 🔗 Pré-requisitos
- `npm install` (Playwright) feito no onboarding.
- `identidade/design-guide.md` preenchido.
</content>
