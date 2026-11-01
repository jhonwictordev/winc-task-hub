# Security Policy

## Supported Versions

Only the latest release of **WINC TASK HUB** receives active security updates and vulnerability patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Reporting a Vulnerability

We take the security of WINC TASK HUB and user data seriously. If you identify a security vulnerability, we ask that you follow coordinated disclosure practices and do not report it through public GitHub issues.

### Reporting Process
1. Email your finding privately to the repository maintainer: `jhonwictordev@users.noreply.github.com` or submit a private security advisory via GitHub [Security Advisories](https://github.com/jhonwictordev/winc-task-hub/security/advisories).
2. Include the following details in your report:
   - Type of vulnerability (e.g., IPC bypass, Electron sandbox escape, CSV formula injection, SQL injection).
   - Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
   - Affected files and operating system version.
   - Potential impact and recommended mitigation.
3. You will receive an acknowledgment within **48 hours**, followed by a timeline for triage and remediation.
4. Once remediated, a security release will be published with credit given to the reporter (unless anonymity is requested).

---

## Security Architecture & Design Principles

WINC TASK HUB is architected around the Principle of Least Privilege and OWASP Electron Security recommendations:

### 1. Isolated Renderer & Context Bridge
- **`nodeIntegration: false`**: Node.js APIs are strictly disallowed in renderer processes.
- **`contextIsolation: true`**: Renderer JavaScript execution is isolated from Electron's preload scripts.
- **`sandbox: true`**: Chromium renderer sandboxing is enforced across all windows.
- **`webSecurity: true`**: Same-origin policies and web security are strictly maintained.

### 2. Guarded IPC Communication
- Preload scripts expose only explicit, narrow invoke methods via `contextBridge.exposeInMainWorld('electronAPI', ...)`.
- All `ipcMain.handle` listeners validate the calling frame (`validateIpcSender`) to verify requests originate exclusively from authentic application windows (`file://` or designated localhost dev servers).
- Handler parameters are strictly type-checked and sanitized before touching underlying persistence logic.

### 3. Local SQLite Hardening
- All SQL operations utilize parameterized prepared statements (`?` binding) via `better-sqlite3`. Dynamic SQL string concatenation is prohibited.
- Backup JSON import executes inside an atomic SQLite transaction and strictly filters input keys against a column whitelist (`ALLOWED_TASK_COLUMNS`, etc.).
- CSV task exports sanitize cell values to neutralize CSV Formula Injection (CWE-1236).
- Database files reside in the user's protected OS application data directory (`%APPDATA%\winc-task-hub`).

### 4. Restricted Navigation & URL Handling
- Window creation handlers (`webContents.setWindowOpenHandler`) block untrusted window popups and route valid external `http:`/`https:` links to the system's default browser via `shell.openExternal`.
- Unexpected top-level frame navigation away from the local application bundle is intercepted and blocked via `will-navigate`.
- Strict Content Security Policy (CSP) is declared in HTML metadata to restrict arbitrary script execution.
- Browser and device permissions (camera, microphone, geolocation) are unconditionally denied at the session level.
