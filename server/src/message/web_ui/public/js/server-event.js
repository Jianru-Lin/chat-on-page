function ServerEvent() {
	this.on_receive = undefined;
	this.last_id = undefined;
}

ServerEvent.prototype.start = function() {
	var self = this;

	start_loop(receive_loop, 1000);

	function receive_loop(cb) {
		receive(self.last_id)
			.success(function(chat_item_list) {
				if (chat_item_list.length > 0) {
					self.last_id = chat_item_list[chat_item_list.length-1].id;				
					if (self.on_receive) {
						self.on_receive(chat_item_list);
					}
				}

				cb();
			})
			.failure(function(error) {
				cb();
			})
			.network_error(function(error) {
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