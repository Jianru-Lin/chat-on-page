exports.message_loop = message_loop;

function message_loop() {
	receive_message(function(message) {
		// continue message loop
		setImmediate(message_loop);

		// process message
		return process_message(message);
	});		
}