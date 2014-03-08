exports.process_message = process_message;

var url = require('url');
var jsdom = require('jsdom');

var website_detector = new WebsiteDetector();

var handler_list = [chat_handler, latest_chat, latest_website];

var data = {
	chat_list: [],
	next_chat_id: 0,

	website_list: [],
	next_website_id: 0,
	website_list_map: {},

	unknown_website_list: [],
	unknown_website_list_map: {},
}

function process_message(message) {
	var input_message_list = message.message_list;

	if (!check_session(message.session)) {
		message.session = {
			last_chat_message_id: undefined,
			last_website_message_id: undefined
		};
	}

	if (!input_message_list) {
		return {
			session: message.session,
			message_list: []
		};
	}

	var output = {
		session: message.session,
		message_list: []
	};

	handler_list.forEach(function(handler) {
		handler(message, output);
	});

	return output;

	function check_session(session) {
		// simple check, not strong
		// todo
		return (typeof session !== 'object' || session === null) ? false : true;
	}
}

function chat_handler(req, res) {
	req.message_list.forEach(function(message) {
		if (message.type === 'chat') {
			var message_copy = safe_copy(message);
			
			// ignore invalid message
			if (!format_check(message_copy)) return;

			// add id and date_time
			message_copy.id = data.next_chat_id++;
			message_copy.date_time = (new Date()).toISOString();

			// add unknown website if needed
			var url_parsed = url.parse(message_copy.from.page.url);

			var website_url;
			if (url_parsed.port !== null && url_parsed.port !== undefined) {
				website_url = url_parsed.protocol + '//' + url_parsed.hostname + ':' + url_parsed.port;
			} else {
				website_url = url_parsed.protocol + '//' + url_parsed.hostname;
			}

			if (!data.website_list_map[website_url] && !data.unknown_website_list_map[website_url]) {
				var website = {
					url: website_url
				};
				data.unknown_website_list.push(website);
				data.unknown_website_list_map[website_url] = website;

				// active it
				active_website_detector();
			}

			// add to chat list
			data.chat_list.push(message_copy);
		}
	});

	function safe_copy(message) {
		// TODO
		return message;
	}

	function format_check(message) {
		// TODO
		return true;
	}
}

function latest_chat(req, res) {
	var last_chat_message_id = req.session.last_chat_message_id;

	if (last_chat_message_id === undefined) {
		last_chat_message_id = -1;
	}

	for (var i = last_chat_message_id + 1, len = data.chat_list.length; i < len; ++i) {
		res.message_list.push(data.chat_list[i]);
	}

	// update session
	res.session.last_chat_message_id = data.chat_list.length - 1;
}

function latest_website(req, res) {
	var last_website_message_id = req.session.last_website_message_id;

	if (last_website_message_id === undefined) {
		last_website_message_id = -1;
	}

	for (var i = last_website_message_id + 1, len = data.website_list.length; i < len; ++i) {
		res.message_list.push(data.website_list[i]);
	}

	// update session
	res.session.last_website_message_id = data.website_list.length - 1;
}

function active_website_detector() {
	if (data.unknown_website_list.length < 1) return;
	if (website_detector.is_running) return;

	website_detector.url = data.unknown_website_list[0].url;
	website_detector.on_finish = on_detect_finish;
	website_detector.start();

	function on_detect_finish(error, _title) {
		var title = error ? '获取站点名称失败' : _title;

		// remove from unknown website
		delete data.unknown_website_list_map[website_detector.url];
		var website = data.unknown_website_list.shift();

		// add to website list
		website.type = 'website';
		website.id = data.next_website_id++;
		website.title = title;
		data.website_list_map[website.url] = website;
		data.website_list.push(website);

		// active again if there is more unknown website
		setTimeout(active_website_detector, 0);
	}
}

// ----- WebsiteDetector -----

function WebsiteDetector() {
	this.url = undefined;
	this.on_finish = undefined;
	this.is_running = undefined;
}

WebsiteDetector.prototype.start = function() {
	var self = this;
	if (self.is_running) return;

	self.is_running = true;

	jsdom.env({
		url: self.url,
		done: function(error, window) {
			self.is_running = false;

			if (!self.on_finish) return;
			
			if (error) {
				self.on_finish(error, undefined);
			} else {
				self.on_finish(undefined, window.document.title);
			}
		}
	});
}