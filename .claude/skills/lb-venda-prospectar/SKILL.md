---
name: lb-venda-prospectar
description: >
  Orquestra prospecção completa via Fórmula PLANO (Posicionamento, Lugar, Abordagens, Nicho,
  O que sei). Define nicho + acha 50-100 prospects em 5 fontes (Biblioteca de Anúncios Meta,
  Google site:, redes, recursos do nicho, lista de contatos), levanta dossiê de cada (via
  /lb-venda-dossie), gera roteiro de 10 pontos com pontos de conexão personalizados,
  sequência de follow-up e material de valor. Funil: 60-100 abordagens/sem → 1-2 fechamentos/mês.
  Use quando o usuário pedir "achar cliente", "prospecção", "vou prospectar",
  "abordagem fria", "captar leads B2B", ou /lb-venda-prospectar.
---

# /lb-venda-prospectar — Fórmula PLANO + roteiro 10 pontos

Pega o conhecimento técnico e transforma em dinheiro via prospecção ativa.

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO
- **Skill `/lb-venda-dossie`** — levanta dossiê de cada lead
- **Skill `/lb-conteudo-auditoria-insta`** (Posicionamento — auditar próprio IG do gestor)
- **Contexto:** `_memoria/empresa.md` (o que vende)
- **Tom:** `_memoria/preferencias.md`
- **99 scripts WhatsApp (se existir):** `marketing/scripts-whatsapp/`
- **WebSearch + WebFetch:** pra fontes de leads
- **Outputs:** `marketing/prospeccao/<nicho>-<YYYY-MM-DD>/`

---

## Princípio (mentalidade)

- **Gestor vende dinheiro:** "vende nota R$100 por R$20"
- **Lei 1:** pago pelo tamanho do problema que resolve
- **Lei 2:** ganha proporcional ao dinheiro que põe no bolso dos outros
- **ICP no início = "Indivíduo com Pix"** (feche o que vier); mire 1 nicho só pra estudar
- **Confiança vem da prática** (60-100 abordagens/sem) — não do estudo teórico

---

## Workflow — Fórmula PLANO

### P — Posicionamento (cartão de visitas online do gestor)

Antes de prospectar, **auditar próprio perfil**:
1. Rodar `/lb-conteudo-auditoria-insta` no perfil do GESTOR (não do cliente)
2. Score <5/7 → arrumar antes de prospectar (foto sem camisa, óculos escuro, etc.)
3. Posicionamento padrão = **"prestador de serviços da internet"** (faz o que empresa precisa pra crescer online)

Não precisa ser influencer — só profissional.

### N — Nicho (segmento de mercado)

Pedir nicho ao usuário. Se vazio, sugerir critérios:
1. **O que gosta / tem afinidade** (best path)
2. **Nichos que vendem caro / lucram mais** (margem boa)
3. **Pesquisar 1h** (> maioria que pula esse passo)

**Recomendação default:** prestador de serviço, com posicionamento na internet, que **NÃO anuncia ainda** (margem maior, sem trauma de gestor anterior). Negócios locais facilitam mas evitar cidades <50k hab.

**Após escolher nicho:**
- Rodar agente persona pro **DONO** (não cliente final) — chama `prompts/persona.md` (Sprint 5)
- Persona deve devolver métricas financeiras do negócio:
  - Faturamento bruto, lucro líquido, margem
  - Ticket médio, atendimentos/mês
  - Taxa de retorno, LTV, CAC
  - Taxa de ocupação da agenda
  - Faturamento por funcionário
- Essas métricas = ouro pra falar de igual com o dono na abordagem

### L — Lugar (5 fontes pra achar negócios — TODAS gratuitas)

#### 1. Lista de contatos pessoais
- WhatsApp + seguidores IG/FB
- ~200 contatos × rede de cada = ~40k pessoas (teoria dos 6 graus)
- **Pedir indicação com comissão:** "X% da 1ª mensalidade por cliente fechado"

