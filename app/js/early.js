(function(){
	var console = Resolver("essential")("console");
	var DocumentRoles = Resolver("essential")("DocumentRoles");
	var DialogAction = Resolver("essential")("DialogAction");
	var pageState = Resolver("page").reference("state");
	var pageProgress = Resolver("page").reference("connection.loadingProgress");

	Generator(function(){
		pageProgress.on("change",document.getElementById("loadingProgress"),function(ev) {
			ev.data.innerHTML = ev.value;
		});
	}).restrict({ "singleton":true, "lifecycle":"page" });

	function _LoginDialog() {

	}
	var LoginDialog = DialogAction.variant("dialogs/login",Generator(_LoginDialog,DialogAction));

	LoginDialog.prototype.login = function(dialogElement) {
		Resolver().reference("demo-session").set("loggedIn",true);
		pageState.set("authenticated",true);
	};

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

	Resolver("page").declare("preferences",{});
	Resolver("page").reference("preferences").stored("load unload","local");

	var demoSession = Resolver().reference("demo-session");
	demoSession.declare(false);
	demoSession.on("change",function() {
		pageState.set("authenticated",demoSession.get("loggedIn"));
	});
	demoSession.stored("load change unload","local");
})();