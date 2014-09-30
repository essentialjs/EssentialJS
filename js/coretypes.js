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

	function fixClass(cls) {
		cls = cls.replace(/   /g," ").replace(/  /g," ").replace(/ $/,'').replace(/^ /,'');
		return cls;
	}

	DOMTokenList.mixin = function(dtl,mix) {
		if (mix.split) { // string
			var toset = fixClass(mix).split(" ");
			for(var i=0,entry; entry = toset[i]; ++i) dtl.add(entry);
			return;
		}
		if (typeof mix.length == "number") {
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
	
	function ensureCleaner(el,cleaner) {

		if (el._cleaners == undefined) el._cleaners = [];
		if (!arrayContains(el._cleaners,cleaner)) el._cleaners.push(cleaner); 
	}
	essential.declare("ensureCleaner",ensureCleaner);

	/**
	 * Cleans up registered event listeners and other references
	 * LIFO call order
	 * 
	 * @param {Element} el
	 */
	function callCleaners(el)
	{
		if (typeof el == "object" && el) {
			var _cleaners = el._cleaners, c;
			if (_cleaners != undefined) {
				_cleaners._incall = (_cleaners._incall || 0) + 1;
				do {
					c = _cleaners.pop();
					if (c) c.call(el);
				} while(c);
				el._cleaners = undefined;
			}
		} 
	}
	essential.declare("callCleaners",callCleaners);

	/*
	 * Cleans up registered event listeners and other references
	 * Children first.
	 */
	function cleanRecursively(el,unwind,nested) {
		unwind = unwind || 0;
		var cleaners = el._cleaners = el._cleaners || [];
		var incall = cleaners._incall || 0;
		var cleanMe = !nested && !cleaners._inrecurse;

		if (incall > unwind) return; // if in the middle of cleaning leave branch alone

		cleaners._inrecurse = (cleaners._inrecurse || 0) + 1;

		for(var i=0, children=el.children, child; child=children && children[i]; ++i) {
			if (child.nodeType == 1) cleanRecursively(child,unwind,true);
		}

		if (cleanMe) callCleaners(el);
		--cleaners._inrecurse;
	}
	essential.declare("cleanRecursively",cleanRecursively);


	/* Container for laid out elements */
	function _Layouter(key,el,conf) {

		var layouterDesc = EnhancedDescriptor.all[el.uniqueID];
		var appConfig = Resolver("essential::ApplicationConfig::")();

		for(var i=0,c; c = el.children[i]; ++i) {
			var role = c.getAttribute("role"), conf = Resolver.config(c) || {};
			var se = this.sizingElement(el,el,c,role,conf);
			if (se) {
				// set { sizingElement:true } on conf?
				var desc = EnhancedDescriptor(c,role,conf,false,appConfig);
				desc.context.layouterParent = layouterDesc.layouter;
				sizingElements[desc.uniqueID] = desc;
			}
		}
	}
	var Layouter = essential.declare("Layouter",Generator(_Layouter));

	_Layouter.prototype.init = function(el,conf,sizing,layout) {};
	_Layouter.prototype.destroy = function(el) {};

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

	_Laidout.prototype.init = function(el,conf,sizing,layout) {};
	_Laidout.prototype.destroy = function(el) {};
	_Laidout.prototype.layout = function(el,layout) {};
	_Laidout.prototype.calcSizing = function(el,sizing) {};


	// map of uniqueID referenced (TODO array for performance/memory?)
	var enhancedElements = essential.declare("enhancedElements",{});

	//TODO Resolver("document::essential.unfinished::")
	var unfinishedElements = essential.declare("unfinishedElements",{});

	// map of uniqueID referenced
	var sizingElements = essential.declare("sizingElements",{});

	// map of uniqueID referenced
	var maintainedElements = essential.declare("maintainedElements",{});

	// open windows
	var enhancedWindows = essential.declare("enhancedWindows",[]);

	function DescriptorQuery(sel,el) {
		var q = [], context = { list:q };

		if (typeof sel == "string") {
			var strainer = selectorStrainer(sel);
			if (el) {
				var context = { list:q };
				findChildrenToEnhance(el || document.body,context,strainer);
			} else {
				for(var id in enhancedElements) {
					var desc = enhancedElements[id];
					if (strainer(desc.el,desc)) q.push(desc);
				}
			}

		} else {
			var ac = essential("ApplicationConfig")();
			el=sel; sel=undefined;
			if (typeof el.length == "number") {
				for(var i=0,e; e = el[i]; ++i) {

					var conf = Resolver.config(e), role = e.getAttribute("role");
					var desc = EnhancedDescriptor(e,role,conf,false,ac);
					if (desc) q.push(desc);
				}
			} else if (el.nodeType == 1) {
				//TODO third param context ? integrate with desc.context
				//TODO identify existing descriptors

				var conf = Resolver.config(el), role = el.getAttribute("role");
				var desc = EnhancedDescriptor(el,role,conf);
				if (desc) q.push(desc);
			}
		}
		q.el = el;
		for(var n in DescriptorQuery.fn) q[n] = DescriptorQuery.fn[n];

		return q;
	}
	essential.declare("DescriptorQuery",DescriptorQuery);

	DescriptorQuery.fn = {};

	DescriptorQuery.fn.enhance = function() {
		var pageResolver = Resolver("page"),
			handlers = pageResolver("handlers"), enabledRoles = pageResolver("enabledRoles");

		for(var i=0,desc; desc = this[i]; ++i) if (desc.inits.length>0) desc._init();

		for(var i=0,desc; desc = this[i]; ++i) {

			//already done: desc.ensureStateful();
			desc._tryEnhance(handlers,enabledRoles);
			desc._tryMakeLayouter(""); //TODO key?
			desc._tryMakeLaidout(""); //TODO key?

			if (desc.conf.sizingElement) sizingElements[desc.uniqueID] = desc;
		}

	};

	DescriptorQuery.fn.discard = function() {
		for(var i=0,desc; desc = this[i]; ++i) {
			if (desc) {
				desc.discardNow();
				desc._unlist();
			}
		}
	};

	DescriptorQuery.fn.queue = function() {
		for(var i=0,desc; desc = this[i]; ++i) {
			if (desc) {
				EnhancedDescriptor.unfinished[desc.uniqueID] = desc;
			}
		}
	};

	DescriptorQuery.fn.getInstance = function() {
		if (this.length) return this[0].instance;
		return null;
	};

	function findChildrenToEnhance(el,context,fn) {

		var e = el.firstElementChild!==undefined? el.firstElementChild : el.firstChild;
		while(e) {
			if (e.attributes) {
				var conf = Resolver.config(e), role = e.getAttribute("role");
				// var sizingElement = false;
				// if (context.layouter) sizingElement = context.layouter.sizingElement(el,e,role,conf);

				//TODO if not enabledRole skip

				var desc = EnhancedDescriptor(e,role,conf);
				var add = true;
				if (fn) add = fn(e,desc,conf);
				if (desc && add) {
					if (context.list) context.list.push(desc);
				} else {

				}
				if (desc==null || !desc.state.contentManaged) findChildrenToEnhance(e,{layouter:context.layouter,list:context.list},fn);
			}
			e = e.nextElementSibling!==undefined? e.nextElementSibling : e.nextSibling;
		}
	}

	function selectorStrainer(sel) {
		var attrEq = {};
		if (sel.charAt(0) == "[" && sel.charAt(sel.length-1) == "]") {
			var attrs = sel.substring(1,sel.length-1).split(",");
			for(var i=0,a; a = attrs[i]; ++i) {
				var attr = a.split("=");
				attrEq[attr[0]] = attr[1];
			}
		}

		return function(el,desc,conf) {
			for(var n in attrEq) {
				var v = el.getAttribute(n);
				if (v != attrEq[n]) return false;
			}
			return true;
		};
	}

	DescriptorQuery.fn.onlyBranch = function() {
		if (this.el == undefined) throw new Error('Branch of undefined element'); // not sure what to do
		var context = { list:this };
		this.length = 0;
		//TODO if the el is a layouter, pass that in conf
		findChildrenToEnhance(this.el,context);
		//TODO push those matched descriptors into q
		return this;
	};

	DescriptorQuery.fn.withBranch = function() {
		this.onlyBranch();

		var conf = Resolver.config(this.el), role = this.el.getAttribute("role");

				//TODO if not enabledRole skip
				
		var desc = EnhancedDescriptor(this.el,role,conf);
		if (desc) this.shift(desc);
		return this;
	};
 


	function EnhancedContext() {
	}
	essential.declare("EnhancedContext",EnhancedContext);

	EnhancedContext.prototype.clear = function() {
		this.instance = null;
		this.placement = null;

		// this.uniqueID
		this.el = null;
		this.stateful = null;

		this.controller = null;
		this.controllerID = null;
		this.controllerStateful = null;
		this.layouterParent = null;
		this.layouterEl = null;
	};
	// EnhancedContext.prototype.??

	function _EnhancedDescriptor(el,role,conf,page,uniqueID) {

		var roles = role? role.split(" ") : [];

		this.el = el;
		this.placement = essential("ElementPlacement")(el,[]);
		this.placement.manually(["overflow"]);
		if (this.placement.style.overflow == "visible") this._updateDisplayed = this._updateDisplayedNotNone;

		// sizingHandler
		this.sizing = {
			"contentWidth":0,"contentHeight":0,
			"currentStyle": this.placement.style,

			track: {
				sizeBy: "offset",
				contentBy: "scroll",
				width:true, height:true,
				contentWidth: true, contentHeight: true,
				scrollLeft:false, scrollTop: false
			}
		};

		this.layout = {
			// "displayed": !(el.offsetWidth == 0 && el.offsetHeight == 0),
			"currentStyle": this.placement.style,
			"lastDirectCall": 0,
			"enable": false,
			"throttle": null //TODO throttle by default?
		};
		this._updateDisplayed();
		this.ensureStateful();
		ensureCleaner(this.el,_roleEnhancedCleaner); //TODO either enhanced, layouter, or laidout
		this.stateful.set("state.needEnhance", roles.length > 0);
		this.uniqueID = uniqueID;
		this.roles = roles;
		this.role = roles[0]; //TODO document that the first role is the switch for enhance
		this.conf = conf || {};
		this.context = new EnhancedContext();
		this.context.placement = this.placement;
		this.instance = null;
		this.controller = null; // Enhanced Controller can be separate from instance

		// layoutHandler / maintained
		this.state.initDone = false; // might change to reconfigured=true
		this.state.enhanced = false;
		this.state.discarded = false;
		this.state.contentManaged = false; // The content HTML is managed by the enhanced element the content will not be enhanced automatically

		this.page = page;
		this.handlers = page.resolver("handlers");
		this.enabledRoles = page.resolver("enabledRoles");
		this.inits = [];

		if (this.role) this.inits.push(this._roleInit);

		this._updateContext();
	}

	_EnhancedDescriptor.prototype._init = function() {
		this._updateContext();
		for(var i=0,c; c = this.inits[i]; ++i) c.call(this);
		this.inits.length = 0;
	};

	_EnhancedDescriptor.prototype._roleInit = function() {
		if (this.handlers.init[this.role]) {
			this.handlers.init[this.role].call(this,this.el,this.role,this.conf,this.context);
		}
	};
	_EnhancedDescriptor.prototype._layouterInit = function() {
		if (this.layouter) this.layouter.init(this.el,this.conf,this.sizing,this.layout);
	};
	_EnhancedDescriptor.prototype._laidoutInit = function() {
		if (this.laidout) this.laidout.init(this.el,this.conf,this.sizing,this.layout);
	};

	// try during construction, before init and enhance

	_EnhancedDescriptor.prototype._updateContext = function() {
		if (this.conf.controllerID != undefined) {
			var desc = EnhancedDescriptor.all[this.conf.controllerID];
			this.context.controllerID = desc.uniqueID;
			this.context.controller = desc.controller || desc.instance;
			this.context.controllerStateful = this.context.controller.stateful || desc.stateful;
			return;
		}

		this.context.el = null;
		this.context.controller = null;
		for(var el = this.el.parentNode; el; el = el.parentNode) {
			if (el.uniqueID) {
				var desc = enhancedElements[el.uniqueID];
				if (desc) {

					// in case it wasn't set by the layouter constructor
					if (this.context.layouterParent == null && desc.layouter) {
						this.context.layouterParent = desc.layouter;
						this.context.layouterEl = desc.el;
					}
					if (this.context.el == null && (this.state.enhanced || this.state.needEnhance)) { // skip non-enhanced
						this.context.el = el;
						this.context.uniqueID = el.uniqueID;
						this.context.instance = desc.instance;
						this.context.stateful = desc.stateful;
					}
					if (this.context.controller == null && desc.conf.controller) {
						// make controller ? looking up generator/function
						this.context.controllerID = desc.uniqueID;
						this.context.controller = desc.controller || desc.instance;
						this.context.controllerStateful = this.context.controller? this.context.controller.stateful || desc.stateful : null;
					}

				}
			}
		}
	};

	_EnhancedDescriptor.prototype._updateLayouterContext = function() {
		this.context.el = null;
		this.context.controller = null;
		for(var el = this.el.parentNode; el; el = el.parentNode) {
			if (el.uniqueID) {
				var desc = enhancedElements[el.uniqueID];
				if (desc) {

					// in case it wasn't set by the layouter constructor
					if (this.context.layouterParent == null && desc.layouter) {
						this.context.layouterParent = desc.layouter;
						this.context.layouterEl = desc.el;
					}
				}
			}
		}
	};

	_EnhancedDescriptor.prototype.discardHandler = function() {

	};

	_EnhancedDescriptor.prototype.ensureStateful = function() {
		if (this.stateful) return;

		var stateful = this.stateful = essential("StatefulResolver")(this.el,true);
		this.state = stateful("state");
		stateful.set("sizing",this.sizing);
		stateful.set("layout",this.layout);
		stateful.on("change","state",this,this.onStateChange); //TODO remove on discard
	};	

	_EnhancedDescriptor.prototype.onStateChange = function(ev) {
		switch(ev.symbol) {
			case "expanded":
				ev.data.layout.queued = true;
				break;
		}
	};

	_EnhancedDescriptor.prototype.getAttribute = function(name) {
		return this.el.getAttribute(name);
	};

	_EnhancedDescriptor.prototype.setAttribute = function(name,value) {
		return this.el.setAttribute(name,value);
	};


	function _roleEnhancedCleaner() {
		if (this.uniqueID == null) return; // just in case, shouldn't happen
		var desc = enhancedElements[this.uniqueID];
		if (desc) {
			var enhanced = desc.state.enhanced;
			if (desc.laidout) desc.laidout.destroy(desc.el);
			if (desc.layouter) desc.layouter.destroy(desc.el);
			//TODO destroy
			//TODO discard/destroy for layouter and laidout

			var controller = desc.controller || desc.getController();
			if (controller && controller.destroyed) controller.destroyed(desc.el,desc.instance);

			// if (desc.discardHandler) 
			var r = desc.discardHandler(desc.el,desc.role,desc.instance);
			// desc._domCheck();
			desc._unlist(true); // make sure that sizing stops

			if (controller && controller.discarded) controller.discarded(desc.el,desc.instance);

			//TODO discard queue for generator instances

			if (controller && enhanced) {
				--controller.__enhanced;
				if (controller.__enhanced == 0 && controller.destroy) {
					controller.destroy(desc.el);
					controller.__init_called = false;
				}	
			}

			return r;
		}
	}

	_EnhancedDescriptor.prototype.setInstance = function(instance) {
		this._initController();
		this.instance = instance;
		this._setInstance();
	};

	_EnhancedDescriptor.prototype._initController = function() {
		this._updateContext();
		var controller = this.getController();
		if (controller && ! controller.__init_called && controller.init) {
			controller.init(this.el,this.config,this.context);
			controller.__init_called = true;
		}
	};

	_EnhancedDescriptor.prototype._setInstance = function() {
		this.state.enhanced = this.instance === false? false:true;
		this.state.needEnhance = !this.state.enhanced;

		if (this.state.enhanced) {
			//TODO mark when it was enhanced so auto-discard can be equivalent
			var controller = this.getController();
			if (controller) {
				if (controller.enhanced) controller.enhanced(this.el,this.instance,this.config,this.context);
				controller.__enhanced = controller.__enhanced? controller.__enhanced+1 : 1;
			}

			this.sizingHandler = this.handlers.sizing[this.role];
			this.layoutHandler = this.handlers.layout[this.role];
			if (this.layoutHandler && this.layoutHandler.throttle) this.layout.throttle = this.layoutHandler.throttle;
			var discardHandler = this.handlers.discard[this.role];
			if (discardHandler) this.discardHandler = discardHandler;

			// if (this.sizingHandler), enhanced will update layout even if no sizingHandler
			if (this.sizingHandler !== false) sizingElements[this.uniqueID] = this;
			if (this.layoutHandler) {
				this.layout.enable = true;
				maintainedElements[this.uniqueID] = this;
			}
		} 
	};

	//TODO keep params on page

	_EnhancedDescriptor.prototype._tryEnhance = function(handlers,enabledRoles) {
		if (!this.state.needEnhance) return;
		if (handlers.enhance == undefined) debugger;
		// desc.callCount = 1;
		if (this.role && handlers.enhance[this.role] && enabledRoles[this.role]) {
			this._initController();
			//TODO allow parent to modify context
			this.instance = handlers.enhance[this.role].call(this,this.el,this.role,this.conf,this.context);
			this._setInstance();
		}
	};

	_EnhancedDescriptor.prototype._tryMakeLayouter = function(key) {

		if (this.conf.layouter && this.layouter==undefined) {
			this._updateLayouterContext();
			var varLayouter = Layouter.variants[this.conf.layouter];
			if (varLayouter) {
				// future API change parent parameter removed
				this.layouter = this.el.layouter = varLayouter.generator(key,this.el,this.conf,this.context.layouterParent,this.context);
				if (this.context.layouterParent) sizingElements[this.uniqueID] = this; //TODO not sure this is needed, adds overhead
				if (varLayouter.generator.prototype.hasOwnProperty("layout")) {
					this.layout.enable = true;
	                // this.layout.queued = true; laidout will queue it
	                maintainedElements[this.uniqueID] = this;
				}
				this.inits.push(this._layouterInit);
			}
		}
	};

	_EnhancedDescriptor.prototype._tryMakeLaidout = function(key) {

		if (this.conf.laidout && this.laidout==undefined) {
			this._updateLayouterContext();
			var varLaidout = Laidout.variants[this.conf.laidout];
			if (varLaidout) {
				this.laidout = this.el.laidout = varLaidout.generator(key,this.el,this.conf,this.context.layouterParent);
				sizingElements[this.uniqueID] = this;
				if (varLaidout.generator.prototype.hasOwnProperty("layout")) {
					this.layout.enable = true;
	                this.layout.queued = true;
	                maintainedElements[this.uniqueID] = this;
				}
				this.inits.push(this._laidoutInit);
			}
		}

	};

	
	//TODO _EnhancedDescriptor.prototype.prepareAncestors = function() {};

	_EnhancedDescriptor.prototype.refresh = function() {
		var getActiveArea = essential("getActiveArea"); //TODO switch to Resolver("page::activeArea")
		var updateLayout = false;

		if (this.el && this.el.stateful == null) this.liveCheck();
		
		if (this.layout.area != getActiveArea()) { 
			this.layout.area = getActiveArea();
			updateLayout = true;
		}

		if (updateLayout || this.layout.queued) {
			//proxyConsole().debug("Refresh element","w="+this.layout.width,"h="+this.layout.height, updateLayout?"updateLayout":"",this.layout.queued?"queued":"", this.role, this.uniqueID)
			if (this.layoutHandler) this.layoutHandler(this.el,this.layout,this.instance);
			var layouter = this.layouter, laidout = this.laidout;
			if (layouter) layouter.layout(this.el,this.layout,this.laidouts()); //TODO pass instance
			if (laidout) {
				laidout.layout(this.el,this.layout); //TODO pass instance
				if (this.context.layouterEl) this.context.layouterEl.stateful.set("layout.queued",true);
			}

            this.layout.queued = false;
		}	
	};

	_EnhancedDescriptor.prototype.laidouts = function() {
		var laidouts = []; // laidouts and layouter
        for(var n in sizingElements) {
            var desc = sizingElements[n];
            if (desc.context.layouterParent == this.layouter && desc.laidout) laidouts.push(desc.el);
        }        
		// for(var c = this.el.firstElementChild!==undefined? this.el.firstElementChild : this.el.firstChild; c; 
		// 				c = c.nextElementSibling!==undefined? c.nextElementSibling : c.nextSibling) {
		// 	if (c.stateful && c.stateful("sizing","undefined")) laidouts.push(c);
		// }
		return laidouts;
	};

	_EnhancedDescriptor.prototype._domCheck = function() {

		var inDom = document.body==this.el || essential("contains")(document.body,this.el); //TODO reorg import
		//TODO handle subpages
		if (!inDom) {
			//TODO destroy and queue discard
			this.discardNow();
		}
	};

	_EnhancedDescriptor.prototype.liveCheck = function() {
		if (!this.state.enhanced || this.state.discarded) return;
		this._domCheck();
	};

	_EnhancedDescriptor.prototype._null = function() {
		this.instance = null;
		this.controller = null;
		this.sizingHandler = undefined;
		this.layoutHandler = undefined;
		this.layouter = undefined;
		this.laidout = undefined;
		this.sizing.currentStyle = null;
		this.layout.currentStyle = null;
		this.layout.enable = false;					
		if (this.context) this.context.clear();
		this.context = undefined;
		this._updateContext = function() {}; //TODO why is this called after discard, fix that
	};

	_EnhancedDescriptor.prototype.discardNow = function() {
		if (this.state.discarded) return;

		cleanRecursively(this.el);
		this._null();
		this.el = undefined;
		this.state.enhanced = false;
		this.state.discarded = true;					
	};

	_EnhancedDescriptor.prototype._unlist = function(forget) {
		this.state.discarded = true;	//TODO is this correct??? prevents discardNow				
		if (this.layout.enable) delete maintainedElements[this.uniqueID];
		if (sizingElements[this.uniqueID]) delete sizingElements[this.uniqueID];
		if (unfinishedElements[this.uniqueID]) delete unfinishedElements[this.uniqueID];
		if (forget) delete enhancedElements[this.uniqueID];
		this._null();
	};

	_EnhancedDescriptor.prototype._queueLayout = function() {

		if (this.layout.displayed != this.sizing.displayed) {
			this.layout.displayed = this.sizing.displayed;
			this.layout.queued = true;
		}

		if (this.layout.width != this.sizing.width || this.layout.height != this.sizing.height) {
			this.layout.oldWidth = this.layout.width;
			this.layout.oldHeight = this.layout.height;
			this.layout.width = this.sizing.width;
			this.layout.height = this.sizing.height;
			this.layout.queued = true;
		}
		if (this.layout.contentWidth != this.sizing.contentWidth || this.layout.contentHeight != this.sizing.contentHeight) {
			this.layout.oldContentWidth = this.layout.contentWidth;
			this.layout.oldContentHeight = this.layout.contentHeight;
			this.layout.contentWidth = this.sizing.contentWidth;
			this.layout.contentHeight = this.sizing.contentHeight;
			this.layout.queued = true;
		}
	};

	_EnhancedDescriptor.prototype._updateDisplayed = function() {
		this.sizing.displayed = !(this.sizing.width == 0 && this.sizing.height == 0);
	};

	_EnhancedDescriptor.prototype._updateDisplayedNotNone = function() {
		//TODO 
		this.placement.manually(["display"])
		this.sizing.displayed = this.placement.style.display != "none";
	};

	_EnhancedDescriptor.prototype.checkSizing = function() {

		var track = this.sizing.track;

		// update sizing with element state
		this.sizing.width = this.el[track.sizeBy+"Width"];
		this.sizing.height = this.el[track.sizeBy+"Height"];
		this._updateDisplayed();

		// seems to be displayed
		if (this.sizing.displayed) {
			this.placement.compute();
			if (track.contentWidth) this.sizing.contentWidth = this.el[track.contentBy+"Width"];
			if (track.contentHeight) this.sizing.contentHeight = this.el[track.contentBy+"Height"];
			if (track.scrollTop) this.sizing.scrollTop = this.el.scrollTop;
			if (track.scrollLeft) this.sizing.scrollLeft = this.el.scrollLeft;

			if (this.sizingHandler) this.sizingHandler(this.el,this.sizing,this.instance);
			if (this.laidout) this.laidout.calcSizing(this.el,this.sizing);
			if (this.context.layouterParent) this.context.layouterParent.calcSizing(this.el,this.sizing,this.laidout);

			if (this.sizing.forceLayout) {
				this.sizing.forceLayout = false;
				this.sizing.queued = true;
			}
			this._queueLayout();

		// not displayed, and was last time			
		} else if (this.layout.displayed) {
			this.layout.displayed = false;
			this.layout.queued = true;
		}
	};

    _EnhancedDescriptor.prototype.applyStyle = function() {
        for(var n in this.layout.style) {
            this.el.style[n] = this.layout.style[n];
        }
    };
 
	_EnhancedDescriptor.prototype.getController = function() {
		// _updateContext

		return this.context? this.context.controller : null;
	};

	_EnhancedDescriptor.prototype.query = function(selector) {
		var q = DescriptorQuery(selector,this.el);
		return q;
	}

	// used to emulate IE uniqueID property
	var lastUniqueID = 555;

	//TODO Resolver.setByUniqueID

	// Get the enhanced descriptor for and element
	//TODO move to put this function on the document resolver for the page
	function EnhancedDescriptor(el,role,conf,force,page) {
		// forced replacement, or called with parameters to make a descriptor, so not a lookup
		var makeIt = force || ((role || conf) && arguments.length>=3);
		if (el.uniqueID === undefined && makeIt) el.uniqueID = ++lastUniqueID;

		var uniqueID = el.uniqueID;
		var desc = enhancedElements[uniqueID];
		if (desc || !makeIt) return desc;

		if (page == undefined) {
			var pageResolver = Resolver("page");
			page = pageResolver(["pagesById",(el.ownerDocument || document).uniquePageID || "main"],"null");
			if (page == null) page = Resolver("essential::ApplicationConfig::")();
		}
		desc = new _EnhancedDescriptor(el,role,conf,page,uniqueID);
		enhancedElements[uniqueID] = desc;
		var descriptors = page.resolver("descriptors");
		descriptors[uniqueID] = desc;

		return desc;
	}
	EnhancedDescriptor.all = enhancedElements;
	EnhancedDescriptor.unfinished = unfinishedElements;
	EnhancedDescriptor.query = DescriptorQuery;
	EnhancedDescriptor.maintainer = null; // interval handler
	essential.declare("EnhancedDescriptor",EnhancedDescriptor);

	function discardEnhancedElements() 
	{
		for(var n in enhancedElements) {
			var desc = enhancedElements[n];

			desc.discardNow();
			desc._unlist(true);
			// delete enhancedElements[n];
		}
		enhancedElements = EnhancedDescriptor.all = essential.set("enhancedElements",{});
	}
	EnhancedDescriptor.discardAll = discardEnhancedElements;

	EnhancedDescriptor.refreshAll = function() {
		if (document.body == undefined) return;

		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			if (desc.inits.length>0) desc._init();
		}

		for(var n in sizingElements) {
			var desc = sizingElements[n];
			desc.checkSizing();
		}

        for(var n in maintainedElements) {
            var desc = maintainedElements[n];
 
            if (desc.laidout && desc.layout.enable && !desc.state.discarded) {
                desc.refresh();
            }
        }
		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			if (!desc.laidout && desc.layout.enable && !desc.state.discarded) {
				desc.refresh();
			}
		}
		for(var n in sizingElements) {
			var desc = sizingElements[n];
            if (desc.layout.style) {
                desc.applyStyle();
                desc.layout.style = undefined;
            }
			desc.layout.queued = false;
		}
	};

	EnhancedDescriptor.maintainAll = function() {
		if (document.body == undefined) return;

		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			desc.liveCheck();
			//TODO if destroyed, in round 2 discard & move out of maintained 
			if (desc.state.discarded) {
				if (desc.el) cleanRecursively(desc.el);
				desc._unlist(); // leave it in .all}
			}
		}
	};

	EnhancedDescriptor.get = function(unique) {
		if (typeof unique == "object") {
			if (unique.uniqueID) return this.all[unique.uniqueID];
			return null;
		}

		return this.all[unique];
	};

