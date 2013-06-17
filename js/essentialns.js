/*jslint white: true */
// types for describing generator arguments and generated properties
!function (win) {
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{});

	var isFileProtocol = (location.protocol === 'file:'    ||
	                      location.protocol === 'chrome:'  ||
	                      location.protocol === 'chrome-extension:'  ||
	                      location.protocol === 'resource:');

	essential.declare("isFileProtocol",isFileProtocol);

	var serverMode = (location.hostname == '127.0.0.1' ||
	                        location.hostname == '0.0.0.0'   ||
	                        location.hostname == 'localhost' ||
	                        location.port.length > 0         ||
	                        isFileProtocol                   ? 'development'
	                                                         : 'production');
	essential.declare("serverMode",serverMode);

	function Type(options) {
		this.options = options || {};
		this.name = this.options.name;
		this.preset = this.options.preset === true? this.name : this.options.preset;
	}
	essential.set("Type",Generator(Type));
	
	function StringType(options) {
		this.type = String;
		this.variantName = "String";
	}
	essential.set("StringType",Generator(StringType,Type));
	essential.namespace.Type.variant("String",essential.namespace.StringType);
		
	function NumberType(options) {
		this.type = Number;
		this.variantName = "Number";
	}
	essential.set("NumberType",Generator(NumberType,Type));
	essential.namespace.Type.variant("Number",essential.namespace.NumberType);
	
	function DateType(options) {
		this.type = Date;
		this.variantName = "Date";
	}
	essential.set("DateType",Generator(DateType,Type));
	essential.namespace.Type.variant("Date",essential.namespace.DateType);
	
	function BooleanType(options) {
		this.type = Boolean;
		this.variantName = "Boolean";
	}
	essential.set("BooleanType",Generator(BooleanType,Type));
	essential.namespace.Type.variant("Boolean",essential.namespace.BooleanType);
	
	function ObjectType(options) {
		this.type = Object;
		this.variantName = "Object";
	}
	essential.set("ObjectType",Generator(ObjectType,Type));
	essential.namespace.Type.variant("Object",essential.namespace.ObjectType);
	
	function ArrayType(options) {
		this.type = Array;
		this.variantName = "Array";
	}
	essential.set("ArrayType",Generator(ArrayType,Type));
	essential.namespace.Type.variant("Array",essential.namespace.ArrayType);

	//TODO consider if ""/null restriction is only for derived DOMTokenList
	
	function arrayContains(array,item) {
		if (array.indexOf) return array.indexOf(item) >= 0;

		for(var i=0,e; e = array[i]; ++i) if (e == item) return true;
		return false;
	}
	essential.declare("arrayContains",arrayContains);

	function ArraySet() {
		this._set = {};
		for(var i=this.length-1; i>=0; --i) {
			var key = this[i];
			if (this._set[key] || key === "") this.splice(i,1);
			if (key != "" && key != null) this._set[key] = true;	
		} 
		//TODO remove dupes
	}
	essential.set("ArraySet",Generator(ArraySet,Array)); //TODO support this
	ArraySet.prototype.item = function(index) {
		return this[index]; // use native array
	};

	ArraySet.prototype.contains = 
	ArraySet.prototype.has = function(value) {
		var entry = this._set[value];
		// single existing same value
		if (entry === value) return true;
		// single existing different value
		if (typeof entry != "object" || !entry.multiple_values) return false;
		// multiple existing
		return arrayContains(entry,value);
	};

	ArraySet.prototype.set = function(id,value) {
		if (typeof id == "object"); //TODO set map removing rest
		if (value) { // set true
			this.add(id);
		} else { // set false
			this.remove(id);
		}
	};
	
	//TODO mixin with map of entries to set

	ArraySet.prototype.add = function(value) {
		var entry = this._set[value];
		if (entry === undefined) {
			this._set[value] = value;
			this.push(value);
		} else {
			// single existing same value
			if (entry === value) return;
			// single existing different value
			if (typeof entry != "object" || !entry.multiple_values) {
				entry = this._set[value] = [entry];
				entry.multiple_values = true;
			}
			// single or multiple existing
			if (!arrayContains(entry,value)) {
				entry.push(value);
				this.push(value);
			}
		}

	};
	ArraySet.prototype.remove = function(value) {
		var entry = this._set[value];
		// single existing
		if (entry === undefined) return;
		if (entry === value) {
			for(var i=this.length-1; i>=0; --i) if (this[i] === value) this.splice(i,1);
			delete this._set[value];
			return;
		}
		// single existing different value 
		if (typeof entry != "object" || !entry.multiple_values) return;

		// multiple existing
		for(var i=this.length-1; i>=0; --i) if (this[i] === value) this.splice(i,1);
		for(var i=entry.length-1; i>=0; --i) if (entry[i] === value) entry.splice(i,1);
		if (entry.length==0) delete this._set[value];
	};

	ArraySet.prototype.toggle = function(id) {
		if (this.has(id)) this.remove(id);
		else this.add(id);
	};
	
	ArraySet.prototype.separator = " ";

	//TODO why doesn't this seem to be called for String(ArraySet) ?
	ArraySet.prototype.toString = function() {
		return this.join(this.separator);
	};

	function escapeJs(s) {
		return s.replace(/\\\\\\"/g,'\\\\\\\\"').replace(/\\\\"/g,'\\\\\\"').replace(/\\"/g,'\\\\"').replace(/"/g,'\\"');
	}
	essential.set("escapeJs",escapeJs);
	

	function _DOMTokenList() {

	}
	var DOMTokenList = essential.set("DOMTokenList",Generator(_DOMTokenList,ArraySet,Array)); //TODO support this

	DOMTokenList.prototype.emulateClassList = true;

	// use this for native DOMTokenList
	DOMTokenList.set = function(as,id,value) {
		if (typeof id == "object"); //TODO set map removing rest
		if (value) { // set true
			as.add(id);
		} else { // set false
			as.remove(id);
		}
	};

	DOMTokenList.mixin = function(dtl,mix) {
		if (mix.split) { // string
			var toset = mix.split(" ");
			for(var i=0,entry; entry = toset[i]; ++i) dtl.add(entry);
			return;
		}
		if (mix.length) {
			for(var i=0,entry; entry = mix[i]; ++i) dtl.add(entry);
			return;
		}
		for(var n in mix) dtl.set(n,mix[n]);
	}

	DOMTokenList.tmplClass = function(el,prefix,postfix,value) {
		var classList = el.classList;
		for(var i = classList.length-1; i>=0; --i) {
			var name = classList.item(i);
			var hasPrefix = prefix? name.substring(0,prefix.length)==prefix : true;
			var hasPostfix = postfix? name.substring(name.length-postfix.length,name.length)==postfix : true;
			if (hasPrefix && hasPostfix) classList.remove(name);
		}
		if (value) classList.add( (prefix||"") + value + (postfix||"") );

		if (classList.emulateClassList)
		 {
			//TODO make toString override work on IE, el.className = el.classList.toString();
			el.className = el.classList.join(el.classList.separator);
		}
	};

	DOMTokenList.eitherClass = function(el,trueName,falseName,value) {
		var classList = el.classList;
		var removeName = value? falseName:trueName;
		var addName = value? trueName:falseName;
		if (removeName) classList.remove(removeName);
		if (addName) classList.add(addName);

		if (classList.emulateClassList)
		 {
			//TODO make toString override work on IE, el.className = el.classList.toString();
			el.className = el.classList.join(el.classList.separator);
		}
	}
	
	/**
	 * Cleans up registered event listeners and other references
	 * 
	 * @param {Element} el
	 */
	function callCleaners(el)
	{
		if (typeof el == "object" && el) {
			var _cleaners = el._cleaners, c;
			if (_cleaners != undefined) {
				do {
					c = _cleaners.pop();
					if (c) c.call(el);
				} while(c);
				_cleaners = undefined;
			}
		} 
	};
	essential.declare("callCleaners",callCleaners);

	//TODO recursive clean of element and children?
	function cleanRecursively(el) {
		callCleaners(el);
		for(var child=el.firstElementChild!==undefined? el.firstElementChild : el.firstChild; child; 
			child = child.nextElementSibling!==undefined? child.nextElementSibling : child.nextSibling) {
			cleanRecursively(child);
		}
	}
	essential.declare("cleanRecursively",cleanRecursively);


	/* Container for laid out elements */
	function _Layouter(key,el,conf) {

		var layouterDesc = EnhancedDescriptor.all[el.uniqueId];
		var appConfig = Resolver("essential::ApplicationConfig::")();

		for(var i=0,c; c = el.children[i]; ++i) {
			var role = c.getAttribute("role"), conf = appConfig.getConfig(c) || {};
			var se = this.sizingElement(el,el,c,role,conf);
			if (se) {
				// set { sizingElement:true } on conf?
				var desc = EnhancedDescriptor(c,role,conf,false,appConfig);
				desc.layouterParent = layouterDesc;
				sizingElements[desc.uniqueId] = desc;
			}
		}
	}
	var Layouter = essential.declare("Layouter",Generator(_Layouter));

	/*
		Called for descendants of the layouter to allow forcing sizing, return true to force
	*/
	_Layouter.prototype.sizingElement = function(el,parent,child,role,conf) {
		return false;
	};

	/*
		Called for children in sizingElements
	*/
	_Layouter.prototype.calcSizing = function(el,sizing) {};

	/*
		Called to adjust the layout of the element and laid out children
	*/
	_Layouter.prototype.layout = function(el,layout,sizingEls) {};

	_Layouter.prototype.updateActiveArea = function(areaName,el) {};
	_Layouter.prototype.childLayouterUpdated = function(layouter,el,layout) {};
	_Layouter.prototype.childLaidoutUpdated = function(laidout,el,layout) {};

	/* Laid out element within a container */
	function _Laidout(key,el,conf) {

	}
	var Laidout = essential.declare("Laidout",Generator(_Laidout));

	_Laidout.prototype.layout = function(el,layout) {};
	_Laidout.prototype.calcSizing = function(el,sizing) {};


	// map of uniqueId referenced
	var enhancedElements = essential.declare("enhancedElements",{});

	// map of uniqueId referenced
	var sizingElements = essential.declare("sizingElements",{});

	// map of uniqueId referenced
	var maintainedElements = essential.declare("maintainedElements",{});

	// open windows
	var enhancedWindows = essential.declare("enhancedWindows",[]);


	function _EnhancedDescriptor(el,role,conf,page,uniqueId) {

		var roles = role? role.split(" ") : [];

		this.uniqueId = uniqueId;
		this.roles = roles;
		this.role = roles[0]; //TODO document that the first role is the switch for enhance
		this.el = el;
		this.conf = conf || {};
		this.instance = null;
		this.sizing = {
			"contentWidth":0,"contentHeight":0
		};
		// sizingHandler
		this.layout = {
			"displayed": !(el.offsetWidth == 0 && el.offsetHeight == 0),
			"lastDirectCall": 0,
			"enable": false,
			"throttle": null //TODO throttle by default?
		};
		// layoutHandler
		this.enhanced = false;
		this.discarded = false;
		this.contentManaged = false; // The content HTML is managed by the enhanced element the content will not be enhanced automatically

		this.page = page;
		this.handlers = page.resolver("handlers");
		this._init();
	}

	_EnhancedDescriptor.prototype._init = function() {
		if (this.role && this.handlers.init[this.role]) {
			 this.handlers.init[this.role].call(this,this.el,this.role,this.conf);
		}
	};

	_EnhancedDescriptor.prototype.discardHandler = function() {

	};

	_EnhancedDescriptor.prototype.ensureStateful = function() {
		if (this.stateful) return;

			var stateful = this.stateful = essential("StatefulResolver")(this.el,true);
			stateful.set("sizing",this.sizing);
			stateful.on("change","state",this,this.onStateChange); //TODO remove on discard
	};	

	_EnhancedDescriptor.prototype.onStateChange = function(ev) {
		switch(ev.symbol) {
			case "expanded":
				ev.data.layout.queued = true;
				break;
		}
	};


	function _roleEnhancedCleaner(desc) {
		return function() {
			//TODO destroy
			//TODO discard/destroy for layouter and laidout
			// if (desc.discardHandler) 
			return desc.discardHandler(desc.el,desc.role,desc.instance);
		};
	};


	_EnhancedDescriptor.prototype._tryEnhance = function(handlers) {
		// desc.callCount = 1;
		if (this.role && handlers.enhance[this.role]) {
			this.instance = handlers.enhance[this.role].call(this,this.el,this.role,this.conf);
			this.enhanced = this.instance === false? false:true;
		}
		if (this.enhanced) {
			this.sizingHandler = handlers.sizing[this.role];
			this.layoutHandler = handlers.layout[this.role];
			if (this.layoutHandler && this.layoutHandler.throttle) this.layout.throttle = this.layoutHandler.throttle;
			var discardHandler = handlers.discard[this.role];
			if (discardHandler) this.discardHandler = discardHandler;
			this.el._cleaners.push(_roleEnhancedCleaner(this)); //TODO either enhanced, layouter, or laidout
			if (this.sizingHandler) sizingElements[this.uniqueId] = this;
			if (this.layoutHandler) {
				this.layout.enable = true;
				maintainedElements[this.uniqueId] = this;
			}
		} 
	};

	_EnhancedDescriptor.prototype._tryMakeLayouter = function(key) {

		if (this.conf.layouter && this.layouter==undefined) {
			var varLayouter = Layouter.variants[this.conf.layouter];
			if (varLayouter) {
				this.layouter = this.el.layouter = varLayouter.generator(key,this.el,this.conf,this.layouterParent);
				if (this.layouterParent) sizingElements[this.uniqueId] = this;
				if (varLayouter.generator.prototype.hasOwnProperty("layout")) {
					this.layout.enable = true;
	                this.layout.queued = true;
	                maintainedElements[this.uniqueId] = this;
				}
			}
		}
	};

	_EnhancedDescriptor.prototype._tryMakeLaidout = function(key) {

		if (this.conf.laidout && this.laidout==undefined) {
			var varLaidout = Laidout.variants[this.conf.laidout];
			if (varLaidout) {
				this.laidout = this.el.laidout = varLaidout.generator(key,this.el,this.conf,this.layouterParent);
				sizingElements[this.uniqueId] = this;
				if (varLaidout.generator.prototype.hasOwnProperty("layout")) {
					this.layout.enable = true;
	                this.layout.queued = true;
	                maintainedElements[this.uniqueId] = this;
				}
			}
		}

	};

	
	//TODO _EnhancedDescriptor.prototype.prepareAncestors = function() {};

	_EnhancedDescriptor.prototype.refresh = function() {
		var getActiveArea = essential("getActiveArea"); //TODO switch to Resolver("page::activeArea")
		var updateLayout = false;
		
		if (this.layout.area != getActiveArea()) { 
			this.layout.area = getActiveArea();
			updateLayout = true;
		}

		if (updateLayout || this.layout.queued) {
			if (this.layoutHandler) this.layoutHandler(this.el,this.layout,this.instance);
			var layouter = this.layouter, laidout = this.laidout;
			if (layouter) layouter.layout(this.el,this.layout,this.laidouts()); //TODO pass instance
			if (laidout) laidout.layout(this.el,this.layout); //TODO pass instance

            this.layout.queued = false;
		}	
	};

	_EnhancedDescriptor.prototype.laidouts = function() {
		var laidouts = []; // laidouts and layouter
        for(var n in sizingElements) {
            var desc = sizingElements[n];
            if (desc.layouterParent == this) laidouts.push(desc.el);
        }        
		// for(var c = this.el.firstElementChild!==undefined? this.el.firstElementChild : this.el.firstChild; c; 
		// 				c = c.nextElementSibling!==undefined? c.nextElementSibling : c.nextSibling) {
		// 	if (c.stateful && c.stateful("sizing","undefined")) laidouts.push(c);
		// }
		return laidouts;
	};

	_EnhancedDescriptor.prototype.liveCheck = function() {
		if (!this.enhanced || this.discarded) return;
		var inDom = document.body==this.el || essential("contains")(document.body,this.el); //TODO reorg import
		//TODO handle subpages
		if (!inDom) {
			//TODO destroy and queue discard
			this.discardNow();
		}
	};

	_EnhancedDescriptor.prototype.discardNow = function() {
		if (this.discarded) return;

		//TODO anything else ?
		callCleaners(this.el);
		this.el = undefined;
		this.discarded = true;					
		this.layout.enable = false;					
	};

	_EnhancedDescriptor.prototype._unlist = function() {
		this.discarded = true;					
		if (this.layout.enable) delete maintainedElements[this.uniqueId];
		if (sizingElements[this.uniqueId]) delete sizingElements[this.uniqueId];
		delete enhancedElements[this.uniqueId];
	};

	_EnhancedDescriptor.prototype._queueLayout = function() {

		if (this.layout.displayed != this.sizing.displayed) {
			this.layout.displayed = this.sizing.displayed;
			this.layout.queued = true;
		}

		if (this.layout.width != this.sizing.width || this.layout.height != this.sizing.height) {
			this.layout.width = this.sizing.width;
			this.layout.height = this.sizing.height;
			this.layout.queued = true;
		}
		if (this.layout.contentWidth != this.sizing.contentWidth || this.layout.contentHeight != this.sizing.contentHeight) {
			this.layout.contentWidth = this.sizing.contentWidth;
			this.layout.contentHeight = this.sizing.contentHeight;
			this.layout.queued = true;
		}
	};

	_EnhancedDescriptor.prototype.checkSizing = function() {

		// update sizing with element state
		var ow = this.sizing.width = this.el.offsetWidth;
		var oh = this.sizing.height = this.el.offsetHeight;
		this.sizing.displayed = !(ow == 0 && oh == 0);
		this.sizing.contentWidth = this.el.scrollWidth;
		this.sizing.contentHeight = this.el.scrollHeight;

		if (this.sizingHandler) this.sizingHandler(this.el,this.sizing,this.instance);
		if (this.laidout) this.laidout.calcSizing(this.el,this.sizing);
		if (this.layouterParent) this.layouterParent.layouter.calcSizing(this.el,this.sizing,this.laidout);

		this._queueLayout();
		if (this.layout.queued) {
			if (this.layouterParent) this.layouterParent.layout.queued = true;
		}
	};

	// used to emulate IE uniqueId property
	var lastUniqueId = 555;

	// Get the enhanced descriptor for and element
	function EnhancedDescriptor(el,role,conf,force,page) {
		if (!force && role==null && conf==null && arguments.length>=3) return null;

		var uniqueId = el.uniqueId;
		if (uniqueId == undefined) uniqueId = el.uniqueId = ++lastUniqueId;
		var desc = enhancedElements[uniqueId];
		if (desc && !force) return desc;
		desc = new _EnhancedDescriptor(el,role,conf,page,uniqueId);
		enhancedElements[uniqueId] = desc;
		var descriptors = page.resolver("descriptors");
		descriptors[uniqueId] = desc;
		if (el._cleaners == undefined) el._cleaners = [];

		return desc;
	}
	EnhancedDescriptor.all = enhancedElements;
	EnhancedDescriptor.maintainer = null; // interval handler
	essential.declare("EnhancedDescriptor",EnhancedDescriptor);

	function discardEnhancedElements() 
	{
		for(var n in enhancedElements) {
			var desc = enhancedElements[n];
			if (desc.el) {
				callCleaners(desc.el); //TODO perhaps use cleanRecursively
				delete desc.el;
			}
			delete enhancedElements[n];
		}
		enhancedElements = essential.set("enhancedElements",{});
	}

	EnhancedDescriptor.refreshAll = function() {
		if (document.body == undefined) return;

		for(var n in sizingElements) {
			var desc = sizingElements[n];
			desc.checkSizing();
		}

		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			if (desc.layout.enable && !desc.discarded) {
				desc.refresh();
			}
		}
		for(var n in sizingElements) {
			var desc = sizingElements[n];
			desc.layout.queued = false;
		}
	};

	EnhancedDescriptor.maintainAll = function() {
		if (document.body == undefined) return;

		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			desc.liveCheck();
			//TODO if destroyed, in round 2 discard & move out of maintained 
			if (desc.discarded) desc._unlist();
		}
	};

	function branchDescs(el) {
		var descs = [];
		var e = el.firstElementChild!==undefined? el.firstElementChild : el.firstChild;
		while(e) {
			if (e.attributes) {
				var desc = EnhancedDescriptor.all[e.uniqueId];
				if (desc) descs.push(desc);
			}
			e = e.nextElementSibling!==undefined? e.nextElementSibling : e.nextSibling;
		}
		return descs;
	}

	function discardEnhancedWindows() {
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			if (w.window) w.window.close();
		}
		enhancedWindows = null;
		essential.set("enhancedWindows",[]);
	}

	function instantiatePageSingletons()
	{
		for(var i=0,g; g = Generator.restricted[i]; ++i) {
			if (g.info.lifecycle == "page") { // TODO  && g.info.existing[g.info.identifier(..)] == undefined
				g();
			}
		}
	}
	essential.set("instantiatePageSingletons",instantiatePageSingletons);

	function discardRestricted()
	{
		for(var i=Generator.restricted-1,g; g = Generator.restricted[i]; --i) {
			var discarded = g.info.constructors[-1].discarded;
			for(var n in g.info.existing) {
				var instance = g.info.existing[n];
				if (discarded) {
					discarded.call(g,instance);
				}
			}
			g.info.constructors[-1].__generator__ = undefined;
			g.__generator__ = undefined;
		}
	}

	essential.set("_queueDelayedAssets",function(){});

	var _essentialTesting = !!document.documentElement.getAttribute("essential-testing");
	var _readyFired = _essentialTesting;

	function fireDomReady()
	{
		if (_readyFired) return;
		_readyFired = true;

		//TODO derive state.lang and locale from html.lang
		
		// stored entires	
		for(var i=0,ref; ref = Resolver.readloads[i]; ++i) {
			for(var n in ref.readloads) {
				ref.readloads[n].call(ref);
			}
		}

		try {
			essential("_queueDelayedAssets")();
			essential.set("_queueDelayedAssets",function(){});

			instantiatePageSingletons();
		}
		catch(ex) {
			essential("console").error("Failed to launch delayed assets and singletons",ex);
			//debugger;
		}
	}
	function fireLoad()
	{
		
	}
	function fireUnload()
	{
		//TODO singleton deconstruct / before discard?

		// stored entires	
		for(var i=0,ref; ref = Resolver.storeunloads[i]; ++i) {
			for(var n in ref.storeunloads) {
				ref.storeunloads[n].call(ref);
			}
		}

		discardRestricted();
		if (EnhancedDescriptor.maintainer) clearInterval(EnhancedDescriptor.maintainer);
		EnhancedDescriptor.maintainer = null;
		discardEnhancedElements();
		discardEnhancedWindows();

		for(var n in Resolver) {
			if (typeof Resolver[n].destroy == "function") Resolver[n].destroy();
		}
		Resolver("page").set("state.launched",false);
		Resolver("page").set("state.livepage",false);
	}

	// iBooks HTML widget
	if (window.widget) {
		widget.notifyContentExited = function() {
			fireUnload();
		};
	}

    function doScrollCheck() {
      try {
        // If IE is used, use the trick by Diego Perini
        // http://javascript.nwbox.com/IEContentLoaded/
        win.document.documentElement.doScroll("left");
      } catch(e) {
        setTimeout(doScrollCheck, 1);
        return;
      }

      // and execute any waiting functions
      fireDomReady();
    }  

	function listenForDomReady() 
	{
	    // Mozilla, Opera and webkit nightlies currently support this event
	    if (win.document.addEventListener) {
	      var DOMContentLoaded = function() {
	        win.document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
	        fireDomReady();
	      };
	      
	      win.document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
	      win.addEventListener("load", fireDomReady, false); // fallback
	      
	      // If IE event model is used
	    } else if (win.document.attachEvent) {
	      
	      var onreadystatechange = function() {
	        if (win.document.readyState === "complete") {
	          win.document.detachEvent("onreadystatechange", onreadystatechange);
	          fireDomReady();
	        }
	      };
	      
	      win.document.attachEvent("onreadystatechange", onreadystatechange);
	      win.attachEvent("onload", fireDomReady); // fallback

	      // If IE and not a frame, continually check to see if the document is ready
	      var toplevel = false;

	      try {
	        toplevel = win.frameElement == null;
	      } catch(e) {}

	      // The DOM ready check for Internet Explorer
	      if (win.document.documentElement.doScroll && toplevel) {
	        doScrollCheck();
	      }
	    } 
	}


	if (window.device) {
		//TODO PhoneGap support
	}
	else {
		listenForDomReady();		
		if (win.addEventListener) {
			win.addEventListener("load",fireLoad,false);
		} else {
			win.attachEvent("onload",fireLoad);
		}
		if (win.addEventListener) {
			win.addEventListener("unload",fireUnload,false);
		} else {
			win.attachEvent("onunload",fireUnload);
		}
	}

	var proxyConsole = essential.declare("console",{});
	function setStubConsole() {
		function no_logging(level,parts) {}
 
		proxyConsole["log"] = function() { 
			no_logging("none",arguments); };
		proxyConsole["trace"] = function() { 
			no_logging("trace",arguments); };
		proxyConsole["debug"] = function() { 
			no_logging("debug",arguments); };
		proxyConsole["info"] = function() { 
			no_logging("info",arguments); };
		proxyConsole["warn"] = function() { 
			no_logging("warn",arguments); };
		proxyConsole["error"] = function() { 
			no_logging("error",arguments); };
		proxyConsole["group"] = function() { 
			no_logging("group",arguments); };
		proxyConsole["groupEnd"] = function() { 
			no_logging("groupEnd",arguments); };
	}
	essential.declare("setStubConsole",setStubConsole);
 
	function setWindowConsole() {
		proxyConsole["log"] = function() { 
			window.console.log.apply(window.console,arguments); };
		proxyConsole["trace"] = function() { 
			window.console.trace(); };
		proxyConsole["debug"] = function() { 
			(window.console.debug || window.console.info).apply(window.console,arguments); };
		proxyConsole["info"] = function() { 
			window.console.info.apply(window.console,arguments); };
		proxyConsole["warn"] = function() { 
			window.console.warn.apply(window.console,arguments); };
		proxyConsole["error"] = function() { 
			window.console.error.apply(window.console,arguments); };
 
		if (window.console.debug == undefined) {
			// IE8
			proxyConsole["log"] = function(m) { 
				window.console.log(m); };
			proxyConsole["trace"] = function(m) { 
				window.console.trace(); };
			proxyConsole["debug"] = function(m) { 
				window.console.log(m); };
			proxyConsole["info"] = function(m) { 
				window.console.info(m); };
			proxyConsole["warn"] = function(m) { 
				window.console.warn(m); };
			proxyConsole["error"] = function(m) { 
				window.console.error(m); };
		}
	}
	essential.declare("setWindowConsole",setWindowConsole);
	
	if (window.console) setWindowConsole();
	else setStubConsole();

	function htmlEscape(str) {
		if (str == null) return str;
		return String(str)
			.replace(/&/g,'&amp;')
			.replace(/"/g,'&amp;')
			.replace(/'/g,'&amp;')
			.replace(/</g,'&amp;')
			.replace(/>/g,'&amp;');
		//TODO list of tags to retain, replace them back from escaped
	}
	essential.declare("htmlEscape",htmlEscape);

	var translations = Resolver("translations",{});
	var defaultLocale = window.navigator.userLanguage || window.navigator.language || "en"
	translations.declare("defaultLocale",defaultLocale);
	translations.declare("locale",defaultLocale);

	translations.on("change","locale",function(ev) {
		var s = ev.value.split("-");
		if (s.length == 1) s = ev.value.split("_");
		if (Resolver.exists("page")) Resolver("page").set("state.lang",s[0]);
	});

	/*
		locales.de = { chain:"en" }
	*/
	translations.declare("locales",{});
	translations.declare("keys",{});	// [ context, key, locale] 
	translations.declare("phrases",{});	// [ context, phrase, locale]

	function defaultLocaleConfig(locale) {
		var config = {};
		var split = locale.split("-");
		if (locale == "en") {
			// English has no default
		} if (split.length == 1) {
			// default to english
			config.chain = "en";
		} else {
			// chain to base language
			config.chain = split[0];
		}

		return config;
	}

	function setLocales(locales) {
		for(var i=0,l; l = locales[i]; ++i) {
			l = l.toLowerCase().replace("_","-");
			translations.declare(["locales",l],defaultLocaleConfig(l));
		} 
	}
	translations.setLocales = setLocales;

    function setKeysForLocale(locale,context,keys,BucketGenerator) {
        var _locale = locale.toLowerCase().replace("_","-");
        for(var key in keys) {
            var sentence = keys[key];
            if (BucketGenerator) translations.declare(["keys",context,key],BucketGenerator());
            translations.set(["keys",context, key, _locale],sentence); //TODO { generator: BucketGenerator }
 
            if (BucketGenerator) translations.declare(["sentences",sentence,context],BucketGenerator());
            translations.set(["sentences",sentence,context,_locale,"key"],key);
        }
    }
    //TODO all these should be bound
    translations.setKeysForLocale = setKeysForLocale;

    function applyTranslationsAPI(resolver) {

		// (key,params)
		// ({ key:key },params)
		// ({ key:key, context:context },params)
		// ({ phrase:phrase },params)
		function translate(key,params) {
			var phrase = null;
			var context = resolver.defaultContext || null;
			if (typeof key == "object") {
				phrase = key.phrase;
				context = key.context || null;
				key = key.key;
			}
			var locales = translations("locales");
			var locale = translations("locale");
			if (locale) locale = locale.toLowerCase().replace("_","-");
			var t,l;
			var base;
			if (key) {
				base = resolver.get(["keys",context,key],"undefined")
				while(t == undefined && base && locale) {
					t = base[locale];
					if (locales[locale]) locale = locales[locale].chain;
					else locale = null;
				}
			} else if (phrase) {
				base = resolver.get(["phrases",context,phrase],"undefined");
				while(t == undefined && base && locale) {
					t = base[locale];
					if (locales[locale]) locale = locales[locale].chain;
					else locale = null;
				}
			}
			if (t) {
				if (params) {
					if (base.begin && base.end)
						for(var n in params) {
							t = t.replace(base.begin + n + base.end,params[n]);
						}
				}
				return t;
			}

			return phrase;
		}
		resolver.translate = translate;
		resolver._ = translate;
		resolver.set("translate",translate);

		function prepareReverse() {

	        var locale = translations("locale");
	        if (locale) locale = locale.toLowerCase().replace("_","-");
	 
	        // default context
	        for(var context in resolver.namespace.keys) {
	        	var contextKeys = resolver.namespace.keys[context];

		        for(var key in contextKeys) {
	                var bucket = contextKeys[key];
	                if (bucket[locale]) resolver.set(["sentences",bucket[locale].toLowerCase(),context,locale,"key"],key);
		        }
	        }
		}

        function reverseTranslate(sentence,params) {
        	if (resolver.namespace.sentences == undefined) prepareReverse();

            var context = null,
                locale = translations("locale");
            if (locale) locale = locale.toLowerCase().replace("_","-");
            sentence = sentence.toLowerCase();
 
            var r = resolver(["sentences",sentence,context,locale],"undefined");
            if (r == undefined) {
                r = { matches:[] };
                var sentences = resolver("sentences");
                if (sentence.length > 1) for(var n in sentences) {
                    var candidate = resolver(["sentences",sentences[n],context,locale],"undefined");
                    if (candidate && candidate.key && n.indexOf(sentence) >= 0) r.matches.push(candidate.key);
                }
               
            }
            return r;
        }
		resolver.reverseTranslate = reverseTranslate;
		resolver.set("translate",reverseTranslate);
    }
    applyTranslationsAPI(translations);
    essential.set("translate",translations._);
 
 
    function makeKeyTranslationSubset(prefix) {
        var subset = Resolver({});
        applyTranslationsAPI(subset);

        var context = null,
            locale = translations("locale");
        if (locale) locale = locale.toLowerCase().replace("_","-");
 
        // default context
        var defaultKeys = translations(["keys",null]);
        for(var key in defaultKeys) {
            if (key.substring(0,prefix.length) == prefix) {
                var bucket = defaultKeys[key];
                subset.set(["keys",context,key], bucket);
 
                //subset.set(["sentences",bucket[locale].toLowerCase(),context,locale,"key"],key);
            }
        }
 
        //copy context = prefix
        var contextKeys = translations(["keys",prefix],"undefined");
        if (contextKeys) {
	        subset.defaultContext = prefix;
        	subset.set(["keys",prefix],contextKeys);
        }
 
        //TODO sentence translation

        return subset;
    }
    translations.makeKeyTranslationSubset = makeKeyTranslationSubset;

 
 }(window);
 

