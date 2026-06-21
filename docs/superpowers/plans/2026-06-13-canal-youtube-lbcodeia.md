# Canal YouTube LBCode.IA — Plano de Ação

> **Para execução:** Siga task por task. Cada step é 2-5 minutos de ação concreta.

**Goal:** Lançar canal YouTube LBCode.IA com episódio piloto publicado e sistema repetível pra próximos episódios.

**Abordagem:** Setup de infraestrutura primeiro (canal + ferramentas + identidade visual), depois gravar e publicar piloto, depois criar template reutilizável pra série.

**Stack:** OBS Studio (gravação), DaVinci Resolve gratuito (edição), Canva gratuito (thumbnails), YouTube Studio.

---

## Task 1: Criar o Canal YouTube

**Entregável:** Canal LBCode.IA no ar com identidade básica configurada.

- [ ] **Step 1: Criar canal no YouTube**
  - Acesse youtube.com → clique no avatar → "Criar canal"
  - Nome: `LBCode.IA`
  - Handle: `@lbcodeia` (verificar disponibilidade, alternativa: `@lbcode_ia`)

- [ ] **Step 2: Escrever descrição do canal**
  - Em YouTube Studio → Personalização → Informações básicas
  - Colar essa descrição:
  ```
  Aprendi fazendo — e aqui te mostro como.

  Sou Luan, desenvolvo ferramentas com IA para automatizar processos de negócios. 
  Nesse canal mostro como construí o LBCode.IA do zero: das primeiras ideias até 
  skills avançadas com Claude Code, Meta Ads, Google Ads e muito mais.

  Para iniciantes curiosos sobre IA, automação e desenvolvimento.

  Contato: contato@lbcode.ia | WhatsApp: [seu número]
  ```

- [ ] **Step 3: Configurar link de contato**
  - YouTube Studio → Personalização → Informações básicas → Links
  - Adicionar: Site `https://oferta-lbcodeia.lovable.app`, Instagram `@lbcode.ia`

- [ ] **Step 4: Criar banner do canal no Canva**
  - Acesse canva.com → buscar "YouTube Channel Art" (2560x1440px)
  - Fundo escuro (preto ou azul escuro) + logo/texto "LBCode.IA" em branco
  - Subtítulo: "Aprendi fazendo. Te mostro como."
  - Exportar PNG e fazer upload em YouTube Studio → Personalização → Marca

---

## Task 2: Instalar e Configurar OBS Studio

**Entregável:** OBS pronto pra gravar screencast + narração em qualidade boa.

- [ ] **Step 1: Instalar OBS**
  - Download: https://obsproject.com
  - Instalar com configurações padrão

- [ ] **Step 2: Configurar cena de screencast**
  - Abrir OBS → Cenas → clique `+` → nomear "Screencast"
  - Fontes → `+` → "Captura de Janela" → selecionar o terminal/VS Code
  - Fontes → `+` → "Captura de Áudio de Entrada" → selecionar microfone

- [ ] **Step 3: Configurar qualidade de saída**
  - OBS → Configurações → Saída → Gravação
  - Qualidade: Alta, Formato: MP4
  - OBS → Configurações → Vídeo
  - Resolução base: 1920x1080, FPS: 30

- [ ] **Step 4: Fazer gravação de teste (30 segundos)**
  - Clicar "Iniciar Gravação", narrar qualquer coisa, parar
  - Verificar se o áudio está claro e a tela aparece corretamente
  - Se áudio baixo: Configurações → Áudio → ajustar gain do microfone

---

## Task 3: Criar Template de Thumbnail

**Entregável:** Template Canva reutilizável pra todos os episódios da série.

- [ ] **Step 1: Criar template no Canva**
  - Canva → "YouTube Thumbnail" (1280x720px)
  - Fundo escuro com gradient sutil
  - Elemento fixo: logo "LBCode.IA" no canto superior esquerdo (pequeno)
  - Elemento variável: número do episódio grande (ex: "EP 1") em destaque
  - Elemento variável: título curto do episódio em 2 linhas máximo
  - Elemento decorativo: ícone relacionado ao tema (robô, código, gráfico)

- [ ] **Step 2: Testar legibilidade**
  - Reduzir zoom do Canva pra ver thumbnail em tamanho pequeno
  - Texto precisa ser legível em 120x90px (tamanho na busca do YouTube)
  - Ajustar tamanho de fonte se necessário (mínimo 60pt pra títulos)

