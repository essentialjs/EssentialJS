module('stateful elements');

test ("Creating StatefulResolver",function(){
	var StatefulResolver = Resolver("essential::StatefulResolver::");

	// Create a new one
	var stateful = StatefulResolver();
	ok(stateful);

	var el = document.createElement("div");
	var stateful = StatefulResolver(el);
	equal(el.stateful,stateful);
})

test("Destroying StatefulResolver",function(){
	var StatefulResolver = Resolver("essential::StatefulResolver::");

	// Create a new one
	var stateful = StatefulResolver();
	ok(stateful);
	stateful.destroy();
	ok(1, "TODO any teardown?")

	ok(1,"TODO cleaner");
});

// test("Discarding StatefulResolver")

test("Stateful element initial class",function(){
	var StatefulResolver = Resolver("essential::StatefulResolver::");

	var el = document.createElement("div");
	el.className = "a b c";
	var stateful = StatefulResolver(el,true);
	ok(el.classList);
	equal(el.classList[0],"a");
	equal(el.classList[1],"b");
	equal(el.classList[2],"c");
})

test("Initial stateful element state",function() {
	var StatefulResolver = Resolver("essential::StatefulResolver::");
	var HTMLElement = Resolver("essential::HTMLElement::");

	var el = HTMLElement("div",{},
		'<input type="checkbox" name="a">',
		'<input type="checkbox" name="b" checked>',
		'<input type="checkbox" name="c" aria-checked="checked">',

		'<span aria-checked="checked"></span>',
		'<span aria-expanded="false"></span>',
		'<span aria-expanded="true"></span>',
		'<span aria-expanded="expanded"></span>',
		
		'<span disabled></span>',
		'<span aria-disabled="false"></span>',
		'<span aria-disabled="true"></span>',

		'<select><option>A</option><option selected>B</option></select>',
		// row gridcell

		'<button role="tab">Tab</button>',
		'<button role="tab" aria-selected="selected">Tab</button>',
		'<button role="tab" aria-selected="true">Tab</button>',

		'<input required="required">',
		'<input aria-required="true" aria-invalid="true">',
		'<input aria-invalid="other">',
		'<input hidden="hidden">',
		'<input aria-hidden="true">',

		'<button aria-pressed="true"></button>',
		'<button aria-pressed="false"></button>',
		'<button></button>',

		'');
	var statefulDiv = StatefulResolver(el,true);

	equal(statefulDiv("state.disabled","undefined"),false);
	equal(statefulDiv("state.readOnly","undefined"),false);
	equal(statefulDiv("state.hidden","undefined"),false);
	equal(statefulDiv("state.required","undefined"),false);
	equal(statefulDiv("state.expanded","undefined"),undefined);
	equal(statefulDiv("state.checked","undefined"),undefined);

	equal(StatefulResolver(el.firstChild,true)("state.checked","undefined"),false,"checked");
	equal(StatefulResolver(el.childNodes[1],true)("state.checked","undefined"),true);
	// equal(StatefulResolver(el.childNodes[2],true)("state.checked"),true); TODO should aria transfer to checked state
	equal(StatefulResolver(el.childNodes[3],true)("state.checked","undefined"),true);

	equal(StatefulResolver(el.childNodes[4],true)("state.expanded","undefined"),false,"expanded");
	equal(StatefulResolver(el.childNodes[5],true)("state.expanded","undefined"),true);
	equal(StatefulResolver(el.childNodes[6],true)("state.expanded","undefined"),true);

	equal(StatefulResolver(el.childNodes[7],true)("state.disabled","undefined"),true,"disabled");
	equal(StatefulResolver(el.childNodes[8],true)("state.disabled","undefined"),false);
	equal(StatefulResolver(el.childNodes[9],true)("state.disabled","undefined"),true);

	equal(el.childNodes[10].tagName,"SELECT");
	equal(StatefulResolver(el.childNodes[10].firstChild,true)("state.selected","undefined"),false,"selected");
	equal(StatefulResolver(el.childNodes[10].firstChild.nextSibling,true)("state.selected","undefined"),true,"selected option 2");

	// debugger;
	equal(el.childNodes[11].tagName,"BUTTON");
	equal(StatefulResolver(el.childNodes[11],true)("state.selected","undefined"),false);
	equal(el.childNodes[12].tagName,"BUTTON");
	equal(StatefulResolver(el.childNodes[12],true)("state.selected","undefined"),true);
	equal(el.childNodes[13].tagName,"BUTTON");
	equal(StatefulResolver(el.childNodes[13],true)("state.selected","undefined"),true,"button with aria-selected=true");

	//TODO role: gridcell row tab

	equal(el.childNodes[14].tagName,"INPUT");
	equal(StatefulResolver(el.childNodes[14])("state.required","undefined"),true);
	equal(StatefulResolver(el.childNodes[15])("state.required","undefined"),true);
	equal(StatefulResolver(el.childNodes[15])("state.invalid","undefined"),true);
	equal(StatefulResolver(el.childNodes[16])("state.required","undefined"),false);
	equal(StatefulResolver(el.childNodes[16])("state.hidden","undefined"),false);
	equal(StatefulResolver(el.childNodes[16])("state.invalid","undefined"),true);
	//TODO combobox gridcell listbox radiogroup spinbutton textbox tree

	equal(el.childNodes[17].tagName,"INPUT");
	equal(StatefulResolver(el.childNodes[17])("state.hidden","undefined"),true);
	equal(StatefulResolver(el.childNodes[18])("state.hidden","undefined"),true);

	equal(el.childNodes[19].tagName,"BUTTON");
	equal(StatefulResolver(el.childNodes[19])("state.pressed","undefined"),true);
	equal(StatefulResolver(el.childNodes[20])("state.pressed","undefined"),false);
	equal(StatefulResolver(el.childNodes[21])("state.pressed","undefined"),false);

	// tristate ?

})

		//TODO aria-hidden all elements http://www.w3.org/TR/wai-aria/states_and_properties#aria-hidden
		//TODO aria-invalid all elements http://www.w3.org/TR/wai-aria/states_and_properties#aria-invalid


