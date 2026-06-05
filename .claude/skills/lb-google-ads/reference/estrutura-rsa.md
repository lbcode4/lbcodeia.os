# Passos 3-4 — Estrutura de campanha (OPA-1) + RSAs (OPA-A)

## Passo 3 — OPA-1: Estrutura de campanha (Objetivo)

**Padrão recomendado pra B2B local:**

```
Campanha 1: <Negócio> — Search Geral
├── Grupo: <Cluster 1>
│   ├── 10-15 keywords (mix de exata, frase, ampla modificada)
│   ├── 3 RSAs (15 headlines + 4 descriptions cada)
│   └── 10-15 keywords negativas no grupo
├── Grupo: <Cluster 2>
│   └── ...
└── ... (1 grupo por cluster do Passo 2)

Campanha 2: <Negócio> — Local (opcional)
├── Anúncios pra Google Maps
└── Segmentação por proximidade

Lista de negativas globais: termos genéricos descartados, marcas concorrentes
```

**Negativas obrigatórias:**
- Termos genéricos: gratis, gratuito, download, curso, faculdade, emprego, vaga, sintomas, tratamento, wikipedia, reclame aqui, como fazer, como criar
- Termos B2C se o produto é B2B: termos de consumidor final fora da intenção B2B (ex.: gratuito, popular, "perto de mim")
- Dev/técnico se relevante: open source, python, api, github, tutorial
- **Marcas de concorrentes diretos** (buscar em `_memoria/empresa.md` + WebSearch "concorrentes de [produto]") — protege budget de cliques em busca de marca rival

## Passo 4 — OPA-A: Anúncio (Copies RSAs)

**Quantos RSAs por grupo:**
- **Orçamento ≤ R$50/dia → 1 RSA por grupo.** A R$30/dia, 3 RSAs dividem impressões e atrasam o aprendizado do Google. O Google já rotaciona os 15 títulos × 4 descrições dentro de 1 RSA. Adicionar 2º RSA após 30 dias com dados.
- **Orçamento > R$50/dia → 2-3 RSAs por grupo.**

Pra cada grupo, gerar RSAs (Responsive Search Ads):

**15 headlines** por anúncio:
- 5 com keyword principal
- 3 com diferenciais concretos (certificações, prazo, garantia)
- 3 com CTA ("Solicite cotação", "Peça pelo WhatsApp", "Fale agora")
- 2 com prova social (anos no mercado, número de clientes)
- 2 com proposta de valor genérica

**4 descriptions** (90 caracteres cada):
- 1 institucional + CTA
- 1 com diferencial técnico + CTA
- 1 com urgência/escassez (se aplicável)
- 1 com prova social + CTA

**Restrições do Google:**
- Headline: 30 caracteres
- Description: 90 caracteres
- Sem emojis, sem caps lock, sem repetição de palavras
- Sem afirmações superlativas não-comprovadas ("o melhor", "número 1") sem fonte

Seguir `_memoria/preferencias.md` pra tom.
