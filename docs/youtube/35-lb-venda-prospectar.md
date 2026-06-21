# 🎬 Vídeo 35 — `/lb-venda-prospectar`

> **Bloco 5 — Vendas.** Duração alvo: 9–12 min · Sem front.
> Vídeo mais "robusto" do bloco — orquestra dossiê + abordagem + follow-up.

## 🎯 Objetivo do vídeo
Orquestrar prospecção completa via Fórmula PLANO (Posicionamento, Lugar, Abordagens, Nicho, O que sei). Define nicho + acha 50–100 prospects em 5 fontes, levanta dossiê de cada (via `/lb-venda-dossie`), gera roteiro de 10 pontos com pontos de conexão, sequência de follow-up e material de valor.

## 💡 Dor → solução
- **Dor:** prospecção sem método = lista aleatória e abordagem fraca.
- **Solução:** funil estruturado (60–100 abordagens/sem → 1–2 fechamentos/mês).

## 🧠 Framework por trás
- **Fórmula PLANO** + **OPA** + **RETINA** na abordagem personalizada.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-venda-prospectar em .claude/skills/lb-venda-prospectar/SKILL.md.

Objetivo: orquestrar prospecção completa via Fórmula PLANO
(Posicionamento, Lugar, Abordagens, Nicho, O que sei).
- Define o nicho e acha 50-100 prospects em 5 fontes: Biblioteca de Anúncios Meta,
  Google site:, redes sociais, recursos do nicho e lista de contatos.
- Levanta dossiê de cada (chama /lb-venda-dossie).
- Gera roteiro de abordagem de 10 pontos com pontos de conexão personalizados,
  sequência de follow-up e material de valor.
- Funil-alvo: 60-100 abordagens/semana → 1-2 fechamentos/mês.
- Gatilhos: "achar cliente", "prospecção", "abordagem fria", "captar leads B2B",
  /lb-venda-prospectar.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-venda-prospectar em .claude/skills/lb-venda-prospectar/SKILL.md.
Orquestra a prospecção via Fórmula PLANO (transforma conhecimento técnico em dinheiro
via prospecção ativa).

FRONTMATTER:
- name: lb-venda-prospectar
- description: Orquestra prospecção completa via Fórmula PLANO (Posicionamento, Lugar,
  Abordagens, Nicho, O que sei). Define nicho + acha 50-100 prospects em 5 fontes,
  levanta dossiê de cada (via /lb-venda-dossie), gera roteiro de 10 pontos com pontos de
  conexão, sequência de follow-up e material de valor. Funil: 60-100 abordagens/sem ->
  1-2 fechamentos/mês. Gatilhos: "achar cliente", "prospecção", "vou prospectar",
  "abordagem fria", "captar leads B2B", /lb-venda-prospectar.

DEPENDÊNCIAS: _memoria/framework-trafego.md (OBRIGATÓRIO); skills /lb-venda-dossie e
/lb-conteudo-auditoria-insta; _memoria/empresa.md, preferencias.md; 99 scripts WhatsApp
se existir; WebSearch + WebFetch. Output em
saidas/marketing/prospeccao/<nicho>-<YYYY-MM-DD>/.

PRINCÍPIO: gestor vende dinheiro; pago pelo tamanho do problema; confiança vem da prática
(60-100 abordagens/sem), não do estudo.

WORKFLOW — FÓRMULA PLANO:
P (Posicionamento): auditar o PRÓPRIO IG do gestor via /lb-conteudo-auditoria-insta
(score <5/7 = arrumar antes); posicionamento padrão "prestador de serviços da internet".
N (Nicho): pedir nicho (ou sugerir por afinidade/margem/pesquisa 1h); default = prestador
que NÃO anuncia ainda; rodar agente persona do DONO (prompts/persona.md) pra extrair
métricas financeiras (faturamento, margem, ticket, LTV/CAC, ocupação).
L (Lugar — 5 fontes gratuitas): (1) lista de contatos pessoais + indicação com comissão;
(2) Biblioteca de Anúncios Meta (ver plataformas: só IG+turbinar = não domina; quem NÃO
anuncia = lead mais quente); (3) redes por nicho (Instagram/LinkedIn); (4) Google com
operadores (site:instagram.com <nicho> <cidade>, + gmail OR hotmail OR outlook); (5)
ferramentas verticais do nicho (App Barber, Doctoralia, Booksy). Meta: 50-100 leads.
O (O que eu sei — dossiê): pra cada lead/lote de 20-30, chamar /lb-venda-dossie; reservar
30-60 min/dia.
A (Abordagens): escolher 1-2 canais (WhatsApp recomendado pra começar; regra de ouro =
canal que faz constantemente). Roteiro de 10 pontos: cumprimento, quem sou+tempo, como te
encontrei, filtro do decisor, prova social (sem mentir), o que entrego, espaço pro não,
escassez com verdade, chamada pro material, ⭐ pontos de conexão do dossiê. Material de
valor ("Plano de Marketing"): persona, 3-5 ideias de anúncio, análise GBP
(/lb-google-meu-negocio) + IG (/lb-conteudo-auditoria-insta), sugestão de 1ª campanha,
scripts WhatsApp. Pós-resposta: preferir vídeo curto 1-2 min + 2 horários concretos.

OUTPUT: pasta com 00-persona-dono.md, 01-leads.csv, 02-leads-priorizados.csv, dossies/,
03-roteiros/ (1 por lead, por canal), 04-followups.md, 05-material-valor/, 06-funil-status.md.

FUNIL DE REFERÊNCIA: 60-100 abordagens/sem -> ~20% respondem -> ~20-30% reunião -> ~20-40%
fecham = 1-2 clientes/mês (~1h/dia).

FOLLOW-UP: D+1 confirmar recebimento; D+3 resgatar ponto de conexão + reenviar material;
D+7 mudar de canal; D+14 mensagem final "vou parar de incomodar"; D+30 touch sazonal.
Após D+14 sem resposta = arquivar como frio (voltar em 90 dias com motivo novo).

REGRAS: sempre ler framework-trafego.md; sempre auditar o próprio IG antes; sempre dossiê
antes de abordar; pontos de conexão ESPECÍFICOS; nunca inventar prova social; sempre 2
horários concretos; material de valor é grátis; volume é o que move (60-100/sem); adesão >
método; arquivar após D+14.
```

## ⚙️ Como funciona
1. Roda `/lb-venda-prospectar` + nicho.
2. Acha prospects → dossiês → roteiro + follow-up.

## 🎥 Roteiro de gravação
1. **Gancho:** "Vou montar uma máquina de prospecção: do nicho ao roteiro de abordagem."
2. Roda o comando pra um nicho.
3. Mostra a lista + roteiro de 10 pontos.
4. **Fechamento:** "Abordagem feita. E quem não respondeu? Sequência de follow-up — próximo."

## 🗣️ Gancho de abertura pronto
> "Prospecção sem método é loteria. Vou aplicar a Fórmula PLANO: achar prospects, levantar dossiê e gerar a abordagem personalizada de cada um."

## ✅ Demonstração ao vivo
- Lista de prospects + roteiro de abordagem.

## 🔗 Pré-requisitos
- `/lb-venda-dossie` criada; acesso web.
</content>
