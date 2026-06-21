# LBCode.IA — Hub de Skills Claude Code

Seu projeto/negócio roda nesse arquivo. LBCode.IA é **hub de skills Claude Code**
voltado a facilitar desenvolvimento de projetos e automações sob medida com
IA pra empresas (ERPs, CRMs, agentes, painéis internos) — e a rodar a
operação completa de quem entrega isso: tráfego pago, conteúdo, prospecção
e gestão de cliente. Tudo versionado, mensurado, repetível.

Aqui moram as regras — como Claude carrega contexto, aprende de feedback, 
mantém framework vivo, calibra execução conforme negócio evolui.

Editável. `/lb-sistema-onboarding` complementa fim do arquivo com regras do seu negócio.

---

## DNA: Skills com Framework, Não Acaso

LBCode.IA não é coleção solta de skills. Cada skill tira força de método:

- **Marketing/tráfego/prospecção** roda o framework RETINA + GCC + OPA +
  Bolo de Cenoura + 4 Campanhas (`_memoria/framework-trafego.md`)
- **Entrega de projeto/automação pro cliente** roda via
  `/lb-sistema-novo-projeto` (workspace isolado por cliente) +
  `_memoria/skills-catalogo.md` (mapa qual skill serve qual modelo de negócio)

Exemplos:
- `/lb-conteudo-carrossel` executa RETINA + GCC em visual
- `/lb-google-ads` executa 4 Campanhas + GCC em CSV
- `/lb-venda-prospectar` executa OPA + RETINA em lead pesquisado
- `/lb-negocio-site` / `/lb-negocio-site-v2` entrega site/landing real pro cliente
- `/lb-negocio-mapear-rotinas` transforma rotina repetitiva do cliente em skill nova
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

Cmd `/lb-sistema-sincronizar` faz varredura completa quando há dúvida.

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

---

## Negócio: LBCode.IA (Luan) — Criador Solo

**Perfil:** Criador solo. Marca pessoal + negócio digital. Uma pessoa, audiência como ativo.

**O que é:** Desenvolvimento de sistemas sob medida com IA — ERPs, CRMs, automações,
agentes IA e painéis internos para médias empresas e startups.

**Diferencial (RETINA):** Entrega orientada a resultado, IA aplicada de verdade (não
buzzword), velocidade de entrega fora do padrão.

**Cliente-alvo:** Gestores e donos de médias empresas/startups com dor em processos
manuais, planilhas desintegradas e falta de controle operacional.

**Prioridade agora:** Conseguir o primeiro cliente (negócio iniciando).
**Métrica:** 3 clientes fechados/mês (horizonte 3-6 meses).

**Tom:** Direto, objetivo, focado em ROI. Estrutura: problema → consequência → solução → CTA.
**Evitar:** "vamos juntos", "alavancar", "sinergia", emojis excessivos, linguagem formal, gírias.

**Conteúdo:** 3 posts/semana, carrossel educativo, criado pelo Luan.
**Tráfego:** Orgânico ativo. Pago: não iniciado ainda.

**Contato:** @lbcode.ia | [email protected] | Santarém/PA