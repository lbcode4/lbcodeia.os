# 🎬 Vídeo 36 — `/lb-venda-follow-up`

> **Bloco 5 — Vendas.** Duração alvo: 4–6 min · Sem front.

## 🎯 Objetivo do vídeo
Gerar sequência personalizada de 5 mensagens de follow-up pós-abordagem com ângulos diferentes (confirmação, valor, prova, urgência, reativação). Salva em `saidas/marketing/prospeccao/<prospect>/`. Complementa o `/lb-venda-prospectar`, que para na abordagem inicial.

## 💡 Dor → solução
- **Dor:** o prospect não respondeu e você não sabe como insistir sem ser chato.
- **Solução:** 5 ângulos diferentes que mantêm a conversa viva sem repetir "tudo bem?".

## 🧠 Framework por trás
- **Bolo de Cenoura** aplicado a vendas: nutrição em sequência até o "sim".

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-venda-follow-up em .claude/skills/lb-venda-follow-up/SKILL.md.

Objetivo: gerar sequência de 5 mensagens de follow-up pós-abordagem.
- Cada mensagem com um ângulo: confirmação, valor, prova, urgência, reativação.
- Personaliza pelo dossiê do prospect, se existir.
- Salva em saidas/marketing/prospeccao/<prospect>/venda-follow-up.md.
- Gatilhos: "follow-up", "não respondeu o que faço", "como reativar prospect",
  /lb-venda-follow-up.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-venda-follow-up em .claude/skills/lb-venda-follow-up/SKILL.md.
Princípio: 80% das vendas fecham no follow-up 5 a 8; quem para no 1 deixa dinheiro na mesa.

FRONTMATTER:
- name: lb-venda-follow-up
- description: Gera sequência personalizada de 5 mensagens de follow-up pós-abordagem com
  ângulos diferentes (confirmação, valor, prova, urgência, reativação). Salva em
  saidas/marketing/prospeccao/<prospect>/venda-follow-up.md. Complementa /lb-venda-prospectar.
  Gatilhos: "follow-up", "sequência de acompanhamento", "não respondeu o que faço",
  "como reativar prospect", /lb-venda-follow-up.

DEPENDÊNCIAS: dossiê do prospect se existir
(saidas/marketing/prospeccao/dossies/<slug>.md); _memoria/empresa.md, preferencias.md.
Output em saidas/marketing/prospeccao/<slug>/venda-follow-up.md.

WORKFLOW:
Passo 1 — receber: nome do prospect (+ slug se tem dossiê); estágio atual (A=abordagem
sem resposta; B=respondeu e esfriou; C=recebeu proposta sem resposta; D="vou pensar" e
parou); canal (WhatsApp/email/DM); tempo desde último contato.
Passo 2 — ler o dossiê se existir e extrair pontos de conexão pra personalizar.
Passo 3 — gerar 5 mensagens com ângulos: FUP1 Confirmação (D+1-2), FUP2 Valor (D+4-5),
FUP3 Prova (D+8-10), FUP4 Urgência real (D+14-15), FUP5 Reativação "vou parar de
incomodar" (D+21-30). Formato: WhatsApp máx 3-4 linhas, email 1 parágrafo; abertura
natural ("Oi [Nome]," nunca "Olá, tudo bem com você?"); 1 elemento do dossiê por
mensagem; 1 CTA por mensagem. Adaptar a sequência ao estágio (A/B/C/D) — incluir as
variações de cada estágio (ex: B no FUP3 oferece /lb-venda-diagnostico como reativação).
Passo 4 — salvar markdown com cada FUP (ângulo, data de envio, checkboxes de enviado/
resposta) + status final (fechou valor / arquivado frio / em andamento).
Passo 5 — se estágio C/D com objeção visível, oferecer /lb-venda-objecoes.

REGRAS: personalizar (genérico = 3x menos resposta); curto; 1 CTA por mensagem; nunca
inventar prova social; FUP5 é a saída elegante (nunca mais que 5 sem resposta); arquivar
após FUP5 (voltar em 90 dias); atualizar status no arquivo.
```

## ⚙️ Como funciona
1. Roda `/lb-venda-follow-up` + prospect.
2. Gera as 5 mensagens com ângulos distintos.

## 🎥 Roteiro de gravação
1. **Gancho:** "Não respondeu? O dinheiro está no follow-up. Vou gerar 5 mensagens que não soam desesperadas."
2. Roda o comando.
3. Lê as 5 mensagens.
4. **Fechamento:** "E quando ele responde com objeção? Banco de objeções — próximo."

## 🗣️ Gancho de abertura pronto
> "A maioria desiste na primeira mensagem sem resposta. Vou gerar uma sequência de 5 follow-ups, cada um com um ângulo diferente, pra reativar o prospect."

## ✅ Demonstração ao vivo
- 5 mensagens salvas na pasta do prospect.

## 🔗 Pré-requisitos
- Idealmente um dossiê do prospect.
</content>
