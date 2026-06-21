# 🎬 Vídeo 20 — `/lb-meta-campanha-seguidores`

> **Bloco 4 — Tráfego pago.** Duração alvo: 6–8 min · Sem front.
> **Campanha de Ouro #1 — Seguidores Qualificados.**

## 🎯 Objetivo do vídeo
Criar a Campanha de Ouro #1 via Meta Business Suite (não "Turbinar" pelo iPhone — taxa Apple 30%). 5 passos: auditoria de perfil → selecionar até 5 publicações qualificadas (Reels > carrossel) → público manual com CEP/pino+raio → orçamento mínimo R$6/dia → publicar. Sempre recusa o botão Turbinar pelo iPhone.

## 💡 Dor → solução
- **Dor:** turbinar pelo celular cobra 30% a mais (taxa Apple) e segmenta mal.
- **Solução:** roteiro pelo Business Suite com público manual e custo mínimo.

## 🧠 Framework por trás
- **4 Campanhas de Ouro (#1)** + auditoria de perfil (liga com `/lb-conteudo-auditoria-insta`).

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-meta-campanha-seguidores em .claude/skills/lb-meta-campanha-seguidores/SKILL.md.

Objetivo: montar a Campanha de Ouro #1 (seguidores qualificados) pelo Meta Business Suite.
- 5 passos: auditoria de perfil → selecionar até 5 publicações qualificadas
  (priorizar Reels > carrossel) → público manual com CEP/pino + raio →
  orçamento mínimo R$6/dia → publicar.
- SEMPRE recusar o botão "Turbinar" pelo iPhone (taxa Apple 30%); usar o Business Suite.
- Gatilhos: "campanha de seguidores", "anunciar perfil instagram",
  "ganhar seguidores qualificados", /lb-meta-campanha-seguidores.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-meta-campanha-seguidores em .claude/skills/lb-meta-campanha-seguidores/SKILL.md.
Roda via Meta Business Suite, NÃO pelo botão Turbinar do iPhone (30% taxa Apple).

FRONTMATTER:
- name: lb-meta-campanha-seguidores
- description: Cria Campanha de Ouro #1 (Seguidores Qualificados) via Meta Business Suite.
  5 passos: auditoria perfil -> selecionar até 5 publicações qualificadas (Reels >
  carrossel) -> público manual com CEP/pino+raio -> orçamento mínimo R$6/dia -> publicar.
  Sempre recusa o botão Turbinar pelo iPhone. Gatilhos: "campanha de seguidores",
  "anunciar perfil instagram", "ganhar seguidores qualificados", /lb-meta-campanha-seguidores.

DEPENDÊNCIAS: _memoria/framework-trafego.md (OBRIGATÓRIO); /lb-conteudo-auditoria-insta
(rodar antes — score <5/7 = não anunciar); _memoria/empresa.md, _memoria/preferencias.md.
Output em saidas/marketing/campanhas/engajamento/meta-seguidores-<YYYY-MM-DD>/.

PRÉ-REQUISITOS: perfil IG auditado (score >=5/7); conta Meta Business Suite; Página FB
conectada ao IG; pagamento ativo; 5 publicações que atraiam público qualificado (não meme
viral).

3 FORMAS DE SUBIR: Turbinar pelo iPhone = NÃO (30% Apple); Meta Business Suite = SIM
(default, mais segmentação, sem taxa); Gerenciador = caro pra seguidor. Default = Business
Suite.

WORKFLOW — 5 PASSOS:
1. Acessar conta de anúncios em business.facebook.com (conta certa; acesso via email,
   nunca senha).
2. Navegação: Todas as ferramentas -> Meta Business Suite -> Conteúdo.
3. Selecionar publicação (X da questão): NÃO escolher meme/post de mais engajamento.
   Escolher post que atrai público QUALIFICADO (Reels > carrossel; tipo T ou N do RETINA;
   evitar E/meme). Até 5 publicações (Meta distribui na que performar).
4. Configurar público: gênero + idade por persona; localização CRÍTICA (default cai na
   França — editar pra Brasil; cuidado bairro "Brasil" na BA; local = CEP ou pino+raio
   ~1km; nacional = Brasil/regiões); público MANUAL no início (<30 dias), Advantage só com
   histórico.
5. Programação + orçamento + publicar: datas (7-14 dias teste); orçamento mínimo R$6/dia
   (~600-1900 pessoas/dia; recomendado R$10-20/dia x 7); revisar e publicar. Resultado em
   24-48h; custo por seguidor R$0,30-2,00.

OUTPUT: pasta com configuracao.md (5 passos), publicacoes-escolhidas.md (5 posts + porquê),
publico.md, orcamento.md, resultado-esperado.md.

CHECKLIST: perfil score >=5/7; 5 publicações qualificadas (não meme); Reels priorizados;
idade+gênero por persona; localização Brasil; CEP/pino+raio se local; público manual;
orçamento >=R$6/dia; datas definidas; pagamento ativo; campanha começa pausada.

MÉTRICAS: custo por seguidor (R$0,30-2,00), engagement rate dos novos, crescimento %,
conversão seguidor->mensagem WhatsApp.

REGRAS: sempre ler framework-trafego.md; NUNCA Turbinar pelo iPhone; NUNCA escolher meme;
sempre auditar perfil antes; sempre validar Brasil; sempre público manual no início; Reels
> carrossel; mínimo R$6/dia; começar pausado.
```

## ⚙️ Como funciona
1. Roda `/lb-meta-campanha-seguidores`.
2. Entrega os 5 passos com seleção de posts + público.

## 🎥 Roteiro de gravação
1. **Gancho:** "Turbinar pelo iPhone te cobra 30% a mais. Tem jeito certo."
2. Roda o comando.
3. Percorre os 5 passos no Business Suite.
4. **Fechamento:** "Campanhas criadas. Agora vamos medir — dashboard ao vivo."

## 🗣️ Gancho de abertura pronto
> "O botão Turbinar do iPhone cobra taxa da Apple e segmenta mal. Vou ganhar seguidores qualificados pelo caminho certo, gastando o mínimo."

## ✅ Demonstração ao vivo
- 5 passos + critério de seleção de posts.

## 🔗 Pré-requisitos
- Perfil auditado (vídeo 13); conta Meta Business Suite.
</content>
