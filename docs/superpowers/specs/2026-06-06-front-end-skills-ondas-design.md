# Front-end Skills — Todas as Skills em Ondas (Phase 2)

**Data:** 2026-06-06
**Status:** Aprovado para planejamento
**Autor:** Luan + Claude
**Depende de:** `2026-06-06-front-end-skills-claude-design.md` (Phase 1 MVP concluído)

## Contexto

MVP (Phase 1) validado: pipe front→backend→Agent SDK→lb-meta-copy→SSE stream funcionando.

Phase 2: conectar as 42 skills ao front em 3 ondas. Distingue skills de texto puro (painel genérico) de skills data-driven (telas dedicadas + JSON estruturado).

## Decisões fechadas

| Decisão | Escolha | Razão |
|---------|---------|-------|
| Skills texto (30) | Rota genérica `/skill/$skillId` | Uma tela cobre todas; sem código novo por skill. |
| Skills data (12) | `mode: "data"` + `outputContract` | Claude emite JSON estruturado; runner extrai, emite evento `data`; front popula tela dedicada. |
| Ondas | 3 ondas incrementais | Infra primeiro, texto depois, data por último (mais complexo). |

## Seção 1 — Mecanismo backend (`mode` + evento `data`)

### `skills-map.ts`

Cada skill ganha campos extras:

```typescript
export type SkillSpec = {
  skillName: string;
  allowedTools: string[];
  mode: "text" | "data";
  outputContract?: Record<string, unknown>; // JSON Schema mínimo para instrução ao Claude
};
```

### `SkillEvent` (novo variant)

```typescript
export type SkillEvent =
  | { type: "status"; text: string }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string }
  | { type: "data"; payload: unknown }; // novo — skills data-driven
```

### `runner.ts` — branch por mode

- `mode: "text"` → comportamento atual (stream chunks direto)
- `mode: "data"` → acumula todos os chunks; ao receber `result`, extrai último bloco `\`\`\`json … \`\`\`` via regex; valida que é JSON válido; emite `{ type: "data", payload: parsed }`; se extração falhar, emite `{ type: "error", text: "Resposta sem JSON estruturado" }`

### Prompt para skills `data`

Runner injeta no prompt:

```
Ao final, emita OBRIGATORIAMENTE um bloco ```json com o resultado estruturado
seguindo este contrato: <outputContract>. Nenhum texto após o bloco JSON.
```

## Seção 2 — Painel genérico de skill (front)

### Rota: `/skill/$skillId`

Parâmetro `skillId` vem da URL. Front consulta `skills-registry.ts` (lado cliente) para obter nome e descrição legíveis.

**Layout:**
```
PageHeader — nome + descrição da skill
─────────────────────────────────────────
[Card: inputs]              [Card: output]
  Dropdown: Cliente           Status spinner
  Textarea: Briefing          Stream de texto
  Botão: Executar
  Erro (se houver)
```

Comportamento idêntico a `gerador-copy.tsx`. Reutiliza `runSkill` de `skill-client.ts`.

### `skills-registry.ts` (novo, front-side)

```typescript
export type SkillMeta = {
  id: string;
  label: string;
  description: string;
  hub: string; // qual hub exibe essa skill
};

export const SKILLS_REGISTRY: SkillMeta[] = [
  { id: "lb-meta-copy", label: "Gerador de Copy", description: "Gera variações a partir dos top performers", hub: "meta" },
  // ... 41 restantes
];

