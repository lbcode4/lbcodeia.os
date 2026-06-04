---
name: lb-google-ads
description: >
  Cria estrutura completa de campanha do Google Ads a partir de um briefing ou da pesquisa SEO.
  Gera CSV pronto pra importar no Google Ads Editor com campanhas Search organizadas por cluster
  de palavras-chave, grupos de anúncios, RSAs (Responsive Search Ads), extensões e palavras-chave
  negativas. Lê o briefing de _memoria/empresa.md e da pesquisa SEO se existir.
  Use quando o usuário pedir "criar campanha google ads", "anúncio google", "google ads",
  "csv pro google ads", ou /google-ads.
---

# /google-ads — Estrutura de campanha Google Ads

Skill que monta a campanha inteira em CSV pronto pra importar no Google Ads Editor. Sai do briefing direto pro CSV — sem montar grupo por grupo na mão na interface do Google.

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — **OBRIGATÓRIO ler antes** (OPA, Bolo Cenoura, regras transversais)
- **Contexto do negócio:** `_memoria/empresa.md` (produto/serviço, público, região, diferenciais)
- **Tom de voz:** `_memoria/preferencias.md`
- **Pesquisa SEO (se existir):** `marketing/google-seo/01-pesquisa-demanda.md`, `06-google-ads.md` — usar como insumo
- **GBP otimizado (pra Dominação Top 1):** ver `/google-meu-negocio` — campanha #3 exige perfil GBP completo antes
- **Outputs vão em:** `marketing/campanhas/google-ads-<YYYY-MM-DD>/`

---

## Princípio central — Lógica do Bolo de Cenoura Fofinho

Toda campanha Google obedece correspondência em cadeia:

```
Termo pesquisado  =  Anúncio mostrado  =  Página de destino
```

Antes de gerar CSV, validar:
- Termo (keyword) bate com texto do anúncio (RSA repete a keyword)?
- Anúncio bate com landing (página entrega o prometido)?

Quebrar a cadeia = Quality Score baixo = anúncio caro e mal entregue.

**Incluir tabela de validação em `configuracoes.md`** (1 linha por grupo):

| Cluster | Termo → Anúncio | Anúncio → Landing | Status |
|---------|-----------------|-------------------|--------|
| Nome do grupo | ✅/⚠️ RSA repete keyword? | ✅/⚠️ LP entrega o prometido? | Forte/Médio/Fraco |

Documentar elos fracos (⚠️) e o que fazer pra corrigir (LP específica, LP de comparativo, etc).

---

## Modos de campanha

Skill cobre 2 caminhos. Escolher com o usuário:

| Modo | Quando usar | Esforço | Tempo até resultado |
|------|-------------|---------|---------------------|
| **A — Search via Google Ads Editor** (padrão) | Cliente com site/landing e orçamento >R$500/mês | Alto | 7-14 dias |
| **B — Dominação Top 1 (botão Anunciar dentro do GBP)** | Cliente novo, sem site, negócio local, ROI rápido | Baixo | 1-3 dias |

Default = modo A. Modo B detalhado na seção "Modo B" no fim.

---

## Workflow

### Passo 1 — Briefing

Se o usuário não passou briefing, perguntar:

1. **Produto/serviço a anunciar?** (1-3 linhas)
2. **Quem é o público?** (perfil, dor que resolve)
3. **Região:** raio em km a partir de qual cidade?
4. **Orçamento diário?** (R$/dia)
5. **Objetivo:** ligações / WhatsApp / formulário / visita?
6. **Site/landing page** existe? URL?

Se já existe `marketing/google-seo/06-google-ads.md` (criado pelo `/google-seo`), usar como base — pular as perguntas que já foram respondidas lá.

### Passo 2 — Pesquisa de palavras-chave

Se já existe `marketing/google-seo/01-pesquisa-demanda.md`, usar top 10-20 de termos prioritários (intenção transacional + comercial).

Se não existe, gerar via 3 vias (combinar):
- **1º cérebro (natural):** perguntar ao dono o que público pesquisa + pesquisar termos no próprio Google
- **Ferramenta externa:** Answer the Public (`answerthepublic.com`) — 2 buscas grátis/dia, mostra volume
- **2º cérebro (IA):** WebSearch pra cada grupo + extrair correlatas

