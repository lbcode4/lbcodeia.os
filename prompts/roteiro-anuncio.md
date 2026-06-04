# Criador de Roteiros de Anúncios

## Quando usar
Persona já montada + (opcional) estrutura extraída de campeão → gerar 5-10 variações de anúncio (Gancho + Corpo + CTA) prontas pra subir.

## Inputs necessários
- Persona detalhada (output de `persona.md`)
- O que anuncia (produto/serviço)
- Destino do clique (WhatsApp / link bio / landing X)
- Ação desejada (mensagem / compra / cadastro / demo)
- Estrutura extraída (output de `extrair-estrutura-anuncio.md`) — OPCIONAL mas recomendado
- Plataforma (Meta Reels / Meta Feed / Google Search RSA)

## Prompt

```
Você é copywriter sênior de anúncios pagos com 200+ anúncios de alta
performance no portfólio. Gere 5 variações de anúncio pro contexto:

PERSONA:
<<<
[colar persona]
>>>

O QUE ANUNCIO: [descrição]
DESTINO DO CLIQUE: [WhatsApp / landing X / link bio]
AÇÃO DESEJADA: [mandar mensagem / agendar demo / comprar / cadastrar]
PLATAFORMA: [Meta Reels / Meta Feed / Google Search RSA / Stories]

ESTRUTURA EXTRAÍDA DE CAMPEÃO (se houver):
<<<
[colar template se rodou extrair-estrutura-anuncio.md]
>>>

REGRAS:
1. Sempre seguir GCC (Gancho + Corpo + CTA)
2. Gancho em 1 dos 4 tipos: pergunta / contraintuitivo / história / segmentado
3. Variar tipo de gancho entre as 5 variações (não usar mesmo tipo 2x)
4. Corpo: explicar MECÂNICA de funcionamento da automação ou processo, não apenas promessas vazias.
5. CTA único, claro e alinhado ao destino final do lead.
6. Sempre detalhar a **Direção de Cena (Visual/Áudio)**: como deve ser o plano de câmera, cortes, som e elementos na tela.
7. Linguagem da persona: use os medos profundos, ganchos emocionais (Blair Warren) e o próprio vocabulário mapeado no estudo de persona.
8. Sem jargão de marketing ou superlativos vazios ("o melhor", "líder de mercado").
9. Adaptar ao formato da plataforma:
   - Meta Reels: gancho visual/falado em ≤3s, frases curtas, CTA falado
   - Meta Feed: texto principal 90-150 chars, headline forte e explicativa
   - Google RSA: 15 headlines (30 chars max) + 4 descriptions (90 chars max)
   - Stories: gancho visual imediato + texto curto + CTA interativo/direct

Gere assim:

## VARIAÇÃO 1 — [tipo de gancho]
*   **Gancho falado/escrito:** "[Texto do Gancho em destaque]"
*   **Direção de Cena (Visual/Áudio):** "[(Instrução visual exata de gravação, cortes, expressões faciais, imagens de fundo e efeitos de áudio sugeridos)]"
*   **Texto principal / Corpo do Anúncio:** [...]
*   **Headline (se Meta):** [...]
*   **Texto on-screen (Legendas em tela):** [...]
*   **CTA falado e escrito:** [...]
*   **Por que funciona:** [Qual dor emocional/relacional da persona ou gatilho Blair Warren esse anúncio aciona]
*   **Mensagem inicial WhatsApp** (se destino = WhatsApp): "[texto de boas-vindas pré-configurado que identifica a origem do anúncio]"

## VARIAÇÃO 2 — [tipo diferente]
...

## VARIAÇÃO 5
...

## RECOMENDAÇÃO DE TESTE
- Subir as 5 simultaneamente
- Meta otimiza pra vencedor em 3-7 dias
- Pausar abaixo de [definir métrica: CTR < X% / CPM > Y / CPA > Z]
- Vencedor: iterar mais 5 variações DO MESMO TIPO de gancho
```

## Output esperado
5 variações completas. Cada uma pronta pra colar em Gerenciador Meta ou CSV Google Ads.

## Regras
- Nunca aceitar resposta genérica — exigir referência ao vocabulário da persona
- Se gerar 5 ganchos do mesmo tipo, recusar e regenerar
- Sempre validar contagem de caracteres pra plataforma (Google RSA tem limite duro)
- Sempre incluir mensagem inicial WhatsApp se destino = WhatsApp (rastreio)
