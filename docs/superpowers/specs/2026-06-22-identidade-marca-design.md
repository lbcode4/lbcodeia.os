# Identidade da Marca — Tipografia, Tom de Voz e Paleta Editável — Design

**Data:** 2026-06-22
**Branch:** v3

---

## Objetivo

Hoje a página `/identidade` mostra "Em breve" nas seções de Tipografia e Tom de voz, e a
paleta de cores é um array fixo no código-fonte (`BRAND_COLORS` em `identidade.tsx`), sem
edição nem persistência. Esta spec torna as três seções funcionais:

1. **Tipografia** — escolher fonte de título e corpo via picker com preview, persistido em
   `identidade/design-guide.md`.
2. **Tom de voz** — editar o tom de voz e o que evitar, espelhando o conteúdo já existente em
   `_memoria/preferencias.md` (única fonte, sem duplicar dado).
3. **Paleta de cores** — sai do array fixo, vira editável e persistida em
   `identidade/design-guide.md`; inclui geração de sugestões de cores relacionadas
   (matemática de cor sobre a paleta atual), que o usuário pode aceitar e adicionar à paleta.

Fora de escopo: logo (upload/troca), galeria de referências, aplicação automática de
fonte/cor em carrosséis já gerados (o design-guide.md é contexto pra **próxima** geração,
como já documentado na seção "Quando evoluir" do próprio arquivo).

---

## Onde mora cada dado

### Paleta + Tipografia → `identidade/design-guide.md`

Arquivo já existe e já é lido pelas skills antes de gerar qualquer visual (carrossel, post,
site). As seções `## Cores` e `## Tipografia` passam a ter formato de bullets estruturados,
substituindo o texto livre/placeholder atual:

```md
## Cores
- Fundo: #07070F
- Roxo neon: #A24BFF
- Ciano neon: #29C5FF
- Texto principal: #FFFFFF
- Texto secundário: #C9C9D6

## Tipografia
- Título: Poppins
- Corpo: Inter
```

Resto do arquivo (Filosofia, Elementos, Galeria de referência, Quando evoluir) não é tocado
por esta feature.

### Tom de voz → `_memoria/preferencias.md` (espelhado, não duplicado)

A página Identidade não cria um campo novo — ela lê/escreve diretamente as seções
`## Tom de voz` e `## O que evitar` que já existem em `_memoria/preferencias.md`. Edição é
do **markdown raw de cada seção** (sem parsing estrutural): a seção "Tom de voz" inclui hoje
um bloco de exemplo (`**Exemplo real (P11):**` + blockquote) que não precisa ser
decomposto — é só texto editável como bloco.

Seções vizinhas no mesmo arquivo (`## Frequência de conteúdo`, `## Objetivo principal com
tráfego pago`) não são tocadas.

---

## Backend

**Arquivo modificado:** `server/src/identidade.ts`
**Registro em:** `server/src/server.ts`

### Parsing de seções markdown (funções puras, reaproveitadas)

```ts
function getSection(md: string, heading: string): string
// retorna o corpo da seção entre "## {heading}" e o próximo "## " (ou fim do arquivo),
// trim()ado.

function replaceSection(md: string, heading: string, newBody: string): string
// substitui o corpo da seção mantendo a heading e o resto do arquivo intacto.
// Se a heading não existir, lança erro (arquivos já existem com todas as seções —
// não há fallback de criação).
```

### Paleta e Tipografia (design-guide.md)

```ts
type CorMarca = { hex: string; label: string };
type Tipografia = { titulo: string | null; corpo: string | null };

function parsePaleta(md: string): CorMarca[]
// lê "## Cores", regex /^- (.+?): (#[0-9a-fA-F]{3,8})$/gm por linha. Linhas que não casam
// o padrão (texto livre legado) são ignoradas — primeira leitura após a migração já
// reescreve a seção no formato novo.

function serializePaleta(paleta: CorMarca[]): string
// "- {label}: {hex}" por linha.

function parseTipografia(md: string): Tipografia
// lê "## Tipografia", regex /^- Título: (.+)$/m e /^- Corpo: (.+)$/m. Ausente → null.

function serializeTipografia(t: Tipografia): string
```

### Tom de voz (preferencias.md)

```ts
async function readTomDeVoz(): Promise<{ tomDeVoz: string; evitar: string }>
// getSection(md, "Tom de voz"), getSection(md, "O que evitar") — string raw de cada.

async function writeTomDeVoz(tomDeVoz: string, evitar: string): Promise<void>
// replaceSection nas duas seções, em sequência, e grava o arquivo uma vez.
```

### Rotas em `server.ts`

```ts
app.get("/api/identidade", ...)
// payload atual (logo, refs) + paleta: CorMarca[] + tipografia: Tipografia

app.put("/api/identidade/paleta", ...)
// body { paleta: CorMarca[] } → replaceSection("Cores", serializePaleta(...)) → 200 { ok: true } | 500

app.put("/api/identidade/tipografia", ...)
// body { titulo, corpo } → replaceSection("Tipografia", ...) → 200 { ok: true } | 500

app.get("/api/identidade/tom-de-voz", ...)
// 200 { tomDeVoz: string, evitar: string } | 500

app.put("/api/identidade/tom-de-voz", ...)
// body { tomDeVoz: string, evitar: string } → writeTomDeVoz(...) → 200 { ok: true } | 500
```

