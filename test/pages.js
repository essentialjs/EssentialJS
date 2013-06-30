module("Loading main and sub pages");

// test("",function(){

// });

test("Explicit subpage definitions",function() {

	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::");
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

	for(var id in descs) {
		var desc = descs[id];
		equal(desc,EnhancedDescriptor.all[id]);
	}

	page.destroy();

	var page = appConfig.page("/test/pages/a2.html",{},[
		'<span role="delayed" id="a"></span>',
		'<span role="early" id="b"></span>',
		''
		].join(""));

	ok(page.documentLoaded);

	//TODO alternate head + body call syntax

	page.destroy();
});

test("Apply/unapply body",function() {
	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::");
	var maintainedElements = Resolver("essential::maintainedElements::");
	var sizingElements = Resolver("essential::sizingElements::");
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var appConfig = ApplicationConfig();

	var page = appConfig.page("/test/pages/a3.html",{},[
		'<span role="delayed" id="a"></span>',
		'<span role="early" id="b"></span>',
		''
		].join(""));

	ok(page.documentLoaded);

	var descs = page.resolver("descriptors");
	for(var id in descs) {
		var desc = descs[id];
		equal(EnhancedDescriptor.all[id],desc);
		ok(desc.el.id == "a" || desc.el.id == "b");
		equal(maintainedElements[id],undefined);
		equal(sizingElements[id],undefined);
		equal(EnhancedDescriptor.unfinished[id],undefined);
	}

	Resolver("page::enabledRoles::")["delayed"] = true;
	Resolver("page::enabledRoles::")["early"] = true;
	page.applyBody();
	for(var id in descs) {
		var desc = descs[id];
		equal(EnhancedDescriptor.all[id],desc);
		ok(desc.el.id == "a" || desc.el.id == "b");
		// equal(maintainedElements[id],desc);
		// equal(sizingElements[id],desc);
		//TODO consider if we should test enhance here
	}

	page.unapplyBody();
	for(var id in descs) {
		var desc = descs[id];
		equal(EnhancedDescriptor.all[id],desc);
		ok(desc.el.id == "a" || desc.el.id == "b");
		equal(maintainedElements[id],undefined);
		equal(sizingElements[id],undefined);
	}

	page.destroy();
})
