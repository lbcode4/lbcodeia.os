# Passos 7-8 — Gerar os CSVs + Resumo & Plano 30 dias

## Passo 7 — Gerar os CSVs

Estrutura de pastas final:

```
marketing/campanhas/conversao/google-ads-<YYYY-MM-DD>/
  campanhas.csv          ← linha por campanha
  grupos.csv             ← linha por grupo de anúncio
  keywords.csv           ← keywords + match type
  keywords-negativas.csv ← negativas por grupo + lista global
  anuncios.csv           ← RSAs (headlines + descriptions)
  extensoes-sitelinks.csv
  extensoes-chamadas.csv          ← só se tiver telefone em empresa.md
  extensoes-callouts.csv          ← sempre gerar (6-8 frases curtas)
  extensoes-snippets.csv
  extensoes-preco.csv             ← só se preço confirmado/publicado
  configuracoes.md       ← config + checklist de import
  README.md              ← passo a passo pra importar no Google Ads Editor
```

**Formato dos CSVs:** seguir o padrão de importação do Google Ads Editor (colunas: Campaign, Ad group, Keyword, Match type, Status, Max CPC, etc.).

## Passo 8 — Resumo + plano 30 dias

Mostrar pro usuário:

```
✓ Campanha pronta: marketing/campanhas/conversao/google-ads-<YYYY-MM-DD>/

Estrutura:
- <N> campanhas
- <N> grupos de anúncio
- <N> palavras-chave (positivas)
- <N> palavras-chave negativas
- <N> RSAs

Pra subir (ordem obrigatória no Editor):
1. campanhas.csv
2. grupos.csv
3. keywords.csv
4. keywords-negativas.csv
5. anuncios.csv
6. extensoes-*.csv (qualquer ordem)

Checklist antes de ativar:
- [ ] Conversão configurada e testada (Tag Assistant)
- [ ] Segmentação geográfica = "Presença" (não "Interesse")
- [ ] Parceiros de pesquisa desativados
- [ ] Tudo "Pausado" — ativar manualmente
- [ ] Botão de WhatsApp/formulário da landing funcionando no mobile
```

**Plano de monitoramento 30 dias** (incluir em `configuracoes.md`):

- **Dias 1-7:** Monitorar diariamente. Relatório de Termos de pesquisa → adicionar negativas conforme aparecerem. Confirmar conversões sendo registradas.
- **Semanas 2-3:** Pausar keywords/RSAs com CTR < 1,5% após 100 impressões ou CPL acima do esperado. Realocar verba pros que performam.
- **Semana 4:** Se ≥ 30 conversões → migrar pra tCPA. Avaliar expansão (2º RSA por grupo, grupos novos, PMax, Display remarketing).
- **Métricas-chave no dia 14:** custo/conversão, termos de pesquisa reais, CTR por título do RSA, frase vs exata (qual traz lead mais barato).
