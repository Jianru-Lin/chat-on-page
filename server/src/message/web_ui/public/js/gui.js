function Gui() {
	var self = this;

	// event

	self.event_handler = {
		on_send_chat: empty
	}

	// create chat dom wrapper list

	self.chat_dw_list = [];

	// create editor ui

	self.editor_dw = new EditorDW(document.querySelector('.editor'));

	self.editor_dw.event_handler.on_click_send = function(editor_dw) {
		var author = editor_dw.get_author();
		var content = editor_dw.get_content();

		if (!author || !content) return;

		self.event_handler.on_send_chat(self, author, content);
		// clear
		editor_dw.clear_content();
	}
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

on_click(document.body, function(e) {
	var etarget = e.srcElement || e.target;
	if (etarget.nodeName === 'IMG') {
		toggle_class(etarget, 'fullheight');
		if (!has_class(etarget, 'fullheight')) {
			bring_into_view(etarget);
		}
	}
});
