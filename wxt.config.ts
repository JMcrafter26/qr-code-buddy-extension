/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

const MIT_TEXT = `Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

const mitPackages = new Map<string, string>();
const otherPackages = new Map<string, string>();

function collectLicense(filePath: string) {
  if (!filePath.includes('node_modules')) return;

  let dir = path.dirname(filePath);
  while (dir !== path.dirname(dir)) {
    const pkgFile = path.join(dir, 'package.json');
    if (fs.existsSync(pkgFile)) {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
      if (pkg.name) {
        const key = `${pkg.name}@${pkg.version}`;
        if (mitPackages.has(key) || otherPackages.has(key)) return;

        const rawLicense = typeof pkg.license === 'string' ? pkg.license : pkg.license?.type ?? '';
        const licenseFiles = fs
          .readdirSync(dir)
          .filter((f) => /^(licen[cs]e|copying|notice)(\..+)?$/i.test(f))
          .sort();

        const fullText = licenseFiles
          .map((f) => fs.readFileSync(path.join(dir, f), 'utf8').trim())
          .join('\n\n');

        if (/^mit$/i.test(rawLicense.trim())) {
          const copyrights = fullText
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => /^copyright\b/i.test(l));
          const author = typeof pkg.author === 'string' ? pkg.author : pkg.author?.name;
          const notice =
            copyrights.length > 0 ? copyrights.join(' | ') : author ? `Copyright (c) ${author}` : 'MIT Licensed';
          mitPackages.set(key, `- ${key}: ${notice}`);
        } else {
          const label = `${key} (${rawLicense || 'Unknown'})`;
          const body = fullText || `License: ${rawLicense || 'See package repository'}`;
          otherPackages.set(key, `${label}\n${'-'.repeat(label.length)}\n${body}`);
        }
        return;
      }
    }
    dir = path.dirname(dir);
  }
}

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  hooks: {
    'build:done': (wxt) => {
      const sections: string[] = [];

      if (mitPackages.size > 0) {
        const list = [...mitPackages.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, line]) => line)
          .join('\n');
        sections.push(`MIT Licensed Software\n=====================\n\n${list}\n\n${MIT_TEXT}`);
      }

      if (otherPackages.size > 0) {
        const others = [...otherPackages.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, block]) => block)
          .join('\n\n----------------------------------------\n\n');
        sections.push(`Other Licensed Software\n=======================\n\n${others}`);
      }

      if (sections.length > 0) {
        fs.writeFileSync(
          path.join(wxt.config.outDir, 'THIRD-PARTY-LICENSES.txt'),
          sections.join('\n\n========================================\n\n') + '\n',
          'utf8',
        );
      }
    },
  },
  vite: () => ({
    plugins: [
      tailwindcss(),
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/paraglide',
        emitTsDeclarations: true,
        strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
      }),
      {
        name: 'collect-bundled-licenses',
        generateBundle(_, bundle) {
          for (const item of Object.values(bundle)) {
            if (item.type === 'chunk') {
              for (const id of item.moduleIds ?? Object.keys(item.modules ?? {})) {
                collectLicense(id);
              }
            }
          }
        },
      },
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