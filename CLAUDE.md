# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TabOrange is a Chrome extension that uses AI (OpenAI) to automatically group browser tabs based on their content. Built with Vue 3, TypeScript, and CRXJS Vite plugin.

## Build Commands

```bash
# Development mode with hot reload
bun run dev

# Production build (type-check + vite build + zip)
bun run build
```

The build outputs to `dist/` and creates a zip file in `release/`.

## Development Philosophy
- **KISS (Keep It Simple, Stupid)**: Favor simple, readable solutions over complex abstractions
- **YAGNI (You Aren't Gonna Need It)**: Implement features only when actually needed
- **SOLID Principles**: Follow single responsibility per component, open for extension, and dependency inversion

## Architecture

### Extension Entry Points

- **Popup** (`src/popup/`) - Main UI when clicking the extension icon, triggers AI grouping
- **Options** (`src/options/`) - Settings page for OpenAI configuration and grouping preferences
- **Background** (`src/background/`) - Service worker handling keyboard shortcuts, auto-grouping, and tab lifecycle
- **Content Script** (`src/content/`) - Injected into pages for toast notifications via sweetalert2

### Core Services (`src/services/`)

```
grouping.ts  ─── Main orchestration: executeAIGrouping()
    │            Coordinates the entire flow with progress callbacks
    │
    ├── openai.ts ─── AI integration
    │                 - getConfig(): Load settings from chrome.storage.sync
    │                 - requestAIGrouping(): Build prompt, call OpenAI, parse JSON response
    │
    ├── tabs.ts ───── Chrome tabs/groups API wrapper
    │                 - getCurrentWindowTabs/Groups(): Query current window
    │                 - prepareTabsForAI(): Filter and transform for AI prompt
    │                 - createTabGroup(): Create and configure tab groups
    │
    └── domainNames.ts ─── Domain name simplification for display
```

### Background Service Worker (`src/background/index.ts`)

Handles:
- **Keyboard shortcut** (`Alt+G`) - Triggers AI grouping with cooldown protection
- **Instant grouping** - Auto-groups new tabs by domain when threshold is reached
- **Window state tracking** - Maintains per-window state for grouping
- **Notifications** - Sends messages to content script for toast display

### Content Script (`src/content/index.ts`)

- Listens for `SHOW_NOTIFICATION` messages from background
- Displays sweetalert2 toast notifications (top-right, non-intrusive)
- Shows grouping status: start, success, error, cooldown

### Data Flow

1. User clicks "一键AI分组" or presses `Alt+G` → `executeAIGrouping(mode)`
2. Load config from `chrome.storage.sync`
3. Get current tabs and existing groups via Chrome API
4. Filter out system pages (`chrome://`, `chrome-extension://`) and optionally pinned tabs
5. Send tab info (id, title, domain, existing group) to OpenAI
6. AI returns JSON with `groups[]` and `ungroupedTabIds[]`
7. Apply grouping using `chrome.tabs.group()` and `chrome.tabGroups.update()`

### Type Definitions (`src/types/index.ts`)

Key interfaces: `TabInfo`, `GroupInfo`, `AIGroupResult`, `AppConfig`, `TabGroupColor`

## Configuration

Settings stored in `chrome.storage.sync` under `config` key:

| Section | Options |
|---------|---------|
| **OpenAI** | baseUrl, apiKey, model, useMethod (api/web) |
| **Instant Group** | enabled, threshold (0 = always AI), namingMethod |
| **AI Grouping** | keepExistingGroups, ignorePinnedTabs, autoCollapseNewGroups, singleTabNoGroup |
| **Shortcut** | cooldown (seconds, default 30) |

## Keyboard Shortcut

- **Alt+G** - Trigger AI grouping (customizable at `chrome://extensions/shortcuts`)
- Cooldown protection prevents accidental repeated triggers (default 30s)
- Shows toast notifications for status feedback

## Manifest Configuration

Defined in `manifest.config.ts` using CRXJS `defineManifest()`.

- **Permissions**: `tabs`, `tabGroups`, `storage`
- **Commands**: `trigger-ai-grouping` (Alt+G)
- **Content Scripts**: Injected into all URLs for notifications

## Path Alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).
