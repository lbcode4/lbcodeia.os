# LBCode.IA — Máquina de Tráfego Pago + Framework

Seu negócio roda nesse arquivo. LBCode.IA é **framework executado por IA** 
que integra tráfego pago, conteúdo, prospecção e operação. Tudo versionado, 
mensurado, repetível.

Aqui moram as regras — como Claude carrega contexto, aprende de feedback, 
mantém framework vivo, calibra execução conforme negócio evolui.

Editável. `/lb-sistema-instalar` complementa fim do arquivo com regras do seu negócio.

---

## DNA: Framework First

LBCode.IA não é coleção solta de skills. É **máquina que executa framework**
(RETINA + GCC + OPA + Bolo de Cenoura + 4 Campanhas).

Cada skill tira força do framework, não do acaso.

- `/lb-conteudo-carrossel` executa RETINA + GCC em visual
- `/lb-google-ads` executa 4 Campanhas + GCC em CSV
- `/lb-venda-prospectar` executa OPA + RETINA em lead pesquisado
- `/lb-meta-relatorio` fecha loop feedback do framework

Framework documentado em `_memoria/framework-trafego.md`. Skills carregam sob demanda.

---

## Carregar Contexto

**Sempre carregar no início de conversa** (arquivos pequenos, sempre relevantes):

1. `_memoria/empresa.md` — quem, o que vende, mercado, dores
2. `_memoria/preferencias.md` — tom, estilo, o que evitar
3. `_memoria/estrategia.md` — foco semana, bloqueadores, prioridades

Não confirmar leitura. Usar naturalmente.

**Sob demanda — carregar só quando a tarefa exigir:**

| Arquivo | Carregar quando |
|---------|----------------|
| `identidade/design-guide.md` | tarefa visual: carrossel, site, stories, identidade, design |
| `_memoria/skills-catalogo.md` | criar projeto novo, selecionar skills, `/lb-sistema-novo-projeto` |
| `_memoria/framework-trafego.md` | marketing, ads, prospecção, conteúdo — **não opcional nesse caso** |
| `integracoes/meta-ads/` (scripts + STYLE-GUIDE) | rodar skill `lb-meta-*` live (dashboard/diagnóstico/auditoria/reels/copy/gerenciar) — puxa Graph API |
| `integracoes/google-ads/` (lib + tests) | rodar skill `lb-google-dashboard` / `lb-ads-unificado` / `lb-ads-negativas` live (Google Ads API) |
| `_memoria/contas-ads.md` | resolver conta de cliente em qualquer skill `lb-meta-*` / integração de ads |

---

## Framework operacional (diferenciais)

Base metodológica comprovada:

- **RETINA** — posicionamento, diferenciação do negócio
- **GCC** (Gatilhos, Copy, Conversão) — persuasão em conteúdo + ads
- **OPA** — estrutura de oferta e proposta
- **Bolo de Cenoura** — sequência nutrição de leads pré-venda
- **4 Campanhas de Ouro** — mix tráfego pago que funciona

Toda skill marketing/ads/prospecção **usa ≥1 pilar**. Garante coesão + repetibilidade.

`_memoria/skills-catalogo.md` = mapa qual skill pra qual modelo de negócio. 
Não memorização — é prototipagem do que funciona.

---

## Workflow: Skill → Tarefa

1. **Skill existe?** Procurar `.claude/skills/`
2. **Sim?** Seguir instrução. Não improvisar.
3. **Não?** Executar normalmente.
4. **Ao terminar:** Padrão repetível? → "Vira skill pra próxima?"

Não perguntar pra avulsos (email isolado, post único). Só quando 
usuário provavelmente repete.

---

## Feedback Loop: Aprender + Evoluir

Usuário corrige algo ou dá instrução permanente ("na verdade é assim", "não faça mais", 
"sempre que...", "evita..."):

> "Quer que eu salve isso na memória?"

Se sim — identificar destino:

- **Negócio/mercado/clientes** → `_memoria/empresa.md`
- **Voz/estilo/preferências** → `_memoria/preferencias.md`
- **Prioridades/prazos** → `_memoria/estrategia.md`
- **Regra dessa pasta** → este arquivo
- **Visual** → `identidade/design-guide.md`

Salvar linha nova, sem reformatar. Confirmar exibindo resultado.

Não perguntar se óbvio (ex: nome arquivo errado). Só informação que vale duração.

---

## Atualizar Memória Pós-Tarefa

Após tarefa que mudou algo relevante (cliente novo, skill criada, foco mudou, 
estrutura alterou, ferramenta instalada):

> "Isso mudou no teu contexto. Atualizo a memória?"

Se sim — atualizar arquivo. Mostrar mudança antes de salvar. 
Só editar linha — não reformatar tudo.

**Não perguntar pra:**
- Tarefas pontuais sem impacto (email, post isolado)
- Conversas/perguntas simples
- Mudanças já salvas em feedback loop

Cmd `/lb-sistema-atualizar` faz varredura completa quando há dúvida.

---

## Criar Skills Novas

Usuário pede:

1. **Modelo existe?** Usar skill parecida em `.claude/skills/` como base. Adaptar ao contexto.
2. **Escopo:** Projeto específico? Ou reutilizável?
   - Projeto → `.claude/skills/nome/SKILL.md`
   - Universal → `~/.claude/skills/nome/SKILL.md`
3. **Calibração:** Ler `_memoria/empresa.md` + `_memoria/preferencias.md` 
   pra alinhar tom/framework/approach ao negócio
4. **Apoio:** Se precisar templates/exemplos → criar dentro da pasta skill
5. **Fluxo:** Usar skill-creator do Claude Code nativo