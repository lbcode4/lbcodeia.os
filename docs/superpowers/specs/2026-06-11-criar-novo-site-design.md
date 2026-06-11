# Criar Novo Site — Design

**Data:** 2026-06-11
**Branch:** v3

---

## Objetivo

Adicionar botão "Novo Site" na página `/sites` que permite criar um novo site com nome personalizado, gerando o ID e o HTML inicial automaticamente, e redirecionando para o editor.

---

## Backend

**Arquivo modificado:** `server/src/sites.ts`
**Registro em:** `server/src/server.ts`

### Nova função `createSite(name: string): Promise<string>`

1. Gera ID: `${slugify(name)}-${YYYY-MM-DD}` (data atual)
2. Cria diretório `marketing/sites/{id}/`
3. Escreve `marketing/sites/{id}/index.html` com starter HTML
4. Retorna o `id` gerado

**Função slugify** (sem acentos, lowercase, espaços → hífens):
```ts
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
```

**Starter HTML:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Site</title>
  <style>body { font-family: sans-serif; margin: 0; padding: 40px; }</style>
</head>
<body>
  <h1>Meu Site</h1>
  <p>Use o assistente para personalizar este site.</p>
</body>
</html>
```

### Endpoint `POST /api/sites`

- Body: `{ name: string }`
- Retorna: `{ id: string }`
- 400 se body malformado ou `name` ausente/vazio

---

## Frontend

**Arquivo modificado:** `frontend/src/routes/sites.index.tsx`

### UI

Botão "Novo Site" (ícone `Plus`) posicionado ao lado do título da página via `PageHeader` action slot ou inline no topo.

Ao clicar:
- Exibe input inline (sem modal) com placeholder "Nome do site"
- Enter ou botão "Criar" → POST → navigate para `/sites/${id}`
- Escape ou botão X → cancela, volta ao estado normal

### State

```ts
const [creating, setCreating] = useState(false)
const [newName, setNewName] = useState("")
const [isCreating, setIsCreating] = useState(false)
```

### Fluxo

1. `creating = false` → exibe botão "Novo Site"
2. Click → `creating = true` → exibe input inline
3. Submit → `isCreating = true` → POST `/api/sites` → navigate `/sites/${id}`
4. Escape → `creating = false`, `newName = ""`

---

## Fora do Escopo

- Validação de nome duplicado
- Template selector (múltiplos templates de início)
- Upload de assets ao criar
