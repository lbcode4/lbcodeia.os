# Editor de Carrossel — Cor de Fundo, Tipografia e Cancelar — Design

**Data:** 2026-06-23
**Branch:** v3

---

## Objetivo

O editor de carrossel (`/carrosseis/$id`, spec original em
`docs/superpowers/specs/2026-06-21-editor-carrossel-design.md`) hoje só permite mudar cor de
fundo e fonte via chat com IA. Esta spec adiciona três controles diretos, sem precisar
escrever uma instrução em linguagem natural:

1. **Cor de fundo** — troca o fundo do slide ativo (um por vez).
2. **Tipografia** — troca a fonte de título+corpo do carrossel inteiro (todos os slides).
3. **Cancelar** — descarta alterações não salvas e volta pra galeria, com confirmação.

Fora de escopo: cor/fonte por trecho de texto selecionado (continua só via chat — já
documentado como fora de escopo na spec original), gradiente customizado (só cor sólida via
UI), fundo diferente por slide aplicado em lote (continua um slide por vez, manual).

---

## Descoberta importante: `.slide` é uma regra CSS compartilhada

Inspecionando um carrossel real gerado pela skill (`saidas/marketing/conteudo/carrossel/*/carrossel.html`):

```css
.slide{
  width:var(--w);height:var(--h);position:relative;overflow:hidden;
  font-family:'Poppins','Inter',Arial,sans-serif;color:var(--txt);
  background:radial-gradient(120% 90% at 50% 0%,#120E2A 0%,var(--bg-deep) 60%);
  ...
}
```

Não existe `.slide.cyan`/`.slide.dark` por slide — todos os `<div class="slide">` herdam o
mesmo `background` e `font-family` de uma única regra. Os dois controles desta spec
funcionam sobrescrevendo essa regra compartilhada via **estilo inline**, sem precisar mudar
a arquitetura do template nem o backend (`carrossel-editor.ts`/rotas) — o contrato
continua "HTML string entra, HTML string sai", igual hoje.

`render.js` (Playwright) faz `page.goto('file://carrossel.html')` e tira screenshot do DOM
real — qualquer estilo inline presente no HTML salvo aparece no PNG final normalmente.

---

## Onde vivem os controles novos

Diferente do toolbar de cor/B/I/U (que só aparece com texto selecionado, e vive **dentro**
do iframe porque `document.execCommand` precisa rodar no mesmo documento da seleção), os
controles de Fundo e Tipografia são sempre visíveis e não dependem de seleção — vivem como
componentes **React normais no painel pai** (Tailwind/lucide-react, consistente com o resto
do app), posicionados numa linha fina acima do preview principal, dentro da coluna de
preview (`carrosseis.$id.tsx`, área que hoje só tem o iframe + contador `{n}/{total}` +
miniaturas).

A mutação real do DOM continua precisando acontecer **dentro do iframe** (é o documento que
vai ser serializado e salvo). Ponte: `postMessage` do pai pro iframe — dois tipos de
mensagem novos, paralelos ao `lbcode-edit` que já sai do iframe pro pai:

```ts
mainIframeRef.current?.contentWindow?.postMessage(
  { type: "lbcode-set-background", hex },
  "*",
);
mainIframeRef.current?.contentWindow?.postMessage(
  { type: "lbcode-set-font", fonte },
  "*",
);
```

O `EDITOR_SCRIPT` (script injetado hoje em `carrosseis.$id.tsx`) ganha um
`window.addEventListener('message', ...)` novo que escuta esses dois tipos, aplica a
mutação no DOM real do iframe, e chama a função `serializeAndNotify()` já existente —
mesmo caminho de volta que a edição direta de texto já usa hoje (`postMessage({type:
'lbcode-edit', html}, '*')` pro pai, que cai no `onMessage` existente e empilha no mesmo
histórico de undo via `applyHtml()`). Nenhuma rota de backend nova.

---

## Cor de fundo

### Swatches

Reaproveita a extração que já existe no `EDITOR_SCRIPT` pro toolbar de texto (regex
`/--[\w-]+:\s*#[0-9a-fA-F]{3,8}/g` nas `<style>` do documento) — só que agora também
calculada no **lado do React pai**, sobre a string `html` em memória (mesmo regex, contexto
diferente — TS no pai, JS vanilla no script injetado; duplicação pequena e aceitável, os
dois rodam em runtimes diferentes e não dá pra importar um no outro):

```ts
function extrairCoresMarca(html: string): string[] {
  const matches = html.match(/--[\w-]+:\s*(#[0-9a-fA-F]{3,8})/g) ?? [];
  return [...new Set(matches.map((m) => m.split(":")[1].trim()))].slice(0, 6);
}
```

Botão "Fundo" abre popover com esses swatches + `<input type="color">` livre.

### Aplicar (handler dentro do `EDITOR_SCRIPT`)

```js
window.addEventListener('message', function(e){
  if (e.data && e.data.type === 'lbcode-set-background') {
    var slides = document.querySelectorAll('.slide');
    var ativo = slides[window.__lbcodeActiveSlide || 0];
    if (ativo) { ativo.style.background = e.data.hex; serializeAndNotify(); }
  }
  if (e.data && e.data.type === 'lbcode-set-font') {
    aplicarFonte(e.data.fonte); // ver seção Tipografia
  }
});
```

