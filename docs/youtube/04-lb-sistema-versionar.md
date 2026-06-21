# 🎬 Vídeo 04 — `/lb-sistema-versionar`

> **Bloco 1 — Núcleo.** Duração alvo: 4–6 min · Sem front.

## 🎯 Objetivo do vídeo
Mostrar como publicar o trabalho no GitHub (commit + push + versionamento). Na primeira vez configura o repositório remoto e a branch main; depois sincroniza qualquer mudança com mensagem automática ou personalizada.

## 💡 Dor → solução
- **Dor:** trabalho espalhado, sem backup, sem histórico — se o PC morre, morre tudo.
- **Solução:** um comando versiona tudo. Recuperável, auditável, com histórico.

## 🧠 Framework por trás
Princípio do sistema: **tudo versionado, mensurado, repetível.** Versionamento é o que torna o método auditável.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-sistema-versionar em .claude/skills/lb-sistema-versionar/SKILL.md.

Objetivo: publicar o trabalho do LBCode.IA no GitHub.
- Primeira execução: detecta se há remote; se não, ajuda a criar o repo e a branch main.
- Execuções seguintes: git add + commit + push, com mensagem automática ou personalizada.
- Mostra o que será commitado antes de enviar.
- Gatilhos: "salvar", "versionar", "commit", "sync github", /lb-sistema-versionar.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-sistema-versionar em .claude/skills/lb-sistema-versionar/SKILL.md.

FRONTMATTER:
- name: lb-sistema-versionar
- description: Publica o trabalho do LBCode.IA no GitHub (commit + push + versionamento).
  Na primeira vez configura repositório remoto e branch main. Depois sincroniza qualquer
  mudança com mensagem automática ou personalizada. Use quando disser "salvar",
  "versionar", "commit", "sync github", "/sistema-salvar".

OBJETIVO: garantir que tudo que você cria fica no GitHub, versionado e recuperável.
Não é só backup — é a auditoria do operacional.

WORKFLOW — PRIMEIRA VEZ (repo novo): detectar com git rev-parse --is-inside-work-tree.
Se falhar, perguntar se já tem repositório:
- Sim (cola URL): git init; git add .; git commit -m "Operação LBCode.IA iniciada";
  git branch -M main; git remote add origin <URL>; git push -u origin main.
- Não: checar gh --version. Se existe: git init + commit inicial +
  gh repo create <nome> --private --source=. --push. Se não: instruir instalar
  (cli.github.com) ou criar em github.com/new.
Resultado: repo criado, main configurada, primeiro commit = marco zero.

WORKFLOW — COMMITS SEGUINTES:
1. git status. Se limpo: "Tá tudo atualizado. Sem mudança pra versionar." e PARAR.
2. Mostrar o que vai subir com git status --short.
3. Perguntar "Quer descrever em uma frase ou deixo automático?" mostrando a sugestão
   automática.
4. Se não responder, gerar mensagem por padrão:
   - _memoria/X.md -> "Atualiza contexto"
   - saidas/marketing/conteudo/ -> "Cria [N] carrosséis"
   - saidas/marketing/campanhas/ -> "Monta campanha [tipo]"
   - saidas/ -> "Entrega [tipo de arquivo]"
   - múltiplas -> "[multi] Atualiza estratégia, conteúdo, propostas"
5. git add . ; git commit -m "<mensagem>" ; git push.
6. Confirmar + link: pegar git remote get-url origin e mostrar "✓ Sincronizado.
   🔗 [GitHub](...)".

REGRAS CRÍTICAS:
- Nunca --force sem permissão explícita.
- Nada destrutivo (git reset --hard, git checkout ., git clean -f) sem warning claro.
- Push falhou por divergência: oferecer git pull --rebase antes de retry.
- Git sem user.name/user.email: perguntar e configurar com git config --global.

INTEGRAÇÃO: cada commit é um marco da operação (estratégia, carrossel, campanha,
proposta). O GitHub vira o livro-razão do negócio e permite colaboração com equipe.
```

## ⚙️ Como funciona
1. Roda `/lb-sistema-versionar`.
2. Checa remote/branch (configura se for a 1ª vez).
3. Mostra o diff a ser commitado.
4. Commit + push com mensagem.

## 🎥 Roteiro de gravação
1. **Gancho:** "Todo o meu sistema fica salvo e recuperável com 1 comando."
2. Faz uma mudança qualquer.
3. Roda `/lb-sistema-versionar` → mostra commit + push.
4. Abre o GitHub no navegador mostrando o commit recém-chegado.
5. **Fechamento:** "Núcleo pronto. Agora vamos isolar o trabalho de cada cliente."

## 🗣️ Gancho de abertura pronto
> "Se seu trabalho não está versionado, ele não existe. Vou mostrar como salvo tudo no GitHub sem decorar comando de git."

## ✅ Demonstração ao vivo
- Commit aparecendo no GitHub.

## 🔗 Pré-requisitos
- Conta GitHub + `gh` ou git configurado.
</content>
