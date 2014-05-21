// email not set ?
var config = get_local_obj('config')
if (!config || !config.author) {
	redirect_to('/')
}

var gui = new Gui();
var chat_syncer = undefined;
var g = {
	chat_log_list: []
};

// 同步该站点下的聊天记录

var chat_uri = 'http://data.miaodeli.com/channel' + get_current_channel_id();

detect(chat_uri, function(result) {
	var start_seq = 0
	if (result.tail_seq > 29) {
		start_seq = result.tail_seq - 29
	}

	chat_syncer = sync(chat_uri, start_seq, 30, on_sync_chat_success, on_sync_chat_failure);
	chat_syncer.start();
})


// set gui event handler

gui.event_handler = {
	on_send_chat: on_send_chat,
	on_delete_chat: on_delete_chat
};

// on send chat

function on_send_chat(gui, author, content) {
	var uri = 'http://data.miaodeli.com/channel' + get_current_channel_id();

	var item = {
		from: {
			author: author
		},
		to: {
		},
		content: content
	};

	var message = {
		action: 'create',
		uri: uri,
		item: item,
		item_type: 'chat'
	};

	var requester = new_requester(message);
	requester.start();
}

// on delete chat

function on_delete_chat(gui, log) {
	if (!confirm('您确定要删除这一聊天项？')) return;

	var message = {
		action: 'delete',
		uri: log.uri,
		target_id: log.id
	}

	console.log(message);

	var requester = new_requester(message);
	requester.start();
}

// sync success

function on_sync_chat_success(syncer, res) {
	//console.log('sync chat success');

	var log_list = res.log_list;

	g.chat_log_list = g.chat_log_list.concat(log_list);

	// update chat list dom

	log_list.forEach(function(log) {
		switch (log.action) {
			case 'create':
				gui.create_chat(log);
				break;
			case 'update':
				gui.update_chat(log);
				break;
			case 'delete':
				gui.delete_chat(log);
				break;
		}
	});
}

function on_sync_chat_failure(syncer) {
	console.log('sync chat failure');
}

function get_current_channel_id(v) {
	var p = v || document.location.pathname;
	var match = /^\/channel($|(\/[^$]*))/.exec(p);
	return match[1];
}