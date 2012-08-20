module("Generator Tests");

test("Inherit from Builtin",function(){
	function _Test() {
		this.a = "a";

	}
	var Test = Generator(_Test,Array);

	var test = Test();
	ok(test.a);
});

