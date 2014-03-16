/* ChatListUI */

function ChatListUI() {
	this.chat_ui_list = [];
}

ChatListUI.prototype.clear = function() {
	var self = this;
	id('chat-list').textContent = '';
	self.chat_ui_list = [];
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
		var chat_ui = new ChatUI();

		var options = {};

		if (self.chat_ui_list.length > 0) {
			var last_chat_ui = self.chat_ui_list[self.chat_ui_list.length-1];
			if (same_i(last_chat_ui.obj.from.name, chat_item.from.name)) {
				options.additional = true;
			}
		}

		chat_ui.update(chat_item, options);

		// append
		self.chat_ui_list.push(chat_ui);
		chat_list.appendChild(chat_ui.dom);
	});

	// smart scroll end
	if (need_scroll) {
		var e = document.querySelector('.send-editor');
		if (e.scrollIntoViewIfNeeded) e.scrollIntoViewIfNeeded();
		else if (e.scrollIntoView) e.scrollIntoView();
	}

	function same_i(text_a, text_b) {
		if (typeof text_a !== typeof text_b) return false;
		if (typeof text_a === 'string') {
			text_a = text_a.toLowerCase();
			text_b = text_b.toLowerCase();
			return text_a === text_b;
		} else {
			return true;
		}
	}
}
