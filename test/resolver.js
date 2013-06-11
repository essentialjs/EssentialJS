module("Resolver tests");

test ("Anonymous resolver",function(){
	var r = Resolver({});
	r.set("a","a");
	equal(Resolver()("a","undefined"),undefined);
})

test ("Named resolver",function(){

	ok(! Resolver.exists("A"))
	ok(! Resolver.exists("B"))
	ok(! Resolver.exists("C"))

	var rs = {"aa":"aa"}, r = Resolver("A",rs);
	equal(r.namespace,rs,"Using namespace passed to Resolver");
	var a = r.set("a","a");
	equal(Resolver()("a","undefined"),undefined);
	equal(r,Resolver("A"));
	ok(Resolver.exists("A"))

	var r = Resolver({},{name:"B"});
	r.set("a","a");
	equal(Resolver()("a","undefined"),undefined);
	equal(r,Resolver("B"));
	notEqual(r,Resolver("A"));
	ok(Resolver.exists("B"))

	var r = Resolver("C",null); // check for non-existent 
	equal(r, null);

	var r = Resolver("C"); // create blank one 
	equal(typeof r, "function");

	ok(Resolver.exists("C"))
})

test("Window resolver",function(){
	var win = Resolver("window");
	equal(win.namespace,window);
	equal(win("Array"),Array);
	equal(win("Boolean"),Boolean);
	equal(win("self"),window);
	// equal(Resolver("window::"),window);

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
	equal(Resolver["default"].namespace.my.tools.X,5, "Set number worked");
	equal(Resolver["default"].namespace.my.shapes, shapes, "two level package works");
	equal(Resolver["default"].namespace.my.tools, tools, "two level package works");
	equal(typeof Resolver["default"].namespace.my, "object", "top level package created");

	Resolver("default").override({});
	equal(Resolver["default"].namespace.my, undefined, "namespace replaced");

	Resolver()("my")
	notEqual(Resolver["default"].namespace.my, undefined, "namespace replaced");

})

test('Resolve defined and undefined',function(){
	var resolver = Resolver({});

	equal(typeof resolver("a.b.c"),"object");
	equal(typeof resolver("d.e.f","generate"),"object");
	equal(resolver("g.h.i","null"),null);
	equal(resolver("g.h.i","undefined"),undefined);
	raises(function(){ resolver("j.k.l","throw") },"The 'j' part of 'j.k.l' couldn't be resolved.");

	strictEqual(resolver({ name: "m.n.o", onundefined:"null"}), null);
	equal(typeof resolver({ name: "m.n.o", onundefined:"undefined"}), "undefined");
	equal(typeof resolver({ name: "m.n.o", onundefined:"generate"}), "object");
	equal(typeof resolver({ name: "m.n.o"}), "object");

	resolver.set("m.n",null);
	strictEqual(resolver("m.n"), null);
	strictEqual(resolver("m.n","undefined"), null);
	strictEqual(resolver("m.n","null"), null);
	strictEqual(resolver("m.n","generate"), null);
	strictEqual(resolver("m.n","throw"), null);
	raises(function(){ resolver("m.n.o") },"The 'o' part of 'm.n.o' couldn't be resolved.");
	raises(function(){ resolver("m.n.o","undefined") },"The 'o' part of 'm.n.o' couldn't be resolved.");
	raises(function(){ resolver("m.n.o","null") },"The 'o' part of 'm.n.o' couldn't be resolved.");
	raises(function(){ resolver("m.n.o","generate") },"The 'o' part of 'm.n.o' couldn't be resolved.");
	raises(function(){ resolver("m.n.o","throw") },"The 'o' part of 'm.n.o' couldn't be resolved.");
})

