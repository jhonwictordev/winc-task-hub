<div align="center">

# WINC TASK HUB

### *Intelligent Desktop Productivity, Workflow Automation & Persistent Task Orchestration*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-45.1.0-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL_Mode-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tests](https://img.shields.io/badge/Tests-25%20Passing-brightgreen?logo=checkmarx&logoColor=white)](#13-testing)

</div>

---

## 1. Project Overview

**WINC TASK HUB** is an enterprise-grade desktop productivity application engineered for creative agencies, music producers, and power users who require strict deadline management, zero-distraction focus, and offline persistence.

The application serves as a unified command center designed specifically for:
- **Agência Winc:** Full-service digital marketing, branding, video editing, social media scheduling, web development, and client pipeline management.
- **EVILBEAR.JPG:** Music production, beat cataloging, multi-stage release pipelines (mix, master, artwork, distribution, contracts), and singer prospection.
- **Commercial Prospection:** Outbound B2B client acquisition and artist outreach with customizable daily/monthly goals and automated follow-up scheduling.

Built on an offline-first architecture powered by native SQLite WAL mode, WINC TASK HUB eliminates external cloud dependencies for task management while providing system-level Windows integration including global keyboard shortcuts, native OS toast notifications, and customizable desktop overlay widgets.

---

## 2. Key Features

### 📅 Advanced Multi-View Calendar
- **Interactive Views:** Seamlessly switch between Monthly, Weekly, and Daily calendar grids with instant navigation across months and years.
- **Drag-and-Drop Rescheduling:** Drag tasks between dates for instant deadline adjustments.
- **Multi-Category Tagging:** Visual project segregation with distinct color signatures (Purple for Winc, Crimson for EVILBEAR, Emerald for Personal).
- **Recurrence Engine:** Robust scheduling supporting Daily, Weekly, Bi-weekly, Monthly, and custom Day-of-Week recurrence rules.
- **Status Indicators:** Instant visual detection of overdue deadlines, pending deliveries, and concluded items.

### 🔔 Non-Intrusive, Intelligent Notification Engine
- **Windows Toast Integration:** Replaces disruptive popups with quiet Windows Action Center notifications for due-today and overdue demands.
- **Midnight Rollover (00:00):** Background reconciliation identifies new tasks at midnight without interrupting active workflows or stealing application focus.
- **Duplicate Prevention:** Internal cache prevents repeated alerts for the same task on identical dates.
- **Silent Conclusion:** Completing a task updates all open views silently without triggering OS alerts.
- **Do Not Disturb (DND):** Master mute toggle preserves task schedules while suppressing all desktop alerts.

### 📌 Neon Floating Widget (Always-On-Top)
- **Focused Execution Window:** Lightweight, semi-transparent desktop companion window displaying currently pinned tasks.
- **Adjustable Controls:** Dynamic opacity sliders, compact/expanded modes, and drag-and-drop repositioning.
- **Unpin vs. Conclude Distinction:** Unpinning keeps tasks scheduled in the calendar, while concluding marks them completed and removes them from the view.

### ⚡ Quick Capture (Spotlight / Raycast Style)
- **Instant Keyboard Access:** `Ctrl + Shift + Space` summons a minimalist input modal over any active Windows application.
- **Rapid Task Ingestion:** Register tasks with priority, project, and deadline without opening the main window.
- **Global Search:** `Ctrl + K` initiates immediate searching across all tasks, clients, releases, and leads.

### 🏢 Agência Winc Client Management
- 18 specialized operational categories (Carousels, Static Ads, Video Editing, Motion Graphics, Landing Pages, Automation).
- Client portfolio tracking with social profiles, contract details, and linked deliverable histories.
- Status pipeline: *Not Started*, *In Progress*, *Awaiting Assets*, *Awaiting Approval*, *In Review*, and *Concluded*.

### 🎵 EVILBEAR.JPG Music Release Pipeline
- Standardized 8-stage music release checklist covering composition to distribution.
- Specialized audio metadata tracking: BPM, Musical Key, Genre, Deliverable Formats (WAV, MP3, STEMS), and Licensing Types (Exclusive, Lease, In Negotiation).
- Automatic synchronization of release milestones directly to the monthly calendar.

