var json_request_url = '/message';

// # success(res_obj)
// # failure(code, text)
function json_request(obj) {
	var text = JSON.stringify(obj);

	var xhr = new XMLHttpRequest();
	xhr.open('POST', json_request_url, true);
	xhr.onreadystatechange = onreadystatechange;
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.send(text);

	var action_link = new ActionLink();
	return action_link;

	function onreadystatechange() {
		if (xhr.readyState !== 4) {
			return;
		}

		// status code must be 200
		if (xhr.status !== 200) {
			var error = {
				code: 1,
				text: 'status code is ' + xhr.status
			};
			action_link.emit_failure(error);
			return;
		}

		// parse JSON
		try {
			var res_obj = JSON.parse(xhr.responseText);
		} catch(err) {
			var error = {
				code: 2,
				text: 'parse JSON failed, ' + err.toString()
			};
			action_link.emit_failure(error);
			return;
		}

		// success
		action_link.emit_success(res_obj);
	}
}

// # success(result)
// # failure(layer, code, text)
function request(obj) {
	var action_link = new AjaxActionLink();

	json_request(obj)
		.success(function(res_obj) {
			if (res_obj.result) {
				action_link.emit_success(res_obj.result);
			} else if (res_obj.error) {
				action_link.emit_failure(res_obj.error);
			}
		})
		.failure(function(error) {
			action_link.emit_net_err(error);
		});

	return action_link;
}

// ----- ActionLink -----

function ActionLink() {
	this.scb = undefined;
	this.fcb = undefined;
}

ActionLink.prototype.success = function(scb) {
	this.scb = scb;
	return this;
}

ActionLink.prototype.failure = function(fcb) {
	this.fcb = fcb;
	return this;
}

ActionLink.prototype.emit_success = function() {
	if (this.scb) {
		this.scb.apply(this, arguments);
	}
}

ActionLink.prototype.emit_failure = function() {
	if (this.fcb) {
		this.fcb.apply(this, arguments);
	}
}

// ----- AjaxActionLink -----

function AjaxActionLink() {
	this.scb = undefined;
	this.fcb = undefined;
	this.net_err_cb = undefined;
}

AjaxActionLink.prototype.success = function(cb) {
	this.scb = cb;
	return this;
}

AjaxActionLink.prototype.failure = function(cb) {
	this.fcb = cb;
	return this;
}

AjaxActionLink.prototype.network_error = function(cb) {
	this.net_err_cb = cb;
	return this;
}

AjaxActionLink.prototype.emit_success = function() {
	if (this.scb) {
		this.scb.apply(this, arguments);
	}
}

AjaxActionLink.prototype.emit_failure = function() {
	if (this.fcb) {
		this.fcb.apply(this, arguments);
	}
}

AjaxActionLink.prototype.emit_net_err = function() {
	if (this.net_err_cb) {
		this.net_err_cb.apply(this, arguments);
	}
}
