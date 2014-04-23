(function(){
	var essential = Resolver("essential"),
		pageResolver = Resolver("page"),
		pageState = Resolver("page::state"),
		pageConnection = Resolver("page::connection"),
		pageModules = pageResolver.reference("modules");
		templates = pageResolver("templates"),
		ApplicationConfig = essential("ApplicationConfig"),
		EnhancedDescriptor = essential("EnhancedDescriptor"),
		DescriptorQuery = essential("DescriptorQuery"),
		Layouter = essential("Layouter"),
		Laidout = essential("Laidout"),
		log = essential("console")();

	/*
		Put your application code here
	*/

	function _CoreFactory() {
		log.log("constructed Core Factory");
	}

	var CoreFactory = Generator(_CoreFactory).restrict({ singleton: true, lifecycle: "page" });
	Resolver(window).set("app.factories.CoreFactory",CoreFactory);

	// role="presentation", enhanced after the initial page is rendered when frontend.js has been loaded.
	var PresentationLoader = Resolver(window).set("app.application.PresentationLoader",Generator(function(){
		log.log("constructed presentation loader");
	}));
	PresentationLoader.restrict({ singleton: true, lifecycle: "page" })

	PresentationLoader.enhance_presentation = function(el,role,config,context) 
	{
		log.log("enhancing presentation",el.uniqueID);
	};

	PresentationLoader.layout_presentation = function(el,layout,instance) 
	{
		log.log("layout presentation",el.uniqueID);
	};
	PresentationLoader.layout_presentation.throttle = 200;

	PresentationLoader.discard_presentation = function(el,role,instance) 
	{
		log.log("discard presentation",el.uniqueID);
		if (instance) {
			if (instance.onClose) {
				instance.onClose();
			}
		}
		try {
			// IE8 doesn't seem to like this
			el.innerHTML = "";
		} catch(ex) {}
	};

	Resolver("page").declare("handlers.enhance.presentation", PresentationLoader.enhance_presentation);
	Resolver("page").declare("handlers.layout.presentation", PresentationLoader.layout_presentation);
	Resolver("page").declare("handlers.discard.presentation", PresentationLoader.discard_presentation);

	//TODO role that requires permissions

	//TODO role that requires launching

	function frontend_post_loading() {
		// do things here that depends on all scripts and configs being loaded

		log.log("frontend_post_loading");

		// delayed receipt of the authorisation and permissions information.
		setTimeout(function(){
			pageState.set("authorised",true);
		},2000);
	}

	function frontend_launching() {
		//TODO apply secondary templates
		//TODO you can enable things here just before app is launched
	}

	// manage the loading of the application
	pageState.on("change",function(ev){
		switch(ev.symbol) {
			case "loading":
				if (ev.value == false) {
					// finish the loading of the frontend, now that scripts and config is loaded.
					if (pageState("configured")==false) frontend_post_loading();
					pageState.set("configured",true);
				}
				break;
			case "launching":
				if (ev.value == true) {
					frontend_launching();
					// give app and rendering time to settle
					var awaiting = setInterval(function() {
						var all = true, modules = Resolver("page::modules::");
						for(var n in modules) {
							if (modules[n] === null || modules === false) all = false;
						}
						if (all) {
							pageState.set("launched",true);
							pageState.set("launching",false);
							pageConnection.set("status","");
							pageConnection.set("loadingProgress","");
							clearInterval(awaiting);
						}
					},100);
					setTimeout(function(){
					},100);
				}
				break;
		}

	});

	pageModules.on("change",function(ev) {
		var awaiting = [];
		for(var n in ev.base) {
			if (ev.base[n] === false || ev.base[n] === null) {
				awaiting.push(n);
			}
		}
		if (awaiting.length) {
			pageConnection.set("status","awaiting");
			pageConnection.set("loadingProgress","awaiting: "+awaiting.join(" "));
		}
	});

Layouter.variant("multisection",Generator(function(key,el,conf) {
	this.el = el;
	this.sizing = el.stateful("sizing");

},Layouter,{ prototype: {
	"layout": function(el,layout,sizingEls) {

	var centered = [], after = [];
	this.sizing.centerWidth = el.offsetWidth;
	this.sizing.centerHeight = el.offsetHeight;

	var left=0,right=0,top=0,bottom=0;
	for(var i = 0, c; c = sizingEls[i]; ++i) {
		var sizing = c.stateful("sizing");

		// sizing.offset = offset;
		switch(sizing.glue) {
			case "left":
				c.style.left = left+"px";
				left += c.offsetWidth;
				this.sizing.centerWidth -= c.offsetWidth;
				break;
			case "right":
				after.unshift(c);
				break;
			case "top":
				c.style.top = top+"px";
				top += c.offsetHeight;
				this.sizing.centerHeight -= c.offsetHeight;
				break;
			case "bottom":
				after.unshift(c);
				break;
			default:
				centered.push(c);
				break;
		}
	}

	for(var i=0,c; c = after[i]; ++i) {
		var sizing = c.stateful("sizing");
		switch(sizing.glue) {
			case "right":
				c.style.right = right+"px";
				right += c.offsetWidth;
				this.sizing.centerWidth -= c.offsetWidth;
				break;
			case "bottom":
				c.style.bottom = bottom+"px";
				bottom += c.offsetHeight;
				this.sizing.centerHeight -= c.offsetHeight;
				break;
		}			
	}

	// log.log("multisection laid out",this.sizing,left,right);

	for(var i = 0, c; c = centered[i]; ++i) {
		c.style.left = left+"px";
		c.style.right = right+"px";
		c.style.top = top+"px";
		c.style.bottom = bottom+"px";
	}
	},

	childLayouterUpdated : function(layouter,el,layout) {},
	childLaidoutUpdated : function(laidout,el,layout) {
		return true;
	}

}}));

function section_button_click(ev) {
	ev = MutableEvent(ev).withActionInfo();

	if (ev.commandElement) {
		if (ev.stateful && ev.stateful("state.disabled")) return; // disable
		if (ev.ariaDisabled) return; //TODO fold into stateful

		ev.action = "sectioned"
		ev.actionElement = this;//TODO
		fireAction(ev);
		ev.stopPropagation();
	}
	if (ev.defaultPrevented) return false;
}

Laidout.variant("section",Generator(function(key,el,conf,parent) {
	this.el = el;

	this.el.stateful.set("sizing.glue",conf.glue);


	// addEventListeners(el, {
	// 	"click": section_button_click
	// },false);

	// el.stateful.reference("state.expanded").on("change",layouter.updateAccordion.bind(layouter));

	//TODO do this on mainContent
	// this.el.style.visibility = el.stateful("state.expanded")? "visible":"hidden";
	// el.stateful.reference("state.expanded").on("change",this.updateExpanded.bind(this));
},Laidout,{
	"prototype": {
		"updateExpanded": function(ev) {
			//TODO make configurable on laidout/layouter
			// this.el.style.visibility = ev.value? "visible":"hidden";
		}
	}
}));

	function EnhancedTable(el,role,config) {
		this.el = el;
		this.body = el.getElementsByTagName("TBODY")[0];

		this.defaultRowHeight = (this.body.children[0].offsetHeight + this.body.children[1].offsetHeight)/2;
		this.rowHeights = [];

		var desc = DescriptorQuery(el.parentNode)[0]; //EnhancedDescriptor(el.parentNode);
		if (desc && desc.role == "scrolled") {
			if (desc.conf.nativeScrollVert == false) {
				this.scrolled = desc;
				this._bodyHeight(desc);
				this._enableVertScrolling(desc);
			}

		}
	}

	EnhancedTable.prototype._bodyHeight = function(desc) 
	{
		this.nonScrolledHeight = desc.el.scrollHeight - this.body.offsetHeight;
		for(var i=0; i<this.body.children.length; ++i) {
			var rowHeight = this.body.children[i].offsetHeight;
			if (rowHeight || this.rowHeights[i]==undefined) this.rowHeights[i] = rowHeight;
		}
	};

	EnhancedTable.prototype._enableVertScrolling = function(desc)
	{
		desc.stateful.on("change","pos.scrollTop",this,function(ev) {
			// log.log("vert offset",ev.value);
			ev.data._showRows(ev.value,desc.stateful);
		});

		this._showRows(0,desc.stateful);

		desc.instance.vert.trackScrolled(desc.el);
		desc.instance.vert.update(desc.el);

	};

	EnhancedTable.prototype._showRows = function(offset,stateful) 
	{
		var height = this.scrolled.el.offsetHeight - this.nonScrolledHeight,
			contentOffset = this.nonScrolledHeight;

		for(var i=0,c; c = this.body.children[i]; ++i) {
			var rowHeight = this.rowHeights[i];

			// before to show
			if (contentOffset < offset) {
				c.style.display = "none";
			} else if (contentOffset < offset+height) {
				c.style.display = "";

			} else {
				c.style.display = "none";
			}
			contentOffset += rowHeight;
		}

		var scrollHeight = this.nonScrolledHeight + rowHeight * this.body.children.length;
		stateful.set("pos.scrollHeight",scrollHeight);
	};



	function enhance_table(el,role,config,context)
	{
		log.log("Enhancing table",el.uniqueID);
		return new EnhancedTable(el,role,config);

	}

	function sizing_table(el,sizing,instance)
	{

	}

	function layout_table(el,layout,instance)
	{
		if (instance.scrolled) {
			instance.scrolled.stateful.set("pos.scrollHeight",el.offsetHeight);
			instance._showRows(instance.scrolled.stateful("pos.scrollTop") ,instance.scrolled.stateful);
		}
	}

	function discard_table(el,role,instance)
	{
		log.log("Discarding table",el.uniqueID);
	}

	Resolver("page").declare("handlers.enhance.table", enhance_table);
	Resolver("page").declare("handlers.sizing.table", sizing_table);
	Resolver("page").declare("handlers.layout.table", layout_table);
	Resolver("page").declare("handlers.discard.table", discard_table);


	function enhance_adorned(el,role,config,context) 
	{
		var wrapper = document.createElement("DIV");
		wrapper.className = config.contentClass || config["content-class"] || "content";
		for(var c = el.firstChild; c;) {
			var next = c.nextSibling, adornment,rel;
			if (c.attributes) {adornment = c.getAttribute("data-adornment"); rel = c.getAttribute("rel");}
			if (adornment || rel == "adornment") {
				// adornment
			}
			else wrapper.appendChild(c);
			c = next;
		}
		el.appendChild(wrapper);

		return {
			applyWidth: config.width,
			applyHeight: config.height,
			wrapper:wrapper,
			wrapperPlacement: essential("ElementPlacement")(wrapper)
		};
	}

	function sizing_adorned(el,sizing,instance)
	{
		var width = instance.wrapper.offsetWidth,
			height = instance.wrapper.offsetHeight;
		
		var placement = instance.wrapperPlacement;
		placement.compute();

		if (placement.style.visibility == "hidden") {
			width = 0;
			height = 0;
		}

		width += parseInt(placement.style.marginLeft); //TODO compute
		width += parseInt(placement.style.marginRight); //TODO compute

		sizing.contentWidth = width;
	};

	function layout_adorned(el,layout,instance) 
	{
		el.style.width = layout.contentWidth + "px";

		// el.style.height = height + "px";
	}
	layout_adorned.throttle = 200;

	function discard_adorned(el,role,instance) 
	{
		if (instance) {
			// if (instance.onClose) {
			// 	instance.onClose();
			// }
		}
		try {
			// IE8 doesn't seem to like this
			el.innerHTML = "";
		} catch(ex) {}
	}

	Resolver("page").declare("handlers.enhance.adorned", enhance_adorned);
	Resolver("page").declare("handlers.sizing.adorned", sizing_adorned);
	Resolver("page").declare("handlers.layout.adorned", layout_adorned);
	Resolver("page").declare("handlers.discard.adorned", discard_adorned);

	// already defined
	// function enhance_dialog(el,role,config,context) 
	// {
	// 	alert("role")
	// }

	// function sizing_dialog(el,sizing,instance)
	// {

	// }

	// function layout_dialog(el,layout,instance) 
	// {

	// }

	// function discard_dialog(el,role,instance) 
	// {

	// }


	// Resolver("page").declare("handlers.enhance.dialog", enhance_dialog);
	// Resolver("page").declare("handlers.sizing.dialog", sizing_dialog);
	// Resolver("page").declare("handlers.layout.dialog", layout_dialog);
	// Resolver("page").declare("handlers.discard.dialog", discard_dialog);

	log.log("frontend.js finished load execution");

})();
