# 🎬 Vídeo 27 — `/lb-meta-analise-reels`

> **Bloco 4 — Tráfego pago.** Duração alvo: 5–7 min · Sem front.

## 🎯 Objetivo do vídeo
Analisar Reels do Instagram ao vivo via Graph API, classificar por performance e recomendar quais impulsionar, alinhado ao posicionamento do negócio. Resolve a conta em `_memoria/contas-ads.md`.

## 💡 Dor → solução
- **Dor:** impulsionar Reels no chute desperdiça verba.
- **Solução:** ranking por performance + recomendação do que vale colocar dinheiro.

## 🧠 Framework por trás
- **4 Campanhas de Ouro** + RETINA: impulsiona só o que reforça posicionamento.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-meta-analise-reels em .claude/skills/lb-meta-analise-reels/SKILL.md.

Objetivo: analisar Reels LIVE e recomendar quais impulsionar com verba.
- Resolve a conta em _memoria/contas-ads.md; puxa Reels via Graph API.
- Classifica por performance (alcance, retenção, engajamento).
- Recomenda quais impulsionar, alinhado ao posicionamento (RETINA).
- Gatilhos: "analisar reels", "ranking de reels", "qual reel impulsionar",
  "melhores reels", /lb-meta-analise-reels.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-meta-analise-reels em .claude/skills/lb-meta-analise-reels/SKILL.md.
Puxa dado real da Graph API v21.0 -> ranking de Reels + recomendação de impulsionamento.

FRONTMATTER:
- name: lb-meta-analise-reels
- description: Analisa Reels Instagram LIVE via Graph API — classifica por performance e
  recomenda quais impulsionar alinhado ao posicionamento do negócio. Resolve a conta em
  _memoria/contas-ads.md. Gatilhos: "analisar reels", "ranking de reels", "qual reel
  impulsionar", "melhores reels", "reels meta", /lb-meta-analise-reels.

DEPENDÊNCIAS: motor integracoes/meta-ads/scripts/reels.py; agente/método
integracoes/meta-ads/agentes/agente-reels-organico.md; conta em _memoria/contas-ads.md
(resolve via --cliente); _memoria/framework-trafego.md (RETINA); _memoria/empresa.md,
estrategia.md, preferencias.md; credencial meta.env.

PASSOS:
1. Carregar contexto + voz de _memoria/.
2. Identificar o cliente; se não dito, listar os de contas-ads.md.
3. Rodar python integracoes/meta-ads/scripts/reels.py --cliente "<Cliente>".
4. Ler o ranking retornado (alcance, engajamento, retenção).
5. Camada framework (RETINA): interpretar na voz LBCode — qual conteúdo ressoou com o
   posicionamento, qual Reel impulsionar (e por que alinha ao diferencial), qual evitar
   impulsionar (tema fora do posicionamento mesmo com bom engajamento).
6. Devolver: ranking + recomendação de quais impulsionar com justificativa de posicionamento.

ERROS: token faltando -> conferir meta.env e rodar meta_api.py --test; cliente não achado
-> listar disponíveis; NUNCA exibir o token.
```

## ⚙️ Como funciona
1. Roda `/lb-meta-analise-reels` + cliente.
2. Puxa Reels → ranqueia → recomenda.

## 🎥 Roteiro de gravação
1. **Gancho:** "Não impulsione no chute. Vou mostrar quais Reels merecem verba."
2. Roda o comando.
3. Mostra o ranking + recomendação.
4. **Fechamento:** "Esse decide o que impulsionar. O próximo usa o orgânico pra criar o próximo Reel."

## 🗣️ Gancho de abertura pronto
> "Colocar dinheiro no Reel errado é desperdício. Vou ranquear os Reels e recomendar quais impulsionar."

## ✅ Demonstração ao vivo
- Ranking + recomendação de impulsionamento.

## 🔗 Pré-requisitos
- `/lb-ads-conectar` ok; Instagram conectado.
</content>
