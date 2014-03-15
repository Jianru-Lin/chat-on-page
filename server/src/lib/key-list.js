exports = module.exports = KeyList;

// ----- KeyList -----

function KeyList() {
	var self = this;
	self.first = {next: undefined};
	self.last = self.first;
	self.map = {};
	self._length = 1;
}

KeyList.prototype.push = function(key, value) {
	var self = this;

	var node = {
		key: key,
		value: value,
		next: undefined,
		prev: undefined
	};

	node.prev = self.last;
	self.last.next = node;
	self.last = node;

	self.map[key] = node;
	
	++self._length;
}

KeyList.prototype.get = function(key) {
	var self = this;

	if (key in self.map) {
		var node = self.map[key];
		return node.value;
	} else {
		return undefined;
	}
}

KeyList.prototype.indexOf = function(i) {
	var self = this;

	if (i < 0 || i > self._length - 2) return undefined;

	var node = self.first;
	i += 2;
	while (--i) {
		node = node.next;
	}
	return node.value;
}

KeyList.prototype.remove = function(key) {
	var self = this;

	// return object
	if (!(key in self.map)) return;

	var node = self.map[key];
	delete self.map[key];

	if (self.last === node) {
		self.last = node.prev;
	}

	if (node.prev) {
		node.prev.next = node.next;
	}

	if (node.next) {
		node.next.prev = node.prev;
	};

	--self._length;

	node.next = undefined;
	node.prev = undefined;
	return node.value;
}

KeyList.prototype.length = function() {
	var self = this;
	return self._length - 1;
}

KeyList.prototype.clear = function() {
	var self = this;
	self.first = {next: undefined};
	self.last = self.first;
	self.map = {};
	self._length = 1;
}

KeyList.prototype.load = function(obj) {
	var self = this;

	// clear current data
	self.clear();

	if (!obj || !obj.node_list || obj.node_list.length < 1) return;

	var prev_node = self.first;

	obj.node_list.forEach(function(data_node) {
		var node = {
			key: data_node.key,
			value: data_node.value,
			prev: prev_node,
			next: undefined
		};

		prev_node.next = node;

		self.map[node.key] = node;
		self._length++;

		prev_node = node;
	});

	self.last = prev_node;
}

KeyList.prototype.save = function() {
	var self = this;

	var obj = {
		node_list: []
	};

	for (var node = self.first.next; node; node = node.next) {
		var node_copy = {
			key: node.key,
			value: node.value
		};
		obj.node_list.push(node_copy);
	}

	return obj;
}