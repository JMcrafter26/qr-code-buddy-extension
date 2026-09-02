export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: 'contextMenu',
      title: 'Generate QR Code',
      contexts: ['page', 'selection', 'link'],
    });
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
