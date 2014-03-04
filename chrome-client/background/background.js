function Background() {
	this.server_event = new ServerEvent();
}

Background.prototype.start = function() {
	var self = this;
	self.message_list = [];

	chrome.browserAction.onClicked.addListener(on_click_browserAction);
	chrome.runtime.onMessage.addListener(on_message);
	self.server_event.on_receive = on_receive;
	self.server_event.start();

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
		if (req.action === 'receive') {
			resCb({
				success: {
					result: self.message_list
				}
			});
			return;
		}

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

	function on_receive(new_message_list) {
		self.message_list = self.message_list.concat(new_message_list);

		var text = JSON.stringify(new_message_list);
		window.localStorage.setItem('receive', text);

		// blink ui
		// chrome.tabs.query({
		// 	active: true,
		// 	currentWindow: true
		// }, function(tabs) {
		// 	if (!tabs || tabs.length < 1) return;
		// 	var tab = tabs[0];
		// 	chrome.tabs.sendMessage(tab.id, {action: 'blink'})
		// });
	}
}

/* code */

// override the default json_request_url
json_request_url = 'http://chat.miaodeli.com/action';

var bg = new Background();
bg.start();
