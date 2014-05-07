exports = module.exports = detect_mime

var http = require('http')
var https = require('https')
var parse_url = require('url').parse

// # scb(mime, url)
// # fcb()
function detect_mime(url, scb, fcb) {
	console.log('[detect_mime] ' + url)
	scb = scb || function() {}
	fcb = fcb || function() {}

	if (/^http:\/\//i.test(url)) {
		var p = http
	} else if (/^https:\/\//i.test(url)) {
		var p = https
	} else {
		fcb((new Error).lineNumber)
		return
	}

	var opt = parse_url(url)
	opt.method = 'HEAD'

	var request = p.request(opt)
	request.on('response', on_response)
	request.on('error', on_error)
	request.end()

	function on_response(res) {
		res.on('data', function(){})
		res.on('error', function(){})

		if (res.statusCode !== 200) {
			fcb((new Error).lineNumber)
			return
		}

		var content_type = res.headers['content-type']
		if (!content_type) {
			fcb((new Error).lineNumber)
			return
		}

		scb(content_type, url)
	}

	function on_error(err) {
		console.log('[detect_mime] ' + err.toString())
		fcb((new Error).lineNumber)
		return
	}
}