- [ ] **Step 3: Salvar como template**
  - Canva → "..." → "Duplicar design" (usar essa cópia pra cada episódio novo)
  - Nomear original: "TEMPLATE - Thumbnail Série LBCode.IA"

---

## Task 4: Preparar Script do Episódio Piloto

**Entregável:** Roteiro do Ep 1 — "Por que usei NotebookLM pra organizar meu projeto de IA".

- [ ] **Step 1: Criar arquivo de script**

  Criar arquivo `docs/youtube/ep01-notebooklm-script.md` com:

  ```markdown
  # EP 01 — Por que usei NotebookLM pra organizar meu projeto de IA

  ## Hook (0-30s)
  [Mostrar tela do NotebookLM com os arquivos do projeto carregados]
  Narração: "Antes de escrever uma linha de código do LBCode.IA, eu precisava 
  resolver um problema: como manter contexto de um projeto complexo de IA sem 
  perder informação? A resposta foi essa ferramenta aqui."

  ## Contexto (1-2 min)
  - O problema: projeto de IA tem muitos arquivos, decisões, preferências do cliente
  - Claude Code perde contexto entre sessões
  - Precisava de um "cérebro" externo pro projeto

  ## Mão na Massa
  - Mostrar NotebookLM: o que é, como criar notebook
  - Mostrar arquivos do LBCode.IA carregados: empresa.md, preferencias.md, estrategia.md
  - Demonstrar: fazer uma pergunta sobre o projeto e ver a resposta
  - Mostrar como isso alimenta o CLAUDE.md do projeto

  ## Resultado
  - NotebookLM = memória persistente do projeto
  - Claude Code lê CLAUDE.md = contexto disponível em toda sessão
  - O projeto ganhou "memória" sem depender de uma única sessão de IA

  ## CTA
  "No próximo episódio mostro como criei a primeira skill — uma entrevista que 
  aprende sobre o negócio do cliente automaticamente. Link na descrição pra 
  conhecer o LBCode.IA."
  ```

- [ ] **Step 2: Revisar roteiro em voz alta**
  - Ler o roteiro falando em voz alta
  - Marcar partes que soam artificiais e reescrever na sua forma natural de falar
  - Objetivo: parecer conversa, não apresentação formal

---

## Task 5: Gravar Episódio Piloto

**Entregável:** Arquivo de vídeo bruto do Ep 1 gravado.

- [ ] **Step 1: Preparar ambiente de gravação**
  - Fechar aplicativos desnecessários (notificações, Slack, email)
  - Abrir: NotebookLM no browser, VS Code com os arquivos do projeto
  - OBS aberto com cena "Screencast" ativa

- [ ] **Step 2: Gravar hook primeiro**
  - Iniciar gravação no OBS
  - Narrar o hook do roteiro enquanto mostra o NotebookLM
  - Parar gravação, assistir, refazer se necessário
  - Dica: gravar hook separado pra facilitar edição depois

- [ ] **Step 3: Gravar corpo do vídeo**
  - Gravar do contexto até o CTA em sequência
  - Não pausar pra corrigir erros — continuar e corrigir na edição
  - Se travar: dar uma pausa de 2 segundos e continuar (fácil de cortar depois)

- [ ] **Step 4: Renomear arquivo**
  - Localizar arquivo gerado pelo OBS (pasta padrão: `~/Videos/`)
  - Renomear: `ep01-notebooklm-bruto.mp4`

---

## Task 6: Editar no DaVinci Resolve

**Entregável:** Vídeo editado pronto pra upload.

- [ ] **Step 1: Instalar DaVinci Resolve gratuito**
  - Download:   
  - Instalar versão gratuita (suficiente pra edição básica)

- [ ] **Step 2: Criar projeto e importar vídeo**
  - DaVinci → New Project → nomear "LBCode.IA EP01"
  - Media Pool → arrastar `ep01-notebooklm-bruto.mp4`
  - Arrastar clipe pra timeline

- [ ] **Step 3: Edição básica**
  - Cortar silêncios longos (>2 segundos): usar blade tool (`B`)
  - Cortar engasgos/erros: selecionar trecho, deletar
  - Verificar que hook aparece primeiro na timeline

- [ ] **Step 4: Adicionar intro texto (opcional)**
  - Effects Library → Titles → "Basic Title"
  - Arrastar no início da timeline
  - Texto: "LBCode.IA — EP 01"
  - Duração: 2 segundos

