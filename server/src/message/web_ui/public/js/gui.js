function Gui() {
	var self = this;

	// event

	self.event_handler = {
		on_channel_changed: empty,
		on_send_chat: empty
	}

	// create channel dom wrapper list

	self.channel_dw_list = [];

	// create chat dom wrapper list

	self.chat_dw_list = [];

	// create editor ui

	self.editor_dw = new EditorDW(document.querySelector('.editor'));

	self.editor_dw.event_handler.on_click_send = function(editor_dw) {
		var author = editor_dw.get_author();
		var content = editor_dw.get_content();
		self.event_handler.on_send_chat(self, author, content);
		// clear
		editor_dw.clear_content();
	}
}

// channel list

Gui.prototype.create_channel = function(log) {
	var channel_dom = get_template('website');
	var channel_dw = new ChannelDW(channel_dom, log);

	channel_dw.set_title(log.item.title || '未知站点');
	channel_dw.set_url(log.item.url);
	channel_dw.set_icon(log.item.icon || log.item.url + '/favicon.ico');
	channel_dw.set_count(log.item.count || '0');

	// highlight if it's the only website

	if (this.channel_dw_list.length < 1) {
		channel_dw.highlight(true);
	}

	// add to list

	this.channel_dw_list.push(channel_dw);

	// add to ui

	id('website-list').appendChild(channel_dom);

	// wait for click

	var self = this;
	on_click(channel_dom, function() {
		self.channel_dw_list.forEach(function(dw) {
			dw.highlight(false);
		});
		channel_dw.highlight(true);
		
		// fire on_channel_changed
		var channel_url = channel_dw.binding.item.url;
		self.event_handler.on_channel_changed(self, channel_url);
	});
}

Gui.prototype.update_channel = function(log) {
	var target_id = log.target_id;
	var channel = log.item;

	// TODO
	console.log('[TODO] update_channel');
}

Gui.prototype.delete_channel = function(log) {
	var target_id = log.target_id;

	// TODO
	console.log('[TODO] delete_channel');
}

// chat list

Gui.prototype.create_chat = function(log) {
	var self = this;

	smart_scroll(first('.chat-panel'), first('.editor'), function() {
		var chat_dom = get_template('chat-item');
		var chat_dw = new ChatDW(chat_dom, log);

		update_chat_dw(chat_dw, log, self.editor_dw.get_author());

		// add to list

		self.chat_dw_list.push(chat_dw);

		// add to ui

		id('chat-list').appendChild(chat_dom);
	});
}

Gui.prototype.update_chat = function(log) {
	var self = this;
	var target_id = log.target_id;
	var target_uri = log.target_uri;

	// search

	var target_chat_dw = undefined;

	for (var i = 0, len = self.chat_dw_list.length; i < len; ++i) {
		var chat_dw = self.chat_dw_list[i];
		if (chat_dw.binding.uri === target_uri && 
			chat_dw.binding.id === target_id) {
			target_chat_dw = chat_dw;
			break;
		}
	}

	if (!target_chat_dw) {
		console.log('[update_chat] target not found');
		return;
	}

	// update

	update_chat_dw(target_chat_dw, log, self.editor_dw.get_author());
}

Gui.prototype.delete_chat = function(log) {
	var target_id = log.target_id;
	// TODO
	console.log('[TODO] delete_chat');
}

Gui.prototype.clear_chat_list = function() {
	var self = this;
	self.chat_dw_list.forEach(function(chat_dw) {
		chat_dw.dom.remove();
	});
	self.chat_dw_list = [];
}

function update_chat_dw(chat_dw, chat_log, current_name) {
	var log = chat_log;

	chat_dw.set_author(log.item.from.name);
	chat_dw.set_date_time(format_date_time(log.date_time));
	chat_dw.set_face_img(gravatar(log.item.from.name));
	chat_dw.set_content(content_to_dom(log.item.content));
	chat_dw.set_me(compare(log.item.from.name, current_name));

	function content_to_dom(content) {
		if (content.type === 'text') {
			return document.createTextNode(content.value);
		} else if (content.type === 'minido') {
			return minido_to_dom(content.value, {
				a: function(a, node) {},
				img: function(img, node) {}
			})
		}
	}

	function compare(a, b) {
		if (typeof a !== typeof b) return false;
		return a.toLowerCase() === b.toLowerCase();
	}
}