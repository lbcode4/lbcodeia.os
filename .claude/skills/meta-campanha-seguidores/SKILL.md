---
name: lb-meta-campanha-seguidores
description: >
  Cria Campanha de Ouro #1 — Seguidores Qualificados via Meta Business Suite (não Turbinar
  pelo iPhone — taxa Apple 30%). Gera 5 passos pra subir: auditoria perfil → selecionar até 5
  publicações qualificadas (Reels > carrossel) → público manual com CEP/pino+raio → orçamento
  mínimo R$6/dia → publicar. Sempre recusa botão Turbinar pelo iPhone.
  Use quando o usuário pedir "campanha de seguidores", "anunciar perfil instagram",
  "ganhar seguidores qualificados", "turbinar post pra seguidores", ou /meta-campanha-seguidores.
---

# /meta-campanha-seguidores — Campanha #1: Seguidores Qualificados

Roda via Meta Business Suite (não pelo botão Turbinar do iPhone — 30% taxa Apple).

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO
- **Auditoria perfil:** `/conteudo-auditoria-insta` — rodar antes. Score <5/7 = não anunciar
- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Outputs:** `marketing/campanhas/meta-seguidores-<YYYY-MM-DD>/`

---

## Pré-requisitos

1. Perfil Instagram auditado (score ≥5/7 em `/conteudo-auditoria-insta`)
2. Conta Meta Business Suite configurada (cliente libera acesso ao seu email, NÃO passa senha)
3. Página Facebook conectada ao IG
4. Forma de pagamento ativa
5. 5 publicações recentes que atraiam público **qualificado** (não meme viral)

---

## 3 formas de subir — escolha

| Forma | Recomendado? | Por quê |
|-------|--------------|---------|
| Botão **Turbinar/Impulsionar** pelo iPhone | ❌ NÃO | Perde **30% verba pra Apple** (taxa) |
| **Meta Business Suite** ("Turbinar 2.0") | ✅ **SIM** | Mais segmentação, sem taxa Apple |
| Gerenciador de Anúncios | ⚠️ Caro pra seguidor | Não é o melhor objetivo |

Default = Meta Business Suite.

---

## Workflow — 5 passos do Meta Business Suite

### Passo 1 — Acessar conta de anúncios
- Logar em `business.facebook.com`
- Conta certa selecionada (se gestor: conta do cliente)
- Cliente libera acesso ao seu email (3 pontinhos → Configurações → adicionar pessoa). NUNCA pedir senha

### Passo 2 — Navegação
Menu → Todas as ferramentas → **Meta Business Suite** → **Conteúdo**.

### Passo 3 — Selecionar publicação (X DA QUESTÃO)

⚠️ **Não escolher meme/post de mais engajamento** — atrai público errado.

Escolher post que atrai **público qualificado**:
- Reels > carrossel (Reels gera mais seguidor)
- Conteúdo tipo **T (transformação)** ou **N (níveis de consciência)** do RETINA
- Evitar conteúdo tipo E (engajamento puro/meme) — viral mas atrai curioso, não comprador

Pode selecionar até **5 publicações** — Meta distribui verba na que performar melhor.

### Passo 4 — Configurar público

**Gênero + idade** (conforme persona):
- Ex.: 25-50 mulheres pra empresa de estética
- Ex.: 30-55 ambos pra empresa médica

**Localização (CRÍTICO):**
- ⚠️ Default cai na **França** — sempre editar pra Brasil
- ⚠️ Cuidado: bairro "Brasil" existe na **Bahia** — pode cair em raio errado
- Pra negócio local:
  - CEP (5 dígitos) OU
  - **Pino no mapa + raio ~1 km**
- Pra negócio nacional (ex.: [seu produto]): Brasil inteiro OU regiões prioritárias

**Público Advantage vs manual:**
- ✅ Recomendado **manual** no início (<30 dias de dados)
- Advantage só com histórico consolidado

### Passo 5 — Programação + orçamento + publicar

**Datas:**
- Início + fim (ex.: 7-14 dias pra teste)

**Orçamento:**
- **Mínimo R$6/dia** (alcança ~600-1900 pessoas/dia)
- Recomendado teste: R$10-20/dia × 7 dias = R$70-140

**Revisar tudo + Publicar.**

Resultado começa em 24-48h. Custo por seguidor varia R$0,30-R$2,00 dependendo nicho.

---

## Output

```
marketing/campanhas/meta-seguidores-<YYYY-MM-DD>/
  configuracao.md       ← 5 passos com escolhas + screenshots tutorial
  publicacoes-escolhidas.md  ← lista das 5 publicações (URL/print) + por que cada uma
  publico.md            ← idade + gênero + localização configurados
  orcamento.md          ← R$/dia + duração + projeção alcance
  resultado-esperado.md ← faixa estimada (X-Y novos seguidores em 7-14 dias)
```

---

## Checklist pré-ativação

- [ ] Perfil auditado com score ≥5/7
- [ ] 5 publicações qualificadas (NÃO meme) selecionadas
- [ ] Reels priorizados sobre carrossel
- [ ] Idade + gênero conforme persona
- [ ] Localização Brasil confirmada (NÃO França)
- [ ] CEP ou pino+raio se negócio local
- [ ] Público manual (NÃO Advantage no início)
- [ ] Orçamento ≥R$6/dia
- [ ] Datas início/fim definidas
- [ ] Forma de pagamento ativa
- [ ] Cliente avisado: campanha começa pausada, revisa antes de ativar

---

## Métricas pra rastrear

- Custo por seguidor (alvo: R$0,30-R$2,00)
- Engagement rate dos novos seguidores (curtidas/comentários nos próximos posts)
- Crescimento percentual da base
- Conversão de novo seguidor → mensagem WhatsApp (orgânica, ao longo do tempo)

---

## Regras

- **Sempre ler `_memoria/framework-trafego.md`** antes
- **NUNCA usar Turbinar pelo iPhone** — taxa Apple 30%
- **NUNCA escolher meme** como post a impulsionar (atrai público errado)
- **Sempre auditar perfil antes** — perfil despreparado = desperdício
- **Sempre validar Brasil** na localização (default cai França)
- **Sempre público manual** no início (<30 dias)
- **Reels > carrossel** pra ganhar seguidor (algoritmo prioriza Reels)
- **Mínimo R$6/dia** — abaixo disso Meta não entrega
- **Começar pausado** — cliente revisa, ativa quando aprovar