- [ ] **Step 5: Exportar vídeo final**
  - Deliver → Render Settings
  - Format: MP4, Codec: H.264
  - Resolution: 1920x1080, Frame rate: 30
  - Filename: `ep01-notebooklm-final.mp4`
  - Clicar "Add to Render Queue" → "Render All"

---

## Task 7: Publicar no YouTube

**Entregável:** Ep 1 publicado no canal.

- [ ] **Step 1: Criar thumbnail do Ep 1**
  - Abrir template Canva criado na Task 3
  - Duplicar
  - Preencher: "EP 1" + "Por que usei NotebookLM no meu projeto de IA"
  - Exportar PNG: `ep01-thumbnail.png`

- [ ] **Step 2: Fazer upload no YouTube Studio**
  - YouTube Studio → Criar → Fazer upload de vídeo
  - Selecionar `ep01-notebooklm-final.mp4`
  - Enquanto faz upload, preencher:

  **Título:**
  ```
  Por que usei NotebookLM no meu projeto de IA | LBCode.IA EP 01
  ```

  **Descrição:**
  ```
  Antes de escrever uma linha de código do LBCode.IA, precisei resolver um 
  problema: como manter contexto de um projeto complexo de IA sem perder informação?

  A resposta foi o NotebookLM do Google — e nesse episódio mostro como isso 
  virou a fundação de todo o projeto.

  🔗 Conheça o LBCode.IA: https://oferta-lbcodeia.lovable.app
  📱 WhatsApp: [seu número]
  📸 Instagram: @lbcode.ia

  ⏱ Timestamps:
  0:00 - O problema de contexto em projetos de IA
  1:30 - O que é o NotebookLM
  3:00 - Como configurei pro LBCode.IA
  7:00 - Como isso se conecta ao Claude Code
  10:00 - Resultado e próximos episódios

  #ClaudeCode #InteligenciaArtificial #NotebookLM #DesenvolvimentoComIA
  ```

- [ ] **Step 3: Configurar thumbnail e playlist**
  - Upload da thumbnail `ep01-thumbnail.png`
  - Adicionar à playlist: "Como construí o LBCode.IA" (criar se não existe)

- [ ] **Step 4: Publicar**
  - Visibilidade: Público
  - Clicar "Publicar"
  - Copiar URL do vídeo e compartilhar no Instagram/WhatsApp

---

## Task 8: Template Pra Próximos Episódios

**Entregável:** Checklist reutilizável pra não precisar reinventar a roda a cada episódio.

- [ ] **Step 1: Criar checklist de episódio**

  Criar `docs/youtube/checklist-episodio.md`:

  ```markdown
  # Checklist — Novo Episódio

  ## Pré-produção
  - [ ] Definir tema e número do episódio
  - [ ] Escrever script em `docs/youtube/ep0X-tema-script.md`
  - [ ] Revisar script em voz alta

  ## Gravação
  - [ ] Fechar notificações
  - [ ] OBS: cena "Screencast" ativa
  - [ ] Gravar hook separado
  - [ ] Gravar corpo do vídeo
  - [ ] Renomear arquivo: `ep0X-tema-bruto.mp4`

  ## Edição (DaVinci)
  - [ ] Importar para projeto "LBCode.IA EP0X"
  - [ ] Cortar silêncios e erros
  - [ ] Exportar: `ep0X-tema-final.mp4`

  ## Publicação
  - [ ] Criar thumbnail no Canva (duplicar template)
  - [ ] Upload no YouTube Studio
  - [ ] Preencher título, descrição, timestamps, tags
  - [ ] Adicionar à playlist da série
  - [ ] Publicar
  - [ ] Compartilhar no Instagram + WhatsApp
  ```

- [ ] **Step 2: Commitar arquivos de planejamento**

  ```bash
  git add docs/youtube/
  git commit -m "docs: add youtube channel scripts and episode checklist"
  ```

---

## Sequência Recomendada de Episódios

Após piloto publicado e feedback coletado:

| Prioridade | Episódio | Tipo |
|------------|----------|------|
| 1 | EP 01 — NotebookLM | Série |
| 2 | EP 02 — Primeira skill: entrevista | Série |
| 3 | Lab — Como usar Claude Code do zero | Laboratório (SEO) |
| 4 | EP 03 — Carrossel automático | Série |
| 5 | Lab — O que é uma skill de IA | Laboratório (SEO) |
| 6 | EP 04 — Skills de tráfego | Série |
