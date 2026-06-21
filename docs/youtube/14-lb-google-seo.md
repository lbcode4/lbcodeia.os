# 🎬 Vídeo 14 — `/lb-google-seo`

> **Bloco 3 — Google orgânico.** Duração alvo: 9–12 min · Sem front.

## 🎯 Objetivo do vídeo
Fluxo completo de SEO, GEO e Google Ads em 8 passos: pesquisa de demanda, análise de concorrência, Google Meu Negócio, otimização on-page, estratégia de conteúdo, Google Ads, checklist de monitoramento e GEO (aparecer em IAs como ChatGPT, Gemini, Perplexity).

## 💡 Dor → solução
- **Dor:** SEO parece um buraco sem fim; ninguém sabe por onde começar.
- **Solução:** um roteiro de 8 passos que cobre desde keyword até aparecer nas IAs (GEO).

## 🧠 Framework por trás
- **Bolo de Cenoura:** consistência termo → conteúdo → conversão.
- **GEO:** novidade estratégica — otimizar pra ser citado por ChatGPT/Gemini/Perplexity.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-google-seo em .claude/skills/lb-google-seo/SKILL.md.

Objetivo: fluxo completo de SEO + GEO + Google Ads em 8 passos.
1) pesquisa de demanda/keywords  2) análise de concorrência
3) Google Meu Negócio  4) otimização on-page  5) estratégia de conteúdo
6) Google Ads  7) checklist de monitoramento  8) GEO (aparecer em ChatGPT/Gemini/Perplexity).
- Lê _memoria/empresa.md pro nicho. Salva a pesquisa pra alimentar lb-google-ads.
- Aplica consistência do Bolo de Cenoura (termo→página→conversão).
- Gatilhos: "seo", "geo", "palavras-chave", "aparecer no google",
  "aparecer no chatgpt", "analisar concorrência seo", /lb-google-seo.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-google-seo em .claude/skills/lb-google-seo/SKILL.md.

FRONTMATTER:
- name: lb-google-seo
- description: Fluxo completo de SEO, GEO e Google Ads em 8 passos: pesquisa de demanda,
  análise de concorrência, Google Meu Negócio, otimização on-page, estratégia de
  conteúdo, Google Ads, checklist de monitoramento e GEO (aparecer em IAs como ChatGPT,
  Gemini, Perplexity). Use quando pedir "seo", "geo", "palavras-chave", "google ads",
  "aparecer no google", "aparecer no chatgpt", "aparecer nas ias", "google meu negócio",
  "gmb", "analisar concorrência seo", "pesquisa de nicho", "google trends".

DEPENDÊNCIAS: _memoria/empresa.md, _memoria/preferencias.md, _memoria/estrategia.md;
WebSearch e WebFetch (nativos). Outputs em saidas/marketing/google-seo/.

ARQUITETURA "skill fina": o SKILL.md orquestra; cada bloco de passos mora num arquivo de
apoio carregado só quando chega o bloco:
- reference/passo-0-coleta.md (3 inputs críticos: site, Instagram, cobertura geográfica)
- reference/passos-1-4.md (1 demanda, 2 concorrência, 3 GMB delegando
  /lb-google-meu-negocio, 4 on-page)
- reference/passos-5-8.md (5 estratégia de conteúdo, 6 Google Ads, 7 checklist de
  monitoramento, 8 GEO/aparecer nas IAs)
Sequência: Passo 0 -> Passos 1-4 -> Passos 5-8. Antes do Passo 0, ler empresa.md pra
pré-preencher os inputs.

EXECUÇÃO: ao rodar /lb-google-seo, executar os 8 passos em sequência, salvando cada
output no arquivo correspondente em saidas/marketing/google-seo/ (ex:
05-estrategia-conteudo.md, 02-analise-concorrencia.md, 08-geo-otimizacao-ia.md). Entre
passos, mostrar resumo do que encontrou. Permitir rodar 1 passo só
(/lb-google-seo passo 3, /lb-google-seo gmb, /lb-google-seo geo). Ao final, resumo
executivo: top 5 oportunidades, ações prioritárias, estimativa de investimento em ads,
próximos passos.

REGRAS: toda pesquisa real via WebSearch/WebFetch (nunca inventar volume/concorrência);
copies seguem preferencias.md; termos em português do Brasil como o público busca; dado
não obtível = deixar claro que é estimativa e explicar a lógica; focar termos com
intenção comercial/transacional; schema markup em JSON-LD; Google Ads nunca inventar CPC
sem base real.

Crie também os 3 arquivos de reference/ com o detalhamento dos passos.
```

## ⚙️ Como funciona
1. Roda `/lb-google-seo`.
2. Percorre os 8 passos (pode focar em 1).
3. Salva pesquisa de keywords reaproveitável.

## 🎥 Roteiro de gravação
1. **Gancho:** "SEO em 2026 não é só Google — é aparecer no ChatGPT também."
2. Roda o passo de pesquisa de demanda.
3. Mostra o passo GEO (diferencial).
4. **Fechamento:** "Pra negócio local, o Google Meu Negócio é ouro — próximo vídeo."

## 🗣️ Gancho de abertura pronto
> "Vou montar uma estratégia de SEO completa — e incluir GEO, que é otimizar pra aparecer nas respostas das IAs. Poucos fazem isso ainda."

## ✅ Demonstração ao vivo
- Pesquisa de keywords + plano de 8 passos.

## 🔗 Pré-requisitos
- Memória preenchida (nicho).
</content>
