chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ebay-error-lookup',
    title: 'eBayエラーコードを検索',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== 'ebay-error-lookup') {
    return;
  }

  const selectedText = (info.selectionText || '').trim();
  const errorCode = selectedText.replace(/\D/g, '');

  if (errorCode.length === 0) {
    return;
  }

  chrome.storage.local.set({ pendingErrorCode: errorCode }).then(() => {
    chrome.action.openPopup();
  });
});
