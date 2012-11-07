module("Config Tests");

test("Application config using script",function(){
	var ApplicationConfig = Resolver("essential")("ApplicationConfig");
	var HTMLElement = Resolver("essential")("HTMLElement");

	var div = HTMLElement("div",{ id:"test-scripted" },'<input name="username">');
	var config = ApplicationConfig().getConfig(div);
	equal(config.abc,"def");
	equal(config.test,undefined);
	ok(config["from-script"]);

	var config = ApplicationConfig().getConfig(div.firstChild);
	equal(config["default-value"],123);
});

test("Application config using script and data-role",function(){
	var ApplicationConfig = Resolver("essential")("ApplicationConfig");
	var HTMLElement = Resolver("essential")("HTMLElement");

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

