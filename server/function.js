var fs = require('fs');
var path = require('path');

var cwd = process.cwd();
var name = process.argv[2];

if (!name) {
	usage();
} else if (check(name)) {
	create(name);
}

function usage() {
	console.log('usage:');
	console.log('node function.js name');
}

function check(name) {
	var filename = path.resolve(cwd, name + '.js');
	if (fs.existsSync(filename)) {
		console.log('file exits already: ' + filename);
		// open it with default text editor
		require('child_process').exec('xdg-open "' + filename + '"');
		return false;
	} else {
		return true;
	}
}

function create(name) {
	var template = 'exports.${name} = ${name};\n';
	template += '\n';
	template += 'function ${name}() {\n';
	template += '\n';
	template += '}\n';

	var text = template.replace(/\${name}/g, name);
	var filename = path.resolve(cwd, name + '.js');
	fs.writeFileSync(filename, text, {encoding: 'utf8'});

	console.log('done');

	console.log(filename);
	// open it with default text editor
	require('child_process').exec('xdg-open "' + filename + '"');
}