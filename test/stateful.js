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

test("Stateful element state",function(){
	var StatefulResolver = Resolver("essential")("StatefulResolver");

	var el = document.createElement("div");
	var stateful = StatefulResolver(el);
	stateful.updateClass = true;

	ok(! stateful("state.disabled"));
	stateful.set("state.disabled",true);
	ok(el.disabled);
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
	//equal(el.getAttribute("hidden"),"hidden");
	ok(el.hidden || (el.getAttribute("hidden") == "hidden"));
	equal(el.className,"state-hidden");
})


// action + button allows action to be disabled causing disable on button