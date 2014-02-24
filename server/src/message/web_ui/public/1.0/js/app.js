var app;

onload = function() {
	app = new App();
	app.start();
}

/* --- App --- */

function App() {
	this.ui = new UI();
	this.last_id = undefined;
}

App.prototype.start = function() {
	var self = this;

	self.ui.on_send = function(chat_item) {
		send(chat_item);
	};

	start_loop(receive_loop, 1000);

	function receive_loop(cb) {
		receive(self.last_id)
			.success(function(chat_item_list) {
				if (chat_item_list.length > 0) {
					self.last_id = chat_item_list[chat_item_list.length-1].id;
					self.ui.show_chat_item_list(chat_item_list);					
				}

				cb();
			})
			.failure(function() {
				cb();
			});
	}
}

/* --- Loop --- */

function Loop() {
	this.func = undefined;
	this.delay = undefined;
}

Loop.prototype.start = function() {
	var func = this.func;
	var delay = this.delay;

	loop_once();

	function loop_once() {
		func(function() {
			setTimeout(loop_once, delay);
		});
	}	
}

function start_loop(func, delay) {
	var loop = new Loop();
	loop.func = func;
	loop.delay = delay;
	loop.start();
	return loop;
}