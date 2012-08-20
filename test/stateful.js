module('stateful elements');

test ("Creating StatefulResolver",function(){
	var StatefulResolver = Resolver("essential")("StatefulResolver");

	// Create a new one
	var stateful = StatefulResolver();
	ok(stateful);

	var el = document.createElement("div");
	var stateful = StatefulResolver(el);
	equal(el.stateful,stateful);
})

test("Stateful element initial class",function(){

	var StatefulResolver = Resolver("essential")("StatefulResolver");

	var el = document.createElement("div");
	el.className = "a b c";
	var stateful = StatefulResolver(el,true);
	ok(el.classList);
	equal(el.classList[0],"a");
	equal(el.classList[1],"b");
	equal(el.classList[2],"c");
})

test("Stateful element state",function(){
	var StatefulResolver = Resolver("essential")("StatefulResolver");

	var el = document.createElement("div");
	var stateful = StatefulResolver(el,true);

	ok(! stateful("state.disabled"));
	stateful.set("state.disabled",true);
	ok(!el.disabled);
	equal(el.getAttribute("aria-disabled"),"disabled");
	equal(el.className,"state-disabled");
	stateful.set("state.disabled",false);
	ok(!el.disabled);
	equal(el.className,"");

	ok(! stateful("state.readOnly"));
	stateful.set("state.readOnly",true);
	ok(el.readOnly);
	equal(el.className,"state-readOnly");
	stateful.set("state.readOnly",false);
	ok(!el.readOnly);
	equal(el.className,"");

	ok(! stateful("state.hidden"));
	stateful.set("state.hidden",true);
	ok(el.hidden || (el.getAttribute("hidden") == "hidden"));
	equal(el.className,"state-hidden");
	stateful.set("state.hidden",false);
	ok(!el.hidden);
	equal(el.className,"");

	ok(! stateful("state.required"));
	stateful.set("state.required",true);
	ok(el.required || (el.getAttribute("required") == "required"));
	equal(el.getAttribute("aria-required"),"required");
	equal(el.className,"state-required");
	stateful.set("state.required",false);
	ok(!el.required);
	equal(el.getAttribute("required"),null);
	equal(el.className,"");
})

test("Stateful element state with custom class",function(){
	var StatefulResolver = Resolver("essential")("StatefulResolver");

	var el = document.createElement("div");
	var stateful = StatefulResolver(el,true);

	var mapClass = stateful("map.class");
	mapClass.state.disabled = "is-disabled";
	mapClass.notstate.disabled = "is-not-disabled";
	mapClass.state.hidden = "hide";
	mapClass.notstate.hidden = "show";

	ok(! stateful("state.disabled"));
	stateful.set("state.disabled",true);
	equal(el.className,"is-disabled");
	stateful.set("state.disabled",false);
	ok(!el.disabled);
	equal(el.className,"is-not-disabled");

	ok(! stateful("state.readOnly"));
	stateful.set("state.readOnly",true);
	equal(el.className,"is-not-disabled state-readOnly");
	stateful.set("state.readOnly",false);
	ok(!el.readOnly);
	equal(el.className,"is-not-disabled");

	ok(! stateful("state.hidden"));
	stateful.set("state.hidden",true);
	equal(el.className,"is-not-disabled hide");
	stateful.set("state.hidden",false);
	ok(!el.hidden);
	equal(el.className,"is-not-disabled show");
})



// action + button allows action to be disabled causing disable on button