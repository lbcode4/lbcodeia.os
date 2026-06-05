---
name: lb-sistema-instalar
description: >
  Instala LBCode.IA em 10-12min. Extrai site/Instagram, entrevista 18 perguntas
  (negócio + diferencial + tráfego + voz + frequência + gargalo + objetivo+métrica + prioridade).
  Preenche memória completa pronto pra skills específicas (anuncio-google faz briefing,
  seo faz keywords, etc). Sem duplicação. Exemplos inline em cada pergunta.
---

# /lb-sistema-instalar — Setup Rápido do LBCode.IA

Primeiro comando pós-clone. Descobre essencial em 8-10min. Skills específicas
aprofundam depois quando user chamar (`/lb-google-ads` faz briefing detalhado de ads,
`/lb-google-seo` pesquisa de palavras-chave, etc).

**Objetivo:** Sistema conhece negócio completo (quem, o que, diferencial, tráfego, voz, 
frequência, gargalo, objetivo, métrica, prioridade). Pronto pra executar primeira skill.

**Tempo:** 10-12 minutos. (Skills aprofundam depois, sem duplicação.)

## Índice

1. [Pré-checagem](#pré-checagem)
2. [Fase 0: Site + Instagram](#fase-0--site--instagram)
3. [Fase 1: Perfil](#fase-1--perfil)
4. [Fase 2: Entrevista (18 perguntas)](#fase-2--entrevista-essencial)
5. [Fase 3: Preenchimento](#fase-3--preenchimento-dos-arquivos)
6. [Fase 4: Resumo](#fase-4--resumo)
7. [Fase 5: Próximos passos](#fase-5--próximos-passos)

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

## Fase 0 — Site + Instagram (atalho)

**Perguntar ANTES das outras perguntas:**

> "Você tem **site** (URL) ou **Instagram** (URL ou @handle)? Cola aqui — eu dou uma olhada
> e já antecipo várias respostas. Se não tiver, segue sem problema."

### Se tiver site

1. `WebFetch` na home. Buscar `/sobre`, `/servicos` se existirem.
2. Extrair (dado público):
   - Nome negócio + o que entrega (1 frase)
   - Serviços/produtos + cliente-alvo
   - Cidade, telefone, WhatsApp, email, redes sociais
   - Tom de voz (como escreve)
   - Identidade visual (cores, fonte se conseguir inferir)

3. Mostrar rascunho:
   > "Peguei isso do site: [resumo]. Confere? Corrige o que tiver errado."

### Se tiver Instagram

1. **Sempre registrar @handle** — várias skills usam depois (`/lb-conteudo-auditoria-insta`, 
   `/lb-meta-campanha-seguidores`, legendas, dossiê).
2. Tentar leitura (Instagram bloqueia sem login):
   - `WebFetch` em `https://www.instagram.com/<handle>/` ou curl com User-Agent
   - Buscar bio, nº seguidores, conteúdo público
3. Se vier vazio: registrar só @ e **não travar** — auditoria completa é `/lb-conteudo-auditoria-insta`
   com prints.
4. **Não fazer auditoria aqui.** Oferecer depois:
   > "Quer que eu rode auditoria completa do perfil depois? (`/lb-conteudo-auditoria-insta`)"

### Se não tiver nenhum

Seguir entrevista normal abaixo. Não travar.

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

Uma por vez. Se vaga, repetir 1x pedindo concretude. Registrar do jeito que vem.

**Filosofia:** Descobrir essencial + crítico agora. Skills específicas aprofundam depois.
- Concorrência + Diferencial → RETINA (posicionamento)
- Frequência conteúdo → qual skill primeiro (`/lb-conteudo-carrossel` vs `/lb-google-seo`)
- Objetivo + Métrica → KPI real pra ROI

**Nota:** Site/IG já responderam? Pule o que tá respondido — só confirme.

### Bloco 1: Negócio (P1-P6)

**P1 — Nome**
> "Como você chama o que você faz?"

*Registro:* Nome empresa ou marca pessoal.

**P2 — O que entrega**
> "O que entrega, em 1 frase simples?"
> (ex: "Faço site pra clínica que quer mais agendamentos pelo WhatsApp")

*Registro:* Descrição concreta (não vaga).

**P3 — Quem paga**
> "Quem compra? Descreve cliente real — negócio, dor."
> (ex: "Dona de clínica, 35-50 anos, sem tempo pra redes, quer mais agendamentos")

*Registro:* Perfil cliente real.

**P4 — Equipe**
> "Toca sozinho ou tem equipe? Quantos e cada um faz o quê?"

*Registro:* "Solo", "Eu + designer", etc.

**P5 — Concorrência** ← NOVO
> "Quem são 2-3 concorrentes principais? O que eles fazem bem?"
> (ex: "Clínica X tem site bonito, Clínica Y domina Instagram")

*Registro:* Concorrentes + o que fazem bem.
**Por que:** Insumo pra RETINA (diferencial). Copy em `/lb-conteudo-carrossel`, `/lb-google-seo`.

**P6 — Seu diferencial** ← NOVO
> "Qual seu maior diferencial? (preço, qualidade, velocidade, atendimento, nicho)"
> (ex: "Sou o mais barato da região", "Faço atendimento 24h", "Especialista em cabelo afro")

*Registro:* Diferencial claro.
**Por que:** GCC calibrado. Copy específico em ads/conteudo-carrossel.

---

### Bloco 2: Receita + Oferta (P7-P8)

**P7 — Faturamento**
> "Quanto fatura por mês hoje? (aproximado)"

*Registro:* Faixa. "R$ 5k-10k" ou "R$ 100k+".

**P8 — Produto principal**
> "Qual produto/serviço mais vende?"

*Registro:* Nome. "Consultoria", "Agendamento de consulta", "Curso de design".

---

### Bloco 3: Tráfego Status (P9-P10)

**P9 — Investe em ads?**
> "Você investe em anúncios hoje? (sim/não)"

*Registro:* "Sim, Google R$1k/mês" ou "Não, tá tudo orgânico".

**P10 — Maior bloqueador**
> "Qual o maior problema em tráfego?"
> (ex: "Caro e sem retorno", "Não sabe segmentar", "Sem investimento")

*Registro:* Bloqueador específico.

---

### Bloco 4: Voz + Conteúdo (P11-P13)

**P11 — Exemplo de escrita**
> "Cola exemplo real da tua escrita (Instagram, email, blog, site)."
> (ex: "Olá! Tudo bem? Hoje vou falar de..." ou "Prezado cliente, segue proposta...")

*Registro:* Copiar exemplo inteiro.
**Por que:** Calibrar tom em copy. Nada de supor.

**P12 — O que evitar**
> "O que você NÃO quer? (ex: 'vamos juntos', emojis corporativo, 'alavancar', 'sinergia')"

*Registro:* Lista do que não usar.
**Por que:** Proteger tom em cada skill de copy.

**P13 — Frequência de conteúdo** ← NOVO
> "Qual frequência de conteúdo você consegue manter?"
> (ex: "3 posts/semana", "1 carrossel/semana", "1 blog/mês")
> "Quem cria? (você, designer, freelancer, agência)"

*Registro:* Frequência + responsável.
**Por que:** Define se roda `/lb-conteudo-carrossel` ou `/lb-google-seo` primeiro. Determina velocidade.

---

### Bloco 5: Operação (P14-P15)

**P14 — Gargalo número 1**
> "Qual maior bloqueio do negócio?"
> (ex: "Sem pipeline", "Não escalo", "Conteúdo não sai", "Ads não convertem")

*Registro:* Gargalo específico.
**Por que:** Define prioridade primeira skill.

**P15 — Tarefa repetitiva**
> "Qual tarefa que você repete toda semana cansa?"
> (ex: "Responder WhatsApp", "Criar post segunda", "Preencher relatório de ads")

*Registro:* Tarefa 1.
**Por que:** Candidata `/lb-negocio-mapear-rotinas`.

---

### Bloco 6: Objetivos + Métricas (P16) ← NOVO

**P16 — Objetivo + Métrica**
> "Qual objetivo principal nos próximos 3-6 meses? E qual métrica de sucesso?"
> (ex: "80 agendamentos/mês", "30 leads qualificados/mês", "ROAS 4x", "5k de receita/mês")

*Registro:* Objetivo + métrica específica.
**Por que:** KPI pra `/lb-meta-relatorio`, `/lb-google-seo`, `/lb-venda-prospectar`. ROI real.

---

### Bloco 7: Identidade Visual (P17)

**P17 — Identidade visual**
> "Identidade visual? (Consolidada | Parcial | Não tem)"

*Registro:* Estado + cores se tiver.
**Por que:** Skills de visual (`/lb-conteudo-carrossel`, `/lb-negocio-site`) usam depois.

---

### Bloco 8: Prioridade (P18) — ÚLTIMA

**P18 — Prioridade máxima**
> "Se eu resolvesse UM problema teu nos próximos 30 dias, qual seria?"
> (ex: "Mais agendamentos", "Conteúdo pronto toda semana", "Entender se ads funcionam")

*Registro:* Prioridade clara.
**Por que:** Resposta mais valiosa. Define primeira skill a rodar.

---

## Fase 3 — Preenchimento dos Arquivos

### `_memoria/empresa.md`

```
Nome: [P1]
O que entrega: [P2]
Cliente-alvo: [P3]
Equipe: [P4]
Concorrentes principais: [P5]
Seu diferencial: [P6]
Faturamento: [P7]
Produto principal: [P8]
Site: [Fase 0]
Instagram: [Fase 0]
```

**Crítico:** P5-P6 são insumo direto pra RETINA (posicionamento em copy/ads).

### `_memoria/preferencias.md`

```
Tom de voz: [P11 exemplo] → derivar em 2-3 frases
O que evitar: [P12]
Frequência conteúdo: [P13]
```

### `_memoria/estrategia.md`

```
Gargalo principal: [P14]
Tarefa repetitiva: [P15] (candidata /lb-negocio-mapear-rotinas)
Objetivo + Métrica: [P16] (ex: 80 agendamentos/mês, ROAS 4x)
Tráfego status: [P9-P10]
Prioridade #1: [P18]
```

**Crítico:** P16 é métrica real pra `/lb-meta-relatorio`, `/lb-google-seo`, `/lb-venda-prospectar` depois.

### `identidade/design-guide.md`

```
Status: [P17 — Consolidada/Parcial/Não tem]
[Se tiver cores/fonte: registrar]
```

### `CLAUDE.md`

Aplicar template conforme perfil Fase 1: `templates/perfis/claude-md-<perfil>.md`.
Adaptar nome negócio. Sobrescrever raiz.

---

## Fase 4 — Resumo (18 perguntas = ~10-12min)

```
✓ Negócio: quem, o que, cliente, diferencial
✓ Receita: faturamento, produto, tráfego status
✓ Voz: tom, o que evitar, frequência conteúdo
✓ Operação: gargalo, tarefa repetitiva
✓ Objetivo: métrica real em 3-6 meses
✓ Visual: identidade status
✓ Prioridade: problema #1 em 30 dias

✓ Arquivos preenchidos:
  - _memoria/empresa.md (P1-P8 + site/IG)
  - _memoria/preferencias.md (P11-P13)
  - _memoria/estrategia.md (P5, P6, P14-P16, P18)
  - identidade/design-guide.md (P17)
  - CLAUDE.md (perfil adaptado)
```

**Crítico registrado:**
- P5-P6 (Concorrência + Diferencial) → insumo RETINA
- P13 (Frequência) → qual skill primeiro
- P16 (Métrica) → KPI pra tráfego/SEO

---

## Fase 5 — Próximos Passos

> "**Setup pronto. LBCode.IA agora te conhece.**
>
> **Dia a dia:**
> - `/lb-sistema-abrir` carrega contexto antes de trabalhar
> - `/lb-sistema-salvar` commit + push automático
>
> **Primeira skill:**
> Sua prioridade é [P18 — prioridade] e métrica é [P16].
> Recomendo: **`/[skill-sugerida]`** — ela aprofunda e entrega resultado.
>
> **Se repete [P15 — tarefa repetitiva]:**
> Depois de resolvido, roda `/lb-negocio-mapear-rotinas` — viro skill automática.
>
> **Positioning:**
> Seu diferencial é [P6]. Isso vai em todo copy/conteudo-carrossel/anúncio.
> Seus concorrentes [P5] fazem X — você faz Y diferente.
>
> **Framework:**
> Sistema roda em RETINA (posicionamento) + GCC (copy) + 4 Campanhas (tráfego).
> Cada skill executa isso automaticamente. Leia `_memoria/framework-trafego.md` se quiser.
>
> Bora rodar `/[skill-primeira]`?"

---

## Regras

- Sem inventar dados. Vago = registra como veio
- Site/IG: atalho, não obrigatório. Falha = segue entrevista
- Instagram bloqueado? Registra @, não insiste
- Setup: max 8-10 min
- Skills específicas aprofundam depois (não duplica aqui)
