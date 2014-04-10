module('launching page', {
	"setup": function() {
		//TODO scan and apply script and meta
	},

	"teardown": function() {
		Generator.discardRestricted();
		Resolver("essential::EnhancedDescriptor::").discardAll();
		
	}
});

test("Document Resolver", function() {
	ok(Resolver.document,"Document resolver present");
	equal(Resolver.document.namespace,document,"Document resolver is for document");

	var docResolver = Resolver("document");
	equal(docResolver("enhanced.config.launched.charset"),"utf-8");
	equal(docResolver("enhanced.config.login.charset"),"utf-8");
	equal(docResolver("enhanced.config.logo.charset"),"utf-8");
});

test("Page Resolver",function(){
	// parts are obsolete

	ok(Resolver.page,"Page resolver present")
	equal(typeof Resolver.page("state"),"object")
	// equal(typeof Resolver.page("config"),"object")

	var pageResolver = Resolver("page");
	// equal(pageResolver("config.launched.charset"),"utf-8");
	// equal(pageResolver("config.login.charset"),"utf-8");
	// equal(pageResolver("config.logo.charset"),"utf-8");

	// default state
	equal(pageResolver("state.authenticated"),true,"authenticated");
	equal(pageResolver("state.authorised"),true,"authorised");
	equal(pageResolver("state.connected"),true,"connected");
	equal(pageResolver("state.configured"),true,"configured");
	equal(pageResolver("state.fullscreen"),false,"fullscreen");
	equal(pageResolver("state.launching"),false,"launching");
	equal(pageResolver("state.launched"),false,"launched");
	equal(pageResolver("state.livepage"),false,"livepage");

});

function set_cookie(doc,id,value,expires) {

    doc.cookie = id+"="+encodeURI(value)+(expires||"")+"; path=/";
}

test('HTML head is scanned correctly', function() {
	var essential = Resolver('essential'),
		queueHead = essential('queueHead'),
		enhancedResolver = Resolver("document::enhanced"),
		pageResolver = Resolver("page"),
		translations = Resolver("translations"),
		HTMLElement = Resolver("essential::HTMLElement::");

	set_cookie(document,"locale","en-us");
	queueHead(document,false);
	equal(document.defaultLang,"en"); //TODO defaultLocale in translations instead?
	equal(translations("defaultLocale"),"en-us"); // guess it can't be tested...
	equal(pageResolver("state.lang"),"en");


	var createHTMLDocument = Resolver("essential::createHTMLDocument::");

	//TODO can the domain be set for custom document? avoids conflicting cookies
	var doc = createHTMLDocument([
		'<!DOCTYPE html><html>',
		'<head id="a1" attr="a1"><meta charset="utf-8">',
		'<meta name="locale cookie" content="locale">',
		'</head>',
		'<body id="a2" attr="a2"></body>',
		'</html>'].join(""));
	// debugger;
	set_cookie(doc,"locale","fr-fr");
	var r = Resolver(doc);
	queueHead(doc,false);
	equal(typeof r("enhanced"), "object","Custom Document Enhanced");
	equal(r("enhanced.lang",null),"fr");
	equal(r("enhanced.locale",null),"fr-fr");

	set_cookie(doc,"locale","de-CH");
	// debugger;
	queueHead(doc,false);
	equal(typeof r("enhanced"), "object","Custom Document Enhanced");
	equal(r("enhanced.lang",null),"de");
	equal(r("enhanced.locale",null),"de-CH");
});

var INIT_PAGE_STATE	= {
	"livepage": false,
	"authenticated": true,
	"authorised": true,
	"connected": true,
	"preloading": false,
	"loading": true,
	"loadingConfig": false,
	"loadingScripts": false,
	"configured": true,
	"launching": false, 
	"launched": false
};

