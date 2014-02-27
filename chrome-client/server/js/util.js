function id(id_value, cb) {
	var e = document.getElementById(id_value);
	if (e && cb) {
		cb (e);
	}
	return e;
}

function all(selector, cb) {
	var list = document.querySelectorAll(selector);
	if (cb) {
		operate(list, cb);
	}
	return list;

	function operate(list, cb) {
		if (!list || list.length < 1) return;
		for (var i = 0, len = list.length; i < len; ++i) {
			cb(list[i]);
		}
	}	
}

function get_template(name) {
	var query = '.template .' + name;
	var e = document.querySelector(query);

	if (!e) return undefined;

	// copy element and return
	var new_e = e.cloneNode(true);
	return new_e;
}

function gravatar(email) {
	email = email || '';
	email = email.toLowerCase();
	var hash = md5(email);
	return 'http://www.gravatar.com/avatar/' + hash + '?s=50&d=identicon';
}

function on_click(e, listener) {
	if (!e || !listener) return;
	e.addEventListener('click', listener);
}

function on_keydown(e, listener) {
	if (!e || !listener) return;
	e.addEventListener('keydown', listener);
}

function on_keyup(e, listener) {
	if (!e || !listener) return;
	e.addEventListener('keyup', listener);
}

function on_storage(e, listener) {
	if (!e || !listener) return;
	e.addEventListener('storage', listener);	
}

function reached_bottom(e) {
	var de = e || document.documentElement;
	var bd = e || document.body;

	// no scroll bar 
	if (de.scrollHeight <= de.clientHeight) {
		return true;
	}

	if (bd.scrollTop + de.clientHeight === de.scrollHeight) {
		return true;
	}

	return false;
}