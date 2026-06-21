# 🎬 Vídeo 39 — `/lb-venda-precificar`

> **Bloco 5 — Vendas.** Duração alvo: 5–7 min · Sem front.

## 🎯 Objetivo do vídeo
Calcular o preço de um serviço/SaaS com margem e benchmark — sair com um número defensável pra colocar na proposta.

## 💡 Dor → solução
- **Dor:** chutar preço (medo de cobrar caro ou cobrar de menos) corrói margem.
- **Solução:** cálculo com custo + margem + benchmark de mercado.

## 🧠 Framework por trás
- Sustenta o **OPA**: oferta forte precisa de preço coerente com o valor entregue.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-venda-precificar em .claude/skills/lb-venda-precificar/SKILL.md.

Objetivo: calcular preço de serviço/SaaS com margem e benchmark.
- Pergunta: custos, horas/esforço, margem desejada e modelo (projeto/mensal/SaaS).
- Cruza com benchmark de mercado pro tipo de serviço.
- Devolve faixa de preço (piso/alvo/teto) com justificativa pra defender na negociação.
- Gatilhos: "precificar", "quanto cobrar", "preço do serviço", "valor da mensalidade",
  /lb-venda-precificar.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-venda-precificar em .claude/skills/lb-venda-precificar/SKILL.md.
Princípio: preço sem cálculo é chute — ou assusta ou deixa dinheiro na mesa.

FRONTMATTER:
- name: lb-venda-precificar
- description: Calcula preço de serviço ou produto SaaS: custo de entrega, horas estimadas,
  margem, benchmark de mercado e tabela de preços final com estratégia de ancoragem.
  Suporta dois modos: SaaS (assinatura recorrente) e Serviço (projeto/pacote). Gatilhos:
  "quanto cobrar", "precificar", "definir preço", "tabela de preços", "margem do serviço",
  "calcular preço", /lb-venda-precificar.

DEPENDÊNCIAS: _memoria/empresa.md (modelo de negócio e oferta atual). Output em
saidas/precificacao-<servico>-<YYYY-MM-DD>.md.

MODOS (identificar pelo pedido): SaaS (assinatura recorrente) ou Serviço (projeto/pacote).

WORKFLOW — MODO SaaS:
Passo 1 — coletar (ou estimar avisando): custos de infra por cliente/mês (API IA,
hospedagem, ferramentas); horas de onboarding; horas de suporte/mês; valor da hora;
meses de amortização do onboarding (default 12).
Passo 2 — calcular: custo de entrega/mês = infra + (horas_onboarding × valor_hora /
amortização) + (horas_suporte × valor_hora); piso (margem 50%) = custo × 2; preço ideal
(margem 67-80%) = custo × 3 a 5.
Passo 3 — benchmark de mercado por tier (CRM básico, CRM avançado, agente IA isolado,
ecossistema IA completo); posicionar ecossistema no tier superior.
Passo 4 — tabela de 3 planos com ancoragem (Starter piso / Pro alvo ⭐ / Clinic+ teto) —
o do meio é o alvo.

WORKFLOW — MODO SERVIÇO:
Passo 1 — coletar: descrição do serviço; horas estimadas (levantamento+execução+revisão+
comunicação); valor da hora; benchmark de concorrentes se souber.
Passo 2 — calcular: custo base = horas × valor_hora; margem mínima (30%) = custo × 1.3;
preço sugerido = max(custo × 1.5, benchmark_médio × 0.9).
Passo 3 — validar com mercado (WebSearch "quanto custa [serviço] [cidade/nicho]" se não
souber).

OUTPUT: markdown com custos calculados (tabela), benchmark, recomendação (preço sugerido +
margem % + justificativa) e tabela de planos (se SaaS). Salvar em saidas/.

REGRAS: nunca precificar sem calcular custo; benchmark antes de decidir; ancoragem com 3
planos (o do meio vira referência); avisar quando estimando; não recomendar preço abaixo
do custo (mostrar o custo real primeiro); atualizar benchmark em datas futuras.
```

## ⚙️ Como funciona
1. Roda `/lb-venda-precificar` + custos/esforço.
2. Calcula faixa piso/alvo/teto + justificativa.

## 🎥 Roteiro de gravação
1. **Gancho:** "Cobrar errado quebra o negócio. Vou achar o preço certo, com dado."
2. Roda o comando com um caso.
3. Mostra a faixa de preço + justificativa.
4. **Fechamento:** "Preço definido. Pra fechar o bloco: o email que cola tudo."

## 🗣️ Gancho de abertura pronto
> "Quanto cobrar? Vou parar de chutar: custo, margem e benchmark pra sair com um preço que dá pra defender na mesa."

## ✅ Demonstração ao vivo
- Faixa piso/alvo/teto + justificativa.

## 🔗 Pré-requisitos
- Dados de custo/esforço.
</content>
