function new_create(target, opt) {
	return new Create(target, opt);
}

function new_retrive(target, opt) {
	return new Retrive(target, opt);
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

/* Create */

function Create(target, opt) {
	this.notifier = undefined;
	this.target = target;
	this.opt = opt;
	this.req_controller = undefined;
}

Create.prototype.start = function() {
	var self = this;

	self.notifier = new ResultNotifier(self);

	var message = {
		target: self.target,
		action: 'create',
		item: self.opt
	};

	var req = {
		message_list: [message]
	};

	self.req_controller = 
		json_request(req)
			.success(on_success)
			.failure(on_failure);

	return self.notifier;

	function on_success(res) {
		self.notifier._emit_success(res);
		self.req_controller = undefined;
	}

	function on_failure() {
		self.notifier._emit_failure();
		self.req_controller = undefined;
	}
}

Create.prototype.cancel = function() {
	if (this.req_controller) {
		this.req_controller.cancel();
		this.req_controller = undefined;
	}
}

/* Retrive */

function Retrive(target, opt) {
	this.notifier = undefined;
	this.target = target;
	this.opt = opt;
	this.req_controller = undefined;
}

Retrive.prototype.start = function() {
	var self = this;

	self.notifier = new ResultNotifier(self);

	var message = {
		target: self.target,
		action: 'retrive'
	};

	for (var prop in this.opt) {
		message[prop] = this.opt[prop];
	}

	var req = {
		message_list: [message]
	};

	self.req_controller = 
		json_request(req)
			.success(on_success)
			.failure(on_failure);

	return self.notifier;

	function on_success(res) {
		self.notifier._emit_success(res.message_list[0]);
		this.req_controller = undefined;
	}

	function on_failure() {
		self.notifier._emit_failure();
		self.req_controller = undefined;
	}
}

Retrive.prototype.cancel = function() {
	if (this.req_controller) {
		this.req_controller.cancel();
		this.req_controller = undefined;
	}
}

/* Update */

function Update(opt) {

}

Update.prototype.start = function() {

}

/* Delete */

function Delete(opt) {

}

Delete.prototype.start = function() {

}
