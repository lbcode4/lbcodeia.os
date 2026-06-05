# Fases 3-5 — Preenchimento, Resumo, Próximos Passos

## Fase 3 — Preenchimento dos Arquivos

### `_memoria/empresa.md`

```
Nome: [P1]
O que entrega: [P2]
Cliente-alvo: [P3]
Equipe: [P4]
Concorrentes principais: [P5]
Seu diferencial: [P6]
Faturamento: [P7]
Produto principal: [P8]
Site: [Fase 0]
Instagram: [Fase 0]
```

**Crítico:** P5-P6 são insumo direto pra RETINA (posicionamento em copy/ads).

### `_memoria/preferencias.md`

```
Tom de voz: [P11 exemplo] → derivar em 2-3 frases
O que evitar: [P12]
Frequência conteúdo: [P13]
```

### `_memoria/estrategia.md`

```
Gargalo principal: [P14]
Tarefa repetitiva: [P15] (candidata /lb-negocio-mapear-rotinas)
Objetivo + Métrica: [P16] (ex: 80 agendamentos/mês, ROAS 4x)
Tráfego status: [P9-P10]
Prioridade #1: [P18]
```

**Crítico:** P16 é métrica real pra `/lb-meta-relatorio`, `/lb-google-seo`, `/lb-venda-prospectar` depois.

### `identidade/design-guide.md`

```
Status: [P17 — Consolidada/Parcial/Não tem]
[Se tiver cores/fonte: registrar]
Refs em identidade/: [listar o que o usuário jogou — logo, paleta, imagens-ref]
```

### `CLAUDE.md`

Aplicar template conforme perfil Fase 1: `templates/perfis/claude-md-<perfil>.md`.
Adaptar nome negócio. Sobrescrever raiz.

---

## Fase 4 — Resumo (18 perguntas = ~10-12min)

```
✓ Negócio: quem, o que, cliente, diferencial
✓ Receita: faturamento, produto, tráfego status
✓ Voz: tom, o que evitar, frequência conteúdo
✓ Operação: gargalo, tarefa repetitiva
✓ Objetivo: métrica real em 3-6 meses
✓ Visual: identidade status + refs
✓ Prioridade: problema #1 em 30 dias

✓ Arquivos preenchidos:
  - _memoria/empresa.md (P1-P8 + site/IG)
  - _memoria/preferencias.md (P11-P13)
  - _memoria/estrategia.md (P5, P6, P14-P16, P18)
  - identidade/design-guide.md (P17)
  - CLAUDE.md (perfil adaptado)
```

**Crítico registrado:**
- P5-P6 (Concorrência + Diferencial) → insumo RETINA
- P13 (Frequência) → qual skill primeiro
- P16 (Métrica) → KPI pra tráfego/SEO

---

## Fase 5 — Setup técnico + Próximos Passos

### 5a — Instalar dependências (1x)

Skills de visual (`/lb-conteudo-carrossel`, `/lb-negocio-site`, `/lb-venda-proposta`) renderizam
via Playwright. Rodar AGORA pra não falhar na primeira skill:

```bash
npm install   # postinstall já roda `playwright install chromium`
```

Se falhar (sem Node), avisar e seguir — skills não-visuais funcionam mesmo assim.

### 5b — Briefing final

> "**Setup pronto. LBCode.IA agora te conhece.**
>
> **Dia a dia:**
> - `/lb-sistema-abrir` carrega contexto antes de trabalhar
> - `/lb-sistema-salvar` commit + push automático
>
> **Primeira skill:**
> Sua prioridade é [P18 — prioridade] e métrica é [P16].
> Recomendo: **`/[skill-sugerida]`** — ela aprofunda e entrega resultado.
>
> **Se repete [P15 — tarefa repetitiva]:**
> Depois de resolvido, roda `/lb-negocio-mapear-rotinas` — viro skill automática.
>
> **Positioning:**
> Seu diferencial é [P6]. Isso vai em todo copy/conteudo-carrossel/anúncio.
> Seus concorrentes [P5] fazem X — você faz Y diferente.
>
> **Framework:**
> Sistema roda em RETINA (posicionamento) + GCC (copy) + 4 Campanhas (tráfego).
> Cada skill executa isso automaticamente. Leia `_memoria/framework-trafego.md` se quiser.
>
> Bora rodar `/[skill-primeira]`?"
