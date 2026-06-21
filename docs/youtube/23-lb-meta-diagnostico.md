# 🎬 Vídeo 23 — `/lb-meta-diagnostico`

> **Bloco 4 — Tráfego pago.** Duração alvo: 5–7 min · Sem front.

## 🎯 Objetivo do vídeo
Puxar KPIs Meta Ads ao vivo da Graph API e gerar um diagnóstico da conta com alertas e recomendações priorizadas (gasto, CPL, CTR, conversões, saúde geral). Resolve a conta em `_memoria/contas-ads.md`.

## 💡 Dor → solução
- **Dor:** olhar números soltos no Gerenciador sem saber o que está bom ou ruim.
- **Solução:** diagnóstico com semáforo de alertas e o que fazer primeiro.

## 🧠 Framework por trás
- Leitura crítica das **4 Campanhas de Ouro**: KPI fora do benchmark vira alerta.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-meta-diagnostico em .claude/skills/lb-meta-diagnostico/SKILL.md.

Objetivo: diagnóstico LIVE da conta Meta Ads.
- Resolve a conta em _memoria/contas-ads.md; puxa KPIs via Graph API (integracoes/meta-ads/).
- Avalia gasto, CPL, CTR, conversões e saúde geral contra benchmarks.
- Devolve alertas + recomendações priorizadas (o que atacar primeiro).
- Gatilhos: "diagnóstico meta", "como tá a conta", "kpis meta",
  "saúde da conta meta", /lb-meta-diagnostico.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-meta-diagnostico em .claude/skills/lb-meta-diagnostico/SKILL.md.
Puxa dado real da Graph API v21.0 -> KPIs + alertas + recomendações. Não é CSV manual.

FRONTMATTER:
- name: lb-meta-diagnostico
- description: Puxa KPIs Meta Ads LIVE da Graph API e gera diagnóstico da conta com
  alertas e recomendações priorizadas (gasto, CPL, CTR, conversões, saúde geral). Resolve
  a conta em _memoria/contas-ads.md. Gatilhos: "diagnóstico meta", "como tá a conta",
  "kpis meta", "saúde da conta meta", /lb-meta-diagnostico.

DEPENDÊNCIAS: motor integracoes/meta-ads/scripts/diagnostico.py; conta em
_memoria/contas-ads.md (resolve via --cliente); _memoria/framework-trafego.md (Bolo de
Cenoura); _memoria/empresa.md, estrategia.md, preferencias.md; credencial meta.env
(validar com meta_api.py --test).

PASSOS:
1. Carregar contexto + voz de _memoria/.
2. Identificar o cliente; se não dito, listar os de contas-ads.md.
3. Rodar python integracoes/meta-ads/scripts/diagnostico.py --cliente "<Cliente>".
4. Ler o JSON de KPIs retornado (gasto, CPL, CTR, conversões, alertas).
5. Camada framework (Bolo de Cenoura): interpretar os KPIs na voz LBCode e entregar 3
   recomendações priorizadas — validar consistência termo->anúncio->landing, identificar
   o maior gargalo do funil, apontar a ação imediata de maior impacto.
6. Devolver: KPIs + alertas + 3 recomendações priorizadas.

ERROS: token faltando -> conferir meta.env e rodar meta_api.py --test; cliente não achado
-> listar disponíveis; NUNCA exibir o token.
```

## ⚙️ Como funciona
1. Roda `/lb-meta-diagnostico` + cliente.
2. Puxa KPIs → classifica → prioriza.

## 🎥 Roteiro de gravação
1. **Gancho:** "Em 30 segundos sei se a conta está saudável ou queimando dinheiro."
2. Roda o comando.
3. Mostra os alertas priorizados.
4. **Fechamento:** "Diagnóstico aponta o problema. A auditoria mostra onde — próximo."

## 🗣️ Gancho de abertura pronto
> "Vou puxar os KPIs ao vivo e sair com um diagnóstico: o que está bom, o que é alerta e o que atacar primeiro."

## ✅ Demonstração ao vivo
- Lista de alertas + recomendações priorizadas.

## 🔗 Pré-requisitos
- `/lb-ads-conectar` ok; conta em `contas-ads.md`.
</content>
