# WINC TASK HUB — Gerenciador Inteligente de Tarefas e Lembretes Persistentes

Aplicativo Desktop de alta performance desenvolvido com **Electron**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **better-sqlite3 (SQLite nativo em modo WAL)** e arquitetura com janelas flutuantes Always-on-Top e Captura Rápida (Raycast/Spotlight).

---

## 🚀 Destaques e Funcionalidades Principais

### 1. Sistema de Notificações Inteligentes & Acesso Sob Demanda
- **100% Silencioso e Não Invasivo:** O painel nunca abre sozinho sobre outros aplicativos ao vencer uma tarefa, criar atividades ou virar o dia.
- **Notificações Nativas do Windows:** Alertas discretos do Windows Action Center / Toast para tarefas do dia e atrasadas sem roubar foco da tela.
- **Acesso Sob Demanda por 3 Formas:**
  - **System Tray:** Clique no ícone da bandeja para abrir/fechar o painel.
  - **Atalho Global:** `Ctrl + Shift + T` abre ou oculta o painel instantaneamente.
  - **Ícone do App:** Clicar no ícone da Área de Trabalho ou executável restaura o painel em execução.
- **Segundo Plano Contínuo:** Fechar no botão `X` oculta a janela mantendo os serviços e agendamentos rodando.
- **Modos Avançados:** Modo Não Perturbe (DND) e Always on Top configuráveis. Conclusão de tarefas é 100% silenciosa sem emissão de popups.

### 2. Calendário Mensal, Semanal e Diário
- Visualização em Grade Mensal, Semanal e Diária.
- Navegação rápida entre meses, anos e botão de retorno ao dia atual.
- **Drag-and-Drop:** Arraste qualquer tarefa para outra data no calendário para reagendar instantaneamente.
- Identificação visual para tarefas concluídas (strikethrough) e atrasadas (aviso de atenção).
- Cores exclusivas para cada projeto (Roxo para Winc, Vermelho para EVILBEAR, Esmeralda para Pessoal).
- Suporte a tarefas recorrentes (Diária, Semanal, Quinzenal, Mensal, Dias específicos da semana).

### 3. Módulo Agência Winc
- 18 categorias exclusivas da agência (Criação de carrosséis, Artes estáticas, Edição de vídeos, Motion design, Desenvolvimento de sites, Prospecção, etc.).
- Cadastro completo de clientes com Instagram, telefone/WhatsApp, email, notas de contrato e demandas vinculadas.
- Pipeline de status: *Não iniciada*, *Em andamento*, *Aguardando material*, *Aguardando aprovação*, *Em revisão* e *Concluída*.

### 4. Módulo Musical EVILBEAR.JPG
- Organização completa de produção de beats, melodias, mixagem, masterização e vídeos.
- **Pipeline de Lançamentos:**
  - Checklist padronizado com as 8 etapas essenciais de cada lançamento.
  - Metadados musicais: BPM, Tom musical (Key), Gênero, Formatos inclusos (WAV, MP3, STEMS) e Licenciamento (Disponível, Negociando, Exclusivo, Lease).
  - Sincronização automática das etapas no calendário com lembretes automáticos.

### 5. Painel de Prospecção Comercial & Metas
- Gestão de leads para empresas (Winc) e artistas/cantores (EVILBEAR).
- Registro de Instagram, contatos, notas, data da abordagem e data do próximo follow-up.
- **Metas editáveis:** Meta diária (ex: 20 contatos) e mensal (ex: 400 contatos) com barras de progresso dinâmicas.
- Prevenção automática de leads duplicados por nome ou Instagram.
- Histórico completo de interações comerciais.

### 6. Captura Rápida (Raycast / Spotlight)
- Atalho global `Ctrl + Shift + Espaço` abre instantaneamente uma janela minimalista para cadastrar novas ideias e tarefas sem abrir o painel completo.
- Busca global no sistema através de `Ctrl + K`.

