# 🎬 Vídeo 31 — `/lb-ads-unificado`

> **Bloco 4 — Tráfego pago.** Duração alvo: 6–8 min · Sem front.

## 🎯 Objetivo do vídeo
Gerar relatório unificado Google Ads + Meta Ads num HTML só, com resumo cross-platform. Roda os dois motores ao vivo e funde. Resolve a conta em `_memoria/contas-ads.md` (precisa Google Ads ID E Meta Ad Account preenchidos).

## 💡 Dor → solução
- **Dor:** comparar gasto e retorno entre Google e Meta exige abrir dois painéis e fazer conta na mão.
- **Solução:** um relatório só, cross-platform, com a foto completa do tráfego pago.

## 🧠 Framework por trás
- Visão de portfólio das **4 Campanhas de Ouro** entre plataformas.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-ads-unificado em .claude/skills/lb-ads-unificado/SKILL.md.

Objetivo: relatório unificado Google + Meta num HTML só.
- Resolve a conta em _memoria/contas-ads.md (precisa Google Ads ID E Meta Ad Account).
- Roda os dois motores live (integracoes/google-ads/ + integracoes/meta-ads/) e funde.
- Resumo cross-platform: gasto, resultados e custo por resultado lado a lado.
- Gatilhos: "relatório unificado", "google e meta juntos", "dashboard geral de ads",
  /lb-ads-unificado.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-ads-unificado em .claude/skills/lb-ads-unificado/SKILL.md.
Funde os 2 dashboards num HTML cross-platform.

FRONTMATTER:
- name: lb-ads-unificado
- description: Gera relatório unificado Google Ads + Meta Ads num HTML só, com resumo
  cross-platform. Roda os dois motores live e funde. Resolve a conta em
  _memoria/contas-ads.md (precisa Google Ads ID E Meta Ad Account preenchidos). Gatilhos:
  "relatório unificado", "google e meta juntos", "dashboard geral de ads", /lb-ads-unificado.

DEPENDÊNCIAS: motor integracoes/google-ads/lib/dashboard_unificado.py (chama relatorio.py
+ dashboard_google.py); conta em _memoria/contas-ads.md (precisa Google Ads ID + Meta Ad
Account); framework Bolo de Cenoura (consistência cross-platform); credenciais Meta
(meta.env) + Google (google-ads.yaml).

PASSOS:
1. Carregar contexto + voz de _memoria/.
2. Resolver cliente (precisa AMBOS os IDs). Se faltar um, avisar qual.
3. Rodar python integracoes/google-ads/lib/dashboard_unificado.py --cliente "<Cliente>".
4. Pegar o HTML unificado em output/.
5. Camada framework: comparar Google vs Meta, apontar onde o orçamento rende mais, na voz
   LBCode.
6. Devolver: caminho do HTML + leitura cross-platform.

ERROS: falta credencial de uma plataforma -> rodar só a que tem + avisar; cliente sem um
dos IDs -> instruir cadastro via /lb-ads-conectar.
```

## ⚙️ Como funciona
1. Roda `/lb-ads-unificado` + cliente.
2. Puxa Google + Meta → funde → gera HTML.

## 🎥 Roteiro de gravação
1. **Gancho:** "Google e Meta no mesmo relatório. Onde meu dinheiro rende mais?"
2. Roda o comando.
3. Mostra o comparativo cross-platform.
4. **Fechamento:** "Visão geral pronta. Agora, parar de queimar verba com negativas."

## 🗣️ Gancho de abertura pronto
> "Vou juntar Google e Meta num relatório só pra ver, lado a lado, onde o dinheiro rende mais."

## ✅ Demonstração ao vivo
- HTML unificado com resumo cross-platform.

## 🔗 Pré-requisitos
- Ambas as credenciais; Google Ads ID E Meta Ad Account em `contas-ads.md`.
</content>
