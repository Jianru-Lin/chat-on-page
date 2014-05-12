exports = module.exports = send_message

var new_requester = require('./lib/crud').new_requester

function send_message(message, url) {
	url = url || send_message.url

	var requester = new_requester(message)
	requester.start().success(function() {
		console.log('send_message done !')
	})
}