function Noticer() {
	var self = this;

	self.last_log = undefined;
	
	setInterval(function() {
		if (!self.last_log) return;
		self.refresh(self.last_log);
	}, 1000);
}

Noticer.prototype.notice = function(log) {
	if (log.action === 'create' && log.item_type === 'chat') {
		this.last_log = log;
		this.refresh(log);
	}
}

Noticer.prototype.refresh = function(log) {
	document.title = log.item.from.author.name + ' ' + format_date_time(log.date_time);
}