test('Resolve defined and undefined reference',function(){
	var resolver = Resolver({});

	equal(typeof resolver.reference("a.b.c")(),"object");
	equal(typeof resolver.reference("d.e.f","generate")(),"object");
	equal(resolver.reference("g.h.i","null")(),null);
	equal(resolver.reference("g.h.i","undefined")(),undefined);
	raises(function(){ resolver.reference("j.k.l","throw")() },"The 'j' part of 'j.k.l' couldn't be resolved.");

	strictEqual(resolver.reference({ name: "m.n.o", onundefined:"null"})(), null);
	equal(typeof resolver.reference({ name: "m.n.o", onundefined:"undefined"})(), "undefined");
	equal(typeof resolver.reference({ name: "m.n.o", onundefined:"generate"})(), "object");
	equal(typeof resolver.reference({ name: "m.n.o"})(), "object");

	resolver.set("m.n",null);
	strictEqual(resolver.reference("m.n")(), null);
	strictEqual(resolver.reference("m.n","undefined")(), null);
	strictEqual(resolver.reference("m.n","null")(), null);
	strictEqual(resolver.reference("m.n","generate")(), null);
	strictEqual(resolver.reference("m.n","throw")(), null);
	raises(function(){ resolver.reference("m.n.o")() },"The 'o' part of 'm.n.o' couldn't be resolved.");
	raises(function(){ resolver.reference("m.n.o","undefined")() },"The 'o' part of 'm.n.o' couldn't be resolved.");
	raises(function(){ resolver.reference("m.n.o","null")() },"The 'o' part of 'm.n.o' couldn't be resolved.");
	raises(function(){ resolver.reference("m.n.o","generate")() },"The 'o' part of 'm.n.o' couldn't be resolved.");
	raises(function(){ resolver.reference("m.n.o","throw")() },"The 'o' part of 'm.n.o' couldn't be resolved.");
})

test('Resolver set/declare value',function(){
	var resolver = Resolver({});

	var abc_value = resolver.set("a.b.c","abc");
	strictEqual(abc_value,"abc","returned value from set");
	equal(resolver("a.b.c"), "abc");	
	var abc_value = resolver.declare("a.b.c","xxx");
	strictEqual(abc_value,"abc","returned value from set");
	equal(resolver("a.b.c"), "abc");	

	var def_value = resolver.declare("d.e.f","def");
	strictEqual(def_value,"def","returned value from declare");
	equal(resolver("d.e.f"), "def");	

	var ghi_value = resolver.set(["g","h","i"],"ghi");
	strictEqual(ghi_value,"ghi","returned value from set");
	equal(resolver(["g","h","i"]), "ghi");	
	var ghi_value = resolver.declare(["g","h","i"],"xxx");
	strictEqual(ghi_value,"ghi","returned value from set");
	equal(resolver(["g","h","i"]), "ghi");	

	var klm_value = resolver.declare(["k","l","m"],"klm");
	strictEqual(klm_value,"klm","returned value from declare");
	equal(resolver(["k","l","m"]), "klm");	

	var opq = resolver.declare(["o",null,"q"],"opq");
	equal(resolver(["o",null,"q"]),"opq")

	//TODO try string like objects for get/set/declare
	//TODO try array like objects for get/set/declare
})

test('Resolver toggle value',function(){
	var resolver = Resolver({});

	var abc_value = resolver.set("a.b.c",false);
	strictEqual(abc_value,false,"returned value from set");
	equal(resolver("a.b.c"), false);	
	resolver.toggle("a.b.c");
	equal(resolver("a.b.c"), true);	
	resolver.toggle("a.b.c");
	equal(resolver("a.b.c"), false);	

	resolver.toggle("a.b.d");
	equal(resolver("a.b.d"), true);	
})

