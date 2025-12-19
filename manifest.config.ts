import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'TabOrange',
  description: 'A plugin that automatically groups tabs to solve the clutter problem in browser tabs, using OpenAI and Gemini interfaces.',
  version: pkg.version,
  icons: {
    16: "public/icon16.png",
    32: "public/icon32.png",
    48: "public/icon48.png",
    128: "public/icon128.png"
  },
  action: {
    default_icon: {
      16: 'public/icon16.png',
      48: 'public/icon48.png',
    },
    default_popup: 'src/popup/index.html',
    default_title: 'TabOrange',
  },
  options_ui: {
    page: 'src/options/index.html',
    open_in_tab: true,
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  permissions: [
    'tabs',
    'tabGroups',
    'storage',
  ],
})