/* was _resize_descs
	EnhancedDescriptor._resizeAll = function() {
		//TODO migrate to desc.refresh
		for(var n in maintainedElements) { //TODO maintainedElements
			var desc = maintainedElements[n];

			if (desc.layout.enable) {
				var ow = desc.el.offsetWidth, oh  = desc.el.offsetHeight;
				if (desc.layout.width != ow || desc.layout.height != oh) {
					desc.layout.width = ow;
					desc.layout.height = oh;
					var now = (new Date()).getTime();
					var throttle = desc.layout.throttle;
					if (desc.layout.delayed) {
						// set dimensions and let delayed do it
					} else if (typeof throttle != "number" || (desc.layout.lastDirectCall + throttle < now)) {
						// call now
						desc.refresh();
						desc.layout.lastDirectCall = now;
						if (desc.layouterParent) desc.layouterParent.layout.queued = true;
					} else {
						// call in a bit
						var delay = now + throttle - desc.layout.lastDirectCall;
						// console.log("resizing in",delay);
						(function(desc){
							desc.layout.delayed = true;
							setTimeout(function(){
								desc.refresh();
								desc.layout.lastDirectCall = now;
								desc.layout.delayed = false;
								if (desc.layouterParent) desc.layouterParent.layout.queued = true;
							},delay);
						})(desc);
					}
				}
			}
		}
	};

	// refreshAll
	function _area_changed_descs() {
		//TODO only active pages
		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			if (desc.layout.enable) desc.refresh();
		}
	};
*/

	// roles that have a prepare handler can tweak the original DOM content
	Resolver.docMethod("prepareDomWithRole", function() {

		var pageResolver = Resolver("page"),
			handlers = pageResolver("handlers"), enabledRoles = pageResolver("enabledRoles");

		if (handlers.prepare) {
			for(var n in enabledRoles) {
				var prepare = handlers.prepare[n];
				if (prepare) {
					var withRole = document.body.querySelectorAll("[role="+n+ "]");
					for(var i=0,el; el = withRole[i]; ++i) {
						prepare(el,n);
					}
				}
			}
		}
	});

	function branchDescs(el) {
		var descs = [];
		var e = el.firstElementChild!==undefined? el.firstElementChild : el.firstChild;
		while(e) {
			if (e.attributes) {
				var desc = EnhancedDescriptor.all[e.uniqueID];
				if (desc) descs.push(desc);
			}
			e = e.nextElementSibling!==undefined? e.nextElementSibling : e.nextSibling;
		}
		return descs;
	}

	enhancedWindows.notifyAll = function() {
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			w.notify(ev);
		}
	};
	enhancedWindows.discardAll = function() {
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			if (w.window) w.window.close();
		}
		enhancedWindows = null;
		essential.set("enhancedWindows.length",0);
		//TODO clearInterval(placement.broadcaster) ?
	};

	Resolver("document")._ready = function()
	{
		this._readyFired = true;

		this.seal(true);

		try {
			//TODO ap config _queueAssets
			Generator.instantiateSingletons("page");
			this.prepareDomWithRole();
			if (!this.namespace.loading) EnhancedDescriptor.enhanceUnfinished();
			//TODO flag module "dom" as ready

			// body can now be configured in script
			var body = this.namespace.body;
			var conf = Resolver.config(body), role = body.getAttribute("role");
			if (conf || role) EnhancedDescriptor(body,role,conf);

		}
		catch(ex) {
			proxyConsole().error("Failed to launch delayed assets and singletons",ex);
		}
	};

	Resolver("document")._load = function() {
		this._loadFired = true;
		this.seal(true);

		Resolver("page").set("state.livepage",true);
		this.reflectModules();
	};

	Resolver("document")._unload = function()
	{
		//TODO singleton deconstruct / before discard?

		Resolver.unloadWriteStored();

		Generator.discardRestricted();

		discardEnhancedElements();
		enhancedWindows.discardAll();

		//TODO Resolver resetPageState method
		Resolver("page").set("state.launched",false);
		Resolver("page").set("state.livepage",false);
		Resolver("page").set("pages",null);
		Resolver("page").set("pagesById",null);
	};

	// iBooks HTML widget
	if (window.widget) {
		widget.notifyContentExited = function() {
			fireUnload();
		};
	}

	function fireReadyStateChange() {

		Resolver("document::readyState").trigger("change");
	}

	if (window.device) {
		//TODO PhoneGap support
	}
	else {
		if (document.readyState === "complete") {
			fireDomReady();
			fireReadyStateChange();
		} 

		if (win.addEventListener) {
			win.document.addEventListener("readystatechange",fireReadyStateChange,false);
		} else {
			win.document.attachEvent("onreadystatechange",fireReadyStateChange);
		}
	}

	// get active console
	// - modern browsers return window.console
	// - IE8/9 return stub that always works
	// - Can be overridden with custom impl
	// usage
	// > var mylog = Resolver("essential::console::")();
	// > mylog.log("hello");
	var proxyConsole = essential.set("console",function() {
		return proxyConsole.custom || window.console&&window.console.debug&&window.console || ie8Console;
	});
	proxyConsole.custom = null;
	proxyConsole.destination = {};

	// make custom logger
	// - the destination named can be set to silent
	// - destination.queue can be set to array instance to dump logs
	// - destination.queue.push can be customised to make streaming/file loggers
	// - destination.defaultLevel can be set to override level
	proxyConsole.logger = function(dest,level) {
		var _dest = essential.declare(["console","destination",dest],{}), _con = proxyConsole();
		return function() {
			if (_dest.silent) return;
			//TODO optionally add destination name to end of logged line
			_con[_dest.defaultLevel || level].apply(_con,arguments);
			//TODO push to level / push combination

			if (_dest.queue && typeof _dest.queue.push == "function") {
				_dest.queue.push([].concat(arguments));
			}
		};
	};

	var stubConsole = {
		log: function() { this.nil("log",arguments); },
		trace: function() { this.nil("trace",arguments); },
		debug: function() { this.nil("debug",arguments); },
		info: function() { this.nil("info",arguments); },
		warn: function() { this.nil("warn",arguments); },
		error: function() { this.nil("error",arguments); },
		group: function() { this.nil("group",arguments); },
		groupEnd: function() { this.nil("groupEnd",arguments); },
		nil: function(level,parts) {}
	};
	var setStubConsole = essential.declare("setStubConsole",function(stub) {
		proxyConsole.custom = stub || stubConsole;
	});

	function _ielog(name) {
		return function() {
			if (window.console) console[name](Array.prototype.join.call(arguments," "));
		};
	}

	var ie8Console = {
		log: _ielog("log"),
		trace: _ielog("trace"),
		debug: _ielog("debug"),
		info: _ielog("info"),
		warn: _ielog("warn"),
		error: _ielog("error"),
		group: _ielog("group"),
		groupEnd: _ielog("groupEnd")
	};
	//TODO start out with object that queues, switch to _ielog when window.console is first seen


	var setWindowConsole = essential.declare("setWindowConsole",function() {
		proxyConsole.custom = null;
	});


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
	var defaultLocale = window.navigator.userLanguage || window.navigator.language || "en-US"
	var dl = defaultLocale.split("-");
	if (dl.length>1) {
		dl[1] = dl[1].toUpperCase();
		defaultLocale = dl.join("-");
	}
	translations.declare("defaultLocale",defaultLocale);
	translations.declare("locale",defaultLocale);

	Resolver("document").on("change","essential.locale",function(ev) {
		translations.set("locale",ev.value);
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
 

