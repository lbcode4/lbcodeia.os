---
name: lb-negocio-site
description: >
  Cria sites e landing pages de alta qualidade (HTML/CSS/JS) usando a skill frontend-design
  como motor de design, calibrado pela identidade da marca. Suporta landing de vendas,
  site demo pra cliente, institucional e landing de campanha. Aplica copy de conversão
  (GCC + RETINA) e renderiza preview. Modo Clonagem: se o usuário fornecer uma URL,
  faz WebFetch + screenshot Playwright do site de referência, mapeia estrutura/cores/fontes/
  copy pattern e recria site equivalente com a identidade e mensagem do negócio atual.
  Use quando o usuário pedir "site", "landing page", "página de vendas", "criar site",
  "LP", "página de captura", "cria igual a esse site", "cria baseado nesse link", ou /lb-negocio-site.
---

# /lb-negocio-site — Sites e landing pages

Skill de criação de páginas web. Pega um objetivo → entrega site/landing em HTML estilizado, com copy de conversão, na identidade da marca, com preview renderizado.

**O motor de design é a skill `frontend-design`** (global). Esta skill faz o trabalho de produto: descobre o tipo de site, carrega o contexto do negócio, monta a copy de conversão e delega a construção visual à `frontend-design` pra fugir do "cara de IA genérico".

> **Esta vs `/lb-negocio-site-v2`:** mesma proposta (site/LP com copy de conversão + identidade), motor de design diferente. **v1 (esta)** usa `frontend-design`. **v2** usa `ui-ux-pro-max` (67 estilos/96 paletas/57 font pairings). Use as duas no mesmo briefing pra comparar resultado visual. Na dúvida, comece pela v1.

## Dependências

- **Skill `frontend-design`** (OBRIGATÓRIO) — invocar via `Skill` antes de escrever qualquer HTML. É o motor de design; garante interface distinta e production-grade. **Auto-instalável:** se não estiver presente, instalar no Passo 3 (skill oficial anthropics/skills).
- **Identidade visual:** `identidade/design-guide.md` — LER ANTES. Cores, fontes, logo.
- **Imagens de referência da marca:** PNG/JPG em `identidade/` (exceto `logo*`) — carregar via `Read` pra capturar paleta, tipografia e ritmo reais. Os PNGs são a verdade; o design-guide é resumo.
- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Foco atual:** `_memoria/estrategia.md`
- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO ler antes. RETINA, GCC, ganchos, Triângulo de Ouro. É a base da copy de conversão.
- **Geração de imagem (se precisar de fotos/heros):** Gemini nano-banana 2 via `scripts/gerar-imagem-gemini.js` (default), OpenAI gpt-image-1 via `scripts/gerar-imagem.js` (fallback). Mesmas regras do `/lb-conteudo-carrossel`.
- **Playwright:** renderizar preview do site em PNG.
- **Outputs vão em:** `saidas/marketing/sites/<tipo>-<nome>-<YYYY-MM-DD>/`

---

## Passo 0 — Descobrir o tipo de site

Sempre perguntar (a pessoa escolhe):

> "Que tipo de site? (1) Landing de vendas [seu produto] · (2) Site demo pra empresa (prospecção) · (3) Institucional · (4) Landing de campanha/oferta específica"

---

## Passo 0b — Modo Clonagem (URL fornecida)

**Ativado só quando** o usuário fornecer uma URL (`http://`/`https://`) no pedido.
Nesse caso, **carregar `reference/modo-clonagem.md`** e seguir os 4 passos lá
(buscar/analisar referência → screenshot → Mapa de Referência → adaptar à marca),
depois continuar pelo Passo 1. Sem URL, pular este passo.

---

Cada tipo muda objetivo, estrutura e copy:

| Tipo | Objetivo | Estrutura típica | CTA |
|------|----------|------------------|-----|
| **1. Landing [seu produto]** | Captar empresas como clientes do SaaS | Hero → dor → mecanismo IA First → features → prova → preço/oferta → FAQ → CTA | Agendar demo / WhatsApp |
| **2. Site demo empresa** | Material de demonstração/prospecção (mostra o que [seu produto] entrega ao cliente final) | Hero empresa → serviços → equipe → agendamento → contato/mapa | Agendar consulta |
| **3. Institucional** | Presença da empresa [seu produto] | Hero → sobre → o que faz → diferencial IA First → contato | Falar com a gente |
| **4. Landing campanha** | Converter 1 oferta/lead magnet específico | Hero focado na oferta → benefício → prova → formulário/CTA único | Pegar a oferta |

Se a pessoa não souber, recomendar pelo `_memoria/estrategia.md` (foco atual).

---

## Workflow

### Passo 1 — Contexto e calibração

1. Ler `_memoria/empresa.md`, `_memoria/preferencias.md`, `_memoria/estrategia.md`
2. Ler `_memoria/framework-trafego.md` (GCC, RETINA, ganchos)
3. Ler `identidade/design-guide.md` (cores, fontes, logo)
4. **Carregar via `Read` as imagens de referência em `identidade/`** (exceto `logo*`) — captura visual da marca. Se não houver, avisar:
   > "Não achei referências visuais em `identidade/`. Sigo com o design-guide, mas o resultado fica mais genérico. Se tiver 2-4 referências aprovadas, joga nessa pasta."
