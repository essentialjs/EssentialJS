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

test("Layout/laidout",function(){
	ok(1,"TODO config for unmatched elements skipped");

});

