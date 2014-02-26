(function() {
	// override the default json_request_url
	json_request_url = 'http://chat.miaodeli.com/action';

	chrome.browserAction.onClicked.addListener(onClickBrowserAction);
	chrome.runtime.onMessage.addListener(onMessage);
})();

function onClickBrowserAction(tab) {
	chrome.tabs.sendMessage(tab.id, {action: "toggle"});
}

function onMessage(req, sender, resCb) {
	json_request(req)
		.success(function(res) {
			resCb({
				success: res
			});
		})
		.failure(function(error) {
			resCb({
				failure: error
			});
		});

	// must return true to make async works
	return true;
}

