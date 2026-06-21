# 🎬 Vídeo 33 — `/lb-venda-diagnostico`

> **Bloco 5 — Vendas.** Duração alvo: 6–8 min · Sem front.
> Abre o bloco comercial — é a **isca de venda**.

## 🎯 Objetivo do vídeo
Rodar diagnóstico rápido da presença digital de uma empresa antes de fechar contrato. Audita site, anúncios ativos (Biblioteca Meta), avaliações Google, Instagram e posição no Google Search. Gera relatório de 1 página com pontos críticos e ranking vs concorrentes — pra entregar de graça e abrir conversa.

## 💡 Dor → solução
- **Dor:** abordagem fria sem valor não engaja prospect.
- **Solução:** entrega um diagnóstico grátis e específico que abre a porta.

## 🧠 Framework por trás
- **OPA** (oferta): o diagnóstico é a isca de valor que inicia a proposta.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-venda-diagnostico em .claude/skills/lb-venda-diagnostico/SKILL.md.

Objetivo: diagnóstico rápido da presença digital de uma empresa (isca de venda).
- Audita: site, anúncios ativos (Biblioteca de Anúncios Meta), avaliações Google,
  Instagram e posição no Google Search.
- Gera relatório de 1 página com pontos críticos + ranking vs concorrentes.
- Tom: gerar valor pra abrir conversa (entregar de graça).
- Gatilhos: "diagnóstico", "auditoria rápida", "levanta o digital dessa empresa",
  /lb-venda-diagnostico.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-venda-diagnostico em .claude/skills/lb-venda-diagnostico/SKILL.md.
Princípio: entregue valor antes de pedir — diagnóstico grátis abre portas que abordagem
fria não abre.

FRONTMATTER:
- name: lb-venda-diagnostico
- description: Roda diagnóstico rápido da presença digital de uma empresa antes de fechar
  contrato. Audita site, anúncios ativos (Biblioteca Meta), avaliações Google, Instagram e
  posição no Google Search. Gera relatório de 1 página com pontos críticos e ranking vs
  concorrentes. Isca de vendas (entregar de graça). Gatilhos: "diagnóstico", "auditoria
  rápida", "levanta o digital dessa empresa", "o que essa empresa tem de errado",
  /lb-venda-diagnostico.

DEPENDÊNCIAS: WebSearch + WebFetch (OBRIGATÓRIO); _memoria/empresa.md. Output em
saidas/marketing/prospeccao/diagnosticos/<slug>.md.

WORKFLOW:
Passo 1 — receber identificação (nome, URL, @ IG, telefone/endereço — mínimo 1).
Passo 2 — coletar dados em paralelo: (1) Site via WebFetch (existe? carrega? CTA claro?
mobile? SEO?); (2) Anúncios ativos via Biblioteca Meta
(facebook.com/ads/library/?country=BR&q=<nome>); (3) Google/Maps GBP via WebSearch
(avaliações, nota, resposta do dono, fotos); (4) Instagram (seguidores, frequência, bio,
mix); (5) Google Search (aparece na 1ª página? quais concorrentes vêm antes?).
Passo 3 — montar relatório de 1 página: Score X/5 ★; "O que está funcionando ✅"; "O que
está custando clientes ❌" (3 problemas com impacto ALTO/MÉDIO e custo estimado); tabela
ranking vs 2 concorrentes (anúncios, avaliações, frequência IG, site com CTA, aparece no
Search); "Oportunidade principal" (1 parágrafo focado no resultado, não na ferramenta).
Passo 4 — salvar em saidas/marketing/prospeccao/diagnosticos/<slug>.md (slug kebab-case).
Passo 5 — gerar script de envio (mensagem curta de abertura oferecendo o diagnóstico).
Passo 6 — oferecer usar como base de abordagem (/lb-venda-prospectar) e montar proposta
com os gaps (/lb-venda-proposta).

REGRAS: dados públicos apenas (nada de OSINT invasivo); score honesto (não inflar);
máximo 1 página; oportunidade principal focada (1 problema com ROI, não lista de 10);
sempre gerar script de envio; sempre salvar (vira base de dossiê/proposta).
```

## ⚙️ Como funciona
1. Roda `/lb-venda-diagnostico` + empresa/URL.
2. Audita os 5 pontos → relatório 1 página.

## 🎥 Roteiro de gravação
1. **Gancho:** "Como eu abro conversa com qualquer prospect: entregando valor antes de vender."
2. Roda contra uma empresa real.
3. Mostra o relatório de 1 página + ranking.
4. **Fechamento:** "Diagnóstico abre a porta. O dossiê personaliza a abordagem — próximo."

## 🗣️ Gancho de abertura pronto
> "Vou auditar a presença digital de uma empresa em minutos e gerar um relatório de uma página — a isca que abre conversa de venda sem parecer venda."

## ✅ Demonstração ao vivo
- Relatório de 1 página com pontos críticos.

## 🔗 Pré-requisitos
- Memória (pro tom); acesso web.
</content>
