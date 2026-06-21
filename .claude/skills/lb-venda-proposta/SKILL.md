---
name: lb-venda-proposta
description: >
  Gera proposta comercial visual personalizada para prospect de empresa.
  Puxa dados do dossiê (/lb-venda-dossie), calcula ROI estimado, gera HTML de 2 páginas
  no estilo pack (cover com deliverables + condições com preço/CTA), renderiza em PNG via Playwright.
  Use quando o usuário pedir "proposta", "gerar proposta", "montar proposta comercial",
  "proposta pra [prospect]", ou /lb-venda-proposta.
---

# /lb-venda-proposta — Proposta comercial visual pra empresa

Transforma dossiê + oferta em proposta de 2 páginas pronta pra enviar.

## Dependências

- **Dossiê do prospect (se existir):** `saidas/marketing/prospeccao/dossies/<slug>.md` — ler se existir
- **Contexto do negócio:** `_memoria/empresa.md`
- **Identidade visual:** `identidade/design-guide.md` + imagens de referência em `identidade/`
- **Framework:** OPA (estrutura de Oferta e Proposta) — deliverables → condições → ancoragem (à vista vs parcelado) → bônus → CTA (`_memoria/framework-trafego.md`)
- **Referência de estrutura:** `exemplo/pack-soluccionar (1).pdf` (layout 2 páginas)
- **Playwright:** pra renderizar HTML→PNG
- **Outputs:** `saidas/marketing/prospeccao/<slug-prospect>/proposta-<YYYY-MM-DD>/`

---

## Workflow

### Passo 1 — Coletar dados

Pedir ao usuário:
1. **Nome do prospect** (ou slug do dossiê já existente)
2. **O que entra na proposta** — pacote de serviços (ou usar padrão [seu produto] abaixo)
3. **Preço** — à vista + parcelado, ou só um
4. **Bônus** (se houver)

Se dossiê existir em `saidas/marketing/prospeccao/dossies/<slug>.md`, ler e extrair:
- Nome do responsável e da empresa
- Gaps identificados (seção "Gaps que [seu produto] pode resolver")
- Ticket médio e atendimentos estimados (pra calcular ROI)

**Pacote padrão [seu produto]** (usar se não especificado):
- Agente de IA 24/7 no WhatsApp (qualificação + agendamento automático)
- Dashboard centralizado (WhatsApp + Instagram + Facebook)
- Pipeline inteligente de clientes
- Onboarding completo + treinamento da equipe

### Passo 2 — Calcular ROI estimado

Com base nas métricas do dossiê:

```
Cenário conservador: +20% de ocupação da agenda
Novos atendimentos/mês = atendimentos_atuais × 0.20
Receita adicional/mês = novos_atendimentos × ticket_médio
Payback = investimento_mensal / receita_adicional
```

Se métricas não disponíveis, usar benchmarks:
- Ticket médio estética: R$250-400 | odonto: R$200-350 | médica: R$350-600
- Agenda típica: 60-75% de ocupação
- Meta com IA: 85-95%

### Passo 3 — Gerar HTML (2 páginas)

Ler `identidade/design-guide.md` e carregar imagens de referência em `identidade/` antes de estilizar.

**Estrutura CSS base:**
- Tamanho de página: 1080×1350px (4:5)
- Fundo página 1: cor primária escura da marca (ou preto)
- Fundo página 2: branco ou cinza muito claro com detalhes da marca
- Tipografia: fonte da marca (ver design-guide)
- Accent: cor de destaque da marca
- Logo: `identidade/logo.png`

**Página 1 — Cover (deliverables):**

```html
<!-- Estrutura semântica -->
<header>
  [LOGO]  PROPOSTA · [MÊS ANO em maiúsculas]
</header>

<section class="hero">
  <h1>[Nome da Empresa] × [seu produto] →</h1>
  <h2>[Tagline personalizada — ex: "IA que agenda enquanto você atende."]</h2>
  <p>[Dor principal identificada no dossiê — 1-2 linhas diretas]</p>
</section>

<section class="deliverables">
  <h3>O QUE ENTRA</h3>
  <div class="item">
    <span class="number">01</span>
    <div>
      <strong>[Deliverable 1]</strong>
      <p>[Descrição em 1-2 linhas — foco no resultado, não na feature]</p>
    </div>
  </div>
  <!-- repetir pra cada deliverable -->
</section>

<footer>01 / 02  CONTINUA</footer>
```

**Página 2 — Condições:**

```html
<header>
  [LOGO]  PROPOSTA [NOME EMPRESA] · 02
</header>

<section class="condicoes">
  <h2>CONDIÇÕES</h2>
  <p>Formas de pagamento.</p>
  <p>[Nome da empresa] por ↓</p>

  <div class="pagamento">
    <div class="recomendado">
      <span class="badge">RECOMENDADO</span>
      <span class="label">À VISTA</span>
      <span class="valor">R$ [valor à vista]</span>
      <p>[Economia vs parcelado — ex: "Economia de R$ X."]</p>
    </div>
    <div class="parcelado">
      <span class="label">PARCELADO</span>
      <span class="parcelas">[N]×</span>
      <span class="valor">R$ [valor parcela]</span>
      <p>[Total em X vezes — ex: "R$ X em N vezes sem juros."]</p>
    </div>
  </div>

  <div class="bonus">
    <strong>BÔNUS</strong>
    <p>[Descrição do bônus — ex: "R$ 500 de crédito de IA nos primeiros 30 dias."]</p>
  </div>

  <p class="resumo">[O que acontece ao fechar — ex: "Onboarding inicia em 48h. Agente no ar em 5 dias úteis."]</p>
</section>

<footer class="assinatura">
  [Nome do responsável [seu produto]]<br>
  <strong>Fechou? →</strong>
</footer>

<footer class="rodape">
  [SEU PRODUTO]<br>
  02 / 02  [SEU PRODUTO] · [NOME EMPRESA]
</footer>
```

### Passo 4 — Renderizar

Salvar HTMLs e renderizar via Playwright:

```bash
npx playwright screenshot --full-page proposta-p1.html proposta-p1.png
npx playwright screenshot --full-page proposta-p2.html proposta-p2.png
```

Ou usar `scripts/render.js` se existir.

### Passo 5 — Salvar

```
saidas/marketing/prospeccao/<slug-prospect>/proposta-<YYYY-MM-DD>/
  proposta-p1.html
  proposta-p1.png
  proposta-p2.html
  proposta-p2.png
  proposta-dados.md     ← ROI calculado, preço, próximo passo sugerido
```

### Passo 6 — Próximo passo sugerido

Sempre oferecer:
> "Quer gerar a sequência de follow-up pra acompanhar essa proposta? (chamo `/lb-venda-follow-up`)"

---

## Regras

- **Sempre ler dossiê se existir** — proposta genérica converte muito menos
- **Tagline personalizada** — mencionar dor específica da empresa identificada no dossiê
- **ROI conservador e honesto** — nunca prometer resultado que não pode garantir
- **Bônus sempre presente** — aumenta percepção de valor sem custo real
- **2 páginas máximo** — proposta longa não é lida por dono de empresa
- **Sempre oferecer `/lb-venda-follow-up`** após gerar proposta
- **Nunca inventar preço** — sempre pedir ao usuário se não informado
