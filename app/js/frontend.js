(function(){
	var console = Resolver("essential")("console");
	var DocumentRoles = Resolver("essential")("DocumentRoles");

	/*
		Put your application code here
	*/

	function _CoreFactory() {
		console.log("constructed Core Factory");
	}

	var CoreFactory = Generator(_CoreFactory).restrict({ singleton: true, lifecycle: "page" });
	Resolver(window).set("app.factories.CoreFactory",CoreFactory);

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
	}

	Resolver("page").on("change","state.loading",function(ev){
		if (ev.value == false) {
			// finish the loading of the frontend
			if (Resolver("page")("state.configured")==false) frontend_post_loading();
			Resolver("page").set(["state","configured"],true);
		}
	});


	// listeners for logging when scripts/config are loaded
	Resolver("page").on("change","state.loadingScriptsUrl",function(ev){
		if (ev.value == false) console.log("loaded script: ",ev.symbol)
	});
	Resolver("page").on("change","state.loadingConfigUrl",function(ev){
		if (ev.value == false) console.log("loaded config: ",ev.symbol)
	});
	console.log("frontend.js finished load execution");
})();
