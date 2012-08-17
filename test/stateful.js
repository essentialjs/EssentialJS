module('stateful elements');

test("Stateful element state",function(){
	var StatefulResolver = Resolver("essential")("StatefulResolver");

	var el = document.createElement("div");
	var stateful = StatefulResolver(el);
	stateful.updateClass = true;

	ok(! stateful("state.disabled"));
	stateful.set("state.disabled",true);
	ok(el.disabled);
	// equal(el.className,"state-disabled");

	ok(! stateful("state.readOnly"));
	stateful.set("state.readOnly",true);
	ok(el.readOnly);
	// equal(el.className,"state-readOnly");

	ok(! stateful("state.hidden"));
	stateful.set("state.hidden",true);
	//equal(el.getAttribute("hidden"),"hidden");
	ok(el.hidden || (el.getAttribute("hidden") == "hidden"));
	// equal(el.className,"state-hidden");
})