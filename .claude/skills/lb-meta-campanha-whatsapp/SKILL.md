---
name: lb-meta-campanha-whatsapp
description: >
  Cria Campanha de Ouro #2 — Vendas 1-a-1 no WhatsApp via Meta Ads (Gerenciador de Anúncios).
  Gera 7 passos prontos pra copiar-colar no Gerenciador: objetivo, nome, orçamento CBO, conjunto
  com destino WhatsApp, público manual (recusa Advantage), posicionamento sem Facebook, criativos
  1:1 + 9:16, mensagem inicial WhatsApp. Sempre desativa todos os aprimoramentos Meta.
  Use quando o usuário pedir "campanha pra WhatsApp", "anúncio que cai no zap",
  "gerar conversas WhatsApp", "campanha meta whatsapp", ou /lb-meta-campanha-whatsapp.
---

# /lb-meta-campanha-whatsapp — Campanha #2: Vendas 1-a-1 WhatsApp

Melhor venda pra qualquer negócio = 1-a-1 no WhatsApp. Skill monta tudo pra subir via Gerenciador.

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO (OPA, GCC, regras Meta)
- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Identidade visual (criativos):** `identidade/design-guide.md`
- **Auditoria perfil IG (recomendado):** rodar `/lb-conteudo-auditoria-insta` antes — sem perfil organizado, custo sobe
- **99 scripts WhatsApp (se existir):** `marketing/scripts-whatsapp/` — pra mensagem inicial e follow-up
- **Outputs vão em:** `marketing/campanhas/conversao/meta-whatsapp-<YYYY-MM-DD>/`

---

## Pré-requisitos

1. Conta Meta Business + Gerenciador de Anúncios configurado (cliente libera acesso ao seu email — nunca passar senha)
2. WhatsApp Business conectado à conta Meta
3. Forma de pagamento ativa
4. Perfil IG mínimo organizado (auditoria via `/lb-conteudo-auditoria-insta`)
5. Conversões configuradas (se aplicável) ou pelo menos pixel ativo

---

## Workflow — 7 passos do Gerenciador

### Passo 1 — OPA-O: Objetivo
Botão verde **Criar** → 6 objetivos → escolher **Engajamento** (bom pra mensagens IG/WhatsApp).

⚠️ Quando aparecer escolha: **campanha MANUAL**, NÃO a "personalizada/varinha mágica recomendada" (boas práticas exigem controle manual).

### Passo 2 — Nomear a campanha
Padrão: `Mensagem WhatsApp | <Cidade/Bairro> | <Produto/Serviço>`

Exemplos:
- `Mensagem WhatsApp | Mooca | Delivery Brownie`
- `Mensagem WhatsApp | SP | Demo [seu produto]`

Nome não afeta resultado — só identificação.

### Passo 3 — OPA-O continuação: Orçamento (CBO)
**Ativar CBO** (Meta gerencia melhor o dinheiro entre conjuntos).

Escolher:
- **Diário** — gastar em 24h (aparecer 24/7). Bom pra negócio online
- **Total** — gastar entre 2 datas. Usar quando quer **programar horários** (negócio só atende horário comercial). Cálculo: R$20/dia × 7 dias = R$140 total

### Passo 4 — Conjunto de anúncio (parte 1 — destino + programação)

**Nomear conjunto** identificável.

**Destino = WhatsApp:**
- Conectar via código de 6 dígitos (Meta envia)
- ⚠️ NUNCA selecionar mais de 1 destino — se quiser site + WhatsApp, criar outra campanha

**Datas + fuso:**
- Início/fim
- Fuso = São Paulo (mudar se default vier outro)

**Programação por quadradinhos:**
- Ex.: 8h-18h seg-sex pra negócio horário comercial
- Mínimo blocos de 15 min

### Passo 5 — OPA-P: Definição de Público (parte 2 do conjunto)

⚠️ **CRÍTICO:** descer até público Advantage → clicar **"trocar para opções originais de público"**.

Meta tenta dissuadir com "-9,7% custo estimado". IGNORAR — Advantage no início queima verba sem foco.

**Construir público manual:**
- Públicos personalizados (seguidores, quem mandou msg, visitou site) — material de auxílio gera esses públicos
- **Localização:**
  - CEP (5 dígitos) OU
  - **Pino no mapa + raio ~1 km** (pra negócio com endereço específico)
  - ⚠️ Localização Meta cai na **França** por padrão — sempre validar Brasil
  - ⚠️ Cuidado: bairro "Brasil" existe na Bahia — raio cai errado
- Idade + gênero (conforme persona)

> "Anúncios foram feitos pra serem ignorados pelas pessoas erradas." Público apertado = barato e qualificado.

### Passo 6 — Posicionamento
Default = Advantage (Meta escolhe — OK pra iniciante).

