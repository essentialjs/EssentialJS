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
		doc = document.implementation.createHTMLDocument();
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

test('Enhancing DocumentRoles',function(){
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
	var buttons = doc.getElementsByTagName("BUTTON");
	for(var i=0,button; button=buttons[i]; ++i) {
		equal(button.type,"button");
	}

	//TODO all with roles are enhanced
	//TODO discard called for all enhanced
});
