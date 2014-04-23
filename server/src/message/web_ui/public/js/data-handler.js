// Cache Layer

function DataHandler() {
	// TODO
}

// chat

DataHandler.prototype.create_chat = function(opt) {
	return (new CreateChat(opt)).start();
}

DataHandler.prototype.retrive_chat = function(opt) {
	return (new RetriveChat(opt)).start();
}

DataHandler.prototype.update_chat = function(opt) {
	return (new UpdateChat(opt)).start();
}

DataHandler.prototype.delete_chat = function(opt) {
	return (new DeleteChat(opt)).start();
}

// channel

DataHandler.prototype.create_channel = function(opt) {
	return (new CreateChannel(opt)).start();
}

DataHandler.prototype.retrive_channel = function(opt) {
	return (new RetriveChannel(opt)).start();
}

DataHandler.prototype.update_channel = function(opt) {
	return (new UpdateChannel(opt)).start();
}

DataHandler.prototype.delete_channel = function(opt) {
	return (new DeleteChannel(opt)).start();
}


// user

DataHandler.prototype.create_user = function(opt) {
	return (new CreateUser(opt)).start();
}

DataHandler.prototype.retrive_user = function(opt) {
	return (new RetriveUser(opt)).start();
}

DataHandler.prototype.update_user = function(opt) {
	return (new UpdateUser(opt)).start();
}

DataHandler.prototype.delete_user = function(opt) {
	return (new DeleteUser(opt)).start();
}

// token

DataHandler.prototype.create_token = function(opt) {
	return (new CreateToken(opt)).start();
}

DataHandler.prototype.retrive_token = function(opt) {
	return (new RetriveToken(opt)).start();
}

DataHandler.prototype.update_token = function(opt) {
	return (new UpdateToken(opt)).start();
}

DataHandler.prototype.delete_token = function(opt) {
	return (new DeleteToken(opt)).start();
}
