var qunit = require("qunit");

qunit.runt({
	code: {
		path: "./essential.js",
		namespace: "EssentialJS"
	},
	tests: [
		'./test/resolver.js'
	]
});