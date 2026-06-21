# 🎬 Vídeo 29 — `/lb-meta-relatorio`

> **Bloco 4 — Tráfego pago.** Duração alvo: 6–8 min · Sem front.
> Funciona **sem token** (lê CSV/print manual) — ótimo pra quem ainda não conectou a API.

## 🎯 Objetivo do vídeo
Transformar exports (Google Ads + Meta CSV) em relatório executivo semanal com alertas + insights + próximos passos. Integra o Bolo de Cenoura (consistência termo→anúncio→landing). Detecta queima de orçamento, CTR baixo, conversões caindo e oportunidades.

## 💡 Dor → solução
- **Dor:** o cliente exporta um CSV e ninguém transforma aquilo em decisão.
- **Solução:** relatório acionável com alertas e próximos passos pra semana.

## 🧠 Framework por trás
- **Bolo de Cenoura:** checa consistência termo → anúncio → landing.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-meta-relatorio em .claude/skills/lb-meta-relatorio/SKILL.md.

Objetivo: transformar exports CSV (Google Ads + Meta) em relatório executivo semanal.
- Recebe CSV/print manual (não precisa de API).
- Detecta: queima de orçamento, CTR baixo, conversões caindo, oportunidades
  (criativos quebrando).
- Integra o Bolo de Cenoura (consistência termo→anúncio→landing).
- Saída: markdown acionável + recomendações pra semana seguinte.
- Diferente de lb-meta-dashboard (que puxa da API): este lê CSV manual.
- Gatilhos: "relatório ads", "performance da semana", "como foram", /lb-meta-relatorio.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-meta-relatorio em .claude/skills/lb-meta-relatorio/SKILL.md.
Rotina de accountability: lê dados brutos (CSV) -> entrega decisão. Não usa API.

FRONTMATTER:
- name: lb-meta-relatorio
- description: Transforma exports (Google Ads + Meta CSV) em relatório executivo semanal
  com alertas + insights + próximos passos. Integra Bolo de Cenoura (consistência
  termo->anúncio->landing). Detecta queima de orçamento, CTR baixo, conversões caindo,
  oportunidades. Saída: markdown acionável. Use quando disser "relatório ads",
  "performance da semana", "como foram", "/meta-relatorio".

DEPENDÊNCIAS: _memoria/framework-trafego.md (Bolo de Cenoura), _memoria/empresa.md,
estrategia.md, preferencias.md; inputs CSV exports Google Ads + Meta (ou prints);
histórico em saidas/marketing/campanhas/relatorios/relatorio-YYYY-MM-DD.md.

FLUXO:
Passo 1 — ingerir dados (arquivos arrastados ou caminhos CLI). Colunas mínimas Google:
Campanha, Grupo, Impressões, Cliques, CTR, CPC, Custo, Conversões, CPA, Conv.rate. Meta:
Campanha, Conjunto, Impressões, Alcance, Cliques, CTR, CPM, Frequência, Custo, Resultados,
Custo/resultado. Faltando métrica crítica, avisar e seguir só com tráfego.
Passo 2 — comparar vs semana anterior (buscar relatório anterior); calcular variação de
investimento, cliques, CTR, CPC/CPM, conversões, CPA; mostrar só mudanças >10%.
Passo 3 — análise estruturada: saúde geral (1 linha); alertas ⚠️ (conversões caindo >20%
= página/público; CPA disparou = criativo cansado/saturado; CTR <1% Google ou <0,5% Meta
= criativo fraco; frequência >3 Meta = saturado, pausar); oportunidades 🚀 (CTR +30% =
aumentar orçamento; CPA -40% = escalar; freq <2 = expandir); validação Bolo de Cenoura
(CTR alto + conversão baixa = landing não entrega; CPA ruim geral = página destino).
Passo 4 — recomendações: 3-5 ações concretas (imediato / esta semana / investigação).
Passo 5 — entregar markdown em saidas/marketing/campanhas/relatorios/relatorio-<data>.md
com Resumo, tabela de KPIs (valor, var. semana, status ✅/⚠️/🚨), Alertas, Oportunidades,
Recomendações.

REGRAS: só mostrar variações >10%; recomendações acionáveis (não "otimizar"); Bolo
validation obrigatória; tom de preferencias.md. Integração: histórico versionado via
/lb-sistema-versionar; próxima semana compara contra este benchmark.
```

## ⚙️ Como funciona
1. Roda `/lb-meta-relatorio` + CSV.
2. Analisa → alerta → recomenda.

## 🎥 Roteiro de gravação
1. **Gancho:** "Sem API, sem token — só o CSV vira relatório executivo."
2. Arrasta um CSV de exemplo.
3. Mostra alertas + próximos passos.
4. **Fechamento:** "Esse é o caminho manual. Pra Google ao vivo, próximo vídeo."

## 🗣️ Gancho de abertura pronto
> "Nem sempre dá pra conectar a API. Vou pegar um CSV cru de exportação e transformar em relatório executivo com alertas e próximos passos."

## ✅ Demonstração ao vivo
- Relatório markdown com alertas.

## 🔗 Pré-requisitos
- CSV de export Google/Meta (não precisa de token).
</content>
