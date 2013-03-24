/*jslint white: true */
!function () {

	var essential = Resolver("essential"),
		panel_layout = Resolver("layout-panel",{}),

		DocumentRoles = essential("DocumentRoles");


	function drop_plan(ev,overElement) {

		return {

		};
	}

function _lookup_generator(name,resolver) {
	var constructor = Resolver(resolver || "default")(name,"null");
	
	return constructor? Generator(constructor) : null;
}


function DragOperation() {

}


function _TabPanel(el,role,config) {
	this.el = el;
	this.config = config;

	this.sizing = {};
	this.el.stateful.set("sizing",this.sizing);
	this.groupLayout = this._parentGroup().stateful("groupLayout");
	//TODO this.sizing.logical = this.groupLayout.panelSizes.pop();

	el.addEventListener("dragstart",this.dragstart.bind(this));
	console.log("panel",el);
}
var TabPanel = panel_layout.declare("TabPanel",Generator(_TabPanel));

TabPanel.prototype.destroy = function() {
	// stop listener
	this.el = undefined;
	this.config = undefined;
};

TabPanel.prototype.layout = function(el,layout) {
};

TabPanel.prototype._parentGroup = function() {
	var el = this.el.parentNode;
	while(el) {
		if (el.stateful && el.stateful("groupLayout")) return el;
		el = el.parentNode;
	} 
};

TabPanel.prototype.dragstart = function() {
	// dragmove, dragend
};

function _PanelGroup(el,role,config) {
	this.el = el;
	this.config = config;

	this.sizing = {};
	this.el.stateful.set("sizing",this.sizing);

	this.groupLayout = {
		type: (config.type || "horizontal"),
		sizes: (config.sizes || []),
		sizesSum: 0
	};
	this.el.stateful.set("groupLayout",this.groupLayout);
}
var PanelGroup = panel_layout.declare("PanelGroup",Generator(_PanelGroup));

PanelGroup.prototype._fix_logical_sizing = function(layoutChildren) {
	this.groupLayout.sizesSum = 0;
	for(var i=0,v; v = this.groupLayout.sizes[i]; ++i) this.groupLayout.sizesSum += v;
	var avgSize = this.groupLayout.sizes.length? Math.floor(this.groupLayout.sizesSum/this.groupLayout.sizes.length) : 100;

	var horizontal = (this.groupLayout.type == "horizontal");

	for(var i = 0, c; c = layoutChildren[i]; ++i) {
		var sizing = c.stateful("sizing");
		var logical = this.groupLayout.sizes[i];
		if (!logical) {
			logical = avgSize;
			this.groupLayout.sizesSum += avgSize;
		}
		sizing.logical = logical;

		// steady styling (TODO support doing via stylesheets)
		if (horizontal) {
			c.style.top = 0;
			c.style.bottom = 0;
		} else {
			c.style.left = 0;
			c.style.right = 0;
		}
		c.style.position = "absolute";
	}
	if (layoutChildren.length < this.groupLayout.sizes.length) this.groupLayout.sizes.length = layoutChildren.length;
};

PanelGroup.prototype.layout = function(el,layout) {

	var layoutChildren = [];
	for(var c = this.el.firstElementChild || this.el.firstChild; c; c = c.nextElementSibling || c.nextSibling) {
		var sizing = c.stateful? c.stateful("sizing") : null; // group or panel
		if (sizing) layoutChildren.push(c);
	}

	if (!this.logicalFixed) {
		this._fix_logical_sizing(layoutChildren);
		this.logicalFixed = true;
	}

	var offset = 0, horizontal = (this.groupLayout.type == "horizontal");
	for(var i = 0, c; c = layoutChildren[i]; c = ++i) {
		var sizing = c.stateful("sizing");

		sizing.offset = offset;
		if (horizontal) {
			sizing.size = Math.floor(sizing.logical / this.groupLayout.sizesSum * layout.width);
			c.style.left = offset + "px";
			c.style.width = sizing.size + "px";
			offset += sizing.size;
		} else {
			sizing.size = Math.floor(sizing.logical / this.groupLayout.sizesSum * layout.height);
			c.style.top = offset + "px";
			c.style.height = sizing.size + "px";
			offset += sizing.size;
		}
	}
};

PanelGroup.prototype.hide = function(el,layout) {

};

PanelGroup.prototype.destroy = function() {
	this.el = undefined;
};


// ENHANCING

function enhance_tabpanel(el,role,config) {
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
	else {
		var instance = TabPanel(el,role,config);

		return instance;
	}
}

function layout_tabpanel(el,layout,instance) {
	instance.layout(el,layout);	
}

function discard_tabpanel(el,role,instance) {
	if (instance.destroy) instance.destroy();
}

DocumentRoles.enhance_tabpanel = enhance_tabpanel, DocumentRoles.layout_tabpanel = layout_tabpanel, DocumentRoles.discard_tabpanel = discard_tabpanel;

function enhance_panelgroup(el,role,config) {
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
	else {
		var instance = PanelGroup(el,role,config);

		return instance;
	}
	
	return {};
}

function layout_panelgroup(el,layout,instance) {
	if (layout.displayed) instance.layout(el,layout);	
	else instance.hide(el,layout);

}

function discard_panelgroup(el,role,instance) {
	
}

DocumentRoles.enhance_panelgroup = enhance_panelgroup, DocumentRoles.layout_panelgroup = layout_panelgroup, DocumentRoles.discard_panelgroup = discard_panelgroup;

}();	