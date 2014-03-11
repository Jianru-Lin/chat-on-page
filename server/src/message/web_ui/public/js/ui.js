/* ChatListUI */

function ChatListUI() {
}

ChatListUI.prototype.clear = function() {
	id('chat-list').textContent = '';
}

ChatListUI.prototype.add = function(chat_item_list) {
	var self = this;
	if (!chat_item_list) return;
	if (!Array.isArray(chat_item_list)) chat_item_list = [chat_item_list];

	// smart scroll start
	var need_scroll = reached_bottom(document.querySelector('.chat-panel'));

	// construct dom element and append
	var chat_list = id('chat-list');
	chat_item_list.forEach(function(chat_item) {
		// append
		chat_list.appendChild(convert_to_dom(chat_item));
	});

	// smart scroll end
	if (need_scroll) {
		document.querySelector('.send-editor').scrollIntoViewIfNeeded();
	}

	function convert_to_dom(chat_item) {
		var t = get_template('chat-item');
		t.querySelector('.author').textContent = chat_item.from.name;
		t.querySelector('.content').textContent = chat_item.content.value;
		t.querySelector('.face > img').setAttribute('src', gravatar(chat_item.from.name));
		return t;
	}
}

/* WebsiteListUI */

function WebsiteListUI() {
	var self = this;
	self.current = undefined;
	self.on_current_changed = undefined;
	self.website_list = [];
	self.website_list_map = {};
}

WebsiteListUI.prototype.add = function(website) {
	var self = this;

	if (!website) return;
	website.title = website.title || '未知站点';

	// ignore if existed
	if (self.website_list_map[website.url]) return;

	// add new website
	self.website_list.push(website);
	self.website_list_map[website.url] = website;

	// add to ui
	var website_dom = convert_to_dom(website);
	website_dom.addEventListener('click', on_click_website);
	id('website-list').appendChild(website_dom);

	// remember object and dom relation
	website._dom = website_dom;

	// if this is the only website, make it current
	if (self.website_list.length === 1) {
		website_dom.classList.add('current');
		self.current = website;
	}

	function convert_to_dom(website) {
		var t = get_template('website');

		// favicon
		var website_favicon = t.querySelector('.website-favicon');
		website_favicon.setAttribute('src', website.url + '/favicon.ico');
		website_favicon.onerror = function(e) {
			var favicon = e.target;
			favicon.onerror = null;
			//favicon.remove();
		}

		// title
		var website_title = t.querySelector('.website-title');
		website_title.textContent = website.title;
		website_title.setAttribute('title', website.title);

		// url
		t.querySelector('.website-url').textContent = website.url;

		return t;
	}

	function on_click_website() {
		// click current website is nothing
		if (website === self.current) return;

		self.current = website;

		// cancel old current
		id('website-list').querySelector('.current').classList.remove('current');

		// new current
		website_dom.classList.add('current');

		// emit event
		if (self.on_current_changed) {
			self.on_current_changed();
		}
	}
}

WebsiteListUI.prototype.get_current = function() {
	return this.current;
}

WebsiteListUI.prototype.update = function(website_new) {
	var self = this;

	var website = self.website_list_map[website_new.url]
	
	// u can't udpate a website which not exists yet
	if (!website) return;

	// dont't modify current website
	if (website._dom.classList.contains('current')) return;

	website._dom.querySelector('.website-title').textContent = website_new.title;
	website._dom.querySelector('.website-title').setAttribute('title', website_new.title);
	copy_obj(website_new, website);
}


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

/* UI */

function UI() {
	var self = this;
	self.send_ui = new SendUI();
	self.chat_list_ui = new ChatListUI();
	self.website_list_ui = new WebsiteListUI();
	self.chat_list = [];
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
							url: self.website_list_ui.get_current().url
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

	message_list.forEach(function(message) {
		if (message.type === 'chat') {
			// chat
			chat_message_handler(message);
		} else if (message.type === 'website') {
			// website
			website_message_handler(message);
		} else {
			// ignore unknown message
		}
	});

	
	function chat_message_handler(message) {
		// append to chat_list
		self.chat_list.push(message);

		// get current website
		var current_website = self.website_list_ui.get_current();

		// show if needed
		if (message.to.website.url === current_website.url) {
			self.chat_list_ui.add(message);
		}

		// add website if needed
		var new_website = {
			url: message.to.website.url
		};
		self.website_list_ui.add(new_website);
	}

	function website_message_handler(message) {
		self.website_list_ui.update(message);
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

	if (chrome.extension) {
		chrome.extension.sendMessage({action: 'query'}, function(res) {
			var info = res.success;
			cb(info.url, info.title);
		});
	} else {
		if (window.parent != window) {
			url = document.referrer;
		} else {
			url = location.href;
		}
		title = undefined;
		cb(url, title);
	}
}
