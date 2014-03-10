// ----- MessageManager -----

function MessageManager() {
	var self = this;
	self.on_receive = undefined;
	self.waiting_queue = undefined;
	self.sending_queue = undefined;
}

MessageManager.prototype.send = function(message_list) {
	var self = this;

	if (!message_list) return;
	if (!Array.isArray(message_list)) {
		message_list = [message_list];
	}

	// add to waiting_queue
	if (!self.waiting_queue) self.waiting_queue = message_list;
	else self.waiting_queue = self.waiting_queue.concat(message_list);

	do_send();

	function do_send() {
		if (!self.sending_queue) {
			if (self.waiting_queue) {
				// send the message in waiting_queue
				self.sending_queue = self.waiting_queue;
				self.waiting_queue = undefined;
			} else {
				// there is nothing to send
				return;
			}
		}

		var req_obj = {
			message_list: self.sending_queue
		};

		json_request(req_obj)
			.success(function(res_obj) {
				// ok, we sended them
				self.sending_queue = undefined;

				// process the response
				if (self.on_receive) {
					if (res_obj.message_list.length > 0) {
						self.on_receive(res_obj.message_list);
					}
				}

				// sending_queue the rest if there is
				setTimeout(do_send, 0);
			})
			.failure(function(error) {
				// retry 1s later
				setTimeout(do_send, 1000);
			});
	}
}

MessageManager.prototype.is_idle = function() {
	return (!this.sending_queue || this.sending_queue.length < 1) && (!this.waiting_queue || this.sending_queue.length < 1);
}