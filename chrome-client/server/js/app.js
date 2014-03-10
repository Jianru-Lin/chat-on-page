var app;

onload = function() {
	app = new App();
	app.start();
}

// ----- AutoQueryManager -----

function AutoQueryManager() {
	var self = this;
	
	self.last_chat_id = undefined;
	self.last_website_id = undefined;

	self.on_receive = undefined;
}

AutoQueryManager.prototype.start = function() {
	var self = this;

	query();

	function query() {

		var req_obj = {
			message_list: []
		};

		req_obj.message_list.push({
			type: 'query_chat',
			last_id: self.last_chat_id
		});

		req_obj.message_list.push({
			type: 'query_website',
			last_id: self.last_website_id
		});

		json_request(req_obj)
			.success(function(res_obj) {
				var message_list = res_obj.message_list;
				if (!message_list) return;

				message_list.forEach(function(message) {
					if (message.type === 'chat') self.last_chat_id = message.id;
					else if (message.type === 'website') self.last_website_id = message.id;
				});

				if (self.on_receive) {
					self.on_receive(message_list);
				}

				setTimeout(query, 1000);
			})
			.failure(function(error) {
				console.log(error);
				setTimeout(query, 1000);
			});
	}
}

// ----- App -----

function App() {
	var self = this;

	self.ui = new UI();
	self.ui.on('send', message_from_ui);

	self.message_manager = new MessageManager();
	self.message_manager.on_receive = message_from_server;

	self.auto_query_manager = new AutoQueryManager();
	self.auto_query_manager.on_receive = message_from_server;
	self.auto_query_manager.start();

	// message handler
	function message_from_server(message_list) {
		self.ui.show(message_list);
	}

	function message_from_ui(message) {
		self.message_manager.send(message);
	}
}

App.prototype.start = function() {
}