test('Resolver reference set/declare value',function(){
	var resolver = Resolver({});

	var abc = resolver.reference("a.b.c","null");
	equal(abc(),null);
	equal(abc.get(),null);
	throws(function(){ abc.set("abc"); },"The 'o' part of 'm.n.o' couldn't be resolved.");
	resolver.set("a.b",{});
	var abc_value = abc.set("abc");
	strictEqual(abc_value,"abc","returned value from set");
	equal(abc(), "abc");	
	var abc_value = abc.declare("xxx");
	strictEqual(abc_value,"abc","returned value from set");
	equal(abc(), "abc");	

	var def = resolver.reference("d.e.f");
	var def_value = def.declare("def");
	strictEqual(def_value,"def","returned value from declare");
	equal(def(), "def");	

	// sub-values
	var ghi = resolver.reference("g.h.i");
	var j = ghi.declare("j","j");
	equal(j,"j");
	equal(ghi("j"),"j")
	var j = ghi.declare("j","j2");
	equal(j,"j");
	equal(ghi("j"),"j")
	var j = ghi.set("j","j2");
	equal(j,"j2");
	equal(ghi("j"),"j2")
	var l = ghi.declare("k.l","l");
	equal(l,"l");
	equal(ghi("k.l"),"l");
	var l = ghi.declare("k.l","l2");
	equal(l,"l");
	equal(ghi("k.l"),"l");
	var l = ghi.set("k.l","l2");
	equal(l,"l2");
	equal(ghi("k.l"),"l2");

	var ghi_value = ghi.set(["g2","h","i"],"ghi");
	strictEqual(ghi_value,"ghi","returned value from set");
	equal(ghi(["g2","h","i"]), "ghi");	
	var ghi_value = ghi.declare(["g2","h","i"],"xxx");
	strictEqual(ghi_value,"ghi","returned value from set");
	equal(ghi(["g2","h","i"]), "ghi");	

	var klm_value = ghi.declare(["k2","l","m"],"klm");
	strictEqual(klm_value,"klm","returned value from declare");
	equal(ghi(["k2","l","m"]), "klm");	

	//TODO try string like objects for get/set/declare
	//TODO try array like objects for get/set/declare
})

test('Resolver namespace::expression API',function() {


	Resolver().set("abcdef","abcdef");
	equal(Resolver("::abcdef"),Resolver().reference("abcdef"));
	equal(Resolver("::abcdef::","null"),"abcdef");

	Resolver().set("abcde.f","abcdef");
	equal(Resolver("::abcde.f"),Resolver().reference("abcde.f"));
	equal(Resolver("::abcde.f::","null"),"abcdef");

	ok(! Resolver.exists("F"));

	Resolver("F",{
		"a":"a",
		"b":"b",
		"c":"c"
	});

	equal(Resolver("F"),Resolver("F::"));

	equal(Resolver("F::a"),Resolver("F").reference("a"));
	equal(Resolver("F::b"),Resolver("F").reference("b"));
	equal(Resolver("F::c"),Resolver("F").reference("c"));

	equal(Resolver("F::a::","undefined"),"a");
	equal(Resolver("F::b::","undefined"),"b");
	equal(Resolver("F::c::","undefined"),"c");

	equal(Resolver("F::a::","null"),"a");
	equal(Resolver("F::b::","null"),"b");
	equal(Resolver("F::c::","null"),"c");


	var rg = Resolver("G::",{ "g":"g" });
	equal(Resolver("G::"),rg);
});

