# Front-end para executar skills via Claude — Design

**Data:** 2026-06-06
**Status:** Aprovado para planejamento
**Autor:** Luan + Claude

## Problema

O protótipo `lbcode-ad-pilot` (TanStack Start + React 19 + Tailwind v4 + shadcn/ui,
gerado no Lovable) tem telas para as 42 skills do LBCode.IA, mas tudo é **mock**.
O chat `/assistente` e o editor de sites batem no gateway Lovable (Gemini), não no Claude.

Objetivo: front-end que executa as **skills reais** do repositório `lbcodeia.os` com
**Claude por trás**, aproveitando o ecossistema existente (SKILL.md, `_memoria/`,
scripts de integração Meta/Google).

## Decisões fechadas

| Decisão | Escolha | Razão |
|---------|---------|-------|
| Motor Claude | **Claude Agent SDK** (server-side) | Mesmo cérebro do Claude Code como lib; acessa filesystem, roda scripts Python, carrega SKILL.md reais; escala multi-cliente. |
| Deploy | **Local agora, servidor depois** | Roda em localhost para validar; a fronteira front↔backend não muda ao migrar para servidor. |
| Escopo MVP | **1 skill ponta-a-ponta** | Prova o pipeline com risco mínimo antes de replicar para as outras 41. |
| Skill do MVP | **lb-meta-copy** | Já tem tela dedicada (`/gerador-copy`); gera copy a partir dos top performers. |
| Dados Meta no MVP | **Fixture/stub** | Sem `meta.env` real, `criativos.py` devolve fixture de exemplo; prova o pipe sem depender de conectar Meta. Troca para live é trivial depois. |

> **Nota sobre lb-meta-copy:** a skill real DEPENDE da Graph API — roda
> `integracoes/meta-ads/scripts/criativos.py` para puxar top performers por CTR e
> gera copy a partir deles. Como não há `meta.env` configurado, o MVP usa fixture.

## Arquitetura

```
┌─────────────┐   POST /api/skills/run    ┌──────────────────┐
│  Front-end  │ ─────────────────────────>│  Backend Node     │
│ (TanStack)  │   {skill, cliente, input} │  (Agent SDK)      │
│             │ <───── SSE stream ────────│                   │
└─────────────┘   tokens + eventos        └────────┬─────────┘
                                                    │ cwd = lbcodeia.os
                                                    ▼
                                          ┌──────────────────┐
                                          │  .claude/skills/  │
                                          │  _memoria/        │
                                          │  integracoes/*.py │
                                          └──────────────────┘
```

- **Front** conhece apenas: manda `skill+cliente+input`, recebe stream. Não sabe nada de Claude.
- **Backend** = serviço Node novo. Usa `@anthropic-ai/claude-agent-sdk`, roda com
  `cwd` = pasta `lbcodeia.os`, instrui execução da skill, streama saída via SSE.
- A fronteira é **idêntica** local ou em servidor → migração futura = trocar host, não reescrever.

**Backend separado (não dentro do TanStack):** o Agent SDK é Node puro e precisa de
filesystem + spawn de Python. Serviço isolado mantém o front leve e o deploy independente.

## Componentes

### Backend (novo serviço)

| Arquivo | Responsabilidade | Depende de |
|---------|------------------|------------|
| `server.ts` | HTTP server (Hono ou Express); rota `POST /api/skills/run` (SSE) e `GET /api/contas`. | Agent SDK runner, skills-map |
| `runner.ts` | Executa `query()` do Agent SDK com `cwd`=lbcodeia.os, `allowedTools` restrito, system prompt "execute skill X". Emite eventos de status + tokens. | `@anthropic-ai/claude-agent-sdk` |
| `skills-map.ts` | Mapeia id da skill → caminho da SKILL.md + tools permitidas. | — |
| `contas.ts` | Faz parse de `_memoria/contas-ads.md` → lista de clientes para o dropdown. | — |
| `.env` | `ANTHROPIC_API_KEY`. | — |

**Tools permitidas no MVP (princípio do menor privilégio):** Bash (apenas para rodar
os scripts Python da skill), Read (em `_memoria/` e `.claude/skills/`). Sem Write/Edit no MVP.

### Integração (mínimo no MVP)

| Arquivo | Mudança |
|---------|---------|
| `integracoes/meta-ads/fixtures/criativos-sample.json` | Novo. Fixture de top performers de exemplo. |
| `integracoes/meta-ads/scripts/criativos.py` | Edit pequeno: sem `meta.env`, devolver o fixture (flag `--mock` ou auto-detect de token ausente). |

### Front-end (`lbcode-ad-pilot`)

| Arquivo | Mudança |
|---------|---------|
| `src/lib/skill-client.ts` | Novo. `runSkill(skill, cliente, input)` abre stream (fetch streaming / EventSource) para o backend. |
| `src/routes/gerador-copy.tsx` | Troca `generatedCopy` mock por estado do stream (loading / tokens / erro). UI permanece. |
| dropdown de cliente | Lê clientes via `GET /api/contas` do backend (origem: `contas-ads.md`). |

**Não mexer agora:** as outras 41 telas, o editor de sites, e o `/assistente`
permanecem mock até o pipe ser validado.

## Fluxo MVP (lb-meta-copy)

1. Tela `/gerador-copy`: usuário escolhe cliente (dropdown de `contas-ads.md`) + digita briefing → "Gerar".
2. Front → `POST /api/skills/run {skill:"lb-meta-copy", cliente:"Dordrian", input:"..."}`.
3. Backend abre sessão Agent SDK; SDK lê a SKILL.md, roda `criativos.py --cliente Dordrian`
   (devolve fixture), lê `_memoria/`, gera copy (Gatilho → Copy → Conversão).
4. Stream volta: eventos de status ("puxando top performers…", "gerando…") + texto final.
5. Tela mostra as variações + botão copiar (reusa a UI existente, troca mock por stream).

## Tratamento de erros

- Token Meta faltando → cai no fixture, sem quebrar.
- Cliente não encontrado → backend devolve a lista de clientes disponíveis.
- SDK timeout / limite de requisições → mensagem clara no stream.
- **Segurança:** nunca vazar `ANTHROPIC_API_KEY` nem token Meta em resposta/log.

## Testes

1. **Unit:** `skills-map` resolve id→caminho; parser de `contas-ads.md` extrai clientes.
2. **Integração:** `runSkill("lb-meta-copy")` com fixture devolve copy não-vazia.
3. **E2E manual:** clicar na tela, ver stream até a copy renderizar.

## Roadmap pós-MVP

1. **MVP** — lb-meta-copy ponta-a-ponta (este corte).
2. Generalizar o runner → qualquer skill via `skills-map`.
3. Conectar Meta real (`/lb-ads-conectar`) → trocar fixture por live.
4. Ligar telas data-driven (dashboard, diagnóstico) — exigem parsing estruturado da saída.
5. `/assistente` no Agent SDK (chat livre com acesso às skills).
6. Deploy em servidor + auth multi-cliente.

## Fora de escopo (YAGNI no MVP)

- Multi-tenant / autenticação.
- Conexão Meta/Google ao vivo.
- Persistência de histórico de execuções.
- As 41 skills restantes e o editor de sites.
