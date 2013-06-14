/*jslint white: true */
/*
	StatefulResolver and ApplicationConfig
*/
!function(Scripted_gather) {

	var essential = Resolver("essential",{}),
		console = essential("console"),
		DOMTokenList = essential("DOMTokenList"),
		MutableEvent = essential("MutableEvent"),
		arrayContains = essential("arrayContains"),
		escapeJs = essential("escapeJs"),
		HTMLElement = essential("HTMLElement"),
		serverUrl = location.protocol + "//" + location.host,
		HTMLScriptElement = essential("HTMLScriptElement"),
		EnhancedDescriptor = essential("EnhancedDescriptor"),
		sizingElements = essential("sizingElements"),
		enhancedElements = essential("enhancedElements"),
		enhancedWindows = essential("enhancedWindows");
	var contains = essential("contains"),
		createHTMLDocument = essential("createHTMLDocument");

	var COPY_ATTRS = ["rel","href","media","type","src","lang","defer","async","name","content","http-equiv","charset"];
	var EMPTY_TAGS = { "link":true, "meta":true, "base":true, "img":true, "br":true, "hr":true, "input":true, "param":true };
	
	function outerHtml(e) {
		var attrs = [e.tagName.toLowerCase()];
		for(var i=0,n; n = COPY_ATTRS[i]; ++i) {
			var a = e[n] || e.getAttribute(n) || null; // tries property first to get absolute urls
			if (a != null) attrs.push(n+'="'+a+'"');
		}
		var tail = "";
		if (! EMPTY_TAGS[attrs[0]]) {
			tail = (e.text || e.innerHTML) + "</" + attrs[0] + ">";
		}

		return "<" + attrs.join(" ") + ">" + tail;
	}

	var nativeClassList = !!document.documentElement.classList;

	function readElementState(el,state) {

		for(var n in state_treatment) {
			var treatment = state_treatment[n], value;
			if (treatment.read) value = treatment.read(el,n);
			if (value == undefined) value = treatment["default"];
			if (value !== undefined) state[n] = value;
		}
	}

	function reflectProperty(el,key,value) {
		el[key] = !!value;
	}

	/*
		Reflect on the property if present otherwise the attribute. 
	*/
	function reflectAttribute(el,key,value) {
		if (typeof el[key] == "boolean") {
			el[key] = !!value;
			return;
		}
		if (value) {
			el.setAttribute(key,key);
		} else {
			el.removeAttribute(key);
		}
	}

	/*
		Reflect only aria property 
	*/
	function reflectAria(el,key,value) {
		if (value) {
			el.setAttribute("aria-"+key,key);
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	/*
		Reflect on property or attribute and aria equivalent. 
	*/
	function reflectAttributeAria(el,key,value) {
		if (value) {
			el.setAttribute(key,key);
		} else {
			el.removeAttribute(key);
		}

		if (value) {
			el.setAttribute("aria-"+key,key);
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	function reflectPropertyAria(el,key,value) {
		if (typeof el[key] == "boolean") {
			el[key] = !!value;
		} else {
			if (value) {
				el.setAttribute(key,key);
			} else {
				el.removeAttribute(key);
			}
		}
		if (value) {
			el.setAttribute("aria-"+key,key);
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	function reflectAriaProp(el,key,value) {
		el[this.property] = value;
	}

	function readPropertyAria(el,key) {
		var value = el.getAttribute("aria-"+key), result;
		if (value != null) result = value != "false" && value != ""; 

		if (el[key] != undefined && !(el[key] === this["default"] && result !== undefined)) result = el[key]; // el.disabled is undefined before attach
		if (result == undefined && ! contains(el.ownerDocument.body,el)) {
			//TODO shift this to an init function used if not parentNode
			value = el.getAttribute(key);
			if (value != null) result = value != "false";//TODO should this be special config for disabled?,.. && value != ""; 
		}

		return result;
	}

	function readAttribute(el,key) {
		var value = el.getAttribute(key), result;
		if (value != null) result = value != "false" && value != ""; 

		return result;
	}

	function readAttributeAria(el,key) {
		var value = el.getAttribute("aria-"+key), result;
		if (value != null) result = value != "false" && value != ""; 

		value = el.getAttribute(key);
		if (value != null) result = value != "false" && value != ""; 

		return result;
	}

	function readAria(el,key) {
		var value = el.getAttribute("aria-"+key), result;
		if (value != null) result = value != "false" && value != ""; 

		value = el.getAttribute(key);
		if (value != null) result = value != "false" && value != ""; 

		return result;
	}

	var state_treatment = {
		disabled: { index: 0, reflect: reflectPropertyAria, read: readPropertyAria, "default":false, property:"ariaDisabled" }, // IE hardcodes a disabled text shadow for buttons and anchors
		readOnly: { index: 1, read: readPropertyAria, "default":false, reflect: reflectProperty },
		hidden: { index: 2, reflect: reflectAttribute, read: readAttributeAria }, // Aria all elements
		required: { index: 3, reflect: reflectAttributeAria, read: readAttributeAria, property:"ariaRequired" },
		expanded: { index: 4, reflect: reflectAttributeAria, read: readAria, property:"ariaExpanded" }, //TODO ariaExpanded
		checked: { index:5, reflect:reflectProperty, read: readPropertyAria, property:"ariaChecked" } //TODO ariaChecked ?

		//TODO inert
		//TODO draggable
		//TODO contenteditable
		//TODO tooltip
		//TODO hover
		//TODO down ariaPressed
		//TODO ariaHidden
		//TODO ariaDisabled
		//TODO ariaSelected

		//TODO aria-hidden all elements http://www.w3.org/TR/wai-aria/states_and_properties#aria-hidden
		//TODO aria-invalid all elements http://www.w3.org/TR/wai-aria/states_and_properties#aria-invalid

		/*TODO IE aria props
			string:
			ariaPressed ariaSelected ariaSecret ariaRequired ariaRelevant ariaReadonly ariaLive
			ariaInvalid ariaHidden ariaBusy ariaActivedescendant ariaFlowto ariaDisabled
		*/

		//TODO restricted/forbidden tie in with session specific permissions

		//TODO focus for elements with focus
	};

    //Temp Old IE check, TODO move to IE shim, shift disabled attr to aria-disabled if IE
    if (document.addEventListener) {
        state_treatment.disabled.reflect = reflectAria;
        // state_treatment.disabled.read = readAttributeAria;
    }
 
	var DOMTokenList_eitherClass = essential("DOMTokenList.eitherClass");
	var DOMTokenList_mixin = essential("DOMTokenList.mixin");
	var DOMTokenList_tmplClass = essential("DOMTokenList.tmplClass");

	function reflectElementState(event) {
		var el = event.data;
		var treatment = state_treatment[event.symbol];
		if (treatment) {
			// known props
			treatment.reflect(el,event.symbol,event.value);
		} else {
			// extra state
		}

		var mapClass = el.stateful("map.class","undefined");
		if (mapClass) {
			var symbolState = mapClass.state[event.symbol],symbolNotState = mapClass.notstate[event.symbol];
			var bits = (symbolState||"").split("%");

			if (bits.length > 1) {
				DOMTokenList_tmplClass(el,bits[0],bits[1],event.value);
			} 
			else DOMTokenList_eitherClass(el,symbolState,symbolNotState,event.value);
		} 
	}

	/*
		class = <prefix classes> <model classes> <state classes>
	*/
	function reflectElementClass(event) {
		// state-hover state-active state-disabled
		var stateClasses = [];
		stateClasses[0] = state.disabled? "state-disabled" : "";
	}

	function ClassForState() {

	}
	ClassForState.prototype.disabled = "state-disabled";
	ClassForState.prototype.readOnly = "state-readOnly";
	ClassForState.prototype.hidden = "state-hidden";
	ClassForState.prototype.required = "state-required";
	ClassForState.prototype.expanded = "state-expanded";

	function ClassForNotState() {

	}
	ClassForNotState.prototype.disabled = "";
	ClassForNotState.prototype.readOnly = "";
	ClassForNotState.prototype.hidden = "";
	ClassForNotState.prototype.required = "";
	ClassForNotState.prototype.expanded = "";

	function make_Stateful_fireAction(el) {
		return function() {
			var ev = MutableEvent({
				"target":el
			}).withActionInfo(); 
			fireAction(ev);
		};
	}

	function Stateful_reflectStateOn(el,useAsSource) {
		var stateful = el.stateful = this;
		if (el._cleaners == undefined) el._cleaners = [];
		//TODO consider when to clean body element
		if (!arrayContains(el._cleaners,statefulCleaner)) el._cleaners.push(statefulCleaner); 
		if (useAsSource != false) readElementState(el,stateful("state"));
		stateful.on("change","state",el,reflectElementState); //TODO "livechange", queues up calls while not live
		if (!nativeClassList) {
			el.classList = DOMTokenList();
			DOMTokenList_mixin(el.classList,el.className);
		}
		var mapClass = el.stateful("map.class","undefined");
		if (mapClass) StatefulResolver.updateClass(stateful,el); //TODO move 
	}
 
	// all stateful elements whether field or not get a cleaner
	function statefulCleaner() {
		if (this.stateful) {
			this.stateful.destroy();
			if (this.stateful.discard) this.stateful.discard();
			this.stateful.fireAction = undefined;
			this.stateful = undefined;
		}
	}
	essential.declare("statefulCleaner",statefulCleaner);

	/*
	  StatefulResolver()
	  StatefulResolver(el)
	  StatefulResolver(el,true)
	*/
	function StatefulResolver(el,mapClassForState) {
		if (el && el.stateful) return el.stateful;

		var resolverOptions = {};
		if (typeof mapClassForState == "object") {
			resolverOptions = mapClassForState;
			mapClassForState = mapClassForState.mapClassForState;//TODO consider different name 
		}
		var stateful = Resolver({ state: {} },resolverOptions);
		if (mapClassForState) {
			stateful.set("map.class.state", new ClassForState());
			stateful.set("map.class.notstate", new ClassForNotState());
		}
		stateful.fireAction = make_Stateful_fireAction(el);
		stateful.reflectStateOn = Stateful_reflectStateOn;

		if (el) stateful.reflectStateOn(el);
		
		return stateful;
	}
	essential.declare("StatefulResolver",StatefulResolver);

	var pageResolver = StatefulResolver(null,{ name:"page", mapClassForState:true });

	// application/config declarations on the main page
	pageResolver.declare("config",{});

	// descriptors for elements on main page to enhance
	pageResolver.declare("descriptors",{});

	pageResolver.reference("state").mixin({
		"livepage": false,
		"background": false, // is the page running in the background
		"authenticated": true,
		"authorised": true,
		"connected": true,
		"online": true, //TODO update
		"preloading": false,
		"loading": true,
		"loadingConfig": false,
		"loadingScripts": false,
		"configured": true,
		"fullscreen": false,
		"launching": false, 
		"launched": false,

		"lang": document.documentElement.lang || "en",

		"loadingScriptsUrl": {},
		"loadingConfigUrl": {}
		});
	pageResolver.reference("connection").mixin({
		"loadingProgress": "",
		"status": "connected",
		"detail": "",
		"userName": "",
		"logStatus": false
	});

	pageResolver.declare("handlers.init",{});
	pageResolver.declare("handlers.enhance",{});
	pageResolver.declare("handlers.sizing",{});
	pageResolver.declare("handlers.layout",{});
	pageResolver.declare("handlers.discard",{});

	pageResolver.reference("map.class.state").mixin({
		authenticated: "authenticated",
		loading: "loading",
		//login-error
		launched: "launched",
		launching: "launching",
		livepage: "livepage"
	});

	pageResolver.reference("map.class.notstate").mixin({
		authenticated: "login"
	});

	StatefulResolver.updateClass = function(stateful,el) {
		var triggers = {};
		for(var n in state_treatment) triggers[n] = true;
		for(var n in stateful("map.class.state")) triggers[n] = true;
		for(var n in stateful("map.class.notstate")) triggers[n] = true;
		for(var n in triggers) {
			stateful.reference("state."+n,"null").trigger("change");
		}
	};

	/*
		Area Activation
	*/
	var _activeAreaName,_liveAreas=false;

	function activateArea(areaName) {
		if (! _liveAreas) { //TODO switch to pageResolver("livepage")
			_activeAreaName = areaName;
			return;
		}
		
		//TODO maintained & reacting to resolver change state.activeArea
		for(var n in EnhancedDescriptor.all) {
			var desc = EnhancedDescriptor.all[n];
			if (desc.layouter) desc.layouter.updateActiveArea(areaName,desc.el);
		}
		_activeAreaName = areaName;
		EnhancedDescriptor.maintainAll();
	}
	essential.set("activateArea",activateArea);
	
	function getActiveArea() {
		return _activeAreaName;
	}
	essential.set("getActiveArea",getActiveArea);

	var _essentialTesting = !!document.documentElement.getAttribute("essential-testing");

	function bringLive() {
		// var ap = ApplicationConfig(); //TODO factor this and possibly _liveAreas out

		for(var i=0,w; w = enhancedWindows[i]; ++i) if (w.openWhenReady) {
			w.openNow();
			delete w.openWhenReady;
		}
		EnhancedWindow.prototype.open = EnhancedWindow.prototype.openNow;

		//TODO if waiting for initial page src postpone this

		// Allow the browser to render the page, preventing initial transitions
		_liveAreas = true;
		pageResolver.set("state.livepage",true);

	}

	function onPageLoad(ev) {
		_liveAreas = true;
		pageResolver.set("state.livepage",true);
	}

	if (!_essentialTesting) {
		if (window.addEventListener) window.addEventListener("load",onPageLoad,false);
		else if (window.attachEvent) window.attachEvent("onload",onPageLoad);
	}

	// page state & sub pages instances of _Scripted indexed by logical URL / id
	Resolver("page").declare("pages",{});
	Resolver("page").declare("state.requiredPages",0);

	function _Scripted() {
		// the derived has to define resolver before this
		this.config = this.resolver.reference("config","undefined");
		this.resolver.declare("resources",[]);
		this.resources = this.resolver.reference("resources");
		this.resolver.declare("inits",[]);
		this.inits = this.resolver.reference("inits");
	}

	_Scripted.prototype.declare = function(key,value) {
		this.config.declare(key,value);
		if (typeof value == "object") {
			if (value["introduction-area"]) this.resolver.declare("introduction-area",value["introduction-area"]);
			if (value["authenticated-area"]) this.resolver.declare("authenticated-area",value["authenticated-area"]);
		}
	}; 

	_Scripted.prototype.modules = { "domReady":true };	// keep track of what modules are loaded

	_Scripted.prototype.context = {
		"require": function(path) {
			if (this.modules[path] == undefined) {
				var ex = new Error("Missing module '" + path + "'");
				ex.ignore = true;
				throw ex;	
			} 
		}
	};

	_Scripted.prototype._gather = Scripted_gather;

	var _singleQuotesRe = new RegExp("'","g");

	_Scripted.prototype._getElementRoleConfig = function(element,key) {
		//TODO cache the config on element.stateful

		var config = null;

		// mixin the declared config
		if (key) {
			var declared = this.config(key);
			if (declared) {
				config = {};
				for(var n in declared) config[n] = declared[n];
			}
		}

		if (element == this.body) {
			var declared = this.config("body");
			if (declared) {
				config = config || {};
				for(var n in declared) config[n] = declared[n];
			}
		}
		else if (element == this.head) {
			var declared = this.config("head");
			if (declared) {
				config = config || {};
				for(var n in declared) config[n] = declared[n];
			}
		}

		// mixin the data-role
		var dataRole = element.getAttribute("data-role");
		if (dataRole) try {
			config = config || {};
			var map = JSON.parse("{" + dataRole.replace(_singleQuotesRe,'"') + "}");
			for(var n in map) config[n] = map[n];
		} catch(ex) {
			console.debug("Invalid config: ",dataRole,ex);
			config["invalid-config"] = dataRole;
		}

		return config;
	};

	_Scripted.prototype.getElement = function(key) {
		var keys = key.split(".");
		var el = this.document.getElementById(keys[0]);
		if (el && keys.length > 1) el = el.getElementByName(keys[1]);
		return el;
	};

	_Scripted.prototype.declare = function(key,value) {
		this.config.declare(key,value);
	};

	_Scripted.prototype.getConfig = function(element) {
		if (element.id) {
			return this._getElementRoleConfig(element,element.id);
		}
		var name = element.getAttribute("name");
		if (name) {
			var p = element.parentNode;
			while(p && p.tagName) {
				if (p.id) {
					return this._getElementRoleConfig(element,p.id + "." + name);
				} 
				p = p.parentNode;
			} 
		}
		return this._getElementRoleConfig(element);
	};

	_Scripted.prototype._prep = function(el,context) {

		var e = el.firstElementChild!==undefined? el.firstElementChild : el.firstChild;
		while(e) {
			if (e.attributes) {
				var conf = this.getConfig(e), role = e.getAttribute("role");
				// var sizingElement = false;
				// if (context.layouter) sizingElement = context.layouter.sizingElement(el,e,role,conf);
				var desc = EnhancedDescriptor(e,role,conf,false,this);
				if (desc) {
					// if (sizingElement) sizingElements[desc.uniqueId] = desc;
					desc.layouterParent = context.layouter;
					if (desc.conf.layouter) {
						context.layouter = desc;
					}
				} else {

				}
				if (desc==null || !desc.contentManaged) this._prep(e,{layouter:context.layouter});
			}
			e = e.nextElementSibling!==undefined? e.nextElementSibling : e.nextSibling;
		}
	};

	/*
		Prepare enhancing elements with roles/layout/laidout
	*/
	_Scripted.prototype.prepareEnhance = function() {

		this._gather(this.head.getElementsByTagName("script"));
		this._gather(this.body.getElementsByTagName("script"));		
		this._prep(this.body,{});
	};

	function delayedScriptOnload(scriptRel) {
		function delayedOnload(ev) {
			var el = this;
			var name = el.getAttribute("name");
			if (name) {
				ApplicationConfig().modules[name] = true;
			}
			setTimeout(function(){
				// make sure it's not called before script executes
				var scripts = pageResolver(["state","loadingScriptsUrl"]);
				if (scripts[el.src.replace(essential("baseUrl"),"")] != undefined) {
					// relative url
					pageResolver.set(["state","loadingScriptsUrl",el.src.replace(essential("baseUrl"),"")],false);
				} else if (scripts[el.src.replace(serverUrl,"")] != undefined) {
					// absolute url
					pageResolver.set(["state","loadingScriptsUrl",el.src.replace(serverUrl,"")],false);
				}
			},0);
		}
		return delayedOnload;       
	}

	_Scripted.prototype._queueAssets = function() {

		var links = this.document.getElementsByTagName("link");

		//TODO differentiate on type == "text/javascript"
		for(var i=0,l; l=links[i]; ++i) switch(l.rel) {
			case "stylesheet":
				this.resources().push(l);
				break;			
			case "pastload":
			case "preload":
				//TODO differentiate on lang
				var attrsStr = l.getAttribute("attrs");
				var attrs = {};
				if (attrsStr) {
					try {
						eval("attrs = {" + attrsStr + "}");
					} catch(ex) {
						//TODO
					}
				}
				attrs["type"] = l.getAttribute("type") || "text/javascript";
				attrs["src"] = l.getAttribute("src");
				attrs["name"] = l.getAttribute("data-name") || l.getAttribute("name") || undefined;
				attrs["base"] = essential("baseUrl");
				attrs["subpage"] = (l.getAttribute("subpage") == "false" || l.getAttribute("data-subpage") == "false")? false:true;
				//attrs["id"] = l.getAttribute("script-id");
				attrs["onload"] = delayedScriptOnload(l.rel);

				var relSrc = attrs["src"].replace(essential("baseUrl"),"");
				l.attrs = attrs;
				if (l.rel == "preload") {
					var langOk = true;
					if (l.lang) langOk = (l.lang == this.resolver("state.lang"));
					if (langOk) {
						this.resolver.set(["state","preloading"],true);
						this.resolver.set(["state","loadingScripts"],true);
						this.resolver.set(["state","loadingScriptsUrl",relSrc],l); 
						this.body.appendChild(HTMLScriptElement(attrs));
						l.added = true;
					} 
				} else {
					var langOk = true;
					if (l.lang) langOk = (l.lang == this.resolver("state.lang"));
					if (langOk) {
						this.resolver.set(["state","loadingScripts"],true);
						this.resolver.set(["state","loadingScriptsUrl",relSrc],l); 
					} 
				}
				break;
		}
		if (! this.resolver(["state","preloading"])) {
			var scripts = this.resolver(["state","loadingScriptsUrl"]);
			for(var n in scripts) {
				var link = scripts[n];
				if (link.rel == "pastload") {
					var langOk = true;
					if (link.lang) langOk = (link.lang == this.resolver("state.lang"));
					if (langOk) {
						this.body.appendChild(HTMLScriptElement(link.attrs));
						link.added = true;
					} 
				}
			}
		}

	};



	function _SubPage(appConfig) {
		// subpage application/config and enhanced element descriptors
		this.resolver = Resolver({ "config":{}, "descriptors":{}, "handlers":pageResolver("handlers") });
		this.document = document;
		_Scripted.call(this);

		if (appConfig) this.appConfig = appConfig; // otherwise the prototype will have the default
		this.body = document.createElement("DIV");
	}
	var SubPage = Generator(_SubPage,{"prototype":_Scripted.prototype});

	SubPage.prototype.page = function(url) {
		console.error("SubPage application/config cannot define pages ("+url+")",this.url);
	};

	// keep a head prefix with meta tags for iframe/window subpages
	SubPage.prototype.headPrefix = ['<head>'];
	var metas = (document.head || document.documentElement.firstChild).getElementsByTagName("meta");
	for(var i=0,e; e = metas[i]; ++i) {
		SubPage.prototype.headPrefix.push(outerHtml(e));
	}

	SubPage.prototype.fetch = function() {

		var XMLHttpRequest = essential("XMLHttpRequest");
	    var xhr = XMLHttpRequest();
	    xhr.page = this;

	    if (typeof(xhr.overrideMimeType) === 'function') {
	        xhr.overrideMimeType('text/html');
	    }
	    xhr.open('GET', this.url, /* async */true);
	    //TODO utf-8
	    xhr.setRequestHeader('Accept', 'text/html; q=0.9, */*; q=0.5');
	    try {
		    xhr.send(null);

		    if (essential("isFileProtocol")) {
		        if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
		            this.loadedPageDone(xhr.responseText);
		        } else {
		            this.loadedPageError(xhr.status);
		        }
		    } else {
		        xhr.onreadystatechange = function () {
		            if (xhr.readyState == 4) {
		                handleResponse(xhr, this.page, this.page.loadedPageDone, this.page.loadedPageError);
		            }
		        };
		    } 
	    }
	    catch(ex) {
	    	this.loadedPageError(null,ex); //TODO no net for instance
	    }
	};

    function handleResponse(xhr, instance, callback, errback) {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback.call(instance,xhr.responseText,
                     xhr.getResponseHeader("Last-Modified"));
        } else if (typeof(errback) === 'function') {
            errback.call(instance,xhr.status);
        }
    }

	SubPage.prototype.loadedPageDone = function(text,lastModified) {
		var doc = this.document = createHTMLDocument(text);
		this.head = doc.head;
		this.body = doc.body;
		this.documentLoaded = true;

		this.prepareEnhance();

		if (this.requiredForLaunch) {
			var requiredPages = pageResolver("state.requiredPages") - 1;
			pageResolver.set("state.requiredPages",requiredPages);
		}

        if (this.onload) this.onload({});
		//TODO applyBody to other destinations?
	};

	SubPage.prototype.loadedPageError = function(status) {
		this.documentError = status;
		this.documentLoaded = true;
	};

	SubPage.prototype.parseHTML = function(text) {
		var doc = this.document = createHTMLDocument(text);
		this.head = doc.head;
		this.body = doc.body;
		this.documentLoaded = true;

		this.resolver.declare("handlers",pageResolver("handlers"));
		this.prepareEnhance();
	};

	SubPage.prototype.applyBody = function() {
		var e = this.body.firstElementChild!==undefined? this.body.firstElementChild : this.body.firstChild,
			db = document.body,
			fc = db.firstElementChild!==undefined? db.firstElementChild : db.firstChild;


		//TODO import the elements ? or only allow getElement for a while
		// try {
		// 	this.head = document.importNode(doc.head,true);
		// 	this.body = document.importNode(doc.body,true);
		// }
		// catch(ex) {
		// 	this.head = doc.head;
		// 	this.body = doc.body;
		// }

		while(e) {
			// insert before the first permanent, or at the end
			if (fc == null) {
				db.appendChild(e);
			} else {
				db.insertBefore(e,fc);
			}
			e = this.body.firstElementChild!==undefined? this.body.firstElementChild : this.body.firstChild;
		}
		this.applied = true;
		enhanceUnhandledElements();
	};

	SubPage.prototype.unapplyBody = function() {
		var db = document.body, 
			pc = null,
			e = db.lastElementChild!==undefined? db.lastElementChild : db.lastChild;

		while(e) {
			if (e.permanent) {
				// not part of subpage
				e = e.previousElementSibling || e.previousSibling;
			} else {
				if (pc == null) {
					this.body.appendChild(e);
				} else {
					this.body.insertBefore(e,pc)
				}
				pc = e;
			}
			e = db.lastElementChild!==undefined? db.lastElementChild : db.lastChild;
		}
		this.applied = false;
	};

	SubPage.prototype.doesElementApply = function(el) {
		if (el.attrs) {
			return el.attrs["subpage"] == false? false : true;
		}
		if (el.getAttribute("subpage") == "false") return false;
		if (el.getAttribute("data-subpage") == "false") return false;
		return true;
	};

	SubPage.prototype.getHeadHtml = function() {
		var resources = ApplicationConfig().resources(),
			loadingScriptsUrl = ApplicationConfig().resolver("state.loadingScriptsUrl"),
			p = [],
			base = "";

		for(var i=0,r; r = resources[i]; ++i) {
			if (this.doesElementApply(r)) p.push( outerHtml(r) );
		}
		for(var u in loadingScriptsUrl) {
			var link = loadingScriptsUrl[u];
			base = link.attrs.base;
			if (this.doesElementApply(link)) p.push( outerHtml(link) );
		}
		if (base) base = '<base href="'+base+'">';
		p.push('</head>');
		return escapeJs(this.headPrefix.join("") + base + p.join(""));

	};

	SubPage.prototype.getBodyHtml = function() {
		var p = [
			'<body>',
			this.body.innerHTML,
			'</body>'
		];
		return p.join("");
		
	};

	SubPage.prototype.getInlineUrl = function() {
		var p = [
			'javascript:document.write("',
			'<html><!-- From Main Window -->',
			this.getHeadHtml(),
			this.getBodyHtml(),
			'</html>',
			'");'
		];

		return p.join("");
	};


	function cacheError(ev) {
		pageResolver.set(["state","online"],false);	
	}

	function updateOnlineStatus(ev) {
		//console.log("online status",navigator.onLine,ev);
		var online = navigator.onLine;
		if (online != undefined) {
			pageResolver.set(["state","online"],online);	
		}
	}
	pageResolver.updateOnlineStatus = updateOnlineStatus;


	function _ApplicationConfig() {
		this.resolver = pageResolver;
		this.document = document;
		this.head = this.document.head || this.document.body.previousSibling;
		this.body = this.document.body;
		_Scripted.call(this);

		updateOnlineStatus();
		if (this.body.addEventListener) {
			this.body.addEventListener("online",updateOnlineStatus);
			this.body.addEventListener("offline",updateOnlineStatus);
		
			if (window.applicationCache) applicationCache.addEventListener("error", updateOnlineStatus);
		} else if (this.body.attachEvent) {
			// IE8
			this.body.attachEvent("online",updateOnlineStatus);
			this.body.attachEvent("offline",updateOnlineStatus);
		}

		// copy state presets for backwards compatibility
		var state = this.resolver.reference("state","undefined");
		for(var n in this.state) state.set(n,this.state[n]);
		this.state = state;
		document.documentElement.lang = this.state("lang");
		state.on("change",this,this.onStateChange);
		this.resolver.on("change","state.loadingScriptsUrl",this,this.onLoadingScripts);
		this.resolver.on("change","state.loadingConfigUrl",this,this.onLoadingConfig);

		this.pages = this.resolver.reference("pages",{ generator:SubPage});
		SubPage.prototype.appConfig = this;

		pageResolver.reflectStateOn(document.body,false);
		this.prepareEnhance();

		var conf = this.getConfig(this.body), role = this.body.getAttribute("role");
		if (conf || role)  EnhancedDescriptor(this.body,role,conf,false,this);

		this._markPermanents();
		var bodySrc = document.body.getAttribute("data-src") || document.body.getAttribute("src");
		if (bodySrc) this._requiredPage(bodySrc);

		if (!_essentialTesting) setTimeout(bringLive,60); 
	}

	var ApplicationConfig = essential.set("ApplicationConfig", Generator(_ApplicationConfig,{"prototype":_Scripted.prototype}) );
	
	// preset on instance (old api)
	ApplicationConfig.presets.declare("state", { });

	ApplicationConfig.prototype.getIntroductionArea = function() {
		var pages = this.resolver("pages");
		for(var n in pages) {
			var page = pages[n];
			if (page.applied) {
				var area = page.resolver("introduction-area","null");
				if (area) return area;
			}
		}
		return this.resolver("introduction-area","null") || "introduction";
	};

	ApplicationConfig.prototype.getAuthenticatedArea = function() {
		var pages = this.resolver("pages");
		for(var n in pages) {
			var page = pages[n];
			if (page.applied) {
				var area = page.resolver("authenticated-area","null");
				if (area) return area;
			}
		}
		return this.resolver("authenticated-area","null") || "authenticated";
	};

	ApplicationConfig.prototype.page = function(url,options,content,content2) {
		//this.pages.declare(key,value);
		var page = this.pages()[url]; //TODO options in reference onundefined:generator & generate
		if (page == undefined) {
			page = this.pages()[url] = SubPage();
		}
		if (!page.documentLoaded) {
			page.url = url;
			page.options = options;
			page.parseHTML(content,content2);
		}

		return page;
	};

	ApplicationConfig.prototype._requiredPage = function(src)
	{
		//TODO if already there page.applyBody();
		var page = this.loadPage(src,true);
		this.bodySrc = src;
		this.appliedSrc = null;
        page.onload = function(ev) {
            //TODO unapply if another is applied
            this.applyBody();
        };
		//TODO what about multiple calls ?
		//TODO queue loading this as the initial body content added before the first body child
	};

	ApplicationConfig.prototype.loadPage = function(url,requiredForLaunch,onload) {
		var page = this.pages()[url]; //TODO options in reference onundefined:generator & generate
		if (page == undefined) {
			page = this.pages()[url] = SubPage();
			page.url = url;
			page.requiredForLaunch = requiredForLaunch;
			if (requiredForLaunch) {
				var requiredPages = pageResolver("state.requiredPages") + 1;
				pageResolver.set("state.requiredPages",requiredPages);
			}
			page.onload = onload;
		}
		if (!page.documentLoaded) {
			page.fetch();
		}

		return page;
	};

	function enhanceUnhandledElements() {
		var statefuls = ApplicationConfig(); // Ensure that config is present
		//var handlers = DocumentRoles.presets("handlers");
		//TODO listener to presets -> Doc Roles additional handlers
		var dr = essential("DocumentRoles")()
		// dr._enhance_descs(enhancedElements);
		var descs = statefuls.resolver("descriptors");
		dr._enhance_descs(descs);
		dr._enhance_descs(descs);
		
		//TODO pendingDescriptors and descriptors

		//TODO time to default_enhance yet?

		//TODO enhance active page
		var pages = pageResolver("pages");
		for(var n in pages) {
			var page = pages[n];
			if (page.applied) {
				var descs = page.resolver("descriptors");
				dr._enhance_descs(descs);
			}
		}
	}

	ApplicationConfig.prototype.onStateChange = function(ev) {
		switch(ev.symbol) {
			case "livepage":
				var ap = ev.data;
				//if (ev.value == true) ap.reflectState();
				ev.data.doInitScripts();
				if (_activeAreaName) {
					activateArea(_activeAreaName);
				} else {
					if (ev.base.authenticated) activateArea(ap.getAuthenticatedArea());
					else activateArea(ap.getIntroductionArea());
				}
				break;
			case "loadingScripts":
			case "loadingConfig":
				//console.log("loading",this("state.loading"),this("state.loadingScripts"),this("state.loadingConfig"))
				--ev.inTrigger;
				this.set("state.loading",ev.base.loadingScripts || ev.base.loadingConfig);
				++ev.inTrigger;
				break;

			case "preloading":
				if (! ev.value) {
					for(var n in ev.base.loadingScriptsUrl) {
						var link = ev.base.loadingScriptsUrl[n];
						if (link.rel == "pastload" && !link.added) {
							var langOk = true;
							if (link.lang) langOk = (link.lang == pageResolver("state.lang"));
							if (langOk) document.body.appendChild(HTMLScriptElement(link.attrs));
							link.added = langOk;
						}
					}
				}
				break;

			case "loading":
				if (ev.value == false) {
					if (document.body) essential("instantiatePageSingletons")();
					ev.data.doInitScripts();	
					enhanceUnhandledElements();
					if (window.widget) widget.notifyContentIsReady(); // iBooks widget support
					if (ev.base.configured == true && ev.base.authenticated == true 
						&& ev.base.authorised == true && ev.base.connected == true && ev.base.launched == false) {
						this.set("state.launching",true);
						// do the below as recursion is prohibited
						if (document.body) essential("instantiatePageSingletons")();
						enhanceUnhandledElements();
					}
				} 
				break;
			case "authenticated":
				var ap = ev.data;
				if (ev.base.authenticated) activateArea(ap.getAuthenticatedArea());
				else activateArea(ap.getIntroductionArea());
				// no break
			case "authorised":
			case "configured":
				if (ev.base.loading == false && ev.base.configured == true && ev.base.authenticated == true 
					&& ev.base.authorised == true && ev.base.connected == true && ev.base.launched == false) {
					this.set("state.launching",true);
					// do the below as recursion is prohibited
					if (document.body) essential("instantiatePageSingletons")();
					ev.data.doInitScripts();	
					enhanceUnhandledElements();
				}
				break;			
			case "launching":
			case "launched":
				if (ev.value == true) {
					if (document.body) essential("instantiatePageSingletons")();
					ev.data.doInitScripts();	
					enhanceUnhandledElements();
					if (ev.symbol == "launched" && ev.base.requiredPages == 0) this.set("state.launching",false);
				}
				break;
			case "requiredPages":
				if (ev.value == 0 && !ev.base.launching) {
					this.set("state.launching",false);
				}
				break
			case "lang":
				document.documentElement.lang = ev.value;
				break;
			
			default:
				if (ev.base.loading==false && ev.base.launching==false && ev.base.launched==false) {
					if (document.body) essential("instantiatePageSingletons")();
				}
		}
	};

	ApplicationConfig.prototype.onLoadingScripts = function(ev) {
		var loadingScriptsUrl = this("state.loadingScriptsUrl");
			
		var loadingScripts = false;
		var preloading = false;
		for(var url in loadingScriptsUrl) {
			var link = loadingScriptsUrl[url];
			if (link.rel == "preload") preloading = true;
			if (link) loadingScripts = true;
		}
		this.set("state.loadingScripts",loadingScripts);
		this.set("state.preloading",preloading);
		if (ev.value==false) {
			// finished loading a script
			if (document.body) essential("instantiatePageSingletons")();
		}
	};

	ApplicationConfig.prototype.onLoadingConfig = function(ev) {
		var loadingConfigUrl = this("state.loadingConfigUrl");
			
		var loadingConfig = false;
		for(var url in loadingConfigUrl) {
			if (loadingConfigUrl[url]) loadingConfig = true;
		}
		this.set("state.loadingConfig",loadingConfig);
		if (ev.value==false) {
			// finished loading a config
			if (document.body) essential("instantiatePageSingletons")();
		}
	};

	ApplicationConfig.prototype.isPageState = function(whichState) {
		return this.resolver("state."+whichState);
	};
	ApplicationConfig.prototype.setPageState = function(whichState,v) {
		this.resolver.set(["state",whichState],v);
	};

	ApplicationConfig.prototype._markPermanents = function() 
	{
		var e = document.body.firstElementChild!==undefined? document.body.firstElementChild : document.body.firstChild;
		while(e) {
			e.permanent = true;
			e = e.nextElementSibling!==undefined? e.nextElementSibling : e.nextSibling;
		}
	};

	ApplicationConfig.prototype.doInitScripts = function() {
		var inits = this.inits();
		for(var i=0,s; s = inits[i]; ++i) if (s.parentNode && !s.done) {
			// this.currently = s
			try {
				this.context["element"] = s;
				this.context["parentElement"] = s.parentElement || s.parentNode;
				with(this.context) eval(s.text);
				s.done = true;
			} catch(ex) {
				// debugger;
			} //TODO only ignore ex.ignore
		}
		this.context["this"] = undefined;
	};

	// iBooks HTML widget
	if (window.widget) {
		widget.pauseAudioVisual = function() {
			pageResolver.set("state.background",true);
		};

		widget.didEnterWidgetMode = function() {
			pageResolver.set("state.background",false);
		};	
	}

	function onmessage(ev) {
		var data = JSON.parse(ev.data);
		if (data && data.enhanced && data.enhanced.main.width && data.enhanced.main.height) {
			placement.setOptions(data.enhanced.options);
			placement.setMain(data.enhanced.main);
			placement.track();
		}
	} 

	var placement = {
		x: undefined, y: undefined,
		width: undefined, height: undefined,

		options: {},
		main: {},
		
		notifyNeeded: false,

		setOptions: function(options) {
			this.options = options;
		},

		setMain: function(main) {
			this.main = main;
		},

		// measure this window flagging if it notifyNeeded since last time
		measure: function() {
			var	x= window.screenX, y= window.screenY, width= window.outerWidth, height= window.outerHeight;
			this.notifyNeeded = (this.notifyNeeded || x != this.x || y != this.y || width != this.width || height != this.height);
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;

			this.data = JSON.stringify({
				x:x, y:y, width:width, height:height
			});
		},

		// track main window
		track: function() {
			var x=this.x, y=this.y, width=this.width, height=this.height;

			if (this.options.glueHeight) {
				y = this.main.y;
				height = this.main.height;
			}
			if (this.options.glueWidth) {
				x = this.main.x;
				width = this.main.width;
			}
			if (this.options.glueLeft) {
				x = this.main.x - this.options.width;
			} else if (this.options.glueRight) {
				x = this.main.x + this.main.width;
			}
			if (this.options.glueTop) {
				y = this.main.y - this.options.height;
			} else if (this.options.glueBottom) {
				y = this.main.y + this.main.height;
			}
			if (x != this.x || y != this.y) {
				var maxX = screen.width - this.width,maxY = screen.height - this.height;
				x = x === undefined? 0 : Math.min(Math.max(0,x),maxX);
				y = y === undefined? 0 : Math.min(Math.max(0,y),maxY);
			}

			if (x != this.x || y != this.y) {
				if (window.moveTo) window.moveTo(x - screen.availLeft,y - screen.availTop);
			}

			if (width != this.width || height != this.height) {
				if (window.resizeTo) window.resizeTo(width,height);
			}

			this.notifyNeeded = (this.notifyNeeded || x != this.x || y != this.y || width != this.width || height != this.height);
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}
	};
	placement.measure();
	placement.notifyNeeded = false;
	essential.declare("placement",placement);

	//TODO make this testable
	placement.broadcaster = setInterval(function() {
		placement.measure();
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			w.notify();
		}
		if (placement.notifyNeeded) ;//TODO hide elements if zero, show if pack from zero
		placement.notifyNeeded = false;
	},250);


	function trackMainWindow() {
		placement.track();
	}

	// tracking main window
	if (window.opener) {

		// TODO might not be needed
		setInterval(trackMainWindow,250);

		if (window.postMessage) {
			if (window.addEventListener) {
				window.addEventListener("message",onmessage,false);

			} else if (window.attachEvent) {
				window.attachEvent("onmessage",onmessage);

			}
			//TODO removeEvent
		}


	}

	function EnhancedWindow(url,name,options,index) {
		this.name = name;
		this.url = url;
		this.options = options || {};
		this.notifyNeeded = true;
		this.index = index;
		this.width = this.options.width || 100;
		this.height = this.options.height || 500;
	}

	EnhancedWindow.prototype.override = function(url,options) {
		this.url = url;
		this.options = options;
		this.notifyNeeded = true;
	};

	EnhancedWindow.prototype.content = function() {
		// get subpage
		// html, head, body
	};

	EnhancedWindow.prototype.close = function() {
		if (this.window) this.window.close();
		this.window = null;
	};

	EnhancedWindow.prototype.open = function() {
		this.openWhenReady = true;
	};

	EnhancedWindow.prototype.openNow = function() {
		this.close();
		var features = "menubar=no,width="+(this.width)+",height="+(this.height)+",status=no,location=no,toolbar=no";

		var page = ApplicationConfig().pages()[this.url];
		var url = page? page.getInlineUrl() : this.url;
		this.window = window.open(url,this.name,features);

		var that = this;
		// do this to fix Chrome 20
		setTimeout(function() {
			that.notify({});
		},50);
	};

	EnhancedWindow.prototype.anchor = function(html,opts) {
		var attrs = { href: 'javascript:void(0);' }, that = this;
		if (this.name) attrs.target = this.name;
		attrs.onclick = function(ev) {
			that.open();
			if (ev && ev.preventDefault) ev.preventDefault();
			return false;
		};
		if (opts["class"]) attrs["class"] = opts["class"];
		return HTMLElement("a",attrs,html);
	};

	EnhancedWindow.prototype.notify = function(ev) {
		if (this.window && this.window.postMessage && (this.notifyNeeded || placement.notifyNeeded)) {
			var options = JSON.stringify(this.options);
			this.window.postMessage('{"enhanced":{'+'"options":' + options + ', "main":' + placement.data + '}}',"*");
		} 
		this.notifyNeeded = false;
	};

	EnhancedWindow.prototype.reposition = function(ev) {
		//TODO

		if (this.options.focus && this.window.focus) this.window.focus();
	};

	function defineWindow(url,name,options) {
		if (name) for(var i=0,w; w = enhancedWindows[i]; ++i) {
			if (name == w.name) {
				w.override(url,options);
				w.open();
				return;
			}
		}
		var win = new EnhancedWindow(url,name,options,enhancedWindows.length);
		enhancedWindows.push(win);
		return win;
	}
	essential.declare("defineWindow",defineWindow);


	function openSidebar(url, options) {
		var nav = HTMLElement("nav");
		var subPage = getSubPage(url);
		subPage.fetch();
		nav.innerHTML = subPage.body.content;
		document.body.appendChild(nav);
	}
	essential.declare("openSidebar",openSidebar);

	function openWindow(url, name, options) {
		//TODO support proxied essential?
		var w = defineWindow(url, name, options);
		w.open();
		return w;
		//TODO position width 0 width tracking left/right
	}
	essential.declare("openWindow",openWindow);

}(
// need with context not supported in strict mode
function(scripts) {
	var resources = this.resources();
	var inits = this.inits();

	for(var i=0,s; s = scripts[i]; ++i) {
		switch(s.getAttribute("type")) {
			case "application/config":
				try {
					with(this) eval(s.text);
				} catch(ex) {
					Resolver("essential::console").error("Failed to parse application/config",s.text);
				}
				break;
			case "application/init": 
				inits.push(s);
				break;
			default:
				var name = s.getAttribute("name");
				if (name && s.getAttribute("src") == null) this.modules[name] = true; 
				//TODO onload if src to flag that module is loaded
				if (s.parentNode == document.head) {
					resources.push(s);
				}
				break;
		}
	}
}
);
