# integracoes/meta-ads

Motor Python da integração Meta Ads live (Graph API v21.0).
Portado de META_ADS. Skills `lb-meta-*` em `.claude/skills/` consomem estes scripts.

- `scripts/meta_api.py` — MetaAPIClient (token em `integracoes/credentials/meta.env`)
- `scripts/contas.py` — resolve cliente→conta via `_memoria/contas-ads.md`
- `scripts/relatorio.py` — dashboard HTML completo
- `scripts/{diagnostico,auditoria,reels,criativos,gerenciar}.py` — funções específicas
- `tests/` — `pytest integracoes/meta-ads/ -v`

Conta resolvida por `--cliente "<Nome>"` (casa com `_memoria/contas-ads.md`).
Credenciais NUNCA commitadas (gitignored).

## Setup
```bash
pip install -r requirements.txt          # na raiz do repo
cp integracoes/credentials/meta.env.example integracoes/credentials/meta.env
# preencher META_ACCESS_TOKEN
python integracoes/meta-ads/scripts/meta_api.py --test
```
