# 🎬 Vídeo 11 — `/lb-conteudo-publicar`

> **Bloco 2 — Conteúdo.** Duração alvo: 7–9 min · Sem front.

## 🎯 Objetivo do vídeo
Orquestrar o pipeline completo: tema → blog + carrossel + legendas (IG/FB/LinkedIn) + metadata, tudo com RETINA integrado e amarrado. Usa pesquisa SEO + tom de voz + GCC. Saída: artigo em draft + visual + 3 legendas, aguardando aprovação.

## 💡 Dor → solução
- **Dor:** criar blog, carrossel e legendas separados, sem consistência entre eles.
- **Solução:** um tema vira pacote completo e coerente de uma vez.

## 🧠 Framework por trás
- **RETINA + GCC** atravessam blog, visual e legendas.
- Pesquisa **SEO** alimenta o blog (amarra com o Bloco 3).

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-conteudo-publicar em .claude/skills/lb-conteudo-publicar/SKILL.md.

Objetivo: orquestrar tema → pacote de conteúdo completo.
- Pega um tema e gera: artigo de blog (draft), carrossel (chama lb-conteudo-carrossel),
  3 legendas (IG/FB/LinkedIn) e metadata.
- Tudo amarrado por RETINA + GCC + pesquisa SEO + tom de voz da memória.
- Saída fica em draft aguardando /lb-conteudo-aprovar.
- Gatilhos: "publicar tema X", "cria conteúdo completo", "transforma tema em post",
  /lb-conteudo-publicar.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-conteudo-publicar em .claude/skills/lb-conteudo-publicar/SKILL.md.
É um pipeline orquestrado: entrada = tema; saída = blog + carrossel + 3 legendas, tudo
integrado ao RETINA, em draft aguardando /lb-conteudo-aprovar.

FRONTMATTER:
- name: lb-conteudo-publicar
- description: Orquestra pipeline completo: tema -> blog + carrossel + legendas
  (IG/FB/LinkedIn) + metadata, tudo com RETINA integrado. Usa pesquisa SEO + tom de voz
  + GCC. Saída em draft aguardando /lb-conteudo-aprovar. Use quando disser "publicar tema
  X", "cria conteúdo completo", "transforma tema em post", "/conteudo-publicar".

DEPENDÊNCIAS: pesquisa SEO em saidas/marketing/google-seo/05-estrategia-conteudo.md
(temas/keywords), 02-analise-concorrencia.md (ângulos únicos), 08-geo-otimizacao-ia.md
(GEO); _memoria/framework-trafego.md (RETINA); _memoria/preferencias.md (tom); blog
destino site/astro-site/src/content/blog/ (PODE não existir); skill /lb-conteudo-carrossel.

FLUXO:
Passo 0 — tema: usuário passa explícito OU listar de 05-estrategia-conteudo.md, marcando
quais já viraram blog e descartando duplicatas.
Passo 1 — contexto SEO: keyword principal + variações, como concorrentes tratam (fugir do
óbvio), ângulo GEO se aplicável.
Passo 2 — escrever blog (RETINA). Checar destino ANTES: se site/astro-site/src/content/
blog/ existir, salvar lá como <slug>.md; se NÃO existir, salvar em
saidas/marketing/conteudo/blog/<slug>.md e avisar UMA vez que o pipeline Astro não está
configurado (sem interromper o fluxo). Slug kebab-case sem stopwords. Frontmatter com
title (keyword+benefício, máx 60), description (155 chars, keyword + CTA velado),
publishedAt, author, keywords, draft: true (SEMPRE true). Estrutura: Lead (problema em
2-3 linhas) -> H2 O quê/Por quê -> H2 Como/o que olhar -> H2 detalhe/comparativo
(opcional) -> H2 conexão com a solução (natural) -> CTA final (1 linha). Tom de
preferencias.md. 800-1500 palavras.
Passo 3 — carrossel via /lb-conteudo-carrossel passando tema + 5-7 pontos do artigo;
saída de slides PNG na pasta do slug.
Passo 4 — 3 legendas (Instagram criativo+emoji+hashtags; Facebook corporativo; LinkedIn
profissional sem emoji), todas com CTA único levando ao blog; salvar legendas.md na pasta.
Passo 5 — resumo com links de blog, carrossel e legendas + próxima ação
"/lb-conteudo-aprovar <slug>".

REGRAS: blog sempre draft=true; cada tema = 1 blog + 1 carrossel (não separar); legendas
levam pro blog (amarração); slug único; RETINA não é opcional. Quando aprovado,
/lb-conteudo-aprovar publica blog + carrossel IG/FB numa tacada.
```

## ⚙️ Como funciona
1. Roda `/lb-conteudo-publicar` + tema.
2. Gera blog + carrossel + 3 legendas + metadata.
3. Deixa tudo em draft.

## 🎥 Roteiro de gravação
1. **Gancho:** "Um tema. Blog, carrossel e 3 legendas. Tudo amarrado."
2. Roda o comando.
3. Mostra os artefatos em draft na pasta.
4. **Fechamento:** "Está em draft. No próximo vídeo eu aprovo e publico de verdade."

## 🗣️ Gancho de abertura pronto
> "Vou pegar um único tema e transformar num pacote de conteúdo completo e coerente — blog, carrossel e legendas pra três redes."

## ✅ Demonstração ao vivo
- Draft de blog + PNGs + 3 legendas.

## 🔗 Pré-requisitos
- `lb-conteudo-carrossel` criada; Playwright instalado.
</content>
