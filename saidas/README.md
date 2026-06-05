# saidas/ — outputs gerais do LBCode.IA

Pasta pra qualquer output que não é marketing puro (não cabe em `marketing/`).

## O que vai aqui

- **Análises** de `/lb-negocio-analisar-dados` — resumos executivos de CSV/XLSX/PDF
- **Emails** rascunhados por `/lb-venda-email`
- **Relatórios diversos** que não são de ads
- **Documentos** que skills geram e você precisa enviar/imprimir/anexar

## Estrutura sugerida

```
saidas/
├── analises/        relatórios de /lb-negocio-analisar-dados
├── emails/          rascunhos de /lb-venda-email
└── outros/          qualquer coisa solta
```

Skills sabem onde salvar — você não precisa criar subpasta manualmente. Se uma skill perguntar onde salvar, vai propor aqui.

## Por que separar de `marketing/`?

`marketing/` é histórico vivo do trabalho de marketing — peças, campanhas, SEO acumulado.

`saidas/` é "coisa pontual gerada hoje" — relatório que você manda pro cliente e nunca mais olha, rascunho de email que copia e cola no Gmail.

A divisão importa pra `/lb-sistema-salvar` (commit) e pra clareza ao navegar a pasta.
