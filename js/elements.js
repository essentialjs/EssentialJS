(function(){
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{});
	var ObjectType = essential("ObjectType");
	var console = essential("console");
	var MutableEvent = essential("MutableEvent");
	var StatefulResolver = essential("StatefulResolver");
	var ApplicationConfig = essential("ApplicationConfig");
	var pageResolver = Resolver("page");
	var getActiveArea = essential("getActiveArea");
	var arrayContains = essential("arrayContains");
	var statefulCleaner = essential("statefulCleaner");
	var HTMLElement = essential("HTMLElement");
	var HTMLScriptElement = essential("HTMLScriptElement");
	var Layouter = essential("Layouter");
	var Laidout = essential("Laidout");

	var baseUrl = location.href.substring(0,location.href.split("?")[0].lastIndexOf("/")+1);
	var serverUrl = location.protocol + "//" + location.host;

	function delayedScriptOnload(scriptRel) {
		function delayedOnload(ev) {
			var el = this;
			setTimeout(function(){
				// make sure it's not called before script executes
				var scripts = pageResolver(["state","loadingScriptsUrl"]);
				if (scripts[el.src.replace(baseUrl,"")] != undefined) {
					// relative url
					pageResolver.set(["state","loadingScriptsUrl",el.src.replace(baseUrl,"")],false);
				} else if (scripts[el.src.replace(serverUrl,"")] != undefined) {
					// absolute url
					pageResolver.set(["state","loadingScriptsUrl",el.src.replace(serverUrl,"")],false);
				}
			},0);
		}
		return delayedOnload;       
	}

	function _queueDelayedAssets()
	{
		//TODO move this to pageResolver("state.ready")
		ApplicationConfig();//TODO move the state transitions here
		var links = document.getElementsByTagName("link");

		//TODO differentiate on type == "text/javascript"
		for(var i=0,l; l=links[i]; ++i) if (l.rel == "pastload" || l.rel == "preload") {
			//TODO differentiate on lang
			var attrsStr = l.getAttribute("attrs");
			var attrs = {};
			if (attrsStr) {
				eval("attrs = {" + attrsStr + "}");
			}
			attrs["type"] = l.getAttribute("type") || "text/javascript";
			attrs["src"] = l.getAttribute("src");
			//attrs["id"] = l.getAttribute("script-id");
			attrs["onload"] = delayedScriptOnload(l.rel);
			var relSrc = attrs["src"].replace(baseUrl,"");
			if (l.rel == "preload") {
				var langOk = true;
				if (l.lang) langOk = (l.lang == pageResolver("state.lang"));
				if (langOk) {
					pageResolver.set(["state","preloading"],true);
					pageResolver.set(["state","loadingScripts"],true);
					pageResolver.set(["state","loadingScriptsUrl",relSrc],l); 
					document.body.appendChild(HTMLScriptElement(attrs));
					l.added = true;
				} 
			} else {
				var langOk = true;
				if (l.lang) langOk = (l.lang == pageResolver("state.lang"));
				if (langOk) {
					pageResolver.set(["state","loadingScripts"],true);
					pageResolver.set(["state","loadingScriptsUrl",relSrc],l); 
					l.attrs = attrs;
				} 
			}
		}
		if (! pageResolver(["state","preloading"])) {
			var scripts = pageResolver(["state","loadingScriptsUrl"]);
			for(var n in scripts) {
				var link = scripts[n];
				if (link.rel == "pastload") {
					var langOk = true;
					if (link.lang) langOk = (link.lang == pageResolver("state.lang"));
					if (langOk) {
						document.body.appendChild(HTMLScriptElement(link.attrs));
						link.added = true;
					} 
				}
			}
		}
		if (pageResolver(["state","loadingScripts"])) console.debug("loading phased scripts");

		var metas = document.getElementsByTagName("meta");
		for(var i=0,m; m = metas[i]; ++i) {
			switch((m.getAttribute("name") || "").toLowerCase()) {
				case "enhanced roles":
					DocumentRoles.useBuiltins((m.getAttribute("content") || "").split(" "));
					break;
			}
		}
	}
	essential.set("_queueDelayedAssets",_queueDelayedAssets);


	function configRequired(url)
	{
		pageResolver.set(["state","loadingConfig"],true);
		pageResolver.set(["state","loadingConfigUrl",url],true);
	}
	essential.set("configRequired",configRequired);

	function configLoaded(url)
	{
		pageResolver.set(["state","loadingConfigUrl",url],false);
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
	}

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
				return fCall.call(eControl,MutableEvent(window.event)); 
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

	//TODO removeEventListeners (eControl, listeners, bubble)

	/**
	 * Cleans up registered event listeners and other references
	 * 
	 * @param {Element} el
	 */
	function callCleaners(el)
	{
		var _cleaners = el._cleaners;
		if (_cleaners != undefined) {
			for(var i=0,c; c = _cleaners[i]; ++i) {
				c.call(el);
			}
			_cleaners = undefined;
		}
	};

	//TODO recursive clean of element and children?
	function cleanRecursively(el) {
		for(var child=el.firstChild; child; child = child.nextSibling) {
			callCleaners(child);
			cleanRecursively(child);
		}
	}
	essential.declare("cleanRecursively",cleanRecursively);


	function _DialogAction(actionName) {
		this.actionName = actionName;
	} 
	_DialogAction.prototype.activateArea = essential("activateArea"); // shortcut to global essential function
	var DialogAction = essential.set("DialogAction",Generator(_DialogAction));


	function resizeTriggersReflow(ev) {
		// debugger;
		DocumentRoles()._resize_descs();
	}

	/*
		action buttons not caught by enhanced dialogs/navigations
	*/
	function defaultButtonClick(ev) {
		ev = MutableEvent(ev).withActionInfo();
		if (ev.commandElement) {

			//TODO action event filtering
			//TODO disabled
			fireAction(ev);
		}
	}

	function fireAction(ev) 
	{
		var el = ev.actionElement, action = ev.action, name = ev.commandName;
		if (! el.actionVariant) {
			if (action) {
				action = action.replace(baseUrl,"");
			} else {
				action = "submit";
			}

			el.actionVariant = DialogAction.variant(action)(action);
		}

		if (el.actionVariant[name]) el.actionVariant[name](el);
		else {
			var sn = name.replace("-","_").replace(" ","_");
			if (el.actionVariant[sn]) el.actionVariant[sn](el);
		}
		//TODO else dev_note("Submit of " submitName " unknown to DialogAction " action)
	}
	essential.declare("fireAction",fireAction);

	function _StatefulField(name,stateful) {

	}
	var StatefulField = essential.declare("StatefulField",Generator(_StatefulField));

	StatefulField.prototype.destroy = function() {};
	StatefulField.prototype.discard = function() {};

	function _TimeField() {

	}
	StatefulField.variant("input[type=time]",Generator(_TimeField,_StatefulField));

	function _CommandField(name,stateful,role) {

	}
	var CommandField = StatefulField.variant("*[role=link]",Generator(_CommandField,_StatefulField));
	StatefulField.variant("*[role=button]",Generator(_CommandField,_StatefulField));

	/* Enhance all stateful fields of a parent */
	function enhanceStatefulFields(parent) {

		for(var el = parent.firstChild; el; el = el.nextSibling) {
			//TODO avoid non elements, firstChildNode. Skip non type 1 (comments) on old IE
			//TODO do not enhance nested enhanced roles

			var name = el.name || el.getAttribute("data-name") || el.getAttribute("name");
			if (name) {
				var role = el.getAttribute("role");
				var variants = [];
				if (role) {
					if (el.type) variants.push("*[role="+role+",type="+el.type+"]");
					variants.push("*[role="+role+"]");
				} else {
					if (el.type) variants.push(el.tagName.toLowerCase()+"[type="+el.type+"]");
					variants.push(el.tagName.toLowerCase());
				}

				var stateful = StatefulResolver(el,true);
				var field = stateful.setField(StatefulField.variant(variants)(name,stateful,role));

				//TODO add field for _cleaners element 
				if (el._cleaners == undefined) el._cleaners = [];
				if (!arrayContains(el._cleaners,statefulCleaner)) el._cleaners.push(statefulCleaner); 
			}

			enhanceStatefulFields(el); // enhance children
		}
	}
	essential.declare("enhanceStatefulFields",enhanceStatefulFields);

	function _DocumentRoles(handlers,doc) {
		this.handlers = handlers || this.handlers || { enhance:{}, discard:{}, layout:{} };
		this._on_event = [];
		doc = doc || document;
		
		//TODO configure reference as DI arg
		var statefuls = ApplicationConfig(); // Ensure that config is present

		if (window.addEventListener) {
			window.addEventListener("resize",resizeTriggersReflow,false);
			doc.body.addEventListener("orientationchange",resizeTriggersReflow,false);
			doc.body.addEventListener("click",defaultButtonClick,false);
		} else {
			window.attachEvent("onresize",resizeTriggersReflow);
			doc.body.attachEvent("onclick",defaultButtonClick);
		}

		if (doc.querySelectorAll) {
			this.descs = this._role_descs(doc.querySelectorAll("*[role]"));
		} else {
			this.descs = this._role_descs(doc.getElementsByTagName("*"));
		}
		this._enhance_descs();
	}
	var DocumentRoles = essential.set("DocumentRoles",Generator(_DocumentRoles));
	
	_DocumentRoles.args = [
		ObjectType({ name:"handlers" })
	];

	_DocumentRoles.prototype._enhance_descs = function() 
	{
		var statefuls = ApplicationConfig(); // Ensure that config is present
		var incomplete = false, enhancedCount = 0;

		for(var i=0,desc; desc=this.descs[i]; ++i) {
			StatefulResolver(desc.el,true);
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

	_DocumentRoles.discarded = function(instance) {
		var statefuls = ApplicationConfig(); // Ensure that config is present

		for(var i=0,desc; desc=instance.descs[i]; ++i) {
			if (!desc.discarded) {
				if (instance.handlers.discard[desc.role]) {
					instance.handlers.discard[desc.role].call(instance,desc.el,desc.role,desc.instance);
				} else {
					_DocumentRoles.default_discard.call(instance,desc.el,desc.role,desc.instance);
				}
				desc.discarded = true;
				//TODO clean layouter/laidout
				callCleaners(desc);
			}
		}
	};

	_DocumentRoles.prototype._role_descs = function(elements) {
		var descs = [];
		for(var i=0,e; e=elements[i]; ++i) {
			var role = e.getAttribute("role");
			if (role) {
				descs.push({
					"role": role,
					"el": e,
					"instance": null,
					"layout": {
						"lastDirectCall": 0
					},
					"enhanced": false,
					"discarded": false
				});
			}
		}
		return descs;
	};

	_DocumentRoles.prototype._resize_descs = function() {
		for(var i=0,desc; desc = this.descs[i]; ++i) {
			if (desc.enhanced && this.handlers.layout[desc.role]) {
				var ow = desc.el.offsetWidth, oh  = desc.el.offsetHeight;
				if (desc.layout.width != ow || desc.layout.height != oh) {
					desc.layout.width = ow;
					desc.layout.height = oh;
					var now = (new Date()).getTime();
					var throttle = this.handlers.layout[desc.role].throttle;
					if (desc.layout.delayed) {
						// set dimensions and let delayed do it
					} else if (typeof throttle != "number" || (desc.layout.lastDirectCall + throttle < now)) {
						// call now
						this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
						desc.layout.lastDirectCall = now;
					} else {
						// call in a bit
						var delay = now + throttle - desc.layout.lastDirectCall;
						// console.log("resizing in",delay);
						(function(desc){
							desc.layout.delayed = true;
							setTimeout(function(){
								DocumentRoles().handlers.layout[desc.role].call(DocumentRoles(),desc.el,desc.layout,desc.instance);
								desc.layout.lastDirectCall = now;
								desc.layout.delayed = false;
							},delay);
						})(desc);
					}
				}
			}
		}
	};

	_DocumentRoles.prototype._layout_descs = function() {
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
				if (desc.layout.area != getActiveArea()) { 
					desc.layout.area = getActiveArea();
					updateLayout = true;
				}
				if (updateLayout) this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
			}
		}
	};

	_DocumentRoles.prototype._area_changed_descs = function() {
		for(var i=0,desc; desc = this.descs[i]; ++i) {
			if (desc.enhanced && this.handlers.layout[desc.role]) {
				desc.layout.area = getActiveArea();
				this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
			}
		}
	};

	_DocumentRoles.prototype.on = function(name,role,func) {
		if (arguments.length == 2) func = role;
		
		//TODO
		this._on_event.push({ "type":name,"func":func,"name":name,"role":role });
	}
	
	// Element specific handlers
	DocumentRoles.presets.declare("handlers.enhance", {});
	DocumentRoles.presets.declare("handlers.layout", {});
	DocumentRoles.presets.declare("handlers.discard", {});


	function form_onsubmit(ev) {
		var frm = this;
		setTimeout(function(){
			frm.submit(ev);
		},0);
		return false;
	}
	function form_submit(ev) {
		if (document.activeElement) document.activeElement.blur();
		this.blur();

		dialog_submit.call(this,ev);
	}
	function dialog_submit(clicked) {
		if (clicked == undefined) clicked = MutableEvent().withDefaultSubmit(this);

		if (clicked.commandElement) {
			fireAction(clicked);
		} else {
			//TODO default submit when no submit button or event
		}
	}

	function toolbar_submit(ev) {
		return dialog_submit.call(this,ev);
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
	
	function dialog_button_click(ev) {
		ev = MutableEvent(ev).withActionInfo();

		if (ev.commandElement) {
			if (ev.stateful && ev.stateful("state.disabled")) return; // disable
			if (ev.ariaDisabled) return; //TODO fold into stateful

			this.submit(ev); //TODO action context
			ev.stopPropagation();
		}
		if (ev.defaultPrevented) return false;
	}

	DocumentRoles.useBuiltins = function(list) {
		DocumentRoles.restrict({ singleton: true, lifecycle: "page" });
		for(var i=0,r; r = list[i]; ++i) {
			if (this["enhance_"+r]) this.presets.declare(["handlers","enhance",r], this["enhance_"+r]);
			if (this["layout_"+r]) this.presets.declare(["handlers","layout",r], this["layout_"+r]);
			if (this["discard_"+r]) this.presets.declare(["handlers","discard",r], this["discard_"+r]);
		}
	}


	DocumentRoles.enhance_dialog = _DocumentRoles.enhance_dialog = function (el,role,config) {
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
				// make sure no submit buttons outside form, or enter key will fire the first one.
				forceNoSubmitType(el.getElementsByTagName("BUTTON"));
				applyDefaultRole(el.getElementsByTagName("BUTTON"));
				applyDefaultRole(el.getElementsByTagName("A"));

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

	DocumentRoles.layout_dialog = _DocumentRoles.layout_dialog = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_dialog = _DocumentRoles.discard_dialog = function (el,role,instance) {
	};

	function applyDefaultRole(elements) {
		for(var i=0,el; el = elements[i]; ++i) switch(el.tagName) {
			case "button":
			case "BUTTON":
				el.setAttribute("role","button");
				break;
			case "a":
			case "A":
				el.setAttribute("role","link");
				break;
			// menuitem
		}
	}

	/* convert listed button elements */
	function forceNoSubmitType(buttons) {

		for(var i=0,button; button = buttons[i]; ++i) if (button.type == "submit") {
			button.setAttribute("type","button");
			if (button.type == "submit") button.type = "submit";
		}
	}

	DocumentRoles.enhance_toolbar = _DocumentRoles.enhance_toolbar = function(el,role,config) {
		// make sure no submit buttons outside form, or enter key will fire the first one.
		forceNoSubmitType(el.getElementsByTagName("BUTTON"));
		applyDefaultRole(el.getElementsByTagName("BUTTON"));
		applyDefaultRole(el.getElementsByTagName("A"));

		el.submit = toolbar_submit;

		addEventListeners(el, {
			"click": dialog_button_click
		},false);

		return {};
	};

	DocumentRoles.layout_toolbar = _DocumentRoles.layout_toolbar = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_toolbar = _DocumentRoles.discard_toolbar = function(el,role,instance) {
		
	};

	// menu, menubar
	DocumentRoles.enhance_navigation = _DocumentRoles.enhance_navigation = 
	DocumentRoles.enhance_menu = _DocumentRoles.enhance_menu = DocumentRoles.enhance_menubar = _DocumentRoles.enhance_menubar = DocumentRoles.enhance_toolbar;

	DocumentRoles.enhance_sheet = _DocumentRoles.enhance_sheet = function(el,role,config) {
		
		return {};
	};

	DocumentRoles.layout_sheet = _DocumentRoles.layout_sheet = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_sheet = _DocumentRoles.discard_sheet = function(el,role,instance) {
		
	};

	DocumentRoles.enhance_spinner = _DocumentRoles.enhance_spinner = function(el,role,config) {
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

	DocumentRoles.layout_spinner = _DocumentRoles.layout_spinner = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_spinner = _DocumentRoles.discard_spinner = function(el,role,instance) {
		instance.stop();
		el.innerHTML = "";
	};
	
	function _lookup_generator(name,resolver) {
		var constructor = Resolver(resolver || "default")(name,"null");
		
		return constructor? Generator(constructor) : null;
	}

	DocumentRoles.enhance_application = _DocumentRoles.enhance_application = function(el,role,config) {
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

	DocumentRoles.layout_application = _DocumentRoles.layout_application = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_application = _DocumentRoles.discard_application = function(el,role,instance) {
		
	};

	_DocumentRoles.default_enhance = function(el,role,config) {
		
		return {};
	};

	_DocumentRoles.default_layout = function(el,layout,instance) {
		
	};
	
	_DocumentRoles.default_discard = function(el,role,instance) {
		
	};
	
	function _StageLayouter(key,el,conf) {
		this.key = key;
		this.type = conf.layouter;
		this.areaNames = conf["area-names"];
		this.activeArea = null;
		this.introductionArea = conf["introduction-area"] || "introduction";
		this.authenticatedArea = conf["authenticated-area"] || "authenticated";

		this.baseClass = conf["base-class"];
		if (this.baseClass) this.baseClass += " ";
		else this.baseClass = "";

		essential("stages").push(this); // for area updates
	}
	var StageLayouter = essential.declare("StageLayouter",Generator(_StageLayouter,Layouter));
	Layouter.variant("area-stage",StageLayouter);

	_StageLayouter.prototype.getIntroductionArea = function() {
		return this.introductionArea;
	};

	_StageLayouter.prototype.getAuthenticatedArea = function() {
		return this.authenticatedArea;
	};

	_StageLayouter.prototype.refreshClass = function(el) {
		var areaClasses = [];
		for(var i=0,a; a = this.areaNames[i]; ++i) {
			if (a == this.activeArea) areaClasses.push(a + "-area-active");
			else areaClasses.push(a + "-area-inactive");
		}
		var newClass = this.baseClass + areaClasses.join(" ")
		if (el.className != newClass) el.className = newClass;
	};

	_StageLayouter.prototype.updateActiveArea = function(areaName) {
		this.activeArea = areaName;
		this.refreshClass(document.getElementById(this.key)); //TODO on delay	
	};

	function _MemberLaidout(key,el,conf) {
		this.key = key;
		this.type = conf.laidout;
		this.areaNames = conf["area-names"];

		this.baseClass = conf["base-class"];
		if (this.baseClass) this.baseClass += " ";
		else this.baseClass = "";

		el.className = this.baseClass + el.className;
	}
	var MemberLaidout = essential.declare("MemberLaidout",Generator(_MemberLaidout,Laidout));
	Laidout.variant("area-member",MemberLaidout);

})();

