/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

const thirdPartyLicenses = new Map<string, string>();

function collectLicenseFromFile(filePath: string) {
  if (!filePath.includes('node_modules')) return;

  let dir = path.dirname(filePath);
  while (dir !== path.dirname(dir)) {
    const pkgFile = path.join(dir, 'package.json');
    if (fs.existsSync(pkgFile)) {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
      if (pkg.name) {
        const key = `${pkg.name}@${pkg.version}`;
        if (!thirdPartyLicenses.has(key)) {
          const licenseFile = fs
            .readdirSync(dir)
            .find((f) => /^(licen[cs]e|copying|notice)(\..+)?$/i.test(f));
          const text = licenseFile
            ? fs.readFileSync(path.join(dir, licenseFile), 'utf8').trim()
            : `License: ${pkg.license ?? 'Unknown'}`;
          thirdPartyLicenses.set(key, `${key} (${pkg.license ?? 'Unknown'})\n${'-'.repeat(key.length)}\n${text}`);
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
      if (thirdPartyLicenses.size > 0) {
        const out = [...thirdPartyLicenses.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, text]) => text)
          .join('\n\n========================================\n\n');
        fs.writeFileSync(path.join(wxt.config.outDir, 'THIRD-PARTY-LICENSES.txt'), out + '\n', 'utf8');
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
                collectLicenseFromFile(id);
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
  // ...manifest
});