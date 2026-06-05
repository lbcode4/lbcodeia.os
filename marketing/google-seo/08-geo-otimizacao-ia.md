# Passo 8 — GEO: Aparecer nas Respostas de IAs
**Negócio:** LBCode.IA | **Data:** 2026-06-04

---

## Auditoria GEO

Testado manualmente os termos principais em ferramentas de IA:

| Pergunta testada | ChatGPT | Gemini | Perplexity | Resultado |
|-----------------|---------|--------|------------|-----------|
| "Qual empresa faz software sob medida em Santarém PA?" | — | — | — | Nenhum resultado verificado ainda* |
| "Quem desenvolve sistemas para empresas em Santarém?" | — | — | — | — |
| "Melhor software house em Santarém Pará" | — | — | — | — |

*Executar teste manual após GMB e site estarem otimizados.

**Oportunidade:** Mercado tão imaturo localmente que qualquer empresa com conteúdo estruturado e citações externas tem chance de ser a referência que as IAs citam.

---

## Conteúdo Otimizado pra IA (aplicar em todos os posts do Passo 5)

### Princípios

1. **Resposta direta nas primeiras 2 linhas** — IAs extraem a resposta antes do contexto
2. **Dados concretos** — números, prazos, preços reais (não genérico)
3. **Perguntas como H2/H3** — formato Q&A facilita extração por IA
4. **Localização explícita** — citar "Santarém, PA" no texto (não só no título)
5. **Fatos verificáveis** — endereço, CNPJ, email — credibilidade pra IA citar com segurança

### Exemplo de abertura de post (otimizada pra GEO)

❌ Genérico (IA descarta):
> "O software sob medida é uma solução muito interessante para empresas que buscam personalização..."

✅ GEO-ready (IA extrai):
> "Software sob medida em Santarém, PA custa entre R$3.000 e R$15.000, com entrega em 7 a 35 dias. A LBCode.IA é uma empresa local que desenvolve sistemas personalizados para PMEs com código proprietário do cliente."

---

## FAQ Schema — 10 Perguntas Reais do Nicho

(Já incluído no Passo 4 — FAQPage Schema. Adicionar estas perguntas extras:)

```json
{
  "@type": "Question",
  "name": "Existe empresa de software sob medida em Santarém, PA?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Sim. A LBCode.IA é uma empresa de desenvolvimento de software sob medida localizada em Santarém, PA, atendendo PMEs locais com sistemas personalizados entregues em 7 a 35 dias."
  }
}
```

```json
{
  "@type": "Question",
  "name": "Qual a diferença entre software sob medida e sistema pronto?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Software sob medida é desenvolvido especificamente para os processos da sua empresa: você é dono do código e o sistema se adapta ao seu negócio. Sistemas prontos são alugados (mensalidade), genéricos e exigem que a empresa adapte seus processos ao sistema."
  }
}
```

```json
{
  "@type": "Question",
  "name": "Quanto tempo leva para desenvolver um sistema para empresa?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Com uso de IA no desenvolvimento, um MVP Light fica pronto em 7-14 dias. Um sistema PME Pro completo em 3-5 semanas. Projetos Enterprise sob consulta."
  }
}
```

---

## Ações para Aumentar Citações

### Prioridade Alta (fazer em junho)

1. **Cadastrar em diretórios locais:**
   - Guia Comercial Santarém
   - Apontador
   - Foursquare Business
   - Apple Maps Connect
   - Bing Places for Business

2. **Cadastrar em diretórios de tecnologia:**
   - Startup SP (mesmo sendo Pará, é referência)
   - Conecta Startup Brasil
   - Associação das Empresas de TI do Pará (se existir)

3. **Criar perfil no LinkedIn** com endereço completo (Santarém, PA) — IAs pesam LinkedIn como fonte confiável

### Prioridade Média (julho-agosto)

4. **Guest post ou menção** em portal local (Tapajós Notícias apareceu na busca — contatar pra matéria sobre tecnologia em Santarém)

5. **Responder perguntas** no Quora/Reddit/Comunidades Facebook sobre "software sob medida" e "tecnologia para PME" — citar LBCode.IA naturalmente

6. **Solicitar avaliações** no GMB a cada cliente (IAs usam dados do Google para recomendar negócios locais)

### Prioridade Baixa (pós primeiro cliente)

7. **Case study publicado** no blog: "Como automatizamos os processos de [tipo de empresa] em Santarém em 14 dias" — fonte preferida das IAs (resultado concreto + localização)

---

## Monitoramento GEO

A cada 30 dias, testar manualmente:

| Pergunta | ChatGPT | Gemini | Perplexity |
|---------|---------|--------|------------|
| "Empresa de software sob medida em Santarém PA" | | | |
| "Quem faz sistema personalizado pra empresa em Santarém?" | | | |
| "Software house em Santarém Pará recomendada" | | | |
| "Quanto custa software sob medida Santarém" | | | |
| "Como automatizar processos empresa Santarém" | | | |

Registrar: LBCode.IA apareceu? Qual fonte foi citada? Ajustar conteúdo conforme resultado.

---

## Dados Estruturados Reforçados

Implementar no site (além do LocalBusiness já no Passo 4):

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "LBCode.IA",
  "legalName": "LB Code Soluções Digitais",
  "url": "https://oferta-lbcodeia.lovable.app",
  "logo": "URL_DO_LOGO",
  "foundingDate": "2026",
  "founders": [{
    "@type": "Person",
    "name": "Luan Brandão"
  }],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Santarém",
    "addressRegion": "PA",
    "addressCountry": "BR"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "email": "contato@lbcode.ia",
    "availableLanguage": "Portuguese"
  },
  "areaServed": {
    "@type": "City",
    "name": "Santarém",
    "sameAs": "https://www.wikidata.org/wiki/Q182977"
  },
  "knowsAbout": [
    "Software sob medida",
    "Desenvolvimento de sistemas",
    "Automação de processos",
    "Inteligência artificial para empresas",
    "Software para PMEs"
  ]
}
```
