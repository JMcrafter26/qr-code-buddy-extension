import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({
    plugins: [tailwindcss()],
    build: {
      modulePreload: false,
    },
  }),
  manifest: {
    name: 'QR Code Buddy',
    description: 'The simple QR Code Generator that does the thing and does it well.',
    permissions: ['activeTab', 'tabs', 'storage', 'contextMenus'],
    web_accessible_resources: [
      {
        resources: ['welcome.html', 'chunks/*', 'assets/*'],
        matches: ['<all_urls>'],
      },
    ],
    host_permissions: [
      'https://tinyurl.com/*',
      'https://is.gd/*',
      'https://api-ssl.bitly.com/*',
    ],
    browser_specific_settings: {
      gecko: {
        id: 'qr-code-buddy@jm26.net',
      },
    },
  },
  webExt: {
    binaries: {
      chrome: 'chromium', // Use Chrome Beta instead of regular Chrome
      firefox: 'firefoxdeveloperedition', // Use Firefox Developer Edition instead of regular Firefox
      edge: '/path/to/edge', // Open MS Edge when running "wxt -b edge"
    },
  },
});