**Refinamento obrigatório:**
1. **Incluir local** em algumas (negócio local): "barbeiro em Moema", "barbeiro São Paulo"
2. **Palavras de intenção de compra** (sempre incluir): comprar, pedir, contratar, orçamento, adquirir, encomendar, obter, serviço, agendar, curso. Quem pesquisa "agendar corte" tem mais intenção que "barbeiro SP"
3. **Tipos de correspondência** (diz ao Google quão solto buscar):
   - **Ampla** (sem símbolo): mais alcance, menos controle. Usar SÓ com 30+ dias de dados
   - **Frase** (aspas): `"doces saudáveis em Londrina"` — só busca contém palavras nessa ordem
   - **Exata** (colchetes): `[doces saudáveis em Londrina]` — só busca exata
   - **Início (pouca verba):** começar com **frase + exata** (mais controle, não deixa Google solto)

Agrupar em **clusters por tema** (1 grupo de anúncio por cluster — sempre 1 cluster = 1 grupo = lógica do Bolo).

Filtrar pelos de **intenção comercial/transacional** (descartar informacionais — viram blog em `/google-seo`).

### Passo 3 — OPA-1: Estrutura de campanha (Objetivo)

**Padrão recomendado pra B2B local:**

```
Campanha 1: <Negócio> — Search Geral
├── Grupo: <Cluster 1>
│   ├── 10-15 keywords (mix de exata, frase, ampla modificada)
│   ├── 3 RSAs (15 headlines + 4 descriptions cada)
│   └── 10-15 keywords negativas no grupo
├── Grupo: <Cluster 2>
│   └── ...
└── ... (1 grupo por cluster do Passo 2)

Campanha 2: <Negócio> — Local (opcional)
├── Anúncios pra Google Maps
└── Segmentação por proximidade

Lista de negativas globais: termos genéricos descartados, marcas concorrentes
```

**Negativas obrigatórias:**
- Termos genéricos: gratis, gratuito, download, curso, faculdade, emprego, vaga, sintomas, tratamento, wikipedia, reclame aqui, como fazer, como criar
- Termos B2C se o produto é B2B: termos de consumidor final fora da intenção B2B (ex.: gratuito, popular, "perto de mim")
- Dev/técnico se relevante: open source, python, api, github, tutorial
- **Marcas de concorrentes diretos** (buscar em `_memoria/empresa.md` + WebSearch "concorrentes de [produto]") — protege budget de cliques em busca de marca rival

### Passo 4 — OPA-A: Anúncio (Copies RSAs)

**Quantos RSAs por grupo:**
- **Orçamento ≤ R$50/dia → 1 RSA por grupo.** A R$30/dia, 3 RSAs dividem impressões e atrasam o aprendizado do Google. O Google já rotaciona os 15 títulos × 4 descrições dentro de 1 RSA. Adicionar 2º RSA após 30 dias com dados.
- **Orçamento > R$50/dia → 2-3 RSAs por grupo.**

Pra cada grupo, gerar RSAs (Responsive Search Ads):

**15 headlines** por anúncio:
- 5 com keyword principal
- 3 com diferenciais concretos (certificações, prazo, garantia)
- 3 com CTA ("Solicite cotação", "Peça pelo WhatsApp", "Fale agora")
- 2 com prova social (anos no mercado, número de clientes)
- 2 com proposta de valor genérica

**4 descriptions** (90 caracteres cada):
- 1 institucional + CTA
- 1 com diferencial técnico + CTA
- 1 com urgência/escassez (se aplicável)
- 1 com prova social + CTA

**Restrições do Google:**
- Headline: 30 caracteres
- Description: 90 caracteres
- Sem emojis, sem caps lock, sem repetição de palavras
- Sem afirmações superlativas não-comprovadas ("o melhor", "número 1") sem fonte

Seguir `_memoria/preferencias.md` pra tom.

### Passo 5 — OPA-A continuação: Extensões

Gerar CSVs separados pra cada tipo de extensão:

