# Design: Seletor de Modelo IA no Carrossel

**Data:** 2026-06-11  
**Status:** Aprovado

## Resumo

Adicionar seletor de modelo Claude ao form de geração de carrossel (`/skill/lb-conteudo-carrossel`). O modelo escolhido persiste no backend via `_memoria/ai-config.json` e é passado para o runner na execução.

## Decisões

- Seletor aparece **sempre** no form (independente do Tipo de conteúdo)
- Persiste no backend (não localStorage) — reflete em toda sessão/dispositivo
- Mudança de modelo salva imediatamente ao selecionar
- Aplica-se apenas ao carrossel por enquanto
- Apenas modelos Claude (provider único atual do runner)

## Armazenamento

Novo arquivo `_memoria/ai-config.json`:
```json
{ "carrosselModel": "claude-sonnet-4-6" }
```

Separado de `empresa.md`/`preferencias.md` — config técnica, não contexto de negócio.

## Modelos disponíveis

| ID | Label | Uso |
|----|-------|-----|
| `claude-haiku-4-5-20251001` | Haiku 4.5 | Rápido/barato |
| `claude-sonnet-4-6` | Sonnet 4.6 | Padrão |
| `claude-opus-4-8` | Opus 4.8 | Mais capaz |

## Arquivos alterados (4)

### 1. `server/src/onboarding.ts`
- Nova type `AiConfig = { carrosselModel: string }`
- `getAiConfig()` — lê `_memoria/ai-config.json`, default `claude-sonnet-4-6`
- `saveAiConfig(data: AiConfig)` — escreve `_memoria/ai-config.json`

### 2. `server/src/server.ts`
- `GET /api/ai-config` → retorna `AiConfig`
- `PUT /api/ai-config` → salva `AiConfig`
- `POST /api/skills/run` → aceita `model?: string` no body

### 3. `server/src/runner.ts`
- `runSkill()` recebe `model?: string`
- Se definido, passa como `model` no `query()` options; senão usa `MODEL` env var

### 4. `frontend/src/routes/skill.$skillId.tsx`
- Novo estado `carrosselModel: string`
- No mount (quando `isCarrossel`): fetch `GET /api/ai-config`, seta estado
- Nova seção "Modelo IA" acima do botão Executar (só quando `isCarrossel && !hasTurns`)
- Dropdown com 3 modelos; ao mudar → `PUT /api/ai-config` + atualiza estado
- `executar()` passa `model: carrosselModel` no body de `/api/skills/run`

## Fluxo completo

```
User abre /skill/lb-conteudo-carrossel
  → frontend GET /api/ai-config
  → exibe dropdown com modelo salvo (padrão: Sonnet 4.6)

User muda modelo
  → PUT /api/ai-config { carrosselModel: "claude-opus-4-8" }
  → persiste em _memoria/ai-config.json

User clica Executar
  → POST /api/skills/run { skill, cliente, input, model: "claude-opus-4-8" }
  → runner usa esse modelo no query()
```

## Fora de escopo

- Multi-provider (OpenAI, Gemini) — extensão futura
- Seletor em outras skills — extensão futura
- Configurações page refletindo ai-config — extensão futura