#### 2. Biblioteca de Anúncios Meta
- `https://www.facebook.com/ads/library/`
- Buscar termo do nicho (ex.: "empresa estética São Paulo")
- Filtrar anúncios ativos
- **Dica:** ver "plataformas" do anúncio:
  - Só IG + botão "acessar perfil" = botão turbinar (pessoa não domina = lead frio mas educável)
  - Várias plataformas = gerenciador (sabe mais = lead frio difícil de converter)
  - **Lead mais quente: nicho que NÃO anuncia ativamente** (já vê a dor mas não sabe como resolver)

#### 3. Redes sociais (busca por nicho)
- Instagram: buscar termo do nicho ("nutri", "dr", "empresa estética")
- LinkedIn: filtrar empresas por setor + região

#### 4. Google com operadores
```
site:instagram.com nutricionista campinas
site:instagram.com clinica estetica sao paulo gmail OR hotmail OR outlook
```
- Adicionar `gmail OR hotmail OR outlook` → acha emails

#### 5. Recursos/ferramentas do nicho
- App Barber → barbearias seguem/curtem
- Doctoralia → médicos cadastrados
- Booksy → estética
- Ferramenta vertical do nicho → seguidores/usuários = leads

**Meta de coleta:** 50-100 leads iniciais (vai filtrar nos próximos passos).

### O — O que eu sei (dossiê — define sucesso/fracasso)

**Achar é fácil. Levantar dossiê é o diferencial.**

Pra cada lead (ou lote priorizado de 20-30):
- Chamar `/lb-venda-dossie` com nome+URL+handle
- Dossiê de 1 página gerado em `marketing/prospeccao/dossies/<slug>.md`

Reservar 30-60 min/dia só pra dossiês.

### A — Abordagens

#### 6 canais — escolher 1-2 prioritários

| Canal | Prós | Contras | Início? |
|-------|------|---------|---------|
| **Presencial** | Olho no olho, grátis, alta conversão | Pouca escala, cara de pau | Não em volume |
| **WhatsApp / Rede social** | 1-a-1, fácil de achar, contato profissional padrão hoje | Pode ser ignorado, número de envios limitado | ✅ **RECOMENDADO PRA COMEÇAR** |
| **E-mail** | Escala, dá tempo de pensar | Dono pode não ler, vai pra spam | Bom pra FUP |
| **Cold call** | Dono atende telefone | Precisa jeito, requer prática | Funciona bem, mas exige técnica |
| **Tráfego pago** | Escala máxima | Precisa dinheiro + perfil maduro | Não começar por aqui |

**Regra de ouro:** melhor canal = o que você consegue fazer **constantemente** (analogia dieta: adesão > método).

#### Roteiro 10 pontos (igual pra todos os canais)

Cada abordagem segue:

1. **Cumprimento** ("Oi [Nome], tudo bem?")
2. **Quem sou + o que faço + tempo necessário** ("Sou [Nome], gestor de tráfego pra empresas. Sou rápido, levo 1 minuto.")
3. **Como te encontrei** ("Cheguei no perfil de vocês pelo Instagram, depois de buscar por empresas de estética em [bairro]")
4. **Filtro do tomador de decisão** ("Você é o responsável pelo marketing da empresa?")
5. **Prova social** — sem mentir. Se não tem: "Meu foco hoje é estar 100% disponível para 2-3 empresas e entregar resultado consistente"
6. **O que entrego** ("Trabalho com captação de clientes via Instagram e Google — agendamento direto no WhatsApp")
7. **Espaço pro não** ("Talvez não faça sentido agora, mas quis te mandar")
8. **Escassez com verdade** ("Tô selecionando 2 empresas pra começar esse mês")
9. **Chamada pro envio do material** ("Preparei uma análise rápida do perfil de vocês e algumas ideias — posso te enviar?")
10. ⭐ **Pontos de conexão** (do dossiê — diferencial principal):
    - "Vi que vocês inauguraram a 2ª unidade em Moema mês passado"
    - "Notei que vocês usam Booksy pra agenda"
    - "Curti o post sobre harmonização — tem 2k curtidas"

> Abordagem genérica = nota 5 (espera por milagre). Abordagem com 10 = converte.

Gerar via `prompts/script-prospeccao.md` (Sprint 5).

#### Material a enviar ("Plano de Marketing")

