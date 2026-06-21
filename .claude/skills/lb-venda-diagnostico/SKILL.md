---
name: lb-venda-diagnostico
description: >
  Roda diagnóstico rápido da presença digital de uma empresa antes de fechar contrato.
  Audita site, anúncios ativos (Biblioteca Meta), avaliações Google, Instagram e posição
  no Google Search. Gera relatório de 1 página com pontos críticos e ranking vs concorrentes.
  Serve como isca de vendas — entregar o diagnóstico gratuitamente pra abrir a conversa.
  Use quando o usuário pedir "diagnóstico", "auditoria rápida", "levanta o digital dessa empresa",
  "diagnóstico de marketing", "o que essa empresa tem de errado", ou /lb-venda-diagnostico.
---

# /lb-venda-diagnostico — Diagnóstico digital gratuito como isca de venda

"Entregue valor antes de pedir. Diagnóstico grátis abre portas que abordagem fria não abre."

## Dependências

- **WebSearch + WebFetch:** pra pesquisa — OBRIGATÓRIO
- **Contexto:** `_memoria/empresa.md`
- **Outputs:** `saidas/marketing/prospeccao/diagnosticos/<slug>.md`

---

## Workflow

### Passo 1 — Receber identificação

Aceita qualquer combinação:
- Nome da empresa
- URL do site
- Handle Instagram
- Telefone ou endereço

Mínimo: 1 desses.

### Passo 2 — Coletar dados (rodar em paralelo)

**1. Site**
- WebFetch no site oficial se existir
- Verificar: existe? carrega? tem CTA claro (WhatsApp/agendamento)? mobile-friendly? blog/SEO?

**2. Anúncios ativos (Biblioteca Meta)**
- WebFetch: `https://www.facebook.com/ads/library/?country=BR&search_type=keyword_unordered&q=<nome>`
- Anuncia ativamente? Quantos anúncios? Tipo de criativo?
- Nível: botão turbinar / gerenciador / agência

**3. Google/Maps (GBP)**
- WebSearch: `"<nome empresa>" google maps avaliações`
- Quantas avaliações? Nota? Última resposta do dono? Fotos atualizadas?

**4. Instagram**
- WebFetch no perfil público se acessível
- Seguidores, frequência de posts, bio com link e CTA, mix de formatos, último post

**5. Google Search**
- WebSearch: `empresa [especialidade] [cidade]`
- A empresa aparece na 1ª página? Quais concorrentes aparecem antes?

### Passo 3 — Montar relatório

```markdown
# Diagnóstico Digital — <Nome da Empresa>
> Gerado em <data>. Análise de presença digital com dados públicos.

## Score geral: [X]/5 ★

## O que está funcionando ✅
- [ponto forte 1]
- [ponto forte 2]

## O que está custando clientes ❌

### 1. [Problema mais crítico] — impacto: ALTO
**Situação:** [o que foi encontrado — dado concreto]
**Custo estimado:** [ex: "leads que chegam fora do horário e somem sem resposta"]

### 2. [Problema 2] — impacto: MÉDIO
**Situação:** ...

### 3. [Problema 3] — impacto: MÉDIO
**Situação:** ...

## Ranking digital vs concorrentes

| Fator | <Nome Empresa> | Concorrente A | Concorrente B |
|---|---|---|---|
| Anúncios ativos | ❌/✅ | | |
| Avaliações Google | X ⭐X | | |
| Frequência posts IG | X/sem | | |
| Site com CTA claro | ❌/✅ | | |
| Aparece no Google Search | ❌/✅ | | |

## Oportunidade principal
[1 parágrafo direto: qual é o maior gap e como IA resolve — focar no resultado concreto,
não na ferramenta. Ex: "Empresa perde ~X leads/mês porque responde fora do horário comercial.
Agente de IA responde às 3h da manhã, qualifica e agenda direto."]

---
*Diagnóstico com dados públicos de <data>. Para plano de ação completo: [seu produto].*
```

### Passo 4 — Salvar

Path: `saidas/marketing/prospeccao/diagnosticos/<slug-da-clinica>.md`
Slug: kebab-case do nome (ex: "Empresa Dr. Silva" → `clinica-dr-silva`)

### Passo 5 — Script de envio

Gerar junto com o diagnóstico:

```
Oi [Nome],

Vi o perfil da [Empresa] e fiz um diagnóstico rápido da presença digital de vocês.

Encontrei [X] pontos que provavelmente estão custando clientes todo mês.

Posso te enviar?
```

Ao resposta positiva: enviar o conteúdo do diagnóstico (sem o arquivo bruto).

### Passo 6 — Próximos passos sugeridos

Sempre oferecer:
> "Quer usar esse diagnóstico como base pra abordagem? (chamo `/lb-venda-prospectar`)"
> "Quer montar proposta com esses gaps já mapeados? (chamo `/lb-venda-proposta`)"

---

## Regras

- **Dados públicos apenas** — WebSearch/WebFetch de fontes abertas; nada de OSINT invasivo
- **Score honesto** — não inflar criticidade pra parecer mais impactante
- **1 página máxima** — relatório longo não é lido por dono de empresa
- **Oportunidade principal focada** — 1 problema claro com ROI, não lista de 10
- **Sempre gerar script de envio** — diagnóstico sem call-to-action não converte
- **Salvar sempre** — diagnóstico pode virar base do dossiê e da proposta depois
