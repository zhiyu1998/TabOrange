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

## Architecture

### Extension Entry Points

- **Popup** (`src/popup/`) - Main UI when clicking the extension icon, triggers AI grouping
- **Options** (`src/options/`) - Settings page for OpenAI configuration and grouping preferences

### Core Services (`src/services/`)

```
grouping.ts  ─── Main orchestration: executeAIGrouping()
    │            Coordinates the entire flow with progress callbacks
    │
    ├── openai.ts ─── AI integration
    │                 - getConfig(): Load settings from chrome.storage.sync
    │                 - requestAIGrouping(): Build prompt, call OpenAI, parse JSON response
    │
    └── tabs.ts ───── Chrome tabs/groups API wrapper
                      - getCurrentWindowTabs/Groups(): Query current window
                      - prepareTabsForAI(): Filter and transform for AI prompt
                      - createTabGroup(): Create and configure tab groups
```

### Data Flow

1. User clicks "一键AI分组" → `executeAIGrouping(mode)`
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
- OpenAI: baseUrl, apiKey, model
- AI Grouping: keepExistingGroups, ignorePinnedTabs, autoCollapseNewGroups, singleTabNoGroup

## Manifest Configuration

Defined in `manifest.config.ts` using CRXJS `defineManifest()`. Permissions: `tabs`, `tabGroups`, `storage`.

## Path Alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).
