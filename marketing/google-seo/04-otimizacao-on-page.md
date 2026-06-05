# Passo 4 — Otimização On-Page
**Negócio:** LBCode.IA | **Site:** https://oferta-lbcodeia.lovable.app | **Data:** 2026-06-04

---

## Situação Atual do Site

| Item | Status | Prioridade |
|------|--------|------------|
| Meta title | ❌ Ausente | CRÍTICO |
| Meta description | ❌ Ausente | CRÍTICO |
| Schema LocalBusiness | ❌ Ausente | CRÍTICO |
| H1 otimizado | ⚠️ Genérico ("Sistema sob demanda para sua empresa automatizar processos") | Alta |
| Blog | ❌ Ausente | Alta |
| Sitemap.xml | ❓ Desconhecido (verificar) | Média |
| Mobile-friendly | ✅ (Lovable gera responsivo) | OK |
| Velocidade | ❓ Verificar no PageSpeed Insights | Média |

---

## Meta Tags Otimizadas

### Página Principal (/)

**Title (54 chars):**
```
Software Sob Medida em Santarém PA | LBCode.IA
```

**Meta Description (158 chars):**
```
Software sob medida pra PMEs em Santarém. Código 100% seu, entrega em 7-14 dias com IA. Diagnóstico gratuito de 15 min. ROI em 2-3 meses.
```

### Página de Planos / Preços

**Title (58 chars):**
```
Preços de Software Sob Medida em Santarém | LBCode.IA
```

**Meta Description (155 chars):**
```
MVP Light a partir de R$3.000. PME Pro R$8-15k. Software sob medida pra sua empresa em Santarém. Entrega garantida em 2-5 semanas.
```

---

## H1/H2 Sugeridos (página principal)

**H1 atual:** "Sistema sob demanda para sua empresa automatizar processos"

**H1 sugerido:**
```
Software Sob Medida para Empresas em Santarém, PA
```

**H2s sugeridos (substituir os atuais genéricos):**
- "Por que empresas em Santarém perdem dinheiro com processos manuais?"
- "Software sob medida: código 100% seu, entregue em 7-14 dias"
- "Para quais empresas de Santarém é indicado?"
- "Funcionalidades desenvolvidas sob medida para seu negócio"
- "Quanto custa e qual o retorno esperado?"
- "Como funciona: do diagnóstico ao deploy em 4 etapas"
- "Perguntas frequentes sobre software sob medida em Santarém"

---

## Schema Markup — LocalBusiness (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "LBCode.IA",
  "alternateName": "LB Code Soluções Digitais",
  "description": "Software sob medida para PMEs em Santarém, PA. Código 100% do cliente, entrega em 7-14 dias com IA.",
  "url": "https://oferta-lbcodeia.lovable.app",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": [
    {
      "@type": "Offer",
      "name": "MVP Light",
      "price": "3000",
      "priceCurrency": "BRL",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": "3000",
        "maxPrice": "8000",
        "priceCurrency": "BRL"
      }
    },
    {
      "@type": "Offer",
      "name": "PME Pro",
      "price": "8000",
      "priceCurrency": "BRL",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": "8000",
        "maxPrice": "15000",
        "priceCurrency": "BRL"
      }
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "LBCode.IA",
  "description": "Software sob medida para PMEs em Santarém, PA.",
  "url": "https://oferta-lbcodeia.lovable.app",
  "email": "contato@lbcode.ia",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Santarém",
    "addressRegion": "PA",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -2.4399,
    "longitude": -54.7067
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/lbcode.ia/"
  ],
  "priceRange": "R$3.000 - R$15.000+"
}
```

---

## Schema FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quanto custa um software sob medida em Santarém?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O MVP Light começa em R$3.000, ideal para automatizar 1-2 processos específicos. O PME Pro, que cobre gestão completa, custa entre R$8.000 e R$15.000. O ROI médio é de 2-3 meses."
      }
    },
    {
      "@type": "Question",
      "name": "Em quanto tempo o sistema fica pronto?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O MVP Light é entregue em 7-14 dias. O PME Pro em 3-5 semanas. Utilizamos IA no desenvolvimento, o que é 5x mais rápido que o método tradicional."
      }
    },
    {
      "@type": "Question",
      "name": "O código do sistema fica comigo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim. O código é 100% seu — você é o dono. Diferente de sistemas prontos onde você apenas aluga o acesso, aqui o software pertence integralmente à sua empresa."
      }
    },
    {
      "@type": "Question",
      "name": "Para quais tipos de empresa é indicado?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PMEs em Santarém de qualquer setor: varejo, saúde, serviços, indústria, educação e imobiliário. Se sua empresa tem processos manuais repetitivos que tomam tempo, há ROI claro."
      }
    },
    {
      "@type": "Question",
      "name": "Como funciona o diagnóstico gratuito?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "É uma chamada de 15 minutos onde mapeamos seus processos manuais, calculamos o custo real que você perde por mês e apresentamos a solução com prazo e investimento exatos. Sem compromisso."
      }
    }
  ]
}
```

---

## Checklist Técnico

| Item | Status | Ação |
|------|--------|------|
| Meta title na homepage | ❌ | Adicionar via Lovable ou head customizado |
| Meta description na homepage | ❌ | Adicionar |
| Schema LocalBusiness (JSON-LD) | ❌ | Inserir no `<head>` |
| Schema SoftwareApplication (JSON-LD) | ❌ | Inserir no `<head>` |
| Schema FAQPage (JSON-LD) | ❌ | Inserir junto à seção FAQ |
| Open Graph tags (og:title, og:description, og:image) | ❓ | Verificar — Lovable pode gerar automaticamente |
| URL amigável | ✅ (domínio custom sugerido pra futuro) | Considerar domínio próprio: lbcode.ia |
| Alt text nas imagens | ❓ | Verificar e adicionar: "software sob medida santarém" etc |
| Canonical tag | ❓ | Verificar duplicata www/sem www |
| robots.txt | ❓ | Verificar existência |
| Sitemap.xml | ❓ | Verificar ou gerar |
| PageSpeed mobile | ❓ | Testar: pagespeed.web.dev |

---

## Mapa de Internal Linking (quando blog existir)

```
Homepage
├── /planos (âncora: "ver investimento")
├── /blog/quanto-custa-software-sob-medida-santarem (âncora: "veja os preços")
├── /solucoes/clinicas-santarem (âncora: "para clínicas")
├── /solucoes/varejo-santarem (âncora: "para varejo")
└── /contato (âncora: "agendar diagnóstico gratuito")
```
