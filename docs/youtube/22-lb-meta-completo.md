# 🎬 Vídeo 22 — `/lb-meta-completo`

> **Bloco 4 — Tráfego pago.** Duração alvo: 7–9 min · Sem front.

## 🎯 Objetivo do vídeo
Gerar o dashboard COMPLETO Meta Ads + Instagram ao vivo: benchmarks por anúncio, evolução diária, evolução de seguidores, comparativo pago vs orgânico, top reels, otimizações prioritárias e resumo executivo — num HTML só. Mais amplo que `/lb-meta-dashboard`.

## 💡 Dor → solução
- **Dor:** ver pago e orgânico separados esconde a foto real do crescimento.
- **Solução:** um relatório executivo que une tudo e já aponta otimizações.

## 🧠 Framework por trás
- Mensuração cruzada (pago vs orgânico) + priorização de ações (4 Campanhas).

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-meta-completo em .claude/skills/lb-meta-completo/SKILL.md.

Objetivo: dashboard COMPLETO Meta Ads + Instagram LIVE num HTML só.
- Resolve a conta em _memoria/contas-ads.md (precisa act_id E Instagram ID).
- Seções: benchmarks por anúncio, evolução diária, evolução de seguidores,
  comparativo pago vs orgânico, top reels, otimizações prioritárias, resumo executivo.
- Usa integracoes/meta-ads/ (Graph API).
- Mais amplo que lb-meta-dashboard (que foca hierarquia + funil).
- Gatilhos: "dashboard completo meta", "pago vs orgânico", "evolução de seguidores",
  /lb-meta-completo.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-meta-completo em .claude/skills/lb-meta-completo/SKILL.md.
Visão executiva ampla: pago + orgânico + seguidores + otimizações num HTML.

FRONTMATTER:
- name: lb-meta-completo
- description: Gera o Dashboard COMPLETO Meta Ads + Instagram LIVE: benchmarks por anúncio,
  evolução diária, evolução de seguidores, comparativo pago vs orgânico, top reels,
  otimizações prioritárias e resumo executivo num HTML só. Mais amplo que /lb-meta-dashboard.
  Resolve a conta em _memoria/contas-ads.md. Gatilhos: "dashboard completo meta",
  "relatório completo meta", "pago vs orgânico", "evolução de seguidores", /lb-meta-completo.

DEPENDÊNCIAS: motor integracoes/meta-ads/scripts/dashboard_completo.py; conta em
_memoria/contas-ads.md (precisa act_id E IG User ID, resolve via --cliente);
_memoria/framework-trafego.md (Bolo de Cenoura); _memoria/empresa.md, estrategia.md,
preferencias.md; credencial meta.env (validar com /lb-ads-conectar).

PASSOS:
1. Carregar contexto + voz de _memoria/.
2. Resolver cliente em contas-ads.md (precisa act_id E IG User ID).
3. Rodar python integracoes/meta-ads/scripts/dashboard_completo.py --cliente "<Cliente>".
   Se o briefing pedir período diferente do padrão (30 dias), adicionar --periodo:
   last_60d, last_90d, max (37 meses) ou YYYY-MM-DD:YYYY-MM-DD.
4. Pegar o HTML gerado em saidas/relatorios/<slug>/.
5. Camada framework (Bolo de Cenoura): ler o resumo executivo + comparativo pago vs
   orgânico e entregar 3 leituras acionáveis na voz LBCode (onde o pago alavanca o
   orgânico, otimizações).
6. Devolver: caminho do HTML + as 3 leituras.

ERROS: cliente sem IG User ID -> este dashboard precisa do orgânico, avisar e pedir
cadastro via /lb-ads-conectar; credencial faltando -> validar com meta_api.py --test;
NUNCA exibir o token.
```

## ⚙️ Como funciona
1. Roda `/lb-meta-completo` + cliente.
2. Puxa ads + IG → gera HTML executivo.

## 🎥 Roteiro de gravação
1. **Gancho:** "O relatório que mostra se seu negócio cresce de verdade — pago e orgânico juntos."
2. Roda o comando.
3. Abre o HTML: pago vs orgânico, seguidores, resumo executivo.
4. **Fechamento:** "Visão completa. Agora um diagnóstico rápido de saúde da conta."

## 🗣️ Gancho de abertura pronto
> "Esse é o relatório que eu entrego pro cliente: pago vs orgânico, evolução de seguidores e as otimizações prioritárias, tudo num HTML."

## ✅ Demonstração ao vivo
- HTML executivo completo.

## 🔗 Pré-requisitos
- `contas-ads.md` com act_id E Instagram ID; token.
</content>
