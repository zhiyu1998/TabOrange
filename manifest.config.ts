import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'TabOrange',
  description: 'AI智能标签页分组管理',
  version: pkg.version,
  icons: {
    16: 'public/logo.png',
    48: 'public/logo.png',
    128: 'public/logo.png',
  },
  action: {
    default_icon: {
      16: 'public/logo.png',
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
    default_title: 'TabOrange',
  },
  options_ui: {
    page: 'src/options/index.html',
    open_in_tab: true,
  },
  permissions: [
    'tabs',
    'tabGroups',
    'storage',
  ],
})
