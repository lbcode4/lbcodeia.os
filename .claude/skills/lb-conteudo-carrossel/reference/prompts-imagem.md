# Referência — Geração de fotos IA (Passo 3)

Detalhe do Passo 3 do workflow (só roda em carrossel tipo 2 — com foto IA).

## Modelo default

**`gemini-2.5-flash-image`** (rápido/barato) — usa as imagens de `identidade/` como
referência visual nativa, mantém a identidade da marca. Pra máxima aderência à marca,
passar `gemini-3-pro-image-preview` (nano-banana 2).

Bench 2026-05-25 do pro vs OpenAI gpt-image-1 high: Gemini 29% mais barato (~$0.13/img
vs $0.19), 2x mais rápido (~22s vs ~50s), aderência à marca dramaticamente melhor
(circuitos ciano automáticos), respeitou "no face" enquanto OpenAI quebrou a regra.
Default = Gemini sempre que `GEMINI_API_KEY` estiver no `.env`. Fallback OpenAI só se a
chave Gemini não existir.

## 1. Montar prompt (em inglês)

Modelos performam melhor em inglês. Estrutura recomendada:

```
Create a vertical 1024x1536 background image. Style: match the brand
aesthetic of the reference images — [resumo da paleta + atmosfera].
Scene: [cena específica, sem rostos, sem texto legível, sem logos].
[Iluminação e composição]. Vertical portrait composition.
Premium cinematic editorial photography.
```

Regras de prompt (críticas):
- **No face / no body above wrists** quando houver pessoas — modelos quebram regra fácil
- **No readable text / no logos** — texto IA em PT sai errado, logos genéricos quebram branding
- Pedir **"match the brand aesthetic of the reference images"** explícito quando usar Gemini com refs
- Referenciar paleta e elementos-chave (ciano, circuitos, deep navy) no prompt mesmo com refs — refs guiam, prompt aterra

## 2. Selecionar referências

Selecionar 2-3 PNGs de `identidade/` como referências visuais (mais ≠ melhor — payload
grande deixa lento). Escolher refs que casam com a cena: capa pra cenas amplas, post de
ícones pra cenas com elementos UI, post da marca geral pra paleta.

## 3. Gerar via script Gemini (preferencial)

Rodar `npm install` na raiz uma vez antes (instala `@google/genai`, `openai`, `playwright`):

```bash
node --env-file=.env scripts/gerar-imagem-gemini.js \
     "PROMPT" \
     "marketing/conteudo/carrossel/<pasta>/foto-<nome>.png" \
     "identidade/1.png,identidade/2.png" \
     "gemini-2.5-flash-image"   # 4º arg opcional = modelo
```

**Escolha de modelo** (4º arg, ou env `GEMINI_IMAGE_MODEL`; o escolhido é tentado primeiro,
os outros viram fallback automático):
- `gemini-2.5-flash-image` — **default**, mais rápido/barato
- `gemini-3-pro-image-preview` — melhor aderência à marca (nano-banana 2)
- `gemini-3.1-flash-image-preview` — flash da geração 3

Se o usuário não pedir modelo, usar o default. Se pedir "mais qualidade/marca", usar o pro.

### Fallback OpenAI (sem refs, só prompt)

```bash
node --env-file=.env scripts/gerar-imagem.js \
     "PROMPT" \
     "marketing/conteudo/carrossel/<pasta>/foto-<nome>.png" high \
     "gpt-image-1"   # 4º arg = quality, 5º arg opcional = modelo
```

Modelo OpenAI (5º arg, ou env `OPENAI_IMAGE_MODEL`): `gpt-image-1` (default) ou `gpt-image-2`.

Se nenhum dos scripts existir ainda, criar usando os exemplos em
`scripts/gerar-imagem-gemini.js` e `scripts/gerar-imagem.js` (já no projeto).

## 4. Paralelizar

**Gerar fotos em paralelo** (`run_in_background: true` em cada chamada) — cada uma é ~22s,
paralelizar economiza minutos.

## 5. Aprovação

Mostrar cada foto pro usuário antes de aplicar no HTML.

**CHECKPOINT:** Foto aprovada → seguir. Se não, ajustar prompt (mais específico sobre o que
evitar) e regenerar.
