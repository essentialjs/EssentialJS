module("Config Tests");

/* TODO test this with separate window loading
test('Config scripts in main HTML page', function() {
	var HTMLElement = Resolver("essential::HTMLElement::");

	equal(document.readyState,"complete","Loading of the testing page done");
	Resolver("essential::sealBody::")(document); // emulate configured behavior

	ok(document.enhanced.headSealed,"The HEAD element sealed");
	// debugger;
	var config = Resolver.config(HTMLElement("div",{id:"declared-in-head"}));
	equal(config.a,"a","declared-in-head");
	equal(config.b,"b","declared-in-head");
	var config = Resolver.config(HTMLElement("div",{id:"declared-in-body"}));
	equal(config.a,"a","declared-in-body");
	equal(config.b,"b","declared-in-body");
});
*/

test("Loading config in html",function(){
	ok(Resolver.document && Resolver.document.namespace.enhanced.config);
	var HTMLElement = Resolver("essential::HTMLElement::");

	Resolver.config(document,
		'set("logo",{"charset": "utf-8","glue":"to-other"});'+
		'declare("login",{"charset": "utf-8","position":"undefined"});'+
		'declare("launched",{"charset": "utf-8"});'
		);

// declare("launched",{"charset": "utf-8"});
// 
// 
// 

	var nil = HTMLElement("div",{ "id":"nil" },"...");
	var config = Resolver.config(nil);
	equal(config,null);

	var anchor = HTMLElement("a",{ "id":"logo" },"...");
	var config = Resolver.config(anchor);
	equal(config.charset,"utf-8");
	equal(config.glue,"to-other");

	var section = HTMLElement("section",{ "id":"login","data-role":'"position":"center","abc":"def"'},'');
	var config = Resolver.config(section);
	equal(config.position,"center");
	equal(config.abc,"def");

	var dialog = HTMLElement("div",{
		"role":"dialog",
		"data-role": 
			"'template':'#test-dialog',"+
			"'content-role':'presenter',"+
			"'content-config':{'templateId':'etp.styling.order-entry','presentationModel':'etp.MockSide'},"+
			"'inline':false"
	});
	var config = Resolver.config(dialog);
	equal(config.template,'#test-dialog');
	equal(config['content-role'],'presenter');
	deepEqual(config['content-config'],{
			'templateId':'etp.styling.order-entry',
			'presentationModel':'etp.MockSide'
		});
	equal(config['inline'],false);

});

	//TODO css like syntax for data-role

test("Application config using data-role",function() {
	ok(Resolver.document && Resolver.document.namespace.enhanced.config);

	var HTMLElement = Resolver("essential::HTMLElement::");

	var div = HTMLElement("div",{ 
		"data-role": '"from-attr":true,"attr-num":546' 
	},'<input name="username" data-role="'+ "'enhanced':true" +'">');
	var config = Resolver.config(div);
	equal(config.test,undefined);
	ok(config["from-attr"]);	
	equal(config["attr-num"],546);

	var config = Resolver.config(div.firstChild);
	ok(!config["from-attr"]);	
	ok(config["enhanced"]);
	ok(1,"malformed config info")
});

test("Application config using script",function(){
	ok(Resolver.document && Resolver.document.namespace.enhanced.config);
	var HTMLElement = Resolver("essential::HTMLElement::");

	Resolver.config(document,
		'declare("test-scripted",{"abc":"def", "from-script":true, "charset": "utf-8"});'+
		'declare("test-scripted.username",{ "default-value":"123" });'
		);

	var div = HTMLElement("div",{ id:"test-scripted" },'<input name="username">');
	var config = Resolver.config(div);
	equal(config.abc,"def");
	equal(config.test,undefined);
	ok(config["from-script"]);
	ok(typeof config["from-script"] == "boolean")

	var config = Resolver.config(div.firstChild);
	equal(config["default-value"],123);
});

test("Application config using script and data-role",function(){
	ok(Resolver.document && Resolver.document.namespace.enhanced.config);
	var HTMLElement = Resolver("essential::HTMLElement::");

	Resolver.config(document,
		'declare("test-both-ways",{"test":"test", "charset": "utf-8"});');
	var div = HTMLElement("div",{ 
		id:"test-both-ways",
		"data-role": '"from-attr":true,"attr-num":546' 
	},'<input name="username" data-role="'+ "'enhanced':true" +'">');
	var config = Resolver.config(div);
	equal(config.test,"test");
	ok(config["from-attr"]);	
	equal(config["attr-num"],546);

	var config = Resolver.config(div.firstChild);
	equal(config["enhanced"],true);
});

test("More complex data-role definitions",function() {
	ok(Resolver.document && Resolver.document.namespace.enhanced.config);

	var HTMLElement = Resolver("essential::HTMLElement::");

	var div = HTMLElement("div",{
		role: "presenter",
		"class": "criteria",
		"aria-expanded": "false",
		"data-role": "'laidout':'section','templateId':'etp.ws.search.searchpane.template',"+
				"'presentationModel':'etp.ws.search.SearchPane','presentationClass':'mainContent','glue':'left'"
	});
	var config = Resolver.config(div);
	equal(div.getAttribute("role"),"presenter");
	equal(div.getAttribute("class"),"criteria");
	equal(div.getAttribute("aria-expanded"),"false");

	deepEqual(config, {
		"laidout":"section",
		"templateId":"etp.ws.search.searchpane.template",
		"presentationModel":"etp.ws.search.SearchPane",
		"presentationClass":"mainContent",
		"glue":"left"
	});


	var div = HTMLElement("div",{},
		'<div role="presenter" class="criteria" aria-expanded="false"',
		'data-role="',
			"'laidout':'section','templateId':'etp.ws.search.searchpane.template',",
			"'presentationModel':'etp.ws.search.SearchPane','presentationClass':'mainContent','glue':'left'",
		'"></div>'
	).firstChild;
	var config = Resolver.config(div);
	equal(div.getAttribute("role"),"presenter");
	equal(div.getAttribute("class"),"criteria");
	equal(div.getAttribute("aria-expanded"),"false");

	deepEqual(config, {
		"laidout":"section",
		"templateId":"etp.ws.search.searchpane.template",
		"presentationModel":"etp.ws.search.SearchPane",
		"presentationClass":"mainContent",
		"glue":"left"
	});
	var div = HTMLElement("div",{},
		'<div role="tabpanel" ',
		'data-role="',
		"'state':'parent','tabs':{'1':'Order Details','2':'Placed Orders','3':'Order History'},'activeTab':'1'",
		'"></div>'
	).firstChild;
	var config = Resolver.config(div);
	equal(div.getAttribute("role"),"tabpanel");
	deepEqual(config, {
		"state":"parent",
		"tabs":{
			'1':'Order Details','2':'Placed Orders','3':'Order History'
		},
		"activeTab":"1"
	});
	            

});

test("Layout/laidout",function(){
	ok(Resolver.document && Resolver.document.namespace.enhanced.config);
	ok(1,"TODO config for unmatched elements skipped");

});