test('Resolver reference',function(){

	var resolver = Resolver({});

	resolver("my")
	var my = resolver.reference("my");
	notEqual(my(), undefined, "namespace replaced");
	notEqual(my.get(), undefined, "namespace replaced");

	var top = resolver.reference(null);
	equal(typeof top(),"object");
	equal(top().my,my())

	var top = resolver.reference("");
	equal(typeof top(),"object");
	equal(top().my,my())

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

// test trigger function handler(event) .trigger(eventName)
// test trigger function handler(event,p1,p2) .trigger(event,[p1,p2])
// test trigger function handler(event,p1) .trigger(event,p1)

/*
  Change listeners are notified of changes to the entry or members of it.
  Changes to members of members do not cause notifications.
*/
test('Resolver change listener',function() {

	var resolver = Resolver({});

	var ab = resolver.reference("a.b");
	var _onab = sinon.spy();
	ab.on("change",_onab);

	var abc = resolver.reference("a.b.c");
	var _onabc = sinon.spy();
	abc.on("change",_onabc);

	var abcVal = abc.set(function(){});
	equal(typeof abc(),"function");
	equal(_onabc.callCount,1);
	//ok(_onabc.calledWith({value:5}));
	equal(_onab.callCount,1);

	abc.set(abcVal);
	equal(_onabc.callCount,1,"Change listener is only called if values have changed");
	//ok(_onabc.calledWith({value:5}));
	equal(_onab.callCount,1,"Change listener is only called if values have changed");

	abc.setEntry("d","dd");
	equal(resolver("a.b.c.d"), "dd");
	equal(_onabc.callCount,2);

	var _ondef = sinon.spy();
	resolver.on("change","d.e.f",_ondef);

	resolver.set("d.e.f", 6);
	equal(resolver("d.e.f"), 6);
	equal(_ondef.callCount,1);
//	ok(_ondef.calledWith({value:6}));
	resolver.set("d.e.f", 6);
	equal(_ondef.callCount,1);

	var _onxyz = sinon.spy();
	resolver.on("change","x.y.z",{},_onxyz);
	resolver.set("x.y.z","xyz");
	equal(_onxyz.callCount,1,"Change listener on resolver using string is triggered");
	resolver.set(["x","y","z"],"xyz2");
	equal(_onxyz.callCount,2,"Change listener on resolver using array name is triggered");

	ok(1,"Removing change listener")
	ok(1,"Resolver change listener with 3 params")

	ok(1,"Change listener is only called recursively for 3 levels")

	ok(1,"Specific condition listener on({ loading:false, authorised:false })")

});

test('Resolver bind + change listener',function() {

	var resolver = Resolver({ "b":{ "c": "bc" }});

	var ab = resolver.reference("a.b");
	var _onab = sinon.spy();

	ab.on("bind change",_onab);
	// ok(_onab.calledWith(sinon.match({
	// 	"base": undefined,
	// 	"symbol": "b",
	// 	"value": undefined
	// })));

	equal(_onab.getCall(0).args[0].base,undefined);
	equal(_onab.getCall(0).args[0].symbol,"b");
	equal(_onab.getCall(0).args[0].value,undefined);
	sinon.assert.calledOnce(_onab);

	var abc = resolver.reference("a.b.c");

	var abcVal = abc.set(function(){});
	equal(typeof abc(),"function");
	ok(_onab.calledWith(sinon.match({
		"base": resolver("a.b"),
		"symbol": "c",
		"value": abcVal
	})));
	equal(_onab.callCount,2);

	var bc = resolver.reference("b.c");
	bc.set("bc")
	var _onbc = sinon.spy(function(ev) {
		equal(ev.base,resolver("b"));
		equal(ev.symbol,"c")
		equal(ev.value,"bc");
	});
	bc.on("bind change",_onbc);

	equal(_onbc.callCount,1); // base should be object, value should be "bc"

});


//TODO reference.trigger
//TODO test recursive triggers stopped

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

	var mixtarget = { "set":"set", "get": "get" };
	Resolver({},{ mixinto: mixtarget });
	ok(mixtarget.get,"get","mixinto doesn't override existing values");
	ok(mixtarget.set,"set","mixinto doesn't override existing values");
	ok(mixtarget.declare);
	ok(mixtarget.reference);
	ok(mixtarget.override);
	//ok(mixtarget.mixin);
	ok(mixtarget.on);
})

//TODO get event

test("Resolver proxying",function(){

	var resolver = Resolver({ connectivity: { status: "connected" } });
	var resolver2 = Resolver({});

	resolver2.proxy("state.text",resolver,"connectivity.status");
	resolver2.proxy("state.connectivityStatus",resolver,"connectivity.status");

	resolver.set("connectivity.status","limited");
	equal(resolver2("state.text"),"limited")
	equal(resolver2("state.connectivityStatus"),"limited")


	ok(1,"r.proxy puts the value of a foreign reference locally")

	ok(1,"when resolver is destroyed the proxies are deregistered")
});

test("Resolver entries locally stored",function(){
	ok(1)
});

test("Resolver entries server stored",function(){
	ok(1)
});

test("Resolver reference logging changes",function(){
	ok(1,'ref.log("change","info")')
});

//TODO test setEntry morphing "number", "boolean", "string" into builtin

		// Resolver("abc")
		// Resolver("abc",{})
		// Resolver("abc",{},{options})


// Resolver.hasGenerator

// i18n resolver

/*
wire up references to other references

reference.wire(true).andEqual('named.question1.state.checked',true).andEqual('named.question2.state.checked',true);

reference.wire(false).orEqual(reference1,true).orEqual(reference2,true);
*/