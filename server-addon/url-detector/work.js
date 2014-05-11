exports = module.exports = work

var send_message = require('./send_message')
var detect_url = require('./detect_url')

function work(log) {
	//console.log(log)

	process_log(log)
}

function process_log(log) {
	if (log.action === 'delete') return

	if (log.item_type !== 'chat') return

	if (log.item.content.type !== 'text') return

	var chat_text = log.item.content.value
	chat_text = chat_text.trim()

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

	detect_url(url, {}, detect_url_cb, detect_url_cb)

	function detect_url_cb(list) {
		if (list)
			console.log(list)
		else
			console.log('failure ' + url)

		var new_content = {
			type: 'minido',
			value: {
				name: 'url',
				value: url,
				detect: list
			}
		}

		message.item.content = new_content

		send_message(message)
		
	}
}