`window.__lbcodeActiveSlide` é uma variável global nova, escrita por `injectPagination` (que
já recebe `activeIndex` como parâmetro hoje) — um `<script>` minúsculo antes do
`EDITOR_SCRIPT` setando `window.__lbcodeActiveSlide = ${activeIndex};`. Usar essa variável em
vez de inferir o slide ativo pela paginação CSS (`display:none`) evita depender de detalhe
de implementação da paginação.

`ativo.style.background = hex` sobrescreve só aquele `<div class="slide">` — o
`.slide::before` (pontinhos decorativos) é elemento separado, continua renderizando por
cima do novo fundo sem mudança. Isso é esperado, não bug: o slide não fica "vazio", mantém
a textura da marca.

---

## Tipografia (carrossel inteiro)

### Lista de fontes — extrair pra util compartilhado

A lista de 12 fontes curadas já existe em `frontend/src/routes/identidade.tsx`
(`FONTES_GOOGLE`). Move pra `frontend/src/lib/fontes-google.ts`:

```ts
export const FONTES_GOOGLE = [
  "Inter", "Poppins", "Montserrat", "Roboto", "Sora", "Manrope",
  "Work Sans", "Playfair Display", "Space Grotesk", "DM Sans", "Outfit", "Lexend",
];
```

`identidade.tsx` importa de lá em vez de declarar localmente (sem mudança de comportamento,
só remove duplicação). `carrosseis.$id.tsx` usa a mesma lista num `<select>` simples (sem
preview de texto fora do canvas — o canvas já mostra o resultado ao vivo).

### Aplicar (handler dentro do `EDITOR_SCRIPT`)

Trocar a fonte precisa de duas coisas persistidas no HTML salvo (não só no preview ao
vivo) — porque `render.js` abre o arquivo do zero numa aba headless nova, sem nenhum estado
de JS da sessão de edição:

1. **Carregar o arquivo de fonte** — um `<link rel="stylesheet">` apontando pro Google
   Fonts da fonte nova, inserido em `<head>`.
2. **Aplicar a fonte** — um `<style id="__lbcode-font-override">` com
   `.slide{font-family:'Nova','Inter',Arial,sans-serif}`, inserido em `<head>` (sobrescreve
   a regra `.slide{font-family:...}` original pra todos os slides de uma vez via
   especificidade — mesmo seletor, regra posterior no documento vence).

```js
function aplicarFonte(fonte){
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fonte) + ':wght@400;500;600;700;800&display=swap';
  document.head.appendChild(link);

  var override = document.getElementById('__lbcode-font-override');
  if (!override) {
    override = document.createElement('style');
    override.id = '__lbcode-font-override';
    document.head.appendChild(override);
  }
  override.textContent = ".slide{font-family:'" + fonte + "','Inter',Arial,sans-serif}";

  serializeAndNotify();
}
```

**Importante:** `#__lbcode-font-override` e o `<link>` de fonte **não** entram na lista de
elementos removidos dentro de `serializeAndNotify()` (que hoje remove só
`#__lbcode-pagination-style`, `#__lbcode-editor-style`, `#__lbcode-editor-script`,
`#__lbcode-toolbar`, e a classe `__lbcode-editable`). São parte do design salvo, não UI
efêmera do editor — precisam sobreviver no HTML persistido pra `render.js` carregar a fonte
certa no PNG final.

Trocar de fonte de novo (segunda vez na mesma sessão) atualiza o `<style>` existente em vez
de duplicar — `<link>` antigo de uma fonte anterior fica órfão no `<head>`, inofensivo
(navegador só não usa), não precisa ser removido.

---

## Cancelar

Botão novo no header, ao lado de "Salvar".

### Detectar mudança não salva

Novo estado `htmlSalvo`, inicializado junto com `html` no load (`setHtmlSalvo(h)` no mesmo
`.then` que hoje faz `setHtml(h)`) e atualizado pra `html` atual depois de um `salvar()`
bem-sucedido. Dirty = `html !== htmlSalvo`.

```ts
function cancelar() {
  if (html !== htmlSalvo && !window.confirm("Descartar alterações não salvas?")) return;
  navigate({ to: "/carrosseis" });
}
```

Usa `useNavigate()` do TanStack Router (em vez do `<Link>` que já existe na seta `←` do
header — esse continua como está, navegação direta sem confirmação, comportamento já
existente e fora do escopo desta spec mudar).

---

## Erros

Nenhuma rota nova de backend — sem novo modo de falha de rede. Se o `postMessage` cair num
iframe que ainda não carregou (`contentWindow` null), o clique simplesmente não faz nada
(mesma tolerância que o resto do editor já tem pra estados transitórios de loading).

---

## Testes

Mudança é majoritariamente frontend (React + script injetado), sem teste de frontend
configurado no projeto (mesma decisão já tomada nas specs anteriores do editor de
carrossel e da Identidade — verificação via `tsc --noEmit` + `npm run build`, sem suíte
automatizada).

`extrairCoresMarca` é função pura nova no lado do parent — se o projeto algum dia ganhar
Vitest de frontend, é a primeira candidata a teste unitário; por ora, mesma cobertura
zero do restante do arquivo.

---

## Fora do Escopo

- Cor/fonte por trecho de texto selecionado (continua só via chat).
- Gradiente customizado — só cor sólida via swatch/picker.
- Aplicar a mesma cor de fundo em todos os slides de uma vez (usuário repete clique slide a
  slide se quiser consistência).
- Remover `<link>` de fontes antigas trocadas durante a sessão (ficam órfãs, inofensivas).
- Qualquer mudança em `render.js`/Playwright — já funciona corretamente lendo estilo inline
  e `<style>`/`<link>` do HTML salvo, sem precisar de ajuste.
