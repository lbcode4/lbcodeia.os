# Passos 5-8 — Conteúdo, Google Ads, Monitoramento, GEO

## Passo 5 — CONTEÚDO: Estratégia de autoridade

**Objetivo:** Criar plano de conteúdo que posicione a empresa como referência no nicho.

1. Baseado nos termos do Passo 1 (especialmente os informacionais):

   **Páginas/posts evergreen:**
   - 5-10 ideias que respondem dúvidas reais do público
   - Pra cada ideia: título otimizado, keyword-alvo, estrutura de headings, estimativa de tamanho

   **Cluster de conteúdo:**
   - Página pilar
   - Páginas satélite que linkam pra pilar
   - Estrutura de internal linking

   **Calendário editorial:**
   - Prioridade de publicação
   - Frequência sugerida
   - Formato (blog post, guia, FAQ, comparativo)

   **Conteúdo local:**
   - Páginas de área de atendimento (se fizer sentido)
   - Conteúdo com referências locais

**Output:** `marketing/google-seo/05-estrategia-conteudo.md`

> Essa lista é o insumo da skill `/lb-conteudo-publicar` — cada item dessa estratégia vira artigo + carrossel + legendas com um único comando.

---

## Passo 6 — GOOGLE ADS: Campanhas prontas pra rodar

**Objetivo:** Estruturar campanhas baseadas nos dados reais da pesquisa.

1. Definir **objetivo das campanhas:**
   - Geração de leads (ligações, WhatsApp, formulário)
   - Visitas ao site
   - Alcance local

2. **Estrutura de campanhas:**

   **Search:**
   - Grupos de anúncios (1 por cluster de keyword)
   - Pra cada grupo: 10-15 palavras-chave, lista de negativas, 3 RSAs, extensões
   - Orçamento diário, estratégia de lance, segmentação geográfica

   **Local (se aplicável):** anúncios pra Google Maps, segmentação por proximidade

   **Display/Remarketing (opcional):** públicos, formatos

3. **Copies dos anúncios:**
   - Seguir tom de `_memoria/preferencias.md`
   - Incluir diferenciais concretos
   - CTAs específicos
   - 15 headlines, 4 descriptions

4. **Landing page:** avaliar se o site atual serve ou precisa de página específica

**Output:** `marketing/google-seo/06-google-ads.md` com estrutura completa, palavras-chave organizadas, copies prontas, orçamento e configurações.

> A skill `/lb-google-ads` consome esse arquivo e gera o CSV pronto pra importar no Google Ads.

---

## Passo 7 — MONITORAMENTO: Checklist mensal

**Objetivo:** Garantir que o trabalho continue dando resultado.

**Semanal:**
- Posição nos top 10 termos
- Responder avaliações no GMB
- Postar no GMB (1x/semana mínimo)

**Mensal:**
- Revisar métricas do Google Ads (CTR, CPC, conversões, custo/lead) — usar `/lb-meta-relatorio`
- Verificar tráfego orgânico (Google Search Console)
- Atualizar palavras-chave negativas
- Publicar 1-2 conteúdos do calendário editorial
- Verificar citações/diretórios

**Trimestral:**
- Refazer pesquisa de concorrência (Passo 2 resumido)
- Atualizar fotos e posts do GMB
- Revisar estratégia de conteúdo
- Avaliar novas oportunidades de keywords

**Output:** `marketing/google-seo/07-checklist-monitoramento.md`

---

## Passo 8 — GEO: Aparecer nas respostas de IAs

**Objetivo:** Otimizar a presença pra que IAs generativas (ChatGPT, Gemini, Perplexity, Copilot) citem a empresa quando alguém perguntar sobre o nicho.

**Por que importa:** Cada vez mais clientes perguntam pra IAs "qual o melhor fornecedor/serviço de X em Y?" — quem aparece ganha lead qualificado sem pagar ads.

1. **Auditoria GEO:**
   - WebSearch nos top 10 termos em engines de IA (Perplexity, etc.)
   - Verificar se a empresa (ou concorrentes) aparece
   - Mapear quais fontes as IAs citam pra esse nicho

2. **Conteúdo otimizado pra IA:**
   - Cada artigo do Passo 5 deve ter **respostas diretas** nas primeiras linhas
   - Incluir **dados concretos** (números, certificações, endereços, fatos verificáveis)
   - Estruturar com **perguntas como H2/H3** (formato Q&A)
   - Evitar texto vago — IAs descartam genérico

3. **FAQ Schema no site:**
   - Seção de FAQ com perguntas reais do nicho
   - Implementar FAQPage schema (JSON-LD)
   - 5-10 perguntas sugeridas baseadas no que o público pergunta

4. **Citações externas (menções):**
   - As IAs pesam menções em fontes confiáveis
   - Ações: diretórios, sites de avaliação, guest posts, menções em blogs do nicho, aparições em mídia

5. **Dados estruturados reforçados:**
   - LocalBusiness, FAQPage, Product, Article schemas

6. **Monitoramento GEO:**
   - A cada 30 dias, testar os top 5 termos no ChatGPT, Gemini, Perplexity
   - Registrar: a empresa apareceu? quem apareceu? fonte citada?
   - Ajustar conteúdo com base nos resultados

**Output:** `marketing/google-seo/08-geo-otimizacao-ia.md` com auditoria, FAQ + schema JSON-LD, lista de ações pra aumentar citações, checklist de monitoramento.
