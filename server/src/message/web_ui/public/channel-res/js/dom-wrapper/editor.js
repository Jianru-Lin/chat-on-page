function EditorDW(dom, binding) {
	this.dom = dom;
	this.binding = binding;
	this.event_handler = {
		on_click_send: empty
	}

	var self = this;

	if (dom) {

		on_click(dom.querySelector('button.send'), function() {
			self.event_handler.on_click_send(self);
		});

		// support ctrl+enter shortcut

		on_keydown(dom, function(e) {
			// ctrl+enter
			if (!(e.ctrlKey && e.keyCode === 13)) return;
			self.event_handler.on_click_send(self);
		});

		on_keydown(dom.querySelector('.content textarea'), function(e) {
			if (e.keyCode === 13) {
				self.event_handler.on_click_send(self);
				e.preventDefault();
			}
		});
	}
}

EditorDW.prototype.get_content = function() {
	var value = this.dom.querySelector('.content textarea').value;

	return {
		type: 'text',
		value: value
	};
}

EditorDW.prototype.clear_content = function() {
	this.dom.querySelector('.content textarea').value = '';
}

EditorDW.prototype.get_author = function() {
	return this.dom.querySelector('.author input').value;
}
