module("Config Tests");

test("Loading config in html",function(){

	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var HTMLElement = Resolver("essential::HTMLElement::");

	var ac = ApplicationConfig();

	var anchor = HTMLElement("a",{ "id":"logo" },"...");
	var config = ac.getConfig(anchor);
	equal(config.charset,"utf-8");
	equal(config.glue,"to-other");

	var section = HTMLElement("section",{ "id":"login","data-role":'"position":"center","abc":"def"'},'');
	var config = ac.getConfig(section);
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
	var config = ac.getConfig(dialog);
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

	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var HTMLElement = Resolver("essential::HTMLElement::");

	var div = HTMLElement("div",{ 
		"data-role": '"from-attr":true,"attr-num":546' 
	},'<input name="username" data-role="'+ "'enhanced':true" +'">');
	var config = ApplicationConfig().getConfig(div);
	equal(config.test,undefined);
	ok(config["from-attr"]);	
	equal(config["attr-num"],546);

	var config = ApplicationConfig().getConfig(div.firstChild);
	ok(!config["from-attr"]);	
	ok(config["enhanced"]);
	ok(1,"malformed config info")
});

test("Application config using script",function(){
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var HTMLElement = Resolver("essential::HTMLElement::");

	var div = HTMLElement("div",{ id:"test-scripted" },'<input name="username">');
	var config = ApplicationConfig().getConfig(div);
	equal(config.abc,"def");
	equal(config.test,undefined);
	ok(config["from-script"]);

	var config = ApplicationConfig().getConfig(div.firstChild);
	equal(config["default-value"],123);
});

test("Application config using script and data-role",function(){
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var HTMLElement = Resolver("essential::HTMLElement::");

	var div = HTMLElement("div",{ 
		id:"test-both-ways",
		"data-role": '"from-attr":true,"attr-num":546' 
	},'<input name="username" data-role="'+ "'enhanced':true" +'">');
	var config = ApplicationConfig().getConfig(div);
	equal(config.test,"test");
	ok(config["from-attr"]);	
	equal(config["attr-num"],546);

	var config = ApplicationConfig().getConfig(div.firstChild);
	equal(config["enhanced"],true);
});

test("More complex data-role definitions",function() {

	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var HTMLElement = Resolver("essential::HTMLElement::");

	var div = HTMLElement("div",{
		role: "presenter",
		"class": "criteria",
		"aria-expanded": "false",
		"data-role": "'laidout':'section','templateId':'etp.ws.search.searchpane.template',"+
				"'presentationModel':'etp.ws.search.SearchPane','presentationClass':'mainContent','glue':'left'"
	});
	var config = ApplicationConfig().getConfig(div);
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
	var config = ApplicationConfig().getConfig(div);
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
	var config = ApplicationConfig().getConfig(div);
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
	ok(1,"TODO config for unmatched elements skipped");

});

