!function() {

	var essential = Resolver("essential",{}),
		console = essential("console"),
		EnhancedDescriptor = essential("EnhancedDescriptor"),
		isIE = navigator.userAgent.indexOf("; MSIE ") > -1 && navigator.userAgent.indexOf("; Trident/") > -1;

	essential.declare("baseUrl",location.href.substring(0,location.href.split("?")[0].lastIndexOf("/")+1));

	var base = document.getElementsByTagName("BASE")[0];
	if (base) {
		var baseUrl = base.href;
		if (baseUrl.charAt(baseUrl.length - 1) != "/") baseUrl += "/";
		// debugger;
		essential.set("baseUrl",baseUrl);
	}

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

	// str includes the outerHTML for body
	function _applyBody(doc,str) {
		str = str.replace("<body",'<div was="body"').replace("</body>","</div>");
		str = str.replace("<BODY",'<div was="body"').replace("</BODY>","</div>");

		var _body = doc.createElement("body");
		doc.appendChild(_body);

		_body.innerHTML = str;

		var src = _body.firstChild;
		for(var i=0,a; !!(a = src.attributes[0]); ++i) if (a.name != "was") _body.appendChild(a);
		_body.innerHTML = src.innerHTML;

	}

	function _combineHeadAndBody(head,body) { //TODO ,doctype
		if (typeof head == "object" && typeof head.length == "number") {
			head = head.join("");
		}
		if (typeof body == "object" && typeof body.length == "number") {
			body = body.join("");
		}

		if (head && body) {
			if (head.substring(0,5).toLowerCase() != "<head") head = '<head>'+head+'</head>';
			if (body.substring(0,5).toLowerCase() != "<body") body = '<body>'+body+'</body>';
		}

		var text = (head||"") + (body||"");
		if ((head.substring(0,5).toLowerCase() != "<head") && (/<\/body>/.test(text) === false)) text = "<body>" + text + "</body>";
		if (/<\/html>/.test(text) === false) text = '<html>' + text + '</html>';

		text = text.replace("<!DOCTYPE","<!doctype");

		return text;
	}

	function _createStandardsDoc(markup) {
		var doc;
		if (/Gecko\/20/.test(navigator.userAgent)) {
			doc = document.implementation.createHTMLDocument("");
			// if (hasDoctype) 
				doc.documentElement.innerHTML = markup;
			// else doc.body.innerHTML = markup;
			// parser = new DOMParser();
			// doc = parser.parseFromString(_combineHeadAndBody(head,body),"text/html");
		}
		else {
			doc = document.implementation.createHTMLDocument("");
			doc.open();
			doc.write(markup);
			doc.close();
		}
		return doc;
	}

	function _importNode(doc,node,all) {
		if (node.nodeType == 1) { // ELEMENT_NODE
			var nn = doc.createElement(node.nodeName);
			if (node.attributes && node.attributes.length > 0) {
				for(var i=0,a; a=node.attributes[i]; ++i) nn.setAttribute(a.nodeName, node.getAttribute(a.nodeName));
			}
			if (all && node.childNodes && node.childNodes.length>0) {
				for(var i=0,c; c = node.childNodes[i]; ++i) nn.appendChild(_importNode(doc,c,all));
			}
			return nn;
		}

		// TEXT_NODE CDATA_SECTION_NODE COMMENT_NODE
		return doc.createTextNode(node.nodeValue);
	}

	var SUPPORTED_TAGS = "template message abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video".split(" ");
	var IE_HTML_SHIM;

	function shimMarkup(markup) {
		if (IE_HTML_SHIM == undefined) {

			var bits = ["<script>"];
			for(var i=0,t; t = SUPPORTED_TAGS[i]; ++i) bits.push('document.createElement("'+t+'");');			
			bits.push("</script>");
			IE_HTML_SHIM = bits.join("");
		}
		if (markup.indexOf("</head>") >= 0 || markup.indexOf("</HEAD>") >= 0) {
			markup = markup.replace("</head>","</head>" + IE_HTML_SHIM);
			markup = markup.replace("</HEAD>","</HEAD>" + IE_HTML_SHIM);
		} else {
			markup = markup.replace("<body",IE_HTML_SHIM + "<body");
			markup = markup.replace("<BODY",IE_HTML_SHIM + "<BODY");
		}
		return markup;
	}

	var documentId = 444;

	/**
	 * (html) or (head,body) rename to importHTMLDocument ?

	 * head will belong to external doc
	 * body will be imported so elements can be mixed in
	 */
	function importHTMLDocument(head,body) {

		var doc = {},
			markup = _combineHeadAndBody(head,body),
			hasDoctype = markup.substring(0,9).toLowerCase() == "<!doctype";

		try {
			var ext = _createStandardsDoc(markup);
			if (document.adoptNode) {
				doc.head = document.adoptNode(ext.head);
				doc.body = document.adoptNode(ext.body);
			} else {
				doc.head = document.importNode(ext.head);
				doc.body = document.importNode(ext.body);
			}
		}
		catch(ex) {
			var ext = new ActiveXObject("htmlfile");
			markup = shimMarkup(markup);
			ext.write(markup);
			if (ext.head === undefined) ext.head = ext.body.previousSibling;

			doc.uniqueID = ext.uniqueID;
			doc.head = ext.head;
			doc.body = _importNode(document,ext.body,true);

			// markup = markup.replace("<head",'<washead').replace("</head>","</washead>");
			// markup = markup.replace("<HEAD",'<washead').replace("</HEAD>","</washead>");
			// markup = markup.replace("<body",'<wasbody').replace("</body>","</wasbody>");
			// markup = markup.replace("<BODY",'<wasbody').replace("</BODY>","</wasbody>");
		}
		if (!doc.uniqueID) doc.uniqueID = documentId++;

		return doc;
	}
	essential.declare("importHTMLDocument",importHTMLDocument);

 	/**
 	 * (html) or (head,body)
 	 */
	function createHTMLDocument(head,body) {

		var doc,parser,markup = _combineHeadAndBody(head,body),
			hasDoctype = markup.substring(0,9).toLowerCase() == "<!doctype";
		try {
			doc = _createStandardsDoc(markup);
		} catch(ex) {
			// IE can't or won't do it

			if (window.ActiveXObject) {
				//TODO make super sure that this is garbage collected, supposedly sticky
				doc = new ActiveXObject("htmlfile");
				doc.write(markup);
				if (doc.head === undefined) doc.head = doc.body.previousSibling;
			} else {
				doc = document.createElement("DIV");// dummy default

				// this.head = div.getElementsByTagName("washead");
				// this.body = div.getElementsByTagName("wasbody") || div;
				// var __head = _body.getElementsByTagName("washead");
				// var __body = _body.getElementsByTagName("wasbody");
			}
		}
		if (!doc.uniqueID) doc.uniqueID = documentId++;

		return doc;
	}
	essential.declare("createHTMLDocument",createHTMLDocument);

	function DOMParser() {
		//TODO crossbrowser support text/html,text/xml, pluggable mimes
	}

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

	function _defaultEventProps(ev) {
		ev.bubbles = true; ev.view = window;

		ev.detail = 0;
		ev.screenX = 0; ev.screenY = 0; //TODO map client to screen
		ev.clientX = 1; ev.clientY = 1;
		ev.ctrlKey = false; ev.altKey = false; 
		ev.shiftKey = false; ev.metaKey = false;
		ev.button = 0; //?
		ev.relatedTarget = undefined;
	}

	function createEventIE(type,props) {
		var ev = document.createEventObject();
		_defaultEventProps(ev);
		ev.type = type;
		ev.cancelable = this.cancelable;

        if (props) {
    	 	for (var name in props) ev[name] = props[name];
			ev.button = {0:1, 1:4, 2:2}[props.button] || props.button; 
        }

		return ev;
	}

	function createEventDOM(type,props) {
		var ev = document.createEvent(this.type || "Event"), combined = {};
		_defaultEventProps(combined);
		if (props) {
			for (var name in props) (name == 'bubbles') ? (combined.bubbles = !!props[name]) : (combined[name] = props[name]);
		}
		this.init(ev,combined);

		return ev;
	}

	function initEvent(ev,m) {
		ev.initEvent(this.name,m.bubbles,m.cancelable, m.view,
			m.detail,
			m.screenX, m.screenY, m.clientX, m.clientY,
			m.ctrlKey, m.altKey, m.shiftKey, m.metaKey,
			m.button,
			m.relatedTarget || document.body.parentNode);
	}

	function initFocusEvent(ev,m) {
		ev.initFocusEvent(this.name,m.bubbles,m.cancelable, m.view,
			m.detail,
			m.relatedTarget || document.body.parentNode);
	}

	function initUIEvent(ev,m) {
		ev.initUIEvent(this.name,m.bubbles,m.cancelable, m.view,m.detail);
	}

	function initMouseEvent(ev,m) {
		var eventDoc, doc, body;

		ev.initMouseEvent(this.name,m.bubbles,this.cancelable, m.view,
			m.detail,
			m.screenX, m.screenY, m.clientX, m.clientY,
			m.ctrlKey, m.altKey, m.shiftKey, m.metaKey,
			m.button,
			m.relatedTarget || document.body.parentNode);


		// IE 9+ creates events with pageX and pageY set to 0.
		// Trying to modify the properties throws an error,
		// so we define getters to return the correct values.
		if ( ev.pageX === 0 && ev.pageY === 0 && Object.defineProperty && isIE) {
			eventDoc = ev.relatedTarget.ownerDocument || document;
			doc = eventDoc.documentElement;
			body = eventDoc.body;

			Object.defineProperty( ev, "pageX", {
				get: function() {
					return m.clientX +
						( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
						( doc && doc.clientLeft || body && body.clientLeft || 0 );
				}
			});
			Object.defineProperty( ev, "pageY", {
				get: function() {
					return m.clientY +
						( doc && doc.scrollTop || body && body.scrollTop || 0 ) -
						( doc && doc.clientTop || body && body.clientTop || 0 );
				}
			});
		}
	}

	function triggerEventDOM(el,ev) {
		if (isIE && ev.type == "click") {
			return el.click();
		}
		return el.dispatchEvent(ev);
	}

	function triggerEventIE(el,ev) {
		if (ev.type == "click") {
			return el.click();
		}
		//TODO doScroll for scroll-bars

		if (el) return el.fireEvent("on"+ ev.type,ev);
		else return ev.target.fireEvent("on"+ ev.type,ev);
	}


	function AllEvents() {}
	AllEvents.prototype.__ = function(m) { if (m) for(var n in m) this[n] = m[n]; };
	AllEvents.prototype.cancelable = true;
	AllEvents.prototype.create = createEventDOM;
	AllEvents.prototype.init = initEvent;
	AllEvents.prototype.trigger = triggerEventDOM;

	if (typeof document.createEvent !== "function") {
		AllEvents.prototype.create = createEventIE;
		AllEvents.prototype.trigger = triggerEventIE;
	}


	function MouseEvents(m) {
		this.__(m);
	}
	MouseEvents.prototype = new AllEvents();
	MouseEvents.prototype.type = "MouseEvents";
	MouseEvents.prototype.init = initMouseEvent;
	MouseEvents.prototype.copy = copyMouseEvent;


	function MouseOverOutEvents(m) {
		this.__(m);
	}
	MouseOverOutEvents.prototype = new AllEvents();
	MouseOverOutEvents.prototype.type = "MouseEvents";
	MouseOverOutEvents.prototype.init = initMouseEvent;
	MouseOverOutEvents.prototype.copy = copyMouseEventOverOut;


	function KeyEvents(m) {
		this.__(m);
	}
	KeyEvents.prototype = new AllEvents();
	KeyEvents.prototype.type = "KeyboardEvent";
	KeyEvents.prototype.init = initEvent;
	KeyEvents.prototype.copy = copyKeyEvent;

	
	function InputEvents(m) {
		this.__(m);
	}
	InputEvents.prototype = new AllEvents();
	InputEvents.prototype.type = "FocusEvent";
	InputEvents.prototype.init = initFocusEvent;
	InputEvents.prototype.cancelable = false;
	InputEvents.prototype.copy = copyInputEvent;


	function FocusEvents(m) {
		this.__(m);
	}
	FocusEvents.prototype = new AllEvents();
	FocusEvents.prototype.type = "FocusEvent";
	FocusEvents.prototype.init = initFocusEvent;
	FocusEvents.prototype.cancelable = false;
	FocusEvents.prototype.copy = copyInputEvent;


	function UIEvents(m) {
		this.__(m);
	}
	UIEvents.prototype = new AllEvents();
	UIEvents.prototype.type = "UIEvent";
	UIEvents.prototype.init = initUIEvent;
	UIEvents.prototype.cancelable = false;
	UIEvents.prototype.copy = copyNavigateEvent;


	var BUTTON_MAP = { "1":0, "2":2, "4":1 };
	var EVENTS = {
		// compositionstart/element/true compositionupdate/element/false
		"click" : new MouseEvents({cancelable:false}),
		"dblclick" : new MouseEvents({cancelable:false}),
		"contextmenu": new MouseEvents({cancelable:false}),

		"mousemove": new MouseEvents({cancelable:false}),
		"mouseup": new MouseEvents(),
		"mousedown": new MouseEvents(),
		"mousewheel": new MouseEvents({cancelable:false,type:"MouseWheelEvent"}), //TODO initMouseWheelEvent
		"wheel": new MouseEvents({type:"MouseEvent"}), //?? WheelEvent ?
		"mouseenter": new MouseEvents({cancelable:false}),
		"mouseleave": new MouseEvents({cancelable:false}),

		"mouseout": new MouseOverOutEvents(),
		"mouseover": new MouseOverOutEvents(),

		"keyup": new KeyEvents(),
		"keydown": new KeyEvents(),
		"keypress": new KeyEvents(),

		"blur": new FocusEvents(),
		"focus": new FocusEvents(),
		"focusin": new FocusEvents(),
		"focusout": new FocusEvents(),

		"copy": new InputEvents(),
		"cut": new InputEvents(),
		"change": new InputEvents(),
		// "input": new InputEvents(),
		// "textinput": new InputEvents(),
		"selectstart": new InputEvents(),

		"scroll": new UIEvents(),

		"reset": new InputEvents(),
		"submit": new InputEvents(),

		"select": new UIEvents(),
		"abort": new UIEvents(),
		"error": new UIEvents(),

		"haschange": new UIEvents(),

		"load": new UIEvents(),
		"unload": new UIEvents(),
		"resize": new UIEvents(),


		"":{}
	};
	for(var n in EVENTS) EVENTS[n].name = n;


	var lowestDelta = 1E10, lowestDeltaXY = 1E10;

	function MutableEvent_withMouseInfo() {
		/*
			deltaX,deltaY origin top left
			wheelDeltaX,wheelDeltaY origin ?
		*/
		var delta = 0, deltaX = 0, deltaY = 0, absDelta = 0, absDeltaXY = 0;

		// New school FF17+
		if (typeof this.deltaX == "number" && typeof this.deltaY == "number") {
			deltaX = this.deltaX; deltaY = this.deltaX;
			this.delta = this.deltaY? this.deltaY : this.deltaX;

			delta = this.delta;
		}
		// Webkit
		else if (typeof this.wheelDeltaX == "number" && typeof this.wheelDeltaY == "number") {
			this.deltaX = deltaX = this.wheelDeltaX;
			this.deltaY = deltaY = this.wheelDeltaY;
		}
		else if (this.axis != undefined) {
			// DOMMouseScroll FF3.5+
			deltaX = this.deltaX = this.axis == ev.HORIZONTAL_AXIS? -this.delta : 0;
			deltaY = this.deltaY = this.axis == ev.VERTICAL_AXIS? this.delta : 0;
		}
		else {

		}

		//TODO normalised props based on jquery-mousewheel
		absDelta = Math.abs(delta);
		absDeltaXY = Math.max(Math.abs(deltaY),Math.abs(deltaX));

		// console.log("deltas",{x:deltaX,y:deltaY},"scrollLeft",this.target.scrollLeft);

		/*
		var delta = this.delta;
		this.deltaX = this.x;
		this.deltaY = this.y;

		// Old school scrollwheel delta
		if (ev.wheelDelta) { delta = ev.wheelDelta/120; }
		if (ev.detail) { delta = -ev.detail/3; }

		// New school multidim scroll (touchpads) deltas
		this.deltaY = delta;


		// Webkit
		if (ev.wheelDeltaY !== undefined) { this.deltaY = ev.wheelDeltaY/120; }
		if (ev.wheelDeltaX !== undefined) { this.deltaX = -1 * ev.wheelDeltaX/120; }
		*/
		return this;
	}


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
		var commandName = "trigger",
			commandElement = null, i, e;

		if (form.elements) {
			for(i=0; !!(e=form.elements[i]); ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
		} else {
			var buttons = form.getElementsByTagName("button");
			for(i=0;!!(e=buttons[i]); ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
			var inputs = form.getElementsByTagName("input");
			if (commandElement) for(i=0;!!(e=inputs[i]); ++i) {
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
		this.target = src.target || src.srcElement;
		this.currentTarget = src.currentTarget|| src.target; 
		if (src.type) {
			this.type = src.type;
			var r = EVENTS[src.type];
			if (r) r.copy.call(this,src);
			else console.warn("unhandled essential event",src.type,src);
		}
	}
	_MutableEvent.prototype.relatedTarget = null;
	_MutableEvent.prototype.withMouseInfo = MutableEvent_withMouseInfo;
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
    _MutableEvent.prototype.trigger = function(el) {
	 	// returns false if cancelled
        return EVENTS[this.type].trigger(el || this.target, this._original);
    };
    
    function _NativeEventIE(type,props) {
		var _native = EVENTS[type].create(type,props);
		// setting type/srcElement on _native breaks fireEvent
        var event = new _MutableEvent( _native );
        event.type = type;
		if (props && props.target) event.target = props.target;
        return event;
    }
    
    function _NativeEvent(type, props) {
		var event = EVENTS[type].create(type,props);
        // var event = document.createEvent(EVENTS[type].type || "Events"), bubbles = true;
        // if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name]);
        // event.initEvent(type, bubbles, EVENTS[type].cancelable, null, null, null, null, null, null, null, null, null, null, null, null);
        event.isDefaultPrevented = _MutableEvent.prototype.isDefaultPrevented;
        event.trigger = function(target) { return EVENTS[type].trigger(target || this.target,this); };
        return event;
    }

	//TODO consider moving ClonedEvent out of call
	function MutableEventModern(sourceEvent,props) {
        if (typeof sourceEvent == "string") return _NativeEvent(sourceEvent,props);
        
		if (sourceEvent.withActionInfo) return sourceEvent;
		function ClonedEvent() {
            this._original = sourceEvent;
            this.withMouseInfo = MutableEvent_withMouseInfo;
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

        sourceEvent.withMouseInfo = MutableEvent_withMouseInfo;
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

	function getScrollOffsets(el) {
		var left=0,top=0;
		while(el && !isNaN(el.scrollTop)){
			top += el.scrollTop;
			left += el.scrollLeft;
			el = el.parentNode;
		}
		return { left:left, top:top };
	}
	essential.declare("getScrollOffsets",getScrollOffsets);

	function getPageOffsets(el) {
		var scrolls = getScrollOffsets(el);

		var left=0,top=0;
		while(el){
			top += el.offsetTop;
			left += el.offsetLeft;
			el = el.offsetParent;
		}
		return { left:left - scrolls.left, top:top - scrolls.top };
	}
	essential.declare("getPageOffsets",getPageOffsets);

	var _innerHTML = function(_document,el,html) {
		el.innerHTML = html;
	}
	if (isIE){
		_innerHTML = _innerHTMLIE; //TODO do all IE do this shit?
	}

	function _innerHTMLIE(_document,el,html) {
		if (_document.body==null) return; // no way to set html then :(
		if (contains(document.body,el)) el.innerHTML = html;
		else {
			var drop = _document._inner_drop;
			if (drop == undefined) {
				drop = _document._inner_drop = _document.createElement("DIV");
				_document.body.appendChild(drop);
			}
			drop.innerHTML = html;
			for(var c = drop.firstChild; c; c = drop.firstChild) el.appendChild(c);
		}
	}

	// (tagName,{attributes},content)
	// ({attributes},content)
	function HTMLElement(tagName,from,content_list,_document) {
			//TODO _document
		var c_from = 2, c_to = arguments.length-1, _tagName = tagName, _from = from;
		
		// optional document arg
		var d = arguments[c_to];
		var _doc = document; //TODO override if last arg is a document
		if (typeof d == "object" && d && "doctype" in d && c_to>1) { _doc = d; --c_to; }
		
		// optional tagName arg
		if (typeof _tagName == "object") { 
			_from = _tagName; 
			_tagName = _from.tagName || "span"; 
			--c_from; 
		}

		// real element with attributes
		if (_from && _from.nodeName && _from.attributes && _from.nodeName[0] != "#") {
			var __from = {};
			for(var i=0,a; !!(a = _from.attributes[i]); ++i) {
				__from[a.name] = a.value;
			}
			_from = __from;
		}
		
		var e = _doc.createElement(_tagName), enhanced = false;
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
					
				case "src":
					if (_from[n] !== undefined) {
						e[n] = _from[n];
						if (/cachebuster=/.test(_from[n])) {
							e[n] = e[n].replace(/cachebuster=*[0-9]/,"cachebuster="+ String(new Date().getTime()));
						}
					}
					break;

				case "data-role":
					if (typeof _from[n] == "object") {
						var s = JSON.stringify(_from[n]);
						e.setAttribute(n,s.substring(1,s.length-1));
					}
					else e.setAttribute(n,_from[n]);
					break;

				case "id":
				case "className":
				case "rel":
				case "lang":
				case "language":
					if (_from[n] !== undefined) e[n] = _from[n]; 
					break;

				case "impl":
					if (_from[n]) e.impl = HTMLElement.impl(e);
					break;

				case "enhanced":
					enhanced = _from[n];
					break;

				// "type" IE9 el.type is readonly:

				//TODO case "onprogress": // partial script progress
				case "onload":
					regScriptOnload(e,_from.onload);
					break;
				case "onclick":
				case "onmousemove":
				case "onmouseup":
				case "onmousedown":
					if (e.addEventListener) e.addEventListener(n.substring(2),_from[n],false);
					else if (e.attachEvent) e.attachEvent(n,_from[n]);
					break;
				default:
					if (_from[n] != null) e.setAttribute(n,_from[n]);
					break;
			}
		}
		var l = [];
		for(var i=c_from; i<=c_to; ++i) {
			var p = arguments[i];
			if (typeof p == "object" && "length" in p) l.concat(p);
			else if (typeof p == "string") l.push(arguments[i]);
		}
		if (l.length) {
			_innerHTML(_doc,e,l.join("")); 
		} 
		
		//TODO .appendTo function
		
		if (enhanced) HTMLElement.query([e]); //TODO call enhance?
		
		return e;
	}
	essential.set("HTMLElement",HTMLElement);
	
	HTMLElement.query = essential("DescriptorQuery");

	HTMLElement.getEnhancedParent = function(el) {
		for(el = el.parentNode; el; el = el.parentNode) {
			var desc = EnhancedDescriptor.all[el.uniqueID];
			if (desc && (desc.state.enhanced || desc.state.needEnhance)) return el;
		}
		return null;
	};

	/*
		Discard the element call handlers & cleaners, unlist it if enhanced, remove from DOM
	*/
	HTMLElement.discard = function(el,leaveInDom) {

		this.query(el).discard();
		// var desc = EnhancedDescriptor.all[el.uniqueID];
		// if (desc) {
		// 	desc.discardNow();
		// 	desc._unlist();
		// }
		essential("cleanRecursively")(el);

		if (!leaveInDom) el.parentNode.removeChild(el);
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


	function _ElementPlacement(el,track) {
		this.el = el;
		this.bounds = {};
		this.style = {};
		this.track = track || ["visibility","marginLeft","marginRight","marginTop","marginBottom"];

		if (el.currentStyle &&(document.defaultView == undefined || document.defaultView.getComputedStyle == undefined)) {
			this._compute = this._computeIE;
		}
		if (document.body.getBoundingClientRect().width == undefined) {
			this._bounds = this._boundsIE;
		}

		this.compute();
	}
	var ElementPlacement = essential.declare("ElementPlacement",Generator(_ElementPlacement));

	_ElementPlacement.prototype.compute = function() {
		this._bounds();
		for(var i=0,s; !!(s = this.track[i]); ++i) {
			this.style[s] = this._compute(s);
		}
	};

	_ElementPlacement.prototype._bounds = function() {
		this.bounds = this.el.getBoundingClientRect();
	};

	_ElementPlacement.prototype._boundsIE = function() {
		var bounds = this.el.getBoundingClientRect();
		this.bounds = {
			width: bounds.right - bounds.left, height: bounds.bottom - bounds.top,
			left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom
		};
	};

	_ElementPlacement.prototype.PIXEL = /^\d+(px)?$/i;

	_ElementPlacement.prototype.KEYWORDS = {
		'medium':"2px"	
	};

	_ElementPlacement.prototype.CSS_TYPES = {
		'border-width':'size',
		'border-left-width':'size',
		'border-right-width':'size',
		'border-bottom-width':'top',
		'border-top-width':'top',
		'borderWidth':'size',
		'borderLeftWidth':'size',
		'borderRightWidth':'size',
		'borderBottomWidth':'top',
		'borderTopWidth':'top',


		'padding': 'size',
		'padding-left': 'size',
		'padding-right': 'size',
		'padding-top': 'top',
		'padding-bottom': 'top',
		'paddingLeft': 'size',
		'paddingRight': 'size',
		'paddingTop': 'top',
		'paddingBottom': 'top',

		'margin': 'size',
		'margin-left': 'size',
		'margin-right': 'size',
		'margin-top': 'top',
		'margin-bottom': 'top',
		'marginLeft': 'size',
		'marginRight': 'size',
		'marginTop': 'top',
		'marginBottom': 'top',
		
		'font-size': 'size',
		'fontSize': 'size',
		'line-height': 'top', 
		'lineHeight': 'top', 
		'text-indent': 'size',
		'textIndent': 'size',
		
		'width': 'size',
		'height': 'top',
		'max-width': 'size',
		'max-height': 'top',
		'min-width': 'size',
		'min-height': 'top',
		'maxWidth': 'size',
		'maxHeight': 'top',
		'minWidth': 'size',
		'minHeight': 'top',
		'left':'size',
		'right':'size',
		'top': 'top',
		'bottom': 'top'
	};

	_ElementPlacement.prototype.OFFSET_NAME = {
		"left":"offsetLeft",
		"width":"offsetWidth",
		"top":"offsetTop",
		"height":"offsetHeight"
	};

	_ElementPlacement.prototype.CSS_NAME = {
		'backgroundColor':'background-color',
		'backgroundImage':'background-image',
		'backgroundPosition':'background-position',
		'backgroundRepeat':'background-repeat',

		'borderWidth':'border-width',
		'borderLeft':'border-left',
		'borderRight':'border-right',
		'borderTop':'border-top',
		'borderBottom':'border-bottom',
		'borderLeftWidth':'border-left-width',
		'borderRightWidth':'border-right-width',
		'borderBottomWidth':'border-bottom-width',
		'borderTopWidth':'border-top-width',

		'paddingLeft': 'padding-left',
		'paddingRight': 'padding-right',
		'paddingTop': 'padding-top',
		'paddingBottom': 'padding-bottom',

		'marginLeft': 'margin-left',
		'marginRight': 'margin-right',
		'marginTop': 'margin-top',
		'marginBottom': 'margin-bottom',
		
		'fontSize': 'font-size',
		'lineHeight': 'line-height',
		'textIndent': 'text-indent'
		
	};

	_ElementPlacement.prototype.JS_NAME = {
		'background-color':'backgroundColor',
		'background-image':'backgroundImage',
		'background-position':'backgroundPosition',
		'background-repeat':'backgroundRepeat',

		'border-width':'borderWidth',
		'border-left':'borderLeft',
		'border-right':'borderRight',
		'border-top':'borderTop',
		'border-bottom':'borderBottom',
		'border-left-width':'borderLeftWidth',
		'border-right-width':'borderRightWidth',
		'border-bottom-width':'borderBottomWidth',
		'border-top-width':'borderTopWidth',

		'padding-left':'paddingLeft',
		'padding-right':'paddingRight',
		'padding-top':'paddingTop',
		'padding-bottom':'paddingBottom',

		'margin-left':'marginLeft',
		'margin-right':'marginRight',
		'margin-top':'marginTop',
		'margin-bottom':'marginBottom',
		
		'font-size':'fontSize',
		'line-height':'lineHeight',
		'text-indent':'textIndent'
		
	};

/**
 * Computes a value into pixels on InternetExplorer, if it is possible.
 * @private
 * 
 * @param {String} sProp 'size', 'left' or 'top'
 * @returns function that returns Pixels in CSS format. IE. 123px
 */
function _makeToPixelsIE(sProp)
{
	
	var sPixelProp = "pixel" + sProp.substring(0,1).toUpperCase() + sProp.substring(1);

	return function(eElement,sValue) {
		var sInlineStyle = eElement.style[sProp];
		var sRuntimeStyle = eElement.runtimeStyle[sProp];
		try
		{
			eElement.runtimeStyle[sProp] = eElement.currentStyle[sProp];
			eElement.style[sProp] = sValue || 0;
			sValue = eElement.style[sPixelProp] + "px";
		}
		catch(ex)
		{
			
		}
		eElement.style[sProp] = sInlineStyle;
		eElement.runtimeStyle[sProp] = sRuntimeStyle;

		return sValue;
	};
}


_ElementPlacement.prototype.TO_PIXELS_IE = {
	"left": _makeToPixelsIE("left"),
	"top": _makeToPixelsIE("top"),
	"size": _makeToPixelsIE("left")
};


_ElementPlacement.prototype._compute = function(style)
{
	var value = document.defaultView.getComputedStyle(this.el, null)[style];
	//TODO do this test at load to see if needed
	if (typeof value == "string" && value.indexOf("%")>-1) {
		value = this.el[this.OFFSET_NAME[style]] + "px";
	}
		
	return value;
};

_ElementPlacement.prototype._computeIE = function(style)
{
	var value;
	
	style = this.JS_NAME[style] || style;

	var v = this.el.currentStyle[style];
	var sPrecalc = this.KEYWORDS[v];
	if (sPrecalc !== undefined) return sPrecalc; 
	if (this.PIXEL.test(v)) return v;

	var fToPixels = this.TO_PIXELS_IE[this.CSS_TYPES[style]];
		value = fToPixels? fToPixels(this.el, v) : v;
		
	return value;
};


}();