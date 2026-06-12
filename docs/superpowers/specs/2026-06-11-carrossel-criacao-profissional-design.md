# Spec: Carrossel — Criação Profissional

**Data:** 2026-06-11  
**Status:** aprovado para implementação

---

## Contexto

Tela `/carrosseis` atual tem dois modos desconexos: form de criação (skill run) e galeria de carrosseis gerados. O usuário quer uma tela unificada, profissional, com:
- Identidade visual da marca visível no form (logo + referências)
- Upload de "imagens para copiar" (style transfer via Gemini)
- Galeria e resultado no mesmo painel direito

Backend já tem todos os endpoints necessários. Trabalho é ~90% frontend.

---

## Design

### Layout

Split-panel fixo — dois painéis lado a lado:

```
┌─────────────────────────[360px]─┬──────────────────────────[flex-1]──┐
│  CRIAR                          │  RESULTADO / GALERIA               │
└─────────────────────────────────┴────────────────────────────────────┘
```

- Painel esquerdo: 360px fixo, scroll vertical se precisar
- Painel direito: flex-1, alterna entre 3 estados

---

### Painel Esquerdo — Form de Criação

Seções em ordem vertical:

#### 1. Identidade Visual
```
IDENTIDADE VISUAL
[logo 56×56px] [ref1] [ref2] [ref3] [ref4] [ref5]  ← scroll horizontal se > 5
```
- Carregado via `GET /api/identidade` no mount
- Logo servida via `GET /api/identidade/arquivo?file=logo.png`
- Refs servidas via `GET /api/identidade/arquivo?file=<nome>`
- Thumbnails 56×56px, border-radius, object-cover
- Se nenhuma ref/logo: mostra placeholder cinza com texto "Nenhuma referência em identidade/"

#### 2. Imagens para Copiar
```
IMAGENS PARA COPIAR
┌────────────────────────────────┐
│  Arraste aqui ou clique        │  ← drop zone, height 96px
└────────────────────────────────┘
[thumb1 ×] [thumb2 ×] [thumb3 ×] ← após upload, 64×64px thumbnails
```
- Upload via `POST /api/carrosseis/inspiracoes?id=<temaSlug>`
- `temaSlug` derivado do campo Tema: trim + lowercase + spaces→hyphen, gerado no momento do upload
- Se Tema vazio no momento do upload → toast "Preencha o Tema primeiro"
- Aceita: PNG, JPG, WebP
- Máx 10 arquivos
- Thumbnails servidos via `GET /api/carrosseis/inspiracao?id=<temaSlug>&file=<filename>`
- Botão × remove da lista local (não deleta do servidor — temporário)

#### 3. Campos existentes (sem mudança de lógica)
- CLIENTE (dropdown)
- TIPO RETINA (6 buttons: R/E/T/I/N/A)
- TIPO DE CONTEÚDO (3 options)
- TEMA / BRIEFING (textarea) — obrigatório para upload
- MODELO IA (dropdown)
- Botão **Executar** — disabled se Tema vazio

---

### Painel Direito — 3 Estados

#### Estado: idle
Galeria de carrosseis anteriores (código atual de carrosseis.tsx). Grid 2 colunas. Clicar → abre viewer no mesmo painel (sem sair da tela).

Viewer inline:
- Slide com navegação prev/next + dots
- Thumbnails abaixo
- Legenda + botão copiar ao lado
- Botão "← Galeria" retorna ao grid

#### Estado: executando
- Header: "Gerando carrossel..." com spinner
- Output em streaming (texto do skill run) em `<pre>` com scroll
- Botão cancelar (opcional — não bloqueia o scope inicial)

#### Estado: concluído
- Abre direto o viewer do carrossel recém-gerado
- Botão "Novo carrossel" limpa uploads + estado → volta a idle

---

## Fluxo de Dados

```
mount
  └── GET /api/identidade → { logo, refs }
      → exibe seção Identidade Visual

usuário preenche Tema + faz upload
  └── POST /api/carrosseis/inspiracoes?id=<temaSlug>
      → { ok, filename }
      → adiciona thumbnail à lista

usuário clica Executar
  └── POST /api/skills/run {
        skillId: "lb-conteudo-carrossel",
        cliente, tipoRetina, tipoConteudo,
        tema, modelo,
        inspiracoes: { id: temaSlug, files: [...filenames] }
      }
      → streaming response
      → quando termina: GET /api/carrosseis → atualiza galeria
      → abre viewer do novo carrossel
```

---

## Mudanças necessárias

### Frontend (`carrosseis.tsx`)
- [ ] Refatorar layout: split-panel fixo
- [ ] Componente `IdentidadeVisual` — busca e exibe logo + refs
- [ ] Componente `UploadInspirações` — drag-drop, upload, thumbnails, remover
- [ ] Mover galeria + viewer para painel direito
- [ ] Estado da tela: `idle | running | done`
- [ ] Painel direito alterna por estado
- [ ] Form: derivar `temaSlug` do tema para uploads
- [ ] Validação: Tema obrigatório antes de upload e execução

### Backend — nenhuma mudança necessária
Todos os endpoints já existem:
- `GET /api/identidade`
- `GET /api/identidade/arquivo`
- `POST /api/carrosseis/inspiracoes`
- `GET /api/carrosseis/inspiracoes`
- `GET /api/carrosseis/inspiracao`

### Skill (`lb-conteudo-carrossel`) — ajuste mínimo
- Quando `inspiracoes` chegam no run → skill recebe como parte do briefing/contexto
- Skill já lê `inspiracoes/` da pasta do carrossel (Passo 0) — só garantir que o `temaSlug` corresponda à pasta criada
- Se temaSlug for `notebook-profissional` e skill criar `notebook-profissional-2026-06-11/` → skill deve olhar `marketing/conteudo/carrossel/notebook-profissional/inspiracoes/` também (ou mover no início)

---

## Fora do escopo

- Upload de referências de identidade (gerenciar pasta `identidade/`) — próxima iteração
- Delete de imagens carregadas no servidor
- Upload por cliente (global por ora)
- Cancelamento do skill run
