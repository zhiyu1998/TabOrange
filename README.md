<p align="center">
  <img src="public/icon128.png" alt="TabOrange Logo" width="128" height="128">
</p>

<h1 align="center">TabOrange</h1>

<p align="center">
  <strong>AI-powered browser tab grouping extension</strong>
</p>

<p align="center">
  Automatically organize your browser tabs using AI to solve tab clutter and boost productivity.
</p>

---

## Features

### Available Now

- **One-Click AI Grouping** - Instantly organize all tabs in your current window with a single click
- **Smart Tab Analysis** - AI analyzes tab titles and URLs to create meaningful groups
- **Customizable OpenAI Settings** - Support for custom API endpoints, API keys, and models
- **Grouping Preferences**
  - Keep existing groups intact
  - Ignore pinned tabs
  - Auto-collapse new groups
  - Skip single-tab groups

### Coming Soon

- **Gemini API Support** - Alternative AI provider for tab grouping
- **ChatGPT Web Mode** - Use ChatGPT web interface instead of API
- **Instant Grouping** - Automatically add new tabs to current group
- **Rule-based Naming** - Custom rules for group naming
- **AI-powered Group Naming** - Let AI suggest group names

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Build the extension:
   ```bash
   bun run build
   ```
4. Load the `dist` folder as an unpacked extension in Chrome

## Development

```bash
# Start development server with hot reload
bun run dev

# Build for production
bun run build
```

## Configuration

1. Click the TabOrange icon and select "Open Settings"
2. Enter your OpenAI API Key
3. (Optional) Configure custom Base URL and model
4. Click "Test Connection" to verify your settings

## Tech Stack

- Vue 3 + TypeScript
- Vite + CRXJS
- OpenAI SDK
- Chrome Extension Manifest V3

## License

MIT
