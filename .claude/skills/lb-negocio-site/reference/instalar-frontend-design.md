# Instalar a skill frontend-design (só se estiver faltando)

Checar se `frontend-design` está disponível. Se não estiver em `.claude/skills/frontend-design/`
nem em `~/.claude/skills/frontend-design/`, instalar a skill oficial (`anthropics/skills/frontend-design`)
no projeto:

```bash
DEST=.claude/skills/frontend-design
if [ ! -f "$DEST/SKILL.md" ] && [ ! -f "$HOME/.claude/skills/frontend-design/SKILL.md" ]; then
  mkdir -p "$DEST"
  # 1) tentar o marketplace oficial já presente na máquina
  SRC=$(find "$HOME/.claude/plugins" -type d -path "*frontend-design/skills/frontend-design" 2>/dev/null | head -1)
  if [ -n "$SRC" ]; then
    cp -r "$SRC/." "$DEST/"
  else
    # 2) fallback: clonar do repositório oficial anthropics/skills
    TMP=$(mktemp -d)
    git clone --depth 1 https://github.com/anthropics/skills "$TMP" \
      && cp -r "$TMP/frontend-design/." "$DEST/"
    rm -rf "$TMP"
  fi
fi
```

Confirmar que `.claude/skills/frontend-design/SKILL.md` existe antes de seguir.
