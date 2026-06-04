---
name: lb-conteudo-calendario
description: >
  Monta calendário editorial completo do mês: 20-25 posts distribuídos pelos 6 pilares RETINA,
  com datas, formatos e temas. Fecha a visão do mês inteiro de uma vez.
  Inclui banco de temas reserva e datas especiais do setor do cliente.
  Use quando o usuário pedir "calendário de conteúdo", "planejar posts do mês",
  "programar conteúdo", "quantos posts essa semana", "plano de conteúdo", ou /conteudo-calendario.
---

# /conteudo-calendario — Calendário editorial mensal

"Consistência vence genialidade. Calendário garante consistência."

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO (RETINA + GCC)
- **Estratégia:** `_memoria/estrategia.md` — ler pra identificar foco atual e campanhas ativas
- **Contexto:** `_memoria/empresa.md`
- **Outputs:** `marketing/conteudo/calendario-<YYYY-MM>/calendario.md`

---

## Distribuição padrão RETINA

20-25 posts/mês — frequência base: 5 posts/semana (segunda a sexta):

| Pilar | % | Posts/mês | Formatos preferenciais |
|-------|---|-----------|------------------------|
| **R** Resultado | 20% | 4-5 | Carrossel, Reel antes/depois |
| **E** Educação | 25% | 5-6 | Carrossel texto, Reel explicativo |
| **T** Tendência | 15% | 3-4 | Reel, post único com dado |
| **I** Inspiração | 15% | 3-4 | Post único frase, Stories |
| **N** Novidade | 15% | 3-4 | Reel, carrossel produto |
| **A** Autenticidade | 10% | 2-3 | Stories, Reel bastidores |

**Mix de formatos:** 40% carrossel · 40% Reels · 20% stories/post único

---

## Datas especiais do setor

Levantar as datas comemorativas do **nicho do cliente** (ler `_memoria/empresa.md` pra
identificar o setor; pesquisar via WebSearch se não estiver claro) e incluir 1-2 posts
oportunos pra cada uma. Conteúdo em data relevante tem alcance orgânico maior.

Abaixo, exemplo preenchido pro **setor saúde/estética** — trocar pela tabela do setor real:

| Data | Ocasião |
|------|---------|
| 7/abr | Dia Mundial da Saúde |
| 28/mai | Dia da Saúde da Mulher |
| Outubro inteiro | Outubro Rosa (câncer de mama) |
| 18/out | Dia do Médico |
| 25/out | Dia do Dentista |
| Novembro inteiro | Novembro Azul (saúde masculina) |
| 13/nov | Dia do Fonoaudiólogo |
| 15/out | Dia do Terapeuta Ocupacional |

Datas de outras especialidades: pesquisar se o nicho for específico.

---

## Workflow

### Passo 1 — Receber contexto

Pedir: mês/ano. Default = próximo mês.

Ler `_memoria/estrategia.md` pra identificar:
- Foco atual do negócio (converter em temas de conteúdo)
- Campanhas ativas ou previstas no período
- Bloqueadores que podem influenciar volume de posts

### Passo 2 — Identificar datas especiais do mês

Verificar quais datas da tabela acima caem no mês solicitado.
Incluir 1-2 posts específicos pra cada data relevante.

### Passo 3 — Gerar calendário

**Estrutura de saída:**

```markdown
# Calendário de Conteúdo — [Mês/Ano]
Gerado em [data] | [N] posts | Mix: [% carrossel] / [% reels] / [% outros]

## Resumo do mês
- **Foco principal:** [baseado em estrategia.md]
- **Campanhas ativas:** [se houver, ou "nenhuma"]
- **Datas especiais:** [lista das que caem nesse mês]
- **Meta de alcance:** [ex: "aumentar feed antes de rodar ads"]

---

## Semana 1 ([dd/mm] — [dd/mm])

| Data | Dia | Pilar | Tema sugerido | Formato | Skill | Status |
|------|-----|-------|---------------|---------|-------|--------|
| [dd/mm] | Seg | E | "3 motivos pra agenda ter espaço às 14h" | Carrossel | `/conteudo-carrossel` | ⬜ |
| [dd/mm] | Ter | R | "Empresa X saiu de 65% pra 90% de ocupação" | Reel | `/conteudo-reels` | ⬜ |
| [dd/mm] | Qua | N | "Novo: agente responde enquanto você atende" | Reel | `/conteudo-reels` | ⬜ |
| [dd/mm] | Qui | I | "O que separa empresa cheia de empresa vazia" | Carrossel | `/conteudo-carrossel` | ⬜ |
| [dd/mm] | Sex | A | "Bastidores — como é o onboarding de uma empresa" | Stories | `/conteudo-stories` | ⬜ |

## Semana 2 ([dd/mm] — [dd/mm])
[repetir tabela]

## Semana 3 ([dd/mm] — [dd/mm])
[repetir tabela]

## Semana 4 ([dd/mm] — [dd/mm])
[repetir tabela]

---

## Banco de temas reserva
> Usar quando faltar inspiração ou precisar substituir um post planejado.

### Educação (E)
- [tema 1]
- [tema 2]
- [tema 3]

### Resultado (R)
- [tema 1]
- [tema 2]

### Tendência (T)
- [tema 1]

### Inspiração (I)
- [tema 1]
- [tema 2]

### Novidade (N)
- [tema 1]

### Autenticidade (A)
- [tema 1]
- [tema 2]

---

## Checklist de publicação semanal
- [ ] Posts da semana criados (usar skills listadas)
- [ ] Legendas revisadas e no tom da marca
- [ ] Stories programados ou publicados
- [ ] Horários de pico respeitados (terça a quinta, 18h-20h)
- [ ] Engajamento dos posts anteriores monitorado
```

### Passo 4 — Salvar

```
marketing/conteudo/calendario-<YYYY-MM>/calendario.md
```

### Passo 5 — Próximo passo sugerido

Sempre oferecer:
> "Quer que eu já crie o primeiro carrossel do calendário? (chamo `/conteudo-carrossel`)"
> "Quer criar os roteiros de Reels planejados? (chamo `/conteudo-reels`)"

---

## Regras

- **RETINA antes de tema** — pilar define ângulo; conteúdo sem pilar não tem estratégia
- **Banco de temas sempre** — calendário sem reserva quebra na 1ª semana complicada
- **Datas especiais** — conteúdo oportuno tem alcance orgânico maior que conteúdo genérico
- **Skill por post** — indicar qual skill usar pra criar cada peça facilita execução
- **Status atualizado** — marcar ⬜→✅ conforme publica; calendário sem tracking é decoração
- **Não forçar 5 posts/semana** — se o mês tem evento ou bloqueador, ajustar volume
