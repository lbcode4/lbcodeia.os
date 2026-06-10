# Onboarding — Entrevista Inicial (Chat Guiado)

**Data:** 2026-06-09
**Escopo:** Single-tenant. Cliente usa sozinho, sem Luan presente.

---

## Objetivo

Coletar dados do negócio do cliente na primeira vez que acessa o sistema e salvar em `_memoria/empresa.md` e `_memoria/preferencias.md`, substituindo os arquivos existentes.

---

## Fluxo Geral

```
/onboarding (rota nova)
    ↓
Chat guiado — 6 perguntas, uma por vez, com barra de progresso
    ↓
Tela de revisão — cards editáveis com respostas
    ↓
Confirmar → POST /api/onboarding/save
    ↓
Backend escreve _memoria/empresa.md + _memoria/preferencias.md
    ↓
Redirect → / (dashboard)
```

**Trigger automático:** Ao acessar qualquer rota, checar se `empresa.md` está vazio ou ausente via `GET /api/onboarding/status`. Se incompleto → redirect `/onboarding`.

**Acesso manual:** Botão "Reconfigurar Negócio" em alguma página de settings (fora do escopo deste spec — apenas o link precisa existir).

---

## Perguntas da Entrevista

| # | Pergunta exibida | Exemplo inline | Campo |
|---|-----------------|----------------|-------|
| 1 | Qual o nome e setor do seu negócio? | "Clínica Sorriso Pleno / Odontologia" | `nome`, `setor` |
| 2 | O que você vende? Descreva seu principal produto ou serviço. | "Clareamento dental, ortodontia e implantes" | `produto` |
| 3 | Para quem você vende? Descreva seu cliente ideal. | "Mulheres 28-45, classe B/C, Belém-PA, querem sorriso bonito" | `publico` |
| 4 | Por que o cliente escolhe você e não o concorrente? | "Atendimento no mesmo dia, parcelamento em 18x, sem espera" | `diferencial` |
| 5 | Como quer ser percebido? Descreva o tom da sua marca. | "Profissional mas acolhedor, linguagem simples, sem termos técnicos" | `tom` |
| 6 | Qual seu principal objetivo com tráfego pago? | "Gerar leads para WhatsApp e agendar consultas" | `objetivo` |

---

## Dados Salvos

### `_memoria/empresa.md`
Gerado a partir dos campos: `nome`, `setor`, `produto`, `publico`, `diferencial`.

### `_memoria/preferencias.md`
Gerado a partir dos campos: `tom`, `objetivo`.

O backend gera o conteúdo formatado em markdown (mesmo estilo dos arquivos existentes) e sobrescreve via `writeFile`.

---

## Arquitetura Técnica

### Frontend

**Arquivos novos:**
- `frontend/src/routes/onboarding.tsx` — rota
- `frontend/src/components/onboarding-chat.tsx` — componente principal

**State:**
```ts
type Phase = "chat" | "review" | "saving" | "done"

type Profile = {
  nome: string
  setor: string
  produto: string
  publico: string
  diferencial: string
  tom: string
  objetivo: string
}

const [step, setStep] = useState(0)           // 0–5
const [phase, setPhase] = useState<Phase>("chat")
const [profile, setProfile] = useState<Partial<Profile>>({})
```

**Fluxo de state:**
1. `phase = "chat"`: exibe pergunta `steps[step]`, usuário responde → `setProfile` → `step++`
2. Ao `step === 6`: `setPhase("review")`
3. `phase = "review"`: cards editáveis, botão Confirmar → `setPhase("saving")` → POST
4. Sucesso → `setPhase("done")` → redirect `/`

**UI da fase `chat`:**
- Barra de progresso no topo (ex: `2 / 6`)
- Balão com a pergunta + exemplo em cinza abaixo
- Input de texto + botão Enviar
- Respostas anteriores exibidas acima (somente leitura, estilo chat)

**UI da fase `review`:**
- Título: "Revise suas respostas antes de salvar"
- 6 cards, cada um com label + textarea editável
- Botão "Confirmar e Salvar"

### Backend

**Arquivo novo:** `server/src/onboarding.ts`

**Endpoints:**

`GET /api/onboarding/status`
- Lê `_memoria/empresa.md`
- Retorna `{ complete: boolean }` — `false` se arquivo ausente ou com menos de 50 chars

`POST /api/onboarding/save`
- Body: `Profile` (JSON)
- Gera conteúdo de `empresa.md` e `preferencias.md`
- Escreve ambos com `writeFile`
- Retorna `{ ok: true }`

**Registro no router (`server/src/server.ts`):**
```ts
import { handleOnboardingStatus, handleOnboardingSave } from "./onboarding"
// GET /api/onboarding/status
// POST /api/onboarding/save
```

### Auto-redirect

Em `frontend/src/routes/__root.tsx` ou `index.tsx`:
- `useEffect` que faz `GET /api/onboarding/status` no mount
- Se `complete === false` e rota atual !== `/onboarding` → `navigate("/onboarding")`

---

## Fora do Escopo

- Edição posterior via settings (apenas o link precisa existir)
- Autenticação / multi-tenant
- Validação de campos além de "não vazio"
- Internacionalização
