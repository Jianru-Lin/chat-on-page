// WARNING: this program works on linux only!!

var fs = require('fs');

function HostManager() {
	this.host_file_name = '/etc/hosts';
	this.host_file_content = undefined;
	this.item_list = [];
	this.error_text = undefined;
}

HostManager.prototype.load = function() {
	var self = this;
	try {
		self.host_file_content = fs.readFileSync(self.host_file_name, {encoding: 'utf8'});
	} catch(err) {
		self.error_text = '[load] ' + err.toString();
		return false;
	}

	return parse();

	function parse() {
		var lines = self.host_file_content.split(/\n/);
		lines.forEach(function(line, line_num) {
			var line_trimed = line.trim();

			if (line_trimed[0] === '#') {
				// reserve comment line
				self.item_list.push(line);
			} else if (line_trimed.length === 0) {
				// reserve empty line
				self.item_list.push(line);
			} else {
				// parse
				var match = /(\S+)(\s+)(\S+)/.exec(line_trimed);

				if (!match) {
					// reserve unknown line
					console.log('parse failed: ' + line_trimed);
					self.item_list.push(line);
				} else {
					// parse ok
					var item = {
						ip: match[1],
						space: match[2],
						host_name: match[3]
					};

					self.item_list.push(item);
				}
			}
		});

		return true;
	}
}

HostManager.prototype.save = function() {
	var self = this;
	var text = stringify();
	try {
		fs.writeFileSync(self.host_file_name, text, {encoding: 'utf8'});
	} catch(err) {
		self.error_text = '[save] ' + err.toString();
		return false;
	}

	return true;

	function stringify() {
		var lines = [];
		self.item_list.forEach(function(item) {
			if (typeof item !== 'object') {
				lines.push(item);
				return;
			}

			var line = item.ip + item.space + item.host_name;
			lines.push(line);
		});

		return lines.join('\n');
	}
}

HostManager.prototype.remove = function(host_name) {
	var self = this;

	self.item_list = self.item_list.filter(function(item) {
		if (typeof item !== 'object') return true;
		if (item.host_name === host_name) {
			return false;
		} else {
			return true;
		}
	});

}

HostManager.prototype.add = function(host_name, ip) {
	var self = this;

	self.item_list.push({
		ip: ip,
		space: ' ',
		host_name: host_name
	});
}

HostManager.prototype.exits = function(host_name) {
	var self = this;

	var found = false;
	for (var i = 0, len = self.item_list.length; i < len; ++i) {
		var item = self.item_list[i];
		if (typeof item !== 'object') continue;
		if (item.host_name === host_name) {
			found = true;
			break;
		}
	}

	return found;
}

/* main logic */
var target_host_name = 'blackwhale.miaodeli.com';
var ip = '127.0.0.1';

var hm = new HostManager();
if (hm.load()) {
	if (hm.exits(target_host_name)) {
		hm.remove(target_host_name);
		console.log('[remove] ' + target_host_name);
	} else {
		hm.add(target_host_name, ip);
		console.log('[add] ' + ip + ' ' + target_host_name);
	}

	// save
	if (!hm.save()) {
		console.log(hm.error_text);
	}
} else {
	console.log(hm.error_text);
}