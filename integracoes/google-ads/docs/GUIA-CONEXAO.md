# Guia — Conectar Google Ads API do zero

Passo a passo completo pra conectar uma conta Google Ads à integração
(`integracoes/google-ads/`), com todas as pegadinhas já resolvidas na
primeira conexão (jul/2026, conta LBCode.IA).

## Visão geral — 5 credenciais no `google-ads.yaml`

| Campo | De onde vem |
|-------|-------------|
| `developer_token` | Google Ads → MCC → Adm. → Central de APIs |
| `client_id` | Google Cloud Console → OAuth client (**Desktop app**) |
| `client_secret` | idem |
| `refresh_token` | gerado localmente via fluxo OAuth (script) |
| `login_customer_id` | ID da MCC, só números (ex: `7367295825`) |

Arquivo final: `integracoes/credentials/google-ads.yaml` (gitignored).
A lib lê **só esse yaml** — variáveis no `.env` raiz são ignoradas.

## Estrutura de contas

```
MCC (conta "Gerente", ex: 736-729-5825)  ← developer token + login_customer_id
 └── conta de anúncios (ex: 145-907-1676) ← customer_id do cliente
```

- MCC não roda anúncio; é só a "pasta" que o Google exige pra emitir token de API.
- Conta de anúncios existente NÃO muda nada ao ser vinculada (campanhas/verba intactas).
- Cadastrar o customer_id na coluna `Google Ads ID` de `_memoria/contas-ads.md`.

## Passo 1 — Developer token (MCC)

1. Google Ads → seletor de conta (perfil, canto sup. direito) → entrar na MCC
   (rótulo "Gerente"). Se pedir "concluir configuração", finalizar antes.
2. **Adm. → Central de APIs** → aceitar termos → token aparece.
3. Formulário "Tipo de empresa": **Agência/SEM** (gerencia contas próprias + clientes).
4. Token nasce em **"Acesso de teste"** — SÓ funciona com conta de teste.
   Erro na conta real: `The developer token is only approved for use with test accounts`.
   → Pedir **"Acesso básico"** (formulário; ver seção "Formulário Basic Access").

## Passo 2 — OAuth client (Google Cloud Console)

1. console.cloud.google.com → projeto → **APIs & Services → Library** →
   habilitar **Google Ads API** (esquecer esse passo dá erro
   `Google Ads API has not been used in project ... or it is disabled`).
2. **OAuth consent screen** (Google Auth Platform): External. Em modo "Testing",
   adicionar o email como **test user** (aba Público-alvo), senão dá
   `403 access_denied`. App "Em produção" dispensa test user (tela
   "app não verificado" → Avançado → Acessar).
3. **Credentials → Create → OAuth client ID → tipo "App para computador" (Desktop)**.
   ⚠️ NUNCA "Aplicativo da Web" — dá `400 redirect_uri_mismatch` no fluxo local.
   Desktop aceita qualquer `http://127.0.0.1:porta` sem cadastrar URI.
4. Client secret (`GOCSPX-...`) só aparece na criação — copiar na hora ou
   baixar o JSON. Perdeu? "+ Add secret" na página do client.

## Passo 3 — refresh_token (local)

Script vem com a lib (`.venv` do projeto já tem `google-ads` instalada):

```bash
.venv/lib/python3.12/site-packages/examples/authentication/generate_user_credentials.py
```

Pegadinhas:
- Script exige `-c client_secrets.json` (não aceita `--client_id/--client_secret`).
  Formato do JSON: `{"installed": {"client_id": ..., "client_secret": ...,
  "auth_uri": ..., "token_uri": ..., "redirect_uris": ["http://127.0.0.1"]}}`.
  Salvar em `integracoes/credentials/client_secrets.json` (gitignored via `*.json`).
- Porta padrão 8080 costuma estar ocupada pelo server dev → copiar script e
  trocar `_PORT = 8080` por porta livre (ex: 8089).
- Rodar com `python -u` — sem isso, com `| tee` a URL fica presa no buffer
  e a tela fica vazia enquanto o script espera o callback.

```bash
.venv/bin/python -u gen_refresh_token.py -c integracoes/credentials/client_secrets.json
```

Abrir URL impressa → logar com a conta Google dona da MCC → autorizar →
token sai no terminal ("Your refresh token is: ...") → gravar no yaml.

## Passo 4 — Vincular conta de anúncios à MCC

1. Na MCC: **Contas → Configurações da subconta → botão + → Vincular conta existente**
   → digitar customer_id → **"Enviar solicitação"** (não só "Visualizar").
2. Na conta de anúncios: **Adm. → Acesso e segurança → aba "Administradores"**
   (NÃO "Usuários") → aceitar o convite.
3. Conferir envio: MCC → aba "Pedidos de vinculação enviados".

Sem vínculo, API dá `User doesn't have permission to access customer`.

## Passo 5 — Validar

```bash
.venv/bin/python integracoes/google-ads/lib/dashboard_google.py --cliente "<Cliente>"
```

Puxou KPI = conectado. A partir daí funcionam `/lb-google-dashboard`,
`/lb-ads-negativas`, `/lb-ads-unificado`.

## Sequência de erros até funcionar (ordem real)

| Erro | Causa | Fix |
|------|-------|-----|
| `unrecognized arguments: --client_id` | versão nova do script OAuth | usar `-c client_secrets.json` |
| `Address already in use` (8080) | server dev na porta | trocar `_PORT` no script |
| tela vazia rodando script | buffer do Python com pipe | `python -u` |
| `400 redirect_uri_mismatch` | client OAuth tipo "Web" | recriar como **Desktop app** |
| `403 access_denied` | consent screen em teste sem test user | add test user OU publicar app |
| `API has not been used / disabled` | Google Ads API não habilitada no projeto | Enable na Library |
| `User doesn't have permission` | conta não vinculada à MCC | Passo 4 |
| `token only approved for test accounts` | developer token nível teste | pedir Basic Access |

## Formulário Basic Access (respostas que funcionam)

- Design doc obrigatório (PDF) — modelo pronto:
  `integracoes/google-ads/docs/lbcode-ads-reporting-tool-design.pdf`
- MCC ID: `736-729-5825` | Contact: lbcodeia@gmail.com
- Google representative: **No**
- Business model: agência que gerencia contas próprias + clientes via MCC;
  ferramenta interna de reporting read-only (GAQL/SearchStream); não é produto
  comercial; dados não vão pra terceiros.
- Who has access: **Internal users - employees only**
- Tool by someone else: **No** (client library oficial não conta)
- App Conversion Tracking API: **No**
- Campaign types: `Search, Performance Max, Display, Video, Shopping`
- Capabilities: **só "Reporting"** (marcar mais = pergunta extra do revisor)
- Aprovação: ~1-3 dias úteis, resposta por email.

## Cliente novo (conexão já feita)

Só 2 passos:
1. Vincular a conta do cliente à MCC (Passo 4).
2. Preencher `Google Ads ID` na linha do cliente em `_memoria/contas-ads.md`.
Credenciais (yaml) são as mesmas pra todos os clientes da MCC.