### 🎯 Commercial Prospection & Goal Tracking
- Dedicated CRM for business leads and artist prospecting.
- Anti-duplicate detection preventing duplicate Instagram handles or lead names.
- Configurable daily (e.g., 20 contacts) and monthly (e.g., 400 contacts) targets with real-time conversion meters.

---

## 3. Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Runtime & Shell** | Electron 45.1.0 | Native Windows desktop integration, multi-window orchestration, tray, global shortcuts |
| **Frontend Framework** | React 19.0.0, TypeScript 5.7 | Reactive UI state, component hierarchy, type-safe development |
| **Build & Tooling** | Vite 8.3.5, Rolldown | High-speed frontend bundling, HMR, and asset optimization |
| **Styling & Icons** | Tailwind CSS v4, Lucide React | Dark-luxury aesthetic (#0b0d13), glassmorphism, responsive controls |
| **Local Persistence** | `better-sqlite3` (SQLite 3.x) | Local zero-latency database with Write-Ahead Logging (WAL) and foreign keys |
| **Packaging & Distribution**| Electron Builder 26.18 | Windows NSIS installer, Portable executable, unpacked distribution |

---

## 4. Application Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ELECTRON MAIN PROCESS                           │
│  (main.cjs, reminderScheduler.cjs, notificationService.cjs, DB Repos)  │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ IPC Bridge (contextBridge)      │ System APIs
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│          RENDERER WINDOWS            │  │      WINDOWS SUBSYSTEM       │
│                                      │  │                              │
│ ┌──────────────────────────────────┐ │  │ • Windows Action Center      │
│ │ MainWindow (Calendar & Modules)  │ │  │ • System Tray Icon & Menu    │
│ └──────────────────────────────────┘ │  │ • Global Hotkeys Register    │
│ ┌──────────────────────────────────┐ │  │ • SQLite DB File (WAL Mode) │
│ │ FloatingWidget (Pinned Demands)  │ │  │ • Login Item Settings        │
│ └──────────────────────────────────┘ │  └──────────────────────────────┘
│ ┌──────────────────────────────────┐ │
│ │ QuickCaptureWindow (Ctrl+Shft+Sp)│ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

The architecture strictly adheres to Electron's Process Isolation model:
1. **Main Process:** Handles operating system integration, background cron scheduling, native toast notifications, and direct SQLite I/O.
2. **Context Bridge:** `preload.cjs` exposes tightly scoped, typed methods via `window.electronAPI`. Renderer processes have zero access to Node.js internals or arbitrary execution.
3. **Renderer Process:** Single-page React application utilizing hash routing (`#widget`, `#quick-capture`, default) to load lightweight window variants from the same compiled asset bundle.

---

## 5. Installation Requirements

- **Operating System:** Windows 10 (1809+) or Windows 11 (64-bit recommended).
- **Node.js Environment:** Node.js 18.x, 20.x, or 24.x LTS.
- **Package Manager:** npm 9.x or higher.
- **Build Tools (for compiling native better-sqlite3 if needed):** Visual Studio C++ Build Tools or Windows SDK.

---

## 6. Getting Started

Clone the repository and install project dependencies:

```bash
# Clone the repository
git clone https://github.com/jhonwictordev/winc-task-hub.git

# Navigate into the project directory
cd winc-task-hub

# Install dependencies using npm
npm install
```

---

## 7. Development Environment

Run the Vite dev server and Electron desktop application concurrently:

```bash
# Start development mode with hot-module replacement
npm run dev
```

This command launches:
1. Vite development server at `http://localhost:5173`.
2. Electron main process pointing to the local dev server.

---

## 8. Build Instructions

To compile the production frontend and package the Windows desktop binaries:

```bash
# 1. Compile the React TypeScript frontend into dist/
npm run vite:build

# 2. Package into unpacked Windows application directory (release/win-unpacked/)
npm run pack

# 3. Generate both NSIS installer (.exe) and Portable standalone (.exe)
npm run dist
```

---

## 9. Windows Installation

Compiled binaries are located in the `release/` directory:

| Artifact | Type | Description |
|---|---|---|
| `release/WINC TASK HUB Setup 1.0.0.exe` | NSIS Installer | Full installer with Start Menu and Desktop shortcut registration. |
| `release/WINC TASK HUB 1.0.0.exe` | Portable Executable | Standalone portable binary; runs directly without installation. |
| `release/win-unpacked/WINC TASK HUB.exe` | Unpacked Directory | Direct directory build for portable execution and debugging. |

---

## 10. Floating Widget and Notifications

### Floating Widget Behavior
- **Activation:** Pinned tasks appear in the widget overlay via `window.electronAPI.showWidget()`.
- **Transparency & Compact Mode:** Configure opacity from 10% to 100% and toggle between comprehensive demand details and a minimal status bar.
- **Window Positioning:** Window coordinates and dimensions persist across application restarts in local SQLite settings.

### Notification Workflow
```
[ Midnight 00:00 / Scheduler Tick ]
               │
               ▼
   Query SQLite due/overdue tasks
               │
               ▼
  Check: Is DND Active or Muted?
        ├── Yes ──► Suppress alert
        └── No  ──► Check notification deduplication cache
                          │
                          ▼
             Emit Windows Native Toast (Action Center)
                          │
                          ▼
             User clicks notification
                          │
                          ▼
             Restore & focus MainWindow to specific Task ID
```

---

## 11. Database and Local Storage

Data is maintained locally in an embedded SQLite database using `better-sqlite3`.

- **File Location:** `%APPDATA%\winc-task-hub\winc_task_hub.db`
- **Write-Ahead Logging (WAL):** Enabled (`pragma journal_mode = WAL`) to ensure concurrent read/write stability and prevent corruption during unexpected shutdowns.
- **Referential Integrity:** Enforced via `pragma foreign_keys = ON`.
- **Backup & Restore:**
  - **Full JSON Export:** Atomic export of `tasks`, `clients`, `releases`, `leads`, and `settings` tables.
  - **Strict Restore Validation:** Whitelist column enforcement prevents schema poisoning or injection during JSON restoration.
  - **CSV Export:** Neutralizes spreadsheet formula injection (CWE-1236) and encodes in UTF-8 with BOM for compatibility with Microsoft Excel.

---

## 12. Security Architecture

WINC TASK HUB incorporates comprehensive security controls designed in compliance with the OWASP Top 10 and Electron Security Guidelines:

- **Strict Sandbox & Context Isolation:** All renderer windows enforce `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`.
- **Restricted Window Openings:** `setWindowOpenHandler` blocks arbitrary popup windows and routes valid `http:`/`https:` external URLs safely through the user's default OS browser.
- **Navigation Lockdown:** `will-navigate` intercepts and blocks unexpected navigation away from local bundle origins.
- **Permission Guard:** Unnecessary browser permissions (camera, microphone, geolocation) are rejected at the session layer.
- **Content Security Policy (CSP):** Declared in HTML meta tags, limiting scripts to local bundle origins.
- **IPC Sender Verification:** All IPC handlers verify `event.senderFrame` to ensure requests originate exclusively from authenticated internal application frames.
- **No Remote Code Execution:** The application does not load or evaluate external untrusted scripts.

---

## 13. Testing

The project includes an automated test suite verifying SQLite persistence, midnight rollovers, snooze calculations, prospection validations, backup integrity, and notification silence:

```bash
# Run the automated test suite
npm test
```

### Verified Test Cases (25/25 Passing)
```
[PASS] Test 1: Task creation and column persistence in SQLite
[PASS] Test 2: Task editing and property updates
[PASS] Test 3: Date rescheduling and deadline calculations
[PASS] Test 4: Multiple demands per day with project grouping
[PASS] Test 5: Weekly recurrence computation
[PASS] Test 6: Monthly recurrence computation
[PASS] Test 7: Client portfolio management (Winc)
[PASS] Test 8: 8-stage release pipeline management (EVILBEAR.JPG)
[PASS] Test 9: Commercial prospection and lead deduplication
[PASS] Test 10: Persistent reminder trigger at 00:00 midnight
[PASS] Test 11: Task unpinning preserves pending calendar state
[PASS] Test 12: Concluding task concludes and unpins simultaneously
[PASS] Test 13: Snoozing demands to future dates/times
[PASS] Test 14: Overdue recovery following machine shutdown or reboot
[PASS] Test 15: ACID JSON backup export and validated restoration
[PASS] Test 16: CSV task export with formula injection sanitization and UTF-8 BOM
[PASS] Test 17: Clean task duplication
[PASS] Test 18: Safe task deletion and cascade constraints
[PASS] Test 19: Non-intrusive default UX preferences and persistence
[PASS] Test 20: Do Not Disturb (DND) suppresses notification delivery
[PASS] Test 21: Master notification toggle disables OS toast emissions
[PASS] Test 22: Selective notification filtering by category
[PASS] Test 23: De-duplication cache prevents repetitive alerts
[PASS] Test 24: Concluding demands is 100% silent
[PASS] Test 25: Scheduler reconciliation runs quietly without stealing focus
```

---

## 14. Project Structure

```
winc-task-hub/
├── .github/
│   ├── dependabot.yml         # Automated weekly dependency scan configuration
│   └── workflows/
│       └── security.yml       # CI security audit, automated test suite, and build pipeline
├── electron/
│   ├── main.cjs               # Electron main process (lifecycle, IPC, shortcuts, tray)
│   ├── preload.cjs            # Secure context bridge exposing window.electronAPI
│   ├── db/
│   │   ├── database.cjs       # SQLite connection manager (WAL mode, DDL schema)
│   │   ├── tasksRepo.cjs      # Task CRUD, recurrence engine, and filtering
│   │   ├── clientsRepo.cjs    # Winc client accounts and EVILBEAR releases
│   │   ├── prospectionRepo.cjs# CRM leads, outreach logs, and metrics
│   │   ├── settingsRepo.cjs   # User preferences, error logs, and backup exports
│   │   └── seed.cjs           # Initial onboarding dataset
│   ├── scheduler/
│   │   └── reminderScheduler.cjs # Quiet 00:00 rollover & overdue detector
│   ├── services/
│   │   └── notificationService.cjs # Windows native Action Center toast dispatcher
│   └── windows/
│       ├── mainWindow.cjs     # Primary responsive application window
│       ├── widgetWindow.cjs   # Always-on-top neon floating overlay
│       └── quickCaptureWindow.cjs # Spotlight-style fast entry window
├── resources/
│   └── tray-icon.png          # Dedicated 16x16 tray icon asset
├── src/
│   ├── components/
│   │   ├── calendar/          # Month, Week, and Day calendar views & task modals
│   │   ├── dashboard/         # Productivity metrics and active demands overview
│   │   ├── winc/              # Agency Winc client cards and category pipelines
│   │   ├── evilbear/          # Music release pipeline & beat metadata management
│   │   ├── prospection/       # Commercial prospecting kanban and goal meters
│   │   ├── reminders/         # Floating widget user interface
│   │   ├── quickcapture/      # Minimal quick-entry interface
│   │   └── settings/          # Display toggles, shortcut rebinding, and backups
│   ├── context/
│   │   └── TaskHubContext.tsx # Centralized application state wired to electronAPI
│   ├── lib/
│   │   ├── sounds.ts          # Web Audio synthesized notification chimes
│   │   └── utils.ts           # CSS and formatting utility functions
│   ├── styles/
│   │   └── index.css          # Tailwind CSS v4 directives & dark theme variables
│   ├── types/
│   │   ├── electron.d.ts      # TypeScript interfaces for window.electronAPI
│   │   └── index.ts           # Domain models (Task, Client, Release, Lead, Settings)
│   ├── App.tsx                # Main router and navigation controller
│   └── main.tsx               # React application entry point
├── tests/
│   └── app.test.js            # Automated unit and integration test suite
├── .gitignore                 # Exclusion rules for artifacts, logs, and databases
├── index.html                 # HTML entry document with Content Security Policy
├── LICENSE                    # MIT License
├── package.json               # Dependencies, build scripts, and electron-builder config
├── SECURITY.md                # Coordinated disclosure policy & security specifications
├── tsconfig.json              # TypeScript compilation configuration
└── vite.config.ts             # Vite bundler configuration
```

---

## 15. Contributing

Contributions to WINC TASK HUB are welcomed. Please follow these guidelines:

1. **Fork the Repository:** Create a personal fork and branch off `main` (`feature/your-feature-name` or `fix/your-fix-name`).
2. **Adhere to Code Standards:** Maintain TypeScript strictness, preserve docstrings, and match the Tailwind dark-luxury UI conventions.
3. **Write Tests:** Include test assertions in `tests/app.test.js` covering new business logic.
4. **Security Verification:** Ensure no IPC channels expose unfiltered raw Node.js APIs or unvalidated input parameters.
5. **Open a Pull Request:** Provide a clear summary of changes, motivation, and verification steps.

---

## 16. License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.

Copyright © 2026 Agência Winc / Jhon Wictor. All rights reserved.
