// A generic onclick callback function.
chrome.contextMenus.onClicked.addListener(genericOnClick);

// A generic onclick callback function.
function genericOnClick(info) {
    console.log("Word " + info.selectionText + " was clicked.");
    let url;
    if(info.selectionText){
        url = info.selectionText;
    } else if(info.linkUrl){
        url = info.linkUrl;
    } else if(info.pageUrl){
        url = info.pageUrl;
    } else {
        url = "https://www.google.com";
    }
    chrome.tabs.create({
      url: chrome.runtime.getURL('page/qr-code.html?url=' + url)
    });
}

chrome.runtime.onInstalled.addListener(function () {
  // Create a parent item and two children.
  chrome.contextMenus.create({
    title: 'Generate QR Code',
    id: 'contextMenu',
    contexts: ['page', 'selection', 'link']
  });
});