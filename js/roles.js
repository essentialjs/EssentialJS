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
		DocumentRoles = essential("DocumentRoles"),
		pageResolver = Resolver("page"),
		templates = pageResolver("templates"),
		fireAction = essential("fireAction"),
		scrollbarSize = essential("scrollbarSize"),
		baseUrl = location.href.substring(0,location.href.split("?")[0].lastIndexOf("/")+1),
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


	DocumentRoles.enhance_dialog = function (el,role,config) {
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

	DocumentRoles.layout_dialog = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_dialog = function (el,role,instance) {
	};

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

	DocumentRoles.enhance_toolbar = function(el,role,config) {
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

	DocumentRoles.layout_toolbar = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_toolbar = function(el,role,instance) {
		
	};

	// menu, menubar
	DocumentRoles.enhance_navigation = 
	DocumentRoles.enhance_menu = DocumentRoles.enhance_menubar = DocumentRoles.enhance_toolbar;

	DocumentRoles.enhance_sheet = function(el,role,config) {
		
		return {};
	};

	DocumentRoles.layout_sheet = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_sheet = function(el,role,instance) {
		
	};

	DocumentRoles.enhance_spinner = function(el,role,config) {
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

	DocumentRoles.layout_spinner = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_spinner = function(el,role,instance) {
		instance.stop();
		el.innerHTML = "";
	};
	
	function _lookup_generator(name,resolver) {
		var constructor = Resolver(resolver || "default")(name,"null");
		
		return constructor? Generator(constructor) : null;
	}

	DocumentRoles.enhance_application = function(el,role,config) {
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

	DocumentRoles.layout_application = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_application = function(el,role,instance) {
		
	};

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

	// Templates

	function Template(el) {
		this.tagName = el.tagName;
		this.html = el.innerHTML;
		//TODO content = DocumentFragment that can be cloned and appendChild
	}

	function enhance_template(el,role,config) {
		var id = config.id || el.id;
		var template = templates[id] = new Template(el);
		return template;
	}
	pageResolver.set("handlers.enhance.template",enhance_template);

	DocumentRoles.init_template = function(el,role,config) {
		this.contentManaged = true; // template content skipped
	};
	pageResolver.set("handlers.init.template",DocumentRoles.init_template);

	DocumentRoles.init_templated = function(el,role,config) {
		this.contentManaged = true; // templated content skipped
	};

/* TODO support on EnhancedDescriptor
function enhance_templated(el,role,config) {
	if (config.template && templates[config.template]) {
		var template = templates[config.template];
		//TODO replace element with template.tagName, mixed attributes and template.html
		el.innerHTML = template.html; //TODO better
		var context = { layouter: this.parentLayouter };
		if (config.layouter) context.layouter = this; //TODO temp fix, move _prep to descriptor
		ApplicationConfig()._prep(el,context); //TODO prepAncestors
		// var descs = branchDescs(el); //TODO manage descriptors as separate branch?
		// DocumentRoles()._enhance_descs(descs);
	}
}

pageResolver.set("handlers.enhance.templated",enhance_templated);
*/

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

			if (el.stateful("pos.scrollVert")) el.stateful.set("pos.scrollTop",el.scrollTop);
			if (el.stateful("pos.scrollHorz")) el.stateful.set("pos.scrollLeft",el.scrollLeft);
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

			if (this.stateful("pos.scrollVert")) {
				// native scrolling default works fine
			} else {
				if (ev.deltaY != 0) {
					var max = Math.max(0, this.stateful("pos.scrollHeight") - this.offsetHeight);
					var top = this.stateful("pos.scrollTop");
					// console.log("vert delta",ev.deltaY, top, max, this.stateful("pos.scrollHeight"),this.offsetHeight);
					top = Math.min(max,Math.max(0, top - ev.deltaY));
					this.stateful.set("pos.scrollTop",top);
					prevent = true;
				}
			}

			if (this.stateful("pos.scrollHorz")) { // native scrolling?
				// native scrolling default works fine
			} else {
				if (ev.deltaX != 0) {
					var max = Math.max(0,this.stateful("pos.scrollWidth") - this.offsetWidth);
					var left = this.stateful("pos.scrollLeft");
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

	/*
		The user operation of moving an element within the existing parent element.
	*/
	function ElementMovement() {
	}

	ElementMovement.prototype.track = function(ev) {

	};

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
		document.onselectstart = function(ev) { return false; };

		//TODO capture in IE
		//movement.track(event,0,0);

		if (el.stateful) el.stateful.set("dragging",true);

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
			"mouseup": function(ev) {
				movement.end();
			}
		};
		addEventListeners(document.body,this.drag_events);

		activeMovement = this;

		return this;
	};

	ElementMovement.prototype.end = function() {
		if (this.el.stateful) this.el.stateful.set("dragging",false);
		removeEventListeners(document.body,this.drag_events);

		delete document.onselectstart ;

		activeMovement = null;

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
		movement.startY = scrolled.stateful("pos.scrollTop");
		movement.startX = scrolled.stateful("pos.scrollLeft");
		movement.factorY = scrolled.stateful("pos.scrollHeight") / movement.el.offsetHeight;
		movement.maxY = scrolled.stateful("pos.scrollHeight") - scrolled.clientHeight;
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
		movement.startY = scrolled.stateful("pos.scrollTop");
		movement.startX = scrolled.stateful("pos.scrollLeft");
		movement.factorX = scrolled.stateful("pos.scrollWidth") / movement.el.offsetWidth;
		movement.maxY = scrolled.stateful("pos.scrollWidth") - scrolled.clientWidth;
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
			this.scrolledTo = this.scrolled.stateful("pos.scroll"+this.posName);
			this.scrolledContentSize = this.scrolled.stateful("pos.scroll"+this.sizeName);
		}
		this.scrolledSize = el["client"+this.sizeName]; //scrolled.offsetHeight - scrollbarSize();
	};

	EnhancedScrollbar.prototype.update = function(scrolled) {
		this.el.lastChild.style[this.posStyle] = (100 * this.scrolledTo / this.scrolledContentSize) + "%";
		this.el.lastChild.style[this.sizeStyle] = (100 * this.scrolledSize / this.scrolledContentSize) + "%";
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

	DocumentRoles.enhance_scrolled = function(el,role,config) {
		if (config.template && templates[config.template]) {
			var template = templates[config.template];
			//TODO replace element with template.tagName, mixed attributes and template.html
			el.innerHTML = template.html; //TODO better
			var context = { layouter: this.parentLayouter };
			if (config.layouter) context.layouter = this; //TODO temp fix, move _prep to descriptor
			ApplicationConfig()._prep(el,context); //TODO prepAncestors
			// var descs = branchDescs(el); //TODO manage descriptors as separate branch?
			// DocumentRoles()._enhance_descs(descs);
		}

		StatefulResolver(el,true);
		el.style.cssText = 'position:absolute;left:0;right:0;top:0;bottom:0;overflow:scroll;';
		var r = new EnhancedScrolled(el,config);

		return r;
	};

	DocumentRoles.layout_scrolled = function(el,layout,instance) {
		instance.layout(el,layout);
	};
	
	DocumentRoles.discard_scrolled = function(el,role,instance) {
		instance.discard(el);
		if (el.stateful) el.stateful.destroy();
	};
	
}();