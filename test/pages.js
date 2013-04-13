module("Loading main and sub pages");

// test("",function(){

// });

test("Explicit subpage definitions",function() {

	var ApplicationConfig = Resolver("essential")("ApplicationConfig");
	var appConfig = ApplicationConfig();

	var page = appConfig.page("/test/pages/a1.html",{},[
		'<html><head>', '', '</head><body>',

		'<span role="delayed" id="a"></span>',
		'<span role="early" id="b"></span>',

		'</body>'
		].join(""));

	ok(page.documentLoaded);
	ok(page.head);
	ok(page.body);
	ok(page.document);
	var descs = page.resolver("descriptors");
	ok(descs);
	ok(typeof descs.a,"object");
	ok(typeof descs.b,"object");

	//TODO alternate head + body call syntax
});


