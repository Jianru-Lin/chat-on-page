exports = module.exports = LogManager;

function LogManager() {
	this.log_list = [];
}

LogManager.prototype.create = function(args) {
	var item = args.item;

	var log = {
		action: 'create',
		id: this.log_list.length,
		date_time: (new Date()).toISOString(),
		item: item
	};

	this.log_list.push(log);

	return {
		id: log.id,
		date_time: log.date_time
	};
}

LogManager.prototype.retrive = function(args) {
	var self = this;

	var include = args.include;
	var id = interpret(args.id);
	var count = args.count;

	var start_id = 0;
	var end_id = 0;

	if (count >= 0) {

		count = count > 50 ? 50 : count;
		start_id = include ? id : id+1;
		end_id = start_id + count;

	} else {

		count = count < -50 ? -50 : count;
		end_id = include ? id+1 : id;
		start_id = end_id + count;

	}

	var output_log_list = [];

	for (var i = start_id; i < end_id; ++i) {
		if (i >= 0 && i < this.log_list.length) {
			output_log_list.push(this.log_list[i]);
		}
	}

	return {
		log_list: output_log_list,
		head_id: self.log_list.length > 0 ? self.log_list[0].id : undefined,
		tail_id: self.log_list.length > 0 ? self.log_list[self.log_list.length-1].id : undefined
	};

	function interpret(id) {
		var head_id = 0;
		var tail_id = 0;
		var before_head_id = 0;
		var after_tail_id = 0;

		if (self.log_list.length > 0) {
			head_id = self.log_list[0].id;
			tail_id = self.log_list[self.log_list.length-1].id;
			before_head_id = head_id - 1;
			after_tail_id = tail_id + 1;
		} else {
			head_id = 0;
			tail_id = 0;
			before_head_id = -1;
			after_tail_id = 0;
		}

		switch (id) {
			case 'head_id':
				id = head_id;
				break;
			case 'tail_id':
				id = tail_id;
				break;
			case 'before_head_id':
				id = before_head_id;
				break;
			case 'after_tail_id':
				id = after_tail_id;
				break;
		}

		return id;
	}
}

LogManager.prototype.update = function(args) {
	var target_id = args.target_id;
	var item = args.item;

	var log = {
		action: 'update',
		id: this.log_list.length,
		date_time: (new Date()).toISOString(),
		target_id: target_id,
		item: item
	};

	this.log_list.push(log);

	return {
		id: log.id,
		date_time: log.date_time
	};
}

LogManager.prototype.delete = function(args) {
	var target_id = args.target_id;

	var log = {
		action: 'delete',
		id: this.log_list.length,
		date_time: (new Date()).toISOString(),
		target_id: target_id
	};

	this.log_list.push(log);

	return {
		id: log.id,
		date_time: log.date_time
	};
}