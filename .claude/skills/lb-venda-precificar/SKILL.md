---
name: lb-venda-precificar
description: >
  Calcula preço de serviço ou produto SaaS: custo de entrega, horas estimadas, margem,
  benchmark de mercado e tabela de preços final com estratégia de ancoragem.
  Suporta dois modos: SaaS (assinatura recorrente) e Serviço (projeto/pacote).
  Use quando o usuário pedir "quanto cobrar", "precificar", "definir preço",
  "tabela de preços", "margem do serviço", "calcular preço", ou /lb-venda-precificar.
---

# /lb-venda-precificar — Calculadora de preço com margem e benchmark

"Preço sem cálculo é chute. Chute vai pra 1 dos 2 lados: assusta ou deixa dinheiro na mesa."

## Dependências

- **Contexto:** `_memoria/empresa.md` — ler antes pra entender modelo de negócio e oferta atual
- **Outputs:** `saidas/precificacao-<servico>-<YYYY-MM-DD>.md`

---

## Modos

Identificar automaticamente com base no que o usuário pedir:

**Modo SaaS** — precificar assinatura recorrente ([seu produto] ou produto similar)
**Modo Serviço** — precificar projeto/pacote (implementação, gestão de tráfego, consultoria)

---

## Workflow — Modo SaaS

### Passo 1 — Coletar dados

Pedir (ou estimar com aviso explícito de que é estimativa):
1. **Custos de infra por cliente/mês:** API IA (tokens estimados), hospedagem, ferramentas (Zapier, n8n, etc.)
2. **Tempo de onboarding por cliente:** horas
3. **Tempo de suporte médio por cliente/mês:** horas
4. **Valor da sua hora de trabalho:** R$/h
5. **Meses de amortização do onboarding:** (default: 12 meses)

### Passo 2 — Calcular

```
Custo de entrega por cliente/mês:
= infra_por_cliente
+ (horas_onboarding × valor_hora / meses_amortizacao)
+ (horas_suporte × valor_hora)

Piso de preço (margem 50%) = custo × 2
Preço ideal (margem 67-80%) = custo × 3 a 5
```

### Passo 3 — Benchmark de mercado SaaS saúde

| Tier | Produto típico | Faixa de preço |
|------|---------------|----------------|
| CRM básico (Clinicorp, Ninsaúde) | Gestão de agenda | R$200-400/mês |
| CRM avançado | CRM + prontuário + financeiro | R$500-900/mês |
| Agente de IA isolado | Só chatbot WhatsApp | R$300-600/mês |
| Ecossistema IA completo | CRM + IA + automações + dashboard | R$800-2.000/mês |

[seu produto] = ecossistema → posicionar no tier superior.

### Passo 4 — Tabela de planos (ancoragem)

Sugerir 3 planos — o do meio é o alvo:

```
Plano Starter    → R$ [piso]    (features essenciais — ancora inferior)
Plano Pro        → R$ [alvo]   (features completas — onde quer vender)
Plano Clinic+    → R$ [teto]   (multiusuário/multiloc — ancora superior)
```

---

## Workflow — Modo Serviço

### Passo 1 — Coletar dados

Pedir:
1. **Descrição do serviço** — o que entrega
2. **Horas estimadas** — ou decompor: levantamento + execução + revisão + comunicação
3. **Valor da hora:** R$/h
4. **Benchmark de concorrentes** — se o usuário souber

### Passo 2 — Calcular

```
Custo base = horas_totais × valor_hora
Margem mínima (30%) = custo_base × 1.3
Preço de referência = benchmark_médio_mercado
Preço sugerido = max(custo_base × 1.5, benchmark_médio × 0.9)
```

### Passo 3 — Validar com mercado

Pesquisar benchmark se o usuário não souber (WebSearch: "quanto custa [serviço] [cidade/nicho]").

---

## Output

```markdown
# Precificação — <Serviço>
**Data:** <YYYY-MM-DD>
**Modo:** [SaaS / Serviço]

## Custos calculados
| Item | Valor/mês |
|---|---|
| Infra por cliente | R$ ... |
| Onboarding amortizado | R$ ... |
| Suporte | R$ ... |
| **Total custo** | **R$ ...** |

## Benchmark de mercado
[tabela ou referências encontradas]

## Recomendação
**Preço sugerido:** R$ [valor]
**Margem:** X%
**Justificativa:** [por que esse preço faz sentido no mercado]

## Tabela de planos (se SaaS)
| Plano | Preço | O que inclui |
|---|---|---|
| Starter | R$ ... | ... |
| Pro ⭐ | R$ ... | ... |
| Clinic+ | R$ ... | ... |
```

Salvar em `saidas/precificacao-<servico>-<YYYY-MM-DD>.md`.

---

## Regras

- **Nunca precificar sem calcular custo** — margem invisível não é margem
- **Benchmark antes de decidir** — preço fora do mercado gera atrito desnecessário
- **Ancoragem com 3 planos** — plano do meio sempre se torna referência mental do cliente
- **Avisar quando estimando** — se algum dado não foi fornecido, deixar claro que é estimativa
- **Não recomendar preço abaixo do custo** — mesmo que o usuário peça, mostrar o custo real primeiro
- **Atualizar benchmark** quando pedir precificação em datas futuras — mercado SaaS saúde muda
