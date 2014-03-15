/* AudioManager */

function AudioManager() {

}

AudioManager.prototype.play_notify = function() {
	if (!is_chrome_extension()) {
		id('audio-notify').play();
		return;
	}

	var req = {
		action: 'notify'
	};

	chrome.runtime.sendMessage(req, function(res) {
		if (res.success) {
			id('audio-notify').play();
		}
	});
}
