var _is_chrome_ext = ((typeof chrome !== 'undefined') && (typeof chrome.extension !== 'undefined'));

function empty() {

}

function id(id_value, cb) {
	var e = document.getElementById(id_value);
	if (e && cb) {
		cb (e);
	}
	return e;
}

function first(selector, cb) {
	var e = document.querySelector(selector);
	if (e && cb) {
		cb(e);
	}
	return e;
}

function all(selector, cb) {
	var list = document.querySelectorAll(selector);
	if (list && cb) {
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
	return 'https://secure.gravatar.com/avatar/' + hash + '?s=50&d=identicon';
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

function on_change(e, listener) {
	if (!e || !listener) return;
	e.addEventListener('change', listener);
}

function on_storage(e, listener) {
	if (!e || !listener) return;
	e.addEventListener('storage', listener);	
}

function has_class(e, className) {
	return e.classList.contains(className);
}

function add_class(e, className) {
	if (!has_class(e, className)) {
		e.classList.add(className)
	}
}

function remove_class(e, className) {
	e.classList.remove(className)
}

function toggle_class(e, className) {
	if (!e || !className) return;
	if (e.classList.contains(className)) {
		e.classList.remove(className);
	} else {
		e.classList.add(className);
	}
}

function reached_bottom() {
	var e = document.body;

	if (navigator && (/firefox/i.test(navigator.userAgent))) {
		e = document.documentElement;
	}

	/*
	var scrollTop = e.scrollTop;
	var bd_clientHeight = e.clientHeight;
	var bd_scrollHeight = e.scrollHeight;
	var v = bd_scrollHeight - bd_clientHeight - scrollTop === 0;

	console.log('scrollTop: ' + scrollTop)
	console.log('bd_clientHeight: ' + bd_clientHeight)
	console.log('bd_scrollHeight: ' + bd_scrollHeight)
	console.log('v: ' + v)

	return v;
	*/
	
	var v = true;
	var old_val = e.scrollTop;
	e.scrollTop += 100;
	if (e.scrollTop !== old_val) {
		v = false;
		e.scrollTop = old_val;
	}
	return v;

	/*
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
	*/
}

function smart_scroll(container, view_target, cb) {
	// smart scroll start
	var need_scroll = reached_bottom(container);
	cb();
	if (need_scroll) {
		if (view_target.scrollIntoViewIfNeeded) view_target.scrollIntoViewIfNeeded();
		else if (view_target.scrollIntoView) view_target.scrollIntoView();
	}
}

function bring_into_view(target) {
	if (target.scrollIntoViewIfNeeded) target.scrollIntoViewIfNeeded();
	else if (target.scrollIntoView) target.scrollIntoView();
}

function override(src, dest) {
	for (var name in src) {
		dest[name] = src[name];
	}
}

function format_date_time(date_time_text) {
	var d = new Date(date_time_text);
	var year = d.getFullYear();
	var month = d.getMonth() + 1;
	var date = d.getDate();
	var hour = d.getHours();
	var min = d.getMinutes();
	var sec = d.getSeconds();

	// compare to current
	var current = new Date();
	var current_year = current.getFullYear();
	var current_month = current.getMonth() + 1;
	var current_date = current.getDate();

	if (year !== current_year) {
		return long_format();
	} else if (month !== current_month || date !== current_date) {
		return short_format();
	} else {
		return mini_format();
	}

	function fill(t) {
		return t > 9 ? t.toString() : '0' + t;
	}

	function long_format() {
		var text = year + '-' + fill(month) + '-' + fill(date) + ' ' + fill(hour) + ':' + fill(min) + ':' + fill(sec);
		return text;
	}

	function short_format() {
		var text = fill(month) + '-' + fill(date) + ' ' + fill(hour) + ':' + fill(min) + ':' + fill(sec);
		return text;
	}

	function mini_format() {
		var text = fill(hour) + ':' + fill(min) + ':' + fill(sec);
		return text;
	}
}

function is_chrome_extension() {
	return _is_chrome_ext;
}

function get_protocol_host_port(url) {
	var match = /^((http|https):\/\/[^\/]+)(\/|$)/i.exec(url);
	if (!match) return undefined;
	else return match[1];
}

// # cb(url, title)
function get_current_location(cb) {
	var url, title;

	if (typeof chrome !== 'undefined' && chrome.extension) {
		chrome.extension.sendMessage({action: 'query'}, function(res) {
			var info = res.success;
			cb(info.url, info.title);
		});
	} else {
		if (window.parent != window) {
			url = document.referrer;
			title = undefined;
		} else {
			url = location.href;
			title = document.title;
		}
		cb(url, title);
	}
}

function to_array(v) {
	var array = [];
	for (var i = 0, len = v.length; i < len; ++i) {
		array.push(v[i]);
	}
	return array;
}

function get_local_obj(key) {
	if (window.localStorage) {
		var obj_text = localStorage.getItem(key)
		if (obj_text) {
			return JSON.parse(obj_text)
		}
	}
}

function set_local_obj(key, obj) {
	if (window.localStorage) {
		if (typeof obj === 'object') {
			var obj_text = JSON.stringify(obj)
		}
		return localStorage.setItem(key, obj_text)
	}
}

function remove_local_obj(key) {
	if (window.localStorage) {
		return localStorage.removeItem(key)
	}
}

function redirect_to(url) {
	window.location.href = url
}
