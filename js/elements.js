/*jslint white: true */
!function () {
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{}),
		ObjectType = essential("ObjectType"),
		console = essential("console"),
		MutableEvent = essential("MutableEvent"),
		StatefulResolver = essential("StatefulResolver"),
		ApplicationConfig = essential("ApplicationConfig"),
		pageResolver = Resolver("page"),
		statefulCleaner = essential("statefulCleaner"),
		HTMLElement = essential("HTMLElement"),
		callCleaners = essential("callCleaners"),
		addEventListeners = essential("addEventListeners"),
		maintainedElements = essential("maintainedElements"),
		enhancedWindows = essential("enhancedWindows");



	/**
	 * Determines the default implementation for an element.
	 * The implementation can provide information about the template element.
	 *
	 * @return HTMLImplementation appropriate for the template element.
	 *
	 * @param {HTMLElement} clone Template Element
	 */
	function HTMLImplementation(el) {

		if (typeof el == "string") {
			var defaultIndex = el;
			var commonIndex = el;
		} else {
			if (typeof el.impl === "object") return el.impl;

			var type = el.getAttribute? el.getAttribute("type") : null;
			var defaultIndex = type? el.nodeName.toLowerCase() + " " + type : el.nodeName.toLowerCase();
			var commonIndex = el.nodeName.toLowerCase();
		}

		if (IMPL[defaultIndex]) return IMPL[defaultIndex];
		if (IMPL[commonIndex]) return IMPL[commonIndex];
		return IMPL.span;
	}
	HTMLElement.impl = essential.set("HTMLImplementation",HTMLImplementation);

	function _HTMLImplementation(fn) {
		this._init(fn);
	}
	HTMLElement.fn = HTMLImplementation.fn = _HTMLImplementation.prototype;

	HTMLElement.fn._init = function(fn) {
		this.core = this; // allows access to the core implementation when proxied
		for(var n in fn) this[n] = fn[n];
	}

	function _ButtonImplementation(fn) {
		this._init(fn);
	}
	_ButtonImplementation.prototype = new _HTMLImplementation;
	HTMLElement.Button = _ButtonImplementation;

	function _SelectImplementation(fn) {
		this._init(fn);
	}
	_SelectImplementation.prototype = new _HTMLImplementation;
	HTMLElement.Select = _SelectImplementation;

	function _TextInputImplementation(fn) {
		this._init(fn);
	}
	_TextInputImplementation.prototype = new _HTMLImplementation;
	HTMLElement.TextInput = _TextInputImplementation;

	function _DateInputImplementation(fn) {
		this._init(fn);
	}
	_DateInputImplementation.prototype = new _HTMLImplementation;
	HTMLElement.DateInput = _DateInputImplementation;

	function _NumberInputImplementation(fn) {
		this._init(fn);
	}
	_NumberInputImplementation.prototype = new _HTMLImplementation;
	HTMLElement.NumberInput = _NumberInputImplementation;

	function _RadioImplementation(fn) {
		this._init(fn);
	}
	_RadioImplementation.prototype = new _HTMLImplementation;
	HTMLElement.Radio = _RadioImplementation;

	function _CheckboxImplementation(fn) {
		this._init(fn);
	}
	_CheckboxImplementation.prototype = new _HTMLImplementation;
	HTMLElement.Checkbox = _CheckboxImplementation;

	function _WrapperImplementation(fn) {
		this._init(fn);
	}
	_WrapperImplementation.prototype = new _HTMLImplementation;
	HTMLElement.Wrapper = _WrapperImplementation;


	var IMPL = HTMLImplementation.IMPL = {
		"input": new _TextInputImplementation(),
		// "input text": new _TextInputImplementation(),
		// "input url": new _TextInputImplementation(),
		"input search": new _TextInputImplementation(/*{fixInputSpin:fixInputSpin}*/),
		// "input email": new _TextInputImplementation(),
		// "input tel": new _TextInputImplementation(),
		// "input password": new _TextInputImplementation(),
		// "input hidden": new _TextInputImplementation(),
		// "input file": new _TextInputImplementation(),

		"input date": new _DateInputImplementation(/*{fixInputSpin:fixInputSpin}*/),
		"input time": new _DateInputImplementation(/*{fixInputSpin:fixInputSpin}*/),

    	"input number": new _NumberInputImplementation(/*{fixInputSpin:fixInputSpin}*/),
    	"input range": new _NumberInputImplementation(/*{fixInputSpin:fixInputSpin}*/),

	    "input image": new _HTMLImplementation({
	            //?? handleOnChange:true,
	            getContent: function() { return ''; },
	            setContent: function() { return ''; },
	            getValue: function() { return ''; },
	            setValue: function() { return ''; }
	        }),
	    "input button": new _TextInputImplementation(),
	    // "input submit": new _TextInputImplementation(),
	    // "input reset": new _TextInputImplementation(),

	    "button": new _ButtonImplementation(),
	    // "button button": new _ButtonImplementation(),
	    // "button submit": new _ButtonImplementation(),
	    // "button reset": new _ButtonImplementation(),


	    "button radio": new _RadioImplementation(),
	    "input radio": new _RadioImplementation(),
	    "button checkbox": new _CheckboxImplementation(),
	    "input checkbox": new _CheckboxImplementation(),

	    "select": new _SelectImplementation(),
	    // "select select-one": new _SelectImplementation(),

	    "textarea": new _HTMLImplementation(),
	    // "textarea textarea": new _HTMLImplementation(),

	    "img": new _WrapperImplementation(),
	    "a": new _WrapperImplementation(),
	    "iframe": new _WrapperImplementation(),
	    "object": new _WrapperImplementation(),
	    "fieldset": new _WrapperImplementation(),
	    "form": new _WrapperImplementation(),

	    "#document-fragment": new _HTMLImplementation(),
	    // "label": new _HTMLImplementation(),
	    // "div": new _HTMLImplementation(),

	    "span": new _HTMLImplementation()
	};

	/**
	 * Check if a thing is a document fragment created by HTMLTemplate
	 *
	 * @param {Any} vThing Any instance
	 */
	HTMLElement.fn.isFragment = function(thing)
	{
		return typeof thing == "object" && thing instanceof DocumentFragment;
	};

	/** @private */
	HTMLElement.fn.isFragmentIE = function(thing)
	{
		return typeof thing == "object" && thing.nodeName == "#document-fragment";// thing.toHTML && thing.isDocumentFragment; 
	};

	/**
	 * Copy html attributes according to a positive list
	 * @param {HTMLElement} src Source element
	 * @param {HTMLElement} dst Destination element
	 * @param {Object} attrs Map of attributes and their default value
	 */
	HTMLElement.fn.copyAttributes = function(src,dst,attrs)
	{
		if (!attrs) return;
		if (src.nodeName.charAt(0) == "#") return;

		if (attrs["class"] !== undefined) {
		 	dst.className = dst.className? dst.className + " " + src.className : src.className;
		}
		if (attrs["style"] !== undefined && src.style.cssText != "") {
			dst.style.cssText = src.style.cssText;
		}
		for(var n in attrs) {
			if (n == "class" || n == "style") continue;
			var value = src.getAttribute(n);
			if (value != null && value !== attrs[n]) {
				dst.setAttribute(n,value);
			}
		}
	};

	HTMLElement.fn.CLONED_ATTRIBUTES = {
		"class": "",
		"style": "",
		"size": "",
		"cols": 0,
		"rows": 0,
		// not supported properly by IE, "type": true,
		"name": "",
		"id": "",
		"title": "",
		"dir": "",
		"lang": "",
		"language": "",
		"accesskey": "",
		"tabindex": 0
	};

	// stream.cloneNode that can be copied to .content
	function streamCloneNode(deep,state) {
		var root = this.nodeName? this:this.root;
		var fragment = root.ownerDocument.createDocumentFragment();
		if (deep) {
			root.impl.renderStream(fragment,this,state);
		}
		return fragment;
	}

	/**
	 * Create an array describing the DOM tree using clonable implementations.
	 * null entries indicates the previous element was a leaf
	 */
	HTMLElement.describeStream = function(root,policy)
	{
	    var stream = [];//EnhancedArray([]);
	    stream.cloneNode = streamCloneNode;
	    if (root.impl == null) root.impl = HTMLImplementation(root);
	    stream.root = root;
	    var firstText = root.childNodes[0];
	    stream.prefix = firstText && firstText.nodeType == 3? firstText.nodeValue : ""; 
	    this._describeStream(root,stream,root.impl,policy);
	    //TODO apply default values to elements
	    return stream;
	};

	/**
	 */
	HTMLElement.forgetStream = function(stream,policy)
	{
	    for(var i=0,impl; impl=stream[i]; ++i) {
	        if (typeof impl == "object" && impl.forgetUnique) {
	            impl.forgetUnique();
	        }
	    }
	};

	/*
		Make an implementation for a cloned element which knows about the original
		from snippet/template. The cloned element is slightly different, as some content
		and attributes will not apply. 
	*/
	HTMLElement.fn.childWrapper = function(el,child,props,policy)
	{
		var impl = this.uniqueForChild(child,policy);
	    impl.original = child;
	    impl.toClone = child.cloneNode(false);
	    var firstText = child.childNodes[0];
	    if (firstText && firstText.nodeType != 3) firstText = null;
	    if (firstText) {
	        impl.toClone.innerHTML = firstText.nodeValue;
	    }

	    //TODO deep if no enhancement needed
	    impl.idx = props.idx;
	    impl.parent = props.parent;
	    impl.attributes = impl.describeAttributes(el,policy);
	    impl.context = impl.describeContext(el,policy);
	    impl.decorators = impl.describeDecorators(impl,policy);
	    var repeat = child.getAttribute("repeat");
	    impl.repeat = typeof repeat == "string"? parseFloat(repeat) : 1;

	    // no need to clone the snippet attributes
	    for(var n in impl.attributes) {
	        impl.toClone.removeAttribute(n);
	    }
	    impl.toClone.removeAttribute("repeat");

	    // handlers on snippet ? or use decorators for "data-implementation" ?
	    // var oData = eClone.data;
	    // if (oData) {
	    //  oImplementation = oData.fireTrigger(null,"implementation","init",oImplementation);
	    // }
	    //TODO call before decorators oImplementation.decorate(eClone,eForm,mNames);

	    return impl;
	};

	/**
	 * Default behaviour for making a unique template implementation wrapper.
	 * Can be overridden for enhanced elements. Called on implementation of the source element.
	 *
	 * @param original Template element.
	 * @param policy Policy used to determine constructor
	 */
	HTMLElement.fn.uniqueForChild = function(original,policy)
	{
		return HTMLImplementation(original).makeUnique(policy);
	};

	// Default way to make unique implementation for a cloned element. Can be overridden for special implementations
	HTMLElement.fn.makeUnique = function(policy)
	{
		function ImplProxy() {}
		ImplProxy.prototype = this;
		return new ImplProxy();
	};

	/*
	TODO cleanHandler?
	*/
	HTMLElement.fn.forgetUnique = function()
	{
	    //TODO call "implementation" "destroy" handler
	    
	    // var oImplementation = this;
	    // oImplementation.undecorate(eClone,eForm);
	    // var oData = eClone.data;
	    // if (oData) {
	    //  oData.fireLifecycleTrigger("implementation","destroy",eForm,eClone,oImplementation);
	    // }
	    // this.callCleaners(eClone);
	    //     eClone.implementation = null;
	    
	};

	/**
	 * @param el Template Element with attributes
	 * @param decorators Map of objects specifying decorator functions and category attributes
	 */
	HTMLElement.fn.describeAttributes = function(el,policy)
	{
	    var attributes = {};
	    var decorators = policy.DECORATORS || {};
	    for(var name in decorators) {
	        var value = el.getAttribute(name);
	        if (value != null) {
	        	var mAttribute = {
	        	    value: value,
	        	    defaults: [],
	        	    
	        	    is_context: decorators[name].context,
	        	    is_refs: decorators[name].refs,
	        	    is_simple: decorators[name].simple
	        	};
	        	
	        	// *entry:mapping references decoding
	            if (decorators[name].refs) { //TODO review the flag to filter on !!!
	            	var pParts = [];
	        		var pNames = value.indexOf(" ") >= 0? value.split(" ") : value.split(",");
	        		for(var i=0,n; n = pNames[i]; ++i) {
	        			var pExpressAndMapping = n.split(":");
	        			pParts[i] = /([!+-]*)(.*)/.exec(pExpressAndMapping[0]);
	        			pParts[i].mapping = pExpressAndMapping[1]; // name of mapping for the data entry
	        			pParts[i].name = pNames[i] = pParts[i][2]; // third entry is the name
	        		}

	        		mAttribute.name = pNames[0];
	        		mAttribute.parts = pParts;
	        		mAttribute.names = pNames;
	            } 
	            attributes[name] = mAttribute;
	        } // value != null
	    }
	    return attributes;
	};

	HTMLElement.fn.describeContext = function(el,policy)
	{
	    //TODO consider improving context determination
	    
	    for(var impl = this; impl; impl = impl.parent) {
	        var decorators = policy.DECORATORS || {};
	        for(var n in decorators) {
	            if (policy.DECORATORS[n].context) {
	                var value = el.getAttribute(n);
	                if (value) return value;
	            }
	        }
	    }
	    return policy.defaultContext;
	};

	HTMLElement.fn.describeDecorators = function(impl,policy)
	{
	    var decorators = [];
	    for(var name in impl.attributes) {
	        var attribute = impl.attributes[name];
	        var decorator = policy.DECORATORS[name];
	        if (typeof decorator == "function") {
	            var func = decorator.call(impl,name,attribute);
	            if (func) decorators.push(func);
	        }
	    }
	    
	    return decorators;
	};

	HTMLElement.fn.decorate = function(clone,eForm,mNames)
	{
		//TODO
	};

	HTMLElement.fn.undecorate = function(clone,eForm)
	{
		//TODO
	};

	// enhance the branch
	HTMLElement.fn.enhance = function(clone)
	{
		//TODO
	};


	/**
	  Called on wrapped implementation to clone the original element.
	 */
	HTMLElement.fn.cloneOriginal = function(state)
	{
	    //TODO allow configuration override
	    
	    var el = this.toClone.cloneNode(true);
	    el.impl = this;
	    el.state = state; //TODO really?
	    
	    this.decorate(el); //TODO (el,container/enhanced,names)

	    for(var i=0,d; d = this.decorators[i]; ++i) {
	        d.call(this,el.state,el);
	    }
		return el; 
	};


	HTMLElement._describeStream = function(root,stream,rootImpl,policy)
	{
	    var prev = null;
	    for(var i=0,childNodes = root.childNodes,node; node = childNodes[i]; ++i) {
	        switch(node.nodeType) {
	            case 1 : // ELEMENT_NODE
	            	var impl = rootImpl.childWrapper(root,node,{idx:i},policy);
	                // impl.level
	                // impl.locator
	                impl.postfix = "";
	                stream.push(impl);
	                prev = impl;

	                if (node.firstElementChild || (node.firstChild && node.firstChild.nodeType == 1)) {
	                    stream.push(1);
	                    this._describeStream(node,stream,impl,policy);
	                    stream.push(-1);
	                } 
	                break;
	            case 3 : // TEXT_NODE
	                if (prev) prev.postfix = node.nodeValue;
	                break;
	            case 4 : // CDATA_SECTION_NODE
	            case 7 : // PROCESSING_INSTRUCTION_NODE
	            case 8 : // COMMENT_NODE
	            case 12 : // NOTATION_NODE
	        };
	    } 
	};

	/**
	 * Render a stream to an element
	 */
	HTMLElement.fn.renderStream = function(top,stream,state)
	{
	    if (stream.prefix) top.appendChild(document.createTextNode(stream.prefix));
	    var el = top;
	    var stack = [el];
	    for(var i=0,entry; entry = stream[i]; ++i) {
	        if (entry === -1) stack.pop();
	        else if (entry === 1) stack.push(el);
	        else {
	            //TODO do the substream for each repeat
	            var parent = stack[stack.length-1];
	            for(var r=0; r < entry.repeat; ++r) {
	                el = entry.cloneOriginal(state? state.getElementState(entry) : null);
	                parent.appendChild(el);
	            }
	            if (entry.postfix) {
	                parent.appendChild(document.createTextNode(entry.postfix));
	            } 
	        }
	    }
	    this.copyAttributes(stream.root,top,this.CLONED_ATTRIBUTES);
	    (top.impl || this).enhance(top);
	};



	function _queueDelayedAssets()
	{
		//TODO move this to pageResolver("state.ready")
		var config = ApplicationConfig();//TODO move the state transitions here
		config._queueAssets();

		// var scripts = document.head.getElementsByTagName("script");
		// for(var i=0,s; s = scripts[i]; ++i) {

		// }

		if (pageResolver(["state","loadingScripts"])) console.debug("loading phased scripts");

		var metas = document.getElementsByTagName("meta");
		for(var i=0,m; m = metas[i]; ++i) {
			switch((m.getAttribute("name") || "").toLowerCase()) {
				case "text selection":
					textSelection((m.getAttribute("content") || "").split(" "));
					break;
				case "enhanced roles":
					useBuiltins((m.getAttribute("content") || "").split(" "));
					break;
				case "track main":
					if (this.opener) {
						pageResolver.set("state.managed",true);
					}
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


	function _DialogAction(actionName) {
		this.actionName = actionName;
	} 
	_DialogAction.prototype.activateArea = essential("activateArea"); // shortcut to global essential function
	var DialogAction = essential.set("DialogAction",Generator(_DialogAction));


	function resizeTriggersReflow(ev) {
		// debugger;
		DocumentRoles()._resize_descs();
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			w.notify(ev);
		}
	}

	/*
		action buttons not caught by enhanced dialogs/navigations
	*/
	function defaultButtonClick(ev) {
		ev = MutableEvent(ev).withActionInfo();
		if (ev.commandElement && ev.commandElement == ev.actionElement) {

			//TODO action event filtering
			//TODO disabled
			fireAction(ev);
			if (ev.isDefaultPrevented()) return false;
		}
	}

	function fireAction(ev) 
	{
		var el = ev.actionElement, action = ev.action, name = ev.commandName;
		if (el) {

			if (! el.actionVariant) {
				if (action) {
					action = action.replace(essential("baseUrl"),"");
				} else {
					action = "submit";
				}

				el.actionVariant = DialogAction.variant(action)(action);
			}

			if (el.actionVariant[name]) el.actionVariant[name](el,ev);
			else {
				var sn = name.replace("-","_").replace(" ","_");
				if (el.actionVariant[sn]) el.actionVariant[sn](el,ev);
			}
			//TODO else dev_note("Submit of " submitName " unknown to DialogAction " action)

		} 
		else switch(ev.commandName) {
			//TODO other builtin commands
			case "close":
				//TODO close up shop
				if (ev.submitElement) {
					callCleaners(ev.submitElement);
					ev.submitElement.parentNode.removeChild(ev.submitElement);
				}
				break;
		}
	}
	essential.declare("fireAction",fireAction);


	function _StatefulField(name,el) {
		var stateful = StatefulResolver(el,true);
		return stateful;
	}
	var StatefulField = essential.declare("StatefulField",Generator(_StatefulField, { alloc:false }));

	StatefulField.prototype.destroy = function() {};
	StatefulField.prototype.discard = function() {};

	function _TextField() {

	}
	StatefulField.variant("input[type=text]",Generator(_TextField,_StatefulField));

	function _CheckboxField() {

	}
	StatefulField.variant("input[type=checkbox]",Generator(_CheckboxField,_StatefulField));

	function _TimeField() {

	}
	StatefulField.variant("input[type=time]",Generator(_TimeField,_StatefulField));

	function _CommandField(name,el,role) {

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
					//TODO support multiple roles
					if (el.type) variants.push("*[role="+role+",type="+el.type+"]");
					variants.push("*[role="+role+"]");
				} else {
					if (el.type) variants.push(el.tagName.toLowerCase()+"[type="+el.type+"]");
					variants.push(el.tagName.toLowerCase());
				}

				var stateful = StatefulField.variant(variants)(name,el,role);
			}

			enhanceStatefulFields(el); // enhance children
		}
	}
	essential.declare("enhanceStatefulFields",enhanceStatefulFields);

	function _DocumentRoles(handlers,page) {
		this.handlers = handlers || this.handlers || { enhance:{}, discard:{}, layout:{} };
		this._on_event = [];
		this.page = page || ApplicationConfig(); // Ensure that config is present
		
		//TODO configure reference as DI arg

		if (window.addEventListener) {
			window.addEventListener("resize",resizeTriggersReflow,false);
			this.page.body.addEventListener("orientationchange",resizeTriggersReflow,false);
			this.page.body.addEventListener("click",defaultButtonClick,false);
		} else {
			window.attachEvent("onresize",resizeTriggersReflow);
			this.page.body.attachEvent("onclick",defaultButtonClick);
		}
	}
	var DocumentRoles = essential.set("DocumentRoles",Generator(_DocumentRoles));
	
	_DocumentRoles.args = [
		ObjectType({ name:"handlers" })
	];

