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
- **99 scripts WhatsApp (se existir):** `saidas/marketing/scripts-whatsapp/` — pra mensagem inicial e follow-up
- **Outputs vão em:** `saidas/marketing/campanhas/conversao/meta-whatsapp-<YYYY-MM-DD>/`

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

### Passo 7 — OPA-A: Criar anúncio (Texto primeiro, imagem depois)

**⚠️ Ordem obrigatória: copy (texto) sempre antes do criativo visual.** Imagem nasce do texto aprovado — nunca o contrário. Gera os dois em momentos separados, nunca em paralelo sem ponte entre eles.

**Nome:** padrão `AD001 <Produto/Serviço>` (ex.: `AD001 Demo [seu produto]`).

**Identidade:**
- Página Facebook + perfil IG conectados

#### Passo 7a — Copy (sempre primeiro)

**Estrutura GCC (Gancho + Corpo + CTA):**
- Gancho: 1 dos 4 tipos (pergunta, contraintuitivo, história, segmentado)
- Corpo: o quê, pra quem, por quê
- CTA: "Chama no WhatsApp", "Manda oi", "Quero saber mais"

**Vários títulos e textos principais:**
- 5+ variações de texto principal
- 3+ variações de título
- Meta testa e otimiza pra vencedor

Salvar em `copies.md`. **CHECKPOINT OBRIGATÓRIO — parar aqui e perguntar:**

> "Copy pronto (5 textos + títulos). Aprova? E quer que eu já gere os criativos visuais agora, ou só o texto por enquanto?"

Não seguir pro Passo 7b sem aprovação explícita do texto.

**Ao aprovar:** escrever/atualizar `campanha.json` na pasta (ver seção "campanha.json" abaixo) com `criativos: null` — é o que habilita o botão "Publicar no Meta Ads" na Biblioteca mesmo sem imagem ainda.

#### Passo 7b — Criativo visual (só depois do copy aprovado, e só se pedido)

**Formato:** imagem OU vídeo OU carrossel.

**Formatos essenciais (sempre gerar os 2):**
- **Quadrada (1:1)** — feed
- **Vertical (9:16)** — Stories/Reels
- Bônus: 16:9 pra alguns posicionamentos

**Regra de consistência (obrigatória):** ao chamar `/lb-conteudo-carrossel` pra gerar `ad001-1x1.png`/`ad001-9x16.png`, o headline (`<h1>`) da imagem **precisa ser o mesmo gancho** do Texto 1 aprovado em `copies.md` (ou uma versão condensada dele) — nunca um headline novo inventado ali na hora. Se o gancho do texto for longo demais pra imagem, condensar mantendo a mesma ideia central, não trocar de ângulo.

**⚠️ DESATIVAR TODOS OS APRIMORAMENTOS META** (sempre — cagam o anúncio):
- "Aprimoramentos essenciais"
- "Comentários relevantes"
- "Expansão de público"
- "Música" / "Texto" / qualquer outro

**Mensagem inicial WhatsApp:**
- Editar mensagem sugerida pra **identificar qual anúncio gerou a conversa**
- Ex.: *"Oi! Vi o anúncio sobre demo da [seu produto]. Quero saber mais."*
- Isso permite rastrear qual criativo converte (vai aparecer na conversa do WhatsApp)

**Ao terminar de renderizar as imagens:** atualizar `campanha.json` preenchendo o campo `criativos` (ver seção abaixo).

---

## `campanha.json` — dado estruturado pra publicar

Além dos `.md` (leitura humana), a skill escreve `campanha.json` na mesma pasta — é a fonte de verdade que o botão
"Publicar no Meta Ads" da Biblioteca lê pra criar a campanha via API. Nada de novo é inventado aqui: são os
mesmos dados dos passos acima, só estruturados.

```json
{
  "tipo": "whatsapp",
  "nome_campanha": "<nome do Passo 2>",
  "orcamento_diario_centavos": 2000,
  "nome_conjunto": "<nome do Passo 4>",
  "localizacao": { "latitude": -2.4468, "longitude": -54.7083, "raio_km": 15 },
  "idade_min": 28,
  "idade_max": 55,
  "textos": [
    { "corpo": "<Texto 1 de copies.md>", "titulo": "<Título 1>" }
  ],
  "mensagem_inicial_whatsapp": "<AD001 de mensagem-inicial.md>",
  "criativos": null,
  "publicado": null
}
```

**Quando escrever/atualizar:**
- No checkpoint do Passo 7a (copy aprovado) → escreve o arquivo inteiro com `criativos: null`
- No Passo 7b (se o usuário aprovar gerar imagens) → só atualiza o campo `criativos` com os caminhos relativos das PNGs geradas
- Nunca mexer no campo `publicado` — é escrito pelo backend depois que a publicação acontecer de verdade

---

## Output

```
saidas/marketing/campanhas/conversao/meta-whatsapp-<YYYY-MM-DD>/
  configuracao.md       ← 7 passos preenchidos prontos pra copiar
  copies.md             ← textos principais + títulos + descrições (Passo 7a, sempre gerado)
  campanha.json          ← dado estruturado pra publicar via API (Passo 7a, atualizado no 7b)
  mensagem-inicial.md   ← mensagens iniciais WhatsApp por criativo
  criativos/            ← Passo 7b, só se o usuário pedir/aprovar depois do copy
    ad001-1x1.png       ← imagem feed (chamar /lb-conteudo-carrossel, headline = gancho do copies.md)
    ad001-9x16.png      ← imagem story
  publicos.md           ← descrição de cada público manual configurado
  followup-script.md    ← sequência pra responder a primeira mensagem (usa 99 scripts se existir)
  checklist.md          ← validação pré-ativação
```

Se o usuário só quiser o texto por enquanto, `criativos/` fica pendente — não bloqueia gerar `configuracao.md`, `copies.md`, `publicos.md` etc. Rodar `/lb-conteudo-carrossel` depois, quando pedido, passando o gancho aprovado como headline obrigatório.

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

- **Sempre copy antes de criativo visual** — texto aprovado primeiro (Passo 7a), imagem só depois e só se pedido (Passo 7b)
- **Headline da imagem = gancho do copy aprovado** — nunca inventar um headline novo ao chamar `/lb-conteudo-carrossel`
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
