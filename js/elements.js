(function(){
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{});
	var ObjectType = essential("ObjectType");
	var console = essential("console");
	var ArraySet = essential("ArraySet");
	var DOMTokenList = essential("DOMTokenList");
	var baseUrl = location.href.substring(0,location.href.split("?")[0].lastIndexOf("/")+1);

	//TODO regScriptOnnotfound (onerror, status=404)
	
	// (tagName,{attributes},content)
	// ({attributes},content)
	function HTMLElement(tagName,from,content_list,_document) {
		var c_from = 2, c_to = arguments.length-1, _tagName = tagName, _from = from;
		
		// optional document arg
		var d = arguments[c_to];
		var _doc = document;
		if (typeof d == "object" && "doctype" in d && c_to>1) { _doc = d; --c_to; }
		
		// optional tagName arg
		if (typeof _tagName == "object") { 
			_from = _tagName; 
			_tagName = _from.tagName || "span"; 
			--c_from; 
		}
		
		var e = _doc.createElement(_tagName);
		for(var n in _from) {
			switch(n) {
				case "tagName": break; // already used
				case "class":
					if (_from[n] !== undefined) e.className = _from[n]; 
					break;
				case "style":
					//TODO support object
					if (_from[n] !== undefined) e.style.cssText = _from[n]; 
					break;
					
				case "id":
				case "className":
				case "rel":
				case "lang":
				case "language":
				case "src":
				case "type":
					if (_from[n] !== undefined) e[n] = _from[n]; 
					break;
				//TODO case "onprogress": // partial script progress
				case "onload":
					regScriptOnload(e,_from.onload);
					break;
				default:
					e.setAttribute(n,_from[n]);
					break;
			}
		}
		var l = [];
		for(var i=c_from; i<=c_to; ++i) {
			var p = arguments[i];
			if (typeof p == "object" && "length" in p) l.concat(p);
			else if (typeof p == "string") l.push(arguments[i]);
		}
		if (l.length) e.innerHTML = l.join("");
		
		//TODO .appendTo function
		
		return e;
	}
	essential.set("HTMLElement",HTMLElement);
	
	
	var nativeClassList = !!document.documentElement.classList;

	function readElementState(el,state) {
		state.disabled = el.disabled || false; // undefined before attach
		state.readOnly = el.readOnly || false;
		state.hidden = el.getAttribute("hidden") != null;
		state.required = el.getAttribute("required") != null;
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

	var state_treatment = {
		disabled: { index: 0, reflect: reflectAria }, // IE hardcodes a disabled text shadow for buttons and anchors
		readOnly: { index: 1, reflect: reflectProperty },
		hidden: { index: 2, reflect: reflectAttribute }, // Aria all elements
		required: { index: 3, reflect: reflectAttributeAria }
		//TODO draggable
		//TODO contenteditable
		//TODO checked ariaChecked
		//TODO tooltip
		//TODO hover
		//TODO down ariaPressed
		//TODO ariaHidden
		//TODO ariaDisabled
		//TODO ariaRequired
		//TODO ariaExpanded
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

	var DOMTokenList_eitherClass = essential("DOMTokenList.eitherClass");
	var DOMTokenList_mixin = essential("DOMTokenList.mixin");

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
			DOMTokenList_eitherClass(el,mapClass.state[event.symbol],mapClass.notstate[event.symbol],event.value);
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

	function ClassForNotState() {

	}
	ClassForNotState.prototype.disabled = "";
	ClassForNotState.prototype.readOnly = "";
	ClassForNotState.prototype.hidden = "";
	ClassForNotState.prototype.required = "";

	function make_Stateful_fireAction(el) {
		return function() {
			var ev = MutableEvent({
				"target":el
			}).withActionInfo(); 
			fireAction(ev);
		};
	}

	function Stateful_setField(field) {
		this.field = field;
		return field;
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
			if (this.stateful.field) {
				this.stateful.field.destroy();
				this.stateful.field.discard();
			}
			this.stateful.field = undefined;
			this.stateful.destroy();
			this.stateful.fireAction = undefined;
			this.stateful.setField = undefined;
			this.stateful = undefined;
		}
	}

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
		stateful.setField = Stateful_setField;
		stateful.reflectStateOn = Stateful_reflectStateOn;

		if (el) stateful.reflectStateOn(el);
		
		return stateful;
	}
	essential.declare("StatefulResolver",StatefulResolver);

	var pageResolver = StatefulResolver(null,{ name:"page", mapClassForState:true });
	pageResolver.declare("config",{});
	pageResolver.reference("state").mixin({
		"livepage": false,
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
		return HTMLElement("SCRIPT",from,doc);
	}
	essential.set("HTMLScriptElement",HTMLScriptElement);

	function delayedScriptOnload(scriptRel) {
		function delayedOnload(ev) {
			var el = this;
			setTimeout(function(){
				// make sure it's not called before script executes
				pageResolver.set(["state","loadingScriptsUrl",el.src.replace(baseUrl,"")],false);
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

	function copyKeyEvent(src) {
		this.altKey = src.altKey;
		this.shiftKey = src.shiftKey;
		this.ctrlKey = src.ctrlKey;
		this.metaKey = src.metaKey;
		this.charCode = src.charCode;
	}
	function copyInputEvent(src) {
		copyKeyEvent.call(this,src);
	}
	function copyNavigateEvent(src) {
		copyKeyEvent.call(this,src);
	}
	function copyMouseEvent(src) {
		this.clientX = src.clientX;
		this.clientY = src.clientY;
		this.screenX = src.screenX;
		this.screenY = src.screenY;
		this.button = BUTTON_MAP[src.button]; //TODO check map
		this.buttons = src.button;
		//detail is repetitions
		//which == 1,2,3
	}
	function copyMouseEventOverOut(src) {
		copyMouseEvent.call(this,src);
		this.fromElement = src.fromElement;
		this.toElement = src.toElement;
		this.relatedTarget = src.relatedTarget;
	}
	var BUTTON_MAP = { "1":0, "2":2, "4":1 };
	var EVENTS = {
		"click" : {
			copyEvent: copyMouseEvent
		},
		"dblclick" : {
			copyEvent: copyMouseEvent
		},
		"contextmenu": {
			copyEvent: copyMouseEvent
		},
		"mousemove": {
			copyEvent: copyMouseEvent
		},
		"mouseup": {
			copyEvent: copyMouseEvent
		},
		"mousedown": {
			copyEvent: copyMouseEvent
		},
		"mousewheel": {
			copyEvent: copyMouseEvent
		},
		"wheel": {
			copyEvent: copyMouseEvent
		},
		"mouseenter": {
			copyEvent: copyMouseEvent
		},
		"mouseleave": {
			copyEvent: copyMouseEvent
		},
		"mouseout": {
			copyEvent: copyMouseEventOverOut
		},
		"mouseover": {
			copyEvent: copyMouseEventOverOut
		},

		"keyup": {
			copyEvent: copyKeyEvent
		},
		"keydown": {
			copyEvent: copyKeyEvent
		},
		"keypress": {
			copyEvent: copyKeyEvent
		},

		"blur": {
			copyEvent: copyInputEvent
		},
		"focus": {
			copyEvent: copyInputEvent
		},
		"focusin": {
			copyEvent: copyInputEvent
		},
		"focusout": {
			copyEvent: copyInputEvent
		},

		"copy": {
			copyEvent: copyInputEvent
		},
		"cut": {
			copyEvent: copyInputEvent
		},
		"change": {
			copyEvent: copyInputEvent
		},
		"input": {
			copyEvent: copyInputEvent
		},
		"textinput": {
			copyEvent: copyInputEvent
		},

		"scroll": {
			copyEvent: copyNavigateEvent
		},
		"reset": {
			copyEvent: copyNavigateEvent
		},
		"submit": {
			copyEvent: copyNavigateEvent
		},
		"select": {
			copyEvent: copyNavigateEvent
		},

		"error": {
			copyEvent: copyNavigateEvent
		},
		"haschange": {
			copyEvent: copyNavigateEvent
		},
		"load": {
			copyEvent: copyNavigateEvent
		},
		"unload": {
			copyEvent: copyNavigateEvent
		},
		"resize": {
			copyEvent: copyNavigateEvent
		},


		"":{}
	};

	function _MutableEvent(src) {
		this._original = src;
		this.type = src.type;
		this.target = src.target || src.srcElement;
		this.currentTarget = src.currentTarget|| src.target; 
		EVENTS[src.type].copyEvent.call(this,src);
	}
	_MutableEvent.prototype.relatedTarget = null;
	_MutableEvent.prototype.withActionInfo = MutableEvent_withActionInfo;
	_MutableEvent.prototype.withDefaultSubmit = MutableEvent_withDefaultSubmit;

	_MutableEvent.prototype.stopPropagation = function() {
		this._original.cancelBubble= true;
	};

	_MutableEvent.prototype.preventDefault = function() {
		this.defaultPrevented = true;
	};

	_MutableEvent.prototype.CAPTURING_PHASE = 1;
	_MutableEvent.prototype.AT_TARGET = 2;
	_MutableEvent.prototype.BUBBLING_PHASE = 3;

	function MutableEvent(sourceEvent) {
		function ClonedEvent() { }
		var ev;
		// IE event support
		if (sourceEvent && sourceEvent.srcElement && document.createEventObject) {
			ev = new _MutableEvent(sourceEvent);
		} else
		if (window.event && window.event.srcElement && document.createEventObject && sourceEvent==undefined) {
			ev = new _MutableEvent(window.event);
		}
		// other browsers, or not in listener 
		else {
			ClonedEvent.prototype = sourceEvent || window.event; 
			ev = new ClonedEvent();
			ev.withActionInfo = MutableEvent_withActionInfo;
			ev.withDefaultSubmit = MutableEvent_withDefaultSubmit;
		}
		return ev;		
	}
	essential.declare("MutableEvent",MutableEvent)

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


	function DialogAction(actionName) {
		this.actionName = actionName;
	} 
	DialogAction.prototype.activateArea = activateArea; // shortcut to global essential function
	var DialogActionGenerator = essential.set("DialogAction",Generator(DialogAction));


	function resizeTriggersReflow(ev) {
		// debugger;
		DocumentRoles()._resize_descs();
	}

	function enhanceUnhandledElements() {
		// debugger;
		var statefuls = ApplicationConfig(); // Ensure that config is present
		var handlers = DocumentRoles.presets("handlers");
		//TODO listener to presets -> Doc Roles additional handlers
		DocumentRoles()._enhance_descs();
		//TODO time to default_enhance yet?
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

			el.actionVariant = DialogActionGenerator.variant(action)(action);
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

	var arrayContains = essential("arrayContains");

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
				if (desc.layout.area != _activeAreaName) { 
					desc.layout.area = _activeAreaName;
					updateLayout = true;
				}
				if (updateLayout) this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
			}
		}
	};

	_DocumentRoles.prototype._area_changed_descs = function() {
		for(var i=0,desc; desc = this.descs[i]; ++i) {
			if (desc.enhanced && this.handlers.layout[desc.role]) {
				desc.layout.area = _activeAreaName;
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

	function MutableEvent_withDefaultSubmit(form) {
		var commandName = "trigger";
		var commandElement = null;

		if (form.elements) {
			for(var i=0,e; e=form.elements[i]; ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
		} else {
			var buttons = form.getElementsByTagName("button");
			for(var i=0,e; e=buttons[i]; ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
			var inputs = form.getElementsByTagName("input");
			if (commandElement) for(var i=0,e; e=inputs[i]; ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
		}
		this.action = form.action;
		this.actionElement = form;
		this.commandElement = commandElement;
		this.commandName = commandName;

		return this;
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
	
	function MutableEvent_withActionInfo() {
		var element = this.target;
		// role of element or ancestor
		// TODO minor tags are traversed; Stop at document, header, aside etc
		
		while(element) {
			if (element.getElementById || element.getAttribute == undefined) return this; // document element not applicable

			var role = element.getAttribute("role");
			switch(role) {
				case "button":
				case "link":
				case "menuitem":
					this.stateful = StatefulResolver(element,true); //TODO configuration option for if state class map
					this.commandRole = role;
					this.commandElement = element;
					this.ariaDisabled = element.getAttribute("aria-disabled") != null;

					//determine commandName within action object
					this.commandName = element.getAttribute("data-name") || element.getAttribute("name"); //TODO name or id
					//TODO should links deduct actions and name from href
					element = null;
					break;
				case null:
					switch(element.tagName) {
						case "BUTTON":
						case "button":
							//TODO if element.type == "submit" && element.tagName == "BUTTON", set commandElement
							if (element.type == "submit") {
								this.stateful = StatefulResolver(element,true); //TODO configuration option for if state class map
								this.commandElement = element;
								this.ariaDisabled = element.getAttribute("aria-disabled") != null;
								this.commandName = element.getAttribute("data-name") || element.getAttribute("name"); //TODO name or id
								element = null;
							}
							break;
					}
					break;
			}
			if (element) element = element.parentNode;
		}
		if (this.commandElement == undefined) return this; // no command

		element = this.commandElement;
		while(element) {
			var action = element.getAttribute("action");
			if (action) {
				this.action = action;
				this.actionElement = element;
				element = null;
			}			
			if (element) element = element.parentNode;
		}

		return this;
	}

	function dialog_button_click(ev) {
		ev = MutableEvent(ev).withActionInfo();

		if (ev.commandElement) {
			if (ev.stateful("state.disabled")) return; // disable
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
		// only use DocumentRoles layout if DOM is ready
		if (document.body) DocumentRoles()._layout_descs();
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
		ap.state.set("livepage",true);

	}

	function onPageLoad(ev) {
		var ap = ApplicationConfig();
		_liveAreas = true;
		ap.state.set("livepage",true);
	}

	if (window.addEventListener) window.addEventListener("load",onPageLoad,false);
	else if (window.attachEvent) window.attachEvent("onload",onPageLoad);


	function _ApplicationConfig() {
		this.resolver = pageResolver;

		// copy state presets for backwards compatibility
		var state = this.resolver.reference("state","undefined");
		for(var n in this.state) state.set(n,this.state[n]);
		this.state = state;
		document.documentElement.lang = this.state("lang");
		state.on("change",this,this.onStateChange);
		this.resolver.on("change","state.loadingScriptsUrl",this,this.onLoadingScripts);
		this.resolver.on("change","state.loadingConfigUrl",this,this.onLoadingConfig);

		this.config = this.resolver.reference("config","undefined");
		this._gather();
		this._apply();

		setTimeout(bringLive,60);
	}
//    _ApplicationConfig.args = [
// 	    ObjectType({ name:"state" })
// 	    ];

	var ApplicationConfig = Generator(_ApplicationConfig);
	essential.set("ApplicationConfig",ApplicationConfig).restrict({ "singleton":true, "lifecycle":"page" });
	
	// preset on instance (old api)
	ApplicationConfig.presets.declare("state", { });

	ApplicationConfig.prototype.onStateChange = function(ev) {
		switch(ev.symbol) {
			case "livepage":
				pageResolver.reflectStateOn(document.body,false);
				var ap = ev.data;
				//if (ev.value == true) ap.reflectState();
				if (_activeAreaName) {
					activateArea(_activeAreaName);
				} else {
					//TODO scan config to determine these
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
					enhanceUnhandledElements();
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
			case "authorised":
			case "configured":
				if (ev.base.loading == false && ev.base.configured == true && ev.base.authenticated == true 
					&& ev.base.authorised == true && ev.base.connected == true && ev.base.launched == false) {
					this.set("state.launching",true);
					// do the below as recursion is prohibited
					if (document.body) essential("instantiatePageSingletons")();
					enhanceUnhandledElements();
				}
				break;			
			case "launching":
			case "launched":
				if (ev.value == true) {
					if (document.body) essential("instantiatePageSingletons")();
					enhanceUnhandledElements();
					if (ev.symbol == "launched") this.set("state.launching",false);
				}
				break;

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
	ApplicationConfig.prototype.getAuthenticatedArea = function() {
		// return "edit";
		return "sp-explorer";
	};
	ApplicationConfig.prototype.getIntroductionArea = function() {
		//return "signup";
		return "sp-explorer";
	};

	ApplicationConfig.prototype.declare = function(key,value) {
		this.config.declare(key,value);
	};

	ApplicationConfig.prototype._apply = function() {
		for(var k in this.config()) {
			var conf = this.config()[k];
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
				this.config()[element.id] = map;
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
			return this.config()[element.id] || this._getElementRoleConfig(element);
		}
		var name = element.getAttribute("name");
		if (name) {
			var p = element.parentNode;
			while(p) {
				if (p.id) {
					return this.config()[p.id + "." + name] || this._getElementRoleConfig(element);
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
