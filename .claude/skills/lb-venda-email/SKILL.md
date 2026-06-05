---
name: lb-venda-email
description: >
  Rascunha email profissional calibrado a tom + objetivo. Entrada: contexto livre
  (pra quem, por quê, qualquer detalhe). Saída: email pronto pra copiar/colar.
  Respeita ton de voz da empresa. Use quando disser "escreve um email", "responde isso",
  "como cobro do cliente X", "faz um email pra [pessoa]".
---

# /lb-venda-email — Rascunho de Email

Skill rápida: gera email pronto a partir de contexto verbal.
Lê tom de voz + contexto + objetivo → gera email profissional.

## Fluxo

### Passo 1 — Coletar contexto

Se usuário não detalhou:

1. "Pra quem? (nome, cargo, relação)"
2. "Objetivo? (cobrar, propor, responder, seguir, agradecer, etc)"
3. "Tem algo específico pra incluir ou evitar?"

Se contexto já veio verbal/bagunçado, extrair o que der e prosseguir.

### Passo 2 — Escrever

**Princípios:**
- Tom proporcional (cliente novo = cuidado; parceiro antigo = direto)
- Objetivo claro na abertura (não enterrar no final)
- Uma ação por vez
- Encerramento simples (sem blá-blá repetido)

**Estrutura:**
```
Assunto: [linha direta, sem clickbait]

Oi [Nome],

[Contexto em 1-2 linhas — por que você tá escrevendo]

[Punchline/proposta — o que você quer]

[Próximo passo claro — o que precisa do outro lado]

[Encerramento simples]
[Seu nome/empresa]
```

### Passo 3 — Entregar

Mostrar email pronto e perguntar:
> "Tá ok? Quer ajustar algo?"

Se sim, editar. Se não, copy/cola.

## Exemplos rápidos

**Cobrança**
```
Assunto: Seguimento — Proposta de Maio

Oi José,

Enviei a proposta no dia 10. Você conseguiu revisar?

Gostaria de alinhar os próximos passos contigo. Podemos marcar uma call essa semana?

Fico no aguardo!
[Seu nome]
```

**Proposta**
```
Assunto: Ideia de colaboração

Oi Marina,

Conheci seu trabalho e gostei. Tenho uma ideia que pode ajudar.

Seria legal alinharmos em uma call de 15min. Topa?

[Link calendário ou: "Sexta 10h combina?"]

[Seu nome]
```

**Resposta profissional**
```
Assunto: RE: Sua pergunta

Oi Carlos,

Entendi sua dúvida. Pensa assim: [resposta direta em 1-2 linhas]

Se precisar de mais detalhes, manda mensagem!

[Seu nome]
```

## Regras

- Tom segue `_memoria/preferencias.md` — direto, casual, formal, como a marca usa
- Sem jargão de marketing genérico ("experiência ímpar", "sinergia", "alavancar")
- Máximo 4 parágrafos (email curto = respostas rápidas)
- Sempre com contexto + ação (não deixar em aberto)
- Assinatura com nome/empresa (referência)

## Integração

Email é toque operacional — segue tom + contexto do negócio (vem de `_memoria/`).
Se for proposta, liga com `/lb-venda-proposta`. Se for follow-up, liga com `/lb-venda-follow-up`.
