/* ChatUI */

function ChatUI() {
	var self = this;
	self.obj = undefined;
	self.dom = get_template('chat-item');
}

ChatUI.prototype.update = function(obj, options) {
	var self = this;
	var dom = self.dom;

	if (!self.obj) {
		self.obj = obj;
	} else {
		override(obj, self.obj);
	}

	obj = self.obj;
	options = options || {};

	if (options.additional) {
		if (!dom.classList.contains('additional')) {
			dom.classList.add('additional');
		}
	} else {
		dom.classList.remove('additional');
	}

	dom.querySelector('.author').textContent = obj.from.name;
	dom.querySelector('.date-time').textContent = format_date_time(obj.date_time);
	dom.querySelector('.content').textContent = obj.content.value;
	dom.querySelector('.face > img').setAttribute('src', gravatar(obj.from.name));

	self.me(obj.is_me);
}

ChatUI.prototype.me = function(v) {
	var self = this;
	var dom = self.dom;
	if (!dom) return false;

	if (v !== true && v !== false) {
		return dom.classList.contains('me');
	}

	if (v) {
		if (!dom.classList.contains('me')) {
			dom.classList.add('me');
		}
		return true;
	} else {
		dom.classList.remove('me');
		return false;
	}
}