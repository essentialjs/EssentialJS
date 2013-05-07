module("Loading main and sub pages");

// test("",function(){

// });

test("Document Creations",function() {
	var createHTMLDocument = Resolver("essential::createHTMLDocument")();

	var doc = createHTMLDocument('<!DOCTYPE html><html><head id="a1" attr="a1"></head><body id="a2" attr="a2"></body></html>');
	equal(doc.head.id,"a1");
	equal(doc.head.getAttribute("attr"),"a1");
	equal(doc.body.id,"a2");
	equal(doc.body.getAttribute("attr"),"a2");

	var doc = createHTMLDocument("",'<body id="a2" attr="a2"></body>');
	equal(doc.body.id,"a2");
	equal(doc.body.getAttribute("attr"),"a2");

	ok(1,"createHTMLDocument head,body");
	//TODO test the construction in IE
});

test("Explicit subpage definitions",function() {

	var ApplicationConfig = Resolver("essential")("ApplicationConfig");
	var appConfig = ApplicationConfig();

	var page = appConfig.page("/test/pages/a1.html",{},[
		'<html><head id="10">', '', '</head><body id="11">',

		'<span role="delayed" id="a"></span>',
		'<span role="early" id="b"></span>',

		'</body>'
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

	//TODO alternate head + body call syntax
});


