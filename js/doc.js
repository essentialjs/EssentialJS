

// set("bodyResolver")

Resolver.docMethod("require",function(path) {
    if (this("essential.modules")[path] == undefined) {
        var ex = new Error("Missing module '" + path + "'");
        ex.ignore = true;
        throw ex;   
    } 
});

	//TODO resolver.exec("callInits",null)
Resolver.docMethod("callInits",function() {
	var inits = this("essential.inits");
	for(var i=0,fn; fn = inits[i]; ++i) if (!fn.done) {
		try {
			fn.call(fn.context || {});
			fn.done = true;
		} catch(ex) {
			// debugger;
		} //TODO only ignore ex.ignore
	}
});

/* 
	Resolver.config(document,'declare(..); declare("..")');
	var conf = Resolver.config(el)
*/
Resolver.config = function(el,script) {
	var log = Resolver("essential::console::")();
	var _singleQuotesRe = new RegExp("'","g");


	function _getRoleConfig(resolver, el,key) {
		//TODO cache the config on element.stateful

		var config = null, doc = resolver.namespace,
			ref = resolver.reference("essential.config","null"),
			appliedConfig = resolver("essential.appliedConfig");

		function eitherConfig(key) {
			for(var n in appliedConfig) 
				if (appliedConfig[n] && appliedConfig[n][key]) return appliedConfig[n][key];
			return ref(key);
		}

		function mixinConfig(config,key) {
			var declared = eitherConfig(key);
			if (declared) {
				config = config || {};
				for(var n in declared) config[n] = declared[n];
			}
			return config;
		}

		// mixin the declared config
		if (key) config = mixinConfig(config,key);
		if (el.nodeName == "HEAD" || el.nodeName == "BODY") config = mixinConfig(config,el.nodeName.toLowerCase());

		// mixin the data-role
		var dataRole = el.getAttribute("data-role");
		if (dataRole) try {
			config = config || {};
			//TODO alternate CSS like syntax
			var map = JSON.parse("{" + dataRole.replace(_singleQuotesRe,'"') + "}");
			for(var n in map) config[n] = map[n];
		} catch(ex) {
			log.debug("Invalid config: ",dataRole,ex);
			config["invalid-config"] = dataRole;
		}

		return config;
	}


	var doc = el.nodeType == 9? el : el.ownerDocument, docResolver = Resolver(doc);
	if (docResolver == null) return null; // if not known document

	if (script) {
		if (typeof script == "string") script = Resolver.functionProxy(script);
		var context = docResolver.reference("essential.config");
		//TODO extend the reference with additional api
		try {
			script.call(context);
		} catch(ex) {
			Resolver("essential::console::")().error("Failed to parse application/config",s.text);
		}

	} else {
		if (el.id) {
			return _getRoleConfig(docResolver, el,el.id);
		}
		var name;
		try {
			name = el.getAttribute("name");
		}
		catch(ex) { // access denied
			return null;
		}
		if (name) {
			var p = el.parentNode;
			while(p && p.tagName) {
				if (p.id) {
					return _getRoleConfig(docResolver, el,p.id + "." + name);
				} 
				p = p.parentNode;
			} 
		}
		return _getRoleConfig(docResolver, el);
	}
};

