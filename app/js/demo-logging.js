(function(){
	var console = Resolver("essential")("console");

	//
	// listeners for logging when scripts/config are loaded
	// demo purposes only
	Resolver("page").on("change","state",function(ev){
		switch(ev.symbol) {
			case "livepage": if (ev.value) console.log("Page now live, builtin roles enhanced"); break;
			case "loading": if (ev.value==false) console.log("Loading of scripts and config complete"); break;
			case "configured": if (ev.value == true) console.log("Loading done, application configured"); break;
		}
	});
	Resolver("page").on("change","state.loadingScriptsUrl",function(ev){
		if (ev.value == false) console.log("loaded script: ",ev.symbol)
	});
	Resolver("page").on("change","state.loadingConfigUrl",function(ev){
		if (ev.value == false) console.log("loaded config: ",ev.symbol)
	});
	Resolver("page").on("change","state.authorised",function(ev){
		if (ev.value == true) console.log("Loading of permissions done");
	});
	Resolver("page").on("change","state.launching",function(ev){
		if (ev.value == true) console.log("Launching application");
	});
	Resolver("page").on("change","state.launching",function(ev){
		if (ev.value == true) console.log("Application launched.");
	});

})();