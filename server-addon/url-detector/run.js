var config = require('./config.json')
var sync = require('./lib/syncer').sync
var work = require('./work')

var req_url = config.req_url
var log_uri = config.log_uri

// global config
require('./lib/json-request').url = req_url
require('./send_message').url = req_url

syncer = sync(log_uri, 0, 30, on_sync_success, on_sync_failure)
syncer.start()

function on_sync_success(syncer, result) {
	//console.log('sync success')
	if (result.log_list.length > 0) {
		//console.log('sync message')
		result.log_list.forEach(function(log) {
			work(log)
		})
	}
}

function on_sync_failure(syncer) {
	console.log('sync failure')
}