Sem guard de path traversal nessas rotas novas — `design-guide.md` e `preferencias.md` são
caminhos fixos do repo, não recebem id/filename do usuário (diferente de
`/api/identidade/arquivo`, que continua com o guard existente).

### Migração da paleta atual

Na primeira chamada de `GET /api/identidade` após o deploy, `parsePaleta` não vai achar
nenhuma linha no formato novo (a seção `## Cores` hoje tem texto livre). Nesse caso
(`parsePaleta` retorna array vazio), o backend usa um array de fallback hardcoded — os
mesmos 5 valores que hoje estão em `BRAND_COLORS` no frontend — como paleta inicial. Esse
fallback só existe no backend (não duplicar no frontend); na primeira edição do usuário
(adicionar/remover/aceitar sugestão), a seção é regravada no formato novo e o fallback nunca
mais é necessário.

---

## Frontend (`frontend/src/routes/identidade.tsx`)

### Paleta de cores

- Cada swatch existente ganha um botão "×" no hover pra remover (chama
  `PUT /api/identidade/paleta` com o array sem aquele item).
- Botão "+ Cor" abre um pequeno form inline: `<input type="color">` + `<input type="text"
  placeholder="Nome da cor">` + confirmar → adiciona ao array, salva.
- Botão "Sugerir cores relacionadas" computa client-side (sem custo de IA/rede):
  - Para cada cor da paleta atual, gera: 1 complementar (rotação de 180° no H do HSL), 1
    análoga (+30°), 1 tint (L +20%).
  - Dedupe por hex, descarta as que já estão na paleta, corta em 6 sugestões.
  - Cada sugestão aparece como swatch com borda pontilhada + "+" — clicar adiciona à paleta
    (label default: `"Sugestão"`, editável depois clicando no nome) e salva.
- Cores existentes continuam clicáveis pra copiar hex (comportamento atual mantido).

### Tipografia

- 2 `<select>` (Título / Corpo) com lista curada de 12 fontes Google: Inter, Poppins,
  Montserrat, Roboto, Sora, Manrope, Work Sans, Playfair Display, Space Grotesk, DM Sans,
  Outfit, Lexend.
- Ao trocar a seleção, injeta dinamicamente `<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family={Font}:wght@400;700&display=swap">` no
  `<head>` (uma vez por fonte, cache simples em `Set` pra não duplicar `<link>`) e mostra
  preview "Aa Bb Cc 123" renderizado na fonte escolhida.
- Estado inicial (`titulo`/`corpo` null): select mostra placeholder "Escolher fonte…".
- Salvar dispara `PUT /api/identidade/tipografia` (debounce ou só no `onChange` direto —
  ação discreta de seleção, sem digitação contínua, então salva imediato é aceitável).

### Tom de voz

- 2 `<textarea>` (Tom de voz / O que evitar), carregadas de `GET
  /api/identidade/tom-de-voz` no mount.
- 1 botão "Salvar" pros dois campos juntos → `PUT /api/identidade/tom-de-voz`.
- Estado de loading/erro no botão, mesmo padrão visual do botão Salvar do editor de
  carrossel (`carrosseis.$id.tsx`): ícone spinner, badge "Salvo" por 2s, erro em texto
  vermelho se falhar.

---

## Erros

- Falha ao ler/escrever `design-guide.md` ou `preferencias.md`: 500 com mensagem resumida.
  Frontend mantém o estado em memória (paleta/tipografia/tom de voz) pro usuário tentar
  salvar de novo — mesmo padrão de `carrosseis.$id.tsx` (nunca perde o que o usuário editou
  por causa de um erro de I/O).
- `replaceSection`/`getSection` com heading inexistente: erro interno (500) — não deveria
  acontecer em uso normal, já que as headings são fixas e os arquivos já existem com elas.

---

## Testes

Mirror de `sites.test.ts` / `carrossel-editor.test.ts` (funções puras, sem mockar SDK):

- `getSection`/`replaceSection`: extrai e substitui seção no meio do arquivo, preserva
  seções vizinhas intactas, lança erro se heading não existe.
- `parsePaleta`/`serializePaleta`: round-trip (parse → serialize → parse idêntico); ignora
  linhas fora do formato (texto legado).
- `parseTipografia`/`serializeTipografia`: round-trip; retorna `null` em campo ausente.
- Rotas: `PUT /api/identidade/paleta` happy path + 500 em falha de escrita; `GET/PUT
  /api/identidade/tom-de-voz` preserva seções vizinhas de `preferencias.md` (teste de
  regressão pra não comer "Frequência de conteúdo"/"Objetivo principal").
- Funções de sugestão de cor (HSL rotation/tint) são puras no frontend — cobertura só se o
  projeto já tiver Vitest de frontend configurado; senão, mesma decisão já tomada na spec do
  editor de carrossel (cobertura só no backend).

---

## Fora do Escopo

- Logo: upload, troca, remoção.
- Galeria de referências: continua read-only.
- Aplicar a fonte/cor escolhida automaticamente nos carrosséis já gerados — design-guide.md
  vira contexto pra próxima geração via skill, não reprocessa o que já existe.
- Renomear labels de cores existentes da paleta original (fica possível só pra cores
  adicionadas depois, via o fluxo de edição inline da sugestão aceita) — se o usuário quiser
  isso de forma mais ampla, fica pra uma iteração futura.
- Busca/catálogo completo do Google Fonts — lista curada de 12 fontes fixas no código, sem
  campo de busca livre.
