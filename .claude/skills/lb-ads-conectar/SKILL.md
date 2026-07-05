---
name: lb-ads-conectar
description: >
  Conecta e valida a integração Meta Ads: confere o token em integracoes/credentials/meta.env,
  testa a conexão com a Graph API, lista as contas de anúncio acessíveis pelo token e ajuda a
  cadastrar cliente→conta em _memoria/contas-ads.md. Suporta Meta e Google Ads. Use quando o usuário
  pedir "conectar meta", "conectar google ads", "configurar meta ads", "validar token", "adicionar
  conta de cliente", "cadastrar cliente ads", ou /lb-ads-conectar.
---

# /lb-ads-conectar — Conectar Meta + Google Ads (validar + cadastrar conta)

Valida credenciais e popula o mapa de contas. Meta e Google.

## Dependências
- **Motor:** `integracoes/meta-ads/scripts/meta_api.py` (`--test`), `conectar.py` (lista contas)
- **Credencial:** `integracoes/credentials/meta.env` (gitignored)
- **Mapa:** `_memoria/contas-ads.md` (seção `## Contas Conectadas`)

## Passos
1. **Token existe?** Conferir `integracoes/credentials/meta.env`. Se faltar ou estiver placeholder (`SEU_TOKEN_AQUI`):
   - instruir: `cp integracoes/credentials/meta.env.example integracoes/credentials/meta.env`
   - pedir o `META_ACCESS_TOKEN` e gravar no arquivo (NUNCA exibir o token em resposta/log).
2. **Validar conexão:** rodar `python integracoes/meta-ads/scripts/meta_api.py --test`.
   - Falha → mostrar o erro limpo e parar (token inválido/expirado).
3. **Listar contas acessíveis:** rodar `python integracoes/meta-ads/scripts/conectar.py`.
   - Mostrar tabela ao usuário: nome | act_id | status.
4. **Cadastrar cliente:** perguntar qual conta cadastrar + nome do cliente + (opcional) IG User ID + Handle IG.
   - Adicionar/atualizar a linha em `_memoria/contas-ads.md` (não duplicar cliente já existente — atualizar a linha).
   - Manter os headers da tabela intactos: `Cliente | Meta Ad Account | IG User ID | Handle IG | Google Ads ID | Ativo`.
5. **Confirmar:** mostrar a linha cadastrada e lembrar que as skills `/meta-*` já resolvem por `--cliente "<Nome>"`.

## Conectar Google Ads (opcional)

> Guia completo do zero (credenciais, OAuth, MCC, erros comuns, formulário Basic Access):
> `integracoes/google-ads/docs/GUIA-CONEXAO.md`
1. **Credencial existe?** Conferir `integracoes/credentials/google-ads.yaml`. Se faltar ou placeholder:
   - instruir: `cp integracoes/credentials/google-ads.yaml.example integracoes/credentials/google-ads.yaml`
   - explicar que precisa: `developer_token` (aprovação no Google Ads API Center), `client_id`,
     `client_secret`, `refresh_token`, `login_customer_id`. NUNCA exibir esses valores em resposta/log.
2. **Cadastrar Google Ads ID do cliente:** pedir o customer_id (formato 123-456-7890 ou 1234567890)
   e gravar na coluna `Google Ads ID` da linha do cliente em `_memoria/contas-ads.md`.
3. **Validar:** rodar `python integracoes/google-ads/lib/dashboard_google.py --cliente "<Cliente>"`
   — se autenticar e puxar dado, está conectado. Erro de auth = credencial incompleta.

## Segurança
- NUNCA exibir `META_ACCESS_TOKEN` em resposta ou log.
- `meta.env` é gitignored — nunca commitar.
- `conectar.py` só mostra ids/nomes de contas, nunca o token.
