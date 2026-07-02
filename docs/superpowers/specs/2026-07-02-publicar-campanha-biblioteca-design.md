# Publicar campanha no Meta Ads a partir da Biblioteca

Data: 2026-07-02

## Problema

Campanhas geradas pela skill `/lb-meta-campanha-whatsapp` ficam em `saidas/marketing/campanhas/...`
como arquivos `.md` (prosa). Pra publicar no Meta Ads hoje é preciso rodar `integracoes/meta-ads/scripts/campanha.py`
manualmente no terminal. O usuário quer escolher a campanha na tela **Biblioteca** e publicar direto
pelo navegador.

## Decisões (tomadas em brainstorm)

1. Botão "Publicar no Meta Ads" cria de verdade via Graph API (não é preview/dry-run).
2. Conta Meta = cliente ativo no seletor global do topo do app (`useCliente()`), resolvido via `_memoria/contas-ads.md`.
3. Se a campanha ainda não tem criativos (`criativos: null`), publica só campanha+conjunto, sem anúncios — aviso explicativo, não bloqueia.
4. Arquitetura genérica por `tipo`, mas só o publicador `whatsapp` é implementado agora. Outros tipos (`seguidores`, etc) aparecem com botão desabilitado até ganharem um publicador.
5. Fonte da verdade pra publicar é um `campanha.json` estruturado (não parse de markdown livre) — zero ambiguidade, os `.md` continuam só pra leitura humana.
6. Backfill: gerar `campanha.json` agora pras 2 pastas whatsapp já existentes (`meta-whatsapp-2026-06-26`, `meta-whatsapp-2026-07-01`).
7. "Gerar imagens" na Biblioteca não gera nada sozinho — geração criativa real só acontece em conversa com Claude Code (`/lb-conteudo-carrossel` usa julgamento de IA: layout, referências, composição). Botão só copia o comando pronto pro clipboard.
8. Depois de publicar, grava os IDs criados + timestamp de volta no `campanha.json` (campo `publicado`) — evita duplicar campanha ao clicar de novo.

## `campanha.json` — schema

```json
{
  "tipo": "whatsapp",
  "nome_campanha": "string",
  "orcamento_diario_centavos": 2000,
  "nome_conjunto": "string",
  "localizacao": { "latitude": -2.4468, "longitude": -54.7083, "raio_km": 15 },
  "idade_min": 28,
  "idade_max": 55,
  "textos": [{ "corpo": "string", "titulo": "string" }],
  "mensagem_inicial_whatsapp": "string",
  "criativos": { "1x1": "criativos/ad001-1x1.png", "9x16": "criativos/ad001-9x16.png" },
  "publicado": {
    "em": "ISO-8601",
    "campaign_id": "string", "adset_id": "string", "ad_ids": ["string"]
  }
}
```
`criativos` e `publicado` são nuláveis.

## Backend

### `server/src/campanha-publish.ts` (novo)

- `readCampanhaJson(absPath): CampanhaJson` — lê e valida shape mínimo (lança erro claro se campo obrigatório faltar).
- `writeCampanhaPublicado(absPath, resultado)` — atualiza o campo `publicado` no arquivo.
- `publishWhatsappCampanha(campanha, accountId, pageId, phone, token): ResultadoPublicacao` — porta a lógica do `campanha.py`:
  1. `POST {account}/campaigns` — `OUTCOME_ENGAGEMENT`, CBO, `bid_strategy: LOWEST_COST_WITHOUT_CAP`, `daily_budget`, `status: PAUSED`
  2. `POST {account}/adsets` — `optimization_goal: CONVERSATIONS`, `destination_type: WHATSAPP`, `targeting_automation.advantage_audience: 0` (dentro de `targeting`), `promoted_object.page_id`, `status: PAUSED`
  3. Se `criativos` existir: upload das 2 imagens (`{account}/adimages`), 1 `adcreatives` (`object_story_spec.link_data`) por texto em `textos`, `degrees_of_freedom_spec` com `IMAGE_ANIMATION`/`TEXT_OVERLAY_TRANSLATION` `OPT_OUT`, depois 1 `ads` por criativo — tudo `PAUSED`
  4. Retorna `{ campaign_id, adset_id, ad_ids: [] | string[], sem_criativos: boolean }`
