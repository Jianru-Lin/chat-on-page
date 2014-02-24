chrome.browserAction.onClicked.addListener(onClickBrowserAction);
chrome.runtime.onMessage.addListener(onMessage);

function onClickBrowserAction(tab) {
	chrome.tabs.sendMessage(tab.id, {action: "toggle"});
}

function onMessage(req, sender, resCb) {
	var res = {
	};
	resCb(res);
}

