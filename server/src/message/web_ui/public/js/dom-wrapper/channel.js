function ChannelDW(dom, binding) {
	this.dom = dom;
	this.binding = binding;
}

ChannelDW.prototype.set_title = function(v) {
	this.dom.querySelector('.website-title').textContent = v;
}

ChannelDW.prototype.set_url = function(v) {
	this.dom.querySelector('.website-url').textContent = v;
}

ChannelDW.prototype.set_icon = function(v) {
	this.dom.querySelector('.website-favicon').setAttribute('src', v);
}

ChannelDW.prototype.set_count = function(v) {
	this.dom.querySelector('.website-count').textContent = v;
}

ChannelDW.prototype.highlight = function (v) {
	var dom = this.dom;

	if (v && !dom.classList.contains('current')) {
		dom.classList.add('current');
	} else {
		dom.classList.remove('current');
	}
}