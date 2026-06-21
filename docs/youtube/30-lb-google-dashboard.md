# 🎬 Vídeo 30 — `/lb-google-dashboard`

> **Bloco 4 — Tráfego pago.** Duração alvo: 6–8 min · Sem front.

## 🎯 Objetivo do vídeo
Puxar performance do Google Ads ao vivo da API e gerar um dashboard HTML completo. Resolve a conta pela coluna 'Google Ads ID' de `_memoria/contas-ads.md`. Diferente de `/lb-google-ads` (que gera CSV pra criar campanha) — este puxa a performance real.

## 💡 Dor → solução
- **Dor:** painel do Google Ads é confuso e ruim de apresentar.
- **Solução:** dashboard HTML limpo, gerado direto da API.

## 🧠 Framework por trás
- Mensuração das campanhas Search (espelha o `/lb-meta-dashboard` no Google).

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-google-dashboard em .claude/skills/lb-google-dashboard/SKILL.md.

Objetivo: puxar performance Google Ads LIVE da API e gerar dashboard HTML.
- Resolve a conta pela coluna Google Ads ID de _memoria/contas-ads.md.
- Usa a lib de integracoes/google-ads/ (Google Ads API + yaml de credenciais).
- Dashboard HTML com campanhas, grupos, métricas e tendência.
- Diferente de lb-google-ads (CSV pra criar): este puxa performance real.
- Gatilhos: "dashboard google", "performance google ads", "relatório google live",
  /lb-google-dashboard.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-google-dashboard em .claude/skills/lb-google-dashboard/SKILL.md.
Puxa dado real da Google Ads API -> HTML.

FRONTMATTER:
- name: lb-google-dashboard
- description: Puxa performance Google Ads LIVE da API e gera dashboard HTML completo.
  Resolve a conta pela coluna 'Google Ads ID' de _memoria/contas-ads.md. Diferente de
  /lb-google-ads (que gera CSV pra criar campanha) — este puxa performance real. Gatilhos:
  "dashboard google", "performance google ads", "relatório google live", /lb-google-dashboard.

DEPENDÊNCIAS: motor integracoes/google-ads/lib/dashboard_google.py; agente/método
integracoes/google-ads/agentes/agente-auditoria-google.md (keywords, QS, quick wins);
conta em _memoria/contas-ads.md (coluna Google Ads ID, resolve via --cliente);
_memoria/framework-trafego.md (Bolo de Cenoura); _memoria/empresa.md, estrategia.md,
preferencias.md; credencial integracoes/credentials/google-ads.yaml (validar com
/lb-ads-conectar).

PASSOS:
1. Carregar contexto + voz de _memoria/.
2. Resolver cliente em contas-ads.md (precisa Google Ads ID preenchido).
3. Rodar python integracoes/google-ads/lib/dashboard_google.py --cliente "<Cliente>".
4. Pegar o HTML gerado em saidas/relatorios/<slug>/.
5. Camada framework (Bolo de Cenoura): ler KPIs e entregar 3 insights na voz LBCode.
6. Devolver: caminho do HTML + os 3 insights.

ERROS: credencial faltando -> instruir /lb-ads-conectar (ramo Google); cliente sem Google
Ads ID -> avisar e pedir cadastro via /lb-ads-conectar; NUNCA exibir credenciais.
```

## ⚙️ Como funciona
1. Roda `/lb-google-dashboard` + cliente.
2. Resolve Google Ads ID → chama API → gera HTML.

## 🎥 Roteiro de gravação
1. **Gancho:** "Performance do Google Ads ao vivo, num dashboard de apresentar."
2. Roda o comando.
3. Abre o HTML.
4. **Fechamento:** "Meta e Google separados. E se eu juntar os dois? Próximo vídeo."

## 🗣️ Gancho de abertura pronto
> "Vou puxar a performance do Google Ads ao vivo e gerar um dashboard HTML limpo, pronto pra reunião com cliente."

## ✅ Demonstração ao vivo
- HTML do Google Ads.

## 🔗 Pré-requisitos
- Google Ads API configurada (yaml); `Google Ads ID` em `contas-ads.md`.
</content>
