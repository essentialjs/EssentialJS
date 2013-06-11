module("Loading main and sub pages");

// test("",function(){

// });

test("Explicit subpage definitions",function() {

	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var appConfig = ApplicationConfig();

	var page = appConfig.page("/test/pages/a1.html",{},[
		'<html><head id="10">', '', '</head><body id="11">',

		'<span role="delayed" id="a"></span>',
		'<span role="early" id="b"></span>',

		'</body></html>'
		].join(""));

	ok(page.documentLoaded);
	ok(page.head);
	equal(page.head.id,"10");
	ok(page.body);
	equal(page.body.id,"11");
	ok(page.document);
	var descs = page.resolver("descriptors");
	ok(descs);
	ok(typeof descs.a,"object");
	ok(typeof descs.b,"object");

	var page = appConfig.page("/test/pages/a2.html",{},[
		'<span role="delayed" id="a"></span>',
		'<span role="early" id="b"></span>',
		''
		].join(""));

	ok(page.documentLoaded);

	//TODO alternate head + body call syntax
});

