---
name: lb-meta-gerenciar
description: >
  Busca, pausa ou ativa anúncios Meta Ads LIVE via Graph API com confirmação obrigatória
  antes de qualquer ação destrutiva. Toda ação é registrada em log de auditoria.
  Resolve a conta do cliente em _memoria/contas-ads.md. Use quando o usuário pedir
  "pausar anúncio", "ativar anúncio", "gerenciar anúncios meta", "desligar anúncio",
  ou /lb-meta-gerenciar.
---

# /lb-meta-gerenciar — Pausar/ativar anúncios Meta (live, mutate)

Operação destrutiva. Puxa dados reais da Graph API v21.0 e executa pause/activate com confirmação obrigatória.

## Dependências
- **Motor:** `integracoes/meta-ads/scripts/gerenciar.py`
- **Conta:** `_memoria/contas-ads.md` (resolve via --cliente)
- **Contexto/voz:** `_memoria/empresa.md`, `estrategia.md`, `preferencias.md`
- **Credencial:** `integracoes/credentials/meta.env` (validar com `python integracoes/meta-ads/scripts/meta_api.py --test`; skill `/lb-ads-conectar` chega no Plano 2)
- **Log de auditoria:** `integracoes/meta-ads/output/acoes-log.json`

## Regra critica (operacao destrutiva)

SEMPRE confirmar com o usuário antes de executar `pause` ou `activate`.
Mostrar nome + status atual do anuncio antes de agir.
Toda acao executada grava entrada em `integracoes/meta-ads/output/acoes-log.json` (auditoria permanente).
NUNCA pausar ou ativar sem confirmacao explicita do usuario.

## Comandos do motor

- **Buscar:** `python integracoes/meta-ads/scripts/gerenciar.py --action search --name "<termo>"`
- **Pausar:** `python integracoes/meta-ads/scripts/gerenciar.py --action pause --ad-id <id>`
- **Ativar:** `python integracoes/meta-ads/scripts/gerenciar.py --action activate --ad-id <id>`

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Identificar o cliente. Se não dito, listar os de `_memoria/contas-ads.md`.
3. **Buscar** os anuncios pelo nome ou termo informado:
   `python integracoes/meta-ads/scripts/gerenciar.py --action search --name "<termo>"`
4. **Mostrar resultados** ao usuario: nome do anuncio, ID, status atual (ATIVO/PAUSADO).
5. **Confirmar:** perguntar ao usuario qual anuncio quer pausar/ativar e aguardar confirmacao explicita ("sim", "pode pausar", etc). NAO executar sem confirmacao.
6. **Executar** a acao confirmada:
   - Pausar: `python integracoes/meta-ads/scripts/gerenciar.py --action pause --ad-id <id>`
   - Ativar: `python integracoes/meta-ads/scripts/gerenciar.py --action activate --ad-id <id>`
7. **Reportar** o resultado ao usuario e confirmar que a acao foi gravada em `integracoes/meta-ads/output/acoes-log.json`.

## Erros
- Token faltando → conferir `integracoes/credentials/meta.env` e rodar `python integracoes/meta-ads/scripts/meta_api.py --test`.
- Cliente não achado → listar disponíveis de `_memoria/contas-ads.md`.
- NUNCA exibir o token em resposta/log.
- Anuncio não encontrado na busca → pedir ao usuario que refine o termo.
