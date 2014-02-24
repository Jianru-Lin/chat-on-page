function UI() {
	var self = this;

	self.on_send = undefined;

	document.getElementById('send').addEventListener('click', function() {
		var author = document.getElementById('author').value;
		var content = document.getElementById('content').value;
		
		if (!author || !content) return;

		if (self.on_send) {
			self.on_send({
				author: author,
				content: content
			});
		}

		// clear
		document.getElementById('content').value = "";

		// focus on content
		document.getElementById('content').focus();
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

	document.getElementById('chat-history').appendChild(t);

	// auto scroll
	var de = document.documentElement;
	/*
	if (de.scrollTop + de.clientHeight === de.scrollHeight) {

	}
	*/
	window.scrollTo(0, de.scrollHeight);
}

function id(id_value, cb) {
	var e = document.getElementById(id_value);
	if (e && cb) {
		cb (e);
	}
	return e;
}

function all(selector, cb) {
	var list = document.querySelectorAll(selector);
	if (cb) {
		operate(list, cb);
	}
	return list;

	function operate(list, cb) {
		if (!list || list.length < 1) return;
		for (var i = 0, len = list.length; i < len; ++i) {
			cb(list[i]);
		}
	}	
}

function get_template(name) {
	var query = '.template .' + name;
	var e = document.querySelector(query);

	if (!e) return undefined;

	// copy element and return
	var new_e = e.cloneNode(true);
	return new_e;
}

function gravatar(email) {
	email = email || '';
	email = email.toLowerCase();
	var hash = md5(email);
	return 'http://www.gravatar.com/avatar/' + hash + '?s=50&d=identicon';
}