// ----- MessageQueue -----

function MessageQueue() {
	var self = this;
	self.session = undefined;
	self.on_receive = undefined;
	self.queue = undefined;
	self.sending = undefined;
}

MessageQueue.prototype.send = function(message) {
	var self = this;

	// undefined message is ok
	if (!self.queue) self.queue = message ? [message] : [];
	else if (message) self.queue.push(message);
	else return;

	do_send();

	function do_send() {
		if (!self.sending) {
			if (self.queue) {
				// send the message in queue
				self.sending = self.queue;
				self.queue = undefined;
			} else {
				// there is nothing to send
				return;
			}
		}

		var req_obj = {
			session: self.session,
			message_list: self.sending
		};

		json_request(req_obj)
			.success(function(res_obj) {
				// ok, we sended them
				self.sending = undefined;

				// update session if needed
				if (typeof res_obj['session'] !== 'undefined') {
					self.session = res_obj.session;
				}

				// process the response
				if (self.on_receive) {
					if (res_obj.message_list.length > 0) {
						res_obj.message_list.forEach(function(message) {
							self.on_receive(message);
						});
					}
				}

				// sending the rest if there is
				setTimeout(do_send, 0);
			})
			.failure(function(error) {
				// retry 1s later
				setTimeout(do_send, 1000);
			});
	}
}

// ----- MessageManager -----

function MessageManager() {
	var self = this;
	self.on_receive = undefined;
	self.message_queue = new MessageQueue();

	self.message_queue.on_receive = handler;

	setInterval(function() {
		self.message_queue.send();
	}, 1000);

	function handler() {
		if (self.on_receive) {
			self.on_receive.apply(self, arguments);
		}
	}
}

MessageManager.prototype.send = function() {
	var self = this;
	self.message_queue.send.apply(self.message_queue, arguments);
}