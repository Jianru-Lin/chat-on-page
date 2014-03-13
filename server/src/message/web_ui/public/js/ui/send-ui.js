/* SendUI */

function SendUI() {
	var self = this;
	self.on_send = undefined;

	// when user click send button
	on_click(id('send'), function() {
		send();
	});

	// support ctrl+enter shortcut
	on_keydown(document, function(e) {
		// ctrl+enter
		if (e.ctrlKey && e.keyCode === 13) {
			send();
		}
	});

	// auto sync email value
	auto_sync_email();

	function auto_sync_email() {
		load_email();

		on_keyup(id('author'), function() {
			save_email();
		});

		on_storage(window, function(e) {
			if (e.key === 'email') {
				load_email();			
			}
		});

		function save_email() {
			var email = id('author').value;
			window.localStorage.setItem('email', email);
		}

		function load_email() {
			var email = window.localStorage.getItem('email');
			id('author').value = email;
		}
	}

	function send() {
		var author = id('author').value;
		var content = id('content').value;

		if (!author || !content) return;

		if (self.on_send) {
			self.on_send(author, content);
		}

		// clear
		id('content').value = "";

		// focus on content
		id('content').focus();
	}
}
