# 🎬 Vídeo 13 — `/lb-conteudo-auditoria-insta`

> **Bloco 2 — Conteúdo.** Duração alvo: 5–7 min · Sem front.

## 🎯 Objetivo do vídeo
Auditoria completa de perfil Instagram em 7 elementos (foto, @, título, bio, link, destaques, 9 quadros) + diagnóstico RETINA dos últimos posts. Devolve checklist ❌/✅ + template de bio + lista de quadros faltando por tipo RETINA.

## 💡 Dor → solução
- **Dor:** rodar tráfego pra um perfil mal otimizado = queimar dinheiro.
- **Solução:** checklist objetivo do que falta antes de anunciar.

## 🧠 Framework por trás
- **RETINA** classifica os 9 quadros e diagnostica os últimos posts.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-conteudo-auditoria-insta em .claude/skills/lb-conteudo-auditoria-insta/SKILL.md.

Objetivo: auditar um perfil de Instagram antes de anunciar.
- Avalia 7 elementos: foto, @, título, bio, link, destaques e os 9 primeiros quadros.
- Faz diagnóstico RETINA dos últimos posts.
- Como o IG bloqueia WebFetch, aceita prints/colagem de dados do perfil.
- Saída: checklist ❌/✅ + template de bio + lista de quadros faltando por tipo RETINA.
- Gatilhos: "auditar instagram", "perfil tá pronto pra anunciar", "revisar bio",
  /lb-conteudo-auditoria-insta.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-conteudo-auditoria-insta em .claude/skills/lb-conteudo-auditoria-insta/SKILL.md.
Princípio (analogia "Pesadelo na Cozinha"): levar tráfego a perfil despreparado é
desperdício — arrumar a casa (orgânico) primeiro.

FRONTMATTER:
- name: lb-conteudo-auditoria-insta
- description: Auditoria completa de perfil Instagram em 7 elementos (foto, @, título,
  bio, link, destaques, 9 quadros) + diagnóstico RETINA dos últimos posts. Devolve
  checklist ❌/✅ + template de bio + lista de quadros faltando por tipo RETINA. Use
  antes de campanha de seguidores. Gatilhos: "auditar instagram", "perfil tá pronto pra
  anunciar", "revisar bio", /lb-conteudo-auditoria-insta.

DEPENDÊNCIAS: _memoria/framework-trafego.md (OBRIGATÓRIO — RETINA, GCC),
_memoria/empresa.md, _memoria/preferencias.md, identidade/design-guide.md, WebFetch.
Output em saidas/marketing/auditoria-ig/<handle>-<YYYY-MM-DD>.md.

WORKFLOW:
Passo 1 — coletar handle (de empresa.md ou perguntar "Qual o @ pra auditar?").
Passo 2 — analisar perfil: opção A (próprio) pedir prints de capa/destaques/grade;
opção B (público) WebFetch em instagram.com/<handle>/ (extrai meta tags/OG/bio) — se IG
bloquear, pedir print.
Passo 3 — avaliar os 7 elementos com critério ✅/❌:
  1 Foto (rosto/logo evidente, "mais cabeça que corpo", fundo neutro; se ruim sugerir
    prompts/foto-profissional.md ou logo limpo).
  2 @ (curto, sem caractere especial/letra repetida).
  3 Título no formato <Nome> | <Marca> | <Produto> (campo indexado na busca).
  4 Bio com 4 elementos: transformação + autoridade + conexão/localização + CTA (dar
    template aplicado).
  5 Link (presente, curto).
  6 Destaques (mínimo 3: Quem sou / Depoimentos / Produtos; capas com ícones consistentes).
  7 Os 9 quadros: análise visual (consistência de paleta/tipografia, alternância de
    capas) + análise RETINA classificando cada post (R Relacionamento, E Engajamento,
    T Transformação, I Interação, N Níveis de consciência/venda, A Autoridade). Apontar
    padrões ruins (9/9 N = só vende; 9/9 E = só meme; zero R = sem humanização) e sugerir
    mix saudável.
Passo 4 — diagnóstico final em markdown: score X/7; tabela status por elemento
  (#/elemento/status/problema/sugestão); tabela RETINA dos 9 quadros + distribuição +
  quadros faltando; bio reescrita (3 versões); próximos 5 posts pra preencher os quadros
  faltantes; capas dos destaques.
Passo 5 — próximos passos: score <5/7 recomendar arrumar perfil ANTES de
  /lb-meta-campanha-seguidores; score 5-7 liberar campanha. Oferecer criar os 5 posts
  (/lb-conteudo-carrossel) e rodar /lb-meta-campanha-seguidores.

REGRAS: sempre ler framework-trafego.md antes; não inventar prints se o IG bloquear
(pedir ao usuário); avaliação objetiva (❌ claro, nada de "tá bonito"); sugestões
concretas (texto exato, não "melhorar a bio"); mix RETINA é orientativo (depende do
nicho); nunca pedir senha; comparar com 2-3 perfis fortes do nicho antes de avaliar.
```

## ⚙️ Como funciona
1. Roda `/lb-conteudo-auditoria-insta` + @ (ou prints).
2. Avalia os 7 elementos + posts.
3. Entrega checklist + bio nova + quadros faltando.

## 🎥 Roteiro de gravação
1. **Gancho:** "Antes de gastar 1 real em anúncio, seu perfil precisa passar nesse teste."
2. Roda contra um perfil real.
3. Mostra o checklist ❌/✅ e o template de bio.
4. **Fechamento:** "Perfil pronto. Vamos pra presença no Google — próximo bloco."

## 🗣️ Gancho de abertura pronto
> "Anunciar com perfil mal feito é jogar dinheiro fora. Vou rodar uma auditoria de 7 pontos e sair com a bio reescrita."

## ✅ Demonstração ao vivo
- Checklist + template de bio + lista de quadros.

## 🔗 Pré-requisitos
- Memória preenchida; prints do perfil (IG bloqueia scraping).
</content>
