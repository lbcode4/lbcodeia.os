# 🎬 Vídeo 41 — `/lb-negocio-analisar-dados`

> **Bloco 6 — Negócio.** Duração alvo: 5–7 min · Sem front.

## 🎯 Objetivo do vídeo
Analisar qualquer arquivo de dados (CSV, Excel, TXT, JSON, PDF) e entregar resumo executivo: o que está bom, o que está ruim, tendências, oportunidades e recomendações. Input: arquivo + pergunta opcional. Output: relatório acionável.

## 💡 Dor → solução
- **Dor:** dado bruto não vira decisão; planilha grande intimida.
- **Solução:** arrasta o arquivo, recebe insight acionável.

## 🧠 Framework por trás
- Foco em **decisão** (não só descrição): toda análise termina em recomendação.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-negocio-analisar-dados em .claude/skills/lb-negocio-analisar-dados/SKILL.md.

Objetivo: analisar arquivo de dados e entregar resumo executivo.
- Aceita CSV, Excel, TXT, JSON, PDF.
- Extrai: o que está bom, o que está ruim, tendências, oportunidades, recomendações.
- Aceita uma pergunta opcional pra focar a análise.
- Saída: relatório acionável (markdown ou tabela).
- Gatilhos: "analisa esse", "o que mostram", "resume esses dados", "me dá insight",
  /lb-negocio-analisar-dados.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-negocio-analisar-dados em .claude/skills/lb-negocio-analisar-dados/SKILL.md.
Lê arquivo, extrai insight, entrega resumo executivo em 2 minutos.

FRONTMATTER:
- name: lb-negocio-analisar-dados
- description: Analisa arquivo de dados (CSV, Excel, TXT, JSON, PDF) e entrega resumo
  executivo. Extrai o que tá bom, o que tá ruim, tendências, oportunidades, recomendações.
  Input: arquivo + pergunta opcional. Output: relatório acionável. Use quando disser
  "analisa esse", "o que mostram", "resume esses dados", "me dá insight", ou arrastar arquivo.

FLUXO:
Passo 1 — entender contexto (perguntar se não claro: "o que é esse arquivo?", "qual a
pergunta principal?"; se óbvio, seguir).
Passo 2 — ler arquivo (CSV, Excel .xlsx, TXT, JSON, PDF com tabelas) com as ferramentas
disponíveis.
Passo 3 — análise estruturada: O que tá bom (métricas acima da média, top performers); O
que tá ruim (quedas, anomalias, abaixo do esperado); Tendências (sazonalidade, crescimento/
queda); Oportunidades (baixo esforço/alto impacto, gaps); Recomendações acionáveis (3-5
próximos passos).
Passo 4 — entregar em markdown com seções claras (não tabela gigante): Resumo executivo
(1-2 linhas), O que tá em alta, Atenção, Tendências, Oportunidades, Próximos passos
(urgente / esta semana / investigação).

REGRAS: ler o arquivo fornecido (avisar se senha/problema); contexto vem de
_memoria/empresa.md (negócio) + estrategia.md (foco); recomendações acionáveis (não
genéricas); avisar se dados confidenciais (análise local). Integração: resultado pode ir
pro /lb-meta-relatorio, virar ação em estrategia.md, e ser versionado via
/lb-sistema-versionar.
```

## ⚙️ Como funciona
1. Roda `/lb-negocio-analisar-dados` + arquivo (+ pergunta).
2. Lê → resume → recomenda.

## 🎥 Roteiro de gravação
1. **Gancho:** "Qualquer planilha vira decisão. É só arrastar."
2. Arrasta um CSV/Excel real.
3. Mostra o resumo executivo + recomendações.
4. **Fechamento:** "Dados viram decisão. Decisão vira plano — próximo vídeo."

## 🗣️ Gancho de abertura pronto
> "Vou pegar uma planilha bagunçada e sair com um resumo executivo: o que está bom, o que está ruim e o que fazer."

## ✅ Demonstração ao vivo
- Relatório acionável a partir de um arquivo.

## 🔗 Pré-requisitos
- Um arquivo de dados.
</content>
