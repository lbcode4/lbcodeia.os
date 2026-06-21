---
name: lb-sistema-onboarding
description: >
  Instala LBCode.IA em 10-12min. Extrai site/Instagram, entrevista 18 perguntas
  (negócio + diferencial + tráfego + voz + frequência + gargalo + objetivo+métrica + prioridade).
  Preenche memória completa pronto pra skills específicas (anuncio-google faz briefing,
  seo faz keywords, etc). Sem duplicação. Exemplos inline em cada pergunta.
  Use quando o usuário disser "onboarding", "instalar LBCode", "configurar do zero",
  "começar setup", "primeiro uso", "setup inicial", ou /lb-sistema-onboarding.
---

# /lb-sistema-onboarding — Setup Rápido do LBCode.IA

Primeiro comando pós-clone. Descobre essencial em 10-12min. Skills específicas
aprofundam depois quando user chamar (`/lb-google-ads` faz briefing detalhado de ads,
`/lb-google-seo` pesquisa de palavras-chave, etc).

**Objetivo:** Sistema conhece negócio completo (quem, o que, diferencial, tráfego, voz,
frequência, gargalo, objetivo, métrica, prioridade). Pronto pra executar primeira skill.

**Tempo:** 10-12 minutos. (Skills aprofundam depois, sem duplicação.)

---

## Como rodar — orquestração

Esta skill é fina de propósito. Cada fase mora num arquivo de apoio; **carregar só quando
chegar na fase** (economiza contexto):

| Fase | Arquivo de apoio | O que faz |
|------|------------------|-----------|
| 0 — Site + Instagram + refs | `reference/fase-0-site-instagram.md` | Extrai dados públicos, registra @handle, pede refs visuais |
| 2 — Entrevista (18 perguntas) | `reference/fase-2-entrevista.md` | Os 8 blocos, uma pergunta por vez |
| 3-5 — Preenchimento + npm install + briefing | `reference/fase-3-5-fechamento.md` | Preenche `_memoria/`, instala deps, fecha com próximos passos |

Pré-checagem e Fase 1 (perfil) ficam aqui inline — são curtas.

**Sequência:** Pré-checagem → Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5.

---

## Pré-checagem

### 1. Nome da pasta

Conferir (`basename "$(pwd)"`). Se genérico (`lbcode-ia`, `LBCode.IA`, etc):

> "Pasta tá genérica. Depois renomeamos pro nome da empresa."

Registrar pra Fase 5.

### 2. Contexto já preenchido?

Se `_memoria/*.md` tem conteúdo real:
> "Já tem contexto. Sobrescrevo ou complemento?"

Se limpo, seguir.

---

## Fase 0 — Site + Instagram + refs visuais

→ **Carregar `reference/fase-0-site-instagram.md`** e seguir.
Atalho que antecipa respostas e coleta logo/refs em `identidade/`. Não obrigatório — falha = segue entrevista.

---

## Fase 1 — Perfil

Qual tipo melhor representa o negócio?

1. **Criador** (`criador`) — marca pessoal + negócio digital, uma pessoa, audiência como ativo
2. **Freelancer** (`freelancer`) — vende serviço pra clientes terceiros, organiza por projeto
3. **Agência** (`agencia`) — equipe pequena, vários clientes, entregas em paralelo
4. **Negócio local** (`local`) — empresa estabelecida com presença física ou regional

Resposta define template `CLAUDE.md` → `templates/perfis/claude-md-<perfil>.md`.

---

## Fase 2 — Entrevista Essencial (18 perguntas)

→ **Carregar `reference/fase-2-entrevista.md`** e seguir.
Uma pergunta por vez. Site/IG já responderam? Pule o respondido — só confirme.

---

## Fases 3-5 — Preenchimento + Setup técnico + Próximos passos

→ **Carregar `reference/fase-3-5-fechamento.md`** e seguir.
Preenche os 5 arquivos de memória, roda `npm install` (Playwright pras skills de visual)
e fecha com o briefing de próximos passos calibrado por P18/P16.

---

## Regras

- Sem inventar dados. Vago = registra como veio
- Site/IG: atalho, não obrigatório. Falha = segue entrevista
- Instagram bloqueado? Registra @, não insiste
- Setup: max 10-12 min
- `npm install` na Fase 5 — sem ele a 1ª skill de carrossel/site falha no render
- Skills específicas aprofundam depois (não duplica aqui)
