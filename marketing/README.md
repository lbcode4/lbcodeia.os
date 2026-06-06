# marketing/ — saídas do LBCode.IA

Tudo que as skills de marketing produzem cai aqui. Skills do LBCode.IA já sabem onde salvar — você raramente precisa criar pasta manualmente.

## Estrutura padrão

```
marketing/
├── conteudo/                    saídas das skills de conteúdo
│   ├── calendario/              /lb-conteudo-calendario
│   ├── carrossel/               /lb-conteudo-carrossel (<tema>-<YYYY-MM-DD>/)
│   ├── reels/                   /lb-conteudo-reels
│   └── stories/                 /lb-conteudo-stories
│
├── google-seo/                  saídas do /lb-google-seo (8 passos, arquivos 01–08)
│
├── gbp/                         saídas do /lb-google-meu-negocio (<YYYY-MM-DD>/)
│
├── campanhas/                   saídas das campanhas Meta, por objetivo
│   ├── conversao/               ex: WhatsApp (/lb-meta-campanha-whatsapp)
│   ├── engajamento/
│   ├── reconhecimento/
│   └── trafego/
│
├── sites/                       saídas do /lb-negocio-site (<tipo>-<nome>-<YYYY-MM-DD>/)
│
├── prospeccao/                  saídas do /lb-venda-prospectar (<nicho>-<YYYY-MM-DD>/)
│
├── auditoria-ig/                saídas do /lb-conteudo-auditoria-insta
└── auditorias/                  auditorias Meta Ads (/lb-meta-auditoria)
```

## Como funciona

- **`/lb-conteudo-*`** → cria pasta em `conteudo/<formato>/<tema>-<data>/`
- **`/lb-google-seo`** → preenche os 8 arquivos numerados em `google-seo/`
- **`/lb-google-meu-negocio`** → cria pasta datada em `gbp/`
- **`/lb-meta-campanha-*`** → cria pasta em `campanhas/<objetivo>/`
- **`/lb-negocio-site`** → cria pasta em `sites/<tipo>-<nome>-<data>/`
- **`/lb-venda-prospectar`** → cria pasta em `prospeccao/<nicho>-<data>/`
- **CSVs do `/lb-google-ads`** e relatórios do `/lb-meta-relatorio` ficam em `integracoes/.../output/` ou na pasta da campanha correspondente

## Versionamento

Tudo aqui versiona no git pelo `/lb-sistema-salvar`. Útil pra comparar evolução de SEO entre meses, rever copies antigas, ou recuperar peça depois de mexer no Insta.
