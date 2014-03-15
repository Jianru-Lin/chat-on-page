exports = module.exports = IdList;

var KeyList = require('./key-list.js');

// ----- IdList -----

function IdList() {
	var self = this;
	self.next_id = 0;
	self.key_list = new KeyList();
}

IdList.prototype.push = function(element) {
	var self = this;
	element.id = self.next_id++;
	return self.key_list.push(element.id, element);
}

IdList.prototype.get = function(id) {
	var self = this;
	return self.key_list.get(id);
}

IdList.prototype.indexOf = function(i) {
	var self = this;
	return self.key_list.indexOf(i);
}

IdList.prototype.remove = function(id) {
	var self = this;
	return self.key_list.remove(id);
}

IdList.prototype.length = function() {
	var self = this;
	return self.key_list.length();
}

IdList.prototype.clear = function() {
	var self = this;
	self.next_id = 0;
	self.key_list.clear();
}

IdList.prototype.save = function() {
	var self = this;

	var obj = {
		next_id: self.next_id,
		key_list: self.key_list.save()
	};

	return obj;
}

IdList.prototype.load = function(obj) {
	var self = this;

	self.clear();

	if (!obj) return;

	self.next_id = obj.next_id;
	self.key_list = new KeyList();

	if (obj.key_list) {
		self.key_list.load(obj.key_list);
	}
}