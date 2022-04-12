// Compatibility fix
try {
  if (typeof browser === 'undefined') browser = chrome
} catch (e) {
  browser = chrome
}
if (typeof browser.action === 'undefined') browser.action = browser.browserAction

let disabled = false
browser.action.onClicked.addListener(tab => {
  disabled = !disabled
  browser.action.setIcon({ path: disabled ? '/light.png' : '/dark.png' });
  browser.tabs.sendMessage(tab.id, disabled)
});
browser.runtime.onMessage.addListener((request, sender, send) => {
  if (request.disabled !== disabled) {
    disabled = request.disabled
    browser.action.setIcon({ path: disabled ? '/light.png' : '/dark.png' });
  }
  send('done')
})
