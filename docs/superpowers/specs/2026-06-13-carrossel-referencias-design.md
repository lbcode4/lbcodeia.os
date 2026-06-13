# Design: Referências de Design no Carrossel

**Data:** 2026-06-13  
**Status:** Aprovado

## Problema

Ao criar um carrossel pela skill `lb-conteudo-carrossel`, o usuário não tem como fornecer imagens de referência visual antes da execução. A skill já sabe ler imagens de `identidade/` e `inspiracoes/`, mas não há mecanismo pra upload pré-execução.

## Solução

Upload temporário de imagens de referência diretamente na UI da skill, com injeção automática dos paths no briefing da skill e auto-delete após execução.

## Escopo

Arquivos alterados:
- `server/src/referencias-temp.ts` — novo módulo (save/read/delete)
- `server/src/server.ts` — 3 novas rotas
- `frontend/src/routes/skill.$skillId.tsx` — dropzone + state + injeção
- `.gitignore` — ignorar `_referencias-temp/`

## Arquitetura

```
Frontend
  └── dropzone + thumbnails (só para isCarrossel)
  └── state: { sessionId: string, refs: {filename, previewUrl}[] }
  └── injeta paths no briefing antes de executar
  └── chama DELETE após execução (sucesso ou falha)

Backend
  POST   /api/carrosseis/referencias?sessionId=<uuid>
  GET    /api/carrosseis/referencia?sessionId=<id>&file=<f>
  DELETE /api/carrosseis/referencias?sessionId=<id>

Disco
  _referencias-temp/<uuid>/<timestamp>.png
  (pasta deletada após execução)
```

`_referencias-temp/` fica na raiz do repo — mesmo `cwd` que o skill usa. Paths relativos são legíveis via `Read` tool pelo agente.

## UI

Posição: entre "Tipo de Conteúdo" e "Tema / Briefing" (só visível quando `isCarrossel && !hasTurns`).

```
REFERÊNCIAS DE DESIGN (opcional)
┌─────────────────────────────────────────┐
│  Arraste imagens ou clique              │
│  PNG, JPG, WebP · máx 4 imagens        │
└─────────────────────────────────────────┘
[thumb1 ×] [thumb2 ×]   ← 56x56, X remove
```

- `sessionId` gerado com `crypto.randomUUID()` na primeira imagem da sessão
- Cada upload faz `POST` imediatamente (feedback instantâneo)
- Thumbnails via `GET /api/carrosseis/referencia`
- Máx 4 imagens; botão de upload desabilita ao atingir limite
- Erro de upload: mensagem abaixo da dropzone, não bloqueia execução

## Fluxo de Dados

1. Usuário faz upload de imagem
2. Frontend gera `sessionId` (UUID, uma vez por sessão)
3. `POST /api/carrosseis/referencias?sessionId=<uuid>` com FormData `file`
4. Backend salva `_referencias-temp/<uuid>/<timestamp>.<ext>`, retorna `{ filename }`
5. Frontend guarda `{ filename, previewUrl }` no state
6. Usuário clica Executar
7. `iniciar()` adiciona ao input, se houver refs:

```
Referências de design — imitar estilo visual dessas imagens (carregar via Read antes de criar slides):
- _referencias-temp/abc-123/1749999123.png
- _referencias-temp/abc-123/1749999456.jpg
```

8. Skill executa; agente faz `Read` nos paths, usa como referência visual
9. `executar()` termina (sucesso ou erro) → `DELETE /api/carrosseis/referencias?sessionId=abc-123`
10. Frontend limpa `refs` e `sessionId`

## Backend — `referencias-temp.ts`

```ts
const TEMP_ROOT = join(REPO_ROOT, "_referencias-temp");

saveReferencia(sessionId: string, filename: string, buf: Buffer): Promise<void>
readReferencia(sessionId: string, filename: string): Promise<{ buf: Buffer; mime: string }>
deleteReferencias(sessionId: string): Promise<void>
```

## Segurança

- `sessionId` validado contra `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/` (UUID v4 exato)
- Filename nunca vem do usuário — backend gera `<Date.now()>.<ext>`
- Path resolution: `resolve(path).startsWith(resolve(TEMP_ROOT))` antes de qualquer I/O
- Tipos aceitos: `image/png`, `image/jpeg`, `image/webp`
- Tamanho máximo: 10MB por arquivo (verificado no backend via `file.size`)

## Tratamento de Erros

| Cenário | Comportamento |
|---------|---------------|
| Upload falha | Erro embaixo da dropzone; não bloqueia execução |
| DELETE falha | Silencioso; arquivos temp são inofensivos |
| Skill não encontra path | Skill continua sem referências (comportamento atual) |
| sessionId inválido | 400 Bad Request |
| Tipo de arquivo inválido | 400 Bad Request |
| Arquivo > 10MB | 400 Bad Request |

## O que não muda

- Skill `lb-conteudo-carrossel` não precisa de nenhuma modificação — a instrução de leitura das referências é injetada via briefing
- API existente de `inspiracoes` (por carrossel já criado) não é afetada
- `identidade/` não é tocada
