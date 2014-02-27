function Background() {
	this.server_event = new ServerEvent();
}

Background.prototype.start = function() {
	var self = this;

	chrome.browserAction.onClicked.addListener(on_click_browserAction);
	chrome.runtime.onMessage.addListener(on_message);
	self.server_event.on_receive = on_receive;
	self.server_event.start();

	function on_click_browserAction(tab) {
		chrome.tabs.sendMessage(tab.id, {action: 'toggle'});
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

	function on_receive(chat_item_list) {
		var text = JSON.stringify(chat_item_list);
		window.localStorage.setItem('receive', text);

		// blink ui
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function(tabs) {
			if (!tabs || tabs.length < 1) return;
			var tab = tabs[0];
			chrome.tabs.sendMessage(tab.id, {action: 'blink'})
		});
	}
}

/* code */

// override the default json_request_url
json_request_url = 'http://chat.miaodeli.com/action';

var bg = new Background();
bg.start();
