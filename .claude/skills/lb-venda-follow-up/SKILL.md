---
name: lb-venda-follow-up
description: >
  Gera sequência personalizada de 5 mensagens de follow-up pós-abordagem com ângulos diferentes
  (confirmação, valor, prova, urgência, reativação). Salva em marketing/prospeccao/<prospect>/venda-follow-up.md.
  Complementa /lb-venda-prospectar que para na abordagem inicial.
  Use quando o usuário pedir "follow-up", "sequência de acompanhamento", "como dar continuidade",
  "mensagens de follow", "não respondeu o que faço", "como reativar prospect", ou /lb-venda-follow-up.
---

# /lb-venda-follow-up — Sequência de 5 mensagens pós-abordagem

"80% das vendas fecham no follow-up 5 a 8. Quem para no 1 deixa dinheiro na mesa."

## Dependências

- **Dossiê do prospect (se existir):** `marketing/prospeccao/dossies/<slug>.md` — ler se existir
- **Contexto:** `_memoria/empresa.md`
- **Tom:** `_memoria/preferencias.md`
- **Outputs:** `marketing/prospeccao/<slug-prospect>/venda-follow-up.md`

---

## Workflow

### Passo 1 — Receber contexto

Pedir ao usuário:
1. **Nome do prospect** (e slug se tiver dossiê)
2. **Estágio atual:**
   - **A** — Abordagem inicial enviada, sem resposta
   - **B** — Respondeu, mostrou interesse, depois esfriou
   - **C** — Recebeu proposta, sem resposta
   - **D** — Disse "vou pensar", parou
3. **Canal principal** (WhatsApp / email / Instagram DM)
4. **Tempo desde último contato** (ex: "2 dias", "1 semana")

### Passo 2 — Ler dossiê (se existir)

Extrair pontos de conexão específicos pra personalizar as mensagens — um detalhe real da empresa vale mais que qualquer script genérico.

### Passo 3 — Gerar sequência

5 mensagens com ângulos diferentes:

| Msg | Ângulo | Timing |
|-----|--------|--------|
| FUP 1 | Confirmação — "chegou?" | D+1 a D+2 |
| FUP 2 | Valor — dado/insight relevante pro negócio deles | D+4 a D+5 |
| FUP 3 | Prova — resultado concreto ou demonstração | D+8 a D+10 |
| FUP 4 | Urgência real — escassez, deadline, novidade | D+14 a D+15 |
| FUP 5 | Reativação — "vou parar de incomodar" | D+21 a D+30 |

**Regras de formato:**
- WhatsApp: máximo 3-4 linhas por mensagem
- Email: máximo 1 parágrafo
- Abertura natural ("Oi [Nome]," — nunca "Olá, tudo bem com você?")
- 1 elemento personalizado do dossiê por mensagem (se existir)
- 1 CTA claro ao final — nunca dois pedidos na mesma mensagem

---

### Sequências por estágio

**Estágio A — Sem resposta à abordagem inicial:**

- FUP 1: Confirmar se recebeu a mensagem, sem pressão
- FUP 2: Compartilhar dado sobre o mercado de empresas (não falar de produto — gerar valor primeiro)
- FUP 3: Case ou resultado concreto (pode ser benchmark se não tiver case próprio)
- FUP 4: "Estou fechando as últimas vagas do mês / onboarding abre na próxima semana"
- FUP 5: "Última mensagem — deixo a porta aberta pra quando fizer sentido"

**Estágio B — Esfriou após interesse:**

- FUP 1: Referência ao ponto onde parou ("Você tinha pedido mais informações sobre X...")
- FUP 2: Nova informação relevante (feature nova, dado recente do mercado)
- FUP 3: Oferecer diagnóstico grátis como reativação — chama `/lb-venda-diagnostico` se ainda não foi feito
- FUP 4: Oferta especial com prazo real (ex: "Esse mês ainda consigo incluir...")
- FUP 5: "Reativação em 90 dias se não fizer sentido agora"

**Estágio C — Proposta enviada, sem resposta:**

- FUP 1: "Vi que enviei a proposta há X dias — chegou bem nos seus arquivos?"
- FUP 2: Reforçar ROI estimado em 1 linha (sem reenviar a proposta inteira)
- FUP 3: "Qual parte ficou com dúvida? Posso esclarecer em 5 minutos."
- FUP 4: "A proposta tem validade até [data] — depois preciso rever os valores."
- FUP 5: "Entendo se o momento não é esse. Quando fizer sentido, é só me chamar."

**Estágio D — "Vou pensar":**

- FUP 1: "O que ainda falta pra você tomar a decisão?" (pergunta direta, sem pressão)
- FUP 2: Dado que responde à objeção mais provável (baseado no perfil do prospect)
- FUP 3: Oferta de demonstração prática — "Conversa de 15 min com o agente funcionando"
- FUP 4: "Última chance antes de fechar as vagas deste mês"
- FUP 5: "Entendo o timing — fico por aqui quando fizer sentido"

---

### Passo 4 — Salvar

```markdown
# Follow-up — <Nome do Prospect>
Estágio: [A/B/C/D] | Canal: [WhatsApp/email/DM] | Iniciado em: <data>

## FUP 1 — [ângulo] — Enviar em: <data>
[mensagem]
- [ ] Enviado em: ___
- [ ] Resposta: ___

## FUP 2 — [ângulo] — Enviar em: <data>
[mensagem]
- [ ] Enviado em: ___
- [ ] Resposta: ___

[... repetir pra cada FUP]

## Status final
- [ ] Fechou em: ___ (valor: R$___)
- [ ] Arquivado como frio em: ___ (retomar em: ___)
- [ ] Em andamento
```

Path: `marketing/prospeccao/<slug-prospect>/venda-follow-up.md`

### Passo 5 — Próximo passo sugerido

Se estágio C ou D e objeção visível:
> "Quer que eu abra o banco de objeções com o contorno pra essa situação? (chamo `/lb-venda-objecoes`)"

---

## Regras

- **Personalizar** — mensagem genérica tem taxa de resposta 3x menor
- **Curto** — WhatsApp: 3-4 linhas max. Email: 1 parágrafo
- **1 CTA por mensagem** — dois pedidos na mesma mensagem dividem atenção
- **Nunca inventar prova social** — "resultado de empresa similar" só se tiver real
- **FUP 5 é a saída elegante** — nunca mais que 5 contatos sem resposta
- **Arquivar após FUP 5** sem resposta — voltar em 90 dias com motivo novo
- **Atualizar status** no arquivo conforme vai enviando
