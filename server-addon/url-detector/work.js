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
	var new_content = {
		type: undefined,
		value: undefined
	}

	var message = {
		uri: log.uri + '/addon/url-detector',
		action: 'update',
		item_type: 'addon/url-detector',
		item: {
			target_uri: log.uri,
			target_id: log.id,
			content: new_content
		}
	}

	detect_mime(url, function(mime) {
		console.log(mime)
		var ok = true

		if (/^image(\/|$)/i.test(mime)) {
			new_content.type = 'url:image'
			new_content.value = url
		} else if (/^text(\/|$)/i.test(mime)) {
			new_content.type = 'url:website'
			new_content.value = url
		} else {
			ok = false
		}

		if (ok) send_message(message)
	})
}