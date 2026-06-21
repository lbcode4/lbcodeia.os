# 🎬 Vídeo 18 — `/lb-google-ads`

> **Bloco 4 — Tráfego pago.** Duração alvo: 8–10 min · Sem front.

## 🎯 Objetivo do vídeo
Criar a estrutura completa de uma campanha de Google Ads a partir de briefing ou da pesquisa SEO. Gera CSV pronto pra importar no Google Ads Editor: campanhas Search por cluster de keywords, grupos de anúncios, RSAs, extensões e palavras-chave negativas.

## 💡 Dor → solução
- **Dor:** montar campanha do zero no Google Ads Editor é demorado e cheio de erro.
- **Solução:** CSV estruturado, pronto pra importar, organizado por cluster.

## 🧠 Framework por trás
- **4 Campanhas de Ouro** (mix de tráfego) + **GCC** nas RSAs (gatilho/copy/conversão).
- Reaproveita a pesquisa do `/lb-google-seo`.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-google-ads em .claude/skills/lb-google-ads/SKILL.md.

Objetivo: gerar estrutura completa de campanha Google Ads como CSV importável.
- Lê o briefing de _memoria/empresa.md e a pesquisa SEO (se existir).
- Organiza campanhas Search por cluster de palavras-chave, com grupos de anúncios,
  RSAs (15 títulos / 4 descrições), extensões e palavras-chave negativas.
- Aplica GCC nas RSAs (gatilho, copy, conversão).
- Saída: CSV pronto pro Google Ads Editor em saidas/.
- Gatilhos: "criar campanha google ads", "anúncio google", "csv pro google ads",
  /lb-google-ads.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-google-ads em .claude/skills/lb-google-ads/SKILL.md.
Monta a campanha inteira em CSV pronto pra importar no Google Ads Editor (sai do briefing
direto pro CSV, sem montar grupo por grupo na interface).

FRONTMATTER:
- name: lb-google-ads
- description: Cria estrutura completa de campanha do Google Ads a partir de briefing ou
  da pesquisa SEO. Gera CSV pronto pro Google Ads Editor com campanhas Search por cluster
  de palavras-chave, grupos de anúncios, RSAs, extensões e negativas. Lê briefing de
  _memoria/empresa.md e da pesquisa SEO se existir. Gatilhos: "criar campanha google
  ads", "anúncio google", "csv pro google ads", /lb-google-ads.

DEPENDÊNCIAS: _memoria/framework-trafego.md (OBRIGATÓRIO — OPA, Bolo de Cenoura),
_memoria/empresa.md, _memoria/preferencias.md, pesquisa SEO se existir
(saidas/marketing/google-seo/01-pesquisa-demanda.md e 06-google-ads.md), GBP otimizado
(pra Dominação Top 1). Output em
saidas/marketing/campanhas/conversao/google-ads-<YYYY-MM-DD>/.

PRINCÍPIO CENTRAL (Bolo de Cenoura): correspondência em cadeia Termo pesquisado =
Anúncio mostrado = Página de destino. Antes do CSV, validar se a RSA repete a keyword e
se a landing entrega o prometido. Incluir tabela de validação em configuracoes.md
(Cluster | Termo->Anúncio | Anúncio->Landing | Status Forte/Médio/Fraco) e documentar
elos fracos.

MODOS (escolher com o usuário): A — Search via Google Ads Editor (padrão; cliente com
site/landing e orçamento >R$500/mês; CSV). B — Dominação Top 1 (botão Anunciar dentro do
GBP; cliente novo/local sem site; sem CSV; detalhe em reference/dominacao-top1.md).

ARQUITETURA "skill fina" — cada fase num arquivo de apoio carregado sob demanda:
- reference/keywords-clusters.md (Passos 1-2: briefing, pesquisa keywords, match types,
  clusters)
- reference/estrutura-rsa.md (Passos 3-4: estrutura de campanha + negativas + RSAs)
- reference/extensoes-configuracoes.md (Passos 5-6: extensões + lances/redes/geo/idioma/
  conversões)
- reference/estrutura-csv.md (Passos 7-8: gera CSVs, pastas, resumo, plano de 30 dias)
- reference/dominacao-top1.md (Modo B)
Sequência modo A: 1-2 -> 3-4 -> 5-6 -> 7-8. Modo B: 1-2 -> Modo B.

REGRAS: sempre ler framework-trafego.md antes; nunca inventar CPC (dar faixa via
WebSearch); sempre começar pausado; não anunciar termos informacionais ("como fazer X" =
SEO); match type frase+exata na maioria (ampla só com 30+ dias de dados); lista de
negativas global obrigatória; exigir conversões configuradas antes de ativar; idiomas
sempre pt+en+es; local sempre "Presença" (não "Interesse"); validar Bolo de Cenoura;
copies seguem preferencias.md.

Crie também os arquivos de reference/.
```

## ⚙️ Como funciona
1. Roda `/lb-google-ads` + briefing.
2. Gera clusters + grupos + RSAs + negativas.
3. Exporta CSV importável.

## 🎥 Roteiro de gravação
1. **Gancho:** "Uma campanha de Google Ads inteira, pronta pra importar, em um comando."
2. Roda o comando.
3. Abre o CSV e mostra a estrutura por cluster.
4. (Opcional) mostra o import no Google Ads Editor.
5. **Fechamento:** "Google coberto. Agora a Campanha de Ouro do WhatsApp no Meta."

## 🗣️ Gancho de abertura pronto
> "Montar campanha no Google Ads na mão leva horas. Vou gerar a estrutura completa em CSV, pronta pra importar."

## ✅ Demonstração ao vivo
- CSV com campanhas/grupos/RSAs/negativas.

## 🔗 Pré-requisitos
- Briefing na memória; idealmente pesquisa do `/lb-google-seo`.
</content>
