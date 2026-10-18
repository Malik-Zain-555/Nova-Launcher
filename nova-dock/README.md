# NOVA DOCK 2.0

> Next-Generation Dynamic Island Productivity Dock for Windows 10/11

Nova Dock 2.0 re-imagines desktop productivity at the crossroads of **Apple Dynamic Island**, **Raycast**, **Windows PowerToys**, and an **integrated AI Copilot**.

---

## 🚀 Quick Start

### 1. Requirements
- Node.js v20+ (Node v24 is installed and verified on this machine)
- Windows 10 / 11 (Supports native DWM Acrylic & Mica materials)

### 2. Run the Development Shell
```bash
# In c:\Users\zainc\OneDrive\Desktop\Code\Projects with AI\nova-dock
npm run dev
```
Open `http://localhost:5173` to interact with the Dynamic Island UI, test morphing animations, and inspect design tokens.

### 3. Run with Electron Native Desktop Wrapper
```bash
# Builds the electron main process and launches the frameless floating pill
npm run build:electron
npm run app:dev
```

---

## 📐 Architecture Overview
1. **Core Shell**: Frameless, transparent, always-on-top window supporting 3 dynamic states (`compact`, `live-activity`, `expanded`) with smooth 60fps spring transitions.
2. **Design System**: Windows 11 Fluent Design & Apple Dynamic Island physics tokenized in `src/design-system/tokens.ts`.
3. **Module & Plugin Engine**: Standardized lifecycle (`init`, `renderCompactBadge`, `renderExpanded`, `getCommands`, `onEvent`) in `src/types/module.ts`.
4. **Command Palette**: Raycast-style instant launcher summoned anywhere via `Ctrl + Alt + Space` with live math evaluation, keyword fuzzy search, and quick actions.
5. **Local Database**: Persistent local store with SQLite fallback for offline-first privacy.
