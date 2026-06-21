# 🎬 Vídeo 32 — `/lb-ads-negativas`

> **Bloco 4 — Tráfego pago.** Duração alvo: 5–7 min · Sem front.
> Fecha o bloco de ads com economia direta de verba.

## 🎯 Objetivo do vídeo
Analisar termos de busca do Google Ads (search_term_view) e montar lista de palavras-chave negativas pronta pra implementar, agrupada por tema, com o gasto desperdiçado justificando cada uma. Resolve a conta pela coluna 'Google Ads ID' de `_memoria/contas-ads.md`.

## 💡 Dor → solução
- **Dor:** o Google mostra seu anúncio pra buscas irrelevantes e você paga por isso.
- **Solução:** lista de negativas baseada no gasto real desperdiçado, pronta pra colar.

## 🧠 Framework por trás
- **Bolo de Cenoura:** consistência termo→anúncio — corta o que não pertence.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-ads-negativas em .claude/skills/lb-ads-negativas/SKILL.md.

Objetivo: gerar lista de palavras-chave negativas a partir dos termos de busca reais.
- Resolve a conta pela coluna Google Ads ID de _memoria/contas-ads.md.
- Puxa search_term_view via Google Ads API.
- Agrupa as negativas por tema e justifica cada uma com o gasto desperdiçado.
- Saída pronta pra implementar.
- Gatilhos: "negativas", "palavras-chave negativas", "termos de busca",
  "onde tô gastando à toa no google", /lb-ads-negativas.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-ads-negativas em .claude/skills/lb-ads-negativas/SKILL.md.
Puxa search_term_view -> categoriza desperdício -> lista de negativas.

FRONTMATTER:
- name: lb-ads-negativas
- description: Analisa termos de busca do Google Ads (search_term_view) e monta lista de
  palavras-chave negativas pronta pra implementar, agrupada por tema, com gasto
  desperdiçado justificando cada uma. Resolve a conta pela coluna Google Ads ID de
  _memoria/contas-ads.md. Gatilhos: "negativas", "palavras-chave negativas", "termos de
  busca", "onde tô gastando à toa no google", /lb-ads-negativas.

DEPENDÊNCIAS: motor integracoes/google-ads/lib/negativas.py; agente/método
integracoes/google-ads/agentes/agente-negativas.md; conta em _memoria/contas-ads.md
(Google Ads ID); credencial integracoes/credentials/google-ads.yaml.

PASSOS:
1. Resolver cliente -> pegar Google Ads ID em contas-ads.md.
2. Rodar python integracoes/google-ads/lib/negativas.py --customer-id <ID> --days 30.
3. Aplicar o método de agente-negativas.md: categorizar desperdício (irrelevante,
   informacional, concorrente, emprego, DIY, geo, público).
4. Montar lista de negativas agrupada por tema + tipo de correspondência (exata/frase).
5. Calcular impacto: gasto desperdiçado no período + economia projetada.
6. Devolver: lista pronta pra implementar + justificativa de gasto por negativa.

ERROS: credencial faltando -> instruir /lb-ads-conectar (ramo Google); NUNCA exibir
credenciais.
```

## ⚙️ Como funciona
1. Roda `/lb-ads-negativas` + cliente.
2. Puxa termos de busca → identifica lixo → agrupa.

## 🎥 Roteiro de gravação
1. **Gancho:** "Quanto você paga por buscas que nunca vão comprar? Vou cortar isso."
2. Roda o comando.
3. Mostra a lista por tema + gasto desperdiçado.
4. **Fechamento:** "Bloco de tráfego fechado. Agora, prospecção e vendas."

## 🗣️ Gancho de abertura pronto
> "O Google adora mostrar seu anúncio pra busca errada. Vou puxar os termos reais e montar a lista de negativas, justificada pelo dinheiro que você está perdendo."

## ✅ Demonstração ao vivo
- Lista de negativas por tema + gasto justificado.

## 🔗 Pré-requisitos
- Google Ads API; `Google Ads ID` em `contas-ads.md`.
</content>
