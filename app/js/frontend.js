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

	//TODO role that requires permissions

	//TODO role that requires launching

	function frontend_post_loading() {
		// do things here that depends on all scripts and configs being loaded

		console.log("frontend_post_loading");

		// delayed receipt of the authorisation and permissions information.
		setTimeout(function(){
			pageState.set("authorised",true);
		},2000);
	}

	function frontend_launching() {
		//TODO you can enable things here just before app is launched
	}

	// manage the loading of the application
	pageState.on("change",function(ev){
		if (ev.symbol == "loading" && ev.value == false) {
			// finish the loading of the frontend, now that scripts and config is loaded.
			if (pageState("configured")==false) frontend_post_loading();
			pageState.set("configured",true);
		}
		if (ev.symbol == "launching" && ev.value == true) {
			frontend_launching();
			// give app and rendering time to settle
			setTimeout(function(){
				pageState.set("launched",true);
			},100);
		}
	});


	console.log("frontend.js finished load execution");

})();
