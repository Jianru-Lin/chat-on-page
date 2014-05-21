function Gui() {
	var self = this;

	// event

	self.event_handler = {
		on_send_chat: empty,
		on_delete_chat: empty
	}

	// create chat dom wrapper list

	self.chat_dw_list = [];

	// create editor ui

	self.editor_dw = new EditorDW(document.querySelector('.editor'));

	self.editor_dw.event_handler.on_click_send = function(editor_dw) {
		var author = get_author();
		var content = editor_dw.get_content();

		if (!author || !content.value) return;

		self.event_handler.on_send_chat(self, author, content);
		// clear
		editor_dw.clear_content();
	}
}

Gui.prototype.enable_load_history = function() {
	remove_class(first('.load-history'), 'none')
}

// chat list

Gui.prototype.create_chat = function(log) {
	var self = this;

	smart_scroll(first('.chat-panel'), first('.editor'), function() {
		if (log.item_type === 'override') {
			override();
		}
		else {
			create();
		}
	});

	function create() {
		var chat_dom = get_template('chat-item');
		var chat_dw = new ChatDW(chat_dom, log);

		update_chat_dw(chat_dw, log, get_author());

		// add to list

		self.chat_dw_list.push(chat_dw);

		// add to ui

		id('chat-list').appendChild(chat_dom);

		// click delete ?

		on_click(chat_dom.querySelector('a.delete'), function(e) {
			self.event_handler.on_delete_chat(self, log);
		});
	}

	function override() {
		var target_id = log.item.target_id;
		var target_uri = log.item.target_uri;

		// search

		var target_chat_dw = find_dw(self.chat_dw_list, target_uri, target_id);
		if (!target_chat_dw) return;

		update_chat_dw(target_chat_dw, log, get_author());
	}
}

Gui.prototype.update_chat = function(log) {
	var self = this;
	var target_id = log.target_id;
	var target_uri = log.uri;

	// search

	var target_chat_dw = find_dw(self.chat_dw_list, target_uri, target_id);

	if (!target_chat_dw) return;

	// update

	update_chat_dw(target_chat_dw, log, get_author());
}

Gui.prototype.delete_chat = function(log) {
	var target_id = log.target_id;
	var target_uri = log.uri;

	// search

	var target_chat_dw = find_dw(this.chat_dw_list, target_uri, target_id);

	if (!target_chat_dw) return;

	// delete

	var dom = target_chat_dw.dom;

	if (dom.parentNode) {
		dom.parentNode.removeChild(dom);
	}

	this.chat_dw_list = this.chat_dw_list.filter(function(item) {
		return item !== target_chat_dw
	});
}

Gui.prototype.clear_chat_list = function() {
	var self = this;
	self.chat_dw_list.forEach(function(chat_dw) {
		chat_dw.dom.remove();
	});
	self.chat_dw_list = [];
}

function update_chat_dw(chat_dw, chat_log, current_author) {
	var log = chat_log;
	var item;

	if (log.item_type === 'chat') {
		item = log.item;
	}
	else if (log.item_type === 'override') {
		item = log.item.item;
	}
	else {
		return;
	}

	var from_author = item.from.author;

	chat_dw.set_author(from_author);
	chat_dw.set_date_time(format_date_time(log.date_time));
	chat_dw.set_content(content_to_dom(item.content));
	chat_dw.set_me(compare(from_author.email, current_author.email));

	function content_to_dom(content) {
		if (content.type === 'text') {
			return document.createTextNode(content.value);
		}
		else if (content.type === 'code') {
			return render_by_ace(content);
		} 
		else if (content.type === 'minido') {
			return minido_to_dom(content.value)
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

function find_dw(dw_list, target_uri, target_id) {
	var target_dw;

	for (var i = 0, len = dw_list.length; i < len; ++i) {
		var dw = dw_list[i];
		if (dw.binding.uri === target_uri && dw.binding.id === target_id) {
			target_dw = dw;
			break;
		}
	}

	return target_dw;
}

function get_author() {
	return get_local_obj('config').author
}