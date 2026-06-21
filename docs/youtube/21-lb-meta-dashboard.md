# 🎬 Vídeo 21 — `/lb-meta-dashboard`

> **Bloco 4 — Tráfego pago.** Duração alvo: 6–8 min · Sem front.
> Primeira skill **live API** que gera HTML — bom impacto visual.

## 🎯 Objetivo do vídeo
Puxar performance Meta Ads ao vivo da Graph API e gerar um dashboard HTML completo: hierarquia campanha→adset→ad, comparativo de período, funil de vídeo, dark/light. Resolve a conta do cliente em `_memoria/contas-ads.md`.

## 💡 Dor → solução
- **Dor:** dado de performance fica preso no Gerenciador, feio e difícil de apresentar.
- **Solução:** dashboard HTML bonito gerado direto da API, pronto pra mostrar ao cliente.

## 🧠 Framework por trás
- Mensuração das **4 Campanhas de Ouro**: sem medir, não otimiza.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-meta-dashboard em .claude/skills/lb-meta-dashboard/SKILL.md.

Objetivo: puxar performance Meta Ads LIVE da Graph API e gerar dashboard HTML.
- Resolve a conta pela coluna Meta Ad Account de _memoria/contas-ads.md.
- Usa os scripts de integracoes/meta-ads/ (Graph API).
- Dashboard com hierarquia campanha→adset→ad, comparativo de período,
  funil de vídeo, tema dark/light.
- Saída HTML em saidas/.
- Diferente de lb-meta-relatorio (que lê CSV manual): este puxa direto da API.
- Gatilhos: "dashboard meta live", "puxar dados do meta", "performance ao vivo",
  /lb-meta-dashboard.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-meta-dashboard em .claude/skills/lb-meta-dashboard/SKILL.md.
Puxa dado real da Graph API v21.0 -> HTML. Não é CSV manual.

FRONTMATTER:
- name: lb-meta-dashboard
- description: Puxa performance Meta Ads LIVE da Graph API e gera dashboard HTML completo
  (hierarquia campanha->adset->ad, comparativo de período, funil de vídeo, dark/light).
  Resolve a conta em _memoria/contas-ads.md. Diferente de /lb-meta-relatorio (CSV manual)
  — este puxa direto da API. Gatilhos: "dashboard meta live", "puxar dados do meta",
  "relatório meta da API", "performance ao vivo", /lb-meta-dashboard.

DEPENDÊNCIAS: motor integracoes/meta-ads/scripts/relatorio.py; conta em
_memoria/contas-ads.md (resolve via --cliente); _memoria/framework-trafego.md (Bolo de
Cenoura); _memoria/empresa.md, estrategia.md, preferencias.md; credencial
integracoes/credentials/meta.env (validar com meta_api.py --test).

PASSOS:
1. Carregar contexto + voz de _memoria/.
2. Identificar o cliente; se não dito, listar os de _memoria/contas-ads.md.
3. Rodar python integracoes/meta-ads/scripts/relatorio.py --cliente "<Cliente>".
4. Pegar o caminho do HTML gerado em saidas/relatorios/<slug>/.
5. Camada framework (Bolo de Cenoura + GCC): ler os KPIs e entregar 3 insights acionáveis
   na voz LBCode — validar consistência termo->anúncio->landing, apontar queima de
   orçamento, CTR baixo, criativo quebrando.
6. Devolver: caminho do HTML + os 3 insights.

ERROS: token faltando -> conferir meta.env e rodar meta_api.py --test; cliente não achado
-> listar disponíveis de contas-ads.md; NUNCA exibir o token em resposta/log.
```

## ⚙️ Como funciona
1. Roda `/lb-meta-dashboard` + cliente.
2. Resolve conta → chama Graph API.
3. Gera HTML e abre no navegador.

## 🎥 Roteiro de gravação
1. **Gancho:** "Performance do Meta, ao vivo, num dashboard que dá orgulho de mostrar pro cliente."
2. Roda o comando.
3. Abre o HTML no navegador (hierarquia + funil).
4. **Fechamento:** "Esse é o dashboard focado. O completo tem ainda pago vs orgânico — próximo."

## 🗣️ Gancho de abertura pronto
> "Vou puxar os dados do Meta ao vivo e transformar num dashboard HTML — campanha, conjunto, anúncio e funil de vídeo, tudo num lugar."

## ✅ Demonstração ao vivo
- HTML aberto no navegador.

## 🔗 Pré-requisitos
- `/lb-ads-conectar` ok; conta em `contas-ads.md`.
</content>
