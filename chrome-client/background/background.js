function Background() {
}

Background.prototype.start = function() {
	var self = this;

	chrome.browserAction.onClicked.addListener(on_click_browserAction);
	chrome.runtime.onMessage.addListener(on_message);

	function on_click_browserAction(tab) {
		console.log(tab.title);
		console.log(tab.url);

		if (/^chrome/i.test(tab.url) || /https:\/\/chrome.google.com\/webstore/i.test(tab.url)) {
			chrome.tabs.create({
				url: 'http://www.miaodeli.com/help/chat',
				active: true
			});
			return;
		}

		chrome.tabs.sendMessage(tab.id, {action: 'toggle'}, function(res) {
			if (!res) {
				// inject js and css
				chrome.tabs.insertCSS(tab.id, {
					file: 'content/inject.css',
					allFrames: false,
					runAt: 'document_end'
				}, function() {
					// nothing to do
				});

				chrome.tabs.executeScript(tab.id, {
					file: 'content/inject.js',
					allFrames: false,
					runAt: 'document_end'
				}, function() {
					// toggle again
					setTimeout(function() {
						chrome.tabs.sendMessage(tab.id, {action: 'toggle'});
					}, 0);
				});

			}
		});
	}

	function on_message(req, sender, resCb) {
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
}

/* code */

// override the default json_request_url
json_request_url = 'http://localhost/message';

var bg = new Background();
bg.start();
