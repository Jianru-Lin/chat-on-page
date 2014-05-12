var http = require('http')
var https = require('https')
var parse_url = require('url').parse

var server = start('0.0.0.0', 29000, function(req, client_res) {
	// not GET ?

	if (req.method !== 'GET') {
		console.log('method !== GET')
		client_res.end()
		return
	}

	var url_obj = parse_url(req.url, true)
	var target_url = url_obj.query['target_url']

	// target_url not provided ?

	if (!target_url) {
		client_res.end()
		return
	}

	// decode target_url

	console.log('[target_url] ' + target_url)

	var target_url_obj = parse_url(target_url)

	// prepare headers
	// override host

	var headers = {}

	for (var k in req.headers) {
		headers[k] = req.headers[k]
	}

	headers['host'] = target_url_obj.host

	// add refer

	headers['referer'] = target_url

	// do proxy

	request('GET', target_url, headers, function(server_res) {
		
		// same status code
		
		client_res.statusCode = server_res.statusCode

		// same header

		for (var k in server_res.headers) {
			client_res.setHeader(k, server_res.headers[k])
		}

		server_res.pipe(client_res)
	})

})


// # req_cb(req, res)
function start(host, port, req_cb, err_cb) {
	req_cb = req_cb || function() {}
	err_cb = err_cb || function() {}

	var server = http.createServer()

	server.on('request', function(req, res) {
		req_cb(req, res)
	})

	server.on('error', function(err) {
		console.log(err)
		err_cb(err)
	})

	server.listen(port, host)

	return server
}

function request(method, url, headers, res_cb, err_cb) {
	res_cb = res_cb || function() {}
	err_cb = err_cb || function() {}

	if (/^http:/i.test(url)) {
		var p = http
	}
	else if (/^https:/i.test(url)) {
		var p = https
	}
	else {
		err_cb()
		return
	}

	if (typeof url === 'string') {
		var url_obj = parse_url(url)
		url_obj.method = method
		url_obj.headers = headers		
	}
	else {
		url_obj = url
	}

	var req = p.request(url_obj)

	req.on('response', function(res) {
		res_cb(res)
	})

	req.on('error', function(err) {
		console.log(err)
		err_cb(err)
	})

	req.end()

	return req
}