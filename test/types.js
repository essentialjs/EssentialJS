module("Types Tests");

test("ArraySet as an Array",function(){
	var ArraySet = Resolver("essential")("ArraySet");

	var a1 = ArraySet();
	equal(a1.length,0);
	equal(a1[0],undefined);

});


test("DOMTokenList",function(){
	var DOMTokenList = Resolver("essential")("DOMTokenList");
	var ArraySet = Resolver("essential")("ArraySet");

	var dtl = DOMTokenList();
	//not possible: ok(dtl instanceof DOMTokenList);
	//not possible: ok(dtl instanceof ArraySet);
	ok(dtl instanceof Array);

	ok(!dtl.has("x"))
	dtl.add("x");
	ok(dtl.has("x"));
	dtl.remove("x");
	ok(!dtl.has("x"))
	dtl.toggle("x");
	ok(dtl.has("x"))
	equal(dtl.toString(),"x");
	dtl.remove("x");

	// additional API
	DOMTokenList.mixin(dtl,"a b c");
	equal(dtl.length,3);
	ok(dtl.has("a"));
	ok(dtl.has("b"));
	ok(dtl.has("c"));
	DOMTokenList.set(dtl,"d",true);
	equal(dtl.length,4);
})

test("mock el.classList",function(){
	var DOMTokenList = Resolver("essential")("DOMTokenList");

	var el = { "classList":DOMTokenList() };

	DOMTokenList.eitherClass(el,"true","false",true);
	ok(el.classList.has("true"));
	ok(el.classList.contains("true"));
	ok(!el.classList.has("false"));
	ok(!el.classList.contains("false"));
	equal(el.className,"true");
	
})