5. Definir: tipo de site (Passo 0), público, objetivo de conversão, seções necessárias, single-page ou multi-page.

### Passo 2 — Copy de conversão (estrutura GCC + RETINA)

Antes do visual, montar a copy de TODAS as seções. Site bom é copy boa com design bom — nunca lorem ipsum.

- **Hero (Gancho):** headline com 1 dos 4 ganchos (pergunta / contraintuitivo / história / segmentado) + subheadline com promessa concreta + CTA primário. Tom vendedor-técnico (ver `preferencias.md`).
- **Corpo (1 ideia por seção):** dor → mecanismo (o quê/como/pra quem/por quê) → features → prova (depoimento, número, logo). Posicionamento **IA First** sempre que for [seu produto].
- **CTA (fechamento):** único e claro, repetido em pontos estratégicos (hero, meio, fim).
- Linguagem do público real (ver `preferencias.md`) — sem corporativês, sem jargão de guru.

**CHECKPOINT:** mostrar a copy completa (seção a seção). Esperar aprovação antes do visual.

### Passo 3 — Garantir + invocar frontend-design (motor de design)

**3a. Garantir que a skill existe (instalar se faltar).** Checar se `frontend-design` está
disponível em `.claude/skills/frontend-design/` ou `~/.claude/skills/frontend-design/`.
Se faltar, **carregar `reference/instalar-frontend-design.md`** e seguir o script de instalação.
Se já existir, seguir direto pro 3b.

**3b. Invocar.** Invocar a skill `frontend-design` via `Skill` antes de escrever HTML. Passar pra ela:
- A copy aprovada (Passo 2)
- Paleta, fontes e logo de `identidade/design-guide.md`
- Resumo do estilo da marca capturado das referências visuais (Passo 1)
- Tipo de site e seções
- Stack: HTML + CSS (+ JS mínimo pra interações). Single-file quando der, pra preview fácil via Playwright.

Seguir o output da `frontend-design`. Não cair em template genérico de IA — é o ponto inteiro de usar essa skill.

### Passo 4 — Gerar imagens (se precisar)

Heros, fundos, mockups → mesmas regras do `/lb-conteudo-carrossel`:
- Default Gemini nano-banana 2 com 2-3 refs de `identidade/`; fallback OpenAI.
- Prompts em inglês. Sem rostos identificáveis, sem texto legível, sem logos genéricos.
- Gerar em paralelo (`run_in_background: true`).
- Aprovar cada imagem antes de aplicar.

### Passo 5 — Build + preview

1. Montar os arquivos do site (HTML/CSS/JS) na pasta de output.
2. Criar `render.js` (Playwright) que abre o `index.html` e tira screenshot full-page em desktop (1440px) e mobile (390px). Reutilizar `node_modules` de pasta anterior quando possível.
3. Mostrar os previews (desktop + mobile). Aprovar → seguir.

### Passo 6 — Salvar e organizar

```
saidas/marketing/sites/<tipo>-<nome>-<YYYY-MM-DD>/
  copy.md               ← copy aprovada por seção + tipo + objetivo de conversão
  index.html            ← site (single-page) ou página principal
  <outras>.html         ← se multi-page
  styles.css            ← se separado do HTML
  assets/               ← imagens/heros gerados
  render.js
  preview/
    desktop.png
    mobile.png
```

### Passo 7 — Próximos passos (opcional)

Depois de pronto, oferecer conforme o tipo:
- Landing/campanha → "Quer que eu prepare a campanha de tráfego pra essa LP?" (`/lb-meta-campanha-whatsapp` ou `/lb-google-ads`)
- Qualquer → "Quer a versão de conteúdo (carrossel/reels) divulgando esse lançamento?" (`/lb-conteudo-carrossel`)

---

## Regras

- Sempre invocar `frontend-design` antes de escrever HTML — é o motor de design, não opcional.
- Sempre perguntar o tipo de site no Passo 0 (a pessoa escolhe).
- Sempre ler `identidade/design-guide.md` + carregar referências visuais antes do visual.
- Copy antes do design. Nunca lorem ipsum — toda seção com copy real aprovada.
- Linguagem segue `_memoria/preferencias.md` estritamente. [seu produto] = posicionamento **IA First**.
- CHECKPOINT de copy (Passo 2) e de preview (Passo 5) — não pular aprovação.
- Nome da marca sempre **[seu produto]** (capitalização exata).
- Imagens IA: default Gemini com refs de `identidade/`; prompts em inglês; sem rostos; gerar em paralelo; aprovar antes de usar.
- Preview sempre em desktop + mobile (site tem que ser responsivo).
- Output em `saidas/marketing/sites/<tipo>-<nome>-<YYYY-MM-DD>/`.
