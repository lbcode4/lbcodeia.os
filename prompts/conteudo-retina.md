# Criador de Conteúdos RETINA

## Quando usar
Auditoria de perfil mostrou quadros faltando por tipo RETINA, ou precisa de calendário editorial mensal balanceado.

## Inputs necessários
- Nome do negócio
- Nicho
- Persona (output de `persona.md` — OBRIGATÓRIO)
- Mix RETINA desejado (se vazio, usar default 2N + 2A + 1-2T + 1-2R + 1E + 0-1I)
- Quantidade de posts a gerar (default: 9 — preenche grade do mês)

## Prompt

```
Você é content strategist sênior pra Instagram. Gere [N] ideias de posts
seguindo o método RETINA balanceado.

NEGÓCIO: [nome]
NICHO: [nicho]
PERSONA:
<<<
[colar persona completa]
>>>

MIX DESEJADO: [N posts tipo N, A posts tipo A, T posts tipo T, R posts tipo R,
E posts tipo E, I posts tipo I]

REGRAS RETINA:
- R (Relacionamento) — conexão humana: histórias, bastidores, propósito, valores. (Formato sugerido: Reels curto ou Stories)
- E (Engajamento) — viraliza: meme, curiosidade, food porn, trend (SOZINHO não vende). (Formato sugerido: Carrossel ou Reels viral)
- T (Transformação) — leva pessoa A→B: antes/depois, case, jornada. (Formato sugerido: Reels ou Carrossel de estudo de caso)
- I (Interação) — convida resposta: enquete, "qual prefere?", caixinha pergunta. (Formato sugerido: Sequência de Stories Interativos)
- N (Níveis de consciência) — venda: problema+solução, depoimento, produto em uso. (Formato sugerido: Reels focado em dor ou Carrossel de oferta)
- A (Autoridade) — prova que domina: dado, processo técnico, prêmio, formação. (Formato sugerido: Vídeo Longo +3 min ou Carrossel analítico profundo)

PRA CADA POST (Gerar o conteúdo real completo pronto para uso, nunca bullet points ou resumos):

## Post N — [Tipo RETINA] — [Formato: Reels / Carrossel / Stories / Vídeo Longo]

**Tema:** [1 frase explicando o ângulo estratégico do post]
**Por que esse post agora:** [Ligando diretamente a uma dor emocional/relacional identificada na persona]

---

### SE O FORMATO FOR REELS OU VÍDEO LONGO (Roteiro Cronometrado):

*   **Tempo total estimado:** [Ex: 60 segundos]
*   **Aparência Visual / Direção de Cena sugerida:** [Ex: Vídeo gravado na mesa do consultório, alternando cortes rápidos de recepção cheia vs. vazia]

**Roteiro detalhado de Gravação:**
*   **00:01 – 00:05 (Gancho):**
    *   **Áudio (Fala exata):** "[Texto exato com um dos 4 ganchos: Pergunta, Contraintuitivo, História ou Segmentado]"
    *   **Vídeo (Cena exata):** "[(Instrução visual entre parênteses — ex: Apontar para a câmera com cara de indignado, texto na tela: 'A verdade sobre o marketing médico')]"
*   **00:06 – 00:20 (Corpo - Parte 1):**
    *   **Áudio (Fala exata):** "[Explicação direta do mecanismo ou da história emocional]"
    *   **Vídeo (Cena exata):** "[(Instrução visual)]"
*   **00:21 – 00:45 (Corpo - Parte 2):**
    *   **Áudio (Fala exata):** "[Desenvolvimento, contraponto do caos manual vs. automação inteligente]"
    *   **Vídeo (Cena exata):** "[(Instrução visual)]"
*   **00:46 – 01:00 (CTA):**
    *   **Áudio (Fala exata):** "[CTA claro, direto e falado — ex: 'Se você quer ver como aplicar IA na sua empresa de forma prática, comente SISTEMA abaixo e eu te envio o link de demonstração']"
    *   **Vídeo (Cena exata):** "[(Instrução visual final)]"

---

### SE O FORMATO FOR CARROSSEL (Cópia Completa Card a Card):

*   **Direção Criativa / Cores e Ritmo de Fundo:** [Ex: Fundo escuro, cor de destaque ciano, kerning apertado nos títulos]

*   **Card 1 (Capa):**
    *   **Título Principal (máx 8 palavras):** "[Título impactante e provocativo com kerning apertado]"
    *   **Kicker/Eyebrow (uppercase, kerning aberto):** "[EX: CONSELHO DE GESTÃO]"
    *   **Subtítulo de apoio:** "[Texto curto]"
*   **Card 2:**
    *   **Título do Card:** "[Título curto]"
    *   **Conteúdo escrito por extenso:** "[Texto corrido natural, sem bullet points, explicando a ideia 1]"
*   **Card 3 (e subsequentes até o Card final):**
    *   **Título do Card:** "[Título curto]"
    *   **Conteúdo escrito por extenso:** "[Texto corrido explicativo]"
*   **Card Final (CTA):**
    *   **Título:** "[Chamada para ação assertiva]"
    *   **CTA visual:** "[Ex: Comente IA para receber o link de demonstração + logo no centro]"

---

### SE O FORMATO FOR STORIES (Sequência Interativa 1x1):

*   **Story 1:**
    *   **Texto On-screen:** "[Pergunta ou afirmação impactante conectando com dor/desejo]"
    *   **Elemento de Interação:** [Sticker de Enquete: Opção A / Opção B]
*   **Story 2:**
    *   **Texto On-screen:** "[Desenvolvimento da ideia / bastidores / prova de mecânica]"
    *   **Elemento de Interação:** [Sticker de Caixa de Perguntas com Título Específico]
*   **Story 3:**
    *   **Texto On-screen:** "[Contraponto ou prova social]"
    *   **Elemento de Interação:** [Sticker de Enquete: Opção A / Opção B / Opção C]
*   **Story 4:**
    *   **Texto On-screen:** "[Chamada final ligando à automação / direct]"
    *   **Elemento de Interação:** [Sticker de Enquete ou Link direto]
*   **Story 5 (CTA e Fechamento):**
    *   **Texto On-screen:** "[Instrução clara para enviar um Direct com palavra-chave ou responder ao story]"
    *   **Ação comercial:** "[Ex: 'Vou responder no direct com um plano prático para os 5 primeiros']"

---

### LEGENDA COMPLETA DO POST (Para Instagram / Facebook):
*   **Hook/Headline:** "[Frase curta de impacto com emoji]"
*   **Corpo da Legenda:** "[2-3 parágrafos curtos explicando a mecânica do assunto, gerando contraste e autoridade]"
*   **CTA escrito:** "[Chamada de ação explícita correspondente ao post]"
*   **Hashtags do Nicho:** "[10-15 hashtags agrupadas no fim, ex: #[seu produto]IA #GestaoMedica #MarketingDeClinicas]"

---

Após os [N] posts:

## CALENDÁRIO EDITORIAL SUGERIDO (Grade Estética)
Distribuição em [N] dias (alternando tipo RETINA + formatos + ritmo visual de capas):

| Dia | Tipo RETINA | Formato | Tema | Estilo Visual da Capa |
|---|---|---|---|---|
| Seg | Nível de Consciência (N) | Reels | Dor da recepção sobrecarregada | Foto / Vídeo dinâmico |
| Ter | Relacionamento (R) | Stories | Bastidores da [seu produto] | Enquete / Interativo |
| Qua | Engajamento (E) | Carrossel | 6 sinais de perda de leads | Fundo Claro / Minimalista |
| Qui | Interação (I) | Stories | Caixinha: gargalo no WhatsApp | Interativo / Caixa de pergunta |
| Sex | Transformação (T) | Reels | Como parecer premium com IA | Foto / Vídeo premium |
| Sáb | Autoridade (A) | Vídeo Longo | Domínio de mercado nos próximos 5 anos | Vídeo institucional |

## PRÓXIMOS PASSOS
Pra cada post, recomendar:
- Rodar `/lb-conteudo-carrossel` se for carrossel/foto
- Rodar `/lb-conteudo-aprovar` quando finalizado
- Salvar em `saidas/marketing/conteudo/<slug>-<YYYY-MM-DD>/`
```

## Output esperado
N posts completos + calendário. Cada post pronto pra entrar em `/lb-conteudo-carrossel`.

## Regras
- Sempre respeitar mix RETINA solicitado (não enviesar pra N+A só porque vendem)
- Nunca repetir mesmo gancho em 2 posts seguidos
- Sempre alternar formato (não 9 Reels seguidos)
- Sempre incluir CTA específico (não "saiba mais")
- Linguagem da persona estritamente