test("Stateful element state",function(){
	var StatefulResolver = Resolver("essential::StatefulResolver::");

	var el = document.createElement("div");
	var stateful = StatefulResolver(el,true);

	ok(! stateful("state.disabled","undefined"),"disabled undefined");
	stateful.set("state.disabled",true);
	if (navigator.userAgent.indexOf(" MSIE ") == -1) ok(!el.disabled,"The disabled property should not be applied to avoid IE styling");
	equal(el.getAttribute("aria-disabled"),"disabled");
	equal(el.className,"state-disabled");
	stateful.set("state.disabled",false);
	ok(!el.disabled,"The disabled property should still be unaffected");
	equal(el.className,"");

	ok(! stateful("state.readOnly","undefined"),"readOnly undefined");
	stateful.set("state.readOnly",true);
	ok(el.readOnly);
	equal(el.className,"state-readOnly");
	stateful.set("state.readOnly",false);
	ok(!el.readOnly);
	equal(el.className,"");

	ok(! stateful("state.hidden","undefined"),"hidden undefined");
	stateful.set("state.hidden",true);
	ok(el.hidden || (el.getAttribute("hidden") == "true"));
	equal(el.className,"state-hidden");
	stateful.set("state.hidden",false);
	ok(!el.hidden);
	equal(el.className,"");

	ok(! stateful("state.required","undefined"),"required undefined");
	stateful.set("state.required",true);
	ok(el.required || (el.getAttribute("required") == "true"));
	equal(el.getAttribute("aria-required"),"true");
	equal(el.className,"state-required");
	stateful.set("state.required",false);
	ok(!el.required);
	equal(el.getAttribute("required"),null);
	equal(el.className,"");

	ok(! stateful("state.selected","undefined"));
	stateful.set("state.selected",true);
	ok((el.getAttribute("aria-selected") == "true"));
	// equal(el.className,"state-selected");
	stateful.set("state.selected",false);
	equal(el.getAttribute("aria-selected"),null);
	// ok(!el.selected);
	// equal(el.className,"");

	//TODO role: option tab gridcell row


	ok(! stateful("state.pressed","undefined"));
	stateful.set("state.pressed",true);
	ok((el.getAttribute("aria-pressed") == "true"));
	// equal(el.className,"state-pressed");
	stateful.set("state.pressed",false);
	equal(el.getAttribute("aria-pressed"),null);



	ok(! stateful("state.expanded","undefined"));
	stateful.set("state.expanded",true);
	ok(el.expanded || (el.getAttribute("expanded") == "true"));
	equal(el.getAttribute("aria-expanded"),"true");
	equal(el.className,"state-expanded");
	stateful.set("state.expanded",false);
	ok(!el.required);
	equal(el.getAttribute("expanded"),null);
	equal(el.className,"");
})

test("Stateful element state with custom class",function(){
	var StatefulResolver = Resolver("essential::StatefulResolver::");

	var el = document.createElement("div");
	var stateful = StatefulResolver(el,true);

	var mapClass = stateful("map.class");
	mapClass.state.disabled = "is-disabled";
	mapClass.notstate.disabled = "is-not-disabled";
	mapClass.state.hidden = "hide";
	mapClass.notstate.hidden = "show";

	ok(! stateful("state.disabled","undefined"));
	stateful.set("state.disabled",true);
	equal(el.className,"is-disabled");
	stateful.set("state.disabled",false);
	ok(!el.disabled);
	equal(el.className,"is-not-disabled");

	ok(! stateful("state.readOnly","undefined"));
	stateful.set("state.readOnly",true);
	equal(el.className,"is-not-disabled state-readOnly");
	stateful.set("state.readOnly",false);
	ok(!el.readOnly);
	equal(el.className,"is-not-disabled");

	ok(! stateful("state.hidden","undefined"));
	stateful.set("state.hidden",true);
	equal(el.className,"is-not-disabled hide");
	stateful.set("state.hidden",false);
	ok(!el.hidden);
	equal(el.className,"is-not-disabled show");
})

