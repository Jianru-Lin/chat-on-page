exports.receive_message = receive_message;

var express = require('express');
var path = require('path');

var app = undefined;

function receive_message(message_handler) {
	if (!app) {
		generate_web_api();

		app = express();
		app.use(express.json());
		app.use(express.static(path.resolve(__dirname, 'web_ui/public')));
		app.engine('jade', require('jade').__express);
		app.get('/', index_page);
		app.get('/help/chat', usage_page);
		app.post('/message', message_page);
		app.listen(80);
	}

	function message_page(req, res) {
		var message = req.body;

		var res_obj = message_handler(message);
		var res_text = JSON.stringify(res_obj);
		var length = Buffer.byteLength(res_text, 'utf8');

		res.setHeader('Content-Type', 'application/json; charset=UTF-8');
		res.setHeader('Content-Length', length);
		res.end(res_text);
	}
}

function index_page(req, res) {
	res.render(path.resolve(__dirname, 'web_ui/view', 'index.jade'));
}

function usage_page(req, res) {
	res.render(path.resolve(__dirname, 'web_ui/view', 'usage.jade'));
}