/* UI */

function UI() {
	var self = this;

	// ui parts
	self.audio_manager = new AudioManager();
	self.send_ui = new SendUI();
	self.chat_list_ui = new ChatListUI();
	self.website_list_ui = new WebsiteListUI();

	// chat cache
	self.chat_list = [];

	// event callback
	self.on_send = undefined;

	get_current_location(done);

	function done(url, title) {
		// init website list
		var current_website = {
			title: '当前站点',
			url: get_protocol_host_port(url)
		};

		self.website_list_ui.add(current_website);

		// user selected a different website
		self.website_list_ui.on_current_changed = on_current_website_changed;

		// on send
		self.send_ui.on_send = on_send;

		function on_current_website_changed() {
			var current_website = self.website_list_ui.get_current();

			// clear current chat list
			self.chat_list_ui.clear();

			// construct new list
			var current_website_chat_list = self.chat_list.filter(function(chat_item) {
				return chat_item.to.website.url === current_website.url;
			});

			// show new chat list
			self.chat_list_ui.add(current_website_chat_list);
		}

		function on_send(email, text) {
			get_current_location(done);

			function done(url, title) {
				var message = {
					type: 'chat',
					from: {
						name: email,
						page: {
							url: url,
							title: title
						}
					},
					to: {
						website: {
							url: self.website_list_ui.get_current().obj.url
						}
					},
					content: {
						type: 'text',
						value: text
					}
				};
				if (self.on_send) {
					self.on_send(message);
				}				
			}
		}
	}
}

UI.prototype.on = function(event, cb) {
	if (event === 'send') {
		this.on_send = cb;
	}
}

UI.prototype.show = function(message_list) {
	var self = this;
	if (!message_list) return;

	var notified = false;

	message_list.forEach(function(message) {
		if (message.type === 'chat') {
			// chat
			chat_message_handler(message);

			// count
			count(message);
		} else if (message.type === 'website') {
			// website
			website_message_handler(message);
		} else {
			// ignore unknown message
		}
	});

	
	function chat_message_handler(message) {
		var email = window.localStorage.getItem('email');

		// append to chat_list
		self.chat_list.push(message);

		// get current website
		var current_website = self.website_list_ui.get_current();

		// show if needed
		if (message.to.website.url === current_website.obj.url) {
			message.is_me = message.from.name === email;
			self.chat_list_ui.add(message);
		}

		// add website if needed
		var new_website = {
			url: message.to.website.url
		};
		self.website_list_ui.add(new_website);

		// play notify audio if needed
		if (!notified && !message.is_me) {
			self.audio_manager.play_notify();
			notified = true;
		}
	}

	function website_message_handler(message) {
		self.website_list_ui.update(message);
	}

	function count(chat) {
		var url = chat.to.website.url;
		var website_ui = self.website_list_ui.get_by_url(url);
		if (!website_ui) return;
		var old_count = website_ui.obj.count || 0;
		website_ui.update({
			count: old_count + 1
		});
	}
}

function get_protocol_host_port(url) {
	var match = /^((http|https):\/\/[^\/]+)(\/|$)/i.exec(url);
	if (!match) return undefined;
	else return match[1];
}

// # cb(url, title)
function get_current_location(cb) {
	var url, title;

	if (typeof chrome !== 'undefined' && chrome.extension) {
		chrome.extension.sendMessage({action: 'query'}, function(res) {
			var info = res.success;
			cb(info.url, info.title);
		});
	} else {
		if (window.parent != window) {
			url = document.referrer;
			title = undefined;
		} else {
			url = location.href;
			title = document.title;
		}
		cb(url, title);
	}
}
