---
name: lb-conteudo-auditoria-insta
description: >
  Auditoria completa de perfil Instagram em 7 elementos (foto, @, título, bio, link, destaques,
  9 quadros) + diagnóstico RETINA dos últimos posts. Devolve checklist ❌/✅ + template de bio +
  lista de quadros faltando por tipo RETINA. Use antes de rodar campanha de seguidores.
  Use quando o usuário pedir "auditar instagram", "perfil tá pronto pra anunciar",
  "revisar bio", "auditar @", "checar perfil IG", ou /conteudo-auditoria-insta.
---

# /conteudo-auditoria-insta — Auditoria 7 elementos + RETINA

Analogia "Pesadelo na Cozinha": levar tráfego a perfil despreparado = desperdício. Arrumar a casa primeiro (orgânico) → plataforma vê perfil com bons olhos. Seguidor qualificado vende mais fácil que estranho.

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO (RETINA, GCC)
- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Identidade visual:** `identidade/design-guide.md`
- **WebFetch:** pra ler perfil público
- **Outputs:** `marketing/auditoria-ig/<handle>-<YYYY-MM-DD>.md`

---

## Workflow

### Passo 1 — Coletar handle
- Pegar handle de `_memoria/empresa.md` (campo Instagram) OU
- Pedir ao usuário: *"Qual o @ pra auditar?"*

### Passo 2 — Analisar perfil

**Opção A — Perfil próprio (acesso completo):**
Pedir prints de:
- Capa do perfil (foto + @ + título + bio + link)
- Destaques
- Grade (9 quadros)

**Opção B — Perfil público (qualquer um):**
WebFetch em `https://www.instagram.com/<handle>/` — extrai meta tags, OG image, bio.
Limitação: Instagram bloqueia muito conteúdo sem login. Se faltar dado, pedir print.

### Passo 3 — Avaliar 7 elementos

#### 1. **Foto**
✅ Bom: rosto/logo evidente, "mais cabeça que corpo", fundo neutro
❌ Ruim: foto borrada, fundo poluído, logo ilegível, foto cortada

Se foto ruim → sugerir:
- Pessoa: chamar `prompts/foto-profissional.md` (gera prompt pra Gemini transformar selfie em foto profissional — não remove imperfeições, "milagre é Deus que faz")
- Marca: usar logo limpo de `identidade/logo.png`, fundo neutro, remover fundo via remove.bg ou ChatGPT

#### 2. **@ (arroba)**
✅ Bom: curto, sem caractere especial, sem letra repetida
❌ Ruim: muito longo, _.._.._, caractere estranho

Combinações úteis: nome, nome+sobrenome, ponto/underline, prefixo o/a/eu, site.

#### 3. **Título**
Formato ideal: `<Nome> | <Marca> | <Produto>`
Ex.: "Alexandre Decarli | Gestor de Tráfego"
Ex.: "[seu produto] | Agente de IA pra Empresas"

Ajuda na busca do Instagram (campo indexado).

#### 4. **Bio (3-4 elementos obrigatórios)**
- **Transformação que causa** — "tiro sua agenda do caos"
- **Autoridade** — "150+ empresas atendidas" ou certificação
- **Conexão / localização** — "atendo Brasil todo" ou cidade
- **CTA** — "👇 agenda sua demo"

Template aplicado:
```
Agente de IA que enche sua agenda no WhatsApp 24/7
150+ empresas usando ▪️ Atendo Brasil todo
👇 Demo grátis de 30 min
```

#### 5. **Link**
✅ Bom: presente, curto (linktree, beacons, próprio site)
❌ Ruim: ausente, link quebrado, link gigante

#### 6. **Destaques (mínimo 3)**
Padrão:
- **Quem sou / Quem somos** — apresentação
- **Depoimentos** — prova social
- **Produtos / Serviços** — catálogo

Capa dos destaques: ícones consistentes (mesma fonte/cor/estilo).

#### 7. **9 quadros (últimos posts)**

**Análise visual:**
- Consistência paleta + tipografia?
- Sequência de capas alterna (claro → escuro → cor da marca)?
- Sem 2 capas iguais em sequência?

**Análise RETINA (mix de conteúdo):**

Classificar cada um dos 9 últimos posts em:
- **R** — Relacionamento
- **E** — Engajamento
- **T** — Transformação
- **I** — Interação
- **N** — Níveis de consciência (venda)
- **A** — Autoridade

❌ Padrões ruins comuns:
- 9/9 posts tipo N (só vende) → algoritmo mata, audiência foge
- 9/9 posts tipo E (só meme) → engaja mas não converte
- Zero R → falta humanização

✅ Mix saudável (sugestão):
- 2-3 N (venda)
- 2 A (autoridade)
- 1-2 T (transformação/case)
- 1-2 R (humano)
- 1 E (engajamento)
- 0-1 I (interação)

### Passo 4 — Diagnóstico final

Gerar markdown com:

```markdown
# Auditoria @<handle> — <data>

## Score geral: X/7 elementos ok

## Status por elemento

| # | Elemento | Status | Problema | Sugestão |
|---|----------|--------|----------|----------|
| 1 | Foto | ✅/❌ | ... | ... |
| 2 | @ | ✅/❌ | ... | ... |
| ... | ... | ... | ... | ... |

## Análise dos 9 quadros (RETINA)

| Slot | Tipo RETINA | Tema |
|------|-------------|------|
| 1 (último) | N | venda demo |
| 2 | A | dado mercado |
| ... | ... | ... |

**Distribuição:** R:0 E:0 T:1 I:0 N:7 A:1 → ❌ saturado de venda

**Quadros faltando:** R (humano), I (interação), E (engajamento)

## Sugestões prontas

### Bio reescrita
[3 versões aplicando template]

### Próximos 5 posts (preencher quadros faltantes)
1. R — Bastidor: <ideia>
2. I — Enquete: <ideia>
3. E — Meme do nicho: <ideia>
4. R — História: <ideia>
5. T — Case: <ideia>

### Capas dos destaques
[lista de 3 destaques + texto sugerido pra capa]
```

### Passo 5 — Próximos passos sugeridos

Se score <5/7 → recomendar arrumar perfil **antes** de rodar `/meta-campanha-seguidores`.

Se score 5-7 → liberado pra rodar campanha de seguidores.

Sempre oferecer:
- *"Quero criar os 5 posts sugeridos agora? (chamo `/conteudo-carrossel` pra cada um)"*
- *"Quero rodar `/meta-campanha-seguidores` com o perfil ajustado?"*

---

## Regras

- **Sempre ler `_memoria/framework-trafego.md`** antes
- **Não inventar prints** se Instagram bloquear acesso — pedir ao usuário
- **Avaliação objetiva** — não falar "tá bonito" se não tá. Sinalizar ❌ claro
- **Sugestões concretas** — não "melhorar a bio" mas "trocar bio pra [texto exato]"
- **Mix RETINA é orientativo** — não regra rígida. Depende do nicho
- **Nunca pedir senha** — só prints ou acesso por email Meta Business
- **Comparar com referências** — antes de avaliar, abrir 2-3 perfis fortes do nicho (Instagram busca)
