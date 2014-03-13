/* WebsiteUI */

function WebsiteUI() {
	var self = this;
	self.obj = undefined;
	self.dom = get_template('website');
	self.on_click = undefined;

	self.dom.addEventListener('click', on_click_dom);

	function on_click_dom(e) {
		if (self.on_click) self.on_click(self)
	}
}

WebsiteUI.prototype.update = function(obj) {
	var self = this;
	if (!obj) return;

	if (!self.obj) {
		self.obj = obj;
	} else {
		override(obj, self.obj);
	}

	var t = self.dom;

	var website = self.obj;

	website.title = website.title || '未知站点';

	// favicon
	var website_favicon = t.querySelector('.website-favicon');
	if (!website_favicon.getAttribute('src')) {
		website_favicon.setAttribute('src', website.url + '/favicon.ico');
		website_favicon.onerror = function(e) {
			var favicon = e.target;
			favicon.onerror = null;
			//favicon.remove();
		}
	}

	// count
	var count = t.querySelector('.website-count');
	count.textContent = website.count|| 0 ;

	// title
	var website_title = t.querySelector('.website-title');
	website_title.textContent = website.title;
	website_title.setAttribute('title', website.title);

	// url
	t.querySelector('.website-url').textContent = website.url;

	return t;
}

WebsiteUI.prototype.current = function(v) {
	var self = this;

	if (!self.dom) return false;

	if (v !== true && v !== false) {
		return self.dom.classList.contains('current');
	}

	if (v) {
		if (!self.dom.classList.contains('current')){
			self.dom.classList.add('current');
		}
		return true;
	} else {
		self.dom.classList.remove('current');
		return false;
	}
}

WebsiteUI.prototype.click = function(cb) {
	self.on_click = cb;
}