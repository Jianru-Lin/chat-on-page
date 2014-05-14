exports = module.exports = detect_url

var http = require('http')
var https = require('https')
var parse_url = require('url').parse

// # scb(list)
// # fcb()
function detect_url(url, headers, scb, fcb) {
	console.log('[detect_url] ' + url)
	scb = scb || function() {}
	fcb = fcb || function() {}

	var list = []
	var redirect_count = 0

	detect(url, headers)

	function detect(url, headers) {
		var detector = new UrlDetector(url, headers)

		detector.event_handler.on_success = function(result) {
			list.push(result)

			var status_code = result.res.status_code

			if ((status_code === 301 || status_code === 302) && redirect_count < 5) {
				var redirect_url = result.res.headers.location
				if (redirect_url) {
					++redirect_count
					detect(redirect_url, headers)
					return
				}
			}

			scb(list)
		}

		detector.event_handler.on_failure = function() {
			if (list.length > 0) scb(list)
			else fcb()
		}

		detector.start()
	}
}

function UrlDetector(url, headers) {
	this.url = url
	this.headers = headers
	this.event_handler = {
		on_success: function() {},
		on_failure: function() {}
	}
	this.req = undefined
	this.result = undefined
}

UrlDetector.prototype.start = function() {
	var self = this

	if (self.req) return

	var url = self.url
	var headers = self.headers

	var opt = parse_url(url)
	var protocol = opt.protocol || ''
	protocol = protocol.toLowerCase()

	if (protocol === 'http:') {
		var p = http
	}
	else if (protocol === 'https:') {
		var p = https
	}
	else {
		fire_failure()
		release()
		return
	}

	opt.method = 'GET'
	opt.headers = headers

	var req = self.req = p.request(opt)
	req.on('response', on_response)
	req.on('error', on_error)
	req.end()

	function on_response(res) {

		var status_code = res.statusCode
		var content_type = res.headers['content-type']
		var content_length = res.headers['content-length']

		console.log('content-type: ' + content_type)

		if (/^text(\/|$)/i.test(content_type) || /^application\/((x-)?javascript|json)/i.test(content_type)) {
			console.log('receive_all')
			receive_all()
		}
		else {
			console.log('receive_header_only')
			receive_header_only()
		}

		function receive_all() {
			var chunks = []
			var total_length = 0

			res.on('data', function(chunk) {
				chunks.push(chunk)
				total_length += chunk.length
			})

			res.on('end', function() {
				var buff = Buffer.concat(chunks, total_length)
				var text = convert(content_type, buff)

				self.result = {
					url: url,
					res: {
						status_code: status_code,
						headers: {},
						body: text
					}
				}

				override(res.headers, self.result.res.headers)

				fire_success()
				release()
			})

			res.on('error', function(err) {
				console.log('[res error] ', err.toString())
				fire_failure()
			})

		}

		function receive_header_only() {
			res.on('data', function(){})
			res.on('error', function(){})

			self.result = {
				url: url,
				res: {
					status_code: status_code,
					headers: {}
				}
			}

			override(res.headers, self.result.res.headers)

			fire_success()
			release()
		}


	}

	function on_error(err) {
		fire_failure()
	}

	function fire_failure() {
		self.event_handler.on_failure()
	}

	function fire_success() {
		self.event_handler.on_success(self.result)
	}

	function release() {
		if (self.req) {
			self.req.abort()
			self.req === undefined
		}
	}
}

UrlDetector.prototype.stop = function() {
	if (!this.req) return
	this.req.abort()
	this.req = undefined
}

function override(src, dst) {
	for (var k in src) {
		dst[k] = src[k]
	}
}

function empty() {

}

function convert(content_type, buff) {
	return buff.toString()
}