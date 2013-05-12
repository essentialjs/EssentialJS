!function() {

	var essential = Resolver("essential::",{}),
		console = essential("console");

	var contains;
	function doc_contains(a,b) {
		return a !== b && (a.contains ? a.contains(b) : true);
	}
	function cdp_contains(a,b) {
		return !!(a.compareDocumentPosition(b) & 16);
	}
	function false_contains(a,b) { return false; }

	if (document.documentElement.contains) {
		contains = doc_contains;
	} else if (document.documentElement.compareDocumentPosition) {
		contains = cdp_contains;
	} else {
		contains = false_contains;
	}
	essential.declare("contains",contains);


   	/**
   	 * (html) or (head,body)
   	 */
	function createHTMLDocument(head,body) {
		if (typeof head == "object" && typeof head.length == "number") {
			head = head.join("");
		}
		if (typeof body == "object" && typeof body.length == "number") {
			body = body.join("");
		}
		if (arguments.length == 2) {
			if (head.substring(0,5) != "<head") head = '<head>'+head+'</head>';
			if (body.substring(0,5) != "<body") body = '<body>'+body+'</body>';
		}

		// var doc = document.implementation.createDocument('','',
		// 	document.implementation.createDocumentType('body','',''));
		var doc;
		if (document.implementation && document.implementation.createHTMLDocument) {
			doc = document.implementation.createHTMLDocument("");
			if (arguments.length == 2) {
				doc.documentElement.innerHTML = '<html>' + (head||"") + (body||"") + '</html>';
			}
			else {
				doc.documentElement.innerHTML = head.replace(/<![^>]+>/,"");
			}
		} else  if (window.ActiveXObject) {
		// 	text = text.replace("<html",'<div id="esp-html"').replace("</html>","</div>");
		// 	text = text.replace("<HTML",'<div id="esp-html"').replace("</HTML>","</div>");
		// 	text = text.replace("<head",'<washead').replace("</head>","</washead>");
		// 	text = text.replace("<HEAD",'<washead').replace("</HEAD>","</washead>");
		// 	text = text.replace("<body",'<wasbody').replace("</body>","</wasbody>");
		// 	text = text.replace("<BODY",'<wasbody').replace("</BODY>","</wasbody>");
		// 	var div = document.createElement("DIV");
		// 	div.innerHTML = text;
		// 	this.head = div.getElementsByTagName("washead");
		// 	this.body = div.getElementsByTagName("wasbody") || div;
		// 	//TODO offline htmlfile object?
		// }

			doc = new ActiveXObject("htmlfile");
			doc.appendChild(doc.createElement("html"));
			var _head = doc.createElement("head");
			var _body = doc.createElement("body");
			doc.documentElement.appendChild(_head);
			doc.documentElement.appendChild(_body);
			if (arguments.length == 2) {
				_body.innerHTML = body;
				if (head != "") _head.innerHTML = head;
			} else {
				//TODO replace html/head/body and move them
				debugger;
			}

		} else {
			return document.createElement("DIV");// dummy default
		}

		return doc;
	}
	essential.declare("createHTMLDocument",createHTMLDocument);


	/*
		Default roles for determining effective role
	*/
	var ROLE = {
		//TODO optional tweak role function

		form: { role:"form" },
		iframe: { role:"presentation"},
		object: { role:"presentation"},
		a: { role:"link" },
		img: { role:"img" },

		label: { role:"note" },
		input: {
			role: "textbox",
			//TODO tweak: tweakInputRole(role,el,parent)
			type: {
				// text: number: date: time: url: email:
				// image: file: tel: search: password: hidden:
				range:"slider", checkbox:"checkbox", radio:"radio",
				button:"button", submit:"button", reset:"button"
			}
		},
		select: { role: "listbox" },
		button: { role:"button" },
		textarea: { role:"textbox" },
		fieldset: { role:"group" },
		progress: { role:"progressbar" },

		"default": {
			role:"default"
		}
	};

	/*
		ROLE
		1) if stateful, by stateful("role")
		1) by role
		2) by implied role (tag,type)
	*/
	function effectiveRole(el) {
		var role;
		if (el.stateful) {
			role = el.stateful("impl.role","undefined");
			if (role) return role;
		}

		// explicit role attribute
		role = el.getAttribute("role");
		if (role) return role;

		// implicit
		var tag = el.tagName || el.nodeName || "default";
		var desc = ROLE[tag.toLowerCase()] || ROLE["default"];
		role = desc.role;

		if (desc.type&&el.type) {
			var type = el.getAttribute("type"); //TODO handlers for unsupported types
			role = desc.type[type] || role;
		}
		if (desc.tweak) role = desc.tweak(role,el);

		return role;
	}
	effectiveRole.ROLE = ROLE;
	essential.set("effectiveRole",effectiveRole);


	/*
		DOM Events
	*/
    
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
		this.pageX = src.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		this.pageY = src.clientY + document.body.scrollTop + document.documentElement.scrollTop;
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
		// compositionstart/element/true compositionupdate/element/false
		"click" : {
			type: "MouseEvents",
			cancelable:false, //true
			copyEvent: copyMouseEvent
		},
		"dblclick" : {
			type: "MouseEvents",
			cancelable:false,
			copyEvent: copyMouseEvent
		},
		"contextmenu": {
			cancelable:false,
			copyEvent: copyMouseEvent
		},
		"mousemove": {
			type: "MouseEvents",
			cancelable:true,
			copyEvent: copyMouseEvent
		},
		"mouseup": {
			type: "MouseEvents",
			cancelable:true,
			copyEvent: copyMouseEvent
		},
		"mousedown": {
			type: "MouseEvents",
			cancelable:true,
			copyEvent: copyMouseEvent
		},
		"mousewheel": {
			cancelable:false,
			copyEvent: copyMouseEvent
		},
		"wheel": {
			cancelable:true,
			copyEvent: copyMouseEvent
		},
		"mouseenter": {
			type: "MouseEvents",
			cancelable:false,
			copyEvent: copyMouseEvent
		},
		"mouseleave": {
			type: "MouseEvents",
			cancelable:false,
			copyEvent: copyMouseEvent
		},
		"mouseout": {
			type: "MouseEvents",
			cancelable:true,
			copyEvent: copyMouseEventOverOut
		},
		"mouseover": {
			type: "MouseEvents",
			cancelable:true,
			copyEvent: copyMouseEventOverOut
		},

		"keyup": {
			cancelable:true,
			copyEvent: copyKeyEvent
		},
		"keydown": {
			cancelable:true,
			copyEvent: copyKeyEvent
		},
		"keypress": {
			cancelable:true,
			copyEvent: copyKeyEvent
		},

		"blur": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"focus": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"focusin": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"focusout": {
			cancelable:false,
			copyEvent: copyInputEvent
		},

		"copy": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"cut": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"change": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"input": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"textinput": {
			cancelable:false,
			copyEvent: copyInputEvent
		},

		"scroll": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"reset": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"submit": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"select": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},

		"error": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"haschange": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"load": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"unload": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"resize": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},


		"":{}
	};


	function MutableEvent_withActionInfo() {
		var element = this.target;
		// role of element or ancestor
		// TODO minor tags are traversed; Stop at document, header, aside etc
		
		while(element && element.tagName) {
			if (element.getElementById || element.getAttribute == undefined) return this; // document element not applicable

			var role = element.getAttribute("role") || effectiveRole(element);
			switch(role) {
				case "button":
				case "link":
				case "menuitem":
					this.stateful = element.stateful;
					//TODO configuration option for if state class map
					this.commandRole = role;
					this.commandElement = element;
					this.ariaDisabled = element.getAttribute("aria-disabled") != null;

					//determine commandName within action object
					this.commandName = element.getAttribute("data-name") || element.getAttribute("name"); //TODO name or id
					//TODO should links deduct actions and name from href
					element = null;
					break;
				/*
				case null:
					switch(element.tagName) {
						case "BUTTON":
						case "button":
							//TODO if element.type == "submit" && element.tagName == "BUTTON", set commandElement
							//TODO which submit buttons to turn stateful
							if (element.type == "submit") {
								this.stateful = element.stateful;
								//TODO configuration option for if state class map
								this.commandElement = element;
								this.ariaDisabled = element.getAttribute("aria-disabled") != null;
								this.commandName = element.getAttribute("data-name") || element.getAttribute("name"); //TODO name or id
								element = null;
							}
							break;
					}
					break;
				*/
			}
			if (element) element = element.parentNode;
		}
		if (this.commandElement == undefined) return this; // no command

		element = this.commandElement;
		while(element && element.tagName) {
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

	_MutableEvent.prototype.isDefaultPrevented = function() {
		return this.defaultPrevented;
	};

    _MutableEvent.prototype.CAPTURING_PHASE = 1;
	_MutableEvent.prototype.AT_TARGET = 2;
	_MutableEvent.prototype.BUBBLING_PHASE = 3;
    
    // trigger like jQuery
    _MutableEvent.prototype.trigger = function() {
        this.target.fireEvent("on" + this.type, this._original);
    };
    
    function _NativeEventIE(type,props) {
        var event = new _MutableEvent( document.createEventObject() );
        if (props) for (var name in props) event._original[name] = props[name];
        return event;
    }
    
    function _NativeEvent(type, props) {
        var event = document.createEvent(EVENTS[type].type || "Events"), bubbles = true;
        if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name]);
        event.initEvent(type, bubbles, EVENTS[type].cancelable, null, null, null, null, null, null, null, null, null, null, null, null);
        event.isDefaultPrevented = _MutableEvent.prototype.isDefaultPrevented;
        event.trigger = function(target) { (target || this.target).dispatchEvent(this); };
        return event;
    }

	//TODO consider moving ClonedEvent out of call
	function MutableEventModern(sourceEvent,props) {
        if (typeof sourceEvent == "string") return _NativeEvent(sourceEvent,props);
        
		if (sourceEvent.withActionInfo) return sourceEvent;
		function ClonedEvent() {
            this._original = sourceEvent;
			this.withActionInfo = MutableEvent_withActionInfo;
			this.withDefaultSubmit = MutableEvent_withDefaultSubmit;
            this.stopPropagation = function() { sourceEvent.stopPropagation(); };
            this.preventDefault = function() { sourceEvent.preventDefault(); };
	        this.isDefaultPrevented = _MutableEvent.prototype.isDefaultPrevented;
        }
		ClonedEvent.prototype = sourceEvent; 

		return  new ClonedEvent();
	}

	function MutableEventFF(sourceEvent,props) {
        if (typeof sourceEvent == "string") return _NativeEvent(sourceEvent,props);

        sourceEvent.withActionInfo = MutableEvent_withActionInfo;
		sourceEvent.withDefaultSubmit = MutableEvent_withDefaultSubmit;
	    sourceEvent.isDefaultPrevented = _MutableEvent.prototype.isDefaultPrevented;

		return sourceEvent;
	}

	function MutableEventIE(sourceEvent,props) {
        if (typeof sourceEvent == "string") return _NativeEventIE(sourceEvent,props);

        if (sourceEvent && sourceEvent.withActionInfo) return sourceEvent;
		return new _MutableEvent(sourceEvent == null? window.event : sourceEvent);
	}

	var MutableEvent;
	//TODO IE9 ?
	if (navigator.userAgent.match(/Firefox\//)) MutableEvent = essential.declare("MutableEvent",MutableEventFF);
	else if (navigator.userAgent.match(/MSIE /) && !navigator.userAgent.match(/Opera/)) MutableEvent = essential.declare("MutableEvent",MutableEventIE);
	else MutableEvent = essential.declare("MutableEvent",MutableEventModern);


	function _makeEventCleaner(listeners,sourceListeners,bubble)
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
		cleaner.listeners = sourceListeners; // for removeEventListeners
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

		var listeners2 = {};
		if (eControl.addEventListener) {
			for(var n in listeners) {
				listeners2[n] = listeners[n];
				eControl.addEventListener(n, listeners[n], bubble || false);
			}
		} else {
			for(var n in listeners) {
				listeners2[n] = makeIeListener(eControl,listeners[n]);
				eControl.attachEvent('on'+n,listeners2[n]);
			}
		}   
		eControl._cleaners.push(_makeEventCleaner(listeners2,listeners,bubble || false));
	}
	essential.declare("addEventListeners",addEventListeners);

	function removeEventListeners(el, listeners,bubble) {
		if (el._cleaners) {
			for(var i=0,c; c = el._cleaners[i]; ++i) if (c.listeners == listeners) {
				c.call(el);
				el._cleaners.splice(i,1);
			}
		} else {
			if (el.removeEventListener) {
				for(var n in listeners) {
					el.removeEventListener(n, listeners[n], bubble || false);
				}
			} else {
				for(var n in listeners) {
					el.detachEvent('on'+n,listeners[n]);
				}
			}
		}
	}
	essential.declare("removeEventListeners",removeEventListeners);


}();