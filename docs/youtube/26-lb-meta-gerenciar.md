# 🎬 Vídeo 26 — `/lb-meta-gerenciar`

> **Bloco 4 — Tráfego pago.** Duração alvo: 5–7 min · Sem front.
> ⚠️ Skill com **mutação ao vivo** (pausa/ativa anúncio real) — mostrar a confirmação obrigatória.

## 🎯 Objetivo do vídeo
Buscar, pausar ou ativar anúncios Meta Ads ao vivo via Graph API, com confirmação obrigatória antes de qualquer ação destrutiva. Toda ação fica em log de auditoria. Resolve a conta em `_memoria/contas-ads.md`.

## 💡 Dor → solução
- **Dor:** abrir o Gerenciador só pra pausar um anúncio ruim é fricção.
- **Solução:** pausar/ativar pelo terminal — com trava de confirmação e log.

## 🧠 Framework por trás
- Execução das decisões da auditoria/diagnóstico (fecha o loop de otimização).

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-meta-gerenciar em .claude/skills/lb-meta-gerenciar/SKILL.md.

Objetivo: buscar, pausar e ativar anúncios Meta Ads LIVE via Graph API.
- Resolve a conta em _memoria/contas-ads.md.
- Lista anúncios; permite pausar/ativar.
- SEMPRE pedir confirmação explícita antes de qualquer ação (mutação irreversível).
- Registrar toda ação em log de auditoria (quem, o quê, quando).
- Gatilhos: "pausar anúncio", "ativar anúncio", "desligar anúncio",
  "gerenciar anúncios meta", /lb-meta-gerenciar.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-meta-gerenciar em .claude/skills/lb-meta-gerenciar/SKILL.md.
Operação destrutiva: puxa dados reais da Graph API v21.0 e executa pause/activate com
confirmação obrigatória.

FRONTMATTER:
- name: lb-meta-gerenciar
- description: Busca, pausa ou ativa anúncios Meta Ads LIVE via Graph API com confirmação
  obrigatória antes de qualquer ação destrutiva. Toda ação é registrada em log de
  auditoria. Resolve a conta em _memoria/contas-ads.md. Gatilhos: "pausar anúncio",
  "ativar anúncio", "gerenciar anúncios meta", "desligar anúncio", /lb-meta-gerenciar.

DEPENDÊNCIAS: motor integracoes/meta-ads/scripts/gerenciar.py; conta em
_memoria/contas-ads.md (resolve via --cliente); _memoria/empresa.md, estrategia.md,
preferencias.md; credencial meta.env; log de auditoria
integracoes/meta-ads/output/acoes-log.json.

REGRA CRÍTICA (destrutiva): SEMPRE confirmar com o usuário antes de pause/activate;
mostrar nome + status atual do anúncio antes de agir; toda ação grava entrada no
acoes-log.json; NUNCA pausar/ativar sem confirmação explícita.

COMANDOS DO MOTOR:
- Buscar: gerenciar.py --action search --name "<termo>"
- Pausar: gerenciar.py --action pause --ad-id <id>
- Ativar: gerenciar.py --action activate --ad-id <id>

PASSOS:
1. Carregar contexto + voz de _memoria/.
2. Identificar o cliente; se não dito, listar os de contas-ads.md.
3. Buscar anúncios por nome/termo (--action search).
4. Mostrar resultados: nome, ID, status atual (ATIVO/PAUSADO).
5. Confirmar: perguntar qual pausar/ativar e aguardar confirmação explícita ("sim", "pode
   pausar"). NÃO executar sem confirmação.
6. Executar a ação confirmada (--action pause/activate --ad-id <id>).
7. Reportar o resultado e confirmar que foi gravado em acoes-log.json.

ERROS: token faltando -> conferir meta.env e rodar meta_api.py --test; cliente não achado
-> listar disponíveis; NUNCA exibir o token; anúncio não encontrado -> pedir refinar o
termo.
```

## ⚙️ Como funciona
1. Roda `/lb-meta-gerenciar` + cliente.
2. Lista anúncios → escolhe ação.
3. Confirma → executa → grava log.

## 🎥 Roteiro de gravação
1. **Gancho:** "Pausar um anúncio ruim sem abrir o Gerenciador — pelo terminal, com segurança."
2. Roda o comando, lista anúncios.
3. Pausa um → **mostra a confirmação obrigatória**.
4. Mostra o log de auditoria.
5. **Fechamento:** "Controle total. Agora, qual Reel vale impulsionar?"

## 🗣️ Gancho de abertura pronto
> "Vou pausar e ativar anúncios direto do terminal — com uma trava de confirmação pra não ter acidente, e registrando tudo num log."

## ✅ Demonstração ao vivo
- Ação com confirmação + log gravado.

## 🔗 Pré-requisitos
- `/lb-ads-conectar` ok; token com permissão de escrita (`ads_management`).
</content>
