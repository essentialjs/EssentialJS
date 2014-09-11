Resolver("document").queueHead();

Resolver("essential::ApplicationConfig::").restrict({ "singleton":true, "lifecycle":"page" });

Resolver("page").set("liveTimeout",60);
//TODO clearInterval on unload

Resolver("document").on("change","readyState",function(ev) {
	switch(ev.value) {
		case "loaded":
			Resolver("document").seal(false);
			break;

		case "interactive":
			if (! Resolver("document")._readyFired) Resolver("document")._ready();

			var liveTimeout = Resolver("page::liveTimeout","null");
			if (liveTimeout) {
				// Allow the browser to render the page, preventing initial transitions
				setTimeout(function() {
					Resolver("page").set("state.livepage",true);
				},liveTimeout);
			}
			else if (liveTimeout == 0) Resolver("page").set("state.livepage",true);
			break;

		case "complete":
			Resolver("document")._load();
			break;
	}
});

!function() {

var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::"),
	enhancedWindows = Resolver("essential::enhancedWindows::"),
	placement = Resolver("essential::placement::"),
	defaultButtonClick = Resolver("essential::defaultButtonClick::"),
	pageResolver = Resolver("page"),
	updateOnlineStatus = Resolver("essential::updateOnlineStatus::");


function onPageUnLoad(ev) {

	if (EnhancedDescriptor.maintainer) clearInterval(EnhancedDescriptor.maintainer);
	EnhancedDescriptor.maintainer = null;

	Resolver("document")._unload();

	for(var n in Resolver.nm) {
		if (typeof Resolver.nm[n].destroy == "function") Resolver.nm[n].destroy();
	}
	Resolver.nm = undefined;
}
if (window.addEventListener) window.addEventListener("unload",onPageUnLoad,false);
else if (window.attachEvent) window.attachEvent("onunload",onPageUnLoad);


Resolver("page::state.livepage").on("change",function(ev) {
	function resizeTriggersReflow(ev) {
		EnhancedDescriptor.refreshAll();
		enhancedWindows.notifyAll(ev);
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			w.notify(ev);
		}
	}


	if (ev.value) { // bring live
		
		//TODO manage interval in configured.js, and space it out consistent results
		// for browsers that don't support events
		if (updateOnlineStatus.frequency > 0) pageResolver.uosInterval = setInterval(updateOnlineStatus,updateOnlineStatus.frequency);

		EnhancedDescriptor.maintainer = setInterval(EnhancedDescriptor.maintainAll,330); // minimum frequency 3 per sec
		EnhancedDescriptor.refresher = setInterval(EnhancedDescriptor.refreshAll,160); // minimum frequency 6 per sec

		updateOnlineStatus();

		if (window.addEventListener) {
			document.body.addEventListener("online",updateOnlineStatus);
			document.body.addEventListener("offline",updateOnlineStatus);
		
			if (window.applicationCache) applicationCache.addEventListener("error", updateOnlineStatus);

			window.addEventListener("resize",resizeTriggersReflow,false);
			document.body.addEventListener("orientationchange",resizeTriggersReflow,false);
			document.body.addEventListener("click",defaultButtonClick,false);
		} else {
			// IE8
			window.attachEvent("onresize",resizeTriggersReflow);
			document.body.attachEvent("onclick",defaultButtonClick);

			document.body.attachEvent("online",updateOnlineStatus);
			document.body.attachEvent("offline",updateOnlineStatus);
		}

		Resolver("essential")("launchWindows")();

	} else { // unload

		if (window.removeEventListener) {
			window.removeEventListener("resize",resizeTriggersReflow);
			document.body.removeEventListener("orientationchange",resizeTriggersReflow);
			document.body.removeEventListener("click",defaultButtonClick);
		} else {
			window.detachEvent("onresize",resizeTriggersReflow);
			document.body.detachEvent("onclick",defaultButtonClick);
		}

		clearInterval(pageResolver.uosInterval);
		pageResolver.uosInterval = null;
		clearInterval(EnhancedDescriptor.maintainer);
		EnhancedDescriptor.maintainer = null;
		clearInterval(EnhancedDescriptor.refresher);
		EnhancedDescriptor.refresher = null;
		if (placement.broadcaster) clearInterval(placement.broadcaster);
		placement.broadcaster = null;
		placement.stopTrackMain();
	}
});

Resolver("page::state.managed").on("change",function(ev) {

	var	placement = Resolver("essential::placement::");

	if (ev.value) {
		placement.startTrackMain();
	}
});

}();
