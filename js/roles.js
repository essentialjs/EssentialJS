/*jshint forin:true, eqnull:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50, newcap:false, white:false, devel:true */
!function () {
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{}),
		ObjectType = essential("ObjectType"),
		console = essential("console"),
		MutableEvent = essential("MutableEvent"),
		StatefulResolver = essential("StatefulResolver"),
		statefulCleaner = essential("statefulCleaner"),
		HTMLElement = essential("HTMLElement"),
		HTMLScriptElement = essential("HTMLScriptElement"),
		Layouter = essential("Layouter"),
		Laidout = essential("Laidout"),
		EnhancedDescriptor = essential("EnhancedDescriptor"),
		callCleaners = essential("callCleaners"),
		addEventListeners = essential("addEventListeners"),
		removeEventListeners = essential("removeEventListeners"),
		ApplicationConfig = essential("ApplicationConfig"),
		pageResolver = Resolver("page"),
		fireAction = essential("fireAction"),
		scrollbarSize = essential("scrollbarSize"),
		serverUrl = location.protocol + "//" + location.host;


	
	function _StageLayouter(key,el,conf) {
		this.key = key;
		this.type = conf.layouter;
		this.areaNames = conf["area-names"];
		this.activeArea = null;

		this.baseClass = conf["base-class"];
		if (this.baseClass) this.baseClass += " ";
		else this.baseClass = "";
	}
	var StageLayouter = essential.declare("StageLayouter",Generator(_StageLayouter,Layouter));
	Layouter.variant("area-stage",StageLayouter);

	_StageLayouter.prototype.refreshClass = function(el) {
		var areaClasses = [];
		for(var i=0,a; a = this.areaNames[i]; ++i) {
			if (a == this.activeArea) areaClasses.push(a + "-area-active");
			else areaClasses.push(a + "-area-inactive");
		}
		var newClass = this.baseClass + areaClasses.join(" ")
		if (el.className != newClass) el.className = newClass;
	};

	_StageLayouter.prototype.updateActiveArea = function(areaName,el) {
		this.activeArea = areaName;
		this.refreshClass(el); //TODO on delay	
	};

	function _MemberLaidout(key,el,conf) {
		this.key = key;
		this.type = conf.laidout;
		this.areaNames = conf["area-names"];

		this.baseClass = conf["base-class"];
		if (this.baseClass) this.baseClass += " ";
		else this.baseClass = "";

		if (el) el.className = this.baseClass + el.className;
	}
	var MemberLaidout = essential.declare("MemberLaidout",Generator(_MemberLaidout,Laidout));
	Laidout.variant("area-member",MemberLaidout);


	function form_onsubmit(ev) {
		var frm = this;
		setTimeout(function(){
			frm.submit(ev);
		},0);
		return false;
	}
	function form_submit(ev) {
		if (document.activeElement) { document.activeElement.blur(); }
		this.blur();

		dialog_submit.call(this,ev);
	}
	function dialog_submit(clicked) {
		if (clicked == undefined) { clicked = MutableEvent().withDefaultSubmit(this); }

		if (clicked.commandElement) {
			clicked.submitElement = this;
			fireAction(clicked);
		} 
		//else {
			//TODO default submit when no submit button or event
		//}
	}

	function toolbar_submit(ev) {
		return dialog_submit.call(this,ev);
	}

	function form_blur() {
		for(var i=0,e; (e=this.elements[i]); ++i) { e.blur(); }
	}
	function form_focus() {
		for(var i=0,e; (e=this.elements[i]); ++i) {
			var autofocus = e.getAttribute("autofocus"); // null/"" if undefined
			if (!autofocus) continue;
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

	function mousedownDialogHeader(ev) {
		if (activeMovement != null) return;
		if (ev.target.tagName == "BUTTON") return; // don't drag on close button
		var dialog = this.parentNode;
		if (ev.button > 0 || ev.ctrlKey || ev.altKey || ev.shiftKey || ev.metaKey) return;
		Resolver("page").set("activeElement",dialog);
		dialog.parentNode.appendChild(dialog);

		if (ev.preventDefault) ev.preventDefault();

		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			dialog.style.left = x + "px"; 
			dialog.style.top = y + "px"; 
		};
		movement.start(this,ev);
		movement.startY = dialog.offsetTop;
		movement.startX = dialog.offsetLeft;
		movement.maxY = document.body.offsetHeight - dialog.offsetHeight;
		movement.maxX = document.body.offsetWidth - dialog.offsetWidth;

		return false; // prevent default
	}

	function getChildWithRole(el,role) {
		if (el.querySelector && !/; MSIE /.test(navigator.userAgent)) return el.querySelector("[role="+role+"]");

		for(var c=el.firstChild; c; c = c.nextSibling) if (c.getAttribute) {
			if (c.getAttribute("role") == role) return c;
			if (c.firstChild) {
				var match = getChildWithRole(c,role);
				if (match) return match;
			}
		}
		return null;
	}

	// TODO resolver entries for bounds, use layouter to position
	var initial_top = 100, initial_left = 40, dialog_top_inc = 32, dialog_left_inc = 32, 
		dialog_top = initial_top, dialog_left = initial_left,
		dialog_next_down = initial_top;

	function enhance_dialog(el,role,config,context) {
		// TODO if (config['invalid-config']) console.log()

		var configTemplate = config.template,
			contentTemplate = config['content-template'], 
			contentClass = config['content-class'] || "dialog-content",
			contentRole = config['content-role'], contentConfig = config['content-config'];
		var children = [];
		for(var i=0,c; c = el.childNodes[i]; ++i) children.push(c);

		// template around the content
		if (configTemplate) {
			var template = Resolver("page::templates","null")([configTemplate]);
			if (template == null) return false;

			var content = template.content.cloneNode(true);
			el.appendChild(content);
		}

		var header = el.getElementsByTagName("HEADER")[0],
			footer = el.getElementsByTagName("FOOTER")[0];

		var wrap = getChildWithRole(el,"content");
		// content-template appended to role=content or element
		if (contentTemplate) {
			var template = Resolver("page::templates","null")([contentTemplate]);
			if (template == null) return false;

			var content = template.content.cloneNode(true);

			(wrap || el).appendChild(content);
		}
		else {
			if (wrap == null) wrap = HTMLElement("div",{});
				
			if (contentRole) {
				wrap.setAttribute("role",contentRole);
			}
			while(children.length) wrap.appendChild(children.shift());


			if (contentConfig) {
				if (typeof contentConfig == "object") {
					var c = JSON.stringify(contentConfig);
					contentConfig = c.substring(1,c.length-1);
				}
				wrap.setAttribute("data-role",contentConfig);
			}
		} 
		if (wrap) {
			wrap.className = ((wrap.className||"") + " "+contentClass).replace("  "," ");
			essential("DescriptorQuery")(wrap).withBranch().enhance();
		}

		// restrict height to body (TODO use layouter to restrict this on page resize)
		if (el.offsetHeight > document.body.offsetHeight) {
			var height = document.body.offsetHeight - 20;
			if (header) height -= header.offsetHeight;
			if (footer) height -= footer.offsetHeight;
			wrap.style.maxHeight = height + "px";
		}

		// position the dialog
		if (config.placement) { // explicit position
			if (config.placement.bottom) el.style.bottom = config.placement.bottom + "px";
			else el.style.top = (config.placement.top || 0) + "px";

			if (config.placement.right) el.style.right = config.placement.right + "px";
			else el.style.left = (config.placement.left || 0) + "px";
		} else { // managed position

			if (dialog_top + el.offsetHeight > document.body.offsetHeight) {
				dialog_top = initial_top;
			}
			if (dialog_left + el.offsetWidth > document.body.offsetWidth) {
				initial_left += dialog_left_inc;
				dialog_left = initial_left;
				if (config.tile) {
					if (dialog_next_down + el.offsetHeight > document.body.offsetHeight) {
						initial_top += dialog_top_inc;
						dialog_next_down =  initial_top;
					}
					dialog_top = dialog_next_down;
				}
			}
			el.style.top = Math.max(0,Math.min(dialog_top,document.body.offsetHeight - el.offsetHeight - 12)) + "px";
			el.style.left = Math.max(0,dialog_left) + "px";

			if (config.tile) { // side by side
				dialog_left += el.offsetWidth + dialog_left_inc;
				dialog_next_down = dialog_top + el.offsetHeight + dialog_top_inc;
			} else { // stacked
				dialog_top += dialog_top_inc;
				dialog_left += dialog_left_inc;
				//TODO move down by height of header
			}
		}


		// dialog header present
		if (header && header.parentNode == el) {

			addEventListeners(header,{ "mousedown": mousedownDialogHeader });
		}

		//TODO header instrumentation


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
	}
	pageResolver.set("handlers.enhance.dialog",enhance_dialog);

	function layout_dialog(el,layout,instance) {		
	}
	pageResolver.set("handlers.layout.dialog",layout_dialog);

	function discard_dialog(el,role,instance) {
	}
	pageResolver.set("handlers.discard.dialog",discard_dialog);

	function applyDefaultRole(elements) {
		for(var i=0,el; (el = elements[i]); ++i) {
			switch(el.tagName) {
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
	}

	/* convert listed button elements */
	function forceNoSubmitType(buttons) {

		for(var i=0,button; (button = buttons[i]); ++i) if (button.type === "submit") {
			button.setAttribute("type","button");
			if (button.type === "submit") button.type = "submit";
		}
	}

	function enhance_toolbar(el,role,config,context) {
		// make sure no submit buttons outside form, or enter key will fire the first one.
		forceNoSubmitType(el.getElementsByTagName("BUTTON"));
		applyDefaultRole(el.getElementsByTagName("BUTTON"));
		applyDefaultRole(el.getElementsByTagName("A"));

		el.submit = toolbar_submit;

		addEventListeners(el, {
			"click": dialog_button_click
		},false);

		return {};
	}
	pageResolver.set("handlers.enhance.toolbar",enhance_toolbar);
	pageResolver.set("handlers.enhance.menu",enhance_toolbar);
	pageResolver.set("handlers.enhance.menubar",enhance_toolbar);
	pageResolver.set("handlers.enhance.navigation",enhance_toolbar);

	function layout_toolbar(el,layout,instance) {		
	}
	pageResolver.set("handlers.layout.toolbar",layout_toolbar);

	function discard_toolbar(el,role,instance) {
	}
	pageResolver.set("handlers.discard.toolbar",discard_toolbar);

	function enhance_sheet(el,role,config,context) {
		
		return {};
	}
	pageResolver.set("handlers.enhance.sheet",enhance_sheet);

	function enhance_spinner(el,role,config,context) {
		if (window.Spinner == undefined) return false;

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
	}
	pageResolver.set("handlers.enhance.spinner",enhance_spinner);

	function layout_spinner(el,layout,instance) {
		//TODO when hiding stop the spinner		
	}
	pageResolver.set("handlers.layout.spinner",layout_spinner);

	function discard_spinner(el,role,instance) {
		instance.stop();
		el.innerHTML = "";
	}
	pageResolver.set("handlers.discard.spinner",discard_spinner);
	
	function _lookup_generator(name,resolver) {
		var constructor = Resolver(resolver || "default")(name,"null");
		
		return constructor? Generator(constructor) : null;
	}

	function enhance_application(el,role,config,context) {
		// template around the content
		if (config.template) {
			var template = Resolver("page::templates","null")([config.template]);
			if (template == null) return false;

			var content = template.content.cloneNode(true);
			el.appendChild(content);
		}

		if (config.variant) {
//    		variant of generator (default ApplicationController)
		}
		if (config.generator) {
			var g = _lookup_generator(config.generator,config.resolver);
			if (g) {
				var instance = g(el,role,config,context);
				return instance;
			}
			else return false; // not yet ready
		}
		
		return {};
	};
	pageResolver.set("handlers.enhance.application",enhance_application);

	function layout_application(el,layout,instance) {	
	}
	pageResolver.set("handlers.layout.application",layout_application);

	function discard_application(el,role,instance) {	
		//TODO destroy/discard support on generator ?
	}
	pageResolver.set("handlers.discard.application",discard_application);

	//TODO find parent of scrolled role

	function getOfRole(el,role,parentProp) {
		parentProp = parentProp || "parentNode";
		while(el) {
			//TODO test /$role | role$|$role$| role /
			if (el.getAttribute && el.getAttribute("role") == role) return el;
			el = el[parentProp];
		}
		return null;
	}

	function JSON2Attr(obj,excludes) {
		excludes = excludes || {};
		var r = {};
		for(var n in obj) if (! (n in excludes)) r[n] = obj[n];
		var txt = JSON.stringify(r);
		return txt.substring(1,txt.length-1);
	}
	essential.declare("JSON2Attr",JSON2Attr);


	// Templates

	function Template(el,config) {
		this.el = el; // TODO switch to uniqueID
		this.tagName = el.tagName;
		this.dataRole = JSON2Attr(config,{id:true});

		this.id = config.id || el.id;
		this.selector = config.selector || (this.id? ("#"+this.id) : null);
		// TODO class support, looking up on main document by querySelector

		// HTML5 template tag support
		if ('content' in el) {
			this.content = el.content;
			//TODO additional functionality in cloneNode
		// HTML4 shim
		} else {
			this.content = el.content = el.ownerDocument.createDocumentFragment();
			while(el.firstChild) this.content.appendChild(el.firstChild);
			var policy = {};
			this.stream = HTMLElement.describeStream(this.content,policy);
			//TODO handle img preloading
			//TODO handle sources in img/object/audio/video in cloneNode, initially inert

			this.content.cloneNode = this.stream.cloneNode.bind(this.stream);
		}
	}

	Template.prototype.getDataRole = function() {
		return this.dataRole;
	};

	Template.prototype.getAttribute = function(name) {
		return this.el.getAttribute(name);
	};

	Template.prototype.setAttribute = function(name,value) {
		return this.el.setAttribute(name,value);
	};


	Template.prototype.contentCloneFunc = function(el) {
		return function(deep) {
			var fragment = el.ownerDocument.createDocumentFragment();
			if (! deep) return fragment; // shallow just gives fragment

			for(var c = el.firstChild; c; c = c.nextSibling) {
				switch(c.nodeType) {
					case 1:
						fragment.appendChild(c.cloneNode(true));
						break;
					case 3:
						fragment.appendChild(el.ownerDocument.createTextNode(c.data));
						break;
					case 8: // comment ignored
						// fragment.appendChild(el.ownerDocument.createComment(c.data));
						break;

				}
			}

			return fragment;
		};
	};

	//TODO TemplateContent.prototype.clone = function(config,model) {}

	function enhance_template(el,role,config,context) {
		var template = new Template(el,config);

		// template can be anonymouse
		if (template.selector) pageResolver.set(["templates",template.selector],template);

		return template;
	}
	pageResolver.set("handlers.enhance.template",enhance_template);

	function init_template(el,role,config,context) {
		this.state.contentManaged = true; // template content skipped
	}
	pageResolver.set("handlers.init.template",init_template);

	function init_templated(el,role,config,context) {
		this.state.contentManaged = true; // templated content skipped
	}
	pageResolver.set("handlers.init.templated",init_templated);


	// Scrolled

	var is_inside = 0;

	var ENHANCED_SCROLLED_PARENT_EVENTS = {
		"mousemove": function(ev) {
		},
		"mouseover": function(ev) {
			var enhanced = EnhancedDescriptor(this.scrolled).instance;

			if (this.stateful.movedOutInterval) clearTimeout(this.stateful.movedOutInterval);
			this.stateful.movedOutInterval = null;
			this.stateful.set("over",true);
			enhanced.vert.show();
			enhanced.horz.show();
		},
		"mouseout": function(ev) {
			var sp = this;
			var enhanced = EnhancedDescriptor(this.scrolled).instance;
			
			if (this.stateful.movedOutInterval) clearTimeout(this.stateful.movedOutInterval);
			this.stateful.movedOutInterval = setTimeout(function(){
				sp.stateful.set("over",false);
				if (sp.stateful("dragging") != true) {
					enhanced.vert.hide();
					enhanced.horz.hide();
				}
				//console.log("mouse out of scrolled.");
			},30);
		}

		// mousedown, scroll, mousewheel
	};

	var preventWheel = false; //navigator.userAgent.match(/Macintosh/) != null;

	function parentChain(el) {
		var p = [];
		while(el && el != el.ownerDocument.body) { p.push(el); el = el.parentNode; }
		return p;
	}

	var ENHANCED_SCROLLED_EVENTS = {
		"scroll": function(ev) {
			var el = ev? (ev.target || ev.scrElement) : event.srcElement;

			if (el.stateful("pos.scrollVert","0")) el.stateful.set("pos.scrollTop",el.scrollTop);
			if (el.stateful("pos.scrollHorz","0")) el.stateful.set("pos.scrollLeft",el.scrollLeft);
		},
		"DOMMouseScroll": function(ev) {
			// Firefox with axis
		},
		"wheel": function(ev) {
			// Newer Firefox + IE9/10
		},
		"mousewheel": function(ev) {
			ev = MutableEvent(ev).withMouseInfo();
			// ev.stateful = ev.target.stateful; //TODO withStatefulTarget, self or parent that is stateful 

			// scrolling in two dimensions is problematic as you can only prevent or not. An acceleration is native

			//TODO check natural swipe setting/direction
			// if webkitDirectionInvertedFromDevice == false do the inverse

			var chain = parentChain(ev.target);
			var preventLeft = preventWheel && ev.deltaX > 0 && chain.every(function(el) { return el.scrollLeft == 0; });
			// if (preventLeft) console.log("prevent left scroll ");
			var preventTop = preventWheel && ev.deltaY > 0 && chain.every(function(el) { return el.scrollTop == 0; });
			// if (preventTop) console.log("prevent top scroll ");

			var prevent = false;

			if (this.stateful("pos.scrollVert","0")) {
				// native scrolling default works fine
			} else {
				if (ev.deltaY != 0) {
					var max = Math.max(0, this.stateful("pos.scrollHeight","0") - this.offsetHeight);
					var top = this.stateful("pos.scrollTop","0");
					// console.log("vert delta",ev.deltaY, top, max, this.stateful("pos.scrollHeight"),this.offsetHeight);
					top = Math.min(max,Math.max(0, top - ev.deltaY));
					this.stateful.set("pos.scrollTop",top);
					prevent = true;
				}
			}

			if (this.stateful("pos.scrollHorz","0")) { // native scrolling?
				// native scrolling default works fine
			} else {
				if (ev.deltaX != 0) {
					var max = Math.max(0,this.stateful("pos.scrollWidth","0") - this.offsetWidth);
					var left = this.stateful("pos.scrollLeft","0");
					left =  Math.min(max,Math.max(0,left + ev.deltaY)); //TODO inverted?
					this.stateful.set("pos.scrollLeft",left);
					prevent = true;
				}
			}


			// if ((ev.deltaX < 0 && (this.scrollLeft + Math.ceil(this.offsetWidth) >= this.scrollWidth))) {

			// 	ev.preventDefault();
			// 	return false;
			// }
			// if ((ev.deltaY < 0 && (this.scrollTop + Math.ceil(this.offsetHeight) >= this.scrollHeight))) {

			// 	ev.preventDefault();
			// 	return false;
			// }

			if (prevent || preventLeft || preventTop) {
				ev.preventDefault();
				return false;
			}
		}

		// mousedown, scroll, mousewheel
	};

	// Current active Movement activity
	var activeMovement = null;
	Resolver("page").set("activeMovement",null);

	/*
		The user operation of moving an element within the existing parent element.
	*/
	function ElementMovement() {
	}

	ElementMovement.prototype.track = function(ev) {

	};

	//TODO support fixed position offsetTop/Bottom in IE, kinda crap negative offsets

	//TODO support bottom/right positioning
	
	ElementMovement.prototype.start = function(el,event) {
		var movement = this;
		this.el = el;
		this.event = event;

		// Start and bounding offset
		this.startY = el.offsetTop; this.minY = 0; this.maxY = 1000;
		this.startX = el.offsetLeft; this.minX = 0; this.maxX = 1000;
		this.factorX = 1;
		this.factorY = 1;

		this.startPageY = event.pageY; // - getComputedStyle( 'top' )
		this.startPageX = event.pageX; //??
		document.onselectstart = function(ev) { return false; }; //TODO save old handler?

		//TODO capture in IE
		//movement.track(event,0,0);

		if (el.stateful) el.stateful.set("dragging",true);
		this.target = document.body;
		if (document.body.setCapture) {
			this.target = this.el;
			this.target.setCapture();
		}

		this.drag_events = {
			//TODO  keyup ESC
			"keyup": function(ev) {

			},
			"mousemove": function(ev) {
				var maxY = 1000, maxX = 1000;
				var y = Math.min( Math.max(movement.startY + movement.factorY*(ev.pageY - movement.startPageY),movement.minY), movement.maxY );
				var x = Math.min( Math.max(movement.startX + movement.factorX*(ev.pageX - movement.startPageX),movement.minX), movement.maxX );
				movement.track(ev,x,y);
				// console.log(movement.factorX,movement.factorY)
			},
			"click": function(ev) {
				ev.preventDefault();
				ev.stopPropagation(); //TODO ev.stopImmediatePropagation() ?
				return false;
			},
			"mouseup": function(ev) {
				movement.end();
				ev.preventDefault();
				ev.stopPropagation(); //TODO ev.stopImmediatePropagation() ?
				return false;
			}
		};
		addEventListeners(this.target,this.drag_events);

		activeMovement = this;
		Resolver("page").set("activeMovement",this);

		return this;
	};

	ElementMovement.prototype.end = function() {
		if (this.el.stateful) this.el.stateful.set("dragging",false);
		removeEventListeners(this.target,this.drag_events);
		if (this.target.releaseCapture) this.target.releaseCapture();
		this.target = null;

		delete document.onselectstart ;

		activeMovement = null;
		Resolver("page").set("activeMovement",null);

		return this;
	};

	function mousedownVert(ev) {
		if (activeMovement != null) return;

		if (ev.preventDefault) ev.preventDefault();
		//TODO this.stateful instead of var scrolled = this.parentNode.scrolled;
		var scrolled = this.parentNode.scrolled; //TODO better way to pass ?
		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			scrolled.scrollTop = y; //(scrolled.scrollHeight -  scrolled.clientHeight) * y / (scrolled.clientHeight - 9);
			scrolled.stateful.set("pos.scrollTop",y);
			//var posInfo = document.getElementById("pos-info");
			//posInfo.innerHTML = "x=" +x + " y="+y + " sy="+scrolled.scrollTop + " cy="+ev.clientY + " py="+ev.pageY;
		};
		movement.start(this,ev);
		movement.startY = scrolled.scrollTop;
		movement.startX = scrolled.scrollLeft;
		movement.factorY = scrolled.scrollHeight / movement.el.offsetHeight;
		movement.maxY = scrolled.scrollHeight - scrolled.clientHeight;
		return false; // prevent default
	}
	function mousedownStatefulVert(ev) {
		if (activeMovement != null) return;

		if (ev.preventDefault) ev.preventDefault();
		//TODO this.stateful instead of var scrolled = this.parentNode.scrolled;
		var scrolled = this.parentNode.scrolled; //TODO better way to pass ?
		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			scrolled.stateful.set("pos.scrollTop",y);
			this.scrolledTo = y;
			//var posInfo = document.getElementById("pos-info");
			//posInfo.innerHTML = "x=" +x + " y="+y + " sy="+scrolled.scrollTop + " cy="+ev.clientY + " py="+ev.pageY;
		};
		movement.start(this,ev);
		movement.startY = scrolled.stateful("pos.scrollTop","0");
		movement.startX = scrolled.stateful("pos.scrollLeft","0");
		movement.factorY = scrolled.stateful("pos.scrollHeight","0") / movement.el.offsetHeight;
		movement.maxY = scrolled.stateful("pos.scrollHeight","0") - scrolled.clientHeight;
		return false; // prevent default
	}

	function mousedownHorz(ev) {
		if (activeMovement != null) return;

		if (ev.preventDefault) ev.preventDefault();
		//TODO this.stateful instead of var scrolled = this.parentNode.scrolled;
		var scrolled = this.parentNode.scrolled; //TODO better way to pass ?
		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			scrolled.scrollLeft = x; //(scrolled.scrollWidth -  scrolled.clientWidth) * x / (scrolled.clientWidth - 9);
			scrolled.stateful.set("pos.scrollLeft",x);
		};
		movement.start(this,ev);
		movement.startY = scrolled.scrollTop;
		movement.startX = scrolled.scrollLeft;
		movement.factorX = scrolled.scrollWidth / movement.el.offsetWidth;
		movement.maxX = scrolled.scrollWidth - scrolled.clientWidth;
		return false; // prevent default
	}
	function mousedownStatefulHorz(ev) {
		if (activeMovement != null) return;

		if (ev.preventDefault) ev.preventDefault();
		//TODO this.stateful instead of var scrolled = this.parentNode.scrolled;
		var scrolled = this.parentNode.scrolled; //TODO better way to pass ?
		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			scrolled.stateful.set("pos.scrollLeft",x);
			this.scrolledTo = x;
		};
		movement.start(this,ev);
		movement.startY = scrolled.stateful("pos.scrollTop","0");
		movement.startX = scrolled.stateful("pos.scrollLeft","0");
		movement.factorX = scrolled.stateful("pos.scrollWidth","0") / movement.el.offsetWidth;
		movement.maxY = scrolled.stateful("pos.scrollWidth","0") - scrolled.clientWidth;
		return false; // prevent default
	}


	function EnhancedScrollbar(el,container,config,opts,mousedownEvent) {
        var sbsc = scrollbarSize();
		var lc = opts.horzvert.toLowerCase();

		this.scrolled = el;
		var className = config.obscured? lc+"-scroller obscured" : lc+"-scroller";
		this.el = HTMLElement("div", { "class":className }, '<header></header><footer></footer><nav><header></header><footer></footer></nav>');
		container.appendChild(this.el);
		this.sizeName = opts.sizeName; this.posName = opts.posName;
		this.sizeStyle = opts.sizeName.toLowerCase();
		this.posStyle = opts.posName.toLowerCase();
		this.autoHide = opts.autoHide;
		this.trackScroll = opts.trackScroll == false? false : true;;

		this.trackScrolled(el);

		addEventListeners(el,ENHANCED_SCROLLED_EVENTS);
		addEventListeners(this.el,{ "mousedown": mousedownEvent });

		if (config.initialDisplay !== false) {
			if (this.show()) {
				this.hiding = setTimeout(this.hide.bind(this), parseInt(opts.initialDisplay,10) || 3000);
			}
		}
		if (config.obscured) this.el.style[opts.edgeName] = "-" + (config[lc+"Offset"]!=undefined? config[lc+"Offset"]:sbsc) + "px";
        else this.el.style[opts.thicknessName] = sbsc + "px";
	}

	EnhancedScrollbar.prototype.trackScrolled = function(el) {
		if (this.trackScroll) {
			this.scrolledTo = el["scroll"+this.posName];
			this.scrolledContentSize = el["scroll"+this.sizeName];
		}
		else {
			this.scrolledTo = this.scrolled.stateful("pos.scroll"+this.posName,"0");
			this.scrolledContentSize = this.scrolled.stateful("pos.scroll"+this.sizeName,"0");
		}
		this.scrolledSize = el["client"+this.sizeName]; //scrolled.offsetHeight - scrollbarSize();
	};

	EnhancedScrollbar.prototype.update = function(scrolled) {
		if (this.scrolledContentSize) {
			this.el.lastChild.style[this.posStyle] = (100 * this.scrolledTo / this.scrolledContentSize) + "%";
			this.el.lastChild.style[this.sizeStyle] = (100 * this.scrolledSize / this.scrolledContentSize) + "%";
		} else {
			this.el.lastChild.style[this.posStyle] = "0%";
			this.el.lastChild.style[this.sizeStyle] = "0%";
		}
	};

	EnhancedScrollbar.prototype.show = function() {
		if (this.scrolledContentSize <= this.scrolledSize) return false;

		if (!this.shown) {
			this.update(this.scrolled);
			this.el.className += " shown";
			if (this.hiding) {
				clearTimeout(this.hiding);
				delete this.hiding;
			}
			this.shown = true;

			return true;
		}
	};

	EnhancedScrollbar.prototype.hide = function() {
		if (this.autoHide !== false && this.shown) {
			this.el.className = this.el.className.replace(" shown","");
			if (this.hiding) {
				clearTimeout(this.hiding);
				delete this.hiding;
			}
			this.shown = false;
		}
	};

	EnhancedScrollbar.prototype.delayedHide = function(delay) {
		var that = this;

		this.hiding = setTimeout(function() { that.hide(); }, delay || 1500);
	};

	EnhancedScrollbar.prototype.destroy = function() {
		if (this.el) {
			if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
			callCleaners(this.el);
			this.el = undefined;
		}
	};

	function EnhancedScrolled(el,config) {

		//? this.el = el
		var container = this._getContainer(el,config);


		var trackScrollVert = !(config.trackScrollVert==false || config.trackScroll == false),
			trackScrollHorz = !(config.trackScrollHorz==false || config.trackScroll == false);

		el.stateful.declare("pos.scrollVert",trackScrollVert);
		el.stateful.declare("pos.scrollHorz",trackScrollHorz);
		el.stateful.declare("pos.scrollTop",0);
		el.stateful.declare("pos.scrollLeft",0);

		this.x = false !== config.x;
		this.y = false !== config.y;
		this.vert = new EnhancedScrollbar(el,container,config,{
			horzvert: "Vert", 
			trackScroll: trackScrollVert,
			sizeName: "Height", 
			posName: "Top",
			thicknessName:"width",
			edgeName: "right" 
			},trackScrollVert? mousedownVert : mousedownStatefulVert);

		this.horz = new EnhancedScrollbar(el,container,config,{ 
			horzvert: "Horz",
			trackScroll: trackScrollHorz,
			sizeName: "Width", 
			posName: "Left", 
			thicknessName:"height",
			edgeName: "bottom" 
			},trackScrollHorz? mousedownHorz : mousedownStatefulHorz);

		container.scrolled = el;
		StatefulResolver(container,true);
		addEventListeners(container,ENHANCED_SCROLLED_PARENT_EVENTS);
		container.scrollContainer = "top";

		this.refresh(el);

		el.stateful.on("change","pos.scrollTop",{el:el,es:this},this.scrollTopChanged);
		el.stateful.on("change","pos.scrollLeft",{el:el,es:this},this.scrollLeftChanged);
	}

	EnhancedScrolled.prototype.scrollTopChanged = function(ev) {
		var el = ev.data.el, es = ev.data.es;

		// if not shown, show and if not entered and not dragging, hide after 1500 ms
		if (!es.vert.shown) {
			es.vert.show();
			es.horz.show();
			if (!ev.resolver("over") && !ev.resolver("dragging")) {
				es.vert.delayedHide();
				es.horz.delayedHide();
			}
		}

		es.vert.trackScrolled(el);
		es.vert.update(el);
	};

	EnhancedScrolled.prototype.scrollLeftChanged = function(ev) {
		var el = ev.data.el, es = ev.data.es;

		// if not shown, show and if not entered and not dragging, hide after 1500 ms
		if (!es.vert.shown) {
			es.vert.show();
			es.horz.show();
			if (!el.stateful("over") && !el.stateful("dragging")) {
				es.vert.delayedHide();
				es.horz.delayedHide();
			}
		}
		es.horz.trackScrolled(el);
		es.horz.update(el);
	};

	EnhancedScrolled.prototype._getContainer = function(el,config) {

        var sbsc = scrollbarSize();

		var container = el.parentNode;
		if (config.obscured) {
			if (! config.unstyledParent) el.parentNode.style.cssText = "position:absolute;left:0;right:0;top:0;bottom:0;overflow:hidden;";
			el.style.right = "-" + sbsc + "px";
			el.style.bottom = "-" + sbsc + "px";
			el.style.paddingRight = sbsc + "px";
			el.style.paddingBottom = sbsc + "px";
			container = container.parentNode;
		}
		return container;
	};

	EnhancedScrolled.prototype.refresh = function(el) {
		this.vert.trackScrolled(el);
		this.vert.update(el);
		this.horz.trackScrolled(el);
		this.horz.update(el);
	};

	EnhancedScrolled.prototype.layout = function(el,layout) {

		//TODO show scrollbars only if changed && in play
		if (!this.vert.shown) {
			this.vert.show();
			this.horz.show();
			if (!el.stateful("over") && !el.stateful("dragging")) {
				this.vert.delayedHide(750);
				this.horz.delayedHide(750);
			}
		}

		this.refresh(el);
		//TODO if movement happening update factors and max
	};

	EnhancedScrolled.prototype.discard = function(el) {
		if (this.vert) this.vert.destroy();
		if (this.horz) this.horz.destroy();
		delete this.vert;
		delete this.horz;

		callCleaners(el.parentNode); //TODO do this with the autodiscarder after it's removed from DOM
		callCleaners(el);
	};

	EnhancedScrolled.prototype.setContentHeight = function(h) {

	};

	function enhance_scrolled(el,role,config,context) {

		var contentTemplate = config.template;
		if (contentTemplate) {
			var template = Resolver("page::templates","null")([contentTemplate]);
			if (template == null) return false;

			var content = template.content.cloneNode(true);

			el.appendChild(content);
			var context = { layouter: this.parentLayouter };
			if (config.layouter) context.layouter = this; //TODO temp fix, move _prep to descriptor
			// essential("DescriptorQuery")(wrap).enhance();
			ApplicationConfig()._prep(el,context); //TODO prepAncestors
		}

		StatefulResolver(el,true);
		el.style.cssText = 'position:absolute;left:0;right:0;top:0;bottom:0;overflow:scroll;';
		var r = new EnhancedScrolled(el,config);

		return r;
	}
	pageResolver.set("handlers.enhance.scrolled",enhance_scrolled);

	function layout_scrolled(el,layout,instance) {
		instance.layout(el,layout);
	}
	pageResolver.set("handlers.layout.scrolled",layout_scrolled);
	
	function discard_scrolled(el,role,instance) {
		instance.discard(el);
		if (el.stateful) el.stateful.destroy();
	}
	pageResolver.set("handlers.discard.scrolled",discard_scrolled);
	
}();