# marketing/ — saídas do LBCode.IA

Tudo que as skills de marketing produzem cai aqui. Skills do LBCode.IA já sabem onde salvar — você raramente precisa criar pasta manualmente.

## Estrutura padrão

```
marketing/
├── conteudo/                    saídas do /conteudo-carrossel e /conteudo-publicar
│   └── <tipo>-<tema>-<YYYY-MM-DD>/
│       ├── carrossel.html
│       ├── render.js
│       ├── instagram/slide-XX.png
│       ├── legenda.md
│       └── legenda-linkedin.md
│
├── seo/                         saídas do /google-seo (8 passos)
│   ├── 01-pesquisa-demanda.md
│   ├── 02-analise-concorrencia.md
│   ├── 03-google-meu-negocio.md
│   ├── 04-otimizacao-on-page.md
│   ├── 05-estrategia-conteudo.md
│   ├── 06-google-ads.md
│   ├── 07-checklist-monitoramento.md
│   └── 08-geo-otimizacao-ia.md
│
├── campanhas/                   saídas do /google-ads e /meta-relatorio
│   ├── google-ads-<YYYY-MM-DD>/  CSVs prontos pra importar
│   └── relatorios/               relatórios semanais
│
└── avaliacoes-google/           histórico do /google-avaliacoes (opcional)
```

## Como funciona

- **`/conteudo-carrossel` ou `/conteudo-publicar`** → cria pasta em `conteudo/<tipo>-<tema>-<data>/`
- **`/google-seo`** → preenche os 8 arquivos numerados em `seo/`
- **`/google-ads`** → cria pasta em `campanhas/google-ads-<data>/` com CSVs
- **`/meta-relatorio`** → cria arquivo em `campanhas/relatorios/<data>-relatorio.md`
- **`/google-avaliacoes`** → opcionalmente salva histórico em `avaliacoes-google/`

## Versionamento

Tudo aqui versiona no git pelo `/sistema-salvar`. Útil pra comparar evolução de SEO entre meses, rever copies antigas, ou recuperar peça depois de mexer no Insta.
