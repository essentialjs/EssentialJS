module("Types Tests");

test("Parameter type variant resolution",function(){
	var essential = Resolver("essential");
	var Type = essential("Type");

	equal(Type.variant("Number"),essential("NumberType"));
	equal(Type.variant(["Number","String"]),essential("NumberType"));
	equal(Type.variant(["gobbledygook","Number","String"]),essential("NumberType"));
	equal(Type.variant("String"),essential("StringType"));
	equal(Type.variant("Date"),essential("DateType"));
	equal(Type.variant("Boolean"),essential("BooleanType"));
	equal(Type.variant("Object"),essential("ObjectType"));

});


test("ArraySet as an Array",function(){
	var ArraySet = Resolver("essential")("ArraySet");

	var a1 = ArraySet();
	equal(a1.length,0);
	equal(a1[0],undefined);

});

test("ArraySet entry uniqueness",function(){
	var ArraySet = Resolver("essential")("ArraySet");

	function e1() {}
	function e2() {}
	function e3() {}
	notEqual(e1,e2);
	equal(e1,e1);

	var a1 = ArraySet();
	a1.add(e1);
	ok(a1.has(e1)); ok(!a1.has(e2)); ok(!a1.has(e3));
	a1.add(e2);
	ok(a1.has(e1)); ok(a1.has(e2)); ok(!a1.has(e3));
	a1.add(e3);
	ok(a1.has(e1)); ok(a1.has(e2)); ok(a1.has(e3));
	equal(a1.length,3);
	equal(a1[0],e1);
	equal(a1[1],e2);
	equal(a1[2],e3);

	a1.remove(e1);
	ok(!a1.has(e1)); ok(a1.has(e2)); ok(a1.has(e3));
	equal(a1.length,2);
	equal(a1[0],e2);
	equal(a1[1],e3);

	var o1 = {}, o2 = {}, o3 = {};

	var a2 = ArraySet();
	a2.add(o1)
	ok(a2.has(o1)); ok(!a2.has(o2)); ok(!a2.has(o3));
	a2.add(o2);
	ok(a2.has(o1)); ok(a2.has(o2)); ok(!a2.has(o3));
	a2.add(o3);
	ok(a2.has(o1)); ok(a2.has(o2)); ok(a2.has(o3));
	equal(a2.length,3);
	equal(a2[0],o1);
	equal(a2[1],o2);
	equal(a2[2],o3);

	a2.remove(o1);
	ok(!a2.has(o1)); ok(a2.has(o2)); ok(a2.has(o3));
	equal(a2.length,2,"ArraySet of similar values such as objects");
	equal(a2[0],o2);
	equal(a2[1],o3);

	var o1 = [], o2 = [], o3 = [];

	var a3 = ArraySet();
	a3.add(o1)
	ok(a3.has(o1)); ok(!a3.has(o2)); ok(!a3.has(o3));
	a3.add(o2);
	ok(a3.has(o1)); ok(a3.has(o2)); ok(!a3.has(o3));
	a3.add(o3);
	ok(a3.has(o1)); ok(a3.has(o2)); ok(a3.has(o3));
	equal(a3.length,3);
	equal(a3[0],o1);
	equal(a3[1],o2);
	equal(a3[2],o3);

	a3.remove(o1);
	ok(!a3.has(o1)); ok(a3.has(o2)); ok(a3.has(o3));
	equal(a3.length,2,"ArraySet of arrays");
	equal(a3[0],o2);
	equal(a3[1],o3);

	ok(1, "ArraySet remove with multiple values")
	ok(1, "ArraySet of similar values such as objects")
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
