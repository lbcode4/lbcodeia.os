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
3. Rodar o motor:
   `python integracoes/meta-ads/scripts/reels.py --cliente "<Cliente>"`
4. Aplicar o **processo do agente** sobre o retorno:
   - **Padrões vencedores** — top 20% por engagement rate: tema, duração, formato, hook, horário em comum
   - **Padrões perdedores** — bottom 20%: o que evitar
   - **Análise de hook** — primeiros 3s dos campeões (pergunta / dado surpreendente / demonstração)
   - **Retenção** — Reels com retenção >50% = molde a seguir
5. **Camada framework (RETINA):** mapear cada padrão vencedor a um pilar RETINA — qual pilar ressoa
   com o público e alinha ao posicionamento. Descartar padrão que viraliza mas foge do diferencial.
6. **Gerar roteiro do próximo Reel** baseado nos padrões (não do zero — clonando o que funcionou):
   - Hook (0-3s) no estilo dos campeões
   - Desenvolvimento (problema → solução)
   - CTA final
   - Legenda + hashtags
7. Salvar análise + roteiro em `saidas/relatorios/reels-organico/<Cliente>/analise-<YYYY-MM-DD>.md` (criar dirs se não existirem).
8. Oferecer próximo passo:
   > "Quer que eu detalhe esse roteiro completo (direção de cena, trilha)? (chamo `/lb-conteudo-reels`)"

---

## Formato de saída (segue o agente)

```markdown
# Análise de Reels Orgânicos — [Cliente] — [data]
Período: últimos 90 dias | [N] Reels analisados

## 1. Ranking
| # | Reel | Eng. rate | Plays | Data |
|---|------|-----------|-------|------|

## 2. Padrões vencedores (top 20%)
- [o que os campeões têm em comum: tema, duração, hook, horário]

## 3. Padrões perdedores (evitar)
- [...]

## 4. Leitura RETINA
- [qual pilar ressoa + o que alinha ao posicionamento]

## 5. Roteiro do próximo Reel (data-driven)
**Hook (0-3s):** [...]
**Desenvolvimento:** [...]
**CTA:** [...]
**Legenda + hashtags:** [...]
```

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
