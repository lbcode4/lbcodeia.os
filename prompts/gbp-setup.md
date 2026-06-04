# Criador de GBP (Google Business Profile)

## Quando usar
Otimização de GBP ou criação de ficha nova. Roda dentro da skill `/google-meu-negocio`.

## Inputs necessários (questionário)
1. Nome do negócio (registrado)
2. Nicho/categoria
3. Cidade + bairro
4. Serviços principais (lista)
5. Telefone
6. Site
7. Endereço completo
8. Horário de funcionamento
9. Ano de fundação
10. Tipo de atendimento (loja física / domicílio / online / híbrido)
11. Áreas de atendimento (se aplicável)
12. Diferenciais (3-5)
13. Persona-alvo do cliente final
14. Top 5-10 keywords do nicho (de `keywords-google.md`)
15. 5-10 perguntas que clientes mais fazem

## Prompt

```
Você é especialista em SEO local e Google Business Profile. Vou te passar
dados do negócio. Gere tudo otimizado pra copiar-colar no GBP, aplicando
LÓGICA DO BOLO DE CENOURA (cercar termo-alvo por todos os campos).

DADOS DO NEGÓCIO:
- Nome: [...]
- Nicho: [...]
- Cidade/Bairro: [...]
- Serviços principais: [...]
- Telefone: [...]
- Site: [...]
- Endereço: [...]
- Horário: [...]
- Fundação: [...]
- Tipo atendimento: [...]
- Áreas de atendimento: [...]
- Diferenciais: [...]
- Persona-alvo: [...]
- Top keywords nicho: [...]
- Perguntas frequentes coletadas: [...]

Devolva nessa estrutura:

## 1. PALAVRA-CHAVE PRINCIPAL + SECUNDÁRIAS
- Principal: [1 termo — combinação serviço + bairro/cidade]
- Secundárias: [5-8 termos relacionados]
- Observação estratégica: [como cercar essa keyword pelos campos]

## 2. NOME OTIMIZADO DO NEGÓCIO

Formato: <Nome registrado> + <serviço-chave> + <bairro>

Exemplo: "Barbuda Barbearia Premium Moema"

⚠️ Cuidar política Google — não fazer keyword stuffing. Só adicionar
termo natural + localização.

## 3. CATEGORIA PRINCIPAL + ADICIONAIS
- Principal: [exata do GBP — verificar lista oficial]
- Adicionais (2-5): [...]

## 4. DESCRIÇÃO OTIMIZADA (750 caracteres exatos)

Estrutura:
1. Frase 1 (até 100 chars): quem + onde + diferencial principal + keyword
2. Parágrafo médio: serviços + dor resolvida + prova
3. Frase final: CTA + horário/endereço

[gerar texto completo respeitando limite de 750 chars]

CONTAGEM: X/750 chars

## 5. PERGUNTAS & RESPOSTAS (5-8 pares — TUDO embutindo termo-alvo + bairro)

**P:** [pergunta exata cliente faria]
**R:** [resposta embutindo termo + bairro + CTA]

[repetir 5-8 vezes — variar perguntas: serviços, agendamento, horário,
convênio, pagamento, estacionamento, formação, prazo]

## 6. RESPOSTAS-TEMPLATE PRA AVALIAÇÕES

### 5⭐ elogio específico
"Obrigado [Nome]! Que bom que gostou do [serviço] aqui na [Nome com bairro].
[1 frase específica sobre cuidado/processo]. ❤️"

### 5⭐ elogio genérico/curto
"Obrigado pelo carinho, [Nome]! Caprichamos em cada [serviço]."

### 4⭐ elogio com ressalva
"[Nome], obrigado pelo feedback. Anotamos o ponto do [ponto] pra melhorar.
Esperamos te ver de novo aqui na [Nome com bairro]."

### 1-3⭐ negativa
"[Nome], lamentamos que sua experiência com [Nome em bairro] não foi positiva.
Quer contar mais pra gente resolver? Fala com a gente: [WhatsApp]."

⚠️ Negativa: SEMPRE alinhar com user antes de responder (chamar
`/google-avaliacoes`).

## 7. SUGESTÕES DE PUBLICAÇÃO (4 posts iniciais)

Pra cada um:
- Texto (150-300 chars com keyword + bairro)
- CTA
- Imagem sugerida + **nome de arquivo otimizado** (kebab-case-keyword-bairro.jpg)

### Post 1: Apresentação
### Post 2: Serviço principal
### Post 3: Depoimento/Case
### Post 4: Promoção/Novidade

## 8. CHECKLIST DE FOTOS (com nomes de arquivo)

Lista das fotos mínimas + nome de arquivo padrão:
- nome-bairro-fachada.jpg
- nome-bairro-recepcao.jpg
- nome-bairro-[servico-1].jpg
- nome-bairro-equipe.jpg
- nome-bairro-logo.jpg

⚠️ Máximo 3 fotos/dia (Google bane spam de upload).

## 9. CRONOGRAMA DE EXECUÇÃO

Semana 1: configurar nome + categoria + descrição + perguntas
Semana 2: subir 5-10 fotos otimizadas (3/dia)
Semana 3: publicar primeiros 2 posts
Semana 4: pedir 5+ avaliações pra clientes recentes

⚠️ Esperar 5 dias após pegar acesso antes de qualquer alteração.

## 10. AÇÕES PÓS-OTIMIZAÇÃO

Após 30 dias do GBP rodando:
- Rodar Campanha #3 "Dominação Top 1" (botão Anunciar dentro do GBP) —
  chamar `/google-ads` modo B
- Monitorar posição local mensalmente
- Cadastrar em diretórios secundários (Bing Places, Apple Maps)
```

## Output esperado
10 seções prontas pra colar no GBP campo por campo.

## Regras
- Sempre respeitar limite 750 chars na descrição
- Sempre 5-8 P&R com termo embutido
- Sempre nomes de arquivo em kebab-case com keyword
- Sempre incluir cronograma com esperar-5-dias
- Sempre marcar máximo 3 fotos/dia
