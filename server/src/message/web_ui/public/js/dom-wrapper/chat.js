function ChatDW(dom, binding) {
	this.dom = dom;
	this.binding = binding;
}

ChatDW.prototype.set_author = function(v) {
	this.dom.querySelector('.author').textContent = v;
}

ChatDW.prototype.set_date_time = function(v) {
	this.dom.querySelector('.date-time').textContent = v;
}

ChatDW.prototype.set_face_img = function(v) {
	this.dom.querySelector('.face > img').setAttribute('src', v);
}

ChatDW.prototype.set_content = function(v) {
	var content_dom = this.dom.querySelector('.content');
	content_dom.textContent = '';
	content_dom.appendChild(v);
}

ChatDW.prototype.set_me = function(v) {
	var dom = this.dom;

	if (v && !dom.classList.contains('me')) {
		dom.classList.add('me');
	} else {
		dom.classList.remove('me');
	}
}
