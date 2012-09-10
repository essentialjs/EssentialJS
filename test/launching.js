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
	// debugger;
	equal(ac.config("launched.charset"),"utf-8");
	equal(ac.config("login.charset"),"utf-8");
	equal(ac.config("logo.charset"),"utf-8");
	equal(ac.config("unknown.charset"),undefined);
});

