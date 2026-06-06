# Design: Identidade Visual no Hub de Conteúdo

**Data:** 2026-06-06  
**Status:** Aprovado  
**Escopo:** Frontend + Backend + Skill

---

## Contexto

O hub de conteúdo (`/conteudo`) hoje exibe carrosseis, calendário, reels e stories — mas não expõe os ativos de marca que a IA usa para criar esses conteúdos. O usuário precisa ver logo, cores e referências de design antes/durante a criação, e poder adicionar imagens de inspiração por carrossel para guiar o estilo gerado.

Ativos já existem em disco:
- `identidade/logo.png`
- `identidade/ref-*.png` (6 imagens de referência)
- `identidade/design-guide.md` (paleta, tipografia, filosofia)

---

## O Que Será Construído

### 1. Tab "Identidade" no hub de conteúdo

Nova tab junto a Calendário / Carrossel / Reels / Stories.

Seções:
- **Logo** — exibe `identidade/logo.png` centralizado, botão download
- **Paleta de cores** — swatches visuais das 5 cores da marca com hex copiável:
  - `#07070F` Fundo
  - `#A24BFF` Roxo neon (primária)
  - `#29C5FF` Ciano neon (secundária)
  - `#FFFFFF` Texto principal
  - `#C9C9D6` Texto secundário
- **Referências de design** — grade 2-3 colunas com `ref-*.png`, nome humano derivado do arquivo, clique expande em modal lightbox

### 2. Inspirações por carrossel

Cada carrossel pode ter uma pasta `marketing/conteudo/carrossel/{id}/inspiracoes/` com imagens PNG/JPG.

- **Badge no card** da grade: se `inspiracoes/` tem imagens, mostra contagem (`3 refs`)
- **Na view do carrossel aberto**: seção "Inspirações" logo abaixo das miniaturas de slides — grade horizontal com as imagens. Clique expande em lightbox.
- **Upload drag & drop**: zona de drop na view do carrossel aberto. Arrasta imagem → salva em `inspiracoes/` via `POST /api/carrosseis/{id}/inspiracoes`. Aceita PNG, JPG, WebP. Sem limite de tamanho (arquivo local).

### 3. Backend — novas rotas

| Rota | Método | Descrição |
|------|--------|-----------|
| `GET /api/identidade` | GET | Lista arquivos de `identidade/`: logo + refs (nome, url) |
| `GET /api/identidade/arquivo` | GET | Serve arquivo estático de `identidade/` com validação de path |
| `GET /api/carrosseis/:id/inspiracoes` | GET | Lista imagens em `inspiracoes/` do carrossel |
| `POST /api/carrosseis/:id/inspiracoes` | POST | Salva imagem enviada em `inspiracoes/` (multipart/form-data) |
| `GET /api/carrosseis/inspiracao` | GET | Serve arquivo estático de `inspiracoes/` com validação de path |

`GET /api/carrosseis` já existe — adicionar campo `inspiracoes: number` (contagem) a cada item retornado.

### 4. Atualização da skill `lb-conteudo-carrossel`

Ao executar a skill, antes de gerar slides, verificar se `marketing/conteudo/carrossel/{id}/inspiracoes/` existe e tem imagens. Se sim:
- Listar os arquivos
- Incluir instrução no contexto: "Imite o layout/estilo das imagens de inspiração em `{path}`"

A skill já lê `identidade/design-guide.md`. O novo bloco de inspirações é condicional — se pasta vazia ou inexistente, comportamento atual mantido.

---

## Componentes Frontend

### `TabIdentidade` (novo)
- Fetch `GET /api/identidade` → renderiza logo, swatches, grade de refs
- `ColorSwatch`: box colorida + hex + botão copiar (clipboard)
- `RefGrid`: grade com imagens clicáveis → `Lightbox`
- `Lightbox`: overlay escuro, imagem centralizada, fechar com ESC ou clique fora

### `TabCarrossel` (modificado)
- Card na grade: adicionar badge `{n} refs` se `inspiracoes > 0`
- View do carrossel aberto: adicionar seção `InspiracaoSection` abaixo das miniaturas
- `InspiracaoSection`: grade horizontal + zona de drop (`DropZone`)
- `DropZone`: `onDrop` / `onDragOver` listeners, `POST` multipart, atualiza lista após upload

---

## Fluxo de Dados

```
identidade/
  logo.png ──────────────────────► GET /api/identidade ──► TabIdentidade
  ref-*.png ─────────────────────►                          (logo + swatches + refs)

marketing/conteudo/carrossel/{id}/
  inspiracoes/*.png ─────────────► GET /api/carrosseis/:id/inspiracoes ──► InspiracaoSection
                    ◄──────────── POST /api/carrosseis/:id/inspiracoes ◄── DropZone
```

---

## Segurança

Todas as rotas de arquivo usam `resolve()` + verificação de prefixo para evitar path traversal. Mesmo padrão já usado em `conteudo.ts` e `carrosseis.ts`.

Upload: validar `content-type` do arquivo (`image/png`, `image/jpeg`, `image/webp`). Rejeitar outros tipos com 400.

---

## O Que Não Está No Escopo

- Extração automática de cores da imagem de inspiração
- IA gerando variações baseadas em inspirações (apenas contexto textual na skill)
- Edição ou exclusão de inspirações pela UI (pode ser feito via terminal/filesystem)
- Sincronização com nuvem

---

## Critérios de Sucesso

1. Tab "Identidade" exibe logo, 5 swatches com hex copiável, 6 refs clicáveis
2. Cards de carrossel com badge de contagem quando há inspirações
3. View do carrossel mostra imagens de inspiração existentes
4. Drag & drop de imagem salva em disco e aparece na lista sem reload manual
5. Skill `lb-conteudo-carrossel` menciona inspirações quando pasta não vazia
6. Nenhuma rota nova é vulnerável a path traversal
