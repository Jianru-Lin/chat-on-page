/* ChatListUI */

function ChatListUI() {
	this.chat_ui_list = [];
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
		var chat_ui = new ChatUI();
		chat_ui.update(chat_item);

		// append
		chat_list.appendChild(chat_ui.dom);
	});

	// smart scroll end
	if (need_scroll) {
		var e = document.querySelector('.send-editor');
		if (e.scrollIntoViewIfNeeded) e.scrollIntoViewIfNeeded();
		else if (e.scrollIntoView) e.scrollIntoView();
	}
}
