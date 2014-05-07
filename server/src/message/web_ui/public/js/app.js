var gui = new Gui();
var channel_syncer = undefined;
var chat_syncer = undefined;
var g = {
	chat_log_list: [],
	current_channel_url: undefined
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

	g.current_channel_url = channel_url;

	// 同步该站点下的聊天记录

	var chat_uri = 'http://data.miaodeli.com/chat/' + encodeURIComponent(channel_url);
	chat_syncer = sync(chat_uri, 0, 30, on_sync_chat_success, on_sync_chat_failure);
	chat_syncer.start();

	// sync channel list

	var channel_uri = 'http://data.miaodeli.com/channel/website';
	channel_syncer = sync(channel_uri, 0, 30, on_sync_channel_success, on_sync_channel_failure);
	channel_syncer.start();

});

// set gui event handler

gui.event_handler = {
	on_channel_changed: on_channel_changed,
	on_send_chat: on_send_chat
};

// on channel changed

function on_channel_changed(gui, channel_url) {
	g.current_channel_url = channel_url;

	gui.clear_chat_list();

	if (chat_syncer) {
		chat_syncer.stop()
		chat_syncer = undefined;
	}

	var chat_uri = 'http://data.miaodeli.com/chat/' + encodeURIComponent(channel_url);
	chat_syncer = sync(chat_uri, 0, 30, on_sync_chat_success, on_sync_chat_failure);
	chat_syncer.start();
}

// on send chat

function on_send_chat(gui, author, content) {
	get_current_location(function(url, title) {
		var uri = 'http://data.miaodeli.com/chat/' + encodeURIComponent(g.current_channel_url);

		var item = {
			from: {
				name: author,
				page: {
					url: url,
					title: title
				}
			},
			to: {
				channel_url: g.current_channel_url
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

	});
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

function on_sync_channel_success(syncer, res) {
	//console.log('sync channel success');

	var log_list = res.log_list;

	log_list.forEach(function(log) {
		switch (log.action) {
			case 'create':
				gui.create_channel(log);
				break;
			case 'update':
				gui.update_channel(log);
				break;
			case 'delete':
				gui.delete_channel(log);
				break;
		}
	});
}

function on_sync_channel_failure(syncer) {
	console.log('sync channel failure');
}
