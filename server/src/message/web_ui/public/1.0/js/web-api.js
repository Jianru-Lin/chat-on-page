function receive(last_id) {
	return request({action: 'receive', args: {last_id: last_id}});
}

function send(chat_item) {
	return request({action: 'send', args: {chat_item: chat_item}});
}