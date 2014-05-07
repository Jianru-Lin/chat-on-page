exports = module.exports = work

var send_message = require('./send_message')
var detect_mime = require('./detect_mime')

function work(log) {
	//console.log(log)

	process_log(log)
}

function process_log(log) {
	if (log.action === 'delete') return

	if (log.item_type !== 'chat') return

	if (log.item.content.type !== 'text') return

	var chat_text = log.item.content.value

	if (!/^http(s)?:\/\//i.test(chat_text)) return

	var url = chat_text

	var message = {
		uri: log.uri + '/addon/url-detector',
		action: 'update',
		item_type: log.item_type,
		target_uri: log.uri,
		target_id: log.id,
		item: log.item
	}

	detect_mime(url, function(mime) {
		console.log(mime)

		var new_content = {
			type: 'minido',
			value: {
				name: 'url',
				mime: mime,
				value: url
			}
		}

		message.item.content = new_content

		send_message(message)
	})
}