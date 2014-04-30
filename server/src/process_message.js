// [exports]

exports.process_message = process_message;

// [dependencies]

var LogManagerTree = require('./lib/log-manager-tree');


// [global var]

var log_manager_tree = new LogManagerTree();


// [function]

function process_message(req) {
	var input_message_list = req.message_list;

	if (!input_message_list) {
		return {
			message_list: []
		};
	}

	var output_message_list = [];

	input_message_list.forEach(function(input_message) {
		var uri = input_message.uri;
		var log_manager = log_manager_tree.find_or_create(uri);
		if (log_manager) {
			var output_message = crud(log_manager, input_message);
			output_message_list.push(output_message);
		} else {
			console.log('[process_message] error: ' + uri);
		}
	});

	var res = {
		message_list: output_message_list
	};

	return res;
}

function crud(log_manager, message) {
	var result = {};
	var fun = log_manager[message.action];
	if (fun) {
		if (message.action !== 'retrive') {
			console.log(message.action + ' log: ' + message.uri);
		}
		result = fun.apply(log_manager, [message]);
	}
	return result;
}