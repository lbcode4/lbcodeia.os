# 🎬 Vídeo 40 — `/lb-venda-email`

> **Bloco 5 — Vendas.** Duração alvo: 4–5 min · Sem front.
> Skill curta e universal — bom "respiro" no bloco.

## 🎯 Objetivo do vídeo
Rascunhar email profissional calibrado ao tom + objetivo. Entrada: contexto livre (pra quem, por quê, qualquer detalhe). Saída: email pronto pra copiar/colar, respeitando o tom de voz do negócio.

## 💡 Dor → solução
- **Dor:** travar pra escrever um email simples (cobrança, resposta, proposta inicial).
- **Solução:** descreve em uma frase, recebe o email pronto no seu tom.

## 🧠 Framework por trás
- **GCC** no objetivo do email + tom de voz da memória (`preferencias.md`).

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-venda-email em .claude/skills/lb-venda-email/SKILL.md.

Objetivo: rascunhar email profissional calibrado a tom + objetivo.
- Entrada: contexto livre (pra quem, por quê, detalhes).
- Saída: email pronto pra copiar/colar, no tom de voz de _memoria/preferencias.md.
- Ajusta formalidade conforme o destinatário/objetivo.
- Gatilhos: "escreve um email", "responde isso", "como cobro do cliente X",
  "faz um email pra [pessoa]", /lb-venda-email.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-venda-email em .claude/skills/lb-venda-email/SKILL.md.
Skill rápida: gera email pronto a partir de contexto verbal (lê tom + objetivo).

FRONTMATTER:
- name: lb-venda-email
- description: Rascunha email profissional calibrado a tom + objetivo. Entrada: contexto
  livre (pra quem, por quê, detalhes). Saída: email pronto pra copiar/colar. Respeita o
  tom de voz da empresa. Use quando disser "escreve um email", "responde isso", "como cobro
  do cliente X", "faz um email pra [pessoa]".

FLUXO:
Passo 1 — coletar contexto. Se não detalhou, perguntar: pra quem (nome, cargo, relação)?
objetivo (cobrar, propor, responder, seguir, agradecer)? algo a incluir ou evitar? Se já
veio bagunçado, extrair o que der e seguir.
Passo 2 — escrever. Princípios: tom proporcional (cliente novo = cuidado; parceiro antigo
= direto); objetivo claro na abertura (não enterrar no final); uma ação por vez;
encerramento simples. Estrutura: Assunto (direto, sem clickbait) -> "Oi [Nome]," ->
contexto 1-2 linhas -> punchline/proposta -> próximo passo claro -> encerramento simples
-> nome/empresa.
Passo 3 — mostrar o email pronto e perguntar "Tá ok? Quer ajustar algo?". Editar ou
entregar pra copiar/colar.

Incluir exemplos prontos: cobrança, proposta, resposta profissional.

REGRAS: tom segue _memoria/preferencias.md; sem jargão genérico ("experiência ímpar",
"sinergia", "alavancar"); máximo 4 parágrafos; sempre contexto + ação (não deixar em
aberto); assinatura com nome/empresa. Integração: se for proposta, liga com
/lb-venda-proposta; se for follow-up, liga com /lb-venda-follow-up.
```

## ⚙️ Como funciona
1. Roda `/lb-venda-email` + contexto.
2. Devolve o email pronto.

## 🎥 Roteiro de gravação
1. **Gancho:** "Email travado? Descrevo em uma frase e sai pronto, no meu tom."
2. Roda com um caso (ex: cobrar cliente atrasado).
3. Mostra o email final.
4. **Fechamento:** "Fechamos vendas. Agora, análise de dados e sites."

## 🗣️ Gancho de abertura pronto
> "Vou transformar 'preciso cobrar um cliente atrasado sem ser grosso' num email pronto, no tom certo, em segundos."

## ✅ Demonstração ao vivo
- Email pronto pra colar.

## 🔗 Pré-requisitos
- `preferencias.md` preenchido (tom).
</content>
