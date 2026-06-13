---
name: lb-sistema-versionar
description: >
  Publica o trabalho do LBCode.IA no GitHub (commit + push + versionamento).
  Na primeira vez configura repositório remoto e branch main. Depois, sincroniza
  qualquer mudança com mensagem automática ou personalizada. Tudo fica documentado
  e recuperável. Use quando o usuário disser "salvar", "versionar", "commit",
  "sync github", "/sistema-salvar" ou pedir backup/histórico do trabalho.
---

# /lb-sistema-versionar — Publicar + Versionamento

Uma skill, uma função: garantir que tudo que você criar fica no GitHub, versionado e recuperável.
Não é só backup — é auditoria do seu operacional.

## Workflow

### Primeira vez (repo novo)

Detectar estado com `git rev-parse --is-inside-work-tree`. Se falhar (repo não existe):

1. Perguntar:
   > "Preciso publicar seu trabalho no GitHub. Você já tem um repositório criado?
   > • **Sim** — cola a URL (ex: https://github.com/sua-empresa/nome.git)
   > • **Não** — deixa comigo. Como você quer chamar? (ex: lb-marketing-operacao)"

2. **Se escolher Sim (repo existe):**
   ```
   git init
   git add .
   git commit -m "Operação LBCode.IA iniciada"
   git branch -M main
   git remote add origin <URL-do-usuario>
   git push -u origin main
   ```

3. **Se escolher Não (repo novo):**
   - Verificar se `gh` CLI existe (`gh --version`)
   - **Se sim:** rodar `git init`, commit inicial, depois `gh repo create <nome> --private --source=. --push`
   - **Se não:** instruir instalação (https://cli.github.com/) ou criar em github.com/new manualmente

**Resultado:** Repositório criado, main configurada, primeiro commit = marco zero

---

### Commits seguintes (já configurado)

Fluxo padrão pra cada execução:

1. **Verificar se tem mudança**
   ```
   git status
   ```
   Se limpo (nenhuma mudança), responder:
   > "Tá tudo atualizado. Sem mudança pra versionar."
   E parar.

2. **Mostrar o que vai subir**
   ```
   git status --short
   ```
   Exemplo:
   ```
   M  _memoria/estrategia.md
   M  marketing/conteudo/conteudo-carrossel-2026-06-01/index.html
   A  saidas/proposta-cliente-2026-06-01.pdf
   ```

3. **Pedir descrição ou gerar automática**
   > "Vi essas mudanças. Quer descrever em uma frase ou deixo automático?
   > Automático seria: '[auto] Atualiza estratégia + 3 carrosséis + proposta'"

4. **Se não responder**, gerar mensagem baseada em padrão:
   - Arquivo `_memoria/X.md` → "Atualiza contexto"
   - Pasta `marketing/conteudo/` → "Cria [N] carrosséis"
   - Pasta `marketing/campanhas/` → "Monta campanha [tipo]"
   - Pasta `saidas/` → "Entrega [tipo de arquivo]"
   - Múltiplas → "[multi] Atualiza estratégia, conteúdo, propostas"

5. **Commitar + pushar**
   ```
   git add .
   git commit -m "<mensagem>"
   git push
   ```

6. **Confirmar + link**
   Extrair URL remota com `git remote get-url origin`:
   > "✓ Sincronizado. Seu histórico:
   > 🔗 [GitHub](https://github.com/...)"

---

## Regras (críticas)

- **Nunca força:** `--force` só com permissão explícita do usuário
- **Nunca destrutivo:** sem `git reset --hard`, `git checkout .`, `git clean -f` sem warning claro
- **Divergência:** se push falhar (alguém comitou no remoto), oferecer `git pull --rebase` antes de retry
- **Git não configurado:** se `user.name` ou `user.email` não existir, perguntar + configurar com `git config --global`

---

## Integração com framework

Cada commit é um **marco da operação**:
- Estratégia mudou? Versiona
- Carrossel criado? Versiona
- Campanha montada? Versiona
- Proposta gerada? Versiona

GitHub fica sendo o **livro de razão do seu negócio** — quando precisar revisar o que foi feito, quando foi, por quê, tá tudo aqui.

Use também pra colaborar — se tiver equipe, cada um vê o histórico completo.
