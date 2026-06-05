---
name: lb-sistema-novo-projeto
description: >
  Cria workspace isolado pra cliente ou iniciativa nova com contexto dedicado (CLAUDE.md próprio).
  Herda configuração de tom + framework + identidade da raiz, mas permite regras específicas.
  Estrutura pastas conforme tipo de entrega. Use quando disser "novo cliente", "novo projeto",
  "/sistema-novo-projeto", "começar trabalho pra X", "isolar projeto".
---

# /lb-sistema-novo-projeto — Workspace isolado

Cria pasta-projeto que funciona como mini-repositório dentro do LBCode.IA.
Herda o contexto (tom, framework, marca) mas roda com `CLAUDE.md` próprio.

## Workflow

### Passo 1 — 4 perguntas rápidas

1. Nome do projeto/cliente?
2. É cliente novo / projeto interno / iniciativa pessoal?
3. Objetivo em uma frase?
4. Que tipo de entrega? (ads, site, conteúdo, proposta, automação — pode ser múltiplo)

### Passo 2 — Decidir pasta-pai

Baseado na resposta 2:

- **Cliente novo:** `clientes/<nome>/`
- **Projeto interno:** `projetos/<nome>/`
- **Pessoal:** perguntar onde vai

(Criar pasta-pai se não existir.)

### Passo 3 — Estrutura

Criar:
```
<nome>/
├── CLAUDE.md (herda + específicas)
├── briefing.md (contexto do projeto)
├── subpastas conforme entregas (ads/, conteudo/, site/, propostas/, etc)
```

### Passo 4 — Conteúdo do CLAUDE.md

Template mínimo:

```markdown
# [Nome]

Projeto criado em [data].

## Sobre

[Objetivo]

## Tipo

[Cliente novo / Projeto interno / Pessoal]

## Entregas

- [entrega 1]
- [entrega 2]

## Herança

Tom, marca, framework vêm da raiz (`_memoria/` + `identidade/` + `framework-trafego.md`).
Tudo que você não sobrescreve aqui segue o padrão da empresa.

## Específico desse projeto

[Vazio — preencher conforme descobrir regras que só valem aqui]
```

### Passo 5 — Resumo

```
✓ Pasta criada: [caminho]
✓ CLAUDE.md + briefing.md
✓ Subpastas: [lista]

Abre terminal dentro da pasta pra eu carregar o contexto específico junto com o global.
```

## Regras

- **Pasta:** nomeação natural (preservar acentos, espaços → hífen, reconhecível)
- **Só subpastas solicitadas** — sem estrutura "pra organizar"
- **Conflito de nome:** se existe pasta com mesmo nome, avisar + oferecer suffixo (`_v2`) ou sobrescrever
- **Git:** projetos ficam versionados juntos — não separar em repos diferentes

## Integração

Novo projeto = novo contexto operacional isolado mas integrado:
- Herda RETINA + GCC + OPA (se for marketing/vendas)
- Segue identidade visual da marca
- Outputs vão pro histórico (`/lb-sistema-salvar`)
- Aparecem em `/lb-sistema-atualizar` depois (vai detectar novo cliente/projeto)

Não é sandbox — é extensão organizada da operação.
