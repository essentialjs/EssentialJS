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

test("ApplicationConfig",function(){
	var ApplicationConfig = Resolver("essential")("ApplicationConfig");
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
	// equal(ac.state("launching"),false);
	equal(ac.state("launched"),false);

	// waiting for later determination if logged in
	Resolver("page").set("state.authenticated",false);
});

