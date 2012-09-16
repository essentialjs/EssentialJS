(function(){
	var console = Resolver("essential")("console");
	var DocumentRoles = Resolver("essential")("DocumentRoles");
	var pageState = Resolver("page").reference("state");

	/*
		Put your application code here
	*/

	function _CoreFactory() {
		console.log("constructed Core Factory");
	}

	var CoreFactory = Generator(_CoreFactory).restrict({ singleton: true, lifecycle: "page" });
	Resolver(window).set("app.factories.CoreFactory",CoreFactory);

	// role="presentation", enhanced after the initial page is rendered when frontend.js has been loaded.
	var PresentationLoader = Resolver(window).set("app.application.PresentationLoader",Generator(function(){
		console.log("constructed presentation loader");
	}));
	PresentationLoader.restrict({ singleton: true, lifecycle: "page" })

	PresentationLoader.enhance_presentation = function(el,role,config) 
	{
		console.log("enhancing presentation");
	};

	PresentationLoader.layout_presentation = function(el,layout,instance) 
	{
		console.log("layout presentation");
	};

	PresentationLoader.discard_presentation = function(el,role,instance) 
	{
		console.log("discard presentation");
		if (instance) {
			if (instance.onClose) {
				instance.onClose();
			}
		}
		try {
			// IE8 doesn't seem to like this
			el.innerHTML = "";
		} catch(ex) {}
	};

	DocumentRoles.presets.declare("handlers.enhance.presentation", PresentationLoader.enhance_presentation);
	DocumentRoles.presets.declare("handlers.layout.presentation", PresentationLoader.layout_presentation);
	DocumentRoles.presets.declare("handlers.discard.presentation", PresentationLoader.discard_presentation);


	function frontend_post_loading() {
		// do things here that depends on all scripts and configs being loaded

		console.log("frontend_post_loading");

		// delayed receipt of the authorisation and permissions information.
		setTimeout(function(){
			pageState.set("authorised",true);
		},2000);
	}

	pageState.on("change","loading",function(ev){
		if (ev.value == false) {
			// finish the loading of the frontend, now that scripts and config is loaded.
			if (pageState("configured")==false) frontend_post_loading();
			pageState.set("configured",true);
		}
	});

	//
	// listeners for logging when scripts/config are loaded
	// demo purposes only
	Resolver("page").on("change","state.loadingScriptsUrl",function(ev){
		if (ev.value == false) console.log("loaded script: ",ev.symbol)
	});
	Resolver("page").on("change","state.loadingConfigUrl",function(ev){
		if (ev.value == false) console.log("loaded config: ",ev.symbol)
	});
	Resolver("page").on("change","state.configured",function(ev){
		if (ev.value == true) console.log("Loading done, application configured");
	});
	Resolver("page").on("change","state.authorised",function(ev){
		if (ev.value == true) console.log("Loading of permissions done");
	});

	console.log("frontend.js finished load execution");

})();
