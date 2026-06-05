# Identidade Visual — LBCode.IA

> Marca de quem executa tecnologia. Futurista, técnica, autoridade.
> Skills de conteúdo, carrossel, post e campanhas leem esse arquivo antes de criar qualquer visual.

---

## Filosofia da marca

LBCode.IA é tecnologia de ponta com IA. Visual **dark tech / neon** — fundo escuro,
gradiente roxo→ciano, motivos de circuito e hexágono. Transmite inovação, automação,
autoridade técnica. Não é minimalista nem agência criativa colorida — é **estética de
produto de IA**.

Status da identidade: **CONSOLIDADA** (carrosséis e logo já produzidos nesse padrão).

---

## Cores

### Paleta principal
- **Fundo:** `#07070F` → `#0A0A18` (preto-azulado quase puro; pode ter leve glow roxo nas bordas)
- **Roxo neon (primária):** `#A24BFF` (destaque, headlines parciais, ícones)
- **Ciano neon (secundária):** `#29C5FF` (destaque alternado, CTAs, contornos)
- **Gradiente assinatura:** roxo→ciano diagonal (`#A24BFF` → `#29C5FF`) — em headlines, bordas neon, setas, molduras
- **Texto principal:** `#FFFFFF` (branco puro, bold)
- **Texto secundário/body:** `#C9C9D6` (cinza-claro, legível sobre fundo dark)

### Restrições
- **Sempre fundo escuro** — nunca fundo branco/claro em peça de marca
- **Gradiente roxo→ciano é a assinatura** — usar em destaques, não no texto corrido todo
- **Glow/neon** nas molduras e ícones (efeito de brilho), não em excesso no texto
- Evitar: laranja, verde-claro, paletas pastel, fundo claro

---

## Tipografia

### Títulos e destaques
- **Fonte:** Sans-serif geométrico pesado (`Poppins`, `Montserrat`, `Inter`; fallback `Arial`)
- **Peso:** 700-800 (bold/extrabold)
- **Cor:** branco, com palavra-chave em gradiente roxo→ciano ou roxo sólido
- **Tamanho:** título 48-72px (carrossel 1080), letter-spacing -0.5px, line-height 1.1

### Corpo, subtítulos
- **Fonte:** mesma sans-serif, peso 400-500
- **Cor:** `#C9C9D6`
- **Tamanho:** 24-32px (carrossel), line-height 1.4

### CTA (botões)
- **Estilo:** pílula/retângulo com borda ou fundo gradiente roxo→ciano, glow
- **Texto:** branco bold

---

## Elementos

### Estrutura de post/carrossel (1080×1350 ou 1080×1080)
- **Fundo:** dark `#07070F` com textura de circuito/hexágono sutil + glow
- **Moldura neon:** retângulo arredondado com borda gradiente roxo→ciano e brilho
- **Ícones:** line icons dentro de hexágonos, contorno neon roxo/ciano
- **Labels topo:** uppercase, letter-spacing alto (ex: "SERVIÇOS", "O PROBLEMA REAL", "SOBRE NÓS")
- **Pedestal/glow:** elementos centrais sobre base com anel de luz radial

### Motivos recorrentes
- Circuito (PCB traces) saindo dos cards
- Hexágonos como containers de ícone
- Partículas/pontos de luz
- Setas de ciclo (ex: slide "Ciclo de Crescimento")

### Logo
- Monograma **LB** com `</>` (bracket de código) entre as letras
- Wordmark: **CODE.IA** + "SOLUÇÕES DIGITAIS" + seta `>_`
- Versão em gradiente roxo→ciano sobre fundo dark

---

## Acessibilidade
- Contraste branco sobre `#07070F` = altíssimo (OK)
- Texto em imagem: mínimo 24px, weight 600+
- Não usar só cor como informação (ícone + cor)

---

## Galeria de referência

Peças já produzidas no padrão consolidado. Skill visual deve **olhar essas antes de gerar**
— são a fonte de verdade do que "está no brand". Cada uma fixa um padrão reutilizável.

