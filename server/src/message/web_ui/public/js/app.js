var gui = new Gui();
var channel_syncer = new Syncer('channel');
var chat_syncer = new Syncer('chat');

var g = {
	chat_log_list: []
};

get_current_location(function(url, title) {
	var channel_url  = get_protocol_host_port(url);

	// 把当前站点添加到频道列表中

	gui.create_channel({
		item: {
			url: channel_url,
			title: title
		}
	});

	// 同步该站点下的聊天记录

	chat_syncer.event_handler = {
		on_success: on_sync_chat_success,
		on_failure: on_sync_chat_failure
	};
	chat_syncer.id = 'head_id';
	chat_syncer.start();

	// sync channel list

	channel_syncer.event_handler = {
		on_success: on_sync_channel_success,
		on_failure: on_sync_channel_failure
	};
	channel_syncer.id = 'head_id';
	channel_syncer.start();
});

// set gui event handler

gui.event_handler = {
	on_channel_changed: on_channel_changed,
	on_send_chat: on_send_chat
};

// on channel changed

function on_channel_changed(channel_url) {
	// chat_syncer.set_channel_url(channel_url);
}

// on send chat

function on_send_chat(author, content) {
	get_current_location(function(url, title) {
		var channel_url = get_protocol_host_port(url);

		var opt = {
			from: {
				name: author,
				page: {
					url: url,
					title: title
				}
			},
			to: {
				channel_url: channel_url
			},
			content: content
		};

		var create = new_create('chat', opt);
		create.start();

	});
}

// sync success

function on_sync_chat_success(chat_syncer, res) {
	console.log('sync chat success');

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

function on_sync_chat_failure(chat_syncer) {
	console.log('sync chat failure');
}

function on_sync_channel_success(channel_syncer, res) {
	console.log('sync channel success');

	var log_list = res.log_list;

	log_list.forEach(function(log) {
		switch (log.action) {
			case 'create':
				var channel = log.item;
				gui.create_channel(channel);
				break;
			case 'update':
				var target_id = log.target_id;
				var channel = log.item;
				gui.update_channel(target_id, channel)
				break;
			case 'delete':
				var target_id = log.target_id;
				gui.delete_channel(target_id);
				break;
		}
	});
}

function on_sync_channel_failure(channel_syncer) {
	console.log('sync channel failure');
}