/*
	_DocumentRoles.prototype.enhanceBranch = function(el) {
		var descs;
		if (el.querySelectorAll) {
			descs = this._role_descs(el.querySelectorAll("*[role]"));
		} else {
			descs = this._role_descs(el.getElementsByTagName("*"));
		}
		this._enhance_descs(descs);
		//TODO reflow on resize etc
	};

	_DocumentRoles.prototype.discardBranch = function(el) {
		//TODO
	};
*/

	_DocumentRoles.prototype._enhance_descs = function(descs) 
	{
		var sizingElements = essential("sizingElements");
		var incomplete = false, enhancedCount = 0;

		for(var n in descs) {
			var desc = descs[n];

			//TODO speed up outstanding enhance check

			desc.ensureStateful();

			if (!desc.enhanced) { //TODO flag needEnhance
				desc._tryEnhance(this.handlers);
				++enhancedCount;	//TODO only increase if enhance handler?
			} 
			if (! desc.enhanced) incomplete = true;

			desc._tryMakeLayouter(""); //TODO key?
			desc._tryMakeLaidout(""); //TODO key?

			if (desc.conf.sizingElement) sizingElements[desc.uniqueId] = desc;
		}

		//TODO enhance additional descriptors created during this instead of double call on loading = false


		// notify enhanced listeners
		if (! incomplete && enhancedCount > 0) {
			for(var i=0,oe; oe = this._on_event[i]; ++i) {
				if (oe.type == "enhanced") {
					var descs2 = [];

					// list of relevant descs
					for(var n in descs) {
						var desc = descs[n];
						if (desc.role) if (oe.role== null || oe.role==desc.role) descs2.push(desc);
					}

					oe.func.call(this, this, descs2);
				}
			}
		} 
	};

	_DocumentRoles.prototype._resize_descs = function() {
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

	_DocumentRoles.prototype._area_changed_descs = function() {
		//TODO only active pages
		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			if (desc.layout.enable) {
				desc.refresh();
				// if (desc.layouterParent) desc.layouterParent.layout.queued = true;
				// this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
			}
		}
	};

	_DocumentRoles.prototype.on = function(name,role,func) {
		if (arguments.length == 2) func = role;
		
		//TODO
		this._on_event.push({ "type":name,"func":func,"name":name,"role":role });
	};
	
	// Element specific handlers
	DocumentRoles.presets.declare("handlers", pageResolver("handlers"));


	function useBuiltins(list) {
		for(var i=0,r; r = list[i]; ++i) pageResolver.set(["enabledRoles",r],true);
	}

	function textSelection(tags) {
		var pass = {};
		for(var i=0,n; n = tags[i]; ++i) {
			pass[n] = true;
			pass[n.toUpperCase()] = true;
		}
		addEventListeners(document.body, {
			"selectstart": function(ev) {
				ev = MutableEvent(ev);
				var allow = pass[ev.target.tagName || ""] || false;
				if (!allow) ev.preventDefault();
				return allow;
			}
		});
	}

	var _scrollbarSize;
	function scrollbarSize() {
		if (_scrollbarSize === undefined) {
			var div = HTMLElement("div",{ style: "width:50px;height:50px;overflow:scroll;position:absolute;top:-200px;left:-200px;" },
				'<div style="height:100px;"></div>');
			document.body.appendChild(div);
			_scrollbarSize = (div.offsetWidth - div.clientWidth) || /* OSX Lion */7; 
			document.body.removeChild(div);
		}

		return _scrollbarSize;
	}
	essential.declare("scrollbarSize",scrollbarSize);

}();