export function getSkillMeta(id: string): SkillMeta | undefined
```

### Hub page

Cards de skill substituem botão mock por `<Link to={`/skill/${skill.id}`}>Executar</Link>`.

Skills data-driven linkam pra tela dedicada (ex: `/dashboard-meta`), não pra `/skill/$skillId`.

## Seção 3 — Ondas

### Onda 1 — Infraestrutura genérica

**Escopo:**
- `skills-map.ts`: registra as 42 skills (mode: "text" por padrão para quem não tem script)
- `skills-registry.ts` no front: metadados das 42 skills
- Rota `/skill/$skillId` funcional
- Hub: cards linkam pra rota genérica
- Valida com 5 skills: `lb-venda-prospectar`, `lb-diagnostico-copy`, `lb-copywriting`, `lb-cta-performance`, `lb-email-sequencia`

**Entregável:** qualquer skill de texto executável pelo painel genérico.

### Onda 2 — Texto completo (25 skills restantes)

**Escopo:**
- Registrar as 25 skills de texto no `skills-map.ts` com `allowedTools` corretos por skill
- Verificar que painel genérico funciona pra cada uma (smoke test manual)
- Ajustar `allowedTools` onde skill precisar de ferramentas extras (ex: Glob pra skills que leem arquivos)

**Entregável:** todas as 30 skills de texto acessíveis pelo painel.

### Onda 3 — Skills data-driven (6 telas)

**Escopo:** mecanismo `mode: "data"` + 6 telas dedicadas.

#### outputContracts

**`lb-meta-dashboard`**
```typescript
{
  periodo: string;
  gastos: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  cpm: number;
  topCreativos: Array<{ id: string; nome: string; ctr: number; gastos: number }>;
}
```

**`lb-meta-diagnostico`**
```typescript
{
  score: number; // 0-100
  alertas: Array<{ nivel: "critico" | "atencao" | "ok"; mensagem: string }>;
  recomendacoes: string[];
  metricas: Record<string, number>;
}
```

**`lb-meta-auditoria`**
```typescript
{
  estrutura: { campanhas: number; conjuntos: number; anuncios: number };
  copys: Array<{ anuncio: string; problema: string; sugestao: string }>;
  segmentacoes: Array<{ conjunto: string; problema: string }>;
  itensCriticos: string[];
}
```

**`lb-meta-reels`**
```typescript
{
  reels: Array<{
    id: string;
    views: number;
    retencao: number; // %
    ctaRate: number;  // %
    sugestao: string;
  }>;
}
```

**`lb-ads-negativas`**
```typescript
{
  novasNegativas: Array<{ termo: string; motivo: string; campanha: string }>;
  existentes: string[];
  impactoEstimado: string;
}
```

**`lb-google-dashboard`**
```typescript
{
  campanhas: Array<{ nome: string; gastos: number; conversoes: number; roas: number }>;
  cpc: number;
  conversoes: number;
  roas: number;
  alertas: string[];
}
```

#### Telas dedicadas

Cada tela: rota própria, recebe evento `data` de `runSkill`, renderiza com componentes específicos (tabelas, cards de métrica, listas de alerta). Botão "Atualizar" re-executa a skill.

Enquanto roda: spinner genérico + status chunks visíveis.

## Tratamento de erros — novos casos

| Caso | Comportamento |
|------|---------------|
| Claude não emite bloco JSON | `error: "Resposta sem JSON estruturado"` → front mostra erro + texto bruto do stream |
| JSON não valida contra contrato | log de aviso, emite payload mesmo assim (front é tolerante a campos extras/faltantes) |
| Skill não registrada em `skills-map` | 400 do backend: `"Skill não autorizada"` |
| `mode: "data"` mas nenhum chunk | timeout após 30s → `error: "Timeout"` |

## Testes

**Onda 1:**
- Unit: `getSkillMeta("lb-venda-prospectar")` retorna meta correto
- Unit: rota `/skill/lb-venda-prospectar` renderiza com skillId correto
- Integration: `runSkill("lb-venda-prospectar")` retorna chunks não-vazios

**Onda 3:**
- Unit: `extractJsonBlock("texto ```json\n{}\n```")` retorna `{}`
- Unit: `extractJsonBlock("sem bloco")` retorna null
- Integration: `runSkill("lb-meta-dashboard", mode: "data")` emite evento `data` com payload válido

## Fora de escopo

- Auth / multi-tenant
- Conexão Meta/Google ao vivo (fixture por ora)
- Histórico de execuções
- Editor de sites / `/assistente` chat
- Deploy em servidor (fica pra Phase 3)
