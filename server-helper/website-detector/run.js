var config = require('./config.json')
var Syncer = require('./lib/syncer')
var json_request = require('./lib/json-request')
var work = require('./work')

var req_url = config.req_url
var log_uri = config.log_uri

json_request.url = req_url;

var syncer = new Syncer(log_uri)
syncer.id = 'head_id'
syncer.event_handler = {
	on_success: on_sync_success,
	on_failure: on_sync_failure
}
syncer.start();

function on_sync_success(syncer, result) {
	//console.log('sync success')
	if (result.log_list.length > 0) {
		console.log('sync message')
		result.log_list.forEach(function(log) {
			work(log)
		})
	}
}

function on_sync_failure(syncer) {
	console.log('sync failure')
}