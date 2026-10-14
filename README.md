# 📝 DynamaNotes

> A fast, beautiful, and native GoodNotes-style note-taking application built with **Rust (Tauri v2)** and **Svelte 5**.

![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Rust](https://img.shields.io/badge/Backend-Rust%20%7C%20Tauri%20v2-orange)
![Frontend](https://img.shields.io/badge/Frontend-Svelte%205%20%7C%20Canvas%202D-red)

DynamaNotes brings the signature dark-mode document library, centered floating toolbar, and realistic warm ivory paper experience of GoodNotes to **macOS** and **Windows**, powered by a high-performance Rust core and an embedded SQLite database.

---

## 📥 Downloads

| Package | Description | Download |
| :--- | :--- | :--- |
| **DynamaNotes Portable (Mac & Windows)** | Zero-install standalone desktop package with all vector ink tools | [**Download ZIP**](https://github.com/Noorhorse01/dynamanotes/raw/main/release/DynamaNotes-v1.0.0-Portable.zip) |
| **All GitHub Releases** | Installer binaries and historical builds | [**View Releases**](https://github.com/Noorhorse01/dynamanotes/releases) |

---

## ✨ Features

- **🎨 High-Fidelity GoodNotes UI**
  - **Library View**: Dark-themed document grid with notebook covers, folded corner accents, favorites, and "+ New" modal.
  - **Editor View**: Clean full-screen writing experience with deep-blue header bar and document tab navigation.
  - **Centered Floating Toolbar**: Floating dark pill containing all writing tools, color dots, stroke thickness presets, and undo/redo buttons.
- **✒️ Vector Ink Engine**
  - Pressure-sensitive strokes with stylus pressure support via Pointer Events.
  - Variable-width calligraphic ink algorithms (Catmull-Rom spline curve fitting).
  - High-frequency sampling using browser coalesced events (120Hz/240Hz stylus support).
- **🛠️ Complete Tool Palette**
  - **Pen & Fountain Pen**: Smooth handwriting with dynamic tapering.
  - **Highlighter**: Semi-transparent multiply blend mode that renders neatly *behind* pen strokes.
  - **Eraser**: Multiple modes including Stroke Eraser (erases full line on contact) and Standard Eraser.
  - **Shape Recognition**: Automatically snaps hand-drawn sketches into clean geometric lines, rectangles, ellipses, and circles.
  - **Lasso Selection**: Freehand loop selection to move, recolor, or delete strokes.
- **📄 Paper Templates**
  - **GoodNotes Squared Grid**: Warm ivory paper (`#faf8f0`) with subtle blue-gray grid lines and top bold rule.
  - **Lined Paper**: Traditional ruled paper with vertical margin line.
  - **Dot Grid**: Clean dot matrix for bullet journaling and sketches.
  - **Cornell Notes**: Dedicated sections for cues, notes, and summary.
  - **Dark Grid / Blank**: Night-mode paper options.
- **⚡ Native Rust & SQLite Storage**
  - Fast, crash-resilient persistence via embedded SQLite (`rusqlite`) with WAL mode.
  - Zero IPC lag: stroke vector coordinates are processed smoothly in Canvas and synced via lightweight JSON IPC commands.
- **📤 Export & Backup**
  - Export single pages to crisp high-resolution PNG images.
  - Native print-to-PDF support.
  - Export entire notebooks as `.dynamanotes` lossless vector backup files.

---

## 🏗️ Architecture

```
dynamanotes/
├── src-tauri/                 # Rust Backend (Tauri v2)
│   ├── src/
│   │   ├── main.rs            # Desktop binary entry point
│   │   ├── lib.rs             # Tauri command registrations & plugins
│   │   ├── db/mod.rs          # Embedded SQLite database manager (rusqlite)
│   │   ├── models/mod.rs      # Data structures (Notebook, Page, Stroke, Folder)
│   │   └── commands/          # IPC command handlers
│   │       ├── notebook.rs    # Notebook & folder CRUD
│   │       ├── page.rs        # Page & stroke storage
│   │       └── export.rs      # Document backup & import
│   ├── Cargo.toml             # Rust dependencies
│   ├── tauri.conf.json        # Tauri v2 configuration
│   └── capabilities/          # Security permissions (fs, dialog, shell)
│
├── src/                       # Svelte 5 Frontend
│   ├── lib/
│   │   ├── canvas/            # Vector ink engine & templates
│   │   │   ├── engine.ts      # Multi-layer canvas orchestration
│   │   │   ├── perfectFreehand.ts # Pressure-sensitive stroke outline generator
│   │   │   ├── templates.ts   # GoodNotes paper templates (Grid, Lined, Cornell)
│   │   │   └── shapes.ts      # Geometric shape recognition
│   │   ├── components/
│   │   │   ├── Library/       # Library view, sidebar, notebook cards
│   │   │   ├── Editor/        # Editor view, floating toolbar, thumbnails drawer
│   │   │   └── Modals/        # New notebook modal, export modal
│   │   ├── services/api.ts    # Dual-mode API (Tauri IPC + browser fallback)
│   │   └── stores/            # Reactive state management
│   ├── App.svelte             # Root component router
│   ├── app.css                # Dark mode styles & typography
│   └── main.ts                # Application mount
│
├── preview.html               # Zero-dependency browser preview application
├── scripts/dev_server.py      # Instant local preview server
└── .github/workflows/build.yml # CI/CD for macOS (.dmg) & Windows (.msi/.exe)
```

---

## 🚀 Getting Started

### Quick Local Preview (No Build Tools Required)

To inspect and test the UI and canvas immediately in your browser:

```bash
# Start the lightweight Python preview server
python3 scripts/dev_server.py
```

Then navigate to `http://localhost:8080/preview.html`.

---

### Desktop Development (Tauri + Svelte)

#### 1. Prerequisites

- **Node.js**: `v18+` or `v20+`
- **Rust**: `rustup default stable`
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)
- **Windows**: [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and [WebView2 runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

#### 2. Install Dependencies

```bash
cd dynamanotes
npm install
```

#### 3. Run in Development Mode

```bash
npm run tauri dev
```

This starts the Vite frontend dev server and compiles the native Rust backend into a native macOS or Windows desktop window with hot reloading.

---

### 📦 Building for Production

To produce standalone native installers:

```bash
# macOS: generates .dmg and .app bundle in src-tauri/target/release/bundle/dmg/
# Windows: generates .msi installer and .exe in src-tauri/target/release/bundle/msi/
npm run tauri build
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for bug reports and feature requests.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
