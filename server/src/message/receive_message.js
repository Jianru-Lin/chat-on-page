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
		app.get('/1.0/', index_page);
		app.post('/1.0/action', action_page);
		app.listen(80);
	}

	function action_page(req, res) {
		var message = req.body;

		message_handler(message);

		var res_obj = {};
		if (message.result) {
			res_obj.result = message.result;
		} else if (message.error) {
			res_obj.error = message.error;
		}

		var res_text = JSON.stringify(res_obj);
		var length = Buffer.byteLength(res_text, 'utf8');

		res.setHeader('Content-Type', 'application/json; charset=UTF-8');
		res.setHeader('Content-Length', length);
		res.end(res_text);
	}
}

function index_page(req, res) {
	var data = {
		css_href_list: [],
		script_src_list: ['js/json-request.js', 'js/web-api.js']
	};

	res.render(path.resolve(__dirname, 'web_ui/view', 'index.jade'), data);
}
