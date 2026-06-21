# saidas/ — raiz única de tudo gerado/consumido pelo LBCode.IA

Antes existiam 3 pastas soltas na raiz (`marketing/`, `dados/`, `saidas/`).
Agora é só `saidas/`, com subpastas que deixam claro o papel de cada coisa.

## Subpastas

- **`saidas/entrada/`** — drop zone. Solte aqui CSV de export, planilha, PDF,
  print — qualquer arquivo que você quer que o Claude leia uma vez. Só o
  `README.md` dessa pasta é versionado; o resto é local.
- **`saidas/marketing/`** — histórico vivo do trabalho de marketing: conteúdo
  (carrosséis, reels, stories, calendário), campanhas, prospecção, GBP, SEO,
  auditorias, sites. Acumula com o tempo, não é "coisa pontual".
- **`saidas/relatorios/`** — relatórios e dashboards gerados (Meta/Google Ads,
  análises de Reels). Organizado por cliente.
- **`saidas/cache/`** — cache interno dos resultados de skills, usado pelo
  dashboard (`server/src/runner.ts`) pra não reprocessar. Não versionado,
  não é pra navegar manualmente.
- **Solto na raiz de `saidas/`** — documentos pontuais que não cabem em
  nenhuma das categorias acima: planos mensais (`plano-<YYYY-MM>.md`),
  propostas, precificações, emails rascunhados.

Skills sabem onde salvar — você não precisa criar subpasta manualmente.

## Por que `marketing/` e `cache/` não vão pro Git?

`saidas/marketing/` guarda dado real de cliente (leads, dossiês, campanhas) —
fica de fora do versionamento por padrão (ver `.gitignore`). `saidas/cache/`
é só estado regenerável, sem valor histórico. `saidas/relatorios/`,
`saidas/entrada/README.md` e os documentos soltos na raiz são versionados.
