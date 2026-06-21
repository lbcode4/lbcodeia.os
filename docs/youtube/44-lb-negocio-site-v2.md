# 🎬 Vídeo 44 — `/lb-negocio-site-v2`

> **Bloco 6 — Negócio.** Duração alvo: 9–12 min · Sem front.
> **Vídeo de encerramento da Parte 1.** Bom formato: comparar V1 vs V2 lado a lado.

## 🎯 Objetivo do vídeo
Criar sites/landing pages usando `ui-ux-pro-max` como motor de design (vs `lb-negocio-site` que usa `frontend-design`). Motor baseado em design system dinâmico: 67 estilos, 96 paletas, 57 font pairings. Calibrado pela identidade + copy de conversão (GCC + RETINA). Tem Modo Clonagem. Serve pra comparar resultado visual com a V1.

## 💡 Dor → solução
- **Dor:** um único motor de design limita variedade visual.
- **Solução:** segundo motor (`ui-ux-pro-max`) com biblioteca enorme de estilos — gera alternativa e você compara.

## 🧠 Framework por trás
- **GCC + RETINA** na copy + `ui-ux-pro-max` (67 estilos / 96 paletas / 57 font pairings) como motor.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-negocio-site-v2 em .claude/skills/lb-negocio-site-v2/SKILL.md.

Objetivo: criar sites/landing pages usando ui-ux-pro-max como motor de design
(alternativa ao lb-negocio-site, que usa frontend-design).
- Usa o design system dinâmico do ui-ux-pro-max (67 estilos, 96 paletas, 57 font pairings).
- Calibra por identidade/design-guide.md e copy de conversão (GCC + RETINA).
- Renderiza preview (Playwright).
- Modo Clonagem: dada uma URL, mapeia estilo da referência e alimenta as keywords do
  estilo detectado no ui-ux-pro-max pra recriar com a identidade do negócio.
- Objetivo de uso: comparar resultado visual com /lb-negocio-site.
- Gatilhos: "site v2", "outra versão do site", "comparar motor de design",
  /lb-negocio-site-v2.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-negocio-site-v2 em .claude/skills/lb-negocio-site-v2/SKILL.md.
Mesma proposta do /lb-negocio-site, mas o motor de design é a skill ui-ux-pro-max (script
Python) em vez de frontend-design. ui-ux-pro-max gera um design system contextual (paleta,
tipografia, estilo, estrutura, UX rules) a partir das keywords do negócio.

FRONTMATTER:
- name: lb-negocio-site-v2
- description: Cria sites/landing pages (HTML/CSS/JS) usando ui-ux-pro-max como motor de
  design (vs lb-negocio-site que usa frontend-design). Design system dinâmico: 67 estilos,
  96 paletas, 57 font pairings. Calibrado pela identidade e copy de conversão (GCC +
  RETINA). Renderiza preview Playwright. Modo Clonagem: dada uma URL, mapeia o estilo da
  referência e alimenta as keywords detectadas no ui-ux-pro-max. Use /lb-negocio-site-v2
  pra comparar resultado visual com /lb-negocio-site.

DEPENDÊNCIAS: skill ui-ux-pro-max em ~/.claude/skills/ui-ux-pro-max/ (script scripts/
search.py); identidade/design-guide.md + imagens de identidade/ (Read, exceto logo*);
_memoria/empresa.md, preferencias.md, estrategia.md, framework-trafego.md (GCC/RETINA/
ganchos); Playwright. Output em saidas/marketing/sites/<tipo>-<nome>-<YYYY-MM-DD>/.

PASSO 0 — perguntar o tipo de site (1 Landing de vendas; 2 Site demo; 3 Institucional; 4
Landing de campanha).
PASSO 0b — MODO CLONAGEM (URL fornecida): WebFetch + screenshot Playwright; extrair
estrutura/paleta/tipografia/layout/padrão de copy; montar Mapa de Referência; adaptar à
marca (cores/fontes do design-guide, copy 100% reescrita com GCC+RETINA). Dica v2: incluir
as keywords do estilo detectado (ex: "dark minimal") na query do ui-ux-pro-max no Passo 3.

WORKFLOW:
Passo 1 — contexto e calibração (ler empresa.md, preferencias.md, estrategia.md,
framework-trafego.md, design-guide.md; carregar referências de identidade/ via Read;
definir tipo, público, objetivo, seções).
Passo 2 — copy de conversão (GCC + RETINA) de todas as seções antes do visual (Hero/gancho,
corpo dor->mecanismo->features->prova, CTA único). Nunca lorem ipsum. CHECKPOINT: aprovar
a copy antes do design.
Passo 3 — gerar design system com ui-ux-pro-max: (3a) extrair keywords (setor + tipo +
estilo da marca); (3b) python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py
"<keywords>" --design-system -p "<Projeto>"; (3c) rodar stack guidelines
(--stack html-tailwind); (3d) suplementar com --domain style/landing/ux conforme
necessidade; (3e) RECONCILIAR com a identidade — cores primárias e fontes do design-guide
overridam o script; UX rules (touch targets, contraste, spacing) SEMPRE do ui-ux-pro-max.
Passo 4 — build HTML single-file (Tailwind CDN, Google Fonts via link) aplicando paleta/
tipografia/estilo/estrutura do design system; seguir o Pre-Delivery Checklist do
ui-ux-pro-max (sem emojis como ícones — usar SVG Heroicons/Lucide; cursor-pointer em
clicáveis; hover com transition; contraste >=4.5:1; viewport meta + responsivo
375/768/1024/1440; prefers-reduced-motion).
Passo 5 — preview Playwright (render.js: desktop 1440 + mobile 390, fullPage); rodar node
render.js; aprovar.
Passo 6 — salvar: copy.md, design-system.md (output reconciliado, útil pra comparar com
v1), index.html, render.js, preview/desktop.png + mobile.png.
Passo 7 — oferecer próximos passos (campanha pra LP; conteúdo divulgando).

REGRAS: sempre rodar ui-ux-pro-max --design-system antes do HTML; identidade overrida
cores/fontes em conflito; copy antes do design (sem lorem ipsum); CHECKPOINT de copy e
preview; salvar design-system.md reconciliado; preview desktop + mobile.
```

## ⚙️ Como funciona
1. Roda `/lb-negocio-site-v2` + tipo (ou URL).
2. `ui-ux-pro-max` escolhe estilo/paleta/fontes → gera → preview.

## 🎥 Roteiro de gravação
1. **Gancho:** "Mesmo briefing, dois motores de design. Qual vence?"
2. Roda a V2 com o mesmo briefing do vídeo 43.
3. Abre V1 e V2 **lado a lado** no navegador.
4. **Fechamento:** "Fim da Parte 1 — 44 skills criadas e usadas no VSCode. Na Parte 2, ligamos tudo num front."

## 🗣️ Gancho de abertura pronto
> "Vou criar o mesmo site com um segundo motor de design — 67 estilos e 96 paletas — e comparar lado a lado com a versão anterior. E é assim que encerro a Parte 1 da série."

## ✅ Demonstração ao vivo
- V1 vs V2 lado a lado.

## 🔗 Pré-requisitos
- Playwright; `identidade/design-guide.md`; skill `ui-ux-pro-max`.

---

## 🎬 Encerramento da Parte 1 (fala pronta pro fim do vídeo)
> "Esses foram os 44 comandos do LBCode.IA — todos criados e usados aqui no VSCode, sem nenhuma interface. Na Parte 2 eu ligo tudo isso num painel visual. Se quer o sistema, link na descrição. Se chegou até aqui, esse canal é pra você — inscreve."
</content>
