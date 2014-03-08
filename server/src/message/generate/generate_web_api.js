exports.generate_web_api = generate_web_api;

var fs = require('fs');
var path = require('path');

var output_file_name = path.resolve(__dirname, '../web_ui/public/js', 'web-api.js');
var api_list = [];

function generate_web_api() {
	if (!api_list || api_list.length < 1) return;

	var text_block_list = [];

	api_list.forEach(function(api) {
		var text_block = 'function ' + api.name + make_arg_list(api) + ' {\n';
		text_block += make_body(api) + '\n';
		text_block += '}';

		text_block_list.push(text_block);
	});

	var text = text_block_list.join('\n\n');

	fs.writeFileSync(output_file_name, text, {encoding: 'utf8'});

}

function make_arg_list(api) {
	return '(' + api.args.join(', ') + ')';
}

function make_body(api) {
	var arg_list = [];
	api.args.forEach(function(arg) {
		arg_list.push(arg + ': ' + arg);
	});

	var obj_text = '{action: \'${action}\', args: {${args}}}';
	obj_text = obj_text.replace('${action}', api.name).replace('${args}', arg_list.join(', '));

	return '\t' + 'return request(' + obj_text + ');';
}
