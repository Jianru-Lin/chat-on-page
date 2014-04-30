exports = module.exports = LogManagerTree;

var parse_url = require('url').parse;
var LogManager = require('./log-manager');

function LogManagerTree() {
	this.uri_map = {};
}

LogManagerTree.prototype.find_or_create = function(uri) {
	var uri_obj = parse_url(uri);
	var protocol_and_host = uri_obj.protocol + '//' + 
							uri_obj.host;
	var pathname = uri_obj.pathname;

	return this._find_or_create(protocol_and_host, pathname);
}

LogManagerTree.prototype._find_or_create = function(protocol_and_host, pathname) {
	var uri = protocol_and_host + pathname;
	var log_manager = this.uri_map[uri];
	if (log_manager) return log_manager;

	// create

	log_manager = new LogManager(uri);
	this.uri_map[uri] = log_manager;

	var parent_pathname = parent_pathname_of(pathname);
	if (parent_pathname !== undefined) {
		var parent_log_manager = this._find_or_create(protocol_and_host, parent_pathname);
		log_manager.parent = parent_log_manager;
	}

	console.log('[_find_or_create] create: ' + uri);

	return log_manager;

	function parent_pathname_of(pathname) {
		if (!pathname) return undefined;
		for (var i = pathname.length-1; i >= -1; --i) {
			if (pathname[i] === '/') return pathname.substring(0, i);
		}
	}
}