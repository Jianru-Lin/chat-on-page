if (typeof exports !== 'undefined') {
	exports.new_requester = new_requester;
	var json_request = require('./json-request');
}

function new_requester(message) {
	return new Requester(message)
}

/* ResultNotifier */

function ResultNotifier(source) {
	this.source = source;
	this.on_progress = [];
	this.on_success = [];
	this.on_failure = [];
}

ResultNotifier.prototype.cancel = function() {
	if (this.source) {
		this.source.cancel();
	}
}

ResultNotifier.prototype.progress = function(callback, this_arg) {
	this.on_progress.push({
		callback: callback,
		this_arg: this_arg
	});
	return this;
}

ResultNotifier.prototype.success = function(callback, this_arg) {
	this.on_success.push({
		callback: callback,
		this_arg: this_arg
	});
	return this;
}

ResultNotifier.prototype.failure = function(callback, this_arg) {
	this.on_failure.push({
		callback: callback,
		this_arg: this_arg
	});
	return this;
}

ResultNotifier.prototype._emit_success = function() {
	var args = arguments;
	this.on_success.forEach(function(listner) {
		listner.callback.apply(listner.this_arg, args);
	});
}

ResultNotifier.prototype._emit_progress = function() {
	var args = arguments;
	this.on_progress.forEach(function(listner) {
		listner.callback.apply(listner.this_arg, args);
	});
}

ResultNotifier.prototype._emit_failure = function() {
	var args = arguments;
	this.on_failure.forEach(function(listner) {
		listner.callback.apply(listner.this_arg, args);
	});
}

/* Requester */

function Requester(message) {
	this.notifier = undefined;
	this.req_controller = undefined;
	this.message = message;
}

Requester.prototype.start = function() {
	var self = this;

	self.notifier = new ResultNotifier(self);

	var req = {
		message_list: [self.message]
	};

	self.req_controller = 
		json_request(req)
			.success(on_success)
			.failure(on_failure);

	return self.notifier;

	function on_success(res) {
		self.notifier._emit_success(res.message_list[0]);
		self.req_controller = undefined;
	}

	function on_failure() {
		self.notifier._emit_failure();
		self.req_controller = undefined;
	}
}

Requester.prototype.cancel = function() {
	if (this.req_controller) {
		this.req_controller.cancel();
		this.req_controller = undefined;
	}
}