- **Sitelinks** (4-6): "Sobre nós", "Catálogo", "Cases", "WhatsApp", "Localização"
- **Callouts** (6-8 frases curtas, max 25 chars): diferenciais sem CTA — "Sem fidelidade", "Implantação em dias", "Suporte humano", "IA First", "Setup guiado". Formato CSV simples: Campaign, Callout text, Status.
- **Chamadas** (telefone): puxar de `_memoria/empresa.md`. Se não tiver telefone, **não gerar este arquivo** — documentar o motivo em `configuracoes.md`.
- **Snippets estruturados:** lista de serviços, categorias de produto
- **Preço** (se aplicável): faixas de preço dos serviços principais — só gerar se preço estiver confirmado/publicado
- **Promoção** (se aplicável): desconto, condição especial

### Passo 6 — OPA-O + OPA-P: Configurações + Público

Gerar arquivo `configuracoes.md` com:

**Lances (OPA-O continuação):**
- Estratégia: focar em **Conversões** (não cliques)
- **Conta nova / zero histórico de conversão → Manual CPC** (lance máx R$3-8 conforme nicho). Motivo: "Maximizar Conversões" sem dados gasta de forma errática e estoura CPA. Manual CPC dá teto previsível e coleta dados limpos.
- **Migrar pra "Maximizar Conversões"** após ~15-20 conversões registradas.
- **Migrar pra "Maximizar Conversões com tCPA"** após 30+ conversões. CPA-alvo inicial = usar estimativa de custo/lead do briefing ou SEO; ajustar com dado real.
- Conta com histórico (30+ conv/mês) → pode começar direto em "Maximizar Conversões".

**Redes:**
- Só **Rede de Pesquisa**
- **Remover parceiros de pesquisa** (funcionam pior)

**Orçamento:**
- Diário (gastar em 24h, aparecer 24/7) OU
- Total (gastar entre 2 datas, quando programa horários)

