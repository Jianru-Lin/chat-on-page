exports.message_loop = message_loop;

function message_loop() {
	receive_message(function(message) {
		// process message
		process_message(message);

		// continue message loop
		setImmediate(message_loop);
	});		
}