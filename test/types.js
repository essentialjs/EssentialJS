module("Types Tests");

test("ArraySet as an Array",function(){
	var ArraySet = Resolver("essential")("ArraySet");

	var a1 = ArraySet();
	equal(a1.length,0);
	equal(a1[0],undefined);

});

