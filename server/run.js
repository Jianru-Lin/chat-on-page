var fs = require('fs');
var resolve = require('path').resolve;

// get current working directory
//var cwd = resolve(process.cwd());
var cwd = resolve(__dirname, 'src');

// enum all the directories that will be loaded
var dir_list = [
	cwd, 
	resolve(cwd, 'message'),
	resolve(cwd, 'message/generate')
];

// do load
dir_list.forEach(function(dir) {
	load(dir);
});

// run global start function
start();

function load(dir) {
	var list = fs.readdirSync(dir);

	list = list.filter(function(filename) {
		return /\.js$/.test(filename);
	});

	list.forEach(function(filename) {
		var fullname = resolve(dir, filename);
		var file_exports = require(fullname);

		for (var prop_name in file_exports) {
			global[prop_name] = file_exports[prop_name];
			console.log('[load] ' + prop_name);
		}
	});
}