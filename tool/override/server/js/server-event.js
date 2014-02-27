function ServerEvent() {
	this.on_receive = undefined;
}

ServerEvent.prototype.start = function() {
	var self = this;

	window.addEventListener('storage', function(e) {
		if (e.key === 'receive') {
			var chat_item_list = JSON.parse(e.newValue);
			if (self.on_receive) {
				self.on_receive(chat_item_list);
			}
		}
	});
}