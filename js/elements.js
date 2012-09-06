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

	function mixinElementState(el,state) {
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

	function StatefulResolver(el,mapClassForState) {
		if (el) {
			if (el.stateful) return el.stateful;
			var stateful = el.stateful = Resolver({ state: {} });
			mixinElementState(el,stateful("state"));
			stateful.reference("state").on("change",el,reflectElementState);
			if (!nativeClassList) {
				el.classList = DOMTokenList();
			}
			DOMTokenList_mixin(el.classList,el.className);
		} else {
			var stateful = Resolver({ state: {} });
		}
		if (mapClassForState) {
			stateful.set("map.class.state", new ClassForState());
			stateful.set("map.class.notstate", new ClassForNotState());
			StatefulResolver.updateClass(stateful,el);
		}

		return stateful;
	}
	essential.declare("StatefulResolver",StatefulResolver);

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
	}

	function MutableEvent(sourceEvent) {
		function ClonedEvent() { }
		ClonedEvent.prototype = sourceEvent || window.event; // IE event support
		var ev = ClonedEvent();
		if (sourceEvent == undefined) {		// IE event object
			ev.target = ev.srcElement;
			//TODO ev.button 1,2,3 vs 1,2,4
		}
		ev.withActionInfo = MutableEvent_withActionInfo;
		ev.withDefaultSubmit = MutableEvent_withDefaultSubmit;
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

	function _TimeField() {

	}
	StatefulField.variant("input[type=time]",Generator(_TimeField));

	function _CommandField(name,stateful,role) {

	}
	_CommandField.discarded = function(instance) {

	};
	var CommandField = StatefulField.variant("*[role=link]",Generator(_CommandField));
	StatefulField.variant("*[role=button]",Generator(_CommandField));

	function statefulCleaner(el) {
		if (el.stateful) {
			if (el.stateful.field) StatefulField.discarded(el.stateful.field);
			el.stateful.field = undefined;
			el.stateful = undefined;
		}
	}

	var arrayContains = essential("arrayContains");

	/* Enhance all stateful fields of a parent */
	function enhanceStatefulFields(parent) {

		for(var el = parent.firstChild; el; el = el.nextSibling) {
			var name = el.name || el.getAttribute("data-name") || el.getAttribute("name");
			if (name) {
				var role = el.getAttribute("role");
				var variants = [];
				if (role) {
					if (el.type) variants.push("*[role="+role+",type="+el.type+"]");
					variants.push("*[role="+role+"]");
				} else {
					if (el.type) variants.push(el.tagName+"[type="+el.type+"]");
					variants.push(el.tagName);
				}

				var stateful = StatefulResolver(el,true);
				var field = stateful.field = StatefulField.variant(variants)(name,stateful,role);
				
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
					"layout": {},
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
					this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
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
							break;
					}
					break;
			}
			element = element.parentNode;
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
			element = element.parentNode;
		}

		return this;
	}

	function dialog_button_click(ev) {
		ev = MutableEvent(ev).withActionInfo();

		if (ev.commandElement) {
			if (ev.stateful("state.disabled")) return; // disable
			if (ev.ariaDisabled) return; //TODO fold into stateful

			this.submit(ev); //TODO action context
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
