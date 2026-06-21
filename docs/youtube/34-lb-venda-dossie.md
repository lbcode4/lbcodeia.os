# 🎬 Vídeo 34 — `/lb-venda-dossie`

> **Bloco 5 — Vendas.** Duração alvo: 5–7 min · Sem front.

## 🎯 Objetivo do vídeo
Levantar dossiê de 1 página sobre um prospect antes da abordagem: site, CNPJ, dono/sócio, telefone, redes sociais, GBP, se já anuncia (Biblioteca Meta), preços/serviços e 2–3 pontos de conexão específicos pra usar na abordagem.

## 💡 Dor → solução
- **Dor:** abordagem genérica ("oi, tudo bem?") não converte.
- **Solução:** dossiê com ganchos de conexão reais pra personalizar a primeira mensagem.

## 🧠 Framework por trás
- Insumo do **OPA** + pré-requisito do `/lb-venda-prospectar` (abordagem personalizada).

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-venda-dossie em .claude/skills/lb-venda-dossie/SKILL.md.

Objetivo: levantar dossiê de 1 página sobre um prospect.
- Coleta: site, CNPJ, dono/sócio, telefone, redes sociais, GBP,
  se já anuncia (Biblioteca de Anúncios Meta), preços/serviços.
- Identifica 2-3 pontos de conexão específicos pra usar na abordagem.
- Saída em saidas/marketing/prospeccao/<prospect>/.
- Gatilhos: "levanta dossiê", "info sobre [empresa]", "pesquisa esse negócio",
  "dossiê", /lb-venda-dossie.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-venda-dossie em .claude/skills/lb-venda-dossie/SKILL.md.
Princípio: achar cliente é fácil; levantar informação é o diferencial.

FRONTMATTER:
- name: lb-venda-dossie
- description: Levanta dossiê de 1 página sobre prospect antes da abordagem. Coleta site,
  CNPJ, dono/sócio, telefone, redes, GBP, se já anuncia (Biblioteca de Anúncios Meta),
  preços/serviços e 2-3 pontos de conexão específicos pra usar na abordagem. Gatilhos:
  "levanta dossiê", "stalker do bem", "info sobre [empresa]", "pesquisa esse negócio",
  "dossiê", /lb-venda-dossie.

DEPENDÊNCIAS: _memoria/framework-trafego.md; WebSearch + WebFetch. Output em
saidas/marketing/prospeccao/dossies/<slug>.md.

WORKFLOW:
Passo 1 — receber identificação (nome, URL, @ IG, telefone, dono/sócio, endereço — mín 1).
Passo 2 — coletar em paralelo: WebSearch ("<nome>", "<nome> CNPJ", "<nome> reclame aqui",
"<dono> linkedin"); WebFetch (site: serviços/preços/equipe/contato; Instagram: bio/link/
métricas; GBP: avaliações/nota/fotos); Biblioteca de Anúncios Meta (anuncia? nível =
botão turbinar vs gerenciador; se não anuncia = lead quente); operadores Google
(site:instagram.com <nome>; <nome> gmail OR hotmail OR outlook).
Passo 3 — montar dossiê de 1 página: Identificação (razão social, CNPJ, endereço,
telefone, site, IG, FB, LinkedIn, GBP); Pessoas (dono/sócio, email provável, decisores);
Negócio (o que vende, como vende, preço, ticket médio estimado, tempo de mercado); Status
digital (site, já anuncia e onde, nível de sofisticação, GBP, IG score, reputação);
Métricas-chave estimadas (faturamento, ocupação, LTV/CAC, atendimentos/mês); ⭐ Pontos de
conexão (3 fatos específicos que provam pesquisa); Gaps que a oferta resolve; Status da
abordagem (checklist).
Passo 4 — salvar em saidas/marketing/prospeccao/dossies/<slug>.md (kebab-case).
Passo 5 — oferecer gerar abordagem personalizada (/lb-venda-prospectar).

REGRAS: sempre ler framework-trafego.md; dados reais via WebSearch/WebFetch (nunca
inventar); pontos de conexão específicos ("abriram 2ª unidade em Moema", não "vocês são
bons"); marcar incertezas como estimativa; só dados públicos (OSINT de fontes abertas);
sem site/IG = dossiê curto, sinalizar limitação; não fazer 100 de uma vez (qualidade >
quantidade; volume é /lb-venda-prospectar).
```

## ⚙️ Como funciona
1. Roda `/lb-venda-dossie` + prospect.
2. Coleta dados públicos → 1 página + pontos de conexão.

## 🎥 Roteiro de gravação
1. **Gancho:** "Antes de abordar, eu sei tudo que importa sobre o prospect."
2. Roda contra uma empresa.
3. Destaca os 2–3 pontos de conexão.
4. **Fechamento:** "Dossiê pronto. Agora a prospecção em escala — Fórmula PLANO."

## 🗣️ Gancho de abertura pronto
> "Abordagem genérica não vende. Vou levantar um dossiê de uma página com os ganchos certos pra personalizar a primeira mensagem."

## ✅ Demonstração ao vivo
- Dossiê 1 página + pontos de conexão.

## 🔗 Pré-requisitos
- Acesso web.
</content>
