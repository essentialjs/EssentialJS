Resolver("essential::ApplicationConfig::").restrict({ "singleton":true, "lifecycle":"page" });

//TODO clearInterval on unload

Resolver("page::state.livepage").on("change",function(ev) {
	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::"),
	var pageResolver = Resolver("page");

	if (ev.value) { // bring live
		
		//TODO manage interval in configured.js, and space it out consistent results
		// for browsers that don't support events
		pageResolver.uosInterval = setInterval(pageResolver.updateOnlineStatus,5000);

		EnhancedDescriptor.maintainer = setInterval(EnhancedDescriptor.maintainAll,330); // minimum frequency 3 per sec
		EnhancedDescriptor.refresher = setInterval(EnhancedDescriptor.refreshAll,160); // minimum frequency 3 per sec
	} else { // unload
		clearInterval(pageResolver.uosInterval);
		clearInterval(EnhancedDescriptor.maintainer);
		clearInterval(EnhancedDescriptor.refresher);
	}
});
