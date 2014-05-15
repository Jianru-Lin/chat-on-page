if (typeof exports !== 'undefined') {
	exports.retrive = retrive;
	exports.sync = sync;

	var new_requester = require('./crud').new_requester;
}

function Retriver(uri) {
	this.uri = uri;
	this.start_seq = undefined;
	this.count = 30;
	this.event_handler = {
		on_success: function() {},
		on_failure: function() {}
	};
	this.requester = undefined;
}

Retriver.prototype.is_working = function() {
	return this.requester != undefined;
}

Retriver.prototype.stop = function() {
	if (this.requester) {
		this.requester.cancel();
		this.requester = undefined;
	}
}

Retriver.prototype.start = function() {
	var self = this;
 
 	var message = {
 		action: 'retrive',
 		uri: self.uri,
 		start_seq: self.start_seq,
 		count: self.count
 	}

 	var requester = self.requester = new_requester(message);

	requester
		.start()
		.success(function(result) {
			self.event_handler.on_success(self, result);
			self.requester = undefined;
		})
		.failure(function() {
			self.event_handler.on_failure(self);
			self.requester = undefined;
		});
}

function retrive(uri, start_seq, count, scb, fcb) {
	console.log('[retrive]');
	console.log({
		uri: uri,
		start_seq: start_seq,
		count: count
	});

	var retriver = new Retriver(uri);
	retriver.start_seq = start_seq;
	retriver.count = count;
	retriver.event_handler.on_success = function(retriver, result) {
		console.log('[retrive] success');
		console.log(result);
		if (scb) scb(result);
	};
	retriver.event_handler.on_failure = function() {
		console.log('[retrive] failure');
		if (fcb) fcb();
	};
	retriver.start();
	return retriver;
}

// ----- Syncer -----

function Syncer(uri) {
	this.event_handler = {
		on_success: function() {},
		on_failure: function() {}
	};
	this.intv = undefined;
	this.uri = uri;
	this.start_seq = undefined;
	this.count = undefined;
	this.retriver = undefined;
}

Syncer.prototype.start = function() {
	var self = this;
	if (self.intv != undefined) return;
	
	var retriver = self.retriver = new Retriver();

	retriver.uri = self.uri;
	retriver.start_seq = self.start_seq;
	retriver.count = self.count;
	retriver.event_handler = {
		on_success: on_success,
		on_failure: on_failure
	};

	self.intv = setInterval(do_request, 1000);

	function do_request() {
		if (self.retriver.is_working()) return;
		self.retriver.start();
	}

	function on_success(retriver, result) {
		var head_seq = result.head_seq;
		var tail_seq = result.tail_seq;
		var prev_seq = result.prev_seq;
		var next_seq = result.next_seq;

		// there isn't any log yet
		// continue

		if (null_undefined(head_seq)) {
			console.log("there isn't any log yet");
			return;
		}

		// invalid start_seq

		if (null_undefined(prev_seq)) {
			console.log('invalid start_seq');
			return;
		}

		// everything is ok

		self.event_handler.on_success(self, result);

		// move forward

		self.start_seq = self.retriver.start_seq = next_seq;

		function null_undefined(v) {
			return v === null || v === undefined;
		}
	}

	function on_failure(retriver) {
		self.event_handler.on_failure(self);
	}
}

Syncer.prototype.stop = function() {
	if (this.intv !== undefined) {
		clearInterval(this.intv);
		this.intv = undefined;
	}
	if (this.retriver !== undefined) {
		this.retriver.stop();
		this.retriver = undefined;
	}
}


function sync(uri, start_seq, count, scb, fcb) {
	var syncer = new Syncer();
	syncer.uri = uri;
	syncer.start_seq = start_seq;
	syncer.count = count;
	syncer.event_handler.on_success = function (syncer, result) {
		if (scb) scb(syncer, result);
	}
	syncer.event_handler.on_failure = function(syncer) {
		if (fcb) fcb(syncer);
	}
	return syncer;
}

// # scb(result)
// # fcb()
function detect(uri, scb, fcb) {
	retrive(uri, 0, 0, function(result) {
		console.log('[detect]')
		console.log(result)
		if (scb) scb(result)
	}, function() {
		console.log('[detect] failure')
		if (fcb) fcb()
	})
}