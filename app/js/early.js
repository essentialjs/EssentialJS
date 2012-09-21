(function(){
	var console = Resolver("essential")("console");
	var DocumentRoles = Resolver("essential")("DocumentRoles");
	var pageState = Resolver("page").reference("state");
	var pageProgress = Resolver("page").reference("connection.loadingProgress");

	Generator(function(){
		pageProgress.on("change",document.getElementById("loadingProgress"),function(ev) {
			ev.data.innerHTML = ev.value;
		});
	}).restrict({ "singleton":true, "lifecycle":"page" });

	// manage the loading of the application
	pageState.on("change",function(ev){
		if (ev.base.loading) {
			pageProgress.set("Loading the Application...");
		}
		switch(ev.symbol) {
			case "loading":
				if (ev.value == false) pageProgress.set("Readying the Application...");
				break;
			case "authorisation":
				if (ev.value == true) pageProgress.set("Received authorisation.")
				break;
			case "launching":
				if (ev.value == true) pageProgress.set("Launching the Application...");
				break;
			case "launched":
				if (ev.value == true) pageProgress.set("Done.");
				break;
		}
	});


})();