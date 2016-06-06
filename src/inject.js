const script = document.createElement('script');
script.src = chrome.extension.getURL('lib/hook.js');
document.addEventListener('DOMContentLoaded', () => {
  document.head.appendChild(script);
});

window.addEventListener('message', event => {
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (['update', 'update-messages'].indexOf(event.data.type) !== -1)) {
    chrome.runtime.sendMessage(event.data);
  }
}, false);
