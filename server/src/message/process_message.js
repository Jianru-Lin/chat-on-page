exports.process_message = process_message;

var url = require('url');
var jsdom = require('jsdom');
var Iconv = require('iconv').Iconv;
var request = require('request');

var website_detector = new WebsiteDetector();

var handler_list = [on_chat, on_query_chat, on_query_website];

var data = {
	chat_list: new IdList(),
	website_list: new IdList(),
	unknown_website_list: new KeyList(),
	website_exist_map: {}
}

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
debugger;
	website_detector.url = unknown_website_list.indexOf(0).url; console.log('detect url: ' + website_detector.url);
	website_detector.on_finish = on_detect_finish;
	website_detector.start();

	function on_detect_finish(error, _title) {
		var title = error ? '获取站点名称失败' : _title; console.log(title);

		// remove from unknown website
		debugger;
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

	var o = {
		url: self.url,
		encoding: null // very important, tell request return raw body buffer
	};

	request(o, function(error, res, body) {
		// oops, error occurs
		if (error) {
			self.is_running = false;
			console.log('[WebsiteDetector] ' + error.toString());
			if (self.on_finish) {
				self.on_finish(error, undefined);
			}
			return;
		}

		// check the charset, and convert it
		var content_type = res.headers['content-type'];
		if (content_type) {
			var match = /charset=(\S+)/i.exec(content_type);
			if (match) {
				// do convert
				var charset = match[1];
				var iconv = new Iconv(charset, 'UTF-8');
				body = iconv.convert(body);
			}
		}

		body = body.toString('utf8');

		// parse text with jsdom
		jsdom.env({
			html: body,
			done: function(error, window) {
				self.is_running = false;

				if (!self.on_finish) return;
				
				if (error) {
					self.on_finish(error, undefined);
				} else {
					self.on_finish(undefined, window.document.title);
				}
			}
		})
	});

}

// ----- KeyList -----

function KeyList() {
	this.first = {next: undefined};
	this.last = this.first;
	this._length = 1;
}

KeyList.prototype.push = function(key, value) {
	var node = {
		value: value,
		next: undefined,
		prev: undefined
	};

	node.prev = this.last;
	this.last.next = node;
	this.last = node;

	this[key] = node;
	
	++this._length;
}

KeyList.prototype.get = function(key) {
	if (key in this) {
		var node = this[key];
		return node.value;
	} else {
		return undefined;
	}
}

KeyList.prototype.indexOf = function(i) {
	if (i < 0 || i > this._length - 2) return undefined;

	var node = this.first;
	i += 2;
	while (--i) {
		node = node.next;
	}
	return node.value;
}

KeyList.prototype.remove = function(key) {
	// return object
	if (!(key in this)) return;

	var node = this[key];
	delete this[key];

	if (this.last === node) {
		this.last = node.prev;
	}

	if (node.prev) {
		node.prev.next = node.next;
	}

	if (node.next) {
		node.next.prev = node.prev;
	};

	--this._length;

	node.next = undefined;
	node.prev = undefined;
	return node.value;
}

KeyList.prototype.length = function() {
	return this._length - 1;
}


// ----- IdList -----

function IdList() {
	this.next_id = 0;
	this.key_list = new KeyList();
}

IdList.prototype.push = function(element) {
	element.id = this.next_id++;
	return this.key_list.push(element.id, element);
}

IdList.prototype.get = function(id) {
	return this.key_list.get(id);
}

IdList.prototype.indexOf = function(i) {
	return this.key_list.indexOf(i);
}

IdList.prototype.remove = function(id) {
	return this.key_list.remove(id);
}

IdList.prototype.length = function() {
	return this.key_list.length();
}