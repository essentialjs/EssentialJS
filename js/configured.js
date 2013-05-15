Resolver("essential::ApplicationConfig::").restrict({ "singleton":true, "lifecycle":"page" });

//TODO clearInterval on unload

Resolver("page::state.livepage").on("change",function(ev) {
	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::");
	if (ev.value) { // bring live
		EnhancedDescriptor.maintainer = setInterval(EnhancedDescriptor.maintainAll,330); // minimum frequency 3 per sec
		EnhancedDescriptor.refresher = setInterval(EnhancedDescriptor.refreshAll,160); // minimum frequency 3 per sec
	} else { // unload
		clearInterval(EnhancedDescriptor.maintainer);
		clearInterval(EnhancedDescriptor.refresher);
	}
});
