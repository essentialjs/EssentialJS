(function(){
	var log = Resolver("essential::console::")(),
		pageState = Resolver("page::state");

	var loggedIn = Resolver("demo-session::loggedIn");
	loggedIn.declare(false);
	loggedIn.on("change",function() {
		if (loggedIn()) {
			// log in
			pageState.set("authenticated",true);
		} else {
			// log out
			pageState.set("authenticated",false);
			pageState.set("launched",false);
		}
	});
	loggedIn.stored("load change unload","local");

	//
	// listeners for logging when scripts/config are loaded
	// demo purposes only
	Resolver("page").on("change","state",function(ev){
		switch(ev.symbol) {
			case "livepage": if (ev.value) log.log("Page now live, builtin roles enhanced"); break;
			case "loading": if (ev.value==false) log.log("Loading of scripts and config complete"); break;
			case "configured": if (ev.value == true) log.log("Loading done, application configured"); break;
		}
	});
	Resolver("document").on("change","modules",function(ev){
		if (ev.value == false) log.log("added script: ",ev.symbol)
	});
	//TODO "added", "loaded"
	
	Resolver("page").on("change","state.loadingConfigUrl",function(ev){
		if (ev.value == false) log.log("loaded config: ",ev.symbol)
	});
	Resolver("page").on("change","state.authorised",function(ev){
		if (ev.value == true) log.log("Loading of permissions done");
	});
	Resolver("page").on("change","state.launching",function(ev){
		if (ev.value == true) log.log("Launching application");
	});
	Resolver("page").on("change","state.launched",function(ev){
		if (ev.value == true) log.log("Application launched.");
	});

})();