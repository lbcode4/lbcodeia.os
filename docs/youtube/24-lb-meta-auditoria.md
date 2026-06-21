# 🎬 Vídeo 24 — `/lb-meta-auditoria`

> **Bloco 4 — Tráfego pago.** Duração alvo: 6–8 min · Sem front.

## 🎯 Objetivo do vídeo
Auditoria completa Meta Ads ao vivo via Graph API: analisa adsets, placements e criativos e identifica quick wins priorizados (onde está perdendo dinheiro). Resolve a conta em `_memoria/contas-ads.md`.

## 💡 Dor → solução
- **Dor:** sabe que tem desperdício, mas não acha onde está vazando.
- **Solução:** auditoria que aponta os quick wins por adset/placement/criativo.

## 🧠 Framework por trás
- Otimização das **4 Campanhas de Ouro** no nível de execução (adset/placement).

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-meta-auditoria em .claude/skills/lb-meta-auditoria/SKILL.md.

Objetivo: auditoria LIVE Meta Ads em busca de quick wins.
- Resolve a conta em _memoria/contas-ads.md; puxa dados via Graph API.
- Analisa adsets, placements e criativos.
- Identifica quick wins priorizados (onde está perdendo dinheiro) e o ganho estimado.
- Gatilhos: "auditoria meta", "quick wins meta",
  "onde tô perdendo dinheiro no meta", /lb-meta-auditoria.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-meta-auditoria em .claude/skills/lb-meta-auditoria/SKILL.md.
Puxa dado real da Graph API v21.0 -> auditoria de adsets/placements + quick wins.

FRONTMATTER:
- name: lb-meta-auditoria
- description: Faz auditoria completa Meta Ads LIVE via Graph API — analisa adsets,
  placements, criativos e identifica quick wins priorizados (onde está perdendo dinheiro).
  Resolve a conta em _memoria/contas-ads.md. Gatilhos: "auditoria meta", "auditar conta
  meta", "quick wins meta", "onde tô perdendo dinheiro no meta", /lb-meta-auditoria.

DEPENDÊNCIAS: motor integracoes/meta-ads/scripts/auditoria.py; agente/método
integracoes/meta-ads/agentes/agente-auditoria-meta.md; conta em _memoria/contas-ads.md
(resolve via --cliente); _memoria/framework-trafego.md (Bolo de Cenoura);
_memoria/empresa.md, estrategia.md, preferencias.md; credencial meta.env.

PASSOS:
1. Carregar contexto + voz de _memoria/.
2. Identificar o cliente; se não dito, listar os de contas-ads.md.
3. Rodar python integracoes/meta-ads/scripts/auditoria.py --cliente "<Cliente>".
4. Ler o JSON/texto retornado (adsets, placements, criativos, problemas).
5. Camada framework (Bolo de Cenoura): interpretar os achados na voz LBCode e entregar
   quick wins priorizados — onde queima orçamento, qual placement/adset desligar primeiro,
   qual criativo tem mais problema de consistência termo->anúncio->landing.
6. Devolver: achados + quick wins ordenados por impacto.

ERROS: token faltando -> conferir meta.env e rodar meta_api.py --test; cliente não achado
-> listar disponíveis; NUNCA exibir o token.
```

## ⚙️ Como funciona
1. Roda `/lb-meta-auditoria` + cliente.
2. Varre adsets/placements/criativos.
3. Lista quick wins priorizados.

## 🎥 Roteiro de gravação
1. **Gancho:** "Sua conta está vazando dinheiro. Vou achar exatamente onde."
2. Roda o comando.
3. Mostra a lista de quick wins com prioridade.
4. **Fechamento:** "Achei o que cortar. Agora vamos gerar copy nova dos vencedores."

## 🗣️ Gancho de abertura pronto
> "Toda conta tem dinheiro vazando em algum placement ou criativo ruim. Vou rodar uma auditoria e listar os quick wins por ordem de impacto."

## ✅ Demonstração ao vivo
- Quick wins priorizados.

## 🔗 Pré-requisitos
- `/lb-ads-conectar` ok; conta em `contas-ads.md`.
</content>
