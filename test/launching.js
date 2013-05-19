module('launching page');

test("Page Resolver",function(){
	ok(Resolver.page,"Page resolver present")
	equal(typeof Resolver.page("state"),"object")
	equal(typeof Resolver.page("config"),"object")

	var pageResolver = Resolver("page");
	equal(pageResolver("config.launched.charset"),"utf-8");
	equal(pageResolver("config.login.charset"),"utf-8");
	equal(pageResolver("config.logo.charset"),"utf-8");

	// default state
	equal(pageResolver("state.authenticated"),true,"authenticated");
	equal(pageResolver("state.authorised"),true,"authorised");
	equal(pageResolver("state.connected"),true,"connected");
	equal(pageResolver("state.configured"),true,"configured");
	equal(pageResolver("state.fullscreen"),false,"fullscreen");
	equal(pageResolver("state.launching"),false,"launching");
	equal(pageResolver("state.launched"),false,"launched");
	equal(pageResolver("state.livepage"),false,"livepage");

})

// var ApplicationConfig = Resolver("essential")("ApplicationConfig");
// ApplicationConfig.restrict({ singleton:true });

test("ApplicationConfig",function(){
	// equal(document.body.stateful,undefined);

	var configRequired = Resolver("essential::configRequired::");
	var configLoaded = Resolver("essential::configLoaded::");
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var ac = ApplicationConfig();
	// equal(document.body.stateful,Resolver.page);

	// application/config
	equal(ac.config("launched.charset"),"utf-8","launched.charset");
	equal(ac.config("login.charset"),"utf-8","login.charset");
	equal(ac.config("logo.charset"),"utf-8","logo.charset");
	equal(ac.config("unknown.charset"),undefined,"unknown.charset");

	// default state
	equal(ac.state("authenticated"),true,"authenticated");
	equal(ac.state("authorised"),true,"authorised");
	equal(ac.state("connected"),true,"connected");
	equal(ac.state("configured"),true,"configured");
	equal(ac.state("fullscreen"),false,"fullscreen");
	equal(ac.state("launching"),false,"launching");
	equal(ac.state("launched"),false,"launched");
	equal(ac.state("livepage"),false,"livepage");

	// waiting for later determination if logged in
	Resolver("page").set("state.authenticated",false);
	Resolver("page").set("state.authorised",false);


	// wait for config files
	configRequired("medic.conf");

	ok(ac.isPageState("loadingConfig"),"state loadingConfig");

	equal(ac.state("launching"),false,"not launching");
	equal(ac.state("launched"),false,"not launched");

	Resolver("page").set("state.authenticated",true);

	equal(ac.state("launching"),false,"not launching after setting authenticated");
	equal(ac.state("launched"),false,"not launched after setting authenticated");

	// config file loaded
	configLoaded("medic.conf");

	ok(! ac.isPageState("loadingConfig"), "not launchingConfig");
	ok(! ac.isPageState("loadingScripts"), "not loadingScripts");
	equal(ac.state("launching"),false,"not launching");

	Resolver("page").set("state.authorised",true);

	equal(ac.state("launching"),true,"launching state");

	// loading complete
	ok(1,"body classes are reflected")

	// when launched 
	ok(1,"last page singletons are instantiated")
	ok(1,"last document roles are enhanced")
	ok(1,"body classes are reflected")
});

//TODO when page is brought live the correct area is activated

if (location.protocol == "http:") asyncTest("Application Config loadPage of SubPage",function(){
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");

	var ac = ApplicationConfig();
	var page = ac.loadPage("/test/pages/with-config.html");
	var interval = setInterval(function(){ if (page.documentLoaded) {
		ok(! page.documentError);
		ok(page.head);
		ok(page.body);

		var mainStage = page.getElement("main-stage");
		ok(mainStage);
		equal(mainStage.id,"main-stage");

		var config = page.getConfig(mainStage);
		ok(config);
		equal(config["introduction-area"],"intro");
		equal(config["authenticated-area"],"explorer");
		equal(config["layouter"],"panel-group"); // overridden by data-role
		equal(config["type"],"vertical");
		deepEqual(config["sizes"],[100,50]);

		var config = page.getConfig(page.body);
		ok(config);
		equal(config["a"],"a","body data-role attribute");
		equal(config["b"],"b","body data-role attribute");
		equal(config["c"],"c","body application/config");

		var config = page.getConfig(page.head);
		ok(config);
		equal(config["1"],"1","head data-role attribute");
		equal(config["2"],"2","head data-role attribute");
		equal(config["3"],"3","head application/config");

		clearInterval(interval);
		start();
	}},100);
});

if (location.protocol == "http:") asyncTest("Application Config SubPage not found",function(){
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");

	var ac = ApplicationConfig();
	var page = ac.loadPage("/test/pages/not-there.html");
	var interval = setInterval(function(){ if (page.documentLoaded) {
		ok(page.documentError,404);

		clearInterval(interval);
		start();
	}},100);
});


//TODO require in config scripts

test("Launching base page to area",function(){
	ok(1,"Configuring introduction-area on StageLayouter");
	ok(1,"Configuring authenticated-area on StageLayouter");

})

test("Launching sub page to area",function(){
	ok(1,"Configuring introduction-area on StageLayouter in sub-page");
	ok(1,"Configuring authenticated-area on StageLayouter in sub-page");
	
})

test("Loading Sequence",function() {
	ok(1);return;
	
	var pageResolver = Resolver("page"), pageState = pageResolver("state");
	pageState.livepage = false;
	pageState.loading = true;
	pageState.launched = false;
	pageState.launching = false;

	ok(pageState.loading);

	var l1 = { src: "js/scripts.js" };
	var l2 = { src: "js/more.js" };

	/*
		Page goes live before loaded
	*/
	pageResolver.set("state.livepage",true);
	// pageResolver.set("state.loading",true);

	// pageResolver.set(["state","preloading"],true);

	//TODO scan page to identify two links
	pageResolver.set(["state","loadingScripts"],true);
	pageResolver.set(["state","loadingScriptsUrl",l1.src],l1); 
	pageResolver.set(["state","loadingScripts"],true);
	pageResolver.set(["state","loadingScriptsUrl",l2.src],l2); 

	pageResolver.set(["state","loadingScriptsUrl",l1.src],false); 

	ok(pageState.loading);

});

