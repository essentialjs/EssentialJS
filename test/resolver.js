module("Resolver tests");

test ("Anonymous resolver",function(){
	var r = Resolver({});
	r.set("a","a");
	equal(Resolver()("a","undefined"),undefined);
})

test ("Named resolver",function(){
	var r = Resolver("A",{});
	r.set("a","a");
	equal(Resolver()("a","undefined"),undefined);
	equal(r,Resolver("A"));

	var r = Resolver({},{name:"B"});
	r.set("a","a");
	equal(Resolver()("a","undefined"),undefined);
	equal(r,Resolver("B"));
	notEqual(r,Resolver("A"));
})

test("Window resolver",function(){
	var win = Resolver(window);

	equal(win.namespace,window);
	equal(win("Array"),Array);
	equal(win("Boolean"),Boolean);
	equal(win("self"),window);

	win.set("global_api.a.b.func",function(){ return "return"});
	equal(global_api.a.b.func(),"return");
})

test("Document resolver",function(){
	var doc = Resolver(document);

	equal(doc.namespace,document);
	equal(doc("all"),document.all);
	equal(doc("forms"),document.forms);

	doc.set("global_api.a.b.func",function(){ return "return"});
	equal(document.global_api.a.b.func(),"return");
})

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
	equal(resolver("g.h.i","undefined"),undefined);
	raises(function(){ resolver("j.k.l","throw") },"The 'j' part of 'j.k.l' couldn't be resolved.");
})

test('Resolver set value',function(){
	var resolver = Resolver({});

	resolver.set("a.b.c","abc")
	equal(resolver("a.b.c"), "abc")	
})

test('Resolver reference',function(){

	var resolver = Resolver({});

	resolver("my")
	var my = resolver.reference("my");
	notEqual(my(), undefined, "namespace replaced");
	notEqual(my.get(), undefined, "namespace replaced");

	var num = resolver.reference("num");
	num.set(5);
	equal(num(),5);
	equal(num.get(),5);
	equal(resolver("num"),5);

	var r = resolver.reference("r");
	r.set({});
	strictEqual(r(),resolver("r"));

	equal(r.getEntry("a"),undefined);
	r.setEntry("a","a");
	equal(r.getEntry("a"),"a","setEntry initiates the map entry");
	equal(resolver("r.a"),"a");
	r.declareEntry("a","aa");
	equal(r.getEntry("a"),"a","declareEntry doesn't change an existing value");

	equal(r.getEntry("b"),undefined);
	r.declareEntry("b","b");
	equal(r.getEntry("b"),"b","declareEntry will change an undefined map entry");
	r.setEntry("c","cc")
	equal(r.getEntry("c"),"cc")
	r.setEntry("c")
	equal(r.getEntry("c"),undefined)

	r.setEntry("d.a","d");
	//equal(r.get("d.a","null"),null);
	equal(resolver("r.d.a","null"),null);
	equal(r()["d.a"],"d");

	r.mixin({ "g":"g", "h":"h", "i":"i" });
	equal(r.getEntry("g"), "g");
	equal(r.getEntry("h"), "h");
	equal(r.getEntry("i"), "i");

})

/*
  Change listeners are notified of changes to the entry or members of it.
  Changes to members of members do not cause notifications.
*/
test('Resolver change listener',function() {

	var resolver = Resolver({});

	var abc = resolver.reference("a.b.c");
	var _onabc = sinon.spy();
	abc.on("change",_onabc);

	abc.set(function(){});
	equal(typeof abc(),"function");
	equal(_onabc.callCount,1);
	//ok(_onabc.calledWith({value:5}));

	abc.setEntry("d","dd");
	equal(resolver("a.b.c.d"), "dd");
	equal(_onabc.callCount,2);

	var _ondef = sinon.spy();
	resolver.on("change","d.e.f",_ondef);

	resolver.set("d.e.f", 6);
	equal(resolver("d.e.f"), 6);
	equal(_ondef.callCount,1);
//	ok(_ondef.calledWith({value:6}));

});

test("Resolver mixinto",function() {
	var mixtarget = {};
	Resolver({},{ mixinto: mixtarget });
	ok(mixtarget.get);
	ok(mixtarget.set);
	ok(mixtarget.declare);
	ok(mixtarget.reference);
	ok(mixtarget.override);
	//ok(mixtarget.mixin);
	ok(mixtarget.on);
})

//TODO test setEntry morphing "number", "boolean", "string" into builtin

		// Resolver("abc")
		// Resolver("abc",{})
		// Resolver("abc",{},{options})


// Resolver.hasGenerator

// i18n resolver