test("Stateful element state with odd classes",function(){
	var StatefulResolver = Resolver("essential::StatefulResolver::");

	var el = document.createElement("div");
	var stateful = StatefulResolver(el,true);

	var mapClass = stateful("map.class");
	mapClass.state.disabled = "is-disabled";
	mapClass.state.hidden = "hide";
	mapClass.notstate.disabled = undefined;
	mapClass.notstate.hidden = undefined;

	stateful.set("state.disabled",false);
	equal(el.className,"")
	stateful.set("state.disabled",true);
	equal(el.className,"is-disabled")
	stateful.set("state.disabled",false);
	equal(el.className,"")

	stateful.set("state.hidden",false);
	equal(el.className,"");
	stateful.set("state.hidden",true);
	equal(el.className,"hide");
	stateful.set("state.hidden",false);
	equal(el.className,"");


	var mapClass = stateful("map.class");
	mapClass.state.disabled = undefined;
	mapClass.state.hidden = undefined;
	mapClass.notstate.disabled = "is-not-disabled";
	mapClass.notstate.hidden = "show";

	stateful.set("state.disabled",true);
	equal(el.className,"")
	stateful.set("state.disabled",false);
	equal(el.className,"is-not-disabled")
	stateful.set("state.disabled",true);
	equal(el.className,"")

	stateful.set("state.hidden",true);
	equal(el.className,"");
	stateful.set("state.hidden",false);
	equal(el.className,"show");
	stateful.set("state.hidden",true);
	equal(el.className,"");
})

test("Stateful element custom state ",function(){
	var StatefulResolver = Resolver("essential::StatefulResolver::");

	var el = document.createElement("div");

	// debugger;

	var stateful = StatefulResolver(el,true);
	var mapClass = stateful("map.class");
	mapClass.state.transitioning = "transitioning";
	mapClass.state.authenticated = "authenticated";
	mapClass.notstate.authenticated = "login";
	mapClass.state.loading = "loading";
	mapClass.state.launched = "launched";
	mapClass.state.livepage = "livepage";
	mapClass.state.loginError = "login-error";
	StatefulResolver.updateClass(stateful,el);

	equal(el.className,"login");

	ok(! stateful("state.transitioning","undefined"));
	stateful.set("state.transitioning",true);
	equal(el.className,"login transitioning");
	stateful.set("state.transitioning",false);
	equal(el.className,"login");

	ok(! stateful("state.authenticated","undefined"));
	stateful.set("state.authenticated",true);
	equal(el.className,"authenticated");

	ok(! stateful("state.loading","undefined"));
	stateful.set("state.loading",true);
	equal(el.className,"authenticated loading");
	stateful.set("state.loading",false);

	ok(! stateful("state.loginError","undefined"));
	stateful.set("state.loginError",true);
	equal(el.className,"authenticated login-error");
	stateful.set("state.loginError",false);

	ok(! stateful("state.launched","undefined"));
	stateful.set("state.launched",true);
	equal(el.className,"authenticated launched");
	stateful.set("state.launched",false);

	ok(! stateful("state.livepage","undefined"));
	stateful.set("state.livepage",true);
	equal(el.className,"authenticated livepage");
	stateful.set("state.livepage",false);

});

test("Stateful element template class", function() {
	var StatefulResolver = Resolver("essential::StatefulResolver::");

	var el = document.createElement("div");

	var stateful = StatefulResolver(el,true);
	var mapClass = stateful("map.class");
	mapClass.state.stage = "%-stage";
	StatefulResolver.updateClass(stateful,el);

	ok(! stateful("state.stage","undefined"));
	stateful.set("state.stage","initial");
	equal(el.className,"initial-stage");

	stateful.set("state.stage","second");
	equal(el.className,"second-stage");

	stateful.set("state.stage",null);
	equal(el.className,"");

	// mapClass.notstate.other2 = "other";
	// stateful.set("state.other2",false);
	// StatefulResolver.updateClass(stateful,el);
	// equal(el.className,"other");
});



// action + button allows action to be disabled causing disable on button

// field.disabled
// field.hidden

// action.disabled
// action.hidden

function Model() {
	this.firstName = ModelField("Mike");
	this.lastName = ModelField("Malone");

	'<span data-bind="model.firstName"></span>'+'<span data-bind="model.lastName"></span>';
}
