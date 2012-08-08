module("Resolver tests");

test('Namespace and package creation',function(){
  	expect(6);
	var shapes = Resolver()("my.shapes");
	var tools = Resolver()("my.tools");

	Resolver().set("my.tools.X",5);
	equal(Resolver.default.namespace.my.tools.X,5, "Set number worked");
	equal(Resolver.default.namespace.my.shapes, shapes, "two level package works");
	equal(Resolver.default.namespace.my.tools, tools, "two level package works");
	equal(typeof Resolver.default.namespace.my, "object", "top level package created");

	Resolver("default").override({});
	equal(Resolver.default.namespace.my, undefined, "namespace replaced");

	Resolver()("my")
	notEqual(Resolver.default.namespace.my, undefined, "namespace replaced");

})

test('Resolve defined and undefined',function(){
	var resolver = Resolver({});

	equal(typeof resolver("a.b.c"),"object");
	equal(typeof resolver("d.e.f","generate"),"object");
	equal(resolver("g.h.i","null"),null);
	raises(function(){ resolver("j.k.l","throw") },"The 'j' part of 'j.k.l' couldn't be resolved.");
})

test('Resolver reference',function(){
  	expect(3);

	Resolver()("my")
	var my = Resolver().reference("my");
	notEqual(my(), undefined, "namespace replaced");
	notEqual(my.get(), undefined, "namespace replaced");

	var num = Resolver().reference("num");
	num.set(5);
	equal(num.get(),5);
})

		// Resolver("abc")
		// Resolver("abc",{})
		// Resolver("abc",{},{options})


// Resolver.hasGenerator

// mixinto
