---
name: lb-negocio-analisar-dados
description: >
  Analisa arquivo de dados (CSV, Excel, TXT, JSON, PDF) e entrega resumo executivo.
  Extrai: o que tá bom, o que tá ruim, tendências, oportunidades, recomendações.
  Input: arquivo + pergunta opcional. Output: relatório acionável (markdown ou tabela).
  Use quando disser "analisa esse", "o que mostram", "resume esses dados", "me dá insight",
  ou arrastar arquivo.
---

# /lb-negocio-analisar-dados — Relatório rápido de dados

Lê arquivo, extrai insight, entrega resumo executivo em 2 minutos.

## Fluxo

### Passo 1 — Entender contexto

Perguntar se não estiver claro:
- "O que é esse arquivo? (vendas, ads, leads, pesquisa, métricas internas...)"
- "Qual a pergunta principal?"

Se contexto óbvio (nome do arquivo, tipo de dados), prosseguir direto.

### Passo 2 — Ler arquivo

Suporta: CSV, Excel (.xlsx), TXT, JSON, PDF (tabelas)

Extrair dados com as ferramentas disponíveis. Se Excel, usar leitura nativa.

### Passo 3 — Análise estruturada

Identificar e reportar:

**O que tá bom:**
- Métricas acima média / em crescimento
- Padrões positivos
- Top performers (produtos, campanhas, períodos)

**O que tá ruim:**
- Quedas, anomalias
- Métricas abaixo do esperado
- Padrões negativos

**Tendências:**
- Sazonalidade
- Crescimento ou queda ao longo do tempo
- Padrões recorrentes

**Oportunidades:**
- O que pode melhorar (baixo esforço, alto impacto)
- Gaps no mercado / dados não coletados

**Recomendações acionáveis:**
- 3-5 próximos passos concretos

### Passo 4 — Entregar

Formato: Markdown com seções claras (não tabela gigante):

```markdown
# Análise de [tipo de dados]

## Resumo executivo
[1-2 linhas principais]

## O que tá em alta
- Métrica X: +45% mês passado
- Produto Y: 3x mais vendas que média

## Atenção
- Métrica Z caiu 30% — investigar
- Campanha W com ROI negativo

## Tendências
- Sazonalidade clara em [período]
- Crescimento consistente em X

## Oportunidades
- Produto Y tem demanda, investir mais
- Falta dado de [tipo] — começar a rastrear

## Próximos passos
1. [Ação 1 — urgente]
2. [Ação 2 — esta semana]
3. [Ação 3 — investigação]
```

## Regras

- Lê arquivo fornecido — se tiver senha/problemas, avisar
- Contexto vem de `_memoria/empresa.md` (entender negócio) + `_memoria/estrategia.md` (foco atual)
- Recomendações devem ser acionáveis (não genéricas)
- Se dados são confidenciais, avisar (análise local, não vai pra lugar nenhum)

## Integração

Análise alimenta decisão operacional:
- Resultado pode ir pro `/lb-meta-relatorio` (métricas de campanha)
- Pode virar ação em `_memoria/estrategia.md` (ajustar foco)
- Outputs versionados via `/lb-sistema-versionar`
