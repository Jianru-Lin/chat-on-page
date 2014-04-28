function Walker(target) {
	this.target = target;
	this.id = undefined;
	this.direction = undefined;
	this.count = 30;
	this.event_handler = {
		on_success: function() {},
		on_failure: function() {}
	};
	this.retrive = undefined;
}

Walker.prototype.is_working = function() {
	return this.retrive != undefined;
}

Walker.prototype.cancel = function() {
	if (this.retrive) {
		this.retrive.cancel();
		this.retrive = undefined;
	}
}

Walker.prototype.forward = function() {
	this.direction = 'forward';
	this._do_retrive();
}

Walker.prototype.backward = function() {
	this.direction = 'backward';
	this._do_retrive();
}

Walker.prototype._do_retrive = function() {
	var self = this;

	var count = self.count & (self.direction === 'backward' ? -1 : 1);
 
	var opt = {
		id: self.id,
		include: true,
		count: self.count
	};

	//console.log('walk');
	//console.log(opt);

	var retrive = self.retrive = new_retrive(self.target, opt);

	retrive
		.start()
		.success(function(result) {
			var log_list = result.log_list;

			if (log_list.length > 0) {

				if (self.direction === 'forward') {

					var id = log_list[log_list.length-1].id;
					self.id = id + 1;

				} else {

					var id = log_list[0].id;
					self.id = id - 1;
					
				}

			} else {
				// don't change the id
			}

			self.event_handler.on_success(self, result);
			self.retrive = undefined;
		})
		.failure(function() {
			self.event_handler.on_failure();
			self.retrive = undefined;
		});
}

function Syncer(target) {
	this.event_handler = {
		on_success: empty,
		on_failure: empty
	};
	this.intv = undefined;
	this.target = target;
	this.id = undefined;
	this.walker = undefined;

	function empty() {

	}
}

Syncer.prototype.start = function() {
	var self = this;
	if (self.intv != undefined) return;
	
	self.walker = new Walker(self.target);
	self.walker.id = self.id;
	self.walker.event_handler = {
		on_success: on_success,
		on_failure: on_failure
	};

	self.intv = setInterval(do_request, 1000);

	function do_request() {
		if (self.walker.is_working()) return;
		self.walker.forward();
	}

	function on_success(walker, result) {
		self.event_handler.on_success(self, result);
	}

	function on_failure(walker) {
		self.event_handler.on_failure(self);
	}
}

Syncer.prototype.stop = function() {
	if (this.intv !== undefined) {
		clearInterval(this.intv);
		this.intv = undefined;
	}
	if (this.walker !== undefined) {
		this.walker.cancel();
		this.walker = undefined;
	}
}