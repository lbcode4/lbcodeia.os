# Passos 1-4 — Demanda, Concorrência, GMB, On-page

## Passo 1 — DEMANDA: O que as pessoas buscam nesse nicho?

**Objetivo:** Entender se existe demanda real e como as pessoas buscam.

1. Ler `_memoria/empresa.md` pra extrair: produtos/serviços, região, público-alvo, diferenciais
2. Gerar uma lista inicial de **30-50 termos-semente** baseados em:
   - Categorias de produto/serviço
   - Intenção de busca (informacional, comercial, transacional)
   - Localização (cidade, região, estado)
   - Uso final / contexto do cliente
3. Usar **WebSearch** pra cada grupo de termos:
   - Buscar `"[termo] site:trends.google.com"` pra ver sazonalidade
   - Buscar `"[termo]"` pra ver o que aparece (orgânico, ads, maps)
   - Buscar `"[termo] related searches"` pra expandir a lista
4. Classificar cada termo por:
   - **Volume estimado:** alto / médio / baixo / micro
   - **Intenção:** informacional, comercial, transacional, navegacional
   - **Dificuldade:** quantos concorrentes fortes aparecem?
   - **Relevância:** direto (produto exato) / indireto (nicho relacionado) / tangencial

**Output:** Salvar em `saidas/marketing/google-seo/01-pesquisa-demanda.md` com:
- Tabela de termos classificados
- Top 10 termos prioritários (volume + intenção transacional + baixa concorrência)
- Termos sazonais
- Termos descartados e por quê

---

## Passo 2 — CONCORRÊNCIA: Quem aparece pra essas buscas?

**Objetivo:** Mapear quem domina os resultados e onde estão os gaps.

⚠️ **Pra negócio LOCAL** (cobertura 🅲 do Passo 0): SEMPRE incluir concorrentes locais via:
- WebSearch `<termo> <cidade>` E `<termo> <bairro>`
- WebSearch `<termo> perto de <CEP>` ou Google Maps direto
- Buscar pelos 3 concorrentes mais próximos no raio de ~3-5 km
- Comparar GBP de cada (nº reviews, nota, fotos, postagens)

Pra negócio NACIONAL/REGIONAL: pular Maps/Local Pack, focar orgânico + Ads.

**Passos:**
1. Pegar os **top 10 termos** do Passo 1
2. Pra cada termo, usar **WebSearch** e analisar:
   - **Top 5 resultados orgânicos:** quem são, que tipo de página (site institucional, marketplace, blog, diretório)
   - **Resultados do Maps/Local Pack:** quem aparece, quantas avaliações, nota — **OBRIGATÓRIO pra negócio local**
   - **Google Ads:** alguém anuncia? qual a copy?
3. Pra cada concorrente relevante (máx 5-8), usar **WebFetch** pra analisar:
   - Estrutura do site (páginas, blog, catálogo)
   - Meta titles e descriptions das páginas principais
   - Conteúdo: falam de quê? com que profundidade?
   - Schema markup: usam dados estruturados?
   - GMB: perfil completo? fotos? posts? avaliações?
4. Identificar:
   - **Gaps:** o que nenhum concorrente faz bem
   - **Oportunidades:** termos onde ninguém domina
   - **Ameaças:** concorrentes fortes demais pra competir de frente
   - **Benchmark:** o padrão mínimo que o negócio precisa atingir

**Output:** `saidas/marketing/google-seo/02-analise-concorrencia.md` com:
- Tabela de concorrentes
- Mapa de gaps e oportunidades
- Recomendações: onde atacar primeiro

---

## Passo 3 — GMB: Google Meu Negócio (resultado mais rápido)

**Objetivo:** Montar perfil completo do Google Business Profile pra aparecer no Maps e Local Pack.

**Por que aqui:** O GBP é o resultado mais rápido do SEO local — aparece no Maps e Local Pack antes de qualquer posicionamento orgânico. É o passo 3 porque depende dos termos-alvo do Passo 1 e do benchmark de concorrentes do Passo 2 pra preencher com as keywords certas.

> ⚡ **Este passo delega integralmente para a skill `/lb-google-meu-negocio`.**
>
> Chamar `/lb-google-meu-negocio` agora. Ela executa os 9 passos completos:
> entrevista → diagnóstico → nome otimizado → categorias → descrição 750 chars →
> Perguntas & Respostas → templates de resposta → checklist de fotos → posts + calendário.
>
> Os outputs de `/lb-google-meu-negocio` vão em `saidas/marketing/gbp/<YYYY-MM-DD>/`.
> Ao terminar, criar `saidas/marketing/google-seo/03-google-meu-negocio.md` com um **resumo de 1 página**:
> keyword principal usada, nome otimizado, categorias escolhidas e link pro pacote completo em `saidas/marketing/gbp/`.

**Preço de mercado da gestão:** R$500 setup + R$300/mês (~30-40min/semana por negócio). Útil pra precificar serviço se for vender pra cliente.

**Output:** `saidas/marketing/google-seo/03-google-meu-negocio.md` (resumo) + pacote completo em `saidas/marketing/gbp/<YYYY-MM-DD>/` (gerado pelo `/lb-google-meu-negocio`)

---

## Passo 4 — ON-PAGE: Otimizar o site

**Objetivo:** Garantir que cada página esteja otimizada pras palavras-chave certas.

1. Ler a estrutura atual do site (se `site/` existir; senão, perguntar as páginas)
2. Pra cada página:

   **Mapeamento de palavras-chave por página**

   **Meta tags otimizadas:**
   - Title (50-60 caracteres, keyword no início)
   - Meta description (150-160 caracteres, com CTA)
   - H1, H2, H3 sugeridos

   **Schema Markup (dados estruturados):**
   - LocalBusiness schema (JSON-LD)
   - Product schema pros produtos
   - FAQ schema se tiver seção de perguntas

   **Checklist técnico:**
   - URLs amigáveis
   - Alt text das imagens
   - Velocidade de carregamento
   - Mobile-friendly
   - Sitemap.xml, robots.txt, canonical, Open Graph

   **Internal linking:** mapa de links internos sugerido

**Output:** `saidas/marketing/google-seo/04-otimizacao-on-page.md` com:
- Tabela: página → keyword principal → title → description → H1
- Schema markup pronto pra copiar (JSON-LD)
- Checklist técnico com status (feito / pendente)