**Segmentação geográfica (OPA-P):**
- Cidade/CEP/**alfinete no mapa + raio** (mudar milhas→km)
- Raio inicial ~1 km pra negócio local com endereço específico
- **Opção de local = "Presença"** (quem ESTÁ no local). NUNCA "Interesse"

**Idioma:**
- Sempre **português + inglês + espanhol** (captura busca de gringos/expats)

**Datas + programação de anúncios:**
- Início/fim
- Dias/horários (mín. blocos de 15 min; ex.: 8h-18h seg-sex pra negócio horário comercial)

**Dispositivos:**
- Ajustes recomendados (mobile +0%, desktop +0%, tablet -20%)

**Conversões a configurar (obrigatório antes de ativar):**
- Clique no WhatsApp
- Envio de formulário
- Ligação telefônica
- Tempo no site (>2 min como micro-conversão)

> Sem conversão configurada, Google não otimiza. Relatar isso e exigir setup antes de ativar.

### Passo 7 — Gerar os CSVs

Estrutura de pastas final:

```
marketing/campanhas/google-ads-<YYYY-MM-DD>/
  campanhas.csv          ← linha por campanha
  grupos.csv             ← linha por grupo de anúncio
  keywords.csv           ← keywords + match type
  keywords-negativas.csv ← negativas por grupo + lista global
  anuncios.csv           ← RSAs (headlines + descriptions)
  extensoes-sitelinks.csv
  extensoes-chamadas.csv          ← só se tiver telefone em empresa.md
  extensoes-callouts.csv          ← sempre gerar (6-8 frases curtas)
  extensoes-snippets.csv
  extensoes-preco.csv             ← só se preço confirmado/publicado
  configuracoes.md       ← config + checklist de import
  README.md              ← passo a passo pra importar no Google Ads Editor
```

**Formato dos CSVs:** seguir o padrão de importação do Google Ads Editor (colunas: Campaign, Ad group, Keyword, Match type, Status, Max CPC, etc.).

### Passo 8 — Resumo + plano 30 dias

Mostrar pro usuário:

```
✓ Campanha pronta: marketing/campanhas/google-ads-<YYYY-MM-DD>/

Estrutura:
- <N> campanhas
- <N> grupos de anúncio
- <N> palavras-chave (positivas)
- <N> palavras-chave negativas
- <N> RSAs

Pra subir (ordem obrigatória no Editor):
1. campanhas.csv
2. grupos.csv
3. keywords.csv
4. keywords-negativas.csv
5. anuncios.csv
6. extensoes-*.csv (qualquer ordem)

Checklist antes de ativar:
- [ ] Conversão configurada e testada (Tag Assistant)
- [ ] Segmentação geográfica = "Presença" (não "Interesse")
- [ ] Parceiros de pesquisa desativados
- [ ] Tudo "Pausado" — ativar manualmente
- [ ] Botão de WhatsApp/formulário da landing funcionando no mobile
```

**Plano de monitoramento 30 dias** (incluir em `configuracoes.md`):

- **Dias 1-7:** Monitorar diariamente. Relatório de Termos de pesquisa → adicionar negativas conforme aparecerem. Confirmar conversões sendo registradas.
- **Semanas 2-3:** Pausar keywords/RSAs com CTR < 1,5% após 100 impressões ou CPL acima do esperado. Realocar verba pros que performam.
- **Semana 4:** Se ≥ 30 conversões → migrar pra tCPA. Avaliar expansão (2º RSA por grupo, grupos novos, PMax, Display remarketing).
- **Métricas-chave no dia 14:** custo/conversão, termos de pesquisa reais, CTR por título do RSA, frase vs exata (qual traz lead mais barato).

---

---

## Modo B — Campanha "Dominação Top 1" (botão Anunciar dentro do GBP)

Campanha #3 das 4 Campanhas de Ouro. Roda DENTRO do Google Business Profile (`business.google.com`), NÃO no Editor.

**Quando usar:**
- Cliente novo sem site
- Negócio local (raio 5-10 km)
- Quer ROI em 1-3 dias
- Orçamento curto (R$100-300/mês já move agulha)

**Pré-requisito:** GBP otimizado (rodar `/google-meu-negocio` antes). Sem perfil completo, campanha rende mal.

**7 passos:**
1. Acessar GBP do cliente → botão **"Anunciar"**
2. Configurar campanha pra este perfil → avançar
3. Destino do clique = perfil da empresa (mantém)
4. Google verifica perfil → avançar
5. Objetivo = **mais chamadas** (telefone — o que mais funciona pra local). Alternativa: visitas à loja
6. Títulos + descrições (repetir palavras-chave do nicho + bairro) + telefone (decidir exibir endereço ou não)
7. Palavras-chave (do Passo 2 acima) + raio de atuação (~5 km início) + orçamento diário → publicar

**Output:** documento curto em `marketing/campanhas/dominacao-top1-<YYYY-MM-DD>/configuracao.md` com:
- Títulos+descrições aprovados
- Lista de keywords usadas
- Raio + orçamento configurado
- Print/anotação do estado inicial (ligações/visitas) pra comparar depois

**Não usa CSV.** Configuração é manual no painel GBP — skill entrega tudo pronto pra copiar-colar.

---

## Regras

- **Sempre ler `_memoria/framework-trafego.md` antes de executar.**
- **Nunca inventar dados de CPC.** Se cliente perguntar quanto vai custar, falar que depende da concorrência real e dar faixa baseada em WebSearch
- **Sempre começar pausado.** Cliente revisa, ativa quando aprovar
- **Não anunciar pra termos informacionais.** "Como fazer X" raramente converte — deixar pra SEO orgânico
- **Match type:** começar com **frase + exata** na maioria. Ampla só com 30+ dias de dados consistentes
- **Lista de negativas global** obrigatória — sem ela, queima dinheiro em buscas irrelevantes
- **Conversões antes de tudo.** Sem conversão configurada, Google não otimiza — relatar e exigir setup antes de ativar
- **Idiomas:** sempre português + inglês + espanhol (não só pt)
- **Local:** sempre opção **"Presença"** (não "Interesse")
- **Bolo de Cenoura:** validar correspondência keyword=anúncio=landing em toda campanha
- Copies seguem `_memoria/preferencias.md` estritamente. Sem jargão de marketing se público não usa
