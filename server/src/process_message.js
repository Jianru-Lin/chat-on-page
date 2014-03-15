// [exports]

exports.process_message = process_message;

// [dependencies]

var fs = require('fs');
var path = require('path');
var url = require('url');
var WebsiteDetector = require('./lib/website-detector.js');
var KeyList = require('./lib/key-list.js');
var IdList = require('./lib/id-list.js');

// [global var]

var website_detector = new WebsiteDetector();

var handler_list = [on_chat, on_query_chat, on_query_website];

var data = {
	chat_list: new IdList(),
	website_list: new IdList(),
	unknown_website_list: new KeyList(),
	website_exist_map: {}
};

load_data();
active_website_detector();

// [function]

function process_message(req) {
	var input_message_list = req.message_list;

	if (!input_message_list) {
		return {
			message_list: []
		};
	}

	var res = {
		message_list: []
	};

	handler_list.forEach(function(handler) {
		handler(req.message_list, res.message_list);
	});

	return res;
}

function on_chat(message_list_in, message_list_out) {
	var website_list = data.website_list;
	var unknown_website_list = data.unknown_website_list;
	var chat_list = data.chat_list;
	var website_exist_map = data.website_exist_map;

	message_list_in.forEach(function(message) {
		if (message.type !== 'chat') return;

		var message = safe_copy(message);
		
		// ignore invalid message
		if (!format_check(message)) return;

		// add date_time
		message.date_time = (new Date()).toISOString();

		// add to unknown_website_list if needed
		var website_url = get_website_url(message.from.page.url);

		if (!website_exist_map[website_url] && !unknown_website_list.get(website_url)) {
			var website = {
				url: website_url
			};
			unknown_website_list.push(website.url, website);
			console.log('add unknown website: ' + website.url);

			// active it
			active_website_detector();
		}

		// add to chat list
		chat_list.push(message);
	});

	save_data();

	function safe_copy(message) {
		// TODO
		return message;
	}

	function format_check(message) {
		// TODO
		return true;
	}

	function get_website_url(page_url) {
		var url_parsed = url.parse(page_url);

		var website_url;
		if (url_parsed.port !== null && url_parsed.port !== undefined) {
			website_url = url_parsed.protocol + '//' + url_parsed.hostname + ':' + url_parsed.port;
		} else {
			website_url = url_parsed.protocol + '//' + url_parsed.hostname;
		}

		return website_url;
	}
}

function on_query_chat(message_list_in, message_list_out) {
	var chat_list = data.chat_list;

	message_list_in.forEach(function(message) {
		if (message.type !== 'query_chat') return;

		var last_id = message.last_id === undefined ? -1 : message.last_id;

		for (var id = last_id + 1, len = chat_list.length(); id < len; ++id) {
			message_list_out.push(chat_list.get(id));
		}
	});
}

function on_query_website(message_list_in, message_list_out) {
	var website_list = data.website_list;

	message_list_in.forEach(function(message) {
		if (message.type !== 'query_website') return;

		var last_id = message.last_id === undefined ? -1 : message.last_id;

		for (var id = last_id + 1, len = website_list.length(); id < len; ++id) {
			message_list_out.push(website_list.get(id));
		}
	});

}

function active_website_detector() {
	var unknown_website_list = data.unknown_website_list;
	var website_list = data.website_list;
	var website_exist_map = data.website_exist_map;

	if (unknown_website_list.length() < 1) return;
	if (website_detector.is_running) return;

	website_detector.url = unknown_website_list.indexOf(0).url; console.log('detect url: ' + website_detector.url);
	website_detector.on_finish = on_detect_finish;
	website_detector.start();

	function on_detect_finish(error, _title) {
		var title = error ? '获取站点名称失败' : _title; console.log(title);

		// remove from unknown website
		var website = unknown_website_list.remove(website_detector.url);

		// add to website list
		website.type = 'website';
		website.title = title;
		website_list.push(website);

		// add to website exist map
		website_exist_map[website.url] = true;

		// active again if there is more unknown website
		setTimeout(active_website_detector, 0);
	}
}

function load_data() {
	var filename = path.resolve(__dirname, 'data/data.json');
	if (!fs.existsSync(filename)) return;
	var content = fs.readFileSync(filename, {encoding: 'utf8'});
	var content = JSON.parse(content);

	data.chat_list.load(content.chat_list);
	data.website_list.load(content.website_list);
	data.unknown_website_list.load(content.unknown_website_list);

	for (var i = 0, len = data.website_list.length(); i < len; ++i) {
		var id = i;
		var website = data.website_list.get(id);
		data.website_exist_map[website.url] = true;
	} 
}

function save_data() {
	var filename = path.resolve(__dirname, 'data/data.json');
	var content = {
		chat_list: data.chat_list.save(),
		website_list: data.website_list.save(),
		unknown_website_list: data.unknown_website_list.save()
	};
	var content = JSON.stringify(content);
	fs.writeFileSync(filename, content);
}
