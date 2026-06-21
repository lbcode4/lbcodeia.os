# 🎬 Vídeo 37 — `/lb-venda-objecoes`

> **Bloco 5 — Vendas.** Duração alvo: 5–7 min · Sem front.

## 🎯 Objetivo do vídeo
Banco de respostas para as 10 objeções mais comuns na venda B2B de SaaS/serviço. Cada objeção tem: validação, reframing, prova social/dado e pergunta de avanço.

## 💡 Dor → solução
- **Dor:** travar na hora da objeção ("tá caro", "vou pensar") e perder a venda.
- **Solução:** resposta pronta e estruturada pras 10 objeções clássicas.

## 🧠 Framework por trás
- **GCC (Conversão)**: cada resposta termina com uma pergunta que avança o funil.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-venda-objecoes em .claude/skills/lb-venda-objecoes/SKILL.md.

Objetivo: banco de respostas para as 10 objeções B2B mais comuns.
- Para cada objeção: validação → reframing → prova social/dado → pergunta de avanço.
- Calibra tom e provas pelo _memoria/empresa.md.
- Permite consultar uma objeção específica ("cliente falou que tá caro").
- Gatilhos: "como responder X", "objeções", "cliente falou Y",
  "script de objeções", /lb-venda-objecoes.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-venda-objecoes em .claude/skills/lb-venda-objecoes/SKILL.md.
Princípio: objeção não é rejeição, é pedido de mais informação.

FRONTMATTER:
- name: lb-venda-objecoes
- description: Banco de respostas para as 10 objeções mais comuns na venda B2B de SaaS
  para empresas. Cada objeção tem: validação, reframing, prova social/dado e pergunta de
  avanço. Gatilhos: "como responder X", "objeções", "cliente falou Y", "o que digo
  quando...", "script de objeções", "banco de objeções", /lb-venda-objecoes.

DEPENDÊNCIAS: _memoria/empresa.md (calibrar preço e oferta atual), preferencias.md.
Output em saidas/marketing/prospeccao/venda-objecoes.md (arquivo FIXO, atualizado a cada
uso — não criar novo).

MODOS: A — consulta pontual (mostrar só o script da objeção pedida, inline); B — banco
completo (gerar/atualizar o arquivo com as 10).

WORKFLOW:
Passo 1 — ler empresa.md pra calibrar preço, cases/resultados disponíveis e diferenciais.
Passo 2 — estrutura de CADA contorno em 4 passos: (1) Validar (sem discutir; "faz sentido
pensar assim"); (2) Reframing (mudar a perspectiva sem atacar); (3) Prova/dado (evidência
concreta se disponível); (4) Pergunta de avanço (move a conversa pra frente).
Passo 3 — gerar as 10 objeções com os 4 passos cada: 1) já tenho sistema/CRM; 2) é caro/
sem orçamento; 3) não tenho tempo pra implementar; 4) vou pensar/avaliar; 5) não confio em
IA/cliente não gosta de robô; 6) já tentei IA e não funcionou; 7) prefiro contratar uma
pessoa/atendente; 8) empresa pequena/não preciso agora; 9) quero esperar estabilizar; 10)
não sei se minha equipe vai usar.
Output: salvar/atualizar saidas/marketing/prospeccao/venda-objecoes.md (adicionar objeções
novas conforme surgem no campo).

REGRAS: nunca inventar prova social (sem case real, usar demonstração prática); pergunta
de avanço obrigatória (objeção sem pergunta = conversa morta); validar primeiro sempre;
atualizar o arquivo com objeção nova; Modo A mostra só a objeção pedida; calibrar preço
lendo empresa.md.
```

## ⚙️ Como funciona
1. Roda `/lb-venda-objecoes` (ou cita a objeção).
2. Devolve a resposta estruturada em 4 partes.

## 🎥 Roteiro de gravação
1. **Gancho:** "'Tá caro.' 'Vou pensar.' Nunca mais trave nessas."
2. Roda o comando com 2–3 objeções reais.
3. Mostra a estrutura validação→reframing→prova→pergunta.
4. **Fechamento:** "Objeção contornada. Hora de formalizar — proposta comercial."

## 🗣️ Gancho de abertura pronto
> "A venda morre na objeção quando você não tem resposta pronta. Vou montar o banco das 10 objeções B2B com a resposta estruturada de cada uma."

## ✅ Demonstração ao vivo
- Respostas pra 2–3 objeções.

## 🔗 Pré-requisitos
- Memória (provas/tom).
</content>