### 7. Armazenamento Local Confiável & Configurações
- Banco de dados SQLite offline com integridade referencial e WAL mode (`winc_task_hub.db`).
- Exportação e importação de Backups completos em JSON.
- Exportação de tarefas em formato CSV com UTF-8 BOM.
- Execução na bandeja do sistema (System Tray) para operação em segundo plano contínua.
- Suporte a inicialização automática com o Windows.

---

## 🛠️ Como Executar o Projeto

### Requisitos
- Node.js 18+ (recomendado Node 20 ou 24)
- Windows 10 ou Windows 11

### 1. Modo de Desenvolvimento (Vite + Electron)
```bash
# Na pasta do projeto:
npm run dev
```

### 2. Executar os Testes Automatizados
```bash
npm test
```
Executa a suíte de 25 testes automatizados cobrindo persistência SQLite, virada do dia, recuperação de reinicialização, desfixação, recorrência, prospecção, backups, preferências não-invasivas, modo DND e notificações nativas.

### 3. Executáveis Windows Gerados (.exe)
Os executáveis prontos para uso em ambiente Windows foram gerados na pasta `release/`:
- **Instalador Oficial:** `release/WINC TASK HUB Setup 1.0.0.exe` (Instalador NSIS com atalhos no Desktop e Iniciar)
- **Versão Portátil:** `release/WINC TASK HUB 1.0.0.exe` (Executável standalone portátil, sem instalação)
- **Pasta Descompactada:** `release/win-unpacked/WINC TASK HUB.exe`

---

## 📁 Estrutura do Código-Fonte

```
winc-task-hub/
├── electron/
│   ├── main.cjs               # Processo principal Electron (janelas, tray, shortcuts, IPC)
│   ├── preload.cjs            # Context isolation bridge seguro
│   ├── db/
│   │   ├── database.cjs       # Conexão SQLite better-sqlite3 e schema DDL
│   │   ├── tasksRepo.cjs      # CRUD de tarefas, recorrência e lembretes
│   │   ├── clientsRepo.cjs    # Clientes Winc e lançamentos EVILBEAR
│   │   ├── prospectionRepo.cjs# Leads, pipeline comercial e métricas
│   │   ├── settingsRepo.cjs   # Configurações, logs, exportação JSON e CSV
│   │   └── seed.cjs           # Cenário inicial pré-carregado
│   ├── scheduler/
│   │   └── reminderScheduler.cjs # Detector de 00h00, conciliação e listeners de energia
│   ├── services/
│   │   └── notificationService.cjs # Notificações nativas discretas do Windows
│   └── windows/
│       ├── mainWindow.cjs         # Painel principal
│       ├── widgetWindow.cjs       # Janela flutuante Always-On-Top
│       └── quickCaptureWindow.cjs # Janela de Captura Rápida
├── src/
│   ├── components/
│   │   ├── calendar/          # Visões Mensal, Semanal, Diária e Detalhes
│   │   ├── dashboard/         # Dashboard de métricas e produtividade
│   │   ├── winc/              # Módulo Agência Winc e clientes
│   │   ├── evilbear/          # Módulo musical EVILBEAR e pipeline
│   │   ├── prospection/       # Painel de prospecção e metas
│   │   ├── reminders/         # Interface da janela flutuante
│   │   ├── quickcapture/      # Interface da captura rápida
│   │   └── settings/          # Configurações e backups
│   ├── context/
│   │   └── TaskHubContext.tsx # Central de estado integrada com a IPC
│   ├── lib/
│   │   ├── sounds.ts          # Síntese Web Audio de sinos e alertas
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts           # Definições de tipagem TypeScript
│   ├── styles/
│   │   └── index.css          # Estilos Tailwind CSS v4, dark mode e glassmorphism
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── app.test.js            # Suíte de testes automatizados completa
├── package.json
└── vite.config.ts
```
