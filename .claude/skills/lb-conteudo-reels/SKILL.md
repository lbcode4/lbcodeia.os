---
name: lb-conteudo-reels
description: >
  Cria roteiro completo para Reels com gancho nos 3 primeiros segundos, desenvolvimento,
  CTA — com direção de cena, legenda e sugestão de trilha sonora.
  Baseado no framework RETINA e método dos 4 tipos de gancho.
  Use quando o usuário pedir "roteiro de reels", "script de vídeo", "reel", "vídeo curto",
  "vídeo pro instagram", "roteiro pra gravar", ou /lb-conteudo-reels.
---

# /lb-conteudo-reels — Roteiro completo para Reels

"Gancho nos 3 primeiros segundos ou o algoritmo te abandona."

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO (RETINA + 4 ganchos)
- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Outputs:** `marketing/conteudo/reels-<tema>-<YYYY-MM-DD>/roteiro.md`

---

## Pilares RETINA para Reels

Identificar o pilar antes de criar — ele define o ângulo de todo o roteiro:

| Pilar | O que é | Exemplo [seu produto] |
|-------|---------|---------------------|
| **R** Resultado | Antes/depois, transformação | "Empresa saiu de 60% pra 90% de ocupação" |
| **E** Educação | Ensinar algo útil | "Por que sua agenda tem horário vazio às 14h" |
| **T** Tendência | Onda do momento | "Por que empresas estão adotando IA em 2025" |
| **I** Inspiração | Motivacional + crença | "O que separa empresa de 100k de empresa de 10k" |
| **N** Novidade | Lançamento, update, feature | "Novo: agente agenda enquanto você dorme" |
| **A** Autenticidade | Bastidores, processo real | "Como é um dia rodando IA na empresa" |

## Os 4 tipos de gancho (primeiros 3 segundos)

Escolher 1 pra cada reel — nunca misturar:

1. **Polêmica:** "Você está perdendo dinheiro sem saber" / "Isso que sua empresa faz está errado"
2. **Promessa:** "Em 60 segundos vou mostrar como [resultado concreto e específico]"
3. **Curiosidade:** "O que acontece quando você responde lead em 5 minutos vs 5 horas"
4. **Identificação:** "Você tem empresa e sua agenda ainda tem espaço às 14h de quinta?"

---

## Workflow

### Passo 1 — Definir parâmetros

Pedir ao usuário (ou inferir do contexto):
1. **Tema/assunto** — o que quer comunicar
2. **Pilar RETINA** — sugerir o mais adequado se não informado
3. **Duração alvo** — 15s / 30s / 60s / 90s
4. **Formato de gravação:**
   - **Talking head:** pessoa fala direto pra câmera → roteiro com fala
   - **Narração off:** voz em off + texto na tela → roteiro com legendas e visuais

### Passo 2 — Gerar roteiro

**Estrutura do arquivo:**

```markdown
# Roteiro Reel — [Tema]
**Pilar RETINA:** [letra] — [nome]
**Duração:** [X]s
**Formato:** [talking head / narração off]
**Tipo de gancho:** [polêmica / promessa / curiosidade / identificação]

---

## GANCHO (0-3s)
**Texto na tela:** [frase de impacto — máximo 7 palavras, TODAS EM MAIÚSCULAS]
**Fala:** "[o que dizer]" — ou "sem fala (só texto)" se for texto puro
**Ação:** [ex: "olhar direto pra câmera", "mostrar número grande na tela", "corte seco"]

---

## DESENVOLVIMENTO

**Bloco 1 ([4-X]s):**
- Fala: "[...]"
- Tela: [o que mostrar — ex: texto, gráfico, tela do produto, clipe]
- Ação: [movimento, corte, zoom, transição]

**Bloco 2 ([X-X]s):**
- Fala: "[...]"
- Tela: [...]
- Ação: [...]

[adicionar blocos conforme duração]

---

## CTA ([últimos 5-8]s)
**Fala:** "[...]"
**Tela:** [ex: "Comenta QUERO" / "Link na bio" / "Me chama no WhatsApp"]
**Ação:** [ex: "apontar pro comentário", "mostrar link", "olhar pro canto inferior"]

---

## Direção técnica
- **Trilha sugerida:** [mood e estilo — ex: "techno leve, urgente, sem letra", "lo-fi calmo"]
- **Ritmo de corte:** [rápido / médio / lento]
- **Texto na tela:** [sempre / só no gancho / opcional]

## Publicação
- **Legenda:** [texto completo da legenda — inclui gancho, desenvolvimento resumido, CTA e hashtags]
- **Hashtags:** [5-8 hashtags — mix de nicho + produto]
- **Melhor horário:** [benchmark IG — ex: "terça a quinta, 18h-20h"]
```

### Passo 3 — Salvar

```
marketing/conteudo/reels-<tema>-<YYYY-MM-DD>/roteiro.md
```

### Passo 4 — Próximo passo sugerido

Sempre oferecer:
> "Quer adicionar esse reel ao calendário de conteúdo? (chamo `/lb-conteudo-calendario`)"
> "Quer criar uma sequência de stories complementar? (chamo `/lb-conteudo-stories`)"

---

## Referência de duração

| Duração | Estrutura |
|---------|-----------|
| 15s | Gancho (3s) + 1 bloco (7s) + CTA (5s) |
| 30s | Gancho (3s) + 2 blocos (20s) + CTA (7s) |
| 60s | Gancho (3s) + 3-4 blocos (47s) + CTA (10s) |
| 90s | Gancho (3s) + 5-6 blocos (77s) + CTA (10s) |

---

## Regras

- **Gancho nos primeiros 3 segundos** — não existe exceção; sem gancho = sem visualizações
- **1 ideia por reel** — tentar contar tudo = não contar nada
- **CTA único e claro** — nunca dois CTAs no mesmo vídeo
- **Direção de cena obrigatória** — roteiro sem direção é inútil pra quem vai gravar
- **Adaptar pro formato** — talking head e narração off têm estruturas diferentes
- **RETINA define o ângulo** — todo reel serve a um pilar; sem pilar = conteúdo sem estratégia
- **Legenda com gancho** — primeiras 2 linhas da legenda repetem o gancho do vídeo
