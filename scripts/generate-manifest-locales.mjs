import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import {
  generateChromeMessagesFile,
  parseMessagesFile,
} from '@wxt-dev/i18n/build';

const manifestMessageKeys = new Set(['extensionName', 'extensionDescription']);
const locales = ['en', 'de', 'fr', 'es', 'ja', 'pt_BR', 'ru', 'zh_CN'];
const outputRoot = path.resolve('public/_locales');

await rm(outputRoot, { recursive: true, force: true });

for (const locale of locales) {
  const messages = await parseMessagesFile(`src/locales/${locale}.json`);
  const manifestMessages = messages.filter(
    (message) =>
      message.key.length === 1 && manifestMessageKeys.has(message.key[0]),
  );
  const outputFile = path.join(outputRoot, locale, 'messages.json');

  await mkdir(path.dirname(outputFile), { recursive: true });
  await generateChromeMessagesFile(outputFile, manifestMessages);
}
