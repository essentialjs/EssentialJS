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
	// debugger;
	DOMTokenList.mixin(dtl,"a b c");
	equal(dtl.length,3);
	DOMTokenList.set(dtl,"d",true);
	equal(dtl.length,4);
})
	// var DOMTokenList_eitherClass = essential("DOMTokenList.eitherClass");
	// var DOMTokenList_mixin = essential("DOMTokenList.mixin");
