var app;

onload = function() {
	app = new App();
	app.start();
}

/* --- App --- */

function App() {
	this.ui = new UI();
	this.server_event = new ServerEvent();
}

App.prototype.start = function() {
	var self = this;

	self.server_event.on_receive = on_receive;
	self.server_event.start();

	self.ui.on_send = function(chat_item) {
		send(chat_item);
	};

	function on_receive(chat_item_list) {
		if (chat_item_list.length > 0) {
			self.ui.show_chat_item_list(chat_item_list);
		}
	}
}