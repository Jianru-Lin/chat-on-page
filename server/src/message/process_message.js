exports.process_message = process_message;

var action_map = {
	'receive': receive,
	'send': send
}

var data = {
	chat_item_list: [],
	next_id: 0
}

function process_message(message) {
	var handler = action_map[message.action];
	if (handler) {
		handler(message);
	} else {
		message.error = {
			code: 1,
			text: 'unknown action'				
		}
	}
}

function receive(message) {
	if (!safe_check(message)) {
		message.error = {
			code: 1,
			text: 'invalid message'
		};
		return;
	}

	var last_id = message.args.last_id;
	
	if (last_id === undefined) {
		last_id = -1;
	}

	var chat_item_list = [];
	for (var i = last_id + 1, len = data.chat_item_list.length; i < len; ++i) {
		chat_item_list.push(data.chat_item_list[i]);
	}

	message.result = chat_item_list;

	function safe_check(message) {
		// TODO
		return true;
	}
}

function send(message) {
	var chat_item = safe_copy(message.args.chat_item);
	if (!format_check(chat_item)) {
		message.error = {
			code: 1,
			text: 'wrong format'
		};
		return;
	}

	chat_item.id = data.next_id++;
	data.chat_item_list.push(chat_item);

	message.result = {};

	function safe_copy(chat_item) {
		// TODO
		return chat_item;
	}

	function format_check(chat_item) {
		// TODO
		return true;
	}
}