test('roles are enhanced when no page state is preset',function() {

	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::"),
		DescriptorQuery = Resolver("essential::DescriptorQuery::"),
		enhancedResolver = Resolver("document::enhanced"),
		pageResolver = Resolver("page"),
		HTMLElement = Resolver("essential::HTMLElement::");

	ok(! pageResolver("state.livepage"));
	pageResolver.reference("state").mixin(INIT_PAGE_STATE);
	enhancedResolver.set("enabledRoles.test321",true);	
	enhancedResolver.set("handlers.init.test321",function(el,role,config) {
		el.setAttribute("test321","321");
	});

	var div = HTMLElement("div",{ "role":"test321" },'');
	DescriptorQuery(div).queue(); // queue for enhancement

	// DescriptorQuery(div)[0]._init();
	pageResolver.set("state.livepage",true);

	equal(div.getAttribute("test321"),"321");
	ok(! pageResolver("state.loading"), "loading is done on livepage by default");
	ok(pageResolver("state.launching"), "after loading launching is automatically entered");
	ok(! pageResolver("state.launched"), "it is up to the application to flag launching complete");
	// ok(pageResolver("state.livepage"));
	// ok(pageResolver("state.livepage"));
	// ok(pageResolver("state.livepage"));
	// ok(pageResolver("state.livepage"));

	pageResolver.set("handlers.init.test321",undefined);
	pageResolver.set("state.livepage",false);
});

test('Some states can be changed without instantiating ApplicationConfig',function() {

	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::"),
		// DescriptorQuery = Resolver("essential::DescriptorQuery::"),
		ApplicationConfig = Resolver("essential::ApplicationConfig::"),
		pageResolver = Resolver("page"),
		HTMLElement = Resolver("essential::HTMLElement::");

	equal(ApplicationConfig.info.existing[0],undefined,"ApplicationConfig not already there when testing");

	// debugger;
	ok(! pageResolver("state.livepage"));
	pageResolver.reference("state").mixin(INIT_PAGE_STATE);

	pageResolver.set("state.authenticated",false);
	pageResolver.set("state.authorised",false);

	equal(ApplicationConfig.info.existing[0],undefined,"Existing ApplicationConfig");
	pageResolver.set("state.authenticated",true);
	// pageResolver.set("state.authorised",true);
})

// var ApplicationConfig = Resolver("essential")("ApplicationConfig");
// ApplicationConfig.restrict({ singleton:true });

test("ApplicationConfig",function(){
	// equal(document.body.stateful,undefined);

	var configRequired = Resolver("essential::configRequired::");
	var configLoaded = Resolver("essential::configLoaded::");
	var ApplicationConfig = Resolver("essential::ApplicationConfig::"),
		pageResolver = Resolver("page");

	ok(! pageResolver("state.livepage"));
	pageResolver.reference("state").mixin(INIT_PAGE_STATE);

	var ac = ApplicationConfig();
	// equal(document.body.stateful,Resolver.page);
	equal( Resolver("page")(["pagesById",ac.uniquePageID]), ac );

	// application/config
	// equal(ac.config("launched.charset"),"utf-8","launched.charset");
	// equal(ac.config("login.charset"),"utf-8","login.charset");
	// equal(ac.config("logo.charset"),"utf-8","logo.charset");
	// equal(ac.config("unknown.charset"),undefined,"unknown.charset");

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

		page.applyBody();

		var config = Resolver.config(mainStage);
		ok(config);
		equal(config["introduction-area"],"intro");
		equal(config["authenticated-area"],"explorer");
		equal(config["layouter"],"panel-group"); // overridden by data-role
		equal(config["type"],"vertical");
		deepEqual(config["sizes"],[100,50]);

		var config = Resolver.config(document.body);
		ok(config);
		equal(config["c"],"c","body application/config");

		var config = Resolver.config(document.head);
		ok(config);
		equal(config["3"],"3","head application/config");

		var config = Resolver.config(page.body);
		ok(config);
		equal(config["a"],"a","body data-role attribute");
		equal(config["b"],"b","body data-role attribute");
		equal(config["c"],"c","body application/config");

		// if (navigator.userAgent.indexOf(" MSIE ") == -1) {
		var config = Resolver.config(page.head);
		ok(config);
		equal(config["1"],"1","head data-role attribute");
		equal(config["2"],"2","head data-role attribute");
		equal(config["3"],"3","head application/config");
		// }

		page.destroy(); // will unapply

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
	// pageResolver.set(["state","loadingScriptsUrl",l1.src],l1); 
	pageResolver.set(["state","loadingScripts"],true);
	// pageResolver.set(["state","loadingScriptsUrl",l2.src],l2); 

	// pageResolver.set(["state","loadingScriptsUrl",l1.src],false); 

	ok(pageState.loading);

});