- `PUBLISHERS: Record<string, PublisherFn>` — hoje só `{ whatsapp: publishWhatsappCampanha }`.
- `readMetaPageId()` / `readMetaWhatsappPhone()` — mesmo padrão de `readMetaToken()` em `meta-campanhas.ts`, lendo `META_PAGE_ID`/`META_WHATSAPP_PHONE` de `meta.env`.

### Rota nova em `server.ts`

`POST /api/biblioteca/campanhas/publicar`
Body: `{ path: string, cliente: string }` (`path` relativo à raiz do repo, ex: `saidas/marketing/campanhas/conversao/meta-whatsapp-2026-07-01`)

1. Valida `path` fica dentro de `saidas/marketing/campanhas/` (reusa guard de `readBibliotecaFile`)
2. Lê `campanha.json` da pasta. 404 se não existir.
3. Se `publicado` já preenchido → 409 `"Campanha já publicada em {data}"`
4. Resolve conta via `listContas()` + `cliente` do body. 404 se cliente sem `metaAdAccount`.
5. Se `PUBLISHERS[campanha.tipo]` não existir → 400 `"Tipo '{tipo}' ainda não suporta publicação automática"`
6. Chama o publicador, grava `publicado` no JSON, retorna resultado (200) ou erro Graph API (502)

### `biblioteca.ts` — extensão

`scanCampanhas` passa a, por subpasta de campanha, checar se existe `campanha.json` ali e devolver esse dado (não como `BibliotecaItem` solto, mas como metadado da subseção) — nova função `getCampanhaMeta(campDir)` que retorna `{ tipo, publicado } | null` pra cada pasta de campanha. Endpoint `GET /api/biblioteca` passa a incluir esse metadado por subseção em `campanhas` (estrutura: `{ subsection, tipo, publicavel, publicado }[]` anexado à seção `campanhas`).

## Frontend — `biblioteca.tsx`

- Ao selecionar a seção "Campanhas" e uma subseção (pasta), mostra um cabeçalho com:
  - Se `campanha.json` existe e `tipo` suportado e `publicado` nulo → botão **"Publicar no Meta Ads"**
  - Se `publicado` preenchido → texto **"Publicado em {data} →"** linkando pra `/gerenciar-anuncios`
  - Se `campanha.json` não existe ou tipo não suportado → botão desabilitado, tooltip explicando
- Clique em Publicar → modal de confirmação (mesmo padrão de `gerenciar-anuncios.tsx`): mostra nome da campanha, conta (cliente ativo), aviso se `criativos` for `null` ("Cria só campanha + conjunto, sem anúncios — gere as imagens depois")
- Confirma → `POST /api/biblioteca/campanhas/publicar` com `{ path, cliente }` (cliente do `useCliente()`) → loading → sucesso mostra IDs criados + link pra `/gerenciar-anuncios` / erro mostra mensagem
- Botão secundário **"Gerar imagens"** (visível quando `criativos: null`): copia pro clipboard `/lb-conteudo-carrossel para a campanha {path}` + toast "Comando copiado — cole no Claude Code"

## Skill `/lb-meta-campanha-whatsapp` — atualização

No Passo 7a (depois do checkpoint de aprovação do copy), a skill escreve `campanha.json` com `criativos: null`, `publicado: null`.
No Passo 7b (se o usuário aprovar gerar imagens), a skill atualiza o `campanha.json` existente preenchendo `criativos`.

## Migração (backfill)

Rodar uma vez (fora da skill, ad-hoc): ler os `.md` de `meta-whatsapp-2026-06-26` e `meta-whatsapp-2026-07-01`
e escrever `campanha.json` pra cada uma, seguindo o schema acima. Feito manualmente nesta sessão, não vira script permanente.

## Fora de escopo

- Publicadores pra outros tipos de campanha (`seguidores`, etc) — arquitetura permite adicionar depois.
- Geração automática de imagem sem IA.
- Edição do `campanha.json` pela UI (só leitura/gatilho de publicação).
- Multi-tenant de `META_PAGE_ID`/`META_WHATSAPP_PHONE` (permanece 1 valor global em `meta.env`, como já é hoje).

## Testes

- `campanha-publish.test.ts`: mock fetch, testa `publishWhatsappCampanha` (com e sem criativos), `readCampanhaJson` (schema inválido lança erro), dispatcher de tipo não suportado.
- `server.test.ts` (ou novo arquivo): testa rota `/api/biblioteca/campanhas/publicar` — 404 sem JSON, 409 se já publicado, 400 tipo não suportado, 200 caminho feliz (com fetch mockado).
