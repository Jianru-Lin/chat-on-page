function ChatDW(dom, binding) {
	this.dom = dom;
	this.binding = binding;
}

ChatDW.prototype.set_author = function(v) {
	if (!v) return;
	this.dom.querySelector('.name').textContent = v.name;
	this.dom.querySelector('.email').textContent = v.email;
	this.dom.querySelector('.face > img').setAttribute('src', gravatar(v.email));
}

ChatDW.prototype.set_date_time = function(v) {
	this.dom.querySelector('.date-time').textContent = v;
}

ChatDW.prototype.set_content = function(v) {
	var content_dom = this.dom.querySelector('.content');
	content_dom.textContent = '';
	content_dom.appendChild(v);
}

ChatDW.prototype.set_me = function(v) {
	var dom = this.dom;

	if (v) {
		add_class(dom, 'me')
	}
	else {
		remove_class(dom, 'me')
	}
}

ChatDW.prototype.set_additional = function(v) {
	var dom = this.dom;

	if (v) {
		add_class(dom, 'additional')
	}
	else {
		remove_class(dom, 'additional')
	}
}