function UI() {
	var self = this;
	self.on_send = undefined;
	self.init();
}

UI.prototype.init = function() {
	var self = this;

	self.load_email();

	on_click(id('send'), function() {
		self.send();
	});

	on_keydown(document, function(e) {
		// ctrl+enter
		if (e.ctrlKey && e.keyCode === 13) {
			self.send();
		}
	});

	on_keyup(id('author'), function() {
		self.save_email();
	});

	on_storage(window, function(e) {
		if (e.key === 'email') {
			self.load_email();			
		}
	});
}

UI.prototype.show_chat_item_list = function(chat_item_list) {
	var self = this;

	if (!chat_item_list) return;
	chat_item_list.forEach(function(chat_item) {
		self.show_chat_item(chat_item);
	});
}

UI.prototype.show_chat_item = function(chat_item) {
	var t = get_template('chat-item');
	t.querySelector('.author').textContent = chat_item.author;
	t.querySelector('.content').textContent = chat_item.content;
	t.querySelector('.face > img').setAttribute('src', gravatar(chat_item.author));

	var window_content = document.querySelector('.window-content');
	var need_scroll = reached_bottom(window_content);

	// add element
	id('chat-history').appendChild(t);

	// auto scroll
	/*
	if (de.scrollTop + de.clientHeight === de.scrollHeight) {

	}
	*/
	if (need_scroll) {
		//window.scrollTo(0, document.documentElement.scrollHeight);
		var send_editor = document.querySelector('.send-editor');
		if (send_editor) {
			send_editor.scrollIntoView();
		}
	}
}

UI.prototype.send = function() {
	var self = this;

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

UI.prototype.save_email = function() {
	var email = id('author').value;
	window.localStorage.setItem('email', email);
}

UI.prototype.load_email = function() {
	var email = window.localStorage.getItem('email');
	id('author').value = email;
}