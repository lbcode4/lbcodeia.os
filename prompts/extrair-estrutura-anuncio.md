# Extrator de Estrutura de Anúncio

## Quando usar
Recebeu anúncio campeão (texto de Biblioteca de Anúncios Meta, transcrição de vídeo IG, ou screenshot) → quer extrair framework/roteiro replicável pra adaptar ao próprio negócio.

## Inputs necessários
- Texto/transcrição/print do anúncio-referência
- Nicho do anúncio (se diferente do seu)
- Plataforma de origem (IG Reels, Stories, Feed, FB)

## Prompt

```
Você é especialista em copywriting de anúncios pagos. Vou te passar um anúncio
campeão (alto investimento + tempo no ar). Sua tarefa: extrair a ESTRUTURA
abstrata, não o conteúdo específico, pra eu poder replicar adaptando ao meu
negócio.

ANÚNCIO-REFERÊNCIA:
<<<
[colar texto/transcrição completa]
>>>

NICHO ORIGINAL: [ex.: empresa estética em SP]
PLATAFORMA: [ex.: Instagram Reels]

Devolva nessa estrutura:

## 1. GANCHO
- TIPO: pergunta / contraintuitivo / história / segmentado
- ESTRUTURA ABSTRATA: [reescrever o gancho substituindo termos específicos
  por placeholders entre colchetes]
- POR QUE FUNCIONA: [1-2 frases sobre o gatilho mental]

## 2. CORPO
- ESTRUTURA DAS FRASES (em ordem):
  1. [frase tipo X]
  2. [frase tipo Y]
  ...
- ELEMENTOS-CHAVE: [dados, prova social, mecanismo, urgência, etc.]
- CADÊNCIA: [ritmo curto/longo, alternância de frase, uso de listas]

## 3. CTA
- AÇÃO ESPECÍFICA: [comente X / clica no link / chama no WhatsApp]
- POSICIONAMENTO: [final / repetido no meio + final / com microcompromisso]

## 4. ELEMENTOS VISUAIS (se vídeo/imagem descrita)
- ABERTURA: [primeiros 3 segundos]
- TEXTO ON-SCREEN: [pattern de legenda]
- TROCAS DE CENA / RITMO: [se aplicável]

## 5. TEMPLATE PRONTO PRA ADAPTAR

Cole esse template no seu negócio:

"[GANCHO no formato extraído com placeholders]
[CORPO frase 1]
[CORPO frase 2]
...
[CTA]"

Preencha cada placeholder com info do SEU nicho.

## 6. ADAPTAÇÃO PRO NEGÓCIO X (opcional)

Se eu te dizer meu nicho/produto, gere variação aplicada.
```

## Output esperado
Markdown com 6 seções (1-6). Seção 5 é o que vai pro próximo passo (rodar `roteiro-anuncio.md` adaptando).

## Regra
Nunca aceitar o anúncio cru como saída. Extrair SEMPRE a estrutura abstrata antes — caso contrário, sistema gera plágio de baixa qualidade.
