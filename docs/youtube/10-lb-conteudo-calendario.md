# 🎬 Vídeo 10 — `/lb-conteudo-calendario`

> **Bloco 2 — Conteúdo.** Duração alvo: 5–7 min · Sem front.

## 🎯 Objetivo do vídeo
Montar o calendário editorial do mês: 20–25 posts distribuídos pelos 6 pilares RETINA, com datas, formatos e temas. Inclui banco de temas reserva e datas especiais do setor.

## 💡 Dor → solução
- **Dor:** decidir "o que postar hoje" todo dia consome energia e gera inconsistência.
- **Solução:** mês inteiro planejado de uma vez, equilibrado pelos pilares de posicionamento.

## 🧠 Framework por trás
- **6 pilares RETINA** garantem variedade estratégica (não só "dica do dia").

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-conteudo-calendario em .claude/skills/lb-conteudo-calendario/SKILL.md.

Objetivo: montar calendário editorial mensal.
- 20-25 posts distribuídos pelos 6 pilares RETINA.
- Cada item: data, formato (carrossel/reels/stories), pilar e tema.
- Inclui banco de temas reserva e datas especiais do setor do cliente.
- Lê _memoria/empresa.md (nicho) e estrategia.md (foco).
- Saída em tabela markdown + arquivo em saidas/.
- Gatilhos: "calendário de conteúdo", "planejar posts do mês", "plano de conteúdo",
  "quantos posts essa semana", /lb-conteudo-calendario.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-conteudo-calendario em .claude/skills/lb-conteudo-calendario/SKILL.md.

FRONTMATTER:
- name: lb-conteudo-calendario
- description: Monta calendário editorial completo do mês: 20-25 posts distribuídos
  pelos 6 pilares RETINA, com datas, formatos e temas. Inclui banco de temas reserva e
  datas especiais do setor. Use quando pedir "calendário de conteúdo", "planejar posts
  do mês", "programar conteúdo", "quantos posts essa semana", "plano de conteúdo",
  /lb-conteudo-calendario.

DEPENDÊNCIAS: _memoria/framework-trafego.md (OBRIGATÓRIO — RETINA + GCC),
_memoria/estrategia.md (foco atual + campanhas ativas), _memoria/empresa.md. Output em
saidas/marketing/conteudo/calendario/<YYYY-MM>/calendario.md.

DISTRIBUIÇÃO RETINA (20-25 posts/mês, base 5/semana seg-sex): R Resultado 20% (4-5),
E Educação 25% (5-6), T Tendência 15% (3-4), I Inspiração 15% (3-4), N Novidade 15%
(3-4), A Autenticidade 10% (2-3). Mix de formatos: 40% carrossel / 40% Reels / 20%
stories/post único.

DATAS ESPECIAIS: levantar as datas comemorativas do NICHO do cliente (ler empresa.md;
WebSearch se não claro) e incluir 1-2 posts oportunos por data (alcance orgânico maior).
Incluir uma tabela exemplo (ex: setor saúde/estética) a ser trocada pelo setor real.

WORKFLOW:
Passo 1 — receber mês/ano (default = próximo mês); ler estrategia.md pra foco atual,
campanhas ativas/previstas e bloqueadores que afetam volume.
Passo 2 — identificar quais datas especiais caem no mês; incluir 1-2 posts por data.
Passo 3 — gerar calendário em markdown: cabeçalho (N posts, mix %); Resumo do mês (foco,
campanhas, datas especiais, meta de alcance); 4 semanas, cada uma com tabela
(Data | Dia | Pilar | Tema sugerido | Formato | Skill | Status ⬜); Banco de temas
reserva por pilar; Checklist de publicação semanal.
Passo 4 — salvar no caminho acima.
Passo 5 — oferecer criar o 1º carrossel (/lb-conteudo-carrossel) e os roteiros de Reels
(/lb-conteudo-reels).

REGRAS: RETINA antes do tema; banco de temas reserva sempre; priorizar datas especiais;
indicar a skill por post; manter status ⬜->✅; não forçar 5 posts/semana se houver
evento/bloqueador (ajustar volume).
```

## ⚙️ Como funciona
1. Roda `/lb-conteudo-calendario` + mês.
2. Distribui os posts pelos pilares e datas.
3. Entrega tabela + temas reserva.

## 🎥 Roteiro de gravação
1. **Gancho:** "Pare de decidir o que postar todo dia. Planeje o mês em 1 comando."
2. Roda o comando.
3. Mostra a tabela com pilares balanceados.
4. **Fechamento:** "Tenho o plano. Agora transformo 1 tema em conteúdo completo."

## 🗣️ Gancho de abertura pronto
> "O mês inteiro de conteúdo, equilibrado por estratégia, planejado em um comando."

## ✅ Demonstração ao vivo
- Calendário com 20–25 itens + datas especiais.

## 🔗 Pré-requisitos
- Memória preenchida.
</content>
