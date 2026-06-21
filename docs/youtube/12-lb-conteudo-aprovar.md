# 🎬 Vídeo 12 — `/lb-conteudo-aprovar`

> **Bloco 2 — Conteúdo.** Duração alvo: 6–8 min · Sem front.
> ⚠️ Vídeo com **ação externa real** (publica nas redes) — mostrar a confirmação na tela.

## 🎯 Objetivo do vídeo
Aprovar + publicar o pipeline completo: blog draft → published, carrossel PNG → público, commit + deploy automático (Netlify/Vercel), e post no IG + FB via Meta API. Uso: `/lb-conteudo-aprovar <slug>`.

## 💡 Dor → solução
- **Dor:** depois de criar, ainda falta publicar em vários lugares na mão.
- **Solução:** um comando publica tudo e versiona — com confirmação antes de ir ao ar.

## 🧠 Framework por trás
Fecha o ciclo de produção: tudo versionado + automatizado. A consistência (Bolo de Cenoura) só vale se publicar de verdade.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-conteudo-aprovar em .claude/skills/lb-conteudo-aprovar/SKILL.md.

Objetivo: aprovar e publicar o conteúdo criado por /lb-conteudo-publicar.
- Recebe um slug. Promove o blog de draft → published e o carrossel PNG → público.
- Faz commit + deploy automático (Netlify/Vercel).
- Posta no Instagram + Facebook via Meta API.
- SEMPRE pedir confirmação explícita antes de publicar (ação externa irreversível).
- Registra o que foi publicado.
- Gatilhos: "aprovar post X", "publicar o tema Y", /lb-conteudo-aprovar <slug>.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-conteudo-aprovar em .claude/skills/lb-conteudo-aprovar/SKILL.md.
É a última milha do conteúdo: usuário aprova -> tudo sai simultâneo (site, redes,
versionado).

FRONTMATTER:
- name: lb-conteudo-aprovar
- description: Aprova + publica pipeline completo: blog draft -> published, carrossel
  PNG -> público, commit + deploy automático (Netlify/Vercel), posta no IG + FB via Meta
  API. Uso: /lb-conteudo-aprovar <slug> após /lb-conteudo-publicar. Use quando disser
  "aprovar post X", "publicar o tema Y", "/conteudo-aprovar <slug>".

PRÉ-REQUISITOS (setup único): .env com META_PAGE_ACCESS_TOKEN, META_PAGE_ID,
META_IG_USER_ID, SITE_URL; site com deploy automático a partir da main (Netlify/Vercel);
Instagram Business conectado à Página FB; permissões no Meta App; scripts
scripts/postar-instagram.js e scripts/postar-facebook.js. Se faltar algo, parar e avisar
(criar saidas/marketing/setup-automacao-meta.md se preciso).

FLUXO — chamada /lb-conteudo-aprovar <slug> (slug = nome do arquivo blog sem .md):
1. Validar: blog existe? carrossel PNG existe na pasta do slug? legendas.md existe?
2. Publicar site (só se houver site configurado): checar se site/astro-site/ existe.
   Se NÃO existe, pular esta etapa, avisar uma vez, mas ainda commitar o markdown do blog
   (git add/commit/push) e ir pro passo 3. Se existe: mudar draft: true -> false, copiar
   PNGs pro public/, git add + commit "Publica [tema]" + push, aguardar deploy, confirmar
   live.
3. Postar redes: Meta API posta carrossel no IG (com legenda) e compartilha no FB (link
   pro blog). Se falhar em IG/FB: pausar, avisar, mas NÃO quebrar a publicação do site.
4. Resultado: ✓ blog publicado (URL), ✓ carrossel no Instagram, ✓ link no Facebook,
   ✓ commit versionado.

REGRAS: não rodar até o usuário dizer "aprovado"; conteúdo deve vir de
/lb-conteudo-publicar (avisar se vier avulso); se Meta API falhar, site continua público
(redes é bônus); tudo versionado no GitHub. Integração: contexto de empresa.md (site,
redes); próxima execução roda /lb-meta-relatorio pra medir performance.
```

## ⚙️ Como funciona
1. Roda `/lb-conteudo-aprovar <slug>`.
2. Confirma antes de publicar.
3. Promove draft → published, deploy, posta nas redes.

## 🎥 Roteiro de gravação
1. **Gancho:** "Do draft ao ar — em um comando, com confirmação."
2. Roda com o slug do vídeo anterior.
3. **Mostra a etapa de confirmação** (importante: deixar claro que não publica sem OK).
4. Mostra o deploy + o post publicado.
5. **Fechamento:** "Conteúdo no ar. Mas o perfil precisa estar pronto pra receber — auditoria no próximo."

## 🗣️ Gancho de abertura pronto
> "Criar é metade. Agora vou publicar tudo de uma vez — site, Instagram e Facebook — com uma confirmação de segurança antes de ir ao ar."

## ✅ Demonstração ao vivo
- Deploy + post publicado (usar conta de teste se preferir).

## 🔗 Pré-requisitos
- Conteúdo em draft (vídeo 11), Meta API conectada (vídeo 17), host (Netlify/Vercel).
</content>
