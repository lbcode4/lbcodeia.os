# Fase 0 — Site + Instagram (atalho)

**Perguntar ANTES das outras perguntas:**

> "Você tem **site** (URL) ou **Instagram** (URL ou @handle)? Cola aqui — eu dou uma olhada
> e já antecipo várias respostas. Se não tiver, segue sem problema."

## Se tiver site

1. `WebFetch` na home. Buscar `/sobre`, `/servicos` se existirem.
2. Extrair (dado público):
   - Nome negócio + o que entrega (1 frase)
   - Serviços/produtos + cliente-alvo
   - Cidade, telefone, WhatsApp, email, redes sociais
   - Tom de voz (como escreve)
   - Identidade visual (cores, fonte se conseguir inferir)

3. Mostrar rascunho:
   > "Peguei isso do site: [resumo]. Confere? Corrige o que tiver errado."

## Se tiver Instagram

1. **Sempre registrar @handle** — várias skills usam depois (`/lb-conteudo-auditoria-insta`,
   `/lb-meta-campanha-seguidores`, legendas, dossiê).
2. Tentar leitura (Instagram bloqueia sem login):
   - `WebFetch` em `https://www.instagram.com/<handle>/` ou curl com User-Agent
   - Buscar bio, nº seguidores, conteúdo público
3. Se vier vazio: registrar só @ e **não travar** — auditoria completa é `/lb-conteudo-auditoria-insta`
   com prints.
4. **Não fazer auditoria aqui.** Oferecer depois:
   > "Quer que eu rode auditoria completa do perfil depois? (`/lb-conteudo-auditoria-insta`)"

## Se não tiver nenhum

Seguir entrevista normal. Não travar.

## Referências visuais (logo + inspirações)

Pedir sempre — alimenta `/lb-conteudo-carrossel`, `/lb-negocio-site`, `/lb-venda-proposta`:

> "Joga na pasta `identidade/` o que tiver: **logo**, paleta de cores, e 2-3 **imagens de
> referência** de posts/sites que você acha a cara da marca. Quanto mais ref, melhor o visual
> que eu gero depois."

Confirmar o que chegou e não travar se vier vazio (registrar status em P17).
