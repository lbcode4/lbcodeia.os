# Configurações do Negócio — Design

**Data:** 2026-06-11
**Branch:** v3

---

## Objetivo

Página que permite visualizar e editar o conteúdo de `_memoria/empresa.md` e `_memoria/preferencias.md` diretamente no app, sem precisar editar arquivos manualmente.

---

## Backend

**Arquivo modificado:** `server/src/onboarding.ts` (adiciona 2 funções)
**Registro em:** `server/src/server.ts` (adiciona 2 rotas)

### `GET /api/configuracoes`
- Lê `_memoria/empresa.md` e `_memoria/preferencias.md`
- Retorna `{ empresa: string, preferencias: string }` com conteúdo raw
- Se arquivo ausente, retorna string vazia para aquele campo

### `PUT /api/configuracoes`
- Body: `{ empresa: string, preferencias: string }`
- Sobrescreve ambos os arquivos com `writeFile`
- Retorna `{ ok: true }`

---

## Frontend

**Arquivos novos:**
- `frontend/src/routes/configuracoes.tsx` — rota `/configuracoes`

**Arquivo modificado:**
- `frontend/src/components/app-shell.tsx` — adiciona link "Configurações" na sidebar (ícone `Settings`)

### UI da página

```
PageHeader: "Configurações do Negócio"
Subtitle: "Edite as informações que a IA usa para personalizar suas respostas."

[Card — Empresa]
  Label: "empresa.md"
  Textarea: conteúdo atual de _memoria/empresa.md (editável, fonte monospace)

[Card — Preferências]
  Label: "preferencias.md"
  Textarea: conteúdo atual de _memoria/preferencias.md (editável, fonte monospace)

[Botão "Salvar"]  ← disabled durante saving
[Feedback: "Salvo com sucesso!" ou mensagem de erro]
```

### State

```ts
const [empresa, setEmpresa] = useState("")
const [preferencias, setPreferencias] = useState("")
const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
```

### Fluxo

1. Mount → `GET /api/configuracoes` → popula textareas
2. Usuário edita → state atualiza
3. Clica Salvar → `PUT /api/configuracoes` → status = "saved" (reseta após 3s)

---

## Sidebar

Adicionar ao `bottomNav` em `app-shell.tsx`:
```ts
{ to: "/configuracoes", label: "Configurações", icon: Settings }
```

---

## Fora do Escopo

- Validação de conteúdo
- Preview do markdown
- Histórico de versões