Após resposta positiva, mandar pacote de valor:
- Pesquisa de audiência (persona do nicho)
- 3-5 ideias de anúncios prontos (Biblioteca Meta + GCC)
- Análise do GBP atual (chamar `/lb-google-meu-negocio` diagnóstico)
- Análise do perfil IG (chamar `/lb-conteudo-auditoria-insta` diagnóstico)
- Sugestão de 1ª campanha (com orçamento)
- 5-10 dos 99 scripts WhatsApp pra negócio dele

**Entregar valor de graça mostra capacidade — gera confiança, não rouba o cliente.**

#### Pós-resposta — como entregar o material

**2 opções (1 funciona mais):**

1. ✅ **Vídeo curto** (1-2 min) apresentando o plano + chamar pra reunião — sempre dar 2 horários concretos. **Funciona mais.**
2. Só enviar link + perguntar.

Pode mandar em áudio (sorrir tem som; energia alta, voz confiante).

---

## Output

```
marketing/prospeccao/<nicho>-<YYYY-MM-DD>/
  00-persona-dono.md       ← persona do DONO + métricas financeiras
  01-leads.csv             ← 50-100 leads coletados das 5 fontes
  02-leads-priorizados.csv ← top 30 com critério (anuncia? IG forte? GBP fraco? margem alta?)
  dossies/                 ← 1 por lead priorizado (gerado por /lb-venda-dossie)
    <slug-1>.md
    <slug-2>.md
    ...
  03-roteiros/             ← 1 roteiro personalizado por lead (10 pontos com pontos de conexão)
    <slug-1>-whatsapp.md
    <slug-1>-coldcall.md
    ...
  04-followups.md          ← sequência FUP 1-3 dias / 7 dias / 14 dias
  05-material-valor/       ← plano de marketing pra anexar
    persona-nicho.md
    ideias-anuncios.md
    analise-gbp.md
    analise-ig.md
    sugestao-campanha-inicial.md
    scripts-whatsapp.md
  06-funil-status.md       ← controle: enviado / respondeu / reuniao / fechou
```

---

## Funil de prospecção (números de referência)

"Nenhum plano sobrevive ao campo de batalha."

**Meta: 60-100 abordagens/semana.**

Conversão típica:
- 60-100 abordagens → ~20% respondem (12-20 conversas)
- → ~20-30% topam reunião (3-6 reuniões)
- → ~20-40% fecham (1-2 fechamentos/mês)

**≈ 1-2 clientes novos/mês** em ritmo consistente.

Tempo médio: ~1h/dia bem feito.

---

## Sequência de Follow-up (FUP)

| Quando | Mensagem |
|--------|----------|
| **D+1** (sem resposta inicial) | "Oi [Nome], passei aqui rápido pra confirmar — viu minha mensagem ontem? Sem stress se não der pra agora, queria só confirmar que chegou" |
| **D+3** | Resgatar 1 ponto de conexão + reenviar oferta de material de valor |
| **D+7** | Mudar canal (se WhatsApp, tentar email; se email, tentar IG) |
| **D+14** | Mensagem final "vou parar de te incomodar" + deixar porta aberta |
| **D+30** | Touch sazonal (novidade, dado novo do mercado) |

Após D+14 sem resposta = arquivar como "frio". Voltar em 90 dias com motivo novo.

---

## Regras

- **Sempre ler `_memoria/framework-trafego.md`** antes
- **Sempre auditar próprio perfil IG** (Posicionamento) antes de prospectar
- **Sempre fazer dossiê** antes de abordar (10 pontos sem ponto de conexão = nota 5)
- **Pontos de conexão devem ser ESPECÍFICOS** — "vocês são bons" não conta; "vi que abriram 2ª unidade em Moema" conta
- **NUNCA inventar prova social** — se não tem cliente, usar "foco em estar 100% disponível pra 2-3"
- **Sempre dar 2 horários concretos** ao agendar reunião
- **Material de valor é grátis** — entrega capacidade, não pede nada em troca
- **Volume é o que move** — 60-100/sem. Sem volume, técnica não importa
- **Adesão > método** — escolher canal que você faz CONSISTENTEMENTE
- **Arquivar após D+14** sem resposta — não insistir
