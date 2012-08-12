test("Stateful element state",function(){
	var StatefulResolver = Resolver("essential")("StatefulResolver");

	var el = document.createElement("div");
	var stateful = StatefulResolver(el);

	ok(! stateful("state.disabled"));
	stateful.set("state.disabled",true);
	ok(el.disabled);

	// debugger;
	ok(! stateful("state.readOnly"));
	stateful.set("state.readOnly",true);
	ok(el.readOnly);

	ok(! stateful("state.hidden"));
	stateful.set("state.hidden",true);
	//equal(el.getAttribute("hidden"),"hidden");
	ok(el.hidden || (el.getAttribute("hidden") == "hidden"));
})