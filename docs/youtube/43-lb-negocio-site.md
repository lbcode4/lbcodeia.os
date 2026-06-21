# 🎬 Vídeo 43 — `/lb-negocio-site`

> **Bloco 6 — Negócio.** Duração alvo: 9–12 min · Sem front (o site é HTML standalone — abre no navegador, não é o painel do projeto).

## 🎯 Objetivo do vídeo
Criar sites e landing pages de alta qualidade (HTML/CSS/JS) usando a skill `frontend-design` como motor de design, calibrado pela identidade da marca. Suporta landing de vendas, demo pra cliente, institucional e landing de campanha. Aplica copy de conversão (GCC + RETINA) e renderiza preview. **Modo Clonagem:** com uma URL, faz WebFetch + screenshot do site de referência e recria equivalente com a sua identidade.

## 💡 Dor → solução
- **Dor:** entregar site pro cliente demora e exige designer.
- **Solução:** site real, com copy de conversão, gerado e renderizado no VSCode.

## 🧠 Framework por trás
- **GCC + RETINA** na copy + `frontend-design` como motor visual.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-negocio-site em .claude/skills/lb-negocio-site/SKILL.md.

Objetivo: criar sites/landing pages de alta qualidade (HTML/CSS/JS).
- Usa a skill frontend-design como motor de design, calibrada por identidade/design-guide.md.
- Pergunta o tipo: landing de vendas, demo pra cliente, institucional ou landing de campanha.
- Aplica copy de conversão (GCC + RETINA).
- Renderiza preview (Playwright).
- Modo Clonagem: dada uma URL, faz WebFetch + screenshot da referência, mapeia
  estrutura/cores/fontes/copy pattern e recria com a identidade e mensagem do negócio.
- Gatilhos: "site", "landing page", "página de vendas", "LP", "cria igual a esse site",
  /lb-negocio-site.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-negocio-site em .claude/skills/lb-negocio-site/SKILL.md.
Faz o trabalho de produto (tipo de site, contexto, copy de conversão) e DELEGA o visual à
skill frontend-design pra fugir do "cara de IA genérico".

FRONTMATTER:
- name: lb-negocio-site
- description: Cria sites e landing pages de alta qualidade (HTML/CSS/JS) usando a skill
  frontend-design como motor de design, calibrado pela identidade da marca. Suporta landing
  de vendas, site demo pra cliente, institucional e landing de campanha. Aplica copy de
  conversão (GCC + RETINA) e renderiza preview. Modo Clonagem: dada uma URL, faz WebFetch +
  screenshot Playwright da referência, mapeia estrutura/cores/fontes/copy pattern e recria
  com a identidade e mensagem do negócio. Gatilhos: "site", "landing page", "página de
  vendas", "LP", "página de captura", "cria igual a esse site", "cria baseado nesse link",
  /lb-negocio-site.

DEPENDÊNCIAS: skill frontend-design (OBRIGATÓRIO — motor de design; auto-instalável do
anthropics/skills se faltar); identidade/design-guide.md + imagens de identidade/ (carregar
via Read, exceto logo*); _memoria/empresa.md, preferencias.md, estrategia.md,
framework-trafego.md (RETINA/GCC/ganchos — OBRIGATÓRIO); geração de imagem (Gemini
nano-banana 2 via scripts/gerar-imagem-gemini.js default, OpenAI fallback); Playwright.
Output em saidas/marketing/sites/<tipo>-<nome>-<YYYY-MM-DD>/.

PASSO 0 — perguntar o tipo de site: (1) Landing de vendas; (2) Site demo pra empresa
(prospecção); (3) Institucional; (4) Landing de campanha/oferta. Cada tipo muda objetivo,
estrutura e CTA. Se não souber, recomendar pela estrategia.md.

PASSO 0b — MODO CLONAGEM (ativado quando o usuário fornece uma URL): WebFetch na URL +
screenshot Playwright (desktop 1440 + mobile 390); extrair estrutura de seções, paleta,
tipografia, layout e PADRÃO de copy (não texto literal); montar um Mapa de Referência
interno; adaptar à marca atual (clonar estrutura/lógica de paleta/estilo de fonte, mas
SUBSTITUIR pelas cores/fontes do design-guide e REESCREVER 100% da copy com GCC + RETINA).
Depois seguir o workflow normal a partir do Passo 1.

WORKFLOW:
Passo 1 — contexto e calibração: ler empresa.md, preferencias.md, estrategia.md,
framework-trafego.md, design-guide.md; carregar imagens de identidade/ via Read (avisar se
não houver); definir tipo, público, objetivo de conversão, seções, single/multi-page.
Passo 2 — copy de conversão (GCC + RETINA) de TODAS as seções antes do visual: Hero
(gancho 1 dos 4 tipos + subheadline com promessa + CTA), corpo (dor -> mecanismo ->
features -> prova), CTA único repetido. Nunca lorem ipsum. CHECKPOINT: mostrar a copy
completa e esperar aprovação antes do visual.
Passo 3 — garantir frontend-design instalada (instalar do anthropics/skills se faltar) e
INVOCAR via Skill antes de escrever HTML, passando a copy aprovada, paleta/fontes/logo,
resumo do estilo da marca, tipo e seções, stack HTML+CSS (+JS mínimo, single-file quando
der). Seguir o output da frontend-design (não cair em template genérico).
Passo 4 — gerar imagens se precisar (Gemini default com refs de identidade/; prompts em
inglês; sem rostos/texto/logos; em paralelo; aprovar cada uma).
Passo 5 — build + preview: montar arquivos; render.js (Playwright) screenshot full-page
desktop 1440 + mobile 390; mostrar previews e aprovar.
Passo 6 — salvar: copy.md, index.html (+ outras páginas), styles.css, assets/, render.js,
preview/desktop.png + mobile.png.
Passo 7 — oferecer próximos passos (campanha de tráfego pra LP; conteúdo divulgando).

REGRAS: sempre invocar frontend-design antes do HTML; sempre perguntar o tipo no Passo 0;
sempre ler design-guide + referências antes do visual; copy antes do design (sem lorem
ipsum); linguagem de preferencias.md; CHECKPOINT de copy e de preview; imagens IA com refs/
inglês/sem rostos/paralelo/aprovação; preview desktop + mobile (responsivo).
```

## ⚙️ Como funciona
1. Roda `/lb-negocio-site` + tipo (ou URL pra clonar).
2. Gera HTML/CSS/JS + copy → renderiza preview.

## 🎥 Roteiro de gravação
1. **Gancho:** "Site de cliente, com copy que converte, sem designer e sem template pronto."
2. Roda o comando (mostra o **Modo Clonagem** com uma URL — efeito visual forte).
3. Abre o preview no navegador.
4. **Fechamento:** "Esse usa o frontend-design. Tem uma versão com outro motor — último vídeo."

## 🗣️ Gancho de abertura pronto
> "Vou criar um site completo no VSCode — e mostrar o Modo Clonagem: dou uma URL de referência e o sistema recria com a minha identidade e copy de conversão."

## ✅ Demonstração ao vivo
- Site renderizado + Modo Clonagem.

## 🔗 Pré-requisitos
- Playwright; `identidade/design-guide.md`; skill `frontend-design`.
</content>
