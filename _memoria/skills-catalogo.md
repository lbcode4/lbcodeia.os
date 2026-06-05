# Catálogo de Skills — Aplicabilidade por Modelo de Negócio

> Análise feita em 2026-05-27. Mapeia qual skill faz sentido pra qual modelo de negócio.
> Sistema LBCode.IA tem 42 skills + 8 prompts de apoio — nem todas servem pra todo modelo.
> (11 skills live de ads — `lb-meta-*`, `lb-google-dashboard`, `lb-ads-*` — integram Graph API + Google Ads API via `integracoes/`.)

---

## Modelos de negócio cobertos

| Modelo | Quem é | Como vende |
|--------|--------|------------|
| **SaaS B2B nacional** | [seu produto] | Ads + LP + demo → fechamento → MRR |
| **Agência de tráfego** | Gestor solo / pequena agência | Prospecção 1-a-1 → contrato mensal R$750-1k/cliente |
| **Negócio local** | Empresa, restaurante, loja física | GBP + Ads geo-segmentados → clientes do bairro |
| **Criador solo** | Influencer, infoprodutor | Conteúdo orgânico + Meta Ads → produto digital |

Cada projeto-filho (`/lb-sistema-novo-projeto`) se encaixa em 1 desses modelos — definido no `CLAUDE.md`
do projeto. A matriz abaixo diz quais skills ativar por modelo. O parent é genérico: carrega
todas, cada filho usa o subconjunto do seu modelo.

---

## Matriz skill × modelo

