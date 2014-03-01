function ServerEvent() {
	this.on_receive = undefined;
}

ServerEvent.prototype.start = function() {
	var self = this;

	// query history first
	receive(undefined)
		.success(function(chat_item_list) {
			if (self.on_receive) {
				self.on_receive(chat_item_list);
			}
			receive_storage();
		})
		.failure(function() {
			receive_storage();
		})
		.network_error(function() {
			receive_storage();
		});

	function receive_storage() {
		window.addEventListener('storage', function(e) {
			if (e.key === 'receive') {
				var chat_item_list = JSON.parse(e.newValue);
				if (self.on_receive) {
					self.on_receive(chat_item_list);
				}
			}
		});		
	}
}