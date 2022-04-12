let disabled = false;
if (typeof browser === 'undefined') browser = chrome
browser.browserAction.onClicked.addListener(tab => {
  disabled = !disabled
  browser.browserAction.setIcon({ path: disabled ? '/light.png' : '/dark.png' });
  return browser.tabs.executeScript(tab.id, {
    code: 'window.toggle();',
    allFrames: true,
  })
});
browser.runtime.onMessage.addListener(request => {
  if (request.disabled !== disabled) {
    disabled = request.disabled
    browser.browserAction.setIcon({ path: disabled ? '/light.png' : '/dark.png' });
  }
})
