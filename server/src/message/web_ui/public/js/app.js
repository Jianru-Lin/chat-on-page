var app;
var af0_no_chat_on_page = true;

onload = function() {
	app = new App();
	app.start();
}

/* --- App --- */

function App() {
	var self = this;

	self.ui = new UI();
	self.message_manager = new MessageManager();
	self.message_manager.on_receive = message_from_server;

	self.ui.on('send', message_from_ui);

	// message handler
	function message_from_server(message) {
		self.ui.show(message);
	}

	function message_from_ui(message) {
		self.message_manager.send(message);
	}
}

App.prototype.start = function() {
}