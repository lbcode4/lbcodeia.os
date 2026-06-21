# 🎬 Vídeo 25 — `/lb-meta-copy`

> **Bloco 4 — Tráfego pago.** Duração alvo: 5–7 min · Sem front.

## 🎯 Objetivo do vídeo
Puxar os top performers do Meta Ads ao vivo via Graph API e gerar copy de anúncio nova a partir dos criativos vencedores (gatilho, copy, conversão alinhada ao posicionamento). Resolve a conta em `_memoria/contas-ads.md`.

## 💡 Dor → solução
- **Dor:** criar copy do zero ignora o que já funciona na conta.
- **Solução:** parte dos vencedores reais e gera variações alinhadas ao posicionamento.

## 🧠 Framework por trás
- **GCC** (gatilho/copy/conversão) aplicado aos criativos que já performam.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-meta-copy em .claude/skills/lb-meta-copy/SKILL.md.

Objetivo: gerar copy nova a partir dos top criativos da conta.
- Resolve a conta em _memoria/contas-ads.md; puxa os top performers via Graph API.
- Extrai o padrão vencedor e gera copy nova com GCC, alinhada ao posicionamento (RETINA).
- Saída: variações prontas pra testar.
- Gatilhos: "copy meta", "anúncio a partir dos top", "copy dos criativos vencedores",
  /lb-meta-copy.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-meta-copy em .claude/skills/lb-meta-copy/SKILL.md.
Puxa os criativos vencedores por CTR da Graph API v21.0 -> gera copy nova baseada nos
melhores.

FRONTMATTER:
- name: lb-meta-copy
- description: Puxa os top performers Meta Ads LIVE via Graph API e gera copy de anúncio
  nova a partir dos criativos vencedores (gatilho, copy, conversão alinhada ao
  posicionamento). Resolve a conta em _memoria/contas-ads.md. Gatilhos: "copy meta",
  "anúncio a partir dos top", "gerar copy facebook", "gerar copy instagram", "copy dos
  criativos vencedores", /lb-meta-copy.

DEPENDÊNCIAS: motor integracoes/meta-ads/scripts/criativos.py (top performers por CTR);
agente/método integracoes/meta-ads/agentes/agente-copy-meta.md; conta em
_memoria/contas-ads.md (resolve via --cliente); _memoria/framework-trafego.md (GCC +
RETINA); _memoria/empresa.md, estrategia.md, preferencias.md; credencial meta.env.

PASSOS:
1. Carregar contexto + voz de _memoria/.
2. Identificar o cliente; se não dito, listar os de contas-ads.md.
3. Rodar python integracoes/meta-ads/scripts/criativos.py --cliente "<Cliente>".
4. Ler os top criativos (títulos, textos, CTR de cada).
5. Camada framework (GCC + RETINA): usar os vencedores como base e gerar copy nova
   estruturada em Gatilho -> Copy -> Conversão, alinhada ao posicionamento (RETINA) —
   manter o que funcionou, elevar com os pilares GCC.
6. Devolver: copy pronta (título + texto principal + CTA) com justificativa do que foi
   aproveitado dos top performers.

ERROS: token faltando -> conferir meta.env e rodar meta_api.py --test; cliente não achado
-> listar disponíveis; NUNCA exibir o token.
```

## ⚙️ Como funciona
1. Roda `/lb-meta-copy` + cliente.
2. Puxa top performers → extrai padrão → gera copy nova.

## 🎥 Roteiro de gravação
1. **Gancho:** "Não crio copy do zero. Parto do que já está funcionando na conta."
2. Roda o comando.
3. Mostra o top performer e as variações geradas.
4. **Fechamento:** "Copy nova pronta pra subir. E pra ligar/desligar anúncios? Próximo vídeo."

## 🗣️ Gancho de abertura pronto
> "O melhor anúncio novo nasce do melhor anúncio antigo. Vou puxar os top performers e gerar variações alinhadas ao posicionamento."

## ✅ Demonstração ao vivo
- Top criativos + copy nova.

## 🔗 Pré-requisitos
- `/lb-ads-conectar` ok; conta com histórico.
</content>