**Recomendado: posicionamento manual:**
- ✅ Instagram (Feed, Stories, Reels)
- ✅ WhatsApp
- ❌ Desmarcar **Facebook** (público de menor poder aquisitivo)
- ❌ Desmarcar Audience Network (qualidade baixa)

### Passo 7 — OPA-A: Criar anúncio (Criativo + Mensagem)

**Nome:** padrão `AD001 <Produto/Serviço>` (ex.: `AD001 Demo [seu produto]`).

**Identidade:**
- Página Facebook + perfil IG conectados

**Formato:** imagem OU vídeo OU carrossel.

**Formatos essenciais (sempre gerar os 2):**
- **Quadrada (1:1)** — feed
- **Vertical (9:16)** — Stories/Reels
- Bônus: 16:9 pra alguns posicionamentos

**Estrutura GCC (Gancho + Corpo + CTA):**
- Gancho: 1 dos 4 tipos (pergunta, contraintuitivo, história, segmentado)
- Corpo: o quê, pra quem, por quê
- CTA: "Chama no WhatsApp", "Manda oi", "Quero saber mais"

**Vários títulos e textos principais:**
- 5+ variações de texto principal
- 3+ variações de título
- Meta testa e otimiza pra vencedor

**⚠️ DESATIVAR TODOS OS APRIMORAMENTOS META** (sempre — cagam o anúncio):
- "Aprimoramentos essenciais"
- "Comentários relevantes"
- "Expansão de público"
- "Música" / "Texto" / qualquer outro

**Mensagem inicial WhatsApp:**
- Editar mensagem sugerida pra **identificar qual anúncio gerou a conversa**
- Ex.: *"Oi! Vi o anúncio sobre demo da [seu produto]. Quero saber mais."*
- Isso permite rastrear qual criativo converte (vai aparecer na conversa do WhatsApp)

---

## Output

```
marketing/campanhas/conversao/meta-whatsapp-<YYYY-MM-DD>/
  configuracao.md       ← 7 passos preenchidos prontos pra copiar
  copies.md             ← textos principais + títulos + descrições (várias variações)
  mensagem-inicial.md   ← mensagens iniciais WhatsApp por criativo
  criativos/
    ad001-1x1.png       ← imagem feed (chamar /lb-conteudo-carrossel se precisar gerar)
    ad001-9x16.png      ← imagem story
  publicos.md           ← descrição de cada público manual configurado
  followup-script.md    ← sequência pra responder a primeira mensagem (usa 99 scripts se existir)
  checklist.md          ← validação pré-ativação
```

---

## Checklist pré-ativação

Antes de tirar do pausado:
- [ ] Campanha = Engajamento manual (NÃO personalizada)
- [ ] CBO ativo
- [ ] Destino WhatsApp conectado (código 6 dígitos validado)
- [ ] Fuso = São Paulo
- [ ] Programação por quadradinhos definida (horário comercial se aplicável)
- [ ] Público em **"opções originais"** (NÃO Advantage)
- [ ] Localização Brasil confirmada (NÃO França)
- [ ] Posicionamento Facebook desmarcado
- [ ] **Todos os aprimoramentos Meta DESATIVADOS** (essenciais, comentários, expansão)
- [ ] Criativos 1:1 + 9:16 prontos
- [ ] 5+ textos principais + 3+ títulos
- [ ] Mensagem inicial WhatsApp editada (rastreia origem)
- [ ] Página FB + IG conectados
- [ ] Forma de pagamento ativa

---

## Métricas pra rastrear (entra no `/lb-meta-relatorio`)

- Custo por mensagem iniciada
- Taxa de resposta da mensagem inicial (humano respondeu?)
- Taxa de qualificação (lead encaixa no ICP?)
- Custo por lead qualificado
- Taxa de fechamento (lead virou cliente?)
- Frequência (alvo 1.5-3.0 — acima saturou)

---

## Regras

- **Sempre ler `_memoria/framework-trafego.md`** antes de executar
- **Sempre manual, nunca personalizada** ("varinha mágica")
- **Sempre recusar Advantage** no início (<30 dias de dados)
- **Sempre desativar TODOS aprimoramentos Meta**
- **Sempre desmarcar Facebook** pra produto premium (B2B, ticket alto)
- **Sempre validar Brasil** na localização (default cai França)
- **Sempre 2 formatos** mínimo (1:1 + 9:16)
- **Sempre editar mensagem inicial** pra identificar anúncio
- **Sempre pausado primeiro** — cliente revisa, ativa quando aprovar
- Tempo médio pra subir treinado: 5-30 min
- Capacidade gestor: 10-15 (até 20) clientes
- Cobrança típica: R$750-1000/mês por cliente