| Skill | SaaS B2B | Agência | Local | Criador | Notas |
|-------|----------|---------|-------|---------|-------|
| `/lb-sistema-abrir` | ✅ | ✅ | ✅ | ✅ | Núcleo |
| `/lb-sistema-instalar` | ✅ | ✅ | ✅ | ✅ | Núcleo |
| `/lb-sistema-atualizar` | ✅ | ✅ | ✅ | ✅ | Núcleo |
| `/lb-sistema-salvar` | ✅ | ✅ | ✅ | ✅ | Núcleo |
| `/lb-sistema-novo-projeto` | ✅ | ✅ | ✅ | ✅ | Núcleo |
| `/lb-negocio-mapear-rotinas` | ✅ | ✅ | ✅ | ✅ | Núcleo |
| `/lb-conteudo-carrossel` | ✅ | ✅ | ✅ | ✅ | Universal |
| `/lb-conteudo-publicar` | ✅ | ✅ | ✅ | ✅ | Universal |
| `/lb-conteudo-aprovar` | ✅ | ✅ | ✅ | ✅ | Universal |
| `/lb-google-seo` | ✅ | ✅ | ✅ | ⚠️ | Passo 3 GMB inútil pra SaaS |
| `/lb-google-ads` | ✅ | ✅ | ✅ | ⚠️ | Modo B Dominação Top 1 inútil pra SaaS |
| `/lb-ads-conectar` | ✅ | ✅ | ✅ | ✅ | Infra — valida token Meta + cadastra conta em `_memoria/contas-ads.md` (Google no Plano 2) |
| `/lb-meta-relatorio` | ✅ | ✅ | ✅ | ✅ | Universal — lê CSV/print manual (vs /lb-meta-dashboard live) |
| `/lb-meta-campanha-whatsapp` | ✅ | ✅ | ✅ | ⚠️ | Adaptar mensagem inicial por modelo |
| `/lb-meta-dashboard` | ✅ | ✅ | ✅ | ✅ | Live API → HTML; precisa conta em `_memoria/contas-ads.md` + token |
| `/lb-meta-completo` | ✅ | ✅ | ✅ | ✅ | Live API — dashboard completo (pago vs orgânico, seguidores, resumo exec); precisa act_id + IG ID |
| `/lb-meta-diagnostico` | ✅ | ✅ | ✅ | ✅ | Live API — KPIs + alertas; precisa conta + token |
| `/lb-meta-auditoria` | ✅ | ✅ | ✅ | ✅ | Live API — quick wins adsets/placements; precisa conta + token |
| `/lb-meta-analise-reels` | ✅ | ✅ | ✅ | ✅ | Live API — análise + ranking reels pagos + impulsionamento; precisa conta + token |
| `/lb-meta-copy` | ✅ | ✅ | ✅ | ✅ | Live API — copy dos top criativos; precisa conta + token |
| `/lb-meta-gerenciar` | ✅ | ✅ | ✅ | ✅ | Live API mutate — pausar/ativar com confirmação + log; precisa conta + token |
| `/lb-google-dashboard` | ✅ | ✅ | ✅ | ⚠️ | Live API Google → HTML; precisa Google Ads ID + yaml |
| `/lb-ads-unificado` | ✅ | ✅ | ✅ | ⚠️ | Funde Google+Meta; precisa ambos os IDs + ambas as creds |
| `/lb-ads-negativas` | ✅ | ✅ | ✅ | ❌ | Live API — termos de busca → negativas; só faz sentido com Google Ads |
| `/lb-meta-campanha-seguidores` | 🟡 | ✅ | ✅ | ✅ | Dormente pra SaaS até perfil ter tração |
| `/lb-conteudo-auditoria-insta` | 🟡 | ✅ | ✅ | ✅ | Útil pra qualquer perfil — IG bloqueia WebFetch, depende prints |
| `/lb-negocio-analisar-dados` | ✅ | ✅ | ✅ | ✅ | Universal |
| `/lb-venda-email` | ✅ | ✅ | ✅ | ✅ | Universal |
| `/lb-google-meu-negocio` | ❌ | ✅ | ✅ | ❌ | SaaS nacional não tem endereço físico |
| `/lb-google-avaliacoes` | ❌ | ✅ | ✅ | ❌ | Sem GBP = sem avaliações Google |
| `/lb-venda-prospectar` | ✅¹ | ✅ | ❌ | ❌ | ¹SaaS fase pré-tração: prospecção 1:1 pra fechar primeiros clientes |
| `/lb-venda-dossie` | ✅¹ | ✅ | ❌ | ❌ | ¹Idem — dossiê é pré-requisito de abordagem personalizada |
| `/lb-venda-proposta` | ✅ | ✅ | ❌ | ❌ | Fecha funil comercial; HTML→PNG 2 páginas estilo pack |
| `/lb-venda-diagnostico` | ✅ | ✅ | ✅ | ❌ | Isca de venda — diagnóstico grátis abre conversa |
| `/lb-venda-objecoes` | ✅ | ✅ | ❌ | ❌ | Banco das 10 objeções B2B + contornos |
| `/lb-venda-follow-up` | ✅ | ✅ | ❌ | ❌ | Sequência 5 msgs pós-abordagem; complementa /lb-venda-prospectar |
| `/lb-conteudo-reels` | ✅ | ✅ | ✅ | ✅ | Formato de maior alcance orgânico — complementa /lb-conteudo-carrossel |
| `/lb-conteudo-analise-reels-organico` | ✅ | ✅ | ✅ | ✅ | Live API — lê reels orgânicos, acha padrão vencedor e gera roteiro data-driven; precisa conta + token |
| `/lb-conteudo-stories` | ✅ | ✅ | ✅ | ✅ | Sequência 5-7 stories interativos baseada em RETINA |
| `/lb-conteudo-calendario` | ✅ | ✅ | ✅ | ✅ | Calendário mensal 20-25 posts nos 6 pilares RETINA |
| `/lb-venda-precificar` | ✅ | ✅ | ❌ | ❌ | Calcula preço SaaS/serviço com margem e benchmark |
| `/lb-negocio-plano-mensal` | ✅ | ✅ | ✅ | ✅ | Plano executivo do mês integrando todas as frentes |
| `/lb-negocio-site` | ✅ | ✅ | ✅ | ✅ | Cria site/LP via frontend-design; pergunta tipo (landing/demo/institucional/campanha) |

Legenda: ✅ útil · 🟡 dormente (ativar em fase certa) · ⚠️ útil parcial (sub-features inúteis) · ❌ não se aplica

---

