# Design: Gerenciar Campanhas Meta (Real API)

**Data:** 2026-06-12  
**Escopo:** Substituir `gerenciar-anuncios.tsx` (mock) por tela real de campanhas + conjuntos de anúncios via Meta Graph API

---

## Objetivo

Tela para listar campanhas ativas/pausadas do Meta Ads de um cliente, expandir para ver conjuntos de anúncios dentro de cada campanha, e ativar/pausar qualquer nível com confirmação modal.

---

## Arquitetura

```
frontend/src/routes/gerenciar-anuncios.tsx   (substituído — sem mock)
        ↓ fetch
server/src/meta-campanhas.ts                 (novo módulo)
        ↓ fetch nativo
graph.facebook.com/v21.0
```

Credenciais: `integracoes/credentials/meta.env` → `META_ACCESS_TOKEN`  
Account ID: resolvido via `server/src/contas.ts` (padrão existente)

---

## Endpoints do Servidor

### GET /api/meta/campanhas?cliente=X

Chama `/{account_id}/campaigns` na Graph API com:
- `fields`: `id,name,status,effective_status,objective,daily_budget,lifetime_budget`
- Filtra: retorna apenas status `ACTIVE` ou `PAUSED` (ignora `ARCHIVED`, `DELETED`)

Resposta:
```ts
Campanha[]
// { id, name, status, effective_status, objective, daily_budget, lifetime_budget }
```

### PUT /api/meta/campanhas/:id/status

Body: `{ status: "ACTIVE" | "PAUSED" }`  
Chama POST `/{campaign_id}` na Graph API com `{ status }`.  
Resposta: `{ id, new_status }`

### GET /api/meta/adsets?campanha_id=X&cliente=X

Chama `/{campaign_id}/adsets` com:
- `fields`: `id,name,status,effective_status,daily_budget,lifetime_budget`
- Filtra: `ACTIVE` ou `PAUSED`

Resposta: `Adset[]`

### PUT /api/meta/adsets/:id/status

Body: `{ status: "ACTIVE" | "PAUSED" }`  
Chama POST `/{adset_id}` na Graph API.  
Resposta: `{ id, new_status }`

---

## Módulo Servidor: `meta-campanhas.ts`

- Exporta função `registerMetaCampanhasRoutes(app, env)` chamada em `server.ts`
- Lê `META_ACCESS_TOKEN` via `dotenv` de `integracoes/credentials/meta.env`
- Resolve `account_id` importando `resolveCliente` de `contas.ts`
- Sem retry (operações de gerenciamento raramente throttleiam)
- Em caso de erro da Graph API: retorna HTTP 502 com mensagem original

---

## Frontend: `gerenciar-anuncios.tsx`

Remove todo mock. Substitui por:

### Estado

```ts
contas: Conta[]           // fetchContas()
cliente: string           // conta selecionada
campanhas: Campanha[]     // carregadas ao selecionar cliente
loading: boolean
adsets: Record<string, Adset[]>   // cache lazy por campanha_id
expandedId: string | null // campanha com adsets visíveis
modal: { id: string; nivel: "campanha"|"adset"; next: "ACTIVE"|"PAUSED"; nome: string } | null
log: LogEntry[]           // histórico da sessão (apenas)
q: string                 // filtro por nome
```

### Layout

```
[Header] Gerenciar Campanhas · [Selector cliente ▼] [🔄 Atualizar]

[Busca por nome]

┌─ Tabela campanhas ──────────────────────────────────────────────┐
│ Nome          Objetivo    Orçamento   Status      Ação          │
│ > Campanha A  OUTCOME_...  R$ 50/dia  ● ACTIVE   [toggle]      │
│   ↳ Conj. 1              R$ 25/dia   ● ACTIVE   [toggle]      │ ← expandido
│   ↳ Conj. 2              R$ 25/dia   ○ PAUSED   [toggle]      │
│ > Campanha B  MESSAGES    R$ 30/dia  ○ PAUSED   [toggle]      │
└─────────────────────────────────────────────────────────────────┘

[Log lateral]
```

### Comportamento

- **Expand**: clicar na linha da campanha → carrega adsets via `GET /api/meta/adsets?campanha_id=X&cliente=X` (lazy, só na primeira vez — cacheia em `adsets` state)
- **Toggle**: clique no toggle → modal de confirmação → optimistic update → chamada API → reverte se erro + toast
- **Modal**: mesmo padrão do `gerenciar-anuncios.tsx` atual (nome do item, ativar/pausar, confirmar/cancelar)
- **Log**: entrada adicionada pós-confirmação (nível + nome + ação + horário)
- **Busca**: filtra `campanhas[]` client-side por nome

### Tipos

```ts
type Campanha = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
};

type Adset = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  daily_budget?: string;
  lifetime_budget?: string;
};
```

---

## Fluxo de Dados

```
mount → fetchContas() → setContas → selecionar cliente
      → GET /api/meta/campanhas?cliente=X → setCampanhas

click campanha → GET /api/meta/adsets?campanha_id=X → cache adsets[id]

click toggle → setModal → confirmar
            → optimistic: update campanhas/adsets state
            → PUT /api/meta/campanhas/:id/status ou adsets/:id/status
            → erro? → revert state + mostrar erro
            → sucesso → append log
```

---

## Tratamento de Erros

- API offline / token inválido: mensagem de erro inline (não trava tela)
- Toggle falha: reverte optimistic update, mostra mensagem no log
- Cliente sem `meta_ad_account`: mensagem "conta Meta não configurada"

---

## Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `server/src/meta-campanhas.ts` | Criar |
| `server/src/server.ts` | Registrar rotas novas |
| `frontend/src/routes/gerenciar-anuncios.tsx` | Substituir conteúdo |
