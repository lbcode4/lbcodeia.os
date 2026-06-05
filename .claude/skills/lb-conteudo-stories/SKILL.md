---
name: lb-conteudo-stories
description: >
  Cria sequência de 5-7 stories interativos com enquete, pergunta, revelação e CTA pro WhatsApp.
  Baseado no framework RETINA. Transforma engajamento passivo em conversa ativa.
  Use quando o usuário pedir "stories", "sequência de stories", "stories interativos",
  "conteúdo pra stories", "fazer stories", ou /lb-conteudo-stories.
---

# /lb-conteudo-stories — Sequência de 5-7 stories interativos

"Stories é conversa, não broadcast. Enquete puxa; revelação retém; CTA converte."

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO (RETINA)
- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Outputs:** `marketing/conteudo/stories-<tema>-<YYYY-MM-DD>/sequencia.md`

---

## Estrutura padrão (7 stories)

| Story | Tipo | Função |
|-------|------|--------|
| 1 | Gancho | Para o dedo — pergunta ou afirmação que gera curiosidade |
| 2 | Enquete | Participação ativa — ativa algoritmo e aumenta retenção |
| 3 | Desenvolvimento 1 | Dado, problema, contexto |
| 4 | Desenvolvimento 2 | Aprofundamento ou revelação parcial |
| 5 | Revelação | A informação principal — o "aha moment" |
| 6 | Prova | Dado concreto, resultado, tela do produto |
| 7 | CTA | "Me chama no WhatsApp" / Link / Responder |

**Versão curta (5 stories):** juntar stories 3+4 em 1 e stories 5+6 em 1.

---

## Pilares RETINA para Stories

| Pilar | Melhor pra stories |
|-------|--------------------|
| **R** Resultado | Revelação de transformação (antes/depois no story 5) |
| **E** Educação | Sequência "você sabia que..." com enquete de diagnóstico |
| **T** Tendência | "Todo mundo está falando de X — você já ouviu?" |
| **I** Inspiração | Frase + enquete + revelação de mindset |
| **N** Novidade | Lançamento com suspense revelado no story 5 |
| **A** Autenticidade | Bastidores com enquete ("qual você prefere?") |

---

## Workflow

### Passo 1 — Definir parâmetros

Pedir ao usuário:
1. **Tema** — o que comunicar
2. **Objetivo principal:**
   - Gerar lead (WhatsApp, DM) — focar CTA no story 7
   - Engajar (respostas, reações) — focar enquete e revelação
   - Educar / posicionar — focar desenvolvimento e revelação
3. **Pilar RETINA** — sugerir o mais adequado se não informado

### Passo 2 — Gerar sequência

**Template de cada story:**

```markdown
## Story [N] — [Tipo]
**Fundo:** [cor sólida / foto / vídeo curto — descrever]
**Texto principal:** [frase em destaque — máximo 10 palavras]
**Texto secundário:** [complemento ou instrução abaixo]
**Elemento interativo:** [enquete "A ou B" / pergunta aberta / quiz / nenhum]
**Posição do sticker:** [topo / meio / baixo]
**Emoji/ícone:** [se usar — descrever]
**Música:** [mood — ex: "suave e otimista", "energético", "sem música"]
```

**Exemplo para tema "leads perdidos":**

```markdown
## Story 1 — Gancho
**Fundo:** cor primária da marca
**Texto principal:** "Sua empresa está perdendo clientes toda semana."
**Texto secundário:** "E você provavelmente não sabe quantos."
**Elemento interativo:** nenhum
**Música:** nenhuma — deixar silêncio impactar

## Story 2 — Enquete
**Fundo:** branco ou cinza claro
**Texto principal:** "Você responde leads fora do horário comercial?"
**Elemento interativo:** enquete — "Sim, sempre" | "Não consigo"
**Música:** suave

## Story 3 — Desenvolvimento 1
**Fundo:** cor primária
**Texto principal:** "70% dos leads decidem dentro de 5 minutos."
**Texto secundário:** "Depois disso, a chance de conversão cai 80%."
**Elemento interativo:** nenhum

## Story 4 — Desenvolvimento 2
**Fundo:** foto de empresa ou ilustração
**Texto principal:** "Às 21h, quem responde por você?"
**Texto secundário:** "Se a resposta é 'ninguém'..."
**Elemento interativo:** pergunta aberta — "Qual é seu maior desafio com atendimento?"

## Story 5 — Revelação
**Fundo:** cor de destaque da marca
**Texto principal:** "Agente de IA responde em segundos. 24h por dia."
**Texto secundário:** "Sem funcionário extra. Sem hora extra."
**Elemento interativo:** nenhum

## Story 6 — Prova
**Fundo:** tela do produto (screenshot real ou mockup)
**Texto principal:** "Assim fica o dashboard quando o agente trabalha por você."
**Elemento interativo:** nenhum

## Story 7 — CTA
**Fundo:** cor primária + logo
**Texto principal:** "Quer ver funcionando na sua empresa?"
**Elemento interativo:** link sticker → WhatsApp
**Texto do link:** "Me chama aqui →"
**Música:** levemente mais energética
```

### Passo 3 — Salvar

```
marketing/conteudo/stories-<tema>-<YYYY-MM-DD>/sequencia.md
```

### Passo 4 — Próximo passo sugerido

Sempre oferecer:
> "Quer incluir essa sequência no calendário de conteúdo? (chamo `/lb-conteudo-calendario`)"

---

## Regras

- **Sequência sempre, nunca avulso** — stories isolados não têm narrativa nem retenção
- **Enquete no story 2** — ativa o algoritmo e aumenta quanto da sequência as pessoas veem
- **Revelação gradual** — quem assiste até o final é lead quente
- **CTA só no story final** — CTA no início fecha a conversa antes de criar interesse
- **Máximo 7 stories** — sequências longas perdem 70% da audiência após o 4º
- **Fundo variado** — manter mesmo fundo em todos os stories reduz retenção
- **Músicas curtas e sem letra proeminente** — letra de música rouba atenção do texto