## Templates `scripts/prompts/`

| Template | SaaS B2B | Agência | Local | Criador |
|----------|----------|---------|-------|---------|
| `extrair-estrutura-anuncio.md` | ✅ | ✅ | ✅ | ✅ |
| `persona.md` Modo A (cliente final) | ✅ | ✅ | ✅ | ✅ |
| `persona.md` Modo B (dono B2B) | ❌ | ✅ | ❌ | ❌ |
| `roteiro-anuncio.md` | ✅ | ✅ | ✅ | ✅ |
| `conteudo-retina.md` | ✅ | ✅ | ✅ | ✅ |
| `keywords-google.md` | ✅ | ✅ | ✅ | ⚠️ |
| `gbp-setup.md` | ❌ | ✅ | ✅ | ❌ |
| `foto-profissional.md` | ❌ | ✅ | ❌ | ✅ |
| `script-prospeccao.md` | ❌ | ✅ | ❌ | ❌ |

---

## Exemplo de triagem por projeto — modelo SaaS B2B nacional

> Exemplo de como aplicar a matriz a um projeto concreto (um SaaS B2B). Repetir esse
> raciocínio no `CLAUDE.md` de cada filho, trocando pelo modelo dele.

**Ativas usáveis nesse modelo:**
abrir, instalar, atualizar, salvar, novo-projeto, mapear-rotinas, carrossel, publicar-tema, aprovar-post, anuncio-google (Modo A), relatorio-ads, campanha-meta-whatsapp, analisar-dados, email-profissional, seo (skip Passo 3), prospectar-cliente¹, dossie-prospect¹, proposta-comercial, diagnostico-cliente, script-objecoes, follow-up, roteiro-reels, stories-sequencia, calendario-conteudo, precificar, plano-mensal

¹Fase pré-tração: prospecção 1:1 é o caminho pra fechar os primeiros clientes SaaS.

**Dormentes (ativar depois):**
- `/lb-conteudo-auditoria-insta` — sempre útil, marcar bio antes de campanha
- `/lb-meta-campanha-seguidores` — quando o perfil tiver bio + 9 quadros + ≥100 seguidores

**Não aplicáveis (preservar pra outros projetos):**
- `/lb-google-meu-negocio`, `/lb-google-avaliacoes`
- 3 templates: gbp-setup, foto-profissional, script-prospeccao

**Sub-features a ignorar dentro de skills úteis:**
- `/lb-google-seo` Passo 3 (GMB)
- `/lb-google-ads` Modo B (Dominação Top 1)

---

## Quando ativar cada modo

Se um dia [seu produto] mudar modelo:
- **Abrir braço de agência** → ativar `/lb-venda-prospectar`, `/lb-venda-dossie`, persona Modo B, script-prospeccao
- **Lançar unidade física** → ativar `/lb-google-meu-negocio`, `/lb-google-avaliacoes`, gbp-setup, Passo 3 SEO, Modo B Anuncio
- **Trocar founder por equipe** → ativar foto-profissional pra perfis profissionais individuais

Se criar OS pra cliente diferente (`/lb-sistema-novo-projeto`):
- **Cliente é agência** → todas as 22 skills + 8 templates fazem sentido
- **Cliente é negócio local** → ativar GBP + responder-avaliacoes, desativar prospectar
- **Cliente é criador solo** → desativar GBP/prospectar, focar conteúdo + Meta seguidores

---

## Lição arquitetural

Sistema LBCode.IA foi pensado pra cobrir o método "Nova Gestão de Tráfego" inteiro — método é genérico, então arsenal é genérico.

**Risco:** dono de SaaS B2B pode confundir "tenho skill X" com "preciso rodar skill X". 

**Mitigação:** esse catálogo + CLAUDE.md adaptado por modelo (no caso [seu produto], CLAUDE.md já tem bloco específico). Skills inúteis SOMEM da consulta natural quando user pergunta "o que faço agora?" — só apareceriam se user explicitamente pedir.

**Princípio:** **mais skills ≠ mais sistema.** Sistema = skills certas + memória atualizada + execução constante.
