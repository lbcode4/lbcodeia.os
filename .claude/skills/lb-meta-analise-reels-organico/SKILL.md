---
name: lb-meta-analise-reels-organico
description: >
  Analisa o desempenho ORGÂNICO dos Reels do Instagram (últimos 90 dias) via Graph API,
  identifica padrões vencedores e perdedores e devolve um roteiro data-driven pro próximo
  Reel — pronto pra detalhar em /lb-conteudo-reels. Resolve a conta em _memoria/contas-ads.md.
  Diferente de /lb-meta-analise-reels (que decide qual Reel impulsionar com verba paga):
  esta foca o orgânico e a criação do próximo conteúdo. Use quando o usuário pedir
  "analisar reels orgânicos", "o que funciona nos meus reels", "padrão de reel que viraliza",
  "próximo reel baseado em dados", "qual reel deu certo", ou /lb-meta-analise-reels-organico.
---

# /lb-meta-analise-reels-organico — Padrões de Reels orgânicos → próximo roteiro

"Não chuta o próximo Reel. Lê o que o teu público já premiou e repete o padrão."

Puxa dado real da Graph API → identifica o que viraliza no perfil → entrega roteiro pro próximo.

## Dependências
- **Cérebro/método:** `integracoes/meta-ads/agentes/agente-reels-organico.md` — OBRIGATÓRIO (processo de análise)
- **Motor:** `integracoes/meta-ads/scripts/reels.py` (puxa Reels live por performance)
- **Conta:** `_memoria/contas-ads.md` (resolve via --cliente)
- **Framework:** `_memoria/framework-trafego.md` (RETINA + 4 ganchos)
- **Contexto/voz:** `_memoria/empresa.md`, `estrategia.md`, `preferencias.md`
- **Credencial:** `integracoes/credentials/meta.env` (validar com `python integracoes/meta-ads/scripts/meta_api.py --test`)
- **Outputs:** `saidas/relatorios/reels-organico/<Cliente>/analise-<YYYY-MM-DD>.md`

---

## Diferença das skills vizinhas

| Skill | Foco | Saída |
|-------|------|-------|
| `/lb-conteudo-reels` | Criar roteiro do zero a partir de tema | 1 roteiro |
| **`/lb-meta-analise-reels-organico`** | **Ler performance orgânica → achar padrão → roteiro baseado em dados** | **análise + roteiro** |
| `/lb-meta-analise-reels` | Decidir qual Reel impulsionar com verba (pago) | ranking + candidatos a boost |

---

## Passos

1. Carregar contexto + voz de `_memoria/`. Ler o método em `agente-reels-organico.md`.
2. Identificar o cliente. Se não dito, listar os de `_memoria/contas-ads.md`.
3. Rodar o motor (90 dias por padrão):
   `python integracoes/meta-ads/scripts/reels.py --cliente "<Cliente>" --days 90`
   Retorna por Reel: `caption, timestamp, permalink, thumb, reach, likes, comments, shares, saves, watch, engagement_rate`.
   Repassar `thumb` (URL da capa) direto pro contrato — é o que renderiza a imagem real no painel.
4. **Classificar cada Reel** pela média de engagement rate do período:
   - **TOP** — melhor Reel (maior eng rate)
   - **ALTO** — eng rate > média + 20%
   - **MÉDIO** — dentro de ±20% da média
   - **BAIXO** — eng rate < média − 30%
   Ordenar por eng rate desc (o motor já ordena). Derivar `titulo` curto da caption, `data` em DD/MM/AA do timestamp.
5. **Insight por Reel** — 1 parágrafo conectando métricas a causa (alcance, saves=intenção de compra,
   shares=viral, watch=retenção). Definir `insightTone`: `success` (campeão/aprende com), `info` (neutro/teste),
   `warning` (sinal de alerta), `error` (pior do período).
6. Aplicar o **processo do agente** → **padrões**:
   - **padroesVencedores** (top 20%): tema, duração, formato, hook, horário em comum → cada item `{titulo, desc}`
   - **padroesPerdedores** (bottom 20%): o que evitar → cada item `{titulo, desc}`
   - **Camada RETINA:** mapear cada padrão vencedor a um pilar; descartar o que viraliza mas foge do posicionamento.
     Resumir em `leituraRetina`.
7. **Impulsionamento** (`impulsionar`) — escolher os Reels que valem verba, priorizados:
   - `prioridade` (P1 investir agora / P2 segunda onda / P3 monitorar), `reelRank` (rank no array),
     `desc` (justificativa com métricas), `publico`, `objetivo`, `orcamento` (R$/dia × dias), `duracao`.
   - `naoImpulsionar`: Reels que NÃO valem verba + `motivo`.
8. **3 novos roteiros** (`roteiros`) clonando os padrões vencedores — cada um com
   `n, titulo, tema, formato, duracao, gancho, estrutura[], cta, porque, copy[], tags[]`.
9. **Alertas e próximos passos** (`alertas`): pontos fortes, riscos (ex: gap de publicação), próximos passos →
   cada item `{tipo, titulo, desc}`.
10. Salvar cópia em markdown em `saidas/relatorios/reels-organico/<Cliente>/analise-<YYYY-MM-DD>.md`
    (criar dirs se não existirem) e emitir o **bloco JSON do contrato** (a tela `/organico-instagram` consome).

> **Saída para a tela:** o runner injeta o `outputContract`. Preencher TODOS os campos do contrato no bloco
> ```json final. `reels[].rank` é 1-based; `impulsionar[].reelRank` referencia esse rank.

---

## Erros
- Token faltando → conferir `integracoes/credentials/meta.env` e rodar `python integracoes/meta-ads/scripts/meta_api.py --test`.
- Cliente não achado → listar disponíveis de `_memoria/contas-ads.md`.
- Sem Reels suficientes (< 5 nos 90 dias) → avisar que a amostra é fraca; usar `/lb-conteudo-reels` do zero.
- NUNCA exibir o token em resposta/log.

---

## Regras
- **Roteiro nasce do dado, não do achismo** — esta skill clona padrão comprovado do próprio perfil
- **RETINA filtra** — padrão que viraliza fora do posicionamento não entra no roteiro
- **Orgânico ≠ pago** — decisão de verba é `/lb-meta-analise-reels`; aqui é criação orgânica