!function() {
	var essential = Resolver("essential"),
		HTMLElement = essential("HTMLElement"),
		HTMLScriptElement = essential("HTMLScriptElement"),
		addEventListeners = essential("addEventListeners");

	function addHeadScript(text,doc) {

		//TODO support adding to other sub-documents
		if (false) {
			HTMLElement("script",{
				"append to": doc.head
			},text);	
		}
		else doc.write('<script>'+text+'</'+'script>')

	}

	function describeLink(link,lang) {

		var attrsStr = link.getAttribute("attrs");
		var attrs = {};
		if (attrsStr) {
			try {
				eval("attrs = {" + attrsStr + "}");
			} catch(ex) {
				//TODO
			}
		}
		attrs["rel"] = link.rel || attrs.rel;
		attrs["stage"] = link.getAttribute("stage") || attrs.stage || undefined;
		attrs["type"] = link.type || link.getAttribute("type") || attrs.type || "text/javascript";
		attrs["name"] = link.getAttribute("data-name") || link.getAttribute("name") || attrs.name || undefined;
		attrs["content"] = link.getAttribute("content") || attrs.content || undefined;
		attrs["base"] = essential("baseUrl");
		attrs["subpage"] = (link.getAttribute("subpage") == "false" || link.getAttribute("data-subpage") == "false")? false:true;
		//attrs["id"] = link.getAttribute("script-id");
		attrs["onload"] = flagLoaded;

		attrs["src"] = (link.href || link.getAttribute("src") || attrs.src || "").replace(essential("baseUrl"),"");

		switch(attrs.type) {
			case "text/javascript":
				attrs.stage = "loading";
				break;
			case "text/javascript+preloading":
			case "text/javascript+authenticated":
				var s = attrs.type.split("+");
				attrs.type = s[0];
				attrs.stage = s[1];
				break;

			//TODO XHR for others
		}

		return attrs;
	}

	function flagLoaded() {
		var name = this.getAttribute("data-module"); 

		setTimeout(function(){
			Resolver("document").setModuleLoaded(name,true);
		},0);
	}

	function Module(name) {this.name=name;}

	Module.prototype.scriptMarkup = function(subpage) {
		var loaded = "Resolver('document').setModuleLoaded(this.getAttribute('data-module'), true);",
			attr = subpage? "" : " defer";
		return '<script src="' + this.attrs.src + '" data-module="'+ this.name +'" onload="'+loaded+'"'+attr+'></'+'script>';
	};

	Module.prototype.addScript = function() {
		document.write(this.scriptMarkup());
		this.added = true;
		// console.log("added script",this.name);
	};

	Module.prototype.addScriptAsync = function() {
		// var src = this.attrs.src;
		this.attrs["append to"] = this.link.ownerDocument.head;
		// this.attrs.src = undefined;
		this.attrs.async = false;

		HTMLScriptElement(this.attrs);
		this.added = true;
		console.log("added script",this.name);
	};

	var pendingScripts = [];
	var firstScript = document.scripts[0];

	// Watch scripts load in IE
	function stateChange() {
	  // Execute as many scripts in order as we can
	  while (pendingScripts[0] && pendingScripts[0].readyState == 'loaded') {
	    var pendingScript = pendingScripts.shift();
	    // avoid future loading events from this script (eg, if src changes)
	    pendingScript.onreadystatechange = null;
	    // can't just appendChild, old IE bug if element isn't closed
	    firstScript.parentNode.insertBefore(pendingScript, firstScript);
	    flagLoaded.call(pendingScript);
	  }
	}	

	Module.prototype.addScriptIE = function() {

    	var script = document.createElement('script');
	    pendingScripts.push(script);
	    // listen for state changes
	    script.onreadystatechange = stateChange;
	    // must set src AFTER adding onreadystatechange listener
	    // else we’ll miss the loaded event for cached scripts
	    script.src = src;
		this.added = true;
	};

	if (firstScript) {
		if ('async' in firstScript) Module.prototype.addScript = Module.prototype.addScriptAsync;
		else if (firstScript.readyState) Module.prototype.addScript = Module.prototype.addScriptIE;
	} 

	Module.prototype.queueHead = function(stage,lang) {
		if (this.loaded || this.added) return;
		var langOk = (lang && this.link.lang)? (this.link.lang == lang) : true; //TODO test on add script
		if (this.attrs.stage==stage && langOk) this.addScript();
	};

	Resolver.docMethod("setModuleLoaded",function(name,loaded) {
		this.set(["essential","modules",name,"loaded"], loaded==undefined? true:loaded);
		this.reflectModules();
		if (document.body) Generator.instantiateSingletons("page");
	});

	Resolver.docMethod("setResourceAvailable",function(name,available) {
		if (this.namespace.essential.resources[name] == undefined) t
		this.set(["essential","resources",name,"available"], available==undefined? true:available);
		this.reflectModules();
		if (document.body) Generator.instantiateSingletons("page"); // perhaps move to common place
	});

	Resolver.docMethod("reflectModules", function() {
		var modules = this.namespace.essential.modules,
			resources = this.namespace.essential.resources;
		var flags = { loadingScripts:false, launchingScripts:false, loadingResources:false };
		var authenticated = Resolver("page::state.authenticated::");

		for(var n in modules) {
			var m = modules[n];
			if (m.attrs.type == "text/javascript") {
				if (! m.added) {
					if (m.attrs.stage == "authenticated" && authenticated) {
						m.addScript();
					}
				} else if (!m.loaded) {
					if (m.attrs.stage=="preloading" || m.attrs.stage=="loading") flags.loadingScripts = true;
					else flags[m.attrs.stage + "Scripts"] = true;
				}
			} 

			//TODO other types of modules
		}
		for(var n in resources) {
			var r = resources[n];
			if (r.required && (!r.available || !r.loaded)) {
				flags.loadingResources = true;
			}
		}

		this.set("essential.loading", flags.loadingScripts || flags.loadingResources);
		// Maybe/Maybe not, if (!flags.loadingScripts && !flags.loadingResources) this.callInits();
		//TODO set loading/launching
	});

	function queueModule(link,attrs) {
		var name = attrs.name || attrs.src; 

		var module = Resolver("document").declare(["essential","modules",name],new Module(name));
		module.link = link;
		module.attrs = attrs;
		module.attrs["data-module"] = module.name;
	}

	function useBuiltins(doc,list) {
		for(var i=0,r; r = list[i]; ++i) Resolver(doc).set(["essential","enabledRoles",r],true);
	}

    function readCookie(doc,id) {
        var wEQ = id + "=";
        var ca = doc.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(wEQ) == 0) return c.substring(wEQ.length,c.length);
        }
        return undefined;
    }

    function scanElements(doc,els) {
    	var resolver = Resolver(doc), inits = resolver("essential.inits"); 

		for(var i=0,el; el = els[i]; ++i) switch(el.tagName){
			case "meta":
			case "META":
				var attrs = describeLink(el);
				switch(attrs.name) {
					case "enhanced roles":
						if (!el.__applied__) useBuiltins(doc, (el.getAttribute("content") || "").split(" "));
						break;

					//TODO enhanced tags

					case "track main":
						if (this.opener) {
							// document.appstate.set("state.managed",true);
							// docResolver.set("essential.state.managed",true);
							Resolver("page").set("state.managed",true);
						}
						break;

					case "text selection":
						if (!el.__applied__) textSelection((el.getAttribute("content") || "").split(" "));
						break;

					case "lang cookie":
			            var value = readCookie(doc,attrs.content) || readCookie(document, attrs.content);
			            if (value != undefined) {
			                value = decodeURI(value);
			                resolver.set("essential.lang",value);
			            }
						break;

					case "locale cookie":
			            var value = readCookie(doc,attrs.content) || readCookie(document,attrs.content);
			            if (value != undefined) {
			                value = decodeURI(value);
			                resolver.set("essential.locale",value);
			                var s = value.toLowerCase().replace("_","-").split("-");
			                resolver.set("essential.lang",s[0]);
			            }
						break;

				}
				el.__applied__ = true;
				break;

			case "link":
			case "LINK":
				switch(el.rel) {
					// case "stylesheet":
					// 	this.resources().push(l);
					// 	break;			
					case "subresource":
					//case "preload":
					//case "load":
					//case "protected":
					//case "stylesheet":
						if (!el.__applied__) queueModule(el,describeLink(el));
						break;
				}
				el.__applied__ = true;
				break;

			case "script":
			case "SCRIPT":
				var attrs = describeLink(el);
				if (!el.__applied__) switch(attrs.type) {
					case "application/config":
						//TODO try catch log for parse errors
						Resolver.config(doc, el.text);
						break;
					case "application/init": 
						//TODO try catch log for parse errors
						var init = Resolver.functionProxy(el.text);
						init.context = new resolver.InitContext(el);
						inits.push(init);
						break;
					default:
						if (attrs.name && attrs.src == null) resolver.set("essential.modules",name,true); 
						break;
				}
				el.__applied__ = true;
				break;
		}

    }

	function scanHead(doc) {
		var resolver = Resolver(doc), inits = resolver("essential.inits");

		//TODO support text/html use base subpage functionality

		scanElements(doc, doc.head.children);

		// default is english (perhaps make it configurable)
		if (doc.documentElement.lang == "") doc.documentElement.lang = "en";
		if (doc.defaultLang == undefined) doc.defaultLang = doc.documentElement.lang;
	}

	Resolver.docMethod("queueHead", function(addSeal) {
		var doc = this.namespace, essential = doc.essential;
		scanHead(doc);

		for(var n in essential.modules) {
			essential.modules[n].queueHead("preloading",doc.documentElement.lang);
		}		
		if (addSeal !== false) addHeadScript('Resolver("document").seal();',doc);

		// this.reflectModules();	
	});

	Resolver.docMethod("seal",function(sealBody) {
		var essential = this.namespace.essential, doc = this.namespace;

		if (! essential.headSealed) {
			scanHead(doc);
			for(var n in essential.modules) {
				essential.modules[n].queueHead("loading",document.documentElement.lang);
			}		
			essential.headSealed = true;
		}
		if (sealBody && ! essential.bodySealed) {
			var scripts = doc.body.getElementsByTagName("script");
			scanElements(doc,scripts); //TODO use doc.scripts instead?

			for(var n in essential.modules) {
				essential.modules[n].queueHead("loading",document.documentElement.lang);
			}		
			essential.bodySealed = true;
		}
		this.reflectModules();
	});

	function textSelection(tags) {
		var pass = {};
		for(var i=0,n; n = tags[i]; ++i) {
			pass[n] = true;
			pass[n.toUpperCase()] = true;
		}

		var MutableEvent = Resolver("essential::MutableEvent::");
		
		//TODO Resolver.enhanceDocument(doc)
		//TODO test that this works, and register it regardless, just change the config
		addEventListeners(document.documentElement, {
			"selectstart": function(ev) {
				ev = MutableEvent(ev);
				var allow = false;
				for(var el = ev.target; el; el = el.parentNode) {
					if (pass[el.tagName || ""]) allow = true;
				} 
				if (!allow) ev.preventDefault();
				return allow;
			}
		}, true); // capture
	}




}();

