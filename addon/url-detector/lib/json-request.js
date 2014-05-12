exports = module.exports = json_request

var http = require('http')
var https = require('https')
var parse_url = require('url').parse

// # success(res_obj)
// # failure(code, text)
function json_request(obj, url) {
	url = url || json_request.url
	var text = JSON.stringify(obj)

	// support http & https

	var url_obj = parse_url(url)
	var protocol = url_obj.protocol.toLowerCase()

	if ('http:' === protocol) {
		var p = http
	} else if ('https:' === protocol) {
		var p = https
	}

	// create request

	var opt = {
		method: 'POST',
		hostname: url_obj.hostname,
		port: url_obj.port,
		path: url_obj.path,
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
			'Content-Length': Buffer.byteLength(text, 'utf8')
		}
	}

	var req = p.request(opt, on_response)
	req.on('response', on_response)
	req.on('error', on_error)
	req.end(text)

	// return action link

	var action_link = new ActionLink()
	action_link.req = req
	action_link.cancel = function() {
		this.req.abort()
	}
	return action_link

	function on_response(res) {
		// check status code

		if (res.statusCode !== 200) {
			action_link.emit_failure({
				code: 1,
				text: 'status code is ' + res.statusCode
			})
			return
		}

		// check content type

		var content_type = res.headers['content-type']
		if (!/^application\/json;\s*charset=UTF-8$/i.test(content_type)) {
			action_link.emit_failure({
				code: 2,
				text: 'Content-Type is ' + content_type
			})
			return
		}

		// receive chunks

		var chunks = []
		var total_length = 0

		res.on('data', function(chunk) {
			chunks.push(chunk)
			total_length += chunk.length
		});

		res.on('end', function() {

			if (res.ended) return // dirty code
			else res.ended = true;

			// combine chunks

			var chunk_combined = Buffer.concat(chunks, total_length)
			try {
				var res_obj = JSON.parse(chunk_combined.toString('utf8'))
			} catch(err) {
				action_link.emit_failure({
					code: 4,
					text: 'parse JSON failed, ' + err.toString()
				})
				return
			} finally {
				chunks = undefined;
				total_length = 0;
			}

			// success
			action_link.emit_success(res_obj)

		})

		res.on('error', function(err) {
			action_link.emit_failure({
				code: 3,
				text: err.toString()
			})
		})
	}

	function on_error(err) {
		action_link.emit_failure({
			code: -1,
			text: err.toString()
		})
	}
}

// ----- ActionLink -----

function ActionLink() {
	this.scb = undefined
	this.fcb = undefined
}

ActionLink.prototype.success = function(scb) {
	this.scb = scb
	return this
}

ActionLink.prototype.failure = function(fcb) {
	this.fcb = fcb
	return this
}

ActionLink.prototype.emit_success = function() {
	if (this.scb) {
		this.scb.apply(this, arguments)
	}
}

ActionLink.prototype.emit_failure = function() {
	if (this.fcb) {
		this.fcb.apply(this, arguments)
	}
}
