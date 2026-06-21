# 🎬 Vídeo 17 — `/lb-ads-conectar`

> **Bloco 4 — Tráfego pago.** Duração alvo: 7–9 min · Sem front.
> ⚠️ Vídeo com **credenciais** — esconder tokens reais, usar `.env.example`.
> **Pré-requisito de quase todo o Bloco 4.**

## 🎯 Objetivo do vídeo
Conectar e validar a integração Meta Ads (e Google Ads): conferir o token em `integracoes/credentials/meta.env`, testar a conexão com a Graph API, listar as contas de anúncio acessíveis e cadastrar cliente→conta em `_memoria/contas-ads.md`.

## 💡 Dor → solução
- **Dor:** as skills "live" não funcionam sem token válido + conta mapeada; erro silencioso frustra.
- **Solução:** um comando valida tudo e deixa o mapa cliente→conta pronto.

## 🧠 Framework por trás
Infra das **4 Campanhas de Ouro** e de todos os dashboards live. Sem isso, nada do Meta/Google live roda.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-ads-conectar em .claude/skills/lb-ads-conectar/SKILL.md.

Objetivo: conectar e validar integração de ads (Meta + Google).
- Lê o token em integracoes/credentials/meta.env.
- Testa a conexão com a Graph API e trata erro de token (expirado/sem permissão).
- Lista as ad accounts acessíveis pelo token.
- Ajuda a cadastrar a relação cliente → conta em _memoria/contas-ads.md
  (colunas Meta Ad Account e Google Ads ID).
- NUNCA imprimir o token na tela; mascarar.
- Gatilhos: "conectar meta", "conectar google ads", "validar token",
  "cadastrar cliente ads", /lb-ads-conectar.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-ads-conectar em .claude/skills/lb-ads-conectar/SKILL.md.
Valida credenciais e popula o mapa de contas — Meta e Google.

FRONTMATTER:
- name: lb-ads-conectar
- description: Conecta e valida a integração Meta Ads: confere o token em
  integracoes/credentials/meta.env, testa a conexão com a Graph API, lista as contas de
  anúncio acessíveis e ajuda a cadastrar cliente->conta em _memoria/contas-ads.md.
  Suporta Meta e Google Ads. Gatilhos: "conectar meta", "conectar google ads",
  "validar token", "cadastrar cliente ads", /lb-ads-conectar.

DEPENDÊNCIAS (motor): integracoes/meta-ads/scripts/meta_api.py (--test),
integracoes/meta-ads/scripts/conectar.py (lista contas); credencial
integracoes/credentials/meta.env (gitignored); mapa _memoria/contas-ads.md (seção
## Contas Conectadas).

PASSOS META:
1. Token existe? Conferir meta.env. Se faltar/placeholder (SEU_TOKEN_AQUI): instruir
   "cp integracoes/credentials/meta.env.example integracoes/credentials/meta.env", pedir
   o META_ACCESS_TOKEN e gravar (NUNCA exibir o token em resposta/log).
2. Validar conexão: rodar python integracoes/meta-ads/scripts/meta_api.py --test. Falha
   = mostrar erro limpo e parar (token inválido/expirado).
3. Listar contas: rodar python integracoes/meta-ads/scripts/conectar.py e mostrar tabela
   nome | act_id | status.
4. Cadastrar cliente: perguntar conta + nome do cliente + (opcional) IG User ID + Handle
   IG; adicionar/atualizar linha em contas-ads.md (não duplicar — atualizar). Headers da
   tabela intactos: Cliente | Meta Ad Account | IG User ID | Handle IG | Google Ads ID | Ativo.
5. Confirmar: mostrar a linha cadastrada e lembrar que as skills /meta-* resolvem por
   --cliente "<Nome>".

CONECTAR GOOGLE ADS (opcional):
1. Credencial existe? Conferir integracoes/credentials/google-ads.yaml. Se faltar/
   placeholder: instruir cp do .example e explicar que precisa developer_token,
   client_id, client_secret, refresh_token, login_customer_id (NUNCA exibir).
2. Cadastrar Google Ads ID do cliente (customer_id 123-456-7890 ou 1234567890) na coluna
   Google Ads ID da linha do cliente.
3. Validar: rodar python integracoes/google-ads/lib/dashboard_google.py --cliente
   "<Cliente>"; autenticou e puxou dado = conectado; erro de auth = credencial incompleta.

SEGURANÇA: NUNCA exibir META_ACCESS_TOKEN em resposta/log; meta.env é gitignored (nunca
commitar); conectar.py só mostra ids/nomes, nunca o token.
```

## ⚙️ Como funciona
1. Roda `/lb-ads-conectar`.
2. Valida token → lista contas.
3. Cadastra cliente→conta em `contas-ads.md`.

## 🎥 Roteiro de gravação
1. **Gancho:** "Sem essa conexão, nenhuma skill de ads ao vivo funciona. Vou configurar a base."
2. Mostra o `.env.example` (sem token real).
3. Roda o comando, mostra a lista de contas (mascarando IDs sensíveis).
4. Cadastra o cliente em `contas-ads.md`.
5. **Fechamento:** "Conectado. Agora vamos criar campanhas — começando pelo Google Ads."

## 🗣️ Gancho de abertura pronto
> "Antes de qualquer relatório ao vivo, preciso conectar minha conta de anúncios. Vou validar o token e mapear a conta do cliente em um comando."

## ✅ Demonstração ao vivo
- Lista de contas + linha nova em `contas-ads.md`.

## 🔗 Pré-requisitos
- Token Meta (App + permissões `ads_read`); estrutura `integracoes/`.
</content>
