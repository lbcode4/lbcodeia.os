# 🎬 Vídeo 28 — `/lb-meta-analise-reels-organico`

> **Bloco 4 — Tráfego pago.** Duração alvo: 6–8 min · Sem front.

## 🎯 Objetivo do vídeo
Analisar o desempenho ORGÂNICO dos Reels (últimos 90 dias) via Graph API, identificar padrões vencedores e perdedores e devolver um roteiro data-driven pro próximo Reel — pronto pra detalhar no `/lb-conteudo-reels`. Resolve a conta em `_memoria/contas-ads.md`.

## 💡 Dor → solução
- **Dor:** criar Reel novo sem aprender com o que já deu certo no perfil.
- **Solução:** lê o histórico orgânico, acha o padrão vencedor e já entrega o roteiro do próximo.

## 🧠 Framework por trás
- Dados orgânicos → **RETINA + 4 ganchos**: criação baseada em evidência, não achismo.
- Diferente do vídeo 27 (que decide impulsionamento pago); aqui o foco é o orgânico e a criação.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-meta-analise-reels-organico em .claude/skills/lb-meta-analise-reels-organico/SKILL.md.

Objetivo: analisar Reels orgânicos (90 dias) e gerar roteiro data-driven do próximo.
- Resolve a conta em _memoria/contas-ads.md; puxa Reels orgânicos via Graph API.
- Identifica padrões vencedores e perdedores (gancho, duração, formato, tema).
- Devolve um roteiro do próximo Reel baseado nos dados, pronto pra detalhar
  em /lb-conteudo-reels.
- Gatilhos: "analisar reels orgânicos", "o que funciona nos meus reels",
  "próximo reel baseado em dados", /lb-meta-analise-reels-organico.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-meta-analise-reels-organico em
.claude/skills/lb-meta-analise-reels-organico/SKILL.md.
Princípio: não chuta o próximo Reel — lê o que o público já premiou e repete o padrão.

FRONTMATTER:
- name: lb-meta-analise-reels-organico
- description: Analisa o desempenho ORGÂNICO dos Reels (últimos 90 dias) via Graph API,
  identifica padrões vencedores e perdedores e devolve um roteiro data-driven pro próximo
  Reel — pronto pra detalhar em /lb-conteudo-reels. Resolve a conta em
  _memoria/contas-ads.md. Diferente de /lb-meta-analise-reels (que decide impulsionamento
  pago). Gatilhos: "analisar reels orgânicos", "o que funciona nos meus reels", "padrão
  de reel que viraliza", "próximo reel baseado em dados", /lb-meta-analise-reels-organico.

DEPENDÊNCIAS: cérebro/método integracoes/meta-ads/agentes/agente-reels-organico.md
(OBRIGATÓRIO); motor integracoes/meta-ads/scripts/reels.py; conta em
_memoria/contas-ads.md; _memoria/framework-trafego.md (RETINA + 4 ganchos);
_memoria/empresa.md, estrategia.md, preferencias.md; credencial meta.env. Output em
saidas/relatorios/reels-organico/<Cliente>/analise-<YYYY-MM-DD>.md.

PASSOS:
1. Carregar contexto + voz; ler o método em agente-reels-organico.md.
2. Identificar o cliente (listar de contas-ads.md se não dito).
3. Rodar python integracoes/meta-ads/scripts/reels.py --cliente "<Cliente>" --days 90
   (retorna por Reel: caption, timestamp, permalink, reach, likes, comments, shares,
   saves, watch, engagement_rate).
4. Classificar cada Reel pela média de eng rate: TOP (maior), ALTO (>média+20%), MÉDIO
   (±20%), BAIXO (<média-30%). Ordenar desc; derivar título curto da caption e data DD/MM/AA.
5. Insight por Reel: 1 parágrafo ligando métrica a causa (saves=intenção, shares=viral,
   watch=retenção); definir insightTone (success/info/warning/error).
6. Padrões: padroesVencedores (top 20%: tema/duração/formato/hook/horário) e
   padroesPerdedores (bottom 20%); camada RETINA mapeia cada padrão vencedor a um pilar e
   descarta o que viraliza fora do posicionamento (resumir em leituraRetina).
7. Impulsionamento: escolher Reels que valem verba priorizados (prioridade P1/P2/P3,
   reelRank, desc, publico, objetivo, orcamento R$/dia×dias, duracao) + naoImpulsionar
   com motivo.
8. 3 novos roteiros clonando os padrões vencedores (n, titulo, tema, formato, duracao,
   gancho, estrutura[], cta, porque, copy[], tags[]).
9. Alertas e próximos passos (pontos fortes, riscos como gap de publicação, próximos
   passos) cada item {tipo, titulo, desc}.
10. Salvar markdown em saidas/relatorios/reels-organico/<Cliente>/ e emitir o bloco JSON
    do contrato (a tela /organico-instagram consome; reels[].rank é 1-based;
    impulsionar[].reelRank referencia esse rank).

ERROS: token faltando -> meta_api.py --test; cliente não achado -> listar; <5 Reels em 90
dias -> avisar amostra fraca e usar /lb-conteudo-reels do zero; NUNCA exibir o token.

REGRAS: roteiro nasce do dado (não do achismo); RETINA filtra (padrão fora do
posicionamento não entra); orgânico != pago (verba é /lb-meta-analise-reels).
```

## ⚙️ Como funciona
1. Roda `/lb-meta-analise-reels-organico` + cliente.
2. Lê 90 dias → acha padrão → propõe roteiro.

## 🎥 Roteiro de gravação
1. **Gancho:** "Seus próprios Reels já te dizem o que postar. Vou extrair esse padrão."
2. Roda o comando.
3. Mostra o padrão vencedor + roteiro proposto.
4. Emenda no `/lb-conteudo-reels` pra detalhar.
5. **Fechamento:** "Criação por dados. Agora, relatório semanal a partir de CSV."

## 🗣️ Gancho de abertura pronto
> "Vou deixar os dados decidirem o próximo Reel: o sistema lê 90 dias de orgânico, acha o padrão que viraliza e já entrega o roteiro."

## ✅ Demonstração ao vivo
- Padrão vencedor + roteiro data-driven.

## 🔗 Pré-requisitos
- `/lb-ads-conectar` ok; Instagram com histórico de Reels.
</content>
