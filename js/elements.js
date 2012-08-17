(function(){
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{});
	var ObjectType = essential("ObjectType");
	var console = essential("console");
	var ArraySet = essential("ArraySet");
	var baseUrl = location.href.substring(0,location.href.split("?")[0].lastIndexOf("/")+1);

	var nativeClassList = !!document.documentElement.classList;

	function mixinElementState(el,state) {
		state.disabled = el.disabled || false; // undefined before attach
		state.readOnly = el.readOnly || false;
		state.hidden = el.getAttribute("hidden") != null;
		state.required = el.getAttribute("required") != null;
	}

	function reflectProperty(el,key,value) {
		el[key] = !!value;
	}

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

	var state_treatment = {
		disabled: { index: 0, reflect: reflectProperty },
		readOnly: { index: 1, reflect: reflectProperty },
		hidden: { index: 2, reflect: reflectAttribute },
		required: { index: 3, reflect: reflectAttribute }
	};

	function reflectElementState(event) {
		var el = event.data;
		var treatment = state_treatment[event.symbol];
		if (treatment) {
			// known props
			treatment.reflect(el,event.symbol,event.value);
		} else {
			// extra state
		}

		if (el.stateful.updateClass) {
			el.classList[treatment.index] = event.value? "state-"+event.symbol : "";
			if (!nativeClassList) {
				el.className = el.classList.join(" ");
			}
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

	function StatefulResolver(el) {
		if (el.stateful) return el.stateful;

		var stateful = el.stateful = Resolver({ state: {} });
		mixinElementState(el,stateful("state"));
		stateful.reference("state").on("change",el,reflectElementState);
		if (!nativeClassList) el.classList = [];//ArraySet();
		//TODO initial class ?

		return stateful;
	}
	essential.declare("StatefulResolver",StatefulResolver);

	//TODO element cleaner must remove .el references from listeners

	// this = element
	function regScriptOnload(domscript,trigger) {

		domscript.onload = function(ev) { 
			if ( ! this.onloadDone ) {
				this.onloadDone = true; 
				trigger.call(this,ev || event); 
			}
		};
		domscript.onreadystatechange = function(ev) { 
			if ( ( "loaded" === this.readyState || "complete" === this.readyState ) && ! this.onloadDone ) {
				this.onloadDone = true; 
				trigger.call(this,ev || event);
			}
		}

	}

	//TODO regScriptOnnotfound (onerror, status=404)

	function HTMLScriptElement(from,doc) {
		var e = (doc || document).createElement("SCRIPT");
		for(var n in from) {
			switch(n) {
				case "id":
				case "class":
				case "rel":
				case "lang":
				case "language":
				case "src":
				case "type":
					if (from[n] !== undefined) e[n] = from[n]; 
					break;
				//TODO case "onprogress": // partial script progress
				case "onload":
					regScriptOnload(e,from.onload);
					break;
				default:
					e.setAttribute(n,from[n]);
					break;
			}
		}
		return e;
	}
	essential.set("HTMLScriptElement",HTMLScriptElement);

	var pastloadScripts = {};

	function delayedScriptOnload(scriptRel) {
		function delayedOnload(ev) {
			pastloadScripts[this.src.replace(baseUrl,"")] = true;
			console.log("loaded: "+this.src.replace(baseUrl,""));
			ApplicationConfig().justUpdateState();
		}
		return delayedOnload;       
	}

	function _queueDelayedAssets()
	{
		console.debug("loading phased scripts");
		var links = document.getElementsByTagName("link");
		//TODO phase
		for(var i=0,l; l=links[i]; ++i) if (l.rel == "pastload") {
			var attrsStr = l.getAttribute("attrs");
			var attrs = {};
			if (attrsStr) {
				eval("attrs = {" + attrsStr + "}");
			}
			attrs["type"] = "text/javascript";
			attrs["src"] = l.getAttribute("src");
			//attrs["id"] = l.getAttribute("script-id");
			attrs["onload"] = delayedScriptOnload(l.rel);
			var relSrc = attrs["src"].replace(baseUrl,"");
			pastloadScripts[relSrc] = false;
			document.body.appendChild(HTMLScriptElement(attrs));
		}
	}
	essential.set("_queueDelayedAssets",_queueDelayedAssets);


	var requiredConfigs = {};

	function configRequired(url)
	{
		requiredConfigs[url] = false;
	}
	essential.set("configRequired",configRequired);

	function configLoaded(url)
	{
		requiredConfigs[url] = true;
		console.debug("config loaded:"+url);
		ApplicationConfig().justUpdateState();
	}
	essential.set("configLoaded",configLoaded);


	function _makeEventCleaner(listeners,bubble)
	{
		// must be called with element as this
		function cleaner() {
			if (this.removeEventListener) {
				for(var n in listeners) {
					this.removeEventListener(n, listeners[n], bubble);
					delete listeners[n];
				}
			} else {
				for(var n in listeners) {
					this.detachEvent('on'+ n, listeners[n]);
					delete listeners[n];
				}
			}
		}
		cleaner.listeners = listeners; // for removeEventListeners
		return cleaner;
	};


	/**
	 * Register map of event listeners 
	 * { event: function }
	 * Using DOM style event names
	 * 
	 * @param {Object} eControl
	 * @param {Map} listeners Map from event name to function 
	 * @param {Object} bubble
	 */
	function addEventListeners(eControl, listeners,bubble)
	{
		if (eControl._cleaners == undefined) eControl._cleaners = [];

		// need to remember the function to call
		// supports DOM 2 EventListener interface
		function makeIeListener(eControl,fCallOrThis) {
			var bListenerInstance = typeof fCallOrThis == "object";
			
			var oThis = bListenerInstance? fCallOrThis : eControl;
			var fCall = bListenerInstance? fCallOrThis.handleEvent : fCallOrThis;
			return function() { 
				return fCall.call(eControl,window.event); 
			};
		} 

		if (eControl.addEventListener) {
			for(var n in listeners) {
				eControl.addEventListener(n, listeners[n], bubble || false);
			}
			eControl._cleaners.push(_makeEventCleaner(listeners,bubble || false));
		} else {
			var listeners2 = {};
			for(var n in listeners) {
				listeners2[n] = makeIeListener(eControl,listeners[n]);
				eControl.attachEvent('on'+n,listeners2[n]);
			}
			eControl._cleaners.push(_makeEventCleaner(listeners2,bubble || false));
		}   
	}
	essential.declare("addEventListeners",addEventListeners);

	//TODO modifyable events object on IE

	//TODO removeEventListeners (eControl, listeners, bubble)

	/**
	 * Cleans up registered event listeners and other references
	 * 
	 * @param {Object} eControl
	 */
	function callCleaners(eControl)
	{
		var pCleaners = eControl._cleaners;
		if (pCleaners != undefined) {
			for(var i=0,c; c = pCleaners[i]; ++i) {
				c.call(eControl);
			}
			pCleaners = undefined;
		}
	};

	//TODO recursive clean of element and children?


	function DialogAction(actionName) {
		this.actionName = actionName;
	} 
	DialogAction.prototype.activateArea = activateArea; // shortcut to global essential function
	var DialogActionGenerator = essential.set("DialogAction",Generator(DialogAction));


	function resizeTriggersReflow(ev) {
		// debugger;
		DocumentRolesGenerator()._resize_descs();
	}

	function enhanceUnhandledElements() {
		// debugger;
		var statefuls = ApplicationConfig(); // Ensure that config is present
		var handlers = DocumentRolesGenerator.presets("handlers");
		//TODO listener to presets -> Doc Roles additional handlers
		DocumentRolesGenerator()._enhance_descs();
		//TODO time to default_enhance yet?
	}

	function DocumentRoles(handlers) {
		this.handlers = handlers || this.handlers || { enhance:{}, discard:{}, layout:{} };
		this._on_event = [];
		
		//TODO configure reference as DI arg
		var statefuls = ApplicationConfig(); // Ensure that config is present

		if (window.addEventListener) {
			window.addEventListener("resize",resizeTriggersReflow,false);
			document.body.addEventListener("orientationchange",resizeTriggersReflow,false);
		} else {
			window.attachEvent("onresize",resizeTriggersReflow);
		}
		
		if (document.querySelectorAll) {
			this.descs = this._role_descs(document.querySelectorAll("*[role]"));
		} else {
			this.descs = this._role_descs(document.getElementsByTagName("*"));
		}
		this._enhance_descs();
	}
	var DocumentRolesGenerator = essential.set("DocumentRoles",Generator(DocumentRoles));
	
	DocumentRoles.args = [
		ObjectType({ name:"handlers" })
	];

	DocumentRoles.prototype._enhance_descs = function() 
	{
		var statefuls = ApplicationConfig(); // Ensure that config is present
		var incomplete = false, enhancedCount = 0;

		for(var i=0,desc; desc=this.descs[i]; ++i) {
			if (!desc.enhanced && this.handlers.enhance[desc.role]) {
				desc.instance = this.handlers.enhance[desc.role].call(this,desc.el,desc.role,statefuls.getConfig(desc.el));
				desc.enhanced = desc.instance === false? false:true;
				++enhancedCount;
			}
			if (! desc.enhanced) incomplete = true;
		}
		
		if (! incomplete && enhancedCount > 0) {
			for(var i=0,oe; oe = this._on_event[i]; ++i) {
				var descs = [];
				for(var j=0,desc; desc=this.descs[j]; ++j) if (oe.role== null || oe.role==desc.role) descs.push(desc); 

				if (oe.type == "enhanced") oe.func.call(this, this, descs);
			}
		} 
	};

	DocumentRoles.discarded = function(instance) {
		var statefuls = ApplicationConfig(); // Ensure that config is present

		for(var i=0,desc; desc=instance.descs[i]; ++i) {
			if (!desc.discarded) {
				if (instance.handlers.discard[desc.role]) {
					instance.handlers.discard[desc.role].call(instance,desc.el,desc.role,desc.instance);
				} else {
					DocumentRoles.default_discard.call(instance,desc.el,desc.role,desc.instance);
				}
				desc.discarded = true;
				//TODO clean layouter/laidout
				callCleaners(desc);
			}
		}
	};

	DocumentRoles.prototype._role_descs = function(elements) {
		var statefuls = ApplicationConfig(); // Ensure that config is present
		var descs = [];
		for(var i=0,e; e=elements[i]; ++i) {
			var role = e.getAttribute("role");
			if (role) {
				descs.push({
					"role": role,
					"el": e,
					"instance": null,
					"layout": {},
					"enhanced": false,
					"discarded": false
				});
			}
		}
		return descs;
	};

	DocumentRoles.prototype._resize_descs = function() {
		for(var i=0,desc; desc = this.descs[i]; ++i) {
			if (desc.enhanced && this.handlers.layout[desc.role]) {
				var ow = desc.el.offsetWidth, oh  = desc.el.offsetHeight;
				if (desc.layout.width != ow || desc.layout.height != oh) {
					desc.layout.width = ow;
					desc.layout.height = oh;
					this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
				}
			}
		}
	};

	DocumentRoles.prototype._layout_descs = function() {
		for(var i=0,desc; desc = this.descs[i]; ++i) {
			if (desc.enhanced && this.handlers.layout[desc.role]) {
				var updateLayout = false;
				var ow = desc.el.offsetWidth, oh  = desc.el.offsetHeight;
				if (ow == 0 && oh == 0) {
					if (desc.layout.displayed) updateLayout = true;
					desc.layout.displayed = false;
				}
				if (desc.layout.width != ow || desc.layout.height != oh) {
					desc.layout.width = ow;
					desc.layout.height = oh;
					updateLayout = true
				}
				if (desc.layout.area != _activeAreaName) { 
					desc.layout.area = _activeAreaName;
					updateLayout = true;
				}
				if (updateLayout) this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
			}
		}
	};

	DocumentRoles.prototype._area_changed_descs = function() {
		for(var i=0,desc; desc = this.descs[i]; ++i) {
			if (desc.enhanced && this.handlers.layout[desc.role]) {
				desc.layout.area = _activeAreaName;
				this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
			}
		}
	};

	DocumentRoles.prototype.on = function(name,role,func) {
		if (arguments.length == 2) func = role;
		
		//TODO
		this._on_event.push({ "type":name,"func":func,"name":name,"role":role });
	}
	
	// Element specific handlers
	DocumentRolesGenerator.presets.declare("handlers.enhance", {});
	DocumentRolesGenerator.presets.declare("handlers.layout", {});
	DocumentRolesGenerator.presets.declare("handlers.discard", {});


	function form_onsubmit(ev) {
		var frm = this;
		setTimeout(function(){
			frm.submit();
		},0);
		return false;
	}
	function form_submit() {
		if (document.activeElement) document.activeElement.blur();
		this.blur();

		dialog_submit.call(this);
	}
	function dialog_submit(clicked) {
		var submitName = "trigger";
		if (this.elements) {

			for(var i=0,e; e=this.elements[i]; ++i) {
				if (e.type=="submit") submitName = e.name;
			}
		} else {

			var buttons = this.getElementsByTagName("button");
			for(var i=0,e; e=buttons[i]; ++i) {
				if (e.type=="submit") submitName = e.name;
			}
			var inputs = this.getElementsByTagName("input");
			for(var i=0,e; e=inputs[i]; ++i) {
				if (e.type=="submit") submitName = e.name;
			}
		}
		if (clicked && clicked.name) submitName = clicked.name;

		if (! this.actionVariant) {
			var action = this.getAttribute("action");
			if (action) {
				action = action.replace(baseUrl,"");
			} else {
				action = "submit";
			}

			this.actionVariant = DialogActionGenerator.variant(action)(action);
		}

		if (this.actionVariant[submitName]) this.actionVariant[submitName](this);
		else {
			var sn = submitName.replace("-","_").replace(" ","_");
			if (this.actionVariant[sn]) this.actionVariant[sn](this);
		}
		//TODO else dev_note("Submit of " submitName " unknown to DialogAction " action)
	}

	function toolbar_submit(clicked) {
		return dialog_submit.call(this,clicked);
	}

	function form_blur() {
		for(var i=0,e; e=this.elements[i]; ++i) e.blur();
	}
	function form_focus() {
		for(var i=0,e; e=this.elements[i]; ++i) {
			var autofocus = e.getAttribute("autofocus");
			if (autofocus == undefined) continue;
			e.focus();
			break; 
		}
	}
	
	function applicable_role_element(element) {
		// role of element or ancestor
		// TODO minor tags are traversed; Stop at document, header, aside etc
		
		while(element) {
			var role = element.getAttribute("role");
			if (role) return element;
			element = element.parentNode;
		}
	}

	function dialog_button_click(ev) {
		ev = ev || event;
		var e = ev.target || ev.srcElement;
		var re = applicable_role_element(e);
		if (re && re.getAttribute("role") == "button") this.submit(re); else
		if (e.type=="submit") this.submit(e); //TODO action context
	}

	DocumentRolesGenerator.enhance_dialog = DocumentRoles.enhance_dialog = function (el,role,config) {
		switch(el.tagName.toLowerCase()) {
			case "form":
				// f.method=null; f.action=null;
				el.onsubmit = form_onsubmit;
				el.__builtinSubmit = el.submit;
				el.submit = form_submit;
				el.__builtinBlur = el.blur;
				el.blur = form_blur;
				el.__builtinFocus = el.focus;
				el.focus = form_focus;
				break;
				
			default:
				el.submit = dialog_submit;
				// debugger;
				//TODO capture enter from inputs, tweak tab indexes
				break;
		}
		
		addEventListeners(el, {
			"click": dialog_button_click
		},false);

		return {};
	};

	DocumentRolesGenerator.layout_dialog = DocumentRoles.layout_dialog = function(el,layout,instance) {
		
	};
	DocumentRolesGenerator.discard_dialog = DocumentRoles.discard_dialog = function (el,role,instance) {
	};

	DocumentRolesGenerator.enhance_toolbar = DocumentRoles.enhance_toolbar = function(el,role,config) {
		el.submit = toolbar_submit;

		addEventListeners(el, {
			"click": dialog_button_click
		},false);

		return {};
	};

	DocumentRolesGenerator.layout_toolbar = DocumentRoles.layout_toolbar = function(el,layout,instance) {
		
	};
	DocumentRolesGenerator.discard_toolbar = DocumentRoles.discard_toolbar = function(el,role,instance) {
		
	};

	DocumentRolesGenerator.enhance_sheet = DocumentRoles.enhance_sheet = function(el,role,config) {
		
		return {};
	};

	DocumentRolesGenerator.layout_sheet = DocumentRoles.layout_sheet = function(el,layout,instance) {
		
	};
	DocumentRolesGenerator.discard_sheet = DocumentRoles.discard_sheet = function(el,role,instance) {
		
	};

	DocumentRolesGenerator.enhance_spinner = DocumentRoles.enhance_spinner = function(el,role,config) {
		var opts = {
			lines: 8,
			length: 5,
			width: 5,
			radius: 8,
			color: '#fff',
			speed: 1,
			trail: 60,
			shadow: false,
			hwaccel: true,
			className: 'spinner',
			zIndex: config.zIndex != undefined? config.zIndex : 2e9, // data-role
			top: 'auto',
			left: 'auto'
		};
		return new Spinner(opts).spin(el);
	};

	DocumentRolesGenerator.layout_spinner = DocumentRoles.layout_spinner = function(el,layout,instance) {
		
	};
	DocumentRolesGenerator.discard_spinner = DocumentRoles.discard_spinner = function(el,role,instance) {
		instance.stop();
		el.innerHTML = "";
	};
	
	function _lookup_generator(name,resolver) {
		var constructor = Resolver(resolver || "default")(name,"null");
		
		return constructor? Generator(constructor) : null;
	}

	DocumentRolesGenerator.enhance_application = DocumentRoles.enhance_application = function(el,role,config) {
		if (config.variant) {
//    		variant of generator (default ApplicationController)
		}
		if (config.generator) {
			var g = _lookup_generator(config.generator,config.resolver);
			if (g) {
				var instance = g(el,role,config);
				return instance;
			}
			else return false; // not yet ready
		}
		
		return {};
	};

	DocumentRolesGenerator.layout_application = DocumentRoles.layout_application = function(el,layout,instance) {
		
	};
	DocumentRolesGenerator.discard_application = DocumentRoles.discard_application = function(el,role,instance) {
		
	};

	DocumentRoles.default_enhance = function(el,role,config) {
		
		return {};
	};

	DocumentRoles.default_layout = function(el,layout,instance) {
		
	};
	
	DocumentRoles.default_discard = function(el,role,instance) {
		
	};
	
	function Layouter(key,el,conf) {

	}
	var LayouterGenerator = essential.declare("Layouter",Generator(Layouter));

	var stages = [];

	function StageLayouter(key,el,conf) {
		this.key = key;
		this.type = conf.layouter;
		this.areaNames = conf["area-names"];
		this.activeArea = null;

		this.baseClass = conf["base-class"];
		if (this.baseClass) this.baseClass += " ";
		else this.baseClass = "";

		stages.push(this); // for area updates
	}
	var StageLayouterGenerator = essential.declare("StageLayouter",Generator(StageLayouter));
	LayouterGenerator.variant("area-stage",StageLayouterGenerator);

	StageLayouter.prototype.refreshClass = function(el) {
		var areaClasses = [];
		for(var i=0,a; a = this.areaNames[i]; ++i) {
			if (a == this.activeArea) areaClasses.push(a + "-area-active");
			else areaClasses.push(a + "-area-inactive");
		}
		var newClass = this.baseClass + areaClasses.join(" ")
		if (el.className != newClass) el.className = newClass;
	};

	StageLayouter.prototype.updateActiveArea = function(areaName) {
		this.activeArea = areaName;
		this.refreshClass(document.getElementById(this.key)); //TODO on delay	
	}

	function Laidout(key,el,conf) {

	}
	var LaidoutGenerator = essential.declare("Laidout",Generator(Laidout));

	function MemberLaidout(key,el,conf) {
		this.key = key;
		this.type = conf.laidout;
		this.areaNames = conf["area-names"];

		this.baseClass = conf["base-class"];
		if (this.baseClass) this.baseClass += " ";
		else this.baseClass = "";

		el.className = this.baseClass + el.className;
	}
	var MemberLaidoutGenerator = essential.declare("MemberLaidout",Generator(MemberLaidout));
	LaidoutGenerator.variant("area-member",MemberLaidoutGenerator);

	var _activeAreaName,_liveAreas=false;

	function activateArea(areaName) {
		if (! _liveAreas) {
			_activeAreaName = areaName;
			return;
		}
		
		for(var i=0,s; s = stages[i]; ++i) {
			s.updateActiveArea(areaName);
		}
		_activeAreaName = areaName;
		DocumentRolesGenerator()._layout_descs();
	}
	essential.set("activateArea",activateArea);
	
	function getActiveArea() {
		return _activeAreaName;
	}
	essential.set("getActiveArea",getActiveArea);

	function bringLive() {
		var ap = ApplicationConfig();

		// Allow the browser to render the page, preventing initial transitions
		_liveAreas = true;
		ap.state.livepage = true;
		ap.reflectState();

		if (_activeAreaName) {
			activateArea(_activeAreaName);
		} else {
			if (ap.isPageState("authenticated")) activateArea(ap.getAuthenticatedArea());
			else activateArea(ap.getIntroductionArea());
		}
	}

	function onPageLoad(ev) {
		var ap = ApplicationConfig();
		_liveAreas = true;
		ap.state.livepage = true;
		ap.updateState();
	}

	if (window.addEventListener) window.addEventListener("load",onPageLoad,false);
	else if (window.attachEvent) window.attachEvent("onload",onPageLoad);


	function _ApplicationConfig() {
		this.config = {};
		this._gather();
		this._apply();

		setTimeout(bringLive,60);
	}
//    _ApplicationConfig.args = [
// 	    ObjectType({ name:"state" })
// 	    ];

	var ApplicationConfig = Generator(_ApplicationConfig);
	essential.set("ApplicationConfig",ApplicationConfig).restrict({ "singleton":true, "lifecycle":"page" });
	
	// preset on instance
	ApplicationConfig.presets.declare("state", {
		"livepage": false,
		"authenticated": false,
		"loading": true,
		"loadingConfig": true,
		"loadingScripts": true,
		"launched": false
		});
	ApplicationConfig.prototype.isPageState = function(whichState) {
		return this.state[whichState];
	};
	ApplicationConfig.prototype.setPageState = function(whichState,v) {
		this.state[whichState] = v;
		if (this.state.launched) this.updateState();
	};
	ApplicationConfig.prototype.getAuthenticatedArea = function() {
		// return "edit";
		return "sp-explorer";
	};
	ApplicationConfig.prototype.getIntroductionArea = function() {
		//return "signup";
		return "sp-explorer";
	};

	ApplicationConfig.prototype.declare = function(key,value) {
		this.config[key] = value;
	};

	ApplicationConfig.prototype._apply = function() {
		for(var k in this.config) {
			var conf = this.config[k];
			var el = this.getElement(k);

			if (conf.layouter) {
				el.layouter = LayouterGenerator.variant(conf.layouter)(k,el,conf);
			}
			if (conf.laidout) {
				el.laidout = LaidoutGenerator.variant(conf.laidout)(k,el,conf);
			}
		}
	};

	var _singleQuotesRe = new RegExp("'","g");

	ApplicationConfig.prototype._getElementRoleConfig = function(element) {

		var dataRole = element.getAttribute("data-role");
		if (dataRole) try {
			var map = JSON.parse("{" + dataRole.replace(_singleQuotesRe,'"') + "}");
			//TODO extend this.config for elements with id?
			if (element.id) {
				this.config[element.id] = map;
			}
			return map;
		} catch(ex) {
			console.debug("Invalid config: ",dataRole,ex);
			return { "invalid-config":dataRole };
		}
		return {};
	};

	ApplicationConfig.prototype.getConfig = function(element) {
		//TODO mixin data-role
		if (element.id) {
			return this.config[element.id] || this._getElementRoleConfig(element);
		}
		var name = element.getAttribute("name");
		if (name) {
			var p = element.parentNode;
			while(p) {
				if (p.id) {
					return this.config[p.id + "." + name] || this._getElementRoleConfig(element);
				} 
				p = p.parentNode;
			} 
		}
		return this._getElementRoleConfig(element);
	};

	ApplicationConfig.prototype.getElement = function(key) {
		var keys = key.split(".");
		var el = document.getElementById(keys[0]);
		if (keys.length > 1) el = el.getElementByName(keys[1]);
		return el;
	};

	ApplicationConfig.prototype.justUpdateState = function() 
	{   
		this.state.loading = false;
		this.state.loadingScripts = false;
		this.state.loadingConfig = false;

		for(var n in pastloadScripts) {
			if (pastloadScripts[n] == false) { this.state.loading = true; this.state.loadingScripts = true; console.debug(n+" missing")}
		}
		for(var n in requiredConfigs) {
			if (requiredConfigs[n] == false) { this.state.loading = true; this.state.loadingConfig = true; console.debug(n+" missing")}
		}
		
		if (this.state.loading == false && this.state.launched == false) {
			if (document.body) essential("instantiatePageSingletons")();
		}
	};

	ApplicationConfig.prototype.updateState = function() 
	{   
		this.justUpdateState();

		if (this.state.loading == false) {
			if (document.body) essential("instantiatePageSingletons")();
			enhanceUnhandledElements();
		}

		//TODO do this in justUpdateState as well?
		this.reflectState();
	};


	ApplicationConfig.prototype.reflectState = function()
	{
		if (document.body == null) return; // body not there yet

		var bodyClass = ArraySet.apply(null,document.body.className.split(" "));
		bodyClass.set("login",! this.state.authenticated);
		bodyClass.set("authenticated",this.state.authenticated);
		bodyClass.set("loading",this.state.loading);
		bodyClass.set("login-error",this.state.loginError);
		bodyClass.set("launched",this.state.launched);
		bodyClass.set("launching",this.state.launching);
		bodyClass.set("livepage",this.state.livepage);
		console.debug("Changing body from '"+document.body.className+"' to '"+bodyClass.join(" ")+"'");
		document.body.className = bodyClass.join(" "); //TODO should work: String(bodyClass)
	};

})();

// need with context not supported in strict mode
Resolver("essential")("ApplicationConfig").prototype._gather = function() {
	var scripts = document.getElementsByTagName("script");
	for(var i=0,s; s = scripts[i]; ++i) {
		if (s.getAttribute("type") == "application/config") {
			with(this) eval(s.text);
		}
	}
};
