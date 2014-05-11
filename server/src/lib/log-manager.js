exports = module.exports = LogManager;

function LogManager(uri, parent) {
	this.log_list = [];
	this.uri = uri;
	this.parent = parent;
}

LogManager.prototype._push = function(log) {
	this.log_list.push(log);
	if (this.parent) this.parent._push(log);
}

LogManager.prototype.create = function(args) {
	var item_type = args.item_type;
	var item = args.item;

	var log = {
		action: 'create',
		uri: this.uri,
		id: this.log_list.length,
		date_time: (new Date()).toISOString(),
		item_type: item_type,
		item: item
	};

	this._push(log);

	return {
		id: log.id,
		date_time: log.date_time,
		action: 'create',
		uri: this.uri,
		item_type: item_type
	};
}

LogManager.prototype.update = function(args) {
	var target_id = args.target_id;
	var item = args.item;
	var item_type = args.item_type;

	var log = {
		action: 'update',
		uri: this.uri,
		id: this.log_list.length,
		date_time: (new Date()).toISOString(),
		target_id: target_id,
		item: item,
		item_type: item_type
	};

	this._push(log);

	return {
		id: log.id,
		date_time: log.date_time,
		action: 'update',
		uri: this.uri,
		target_id: target_id,
		item_type: item_type
	};
}

LogManager.prototype.delete = function(args) {
	var target_id = args.target_id;

	var log = {
		action: 'delete',
		uri: this.uri,
		id: this.log_list.length,
		date_time: (new Date()).toISOString(),
		target_id: target_id
	};

	this._push(log);

	return {
		id: log.id,
		date_time: log.date_time,
		action: 'delete',
		uri: this.uri,
		target_id: target_id
	};
}


LogManager.prototype.retrive = function(args) {debugger;
	var self = this

	var start_seq = args.start_seq
	var count = args.count

	// there isn't any log yet

	if (self.log_list.length <= 0) {
		return null_result()
	}

	// invalid start_seq

	if (start_seq < 0 || start_seq >= self.log_list.length) {
		var result = null_result()
		result.head_seq = 0
		result.tail_seq = self.log_list.length - 1
		return result
	}

	// count is too big ?
	
	var step = 1

	if (count > 50) {
		count = 50
	} else if (count < -50) {
		count = -50
		step = -1
	}

	// ok, collect and return

	var list = []

	for (var p = start_seq; p >= 0 && p < self.log_list.length; p += step) {
		list.push(self.log_list[p])
	}

	return {
		log_list: list,
		prev_seq: start_seq - step,
		next_seq: p,
		head_seq: 0,
		tail_seq: self.log_list.length - 1,

		uri: self.uri,
		action: 'retrive',
		start_seq: start_seq,
		count: count
	}

	function null_result() {
		return {
			log_list: null,
			prev_seq: null,
			next_seq: null,
			head_seq: null,
			tail_seq: null,

			uri: self.uri,
			action: 'retrive',
			start_seq: start_seq,
			count: count
		}
	}
}