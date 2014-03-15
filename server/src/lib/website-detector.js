exports = module.exports = WebsiteDetector;

var jsdom = require('jsdom');
var Iconv = require('iconv').Iconv;
var request = require('request');

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

		var raw_body = body;

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

		// we need inspect the body again
		// check if there is any charset meta tag
		// if there is, we should reconvert it again
		jsdom.env({
			html: body,
			done: function(error, window) {
				if (error) {
					self.is_running = false;
					if (self.on_finish) self.on_finish(error, undefined);
					return;
				}

				var charset = get_charset_from_meta_list(window.document.head.querySelectorAll('meta'));

				// there isn't any content-type meta tag
				// so we don't need more convert
				if (!charset) {
					self.is_running = false;
					if (self.on_finish) self.on_finish(undefined, window.document.title);
				}

				// we need more conver
				if (charset) {
					var iconv = new Iconv(charset, 'UTF-8');
					body = iconv.convert(raw_body);

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
				}
			}
		})
	});

	function get_charset_from_meta_list(meta_list) {
		if (!meta_list || meta_list.length < 1) return undefined;
		var charset = undefined;
		for (var i = 0, len = meta_list.length; i < len; ++i) {
			var meta = meta_list[i];
			// <meta http-equiv="Content-Type" content="text/html; charset=????">
			if (/^content-type$/i.test(meta.getAttribute('http-equiv'))) {
				var content = meta.getAttribute('content');
				var match = /charset=(\S+)/i.exec(content);
				if (match) {
					charset = match[1];
				}
			}
		}

		if (/^gb2312$/i.test(charset)) {
			charset = 'GBK';
		}

		return charset;
	}
}
