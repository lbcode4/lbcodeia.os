# 🎬 Vídeo 38 — `/lb-venda-proposta`

> **Bloco 5 — Vendas.** Duração alvo: 6–8 min · Sem front.

## 🎯 Objetivo do vídeo
Fechar o funil comercial gerando uma proposta comercial — saída em HTML → PNG, estilo "pack" de 2 páginas, com a oferta estruturada e copy de conversão.

## 💡 Dor → solução
- **Dor:** proposta feia ou genérica derruba a percepção de valor na reta final.
- **Solução:** proposta visual e persuasiva, gerada do contexto do cliente.

## 🧠 Framework por trás
- **OPA** (oferta/proposta/ação) + **GCC** na copy de fechamento.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-venda-proposta em .claude/skills/lb-venda-proposta/SKILL.md.

Objetivo: gerar proposta comercial pronta pra enviar.
- Estrutura pela OPA: oferta, escopo, entregáveis, investimento, prova e CTA.
- Aplica GCC na copy de fechamento.
- Saída em HTML estilizado renderizado em PNG, estilo pack de 2 páginas (via Playwright).
- Lê _memoria/ + dados do cliente/proposta informados.
- Gatilhos: "proposta comercial", "fazer proposta", "fechar contrato",
  /lb-venda-proposta.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-venda-proposta em .claude/skills/lb-venda-proposta/SKILL.md.
Transforma dossiê + oferta em proposta visual de 2 páginas pronta pra enviar.

FRONTMATTER:
- name: lb-venda-proposta
- description: Gera proposta comercial visual personalizada para prospect. Puxa dados do
  dossiê (/lb-venda-dossie), calcula ROI estimado, gera HTML de 2 páginas no estilo pack
  (cover com deliverables + condições com preço/CTA), renderiza em PNG via Playwright.
  Gatilhos: "proposta", "gerar proposta", "montar proposta comercial", "proposta pra
  [prospect]", /lb-venda-proposta.

DEPENDÊNCIAS: dossiê do prospect se existir
(saidas/marketing/prospeccao/dossies/<slug>.md); _memoria/empresa.md;
identidade/design-guide.md + imagens de identidade/; referência de layout em
exemplo/pack-soluccionar (1).pdf; Playwright. Output em
saidas/marketing/prospeccao/<slug>/proposta-<YYYY-MM-DD>/.

WORKFLOW:
Passo 1 — coletar: nome do prospect (ou slug do dossiê); o que entra na proposta (ou
pacote padrão); preço (à vista + parcelado); bônus. Se dossiê existir, extrair responsável,
empresa, gaps e ticket/atendimentos pra ROI.
Passo 2 — calcular ROI estimado (cenário conservador +20% de ocupação: novos atendimentos
= atuais x 0.20; receita adicional = novos x ticket; payback = investimento/receita
adicional). Sem métricas, usar benchmarks por setor.
Passo 3 — gerar HTML de 2 páginas (1080x1350 cada). Ler design-guide e carregar imagens de
identidade/ antes de estilizar. Página 1 (cover): header com logo + "PROPOSTA · MÊS ANO";
hero ([Empresa] x [produto], tagline personalizada com a dor do dossiê); deliverables
numerados (foco no resultado). Página 2 (condições): formas de pagamento (À VISTA
RECOMENDADO + PARCELADO), bônus, resumo do que acontece ao fechar, assinatura + CTA.
Passo 4 — renderizar via Playwright (npx playwright screenshot --full-page) ou
scripts/render.js.
Passo 5 — salvar proposta-p1.html/png, proposta-p2.html/png, proposta-dados.md (ROI,
preço, próximo passo).
Passo 6 — oferecer /lb-venda-follow-up pra acompanhar a proposta.

REGRAS: sempre ler dossiê se existir (genérica converte menos); tagline com a dor
específica; ROI conservador e honesto; bônus sempre presente; máximo 2 páginas; sempre
oferecer /lb-venda-follow-up; nunca inventar preço (pedir ao usuário).
```

## ⚙️ Como funciona
1. Roda `/lb-venda-proposta` + dados da oferta.
2. Estrutura via OPA → HTML → PNG 2 páginas.

## 🎥 Roteiro de gravação
1. **Gancho:** "A proposta é o último empurrão. A minha é visual e persuasiva."
2. Roda o comando.
3. Mostra o PNG das 2 páginas.
4. **Fechamento:** "Mas qual preço colocar nessa proposta? Próximo: precificar."

## 🗣️ Gancho de abertura pronto
> "Vou gerar uma proposta comercial visual, estruturada pela OPA, pronta pra enviar e fechar."

## ✅ Demonstração ao vivo
- PNG da proposta (2 páginas).

## 🔗 Pré-requisitos
- Playwright; memória; dados da oferta.
</content>
