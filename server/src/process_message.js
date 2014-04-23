// [exports]

exports.process_message = process_message;

// [dependencies]

var LogManager = require('./lib/log-manager');


// [global var]

var target_map = {
	'channel': channel_crud,
	'chat': chat_crud
}

var gdata = {
	channel_lm: new LogManager(),
	chat_lm: new LogManager()
}


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
		var target_handler = target_map[input_message.target];
		if (!target_handler) {
			console.log('unknown target: ' + input_message.target);
			return;
		}
		var output_message = target_handler(input_message);
		output_message_list.push(output_message);
	});

	var res = {
		message_list: output_message_list
	};

	return res;
}

function channel_crud(message) {
	var channel_lm = gdata.channel_lm;
	var result = {};

	var fun = channel_lm[message.action];
	if (fun) {
		result = fun.apply(channel_lm, [message]);
	}

	return result;
}

function chat_crud(message) {
	var chat_lm = gdata.chat_lm;
	var result = {};

	var fun = chat_lm[message.action];
	if (fun) {
		result = fun.apply(chat_lm, [message]);
	}

	return result;
}