---
name: lb-negocio-plano-mensal
description: >
  Monta plano de ação executivo do mês: meta principal, bloqueadores ativos, frentes de trabalho
  (conteúdo, prospecção, tráfego pago, técnica/produto) com checklist semanal de monitoramento.
  Integra as skills existentes num único planejamento.
  Use quando o usuário pedir "planejar o mês", "o que fazer esse mês", "plano de ação",
  "prioridades do mês", "plano mensal", ou /lb-negocio-plano-mensal.
---

# /lb-negocio-plano-mensal — Plano executivo do mês

"Mês sem plano vira resposta a urgência. Plano define o que importa antes de começar."

## Dependências

- **Estratégia:** `_memoria/estrategia.md` — OBRIGATÓRIO (fase atual, próximos passos, bloqueadores)
- **Contexto:** `_memoria/empresa.md` — o que está ativo, ferramentas, modelo de negócio
- **Outputs:** `saidas/plano-<YYYY-MM>.md`

---

## Workflow

### Passo 1 — Ler contexto obrigatoriamente

Antes de gerar qualquer plano, ler:
1. `_memoria/estrategia.md` — fase do negócio + próximos passos candidatos + bloqueadores
2. `_memoria/empresa.md` — o que está ativo, clientes atuais, ferramentas instaladas

Identificar a partir da leitura:
- **Meta principal do mês** — o que "vencer o mês" significa no contexto atual
- **O que estava planejado e não foi feito** (honestidade primeiro)
- **Bloqueadores ativos** — o que está travando progresso

### Passo 2 — Gerar plano

**Estrutura:**

```markdown
# Plano de Ação — [Mês/Ano]
Gerado em [data]

## Meta principal do mês
> [1 frase — ex: "Fechar o primeiro cliente [seu produto] via prospecção ativa"]

Se não cabe em 1 frase, a meta não está clara. Reformular antes de continuar.

## Bloqueadores ativos
> Listar honestamente — plano que ignora bloqueador é teatro

1. [bloqueador 1 — ex: "LP é SPA sem SSR, ads jogando tráfego ali queimam dinheiro"]
2. [bloqueador 2 — ex: "Feed com 2 seguidores, não dá pra rodar campanha de seguidores"]
3. [bloqueador 3 se houver]

---

## Frente 1: Prospecção e fechamento

**Meta:** [ex: "10 diagnósticos enviados, 3 propostas, 1 cliente fechado"]
**Skills:** `/lb-venda-diagnostico` `/lb-venda-prospectar` `/lb-venda-dossie` `/lb-venda-proposta` `/lb-venda-objecoes` `/lb-venda-follow-up`

| Semana | Ação concreta | Skill | Status |
|--------|---------------|-------|--------|
| Sem 1 | Levantar 20 prospects + fazer 5 diagnósticos | `/lb-venda-diagnostico` | ⬜ |
| Sem 1 | Enviar diagnósticos + abordagem personalizada | `/lb-venda-prospectar` | ⬜ |
| Sem 2 | Follow-up dos que não responderam | `/lb-venda-follow-up` | ⬜ |
| Sem 2 | Dossiê dos interessados + proposta | `/lb-venda-dossie` + `/lb-venda-proposta` | ⬜ |
| Sem 3 | Objeções e negociação | `/lb-venda-objecoes` | ⬜ |
| Sem 4 | Reativação + novo lote de prospects | `/lb-venda-follow-up` | ⬜ |

---

## Frente 2: Conteúdo orgânico

**Meta:** [ex: "20 posts publicados, feed com mix RETINA completo"]
**Skills:** `/lb-conteudo-calendario` `/lb-conteudo-carrossel` `/lb-conteudo-reels` `/lb-conteudo-stories`

| Semana | Ação | Skill | Status |
|--------|------|-------|--------|
| Sem 1 | Montar calendário do mês inteiro | `/lb-conteudo-calendario` | ⬜ |
| Sem 1-4 | Criar e publicar 5 posts/semana conforme calendário | `/lb-conteudo-carrossel` `/lb-conteudo-reels` | ⬜ |
| Sem 2 | Sequência de stories pra gerar leads | `/lb-conteudo-stories` | ⬜ |

---

## Frente 3: Tráfego pago

**Meta:** [ex: "Campanha Meta WhatsApp no ar com R$X/dia"]
**Skills:** `/lb-meta-campanha-whatsapp` `/lb-google-ads` `/lb-meta-relatorio`
**Pré-requisito:** verificar bloqueadores técnicos antes de ativar

| Semana | Ação | Skill | Status |
|--------|------|-------|--------|
| Sem 1 | Verificar pré-requisitos (Pixel, LP, perfil) | — | ⬜ |
| Sem 2 | Criar estrutura da campanha | `/lb-meta-campanha-whatsapp` | ⬜ |
| Sem 3 | Subir campanha + monitorar 7 dias | — | ⬜ |
| Sem 4 | Relatório e ajustes | `/lb-meta-relatorio` | ⬜ |

---

## Frente 4: Técnica / produto

**Meta:** [ex: "Resolver SPA sem SSR da LP"]
**Prioridade:** bloquear essa frente antes de escalar ads

| Prioridade | Item | Responsável | Status |
|------------|------|-------------|--------|
| Alta | [bloqueador técnico 1] | | ⬜ |
| Alta | [bloqueador técnico 2] | | ⬜ |
| Média | [item de produto] | | ⬜ |

---

## Checklist de monitoramento — todo fim de semana

- [ ] Posts publicados vs planejados no calendário
- [ ] Leads novos (WhatsApp / formulário / DM)
- [ ] Abordagens de prospecção enviadas na semana
- [ ] Respostas pendentes (quem precisa de follow-up?)
- [ ] Budget de ads consumido vs previsto (se campanha ativa)
- [ ] Métricas principais: alcance, engajamento, conversões

---

## Próxima revisão
[Data — default: último dia do mês ou quinzena]
```

### Passo 3 — Salvar

```
saidas/plano-<YYYY-MM>.md
```

### Passo 4 — Próximo passo sugerido

Sempre oferecer:
> "Quer começar pela frente mais crítica? Me diz qual e chamo a skill."
> "Quer gerar o calendário de conteúdo já? (chamo `/lb-conteudo-calendario`)"

---

## Regras

- **Ler estrategia.md primeiro** — plano sem contexto é ruído genérico
- **Meta do mês em 1 frase** — se não cabe em 1 frase, não está claro o suficiente pra executar
- **Bloqueadores honestamente** — plano que ignora o que está travando é teatro
- **Máximo 4 frentes** — mais que 4 é ansiedade organizada, não plano
- **Checklist semanal obrigatório** — plano sem tracking não existe
- **Skills por ação** — cada ação no plano deve ter a skill correspondente indicada
- **Não criar plano pra mês já em andamento sem ler o que foi feito** — ler últimos commits ou arquivos de `marketing/` primeiro
