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
		var e = document.querySelector('.send-editor');
		if (e.scrollIntoViewIfNeeded) e.scrollIntoViewIfNeeded();
		else if (e.scrollIntoView) e.scrollIntoView();
	}

	function convert_to_dom(chat_item) {
		var t = get_template('chat-item');
		t.querySelector('.author').textContent = chat_item.from.name;
		t.querySelector('.date-time').textContent = format_date_time(chat_item.date_time);
		t.querySelector('.content').textContent = chat_item.content.value;
		t.querySelector('.face > img').setAttribute('src', gravatar(chat_item.from.name));

		if (chat_item.is_me) {
			t.classList.add('me');
		}

		return t;

		function format_date_time(date_time_text) {
			var d = new Date(date_time_text);
			var year = d.getFullYear();
			var month = d.getMonth() + 1;
			var date = d.getDate();
			var hour = d.getHours();
			var min = d.getMinutes();
			var sec = d.getSeconds();

			// compare to current
			var current = new Date();
			var current_year = current.getFullYear();
			var current_month = current.getMonth() + 1;
			var current_date = current.getDate();

			if (year !== current_year) {
				return long_format();
			} else if (month !== current_month || date !== current_date) {
				return short_format();
			} else {
				return mini_format();
			}

			function fill(t) {
				return t > 9 ? t.toString() : '0' + t;
			}

			function long_format() {
				var text = year + '-' + fill(month) + '-' + fill(date) + ' ' + fill(hour) + ':' + fill(min) + ':' + fill(sec);
				return text;
			}

			function short_format() {
				var text = fill(month) + '-' + fill(date) + ' ' + fill(hour) + ':' + fill(min) + ':' + fill(sec);
				return text;
			}

			function mini_format() {
				var text = fill(hour) + ':' + fill(min) + ':' + fill(sec);
				return text;
			}
 		}
	}
}
