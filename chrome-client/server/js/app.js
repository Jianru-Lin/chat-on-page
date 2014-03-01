var app;
var af0_no_chat_on_page = true;

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

	self.ui.on('send', function(chat_item) {
		send(chat_item);
	});

	function on_receive(chat_item_list) {
		if (chat_item_list.length > 0) {
			self.ui.show(chat_item_list);
		}
	}
}