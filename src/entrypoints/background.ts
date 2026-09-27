import { compareVersions, isAtLeast } from '../utils/version/compare';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async (details) => {
    try {
      await browser.contextMenus.create({
        id: 'contextMenu',
        title: 'Generate QR Code',
        contexts: ['page', 'selection', 'link'],
      });
    } catch {}

    try {
      // Use dynamic import to avoid top-level runtime code (WXT build restriction)
      const { metaItem, WELCOME_VERSION } =
        await import('../utils/storage/meta');
      const currentVersion = browser.runtime.getManifest().version;
      const meta = await metaItem.getValue();

      // Show the welcome flow once for users who have never seen the 2.0.0+
      // welcome, even if they already updated to a 2.x version before this
      // tracking existed.
      const neverSeenWelcome =
        !meta.lastWelcomeVersion ||
        compareVersions(meta.lastWelcomeVersion, WELCOME_VERSION) < 0;
      const eligibleVersion = isAtLeast(currentVersion, WELCOME_VERSION);

      let openWelcome = false;
      if (details.reason === 'install') {
        openWelcome = true;
      } else if (details.reason === 'update') {
        openWelcome = neverSeenWelcome && eligibleVersion;
      }

      if (openWelcome) {
        try {
          await browser.tabs.create({
            url: browser.runtime.getURL('/welcome.html'),
            active: true,
          });
        } catch (e) {
          console.error('welcome open failed', e);
        }
      }

      await metaItem.setValue({
        lastVersion: currentVersion,
        lastWelcomeVersion: openWelcome
          ? currentVersion
          : meta.lastWelcomeVersion,
      });
    } catch {}

    if (details.reason === 'install') {
      try {
        const { settingsItem, DEFAULT_SETTINGS } =
          await import('../utils/storage/settings');
        const raw = await browser.storage.local.get('settings' as any);
        if (
          !raw ||
          Object.keys(raw).length === 0 ||
          (raw as any).settings === undefined
        ) {
          await settingsItem.setValue(DEFAULT_SETTINGS as any);
        }
      } catch {}
    }
  });

  browser.contextMenus.onClicked.addListener((info) => {
    let url: string;
    if (info.selectionText) {
      url = info.selectionText as string;
    } else if (info.linkUrl) {
      url = info.linkUrl as string;
    } else if (info.pageUrl) {
      url = info.pageUrl as string;
    } else {
      url = 'https://wikipedia.org';
    }
    browser.tabs.create({
      url: browser.runtime.getURL(`/qr.html?url=${encodeURIComponent(url)}`),
    });
  });
});