### Convenção de nome

Todo arquivo de referência segue **`ref-<formato>-<conceito>.png`** — minúsculo, kebab-case, sem espaço/acento.
- `<formato>`: `post` (1:1), `slide` (4:5), `card`, `logo`
- `<conceito>`: o tema/layout (`servico`, `problema`, `ciclo`, `pilares`, `cerebro`…)

Exemplos: `ref-post-servico.png`, `ref-slide-ciclo.png`. Ordena junto, auto-documenta, sem nome opaco tipo `1.png` ou `ChatGPT Image....png`.

**Auto-rename:** se cair imagem nova em `identidade/` com nome fora do padrão (`1.png`, `ChatGPT Image....png`, `WhatsApp....jpg`), a **skill visual renomeia** — lê a imagem, classifica formato+conceito, aplica `ref-<formato>-<conceito>.png` (via `git mv`, preserva histórico) e adiciona linha na tabela abaixo. `logo.png` é exceção (asset oficial, não-ref).

| Peça | Formato | Padrão que ensina |
|------|---------|-------------------|
| [logo.png](logo.png) | Logo | Monograma **LB** com `</>` + wordmark CODE.IA / "SOLUÇÕES DIGITAIS" + seta `>_`, gradiente roxo→ciano sobre dark. Versão oficial — não recriar. |
| [ref-post-servico.png](ref-post-servico.png) | Post 1:1 | **Ouro do post de serviço:** moldura neon retangular, ícone line dentro do card, headline 2 linhas (1ª branca / 2ª gradiente), 4 bullets com ícone hexágono, pedestal de luz radial na base, circuito + hexágonos no fundo. |
| [ref-post-cerebro.png](ref-post-cerebro.png) | Post 1:1 | Label uppercase topo ("SERVIÇOS"), headline com **palavra-chave em gradiente**, sub em cinza, arte central de circuito (cérebro), dots de paginação, logo canto. |
| [ref-card-servico.png](ref-card-servico.png) | Card 1:1 | Card de serviço quadrado: moldura neon arredondada, ícone hexágono, título bold + bullets com dot neon, fundo hexágono sutil. |
| [ref-slide-problema.png](ref-slide-problema.png) | Slide 4:5 | **Grid 2×2 de dores:** label topo, headline com trecho em gradiente, 4 cards (título + dado em roxo + corpo cinza), chips de logo (OpenAI/Gemini). Layout pro slide "problema". |
| [ref-slide-ciclo.png](ref-slide-ciclo.png) | Infográfico 4:5 | **Ciclo:** 4 cards nos cantos ligados por anel de setas neon, núcleo central com glow + ícone cérebro, linha de reforço embaixo. Padrão de slide-conceito. |
| [ref-slide-pilares.png](ref-slide-pilares.png) | Slide 1:1 | **Grid 2×2 de pilares:** 4 cards com ícone hexágono + título 2 linhas, circuito/cérebro saindo da borda esquerda, logo canto. |

**Regra:** novo visual deve casar com pelo menos uma dessas referências em estrutura (moldura neon, label topo, headline gradiente, ícone hexágono, pedestal de luz). Fugir do padrão = fora do brand.

---

## Quando evoluir

Se a marca mudar:
1. Edita esse arquivo com as cores/tipografia novas
2. Skills carregam automaticamente na próxima execução
3. Documentação fica versionada

Linha adicionada: data + mudança.
- `[2026-06-03] /lb-sistema-instalar — reescrito do template laranja/minimalista pro brand real dark + neon roxo→ciano (carrosséis @lbcode.ia)`
- `[2026-06-05] Galeria de referência — 7 peças produzidas catalogadas com o padrão que cada uma fixa; skill visual consulta antes de gerar`
- `[2026-06-05] Convenção ref-<formato>-<conceito>.png + auto-rename de imagem solta pela skill visual; arquivos antigos (1.png, ChatGPT...) renomeados`
