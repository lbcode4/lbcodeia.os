# 🎬 Vídeo 08 — `/lb-conteudo-reels`

> **Bloco 2 — Conteúdo.** Duração alvo: 5–7 min · Sem front.

## 🎯 Objetivo do vídeo
Criar roteiro completo de Reels: gancho nos 3 primeiros segundos, desenvolvimento, CTA — com direção de cena, legenda e sugestão de trilha. Baseado em RETINA + método dos 4 tipos de gancho.

## 💡 Dor → solução
- **Dor:** travar na frente da câmera sem roteiro; Reels sem gancho morre nos 3s.
- **Solução:** roteiro pronto pra gravar, com gancho testado e direção de cena.

## 🧠 Framework por trás
- **RETINA** define o ângulo de posicionamento do vídeo.
- **4 tipos de gancho** garantem retenção nos primeiros segundos.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-conteudo-reels em .claude/skills/lb-conteudo-reels/SKILL.md.

Objetivo: gerar roteiro completo de Reels pronto pra gravar.
- Estrutura: gancho (3s) → desenvolvimento → CTA.
- Aplica RETINA pro ângulo e o método dos 4 tipos de gancho.
- Entrega: roteiro falado, direção de cena, legenda e sugestão de trilha.
- Lê _memoria/ pra calibrar tom e nicho.
- Gatilhos: "roteiro de reels", "script de vídeo", "vídeo pro instagram",
  "roteiro pra gravar", /lb-conteudo-reels.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-conteudo-reels em .claude/skills/lb-conteudo-reels/SKILL.md.

FRONTMATTER:
- name: lb-conteudo-reels
- description: Cria roteiro completo para Reels com gancho nos 3 primeiros segundos,
  desenvolvimento, CTA — com direção de cena, legenda e sugestão de trilha. Baseado em
  RETINA e método dos 4 tipos de gancho. Use quando pedir "roteiro de reels", "script
  de vídeo", "reel", "vídeo curto", "vídeo pro instagram", "roteiro pra gravar",
  /lb-conteudo-reels.

DEPENDÊNCIAS: _memoria/framework-trafego.md (OBRIGATÓRIO — RETINA + 4 ganchos),
_memoria/empresa.md, _memoria/preferencias.md. Output em
saidas/marketing/conteudo/reels/<tema>-<YYYY-MM-DD>/roteiro.md.

PILARES RETINA (definir antes — define o ângulo do roteiro): R Resultado (antes/depois),
E Educação (ensinar algo útil), T Tendência (onda do momento), I Inspiração
(motivacional + crença), N Novidade (lançamento/feature), A Autenticidade
(bastidores/processo real).

4 TIPOS DE GANCHO (escolher 1, nunca misturar): Polêmica, Promessa, Curiosidade,
Identificação.

WORKFLOW:
Passo 1 — parâmetros: tema; pilar RETINA (sugerir o mais adequado se não informado);
duração alvo (15/30/60/90s); formato (talking head = pessoa fala pra câmera, roteiro
com fala / narração off = voz em off + texto na tela).
Passo 2 — gerar roteiro em markdown com: cabeçalho (pilar, duração, formato, tipo de
gancho); GANCHO (0-3s) = texto na tela (máx 7 palavras, TODAS MAIÚSCULAS) + fala + ação;
DESENVOLVIMENTO em blocos numerados (cada um com fala / tela / ação); CTA (últimos 5-8s)
com fala / tela / ação; Direção técnica (trilha sugerida, ritmo de corte, texto na tela);
Publicação (legenda completa, 5-8 hashtags mix nicho+produto, melhor horário).
Passo 3 — salvar no caminho acima.
Passo 4 — oferecer adicionar ao calendário (/lb-conteudo-calendario) e criar stories
complementar (/lb-conteudo-stories).

REFERÊNCIA DE DURAÇÃO: 15s = gancho 3s + 1 bloco 7s + CTA 5s; 30s = 3s + 2 blocos 20s +
CTA 7s; 60s = 3s + 3-4 blocos 47s + CTA 10s; 90s = 3s + 5-6 blocos 77s + CTA 10s.

REGRAS: gancho nos 3 primeiros segundos sempre (sem exceção); 1 ideia por reel; CTA único
e claro; direção de cena obrigatória; adaptar à estrutura do formato (talking head vs
narração off); RETINA define o ângulo; as 2 primeiras linhas da legenda repetem o gancho.
```

## ⚙️ Como funciona
1. Roda `/lb-conteudo-reels` + tema.
2. Escolhe o tipo de gancho.
3. Entrega roteiro + cena + legenda + trilha.

## 🎥 Roteiro de gravação
1. **Gancho:** "Nunca mais trave na frente da câmera."
2. Roda o comando.
3. Lê o roteiro gerado em voz alta como se fosse gravar.
4. **Fechamento:** "Reels engaja. Stories conversa — próximo vídeo."

## 🗣️ Gancho de abertura pronto
> "O gancho dos 3 primeiros segundos decide se seu Reels viraliza ou morre. Vou gerar um roteiro com gancho pronto pra gravar agora."

## ✅ Demonstração ao vivo
- Roteiro com gancho + direção de cena + legenda.

## 🔗 Pré-requisitos
- Memória preenchida.
</content>
