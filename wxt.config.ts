/* eslint-disable @typescript-eslint/naming-convention */
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({
    plugins: [
      tailwindcss(),
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/paraglide',
        emitTsDeclarations: true,
        strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
      }),
    ],
    build: {
      modulePreload: false,
    },
  }),
  manifest: ({ manifestVersion }) => ({
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    permissions: ['activeTab', 'storage', 'contextMenus'],
    default_locale: 'en',
    // Host permissions are optional to avoid Chrome Web Store thorough review warning.
    // Requested at runtime only when user enables a network shortener.
    ...(manifestVersion === 3
      ? {
          optional_host_permissions: [
            'https://tinyurl.com/*',
            'https://is.gd/*',
            'https://api-ssl.bitly.com/*',
          ],
        }
      : {
          optional_permissions: [
            'https://tinyurl.com/*',
            'https://is.gd/*',
            'https://api-ssl.bitly.com/*',
          ],
        }),
    browser_specific_settings: {
      gecko: {
        id: 'qr-code-buddy@jm26.net',
      },
    },
  }),
});
