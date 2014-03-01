/* ChatListUI */

function ChatListUI() {

}

ChatListUI.prototype.clear = function() {
	id('chat-list').textContent = '';
}

ChatListUI.prototype.add = function(chat_item_list) {
	var self = this;
	if (!chat_item_list) return;

	// smart scroll start
	var need_scroll = reached_bottom(document.querySelector('.chat-panel'));

	// construct dom element and append
	var chat_list = id('chat-list');
	chat_item_list.forEach(function(chat_item) {
		chat_list.appendChild(convert_to_dom(chat_item));
	});

	// smart scroll end
	if (need_scroll) {
		document.querySelector('.send-editor').scrollIntoViewIfNeeded();
	}

	function convert_to_dom(chat_item) {
		var t = get_template('chat-item');
		t.querySelector('.author').textContent = chat_item.author;
		t.querySelector('.content').textContent = chat_item.content;
		t.querySelector('.face > img').setAttribute('src', gravatar(chat_item.author));
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

	// if this is the only website, make it current
	if (self.website_list.length === 1) {
		website_dom.classList.add('current');
		self.current = website;
	}

	function convert_to_dom(website) {
		var t = get_template('website');
		t.querySelector('.website-title').textContent = website.title;
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
			self.on_send({
				author: author,
				content: content
			});
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

	// init website list
	var current_website = {
		title: '当前站点',
		url: get_protocol_host_port(get_current_location())
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
			return get_protocol_host_port(chat_item.url_to) === current_website.url;
		});

		// show new chat list
		self.chat_list_ui.add(current_website_chat_list);
	}

	function on_send(chat_item) {
		chat_item.url_from = get_current_location();
		chat_item.url_to = self.website_list_ui.get_current().url;
		if (self.on_send) {
			self.on_send(chat_item);
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

	var chat_item_list = message_list;

	// append to chat_list
	self.chat_list = self.chat_list.concat(chat_item_list);

	// get current website
	var current_website = self.website_list_ui.get_current();

	// construct new list
	var sub_list = chat_item_list.filter(function(chat_item) {
		return get_protocol_host_port(chat_item.url_to) === current_website.url;
	});

	// show new chat list
	self.chat_list_ui.add(sub_list);

	// update website list
	chat_item_list.forEach(function(chat_item) {
		self.website_list_ui.add({
			url: get_protocol_host_port(chat_item.url_to)
		});
	});
}

function get_protocol_host_port(url) {
	var match = /^((http|https):\/\/[^\/]+)(\/|$)/i.exec(url);
	if (!match) return undefined;
	else return match[1];
}

function get_current_location() {
	if (window.parent != window) {
		return document.referrer;
	} else {
		return location.href;
	}
}