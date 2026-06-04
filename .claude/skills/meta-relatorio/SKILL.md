---
name: lb-meta-relatorio
description: >
  Transforma exports (Google Ads + Meta CSV) em relatório executivo semanal com alertas
  + insights + próximos passos. Integra framework Bolo de Cenoura (consistência termo→anúncio→landing).
  Detecta: queima de orçamento, CTR baixo, conversões caindo, oportunidades (criativos quebrando).
  Saída: markdown acionável + recomendações pra semana seguinte. Use quando disser
  "relatório ads", "performance da semana", "como foram", "/meta-relatorio".
---

# /meta-relatorio — Executivo semanal (Google + Meta)

Rotina de accountability. Lê dados brutos → entrega decisão.

## Dependências

- **Framework:** `_memoria/framework-trafego.md` (Bolo Cenoura — validar termo→anúncio→landing)
- **Contexto:** `_memoria/empresa.md`, `_memoria/estrategia.md`
- **Tom:** `_memoria/preferencias.md`
- **Inputs:** CSV exports Google Ads + Meta Ads Manager (ou prints)
- **Arquivo histórico:** `marketing/campanhas/relatorios/relatorio-YYYY-MM-DD.md`

## Fluxo

### Passo 1 — Ingerir dados

Usuário passa:
```
/meta-relatorio
[arquivo google ads]
[arquivo meta ads]
```

Ou CLI:
```
/meta-relatorio dados/google-2026-05-12.csv dados/meta-2026-05-12.csv
```

Extrair colunas mínimas:

**Google Ads:** Campanha, Grupo, Impressões, Cliques, CTR, CPC, Custo, Conversões, CPA, Conv.rate

**Meta:** Campanha, Conjunto, Impressões, Alcance, Cliques, CTR, CPM, Frequência, Custo, Resultados, Custo/resultado

Faltando métrica crítica (Conversões/Resultados)? Avisar, continua só com tráfego.

### Passo 2 — Comparar vs semana anterior

Buscar relatório anterior em `marketing/campanhas/relatorios/`.

Calcular variação:
- Investimento total (↑/↓)
- Cliques (↑/↓)
- CTR (↑/↓)
- CPC/CPM (↑/↓)
- Conversões (↑/↓)
- CPA (↑/↓)

Só mostrar mudanças >10% (ignorar ruído).

### Passo 3 — Análise estruturada

**Saúde geral (1 linha):**
```
📊 Investimento: R$5.000 ↑12% | Cliques: 250 ↓4% | Conversões: 15 ↓20%
```

**Alertas críticos (⚠️):**
- Conversões caindo >20%? → **problema de página** ou **público errado**
- CPA disparou? → **criativo cansado** ou **público saturado**
- CTR muito baixo (<1% Google, <0.5% Meta)? → **criativo fraco**
- Frequência >3 (Meta)? → **público saturado**, pausar

**Oportunidades (🚀):**
- Criativo X tem CTR +30% vs média? → **aumentar orçamento**
- Grupo Y tem CPA -40% vs média? → **escalar**
- Público Z tem frequência <2? → **expande alcance**

**Validação Bolo de Cenoura:**

Termo (keyword) → Anúncio (RSA) → Landing (página):
- Algum grupo com CTR alto mas baixas conversões? → **landing não entrega promessa do anúncio**
- Todos os grupos com CPA ruim? → **problema geral da página destino**

### Passo 4 — Recomendações

3-5 ações concretas pra semana:

1. **Imediato (hoje/amanhã):**
   - Pausar criativo X (pior CTR)
   - Aumentar orçamento do criativo Y (melhor CPA)

2. **Esta semana:**
   - Testar 2 criativos novos (fórmula Z do melhor)
   - Revisar landing da campanha baixa (Bolo validation)

3. **Investigação:**
   - Por que conversões caíram? (público, landing, concorrência?)
   - Nota de qualidade do grupo X

### Passo 5 — Entregar

Arquivo: `marketing/campanhas/relatorios/relatorio-2026-05-19.md`

```markdown
# Relatório Semanal — Semana 19/2026

## Resumo
[1 linha de saúde geral]

## KPIs
| Métrica | Valor | Var. semana | Status |
|---------|-------|-------------|--------|
| Investimento | R$5.000 | ↑12% | ✅ |
| Cliques | 250 | ↓4% | ⚠️ |
| Conv.rate | 6% | ↓20% | 🚨 |

## Alertas
- Conversões caindo 20% — verificar landing
- Criativo A com frequência 4.2 — saturado, pausar

## Oportunidades
- Criativo B: +30% CTR — aumentar 30% orçamento
- Público C: baixa frequência — expande 2x

## Recomendações
1. Pausar criativo A (hoje)
2. Aumentar criativo B +30% (amanhã)
3. Testar 2 criativos novos (fórmula B)
4. Revisar landing da campanha baixa (Bolo validation)
5. Investigar queda de conversões (público vs landing)
```

## Regras

- Só mostrar variações >10% (ruído)
- Recomendações devem ser acionáveis (não genéricas: "otimizar")
- Bolo validation obrigatória (se CTR bom mas conversão baixa = landing problem)
- Tom segue preferências (direto, casual, técnico — como preferir)

## Integração

Relatório alimenta decisão operacional:
- Resultado vai pro histórico (`relatorios/`)
- Recomendações viram ação (pausar, aumentar, testar)
- Saída documentada e versionada via `/sistema-salvar`
- Próxima semana compara contra este benchmark
