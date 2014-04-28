// [exports]

exports.process_message = process_message;

// [dependencies]

var LogManager = require('./lib/log-manager');


// [global var]

var target_map = {};


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
		var target = input_message.target;
		var log_manager = target_map[target];
		if (!log_manager) {
			console.log('add target: ' + target);
			log_manager = new LogManager();
			target_map[target] = log_manager;
		}
		var output_message = crud(log_manager, input_message);
		output_message_list.push(output_message);
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
			console.log(message.action + ' ' + message.target);
		}
		result = fun.apply(log_manager, [message]);
	}
	return result;
}