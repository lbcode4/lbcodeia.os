# 🎬 Vídeo 15 — `/lb-google-meu-negocio`

> **Bloco 3 — Google orgânico.** Duração alvo: 6–8 min · Sem front.
> Foco: negócio local (não se aplica a SaaS nacional sem endereço).

## 🎯 Objetivo do vídeo
Otimização completa do Google Business Profile (GBP / Google Meu Negócio): nome+keyword+bairro, descrição de 750 chars, 5–8 perguntas&respostas pré-cadastradas com termo-alvo, respostas-template pra avaliações, fotos com nomes de arquivo otimizados, 4 posts iniciais + calendário. Inclui checklist de tempo.

## 💡 Dor → solução
- **Dor:** ficha do Google abandonada = invisível na busca local.
- **Solução:** otimização campo a campo seguindo a lógica de keyword + local.

## 🧠 Framework por trás
- **Bolo de Cenoura** em cada campo: termo-alvo distribuído de forma consistente.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-google-meu-negocio em .claude/skills/lb-google-meu-negocio/SKILL.md.

Objetivo: otimizar o Google Business Profile (GMN) inteiro.
- Nome (negócio + keyword + bairro), descrição de 750 chars.
- 5-8 perguntas&respostas pré-cadastradas com termo-alvo.
- Respostas-template pra avaliações.
- Sugestão de fotos com nomes de arquivo otimizados (ex: barbearia-premium-moema.jpg).
- 4 posts iniciais + calendário de posts.
- Checklist de tempo (esperar 5 dias, máx 3 fotos/dia) pra não penalizar a ficha.
- Aplica lógica do Bolo de Cenoura (termo-alvo consistente).
- Gatilhos: "otimizar google meu negócio", "configurar ficha google", "gbp", "gmn",
  /lb-google-meu-negocio.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-google-meu-negocio em .claude/skills/lb-google-meu-negocio/SKILL.md.
Premissa: GBP é a "rede social do Google", aparece na hora da pesquisa; ~90% dos
negócios não otimiza = ganho fácil.

FRONTMATTER:
- name: lb-google-meu-negocio
- description: Otimização completa de Google Business Profile (GBP/GMN). Aplica Bolo de
  Cenoura em todos os campos — nome+keyword+bairro, descrição 750 chars, 5-8 P&R com
  termo-alvo, respostas-template pra avaliações, fotos com nomes otimizados, 4 posts +
  calendário. Inclui checklist de tempo (esperar 5 dias, máx 3 fotos/dia). Gatilhos:
  "otimizar google meu negócio", "gbp", "gmn", "google business profile",
  /lb-google-meu-negocio.

DEPENDÊNCIAS: _memoria/framework-trafego.md (OBRIGATÓRIO — Bolo de Cenoura),
_memoria/empresa.md, _memoria/preferencias.md, pesquisa SEO em
saidas/marketing/google-seo/01-pesquisa-demanda.md (se existir, usa top keywords),
identidade/design-guide.md, WebSearch. Output em saidas/marketing/gbp/<YYYY-MM-DD>/.

PRINCÍPIO CENTRAL: aplicar Bolo de Cenoura em TODOS os campos (nome->keyword,
categoria->tema, descrição->keywords naturais, P&R->termo-alvo explícito, respostas a
avaliações->termo+bairro, nomes de arquivo->keyword, posts->keyword+bairro). Ficha
redundante (sem soar spam) > ficha vaga.

PRÉ-REQUISITOS: acesso ao GBP via Configurações->email (NUNCA senha; se não tem GBP,
cria do zero); top 5-10 keywords (rodar /lb-google-seo passo 1 antes, opcional);
aguardar 5 dias após pegar acesso antes de alterar.

WORKFLOW:
Passo 0 — ENTREVISTA GUIADA (15 itens: nome, nicho, cidade+bairro, serviços, telefone,
site, endereço, horário, fundação, tipo de atendimento, áreas, diferenciais, público,
perguntas frequentes, já tem GBP). Pré-preencher com empresa.md mostrando rascunho;
obrigatórios mínimos 1,2,3,4; confirmar resumo antes de gerar.
Passo 1 — diagnóstico do estado atual (se tem GBP: WebSearch "<nome> <cidade>", capturar
nome/categorias/avaliação/fotos/última publicação/P&R e marcar gaps; se não tem: marcar
criação do zero).
Passo 2 — nome otimizado (keyword + bairro quando a política permitir; sem keyword stuffing).
Passo 3 — categoria principal + 2-5 secundárias.
Passo 4 — descrição de 750 chars: frase 1 (até 100, quem é + onde + diferencial +
keyword), parágrafo do meio (serviços + dor que resolve), frase final (CTA suave +
horário/endereço). Tom de preferencias.md.
Passo 5 — 5-8 perguntas&respostas pré-cadastradas, cada resposta repetindo termo-alvo +
bairro 1x (campo ignorado por 99% = oportunidade).
Passo 6 — respostas-template pra avaliações (positiva 5⭐ e negativa 1-2⭐) sempre com
termo-alvo + bairro; detalhada delega /lb-google-avaliacoes.
Passo 7 — fotos: checklist (fachada, interior, produtos/serviços, equipe, logo) e
RENOMEAR antes de subir no padrão <keyword>-<bairro>-<conteúdo>.jpg; mín 720x720, máx 3
fotos/dia.
Passo 8 — 4 posts iniciais (apresentação, serviço principal, depoimento, promoção/
novidade), 150-300 chars com termo+bairro+CTA+imagem; calendário 1 post/semana.
Passo 9 — checklist de tempo CRÍTICO: esperar 5 dias antes de alterar, máx 3 fotos/dia,
1 post/semana, responder 100% das avaliações em 48h.

OUTPUT: pasta com 00-diagnostico.md, 01-nome-categoria.md, 02-descricao.md,
03-perguntas-respostas.md, 04-respostas-avaliacoes.md, 05-fotos-checklist.md,
06-posts-iniciais.md, 07-checklist-tempo.md, README.md (ordem de execução).

PRÓXIMOS PASSOS: oferecer Campanha #3 Dominação Top 1 (/lb-google-ads modo B), cadastro
em diretórios (NAP consistente), monitorar posições/reviews. Citar referência de preço
de serviço (setup R$500 / mensal R$300).

REGRAS: sempre ler framework-trafego.md; Bolo de Cenoura em todos os campos; esperar 5
dias; máx 3 fotos/dia; nunca pedir senha; nunca exagerar keyword no nome; sempre renomear
fotos; sempre criar P&R próprias; tom de preferencias.md.
```

## ⚙️ Como funciona
1. Roda `/lb-google-meu-negocio` + dados do negócio local.
2. Gera todos os campos otimizados + posts.
3. Entrega checklist de tempo.

## 🎥 Roteiro de gravação
1. **Gancho:** "Sua ficha do Google é seu melhor vendedor local — se estiver otimizada."
2. Roda pra um negócio local de exemplo.
3. Mostra a descrição + Q&A + nomes de fotos.
4. **Fechamento:** "Ficha pronta. Mas e as avaliações? Próximo vídeo."

## 🗣️ Gancho de abertura pronto
> "Vou otimizar uma ficha do Google Meu Negócio inteira — nome, descrição, perguntas, fotos e calendário de posts — pra dominar a busca do bairro."

## ✅ Demonstração ao vivo
- Campos prontos pra colar no GBP + checklist.

## 🔗 Pré-requisitos
- Memória; dados do negócio local (endereço/bairro).
</content>
