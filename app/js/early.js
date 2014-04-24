(function(){
	var essential = Resolver("essential"),
		pageResolver = Resolver("page"),
		templates = Resolver("document::essential.templates::"),
		Layouter = essential("Layouter"),
		Laidout = essential("Laidout"),
		log = essential("console")();

	var HTMLElement = Resolver("essential::HTMLElement::");
	var DialogAction = Resolver("essential::DialogAction::");
	var DescriptorQuery = Resolver("essential::DescriptorQuery::");
	var pageState = Resolver("page::state");
	var pageProgress = Resolver("page::connection.loadingProgress");

	//TODO Resolver("essential").set("images.get-started",'M25.542,8.354c-1.47-1.766-2.896-2.617-3.025-2.695c-0.954-0.565-2.181-0.241-2.739,0.724c-0.556,0.961-0.24,2.194,0.705,2.763c0,0,0.001,0,0.002,0.001c0.001,0,0.002,0.001,0.003,0.002c0.001,0,0.003,0.001,0.004,0.001c0.102,0.062,1.124,0.729,2.08,1.925c1.003,1.261,1.933,3.017,1.937,5.438c-0.001,2.519-1.005,4.783-2.64,6.438c-1.637,1.652-3.877,2.668-6.368,2.669c-2.491-0.001-4.731-1.017-6.369-2.669c-1.635-1.654-2.639-3.919-2.64-6.438c0.005-2.499,0.995-4.292,2.035-5.558c0.517-0.625,1.043-1.098,1.425-1.401c0.191-0.152,0.346-0.263,0.445-0.329c0.049-0.034,0.085-0.058,0.104-0.069c0.005-0.004,0.009-0.006,0.012-0.008s0.004-0.002,0.004-0.002l0,0c0.946-0.567,1.262-1.802,0.705-2.763c-0.559-0.965-1.785-1.288-2.739-0.724c-0.128,0.079-1.555,0.93-3.024,2.696c-1.462,1.751-2.974,4.511-2.97,8.157C2.49,23.775,8.315,29.664,15.5,29.667c7.186-0.003,13.01-5.892,13.012-13.155C28.516,12.864,27.005,10.105,25.542,8.354zM15.5,17.523c1.105,0,2.002-0.907,2.002-2.023h-0.001V3.357c0-1.118-0.896-2.024-2.001-2.024s-2.002,0.906-2.002,2.024V15.5C13.498,16.616,14.395,17.523,15.5,17.523z');

	var policy = {
		DECORATORS: {
			"data-resolve": {
				props: true
			}
		}
	};

	pageResolver.declare("handlers.prepare.resolved", function(el,role) {
		var els = el.getElementsByTagName("*"), text = [], 
			queued = el.queued = [],
			attrs, dataResolve;

		attrs = HTMLElement.fn.describeAttributes(el,policy);
		attrs.texts = [];
		//TODO support data-resolve on root element ?

		if (attrs.texts.length === 0) {
			attrs.texts = attrs.texts.concat(HTMLElement.fn.findTextSubstitutions(el));
		}

		if (attrs.texts.length || dataResolve) {
			attrs.el = el;
			queued.push(attrs);
			for(var i=0,t; t = attrs.texts[i]; ++i) t.renderText.call(t,pageResolver);
			//TODO renderAttrs class title placeholder
		}

		for(var i=0,ce; ce = els[i]; ++i) {
			attrs = HTMLElement.fn.describeAttributes(ce,policy);
			dataResolve = attrs["data-resolve"];

			attrs.texts = [];

			if (dataResolve) {
				if (dataResolve.props.text) {
					attrs.texts.push(HTMLElement.fn.makeTextSubstitution(ce,dataResolve.props.text));
				}
				if (dataResolve.props.html) {
					//TODO makeHtmlSubstitution
				}
			} 
			if (attrs.texts.length === 0) {
				// nested text if not in attribute
				attrs.texts = attrs.texts.concat(HTMLElement.fn.findTextSubstitutions(ce));
			}

			if (attrs.texts.length || dataResolve) {
				attrs.el = ce;
				queued.push(attrs);
				for(var j=0,t; t = attrs.texts[j]; ++j) t.renderText.call(t,pageResolver);
				//TODO renderAttrs class title placeholder
			}
		}

	});

	pageResolver.declare("handlers.enhance.resolved", function(el,role,config,context) {
		//TODO register listeners and call on bind

		function textRefresher(t,resolver) {
			return function(ev) {
				t.renderText.call(t,resolver);
			};
		}

		function textUpdaters(attrs,resolver) {
			for(var i=0,t; t = attrs.texts[i]; ++i) {
				t.renderText.call(t,resolver);
				for(var j=0,s; s = t.selectors[i]; ++i) if (s.indexOf("::")>=0) {
					var parts = s.split("::");
					Resolver(parts[0]).on("change",parts[1],textRefresher(t,resolver));
				} else {
					resolver.on("change",s,textRefresher(t,resolver));
				}
			}
		}

		if (el.queued) {
			for(var i=0,q; q = el.queued[i]; ++i) {
				textUpdaters(q,el.stateful);
			}
			//TODO update on any part change
			//TODO update state.blank
			el.queued = undefined;
		}
	});



	Generator(function(){
		pageProgress.on("change",document.getElementById("loadingProgress"),function(ev) {
			var el = ev.data;

			if (el.lastChild == null || el.lastChild.nodeType != 3/* TEXTNODE */) el.appendChild(el.ownerDocument.createTextNode(''));
			// if (ev.lastChild.)
			el.lastChild.nodeValue = ev.value;
			// try {
			// 	el.innerHTML = ev.value;
			// } catch(ex) {
			// 	//TODO fix on IE, unknow error assigning to innerHTML
			// }
		});
	}).restrict({ "singleton":true, "lifecycle":"page" });

	function _LoginDialog() {

	}
	var LoginDialog = DialogAction.variant("dialogs/login",Generator(_LoginDialog,DialogAction));

	LoginDialog.prototype.login = function(dialogElement) {
		Resolver("demo-session").set("loggedIn",true);
		pageState.set("authenticated",true);
	};

	function _AccountActions() {

	}
	var AccountActions = DialogAction.variant("navigation/account",Generator(_AccountActions,DialogAction));
	AccountActions.prototype.logout = function(dialogElement) {
		setTimeout(function(){

			Resolver("demo-session").set("loggedIn",false);
		},1000);
	};

	var DialogsAction = DialogAction.variant("dialogs",Generator(function(){},DialogAction,{
		"prototype": {
			"new":function(el,ev) {
				var dialog = HTMLElement("div",{
					"role":"dialog",
					"data-role": {
						'template':'#test-dialog','content-template':'#test-content',
						'tile':true,
						'inline':false
					}
				});
				document.body.appendChild( dialog );
				DescriptorQuery(dialog).enhance();
			},
			"new-html5":function(el,ev) {
				var dialog = HTMLElement("div",{
					"role":"dialog",
					"data-role": {
						'template':'#test-dialog','content-template':'#test-html5',
						'tile':true,
						'inline':false
					}
				});
				document.body.appendChild( dialog );
				DescriptorQuery(dialog).enhance();
			}
		}
	}))

	function _DemoApplication(el,role,config) {
		log.log("Initialized DemoApplication on",el);
	}
	Resolver().declare("DemoApplication",_DemoApplication);

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
			case "lang":
				pageProgress.set("Language selected: "+ev.value);
				break;
		}
	});

	Resolver("translations::locale").stored("load unload change","cookie",{ id:"locale", encoding:"string", days:1000, touchScript:"cookie-reload" });
	Resolver("page::preferences").declare({});
	Resolver("page::preferences").stored("load unload","local");

	Resolver().declare("UpdatingTable", Generator(function(el,role,config) {
		this.el = el;
		this.interval = setInterval(function(){
			var tbody = el.lastElementChild || el.lastChild;
			var tr = document.createElement("TR");
			tr.innerHTML = [
			"<td>10/1/2011<td>",
			"<td>"+Math.ceil(Math.random()*1000)+"<td>",
			"<td>Description<td>",
			"<td>0<td>",
			"<td>0<td>",
			"<td>0<td>",
			"<td>0<td>"
			].join(""); 
			tbody.appendChild(tr);
		},3000);
	},{
		discarded: function(instance) {
			if (instance.interval) clearInterval(instance.interval);
		},
		prototype: {

		}
	}));
})();