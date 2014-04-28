var gui = new Gui();
var channel_syncer = new Syncer('mdl://channel');
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

	var target = 'mdl://chat/' + encodeURIComponent(channel_url);
	chat_syncer = new Syncer(target);
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

function on_channel_changed(gui, channel_url) {
	g.current_channel_url = channel_url;

	chat_syncer.stop();

	gui.clear_chat_list();

	var target = 'mdl://chat/' + encodeURIComponent(channel_url);
	chat_syncer = new Syncer(target);
	chat_syncer.event_handler = {
		on_success: on_sync_chat_success,
		on_failure: on_sync_chat_failure
	};
	chat_syncer.id = 'head_id';
	chat_syncer.start();
}

// on send chat

function on_send_chat(gui, author, content) {
	get_current_location(function(url, title) {
		var opt = {
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

		var create = new_create(g.current_channel_url, opt);
		create.start();

	});
}

// sync success

function on_sync_chat_success(chat_syncer, res) {
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

function on_sync_chat_failure(chat_syncer) {
	console.log('sync chat failure');
}

function on_sync_channel_success(channel_syncer, res) {
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

function on_sync_channel_failure(channel_syncer) {
	console.log('sync channel failure');
}
