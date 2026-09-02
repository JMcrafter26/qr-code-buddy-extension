export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async (details) => {
    try {
      await browser.contextMenus.create({
        id: 'contextMenu',
        title: 'Generate QR Code',
        contexts: ['page', 'selection', 'link'],
      });
    } catch {}
    if (details.reason === 'install') {
      try {
        await browser.tabs.create({ url: browser.runtime.getURL('/welcome.html'), active: true });
      } catch (e) {
        console.error('welcome open failed', e);
      }
      try {
        // Use dynamic import to avoid top-level runtime code (WXT build restriction)
        const { settingsItem, DEFAULT_SETTINGS } = await import('../utils/storage/settings');
        const raw = await browser.storage.local.get('settings' as any);
        if (!raw || Object.keys(raw).length === 0 || (raw as any).settings === undefined) {
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
      url = 'https://www.google.com';
    }
    browser.tabs.create({
      url: browser.runtime.getURL(`/qr.html?url=${encodeURIComponent(url)}`),
    });
  });
});
