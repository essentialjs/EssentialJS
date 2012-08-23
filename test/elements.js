module('Element constructors');

test('Basic element construction',function(){
	var HTMLElement = Resolver("essential")("HTMLElement");

	var div = HTMLElement("div",{ "class":"abc"},"<span>","abc","</span>");
	equal(div.tagName,"DIV");
	equal(div.className,"abc");
	equal(div.innerHTML.toLowerCase(),"<span>abc</span>");

	var span = HTMLElement("span",{ "id":"def"})
	equal(span.id,"def");
})

test('Script element construction',function(){
	var HTMLScriptElement = Resolver("essential")("HTMLScriptElement");

	var script = HTMLScriptElement({ "class":"abc"});
	equal(script.tagName,"SCRIPT");
	equal(script.className,"abc");

	var script = HTMLScriptElement({ "src":"abc/script.js"});
	equal(script.tagName,"SCRIPT");
	equal(script.getAttribute("src"),"abc/script.js");
	//equal(script.src,"abc/script.js");

})

function createDocument(html) {
	// var doc = document.implementation.createDocument('','',
	// 	document.implementation.createDocumentType('html','',''));
	var doc;
	if (document.implementation && document.implementation.createHTMLDocument) {
		doc = document.implementation.createHTMLDocument("");
	} else  if (window.ActiveXObject) {
		doc = new ActiveXObject("htmlfile");
	} else {
		return document.createElement("DIV");// dummy default
	}

	if (typeof html == "object" && typeof html.length == "number") {
		html = html.join("");
	}
	doc.documentElement.innerHTML = html;

	return doc;
}

test('Enhanced element config',function(){
	ok(true,"TODO configure just using data-role");
	ok(true,"TODO configure just using application/config");
	ok(true,"TODO configure combining a base from application/config and a mixin using data-role");
});

test('Enhance element early or delayed',function() {
	var DocumentRoles = Resolver("essential")("DocumentRoles");

	var handlers = {
		"enhance": {
			"early": sinon.stub(),
			"delayed": sinon.stub()
		},
		"layout": {
			"early": sinon.stub(),
			"delayed": sinon.stub()
		},
		"discard": {
			"early": sinon.stub(),
			"delayed": sinon.stub()
		}
	};

	var doc = createDocument([
		"<body>",
		'<span role="delayed" id="a"></span>',
		'<span role="early" id="b"></span>',
		"</body>"
		]);
	handlers.enhance.delayed.returns(false);
	var dr = DocumentRoles(handlers,doc);

	var sinonConfig = {}; //TODO config for the sinon elem

	equal(handlers.enhance.early.callCount,1);
	equal(handlers.enhance.delayed.callCount,1);
	equal(handlers.layout.early.callCount,0);
	equal(handlers.discard.early.callCount,0);

	ok(handlers.enhance.early.alwaysCalledWith(doc.getElementById("b"),"early"))
	//TODO equal(handlers.enhance.early.args[0][2],sinonConfig);

	ok(true,"TODO additional handlers, enhance call after initial round")

	handlers.enhance.additional = sinon.stub();
	handlers.enhance.delayed.returns({});
	dr._enhance_descs();
	equal(handlers.enhance.early.callCount,1,"enhance should be completed already");
	equal(handlers.enhance.delayed.callCount,2);
	equal(handlers.layout.early.callCount,0);
	equal(handlers.discard.early.callCount,0);


	//TODO all with roles are enhanced
	//TODO discard called for all enhanced

	DocumentRoles.info.constructors[-1].discarded(dr); // emulate singleton teardown
	equal(handlers.enhance.early.callCount,1);
	equal(handlers.enhance.delayed.callCount,2);
	equal(handlers.layout.early.callCount,0);
	equal(handlers.discard.early.callCount,1);
	equal(handlers.discard.delayed.callCount,1);
});

//TODO layout and discard are optional handlers

test('Enhancing DocumentRoles with builtin handlers',function(){
	var DocumentRoles = Resolver("essential")("DocumentRoles");

	var handlers = {
		"enhance": {
			"dialog": DocumentRoles.enhance_dialog,
			"navigation": DocumentRoles.enhance_toolbar,
			"spinner": DocumentRoles.enhance_spinner,
			"application": DocumentRoles.enhance_application
		},
		"layout": {
			"dialog": DocumentRoles.layout_dialog,
			"navigation": DocumentRoles.layout_toolbar,
			"spinner": DocumentRoles.layout_spinner,
			"application": DocumentRoles.layout_application
		},
		"discard": {
			"dialog": DocumentRoles.discard_dialog,
			"navigation": DocumentRoles.discard_toolbar,
			"spinner": DocumentRoles.discard_spinner,
			"application": DocumentRoles.discard_application
		}
	};

	var doc = createDocument([
		"<body>",
		
		'<span role="navigation">',
		'<button name="a"></button>',
		'</span>',

		"</body>"
		]);
	var dr = DocumentRoles(handlers,doc);


	dr._enhance_descs();
	// equal(handlers.enhance.sinon.callCount,0,"enhance should be completed already");
	// equal(handlers.layout.sinon.callCount,0);
	// equal(handlers.discard.sinon.callCount,0);


	// Submit buttons turned into ordinary
	var buttons = doc.getElementsByTagName("BUTTON");
	for(var i=0,button; button=buttons[i]; ++i) {
		equal(button.type,"button");
	}

	//TODO _resize_descs
	//TODO _layout_descs

	//TODO all with roles are enhanced
	//TODO discard called for all enhanced

	DocumentRoles.info.constructors[-1].discarded(dr); // emulate singleton teardown
	// equal(handlers.enhance.sinon.callCount,1);
	// equal(handlers.layout.sinon.callCount,0);
	// equal(handlers.discard.sinon.callCount,1);
});
