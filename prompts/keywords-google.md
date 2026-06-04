# Mestre do Bolo de Cenoura — Keywords Google

## Quando usar
Antes de campanha Google Search ou estratégia SEO. Gera lista de keywords de alta intenção + correlatas + negativas.

## Inputs necessários
- Marca / nome do negócio
- Ação desejada (clique no WhatsApp / agendar demo / comprar / ligar)
- Produto/serviço (lista)
- Localização (cidade / bairro / nacional)
- Persona (output de `persona.md`)

## Prompt

```
Você é especialista em SEO e Google Ads aplicando lógica do BOLO DE CENOURA
FOFINHO (termo pesquisado = anúncio = página destino).

CONTEXTO:
- MARCA: [nome]
- AÇÃO DESEJADA: [WhatsApp / demo / compra / ligação]
- PRODUTO/SERVIÇO: [lista]
- LOCALIZAÇÃO: [cidade ou "nacional"]
- PERSONA:
<<<
[colar persona]
>>>

Devolva nessa estrutura:

## 1. KEYWORDS DE ALTA INTENÇÃO (top 10 — focar primeiro)

Critério: intenção de compra explícita (verbos: comprar, contratar, agendar,
orçamento, encomendar, obter, serviço, curso).

| Keyword | Tipo correspondência sugerido | Match | Volume estimado | Intenção |
|---------|-------------------------------|-------|-----------------|----------|
| ... | Frase | "..." | Alto/Médio/Baixo | Transacional |

## 2. KEYWORDS CORRELATAS (top 20 — segunda onda)

Termos relacionados, menos diretos. Útil pra expandir alcance depois.

| Keyword | Tipo | Match |
|---------|------|-------|

## 3. KEYWORDS LOCAIS (se aplicável)

Mesma lista repetida com modificadores: "[serviço] em [bairro]", "[serviço]
perto de mim", "[serviço] [cidade]".

## 4. KEYWORDS NEGATIVAS OBRIGATÓRIAS (lista pra NÃO aparecer)

Por categoria:

### 4.1 Genéricas (top 50)
- gratis
- grátis
- baixar
- pdf
- como fazer
- diy
- ... [50 termos]

### 4.2 Específicas do nicho
- [termos que confundem mas não convertem no nicho]

### 4.3 Concorrentes (se NÃO for campanha de brand bidding)
- iclinic
- vitta
- conempresa
- [adicionar concorrentes pra NÃO gastar com eles]

### 4.4 Profissionais (se vende B2C, evitar B2B e vice-versa)
- [termos que indicam público errado]

## 5. CLUSTERS (agrupamento pra grupos de anúncio)

Pra cada cluster:

### Cluster 1: [Tema, ex.: "Invisalign"]
- Keywords inclusas: [lista]
- Landing page sugerida: [URL]
- Headline-âncora pro anúncio: "[texto curto repetindo termo]"

### Cluster 2: ...

> Cada cluster = 1 grupo de anúncio (caixinha do Bolo de Cenoura).

## 6. ESCOLHA FINAL — recomendado começar com:

**5-8 keywords prioritárias** (combinando alta intenção + local + baixa
dificuldade):
1. ...
2. ...
...

## 7. CONFERÊNCIA DO BOLO DE CENOURA

Pra cada keyword prioritária, validar:
- ✅ Termo bate com headline do anúncio?
- ✅ Anúncio bate com conteúdo da landing?
- ✅ Landing entrega o prometido em <5 segundos de scroll?

Se ❌ em algum item → quebra do bolo → Quality Score baixo → CPC caro.
Corrigir landing OU anúncio antes de subir.

## 8. RECOMENDAÇÃO DE MATCH TYPE INICIAL

- **Frase** (aspas) na maioria: controle alto, alcance médio
- **Exata** (colchetes) pra termos premium: caro mas conversão alta
- **Ampla** (sem símbolo): NÃO USAR antes de 30 dias de histórico

## 9. ANSWER THE PUBLIC

Sugiro rodar 2-3 termos no Answer the Public pra validar volume:
- [termo 1]
- [termo 2]
- [termo 3]
Link: https://answerthepublic.com/
```

## Output esperado
9 seções estruturadas. Top 5-8 da seção 6 alimenta direto o `/google-ads` (campo keywords) e `/google-seo` (pesquisa-demanda).

## Regras
- Nunca aceitar lista crua sem 9 seções
- Sempre validar Bolo de Cenoura (seção 7)
- Negativas obrigatórias — sem elas, queima dinheiro
- Volume "estimado" = estimativa baseada em densidade SERP. Marcar como tal
- Pra precisão real: Google Keyword Planner via conta Google Ads (grátis)
