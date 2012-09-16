module('launching page');

test("Page Resolver",function(){
	ok(Resolver.page,"Page resolver present")
	equal(typeof Resolver.page("state"),"object")
	equal(Resolver.page,document.body.stateful)
	equal(typeof Resolver.page("config"),"object")

	equal(Resolver("page")("config.launched.charset"),"utf-8");
	equal(Resolver("page")("config.login.charset"),"utf-8");
	equal(Resolver("page")("config.logo.charset"),"utf-8");
})

var ApplicationConfig = Resolver("essential")("ApplicationConfig");
ApplicationConfig.restrict({ singleton:true });

test("ApplicationConfig",function(){
	var configRequired = Resolver("essential")("configRequired");
	var configLoaded = Resolver("essential")("configLoaded");
	var ac = ApplicationConfig();

	// application/config
	equal(ac.config("launched.charset"),"utf-8");
	equal(ac.config("login.charset"),"utf-8");
	equal(ac.config("logo.charset"),"utf-8");
	equal(ac.config("unknown.charset"),undefined);

	// default state
	equal(ac.state("authenticated"),true);
	equal(ac.state("authorised"),true);
	equal(ac.state("connected"),true);
	equal(ac.state("configured"),true);
	equal(ac.state("fullscreen"),false);
	equal(ac.state("launching"),false);
	equal(ac.state("launched"),false);

	// waiting for later determination if logged in
	Resolver("page").set("state.authenticated",false);
	Resolver("page").set("state.authorised",false);


	// wait for config files
	configRequired("medic.conf");

	ok(ac.isPageState("loadingConfig"));

	equal(ac.state("launching"),false);
	equal(ac.state("launched"),false);

	Resolver("page").set("state.authenticated",true);

	equal(ac.state("launching"),false);
	equal(ac.state("launched"),false);

	// config file loaded
	configLoaded("medic.conf");

	ok(! ac.isPageState("loadingConfig"));
	ok(! ac.isPageState("loadingScripts"));
	equal(ac.state("launching"),false);

	Resolver("page").set("state.authorised",true);

	equal(ac.state("launching"),true);

	// loading complete
	ok(1,"body classes are reflected")

	// when launched 
	ok(1,"last page singletons are instantiated")
	ok(1,"last document roles are enhanced")
	ok(1,"body classes are reflected")
});

//TODO when page is brought live the correct area is activated

