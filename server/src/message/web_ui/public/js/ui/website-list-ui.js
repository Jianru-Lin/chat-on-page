/* WebsiteListUI */

function WebsiteListUI() {
	var self = this;
	self.current = undefined;
	self.on_current_changed = undefined;

	self.website_ui_list = [];
	self.url_map = {};
}

WebsiteListUI.prototype.add = function(website) {
	var self = this;

	if (!website) return;

	var website_ui = self.url_map[website.url];

	// create if not exists
	if (!website_ui) {
		website_ui = new WebsiteUI();
		self.website_ui_list.push(website_ui);
		self.url_map[website.url] = website_ui;
		// add to ui
		id('website-list').appendChild(website_ui.dom);
	}

	// update it
	website_ui.update(website);

	// if this is the only website, make it current
	if (self.website_ui_list.length === 1) {
		website_ui.current(true);
		self.current = website_ui;
	}

	website_ui.click(on_click_website);

	function on_click_website(e) {
		var website = this;

		// click current website is nothing
		if (website === self.current) return;

		if (self.current) self.current.current(false);

		website.current(true);
		self.current = website;

		// emit event
		if (self.on_current_changed) {
			self.on_current_changed(website.obj.url);
		}
	}
}

WebsiteListUI.prototype.get_by_url = function(url) {
	return this.url_map[url];
}

WebsiteListUI.prototype.get_current = function() {
	return this.current;
}

WebsiteListUI.prototype.update = function(website) {
	var self = this;

	var website_ui = self.url_map[website.url]
	
	// u can't udpate a website which not exists yet
	if (!website_ui) return;

	website_ui.update(website);
}
