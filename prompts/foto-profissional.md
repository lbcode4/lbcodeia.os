# Criador de Foto Profissional

## Quando usar
Auditoria de perfil IG mostrou foto ruim. Gera prompt pra IA (Gemini nano-banana 2 preferido) transformar selfie em foto com iluminação profissional.

⚠️ NÃO remove imperfeições ("milagre é Deus que faz"). Só ajusta iluminação, fundo, enquadramento.

## Inputs necessários
- Selfie original (caminho do arquivo)
- Estilo desejado (corporativo / casual / criativo)
- Cor de fundo preferida (neutro / cor da marca / preto)
- Identidade visual (`identidade/design-guide.md` se for foto pra marca)

## Prompt pra Gemini nano-banana 2 (script)

```
Take the input portrait photo and transform it into a professional
profile photo with:

LIGHTING:
- Soft natural-looking studio lighting from front
- Subtle rim light on hair edges
- No harsh shadows on face
- Maintain skin texture (NO retouching, NO smoothing, NO beauty filter)

BACKGROUND:
- Replace background with [neutral gray / brand color #XXXX / clean black]
- Soft blur (depth of field)
- No distractions

COMPOSITION:
- Headshot framing: "more head than body"
- Center subject
- Eye level with viewer
- Vertical 1024x1024 or square depending on use

PRESERVE EXACTLY:
- Person's face, hair, skin tone, age, expression — UNCHANGED
- Clothing (only adjust lighting on it)
- Any visible imperfections (acne, wrinkles, scars) — DO NOT remove

OUTPUT: photorealistic, professional, suitable for LinkedIn/Instagram profile.
NO cartoon, NO illustration, NO heavy filter, NO airbrush.

Style reference: corporate headshot photography, natural editorial style.
```

## Workflow no script

```bash
# Usar script Gemini do projeto (mesmo do /conteudo-carrossel)
  node --env-file=.env scripts/gerar-imagem-gemini.js \
       "PROMPT_ACIMA" \
       "marketing/auditoria-ig/<handle>-foto-profissional.png" \
       "<caminho-da-selfie-original>"
```

## Regras

- **NUNCA remover imperfeições** — pessoa precisa se reconhecer na foto
- **NUNCA mudar idade aparente** — gera estranheza
- **NUNCA usar filtro beleza** — fake demais
- Se selfie estiver muito ruim (foco, resolução), pedir foto melhor — não tente milagre
- Pra logo de marca (não pessoa), usar `identidade/logo.png` direto, não gerar foto
- Salvar em `marketing/auditoria-ig/<handle>-foto-profissional.png` pra usar na nova foto de perfil

## Alternativas sem IA

Se Gemini API não disponível:
1. **Remove.bg** — remove fundo
2. **Canva** — adicionar fundo + ajustar
3. **Studio físico** — R$50-200 sessão (melhor opção pra profissional sério)

## Output esperado

PNG 1024×1024 (quadrado pra perfil IG/LinkedIn/GBP) com:
- Pessoa reconhecível
- Fundo limpo
- Iluminação profissional
- Pronto pra subir como foto de perfil
