/*!
    Essential JavaScript ❀ http://essentialjs.com
    Copyright (C) 2011 by Henrik Vendelbo

    Licensed under GNU Affero v3 and MIT. See http://essentialjs.com/license/
*/

function Resolver(name,ns,options)
{
	switch(typeof(name)) {
	case "undefined":
		// Resolver()
		return Resolver["default"];
		
	case "string":
		// Resolver("abc")
		// Resolver("abc",{})
		// Resolver("abc",{},{options})
		if (Resolver[name] == undefined) {
			if (options == undefined) { options = ns; ns = {}; }
			Resolver[name] = Resolver(ns,options);
			Resolver[name].named = name;
			}
		return Resolver[name];
	}

	// Resolver({})
	// Resolver({},{options})
	options = ns || {};
	ns = name;
	name = options.name;

	function _resolve(names,onundefined) {
		var _generator = options.generator || Generator(Object); //TODO faster default
        var top = ns;
        for (var j = 0, n; n = names[j]; ++j) {
            var prev_top = top;
            top = top[n];
            if (top == undefined) {
                switch(onundefined) {
                case undefined:
                case "generate":
                    top = prev_top[n] = _generator();
                    break;
                case "null":
                    return null;
                case "throw":
                	throw new Error("The '" + n + "' part of '" + names.join(".") + "' couldn't be resolved.");
                }
            }
        }
        return top;
	}
	
    function _setValue(value,names,base,symbol)
    {
    	base[symbol] = value;
		if (typeof value == "object" && value.__generator__ == value) {
    		value.info.symbol = symbol;
    		value.info["package"] = names.join(".");
    		value.info.within = base;
    	}
    }

    /**
     * @param name To resolve
     * @param onundefined What to do for undefined symbols ("generate","null","throw")
     */
    function resolve(name,onundefined) {
        if (typeof name == "object") {
            return _resolve(name.name.split("."),name.onundefined);
        }
        else {
            return _resolve(name.split("."),onundefined);
        }
    };

    resolve.named = name;
    resolve.namespace = ns;
    
    resolve.declare = function(name,value,onundefined) 
    {
        var names = name.split(".");
        var symbol = names.pop();
    	var base = _resolve(names,onundefined);
    	if (base[symbol] === undefined) { 
    		_setValue(value,names,base,symbol);
    		return value;
    	} else return base[symbol];
    };

    resolve.set = function(name,value,onundefined) 
    {
        var names = name.split(".");
        var symbol = names.pop();
    	var base = _resolve(names,onundefined);
		_setValue(value,names,base,symbol);
		return value;
    };

    resolve.reference = function(name,onundefined)
    {
        var names = name.split(".");

    	function get() {
        	var base = _resolve(names,onundefined);
        	return base;
        }
        function set(value) {
            var symbol = names.pop();
        	var base = _resolve(names,onundefined);
        	names.push(symbol);
        	_setValue(value,names,base,symbol);
        	return value;
        }
        function declare(value) {
            var symbol = names.pop();
        	var base = _resolve(names,onundefined);
        	names.push(symbol);
        	if (base[symbol] === undefined) {
        		_setValue(value,names,base,symbol);
        		return value
        	} else return base[symbol];
        }
        function declareEntry(key,value) {
            var symbol = names.pop();
        	var base = _resolve(names,onundefined);
        	names.push(symbol);
        	if (base[symbol] === undefined) _setValue({},names,base,symbol);
        	
        	if (base[symbol][key] === undefined) base[symbol][key] = value;
        }
        function setEntry(key,value) {
            var symbol = names.pop();
        	var base = _resolve(names,onundefined);
        	names.push(symbol);
        	if (base[symbol] === undefined) _setValue({},names,base,symbol);
        	
        	base[symbol][key] = value;
        }
        function mixin(map) {
            var symbol = names.pop();
        	var base = _resolve(names,onundefined);
        	names.push(symbol);
        	if (base[symbol] === undefined) _setValue({},names,base,symbol);
        	for(var n in map) {
        		base[symbol][n] = map[n];
        	}
        }
        get.set = set;
        get.get = get;
        get.declare = declare;
        get.mixin = mixin;
        get.declareEntry = declareEntry;
        get.setEntry = setEntry;

        return get;
    };

    resolve.override = function(ns,options)
    {
        options = options || {};
        var name = options.name || this.named; 
		Resolver[name] = Resolver(ns,options);
		Resolver[name].named = name;
		return Resolver[name];
    };

    if (options.mixinto) {
    	options.mixinto.declare = resolve.declare;
    	options.mixinto.set = resolve.set;
    	options.mixinto.reference = resolve.reference;
    	options.mixinto.override = resolve.override;
    }

    return resolve;
}
Resolver["default"] = Resolver({},{ name:"default" });

Resolver.hasGenerator = function(subject) {
	if (subject.__generator__) return true;
	if (typeof subject == "function" && typeof subject.type == "function") return true;
	return false;
};

/**
 * Generator(constr) - get cached or new generator
 * Generator(constr,base1,base2) - define with bases
 * Generator(constr,base,options) - define with options 
 *
 * options { singleton: false, pool: undefined, allocate: true } 
 *
 */
function Generator(mainConstr,options)
{
	if (mainConstr.__generator__) return mainConstr.__generator__;

	var info = {
		arguments: {},
		presets: {}, // presets to copy before constructors
		options: options,
		constructors: []
	};

	function newGenerator(a,b,c,d,e,f,g,h,i,j,k,l) {
		var instance;
		if (generator.info.existing) {
			//TODO perhaps different this pointer
			var id = generator.info.identifier.apply(generator.info,arguments);
			if (id in generator.info.existing) {
				return instance = generator.info.existing[id];
			} else {
				instance = generator.info.existing[id] = new generator.type();
			}
		} else {
			instance = new generator.type();
		}
		
		// constructors
		instance.__context__ = { generator:generator, info:info, args:[a,b,c,d,e,f,g,h,i,j,k,l] }; //TODO inject morphers that change the args for next constructor
		for(var i=0,cst; cst=info.constructors[i]; ++i) {
			cst.apply(instance,instance.__context__.args);
		}
		delete instance.__context__;
		return instance;
	}


	function simpleGenerator(a,b,c,d,e,f,g,h,i,j,k,l) {
		var instance = mainConstr.apply(generator,arguments);
		return instance;
	}

	function builtinGenerator(a,b,c,d,e,f,g,h,i,j,k,l) {
		var instance;
		if (generator.info.existing) {
			//TODO perhaps different this pointer
			var id = generator.info.identifier.apply(generator.info,arguments);
			if (id in generator.info.existing) {
				return instance = generator.info.existing[id];
			} else {
				instance = generator.info.existing[id] = info.extendsBuiltin[arguments.length].apply(null,arguments);
			}
		} else {
			instance = info.extendsBuiltin[arguments.length].apply(null,arguments);
			// copy the methods
			for(var mn in generator.prototype) {
				instance[mn] = generator.prototype[mn];
			}
			//TODO instance.constructor = mainConstr
			mainConstr.prototype = info.extendsBuiltin.ctr.prototype; // help instanceof 
		}

		// constructors
		instance.__context__ = { generator:generator, info:info, args:[a,b,c,d,e,f,g,h,i,j,k,l] }; //TODO inject morphers that change the args for next constructor
		for(var i=0,ctr; ctr=info.constructors[i]; ++i) {
			if (info.extendsBuiltin.ctr !== ctr) {
				ctr.apply(instance,instance.__context__.args);
			}
		}
		delete instance.__context__;
		return instance;
	}

	function fillMissingArgs() {
		var passedArgs = this.__context__.args;
		for(var i=0,argDef; argDef = generator.args[i]; ++i) if (passedArgs[i] === undefined) {
			 var argName = generator.args[i].name;
			 var argDefault = generator.args[i]["default"];
			 if (argName in info.restrictedArgs) passedArgs[i] = info.restrictedArgs[argName];
			 else if (argDefault) passedArgs[i] = argDefault;
		}
		//TODO support args default values in all cases
	}

	function presetMembersInfo() {
		for(var n in info.presets) this[n] = info.presets[n];
	}

	function presetMembersArgs() {
		var args = this.__context__.generator.args;
		for(var i=0,a; a = args[i]; ++i) if (a.preset) {
			this[a.preset] = arguments[i];
		}
	}

	function constructByNumber(ctr,no) {
		return function(a,b,c,d,e,f,g,h,i,j,k,l) {
			switch(no) {
				case 1: return new ctr(a);
				case 2: return new ctr(a,b);
				case 3: return new ctr(a,b,c);
				case 4: return new ctr(a,b,c,d);
				case 5: return new ctr(a,b,c,d,e);
				case 6: return new ctr(a,b,c,d,e,f);
				case 7: return new ctr(a,b,c,d,e,f,g);
				case 8: return new ctr(a,b,c,d,e,f,g,h);
				case 9: return new ctr(a,b,c,d,e,f,g,h,i);
				case 10: return new ctr(a,b,c,d,e,f,g,h,i,j);
				case 11: return new ctr(a,b,c,d,e,f,g,h,i,j,k);
				case 12: return new ctr(a,b,c,d,e,f,g,h,i,j,k,l);
				default: return new ctr();
			}
		};
	}
	
	// Make the generator with type annotations
	var generator = (function(args){
		// mark end of constructor arguments
		var last = args.length-1;
		var options = args[last];
		if (typeof options == "function") {
			options = {};
		} else {
			--last;
		}
		info.options = options;

		// get order of bases and constructors from the main constructor or the arguments
		var bases = mainConstr.bases || [];
		if (last > 0) {
			bases = [];
			for(var i=last,ctr; (i >= 1) &&(ctr = args[i]); --i) {
				switch(ctr) {
					case Array:
					case String: 
						info.extendsBuiltin = { "ctr":ctr }
						for(var ci=12; ci>=0; --ci) info.extendsBuiltin[ci] = constructByNumber(ctr,ci);
				}
				bases.push(args[i]);
			}
		}	
		var constructors = info.constructors;
		for(var i=0,b; b = bases[i];++i) {
			if (b.bases) {
				for(var j=0,b2; b2 = b.bases[j]; ++j) constructors.push(b.bases[j]);
			}
			constructors.push(b);
		}
		constructors.push(mainConstr);
		constructors[-1] = mainConstr;

		// determine the generator to use
		var generator = newGenerator;
		if (options.alloc === false) generator = simpleGenerator;
		else if (info.extendsBuiltin) generator = builtinGenerator;

		generator.__generator__ = generator;
		generator.info = info;
		generator.bases = bases;

		// arguments planning
		generator.args = options.args || mainConstr.args || [];
		var argsPreset = false;
		for(var i=0,a; a = generator.args[i]; ++i) {
			a.no = i;
			info.arguments[a.name] = a;
			if (a.preset) argsPreset = true;
		}
		/* 
		TODO only add this when presets are set
		TODO collapse base classes
		*/
		info.constructors.unshift(presetMembersInfo);

		if (argsPreset) {
			info.constructors.unshift(presetMembersArgs)
		}

		// If we have base classes, make prototype based on their type
		if (bases.length) {
			var base = Generator(bases[0]);
			var p = generator.prototype = new base.type();
			for(var i=1,b; b = bases[i]; ++i) {
				for(var n in b.prototype) p[n] = b.prototype[n]; 
			}
		}

		// simple type with inheritance chain, fresh prototype
		function type() {}
		generator.type = type;
		generator.type.prototype = generator.prototype;

		// migrate prototype
		for(var n in mainConstr.prototype) generator.prototype[n] = mainConstr.prototype[n];
		mainConstr.prototype = generator.prototype;
		//TODO generator.fn = generator.prototype
		
		
		return generator;
	})(arguments);

	Resolver(generator.prototype,{ mixinto:generator });

	/*
	function mixin(mix) {
		for(var n in mix) this.prototype[n] = mix[n];
	}
	generator.mixin = mixin;
	*/

	//TODO callback when preset entry defined first time
	generator.presets = Resolver(info.presets);

	
	function variant(name,variantConstr,v1,v2,v3,v4) {
		if (variantConstr == undefined) { // Lookup the variant generator
			var g = this.variants[name];
			if (g && g.generator) return g.generator;
			var g = this.variants[""]; // default generator
			if (g && g.generator) return g.generator;
			return this;			
		} else {	// Set the variant generator
			var handlers = variantConstr.handlers;
			var bases = variantConstr.bases;
			this.variants[name] = { 
				func: variantConstr,
				generator: Generator(variantConstr),
				handlers: handlers || {},
				bases: bases || [],
				additional: [v1,v2,v3,v4] 
			}; 
		}
	}

	// variant get/set function and variants map
	generator.variant = variant;
	generator.variants = {};

	function toRepr() {
		var l = [];
		l.push("function ");
		l.push(this.info.package);
		l.push(".");
		l.push(this.info.symbol);
		l.push("(");
		var ps = [];
		for(var i=0,a; a = this.args[i]; ++i) {
			ps.push(a.name + ":" + a.variantName);
		}
		l.push(ps.join(","))
		l.push(")");
		l.push(" {");
		l.push("<br>  ");
		l.push("<br>  }");
		l.push("<br>  ");
		
		return l.join("");
	}
	generator.toRepr = toRepr;

	function restrict(restrictions,args) {
		if (restrictions.singleton) {
			this.info.singleton = true;
			this.info.lifecycle = restrictions.lifecycle;
			this.info.existing = {};
			this.info.identifier = function() {
				return 0;
			}
			if (!this.info.restricted) {
				Generator.restricted.push(generator);
				this.info.restricted = true;
			}
		}
		else if (restrictions.identifier) {
			var fn = typeof restrictions.identifier == "string"? restrictions.identifier : "identifier";
			this.info.identifier = this.info.constructors[-1][fn];
			this.info.existing = {};
			if (!this.info.restricted) {
				Generator.restricted.push(generator);
				this.info.restricted = true;
			}
		}
		else if (restrictions.size != undefined) {
			
			if (!this.info.restricted) {
				Generator.restricted.push(generator);
				this.info.restricted = true;
			}
		}
		else {
			//TODO remove from restricted list
		}
		this.info.restrictedArgs = args;
		if (args) {
			this.info.constructors.unshift(fillMissingArgs);
		}
	}
	generator.restrict = restrict;

	// Future calls will return this generator
	mainConstr.__generator__ = generator;
		
	return generator;
};

/* List of generators that have been restricted */
Generator.restricted = [];


/*
function assert(b) {
	if (!eval(b)) alert("failed:"+ b);
}
var shapes = Resolver()("my.shapes");
var tools = Resolver()("my.tools");

Resolver().set("my.tools.X",5);
assert("5 === Resolver.default.namespace.my.tools.X");

assert("shapes === Resolver.default.namespace.my.shapes");
assert("tools === Resolver.default.namespace.my.tools");
assert("Resolver.default.namespace.my");

Resolver("default").override({});
assert("undefined === Resolver["default"].namespace.my");
Resolver()("my")
assert("Resolver.default.namespace.my");

var my = Resolver().reference("my");
assert("my.get()");

var num = Resolver().reference("num");
num.set(5);
assert("5 == num.get()");


// Generators

var NumberType = Generator(Resolver("essential")("Type"),"Number");

var shapes = {};

function Shape() {}
Shape.args = [ ];

function Rectangle(width,height) {
	
}
Rectangle.bases = [Shape];
Rectangle.args = [ NumberType({name:"width",preset:true}), NumberType({name:"height",preset:true}) ]; //TODO NumberType({name:"width"}) optional: , default:  seed:
Rectangle.prototype.earlyFunc = function() {};

shapes.Shape = Generator(Shape);
shapes.Rectangle = Generator(Rectangle);

Rectangle.prototype.getWidth = function() {
	return this.width;
};

assert("typeof shapes.Shape.info.options == 'object'");
assert("shapes.Rectangle.bases == Rectangle.bases");
assert("shapes.Rectangle.args == Rectangle.args");

var s = shapes.Shape();
var r55 = shapes.Rectangle(5,5);
assert("r55 instanceof Rectangle");
assert("r55 instanceof shapes.Rectangle");
assert("r55 instanceof Shape");
assert("r55 instanceof shapes.Shape");
assert("shapes.Rectangle.prototype.getWidth == Rectangle.prototype.getWidth");
assert("typeof shapes.Rectangle.prototype.earlyFunc == 'function'");
assert("5 == r55.width");
assert("5 == r55.getWidth()");

shapes.Shape.mixin({
	sides: 0
});

shapes.Rectangle.mixin({
	sides: 2,
	getRatio: function() { return this.width / this.height; }
});

assert("0 == Shape.prototype.sides");
assert("0 == s.sides");
assert("2 == Rectangle.prototype.sides");
assert("2 == r55.sides");


function Circle(diameter) {
	
}
Circle.prototype.earlyFunc = function() {};

shapes.Circle = Generator(Circle,Shape,{
	args : [ NumberType({name:"diameter",preset:true}) ] //TODO NumberType({name:"width"}) optional: , default:  seed:
});

Circle.prototype.getWidth = function() {
	return this.diameter;
};

assert("shapes.Circle.bases.length == 1");
assert("shapes.Circle.bases[0] == Shape");
assert("shapes.Circle.info.options.args.length == 1");
assert("typeof shapes.Circle.info.options.args[0] == 'object'");
assert("0 == Circle.prototype.sides");

var c9 = shapes.Circle(9);
assert("c9 instanceof Circle");
assert("c9 instanceof shapes.Circle");
assert("c9 instanceof Shape");
assert("c9 instanceof shapes.Shape");
assert("9 == c9.diameter");
assert("9 == c9.getWidth()");

var Simple = Generator(function(v) { return v; }, { alloc: false });

var s8 = Simple(8);
assert("s8 == 8");

*/// types for describing generator arguments and generated properties
(function(win){
	var essential = Resolver("essential",{});
	function Type(options) {
		this.options = options || {};
		this.name = this.options.name;
		this.preset = this.options.preset === true? this.name : this.options.preset;
	}
	essential.set("Type",Generator(Type));
	
	function StringType(options) {
		this.type = String;
		this.variantName = "String";
	}
	essential.set("StringType",Generator(StringType,Type));
	essential.namespace.Type.variant("String",essential.namespace.StringType);
		
	function NumberType(options) {
		this.type = Number;
		this.variantName = "Number";
	}
	essential.set("NumberType",Generator(NumberType,Type));
	essential.namespace.Type.variant("Number",essential.namespace.NumberType);
	
	function DateType(options) {
		this.type = Date;
		this.variantName = "Date";
	}
	essential.set("DateType",Generator(DateType,Type));
	essential.namespace.Type.variant("Date",essential.namespace.DateType);
	
	function BooleanType(options) {
		this.type = Boolean;
		this.variantName = "Boolean";
	}
	essential.set("BooleanType",Generator(BooleanType,Type));
	essential.namespace.Type.variant("Boolean",essential.namespace.BooleanType);
	
	function ObjectType(options) {
		this.type = Object;
		this.variantName = "Object";
	}
	essential.set("ObjectType",Generator(ObjectType,Type));
	essential.namespace.Type.variant("Object",essential.namespace.ObjectType);
	
	function ArrayType(options) {
		this.type = Array;
		this.variantName = "Array";
	}
	essential.set("ArrayType",Generator(ArrayType,Type));
	essential.namespace.Type.variant("Array",essential.namespace.ArrayType);

	//TODO consider if ""/null restriction is only for derived DOMTokenList
	
	function ArraySet() {
		this._set = {};
		for(var i=this.length-1; i>=0; --i) {
			var key = this[i];
			if (this._set[key] || key === "") this.splice(i,1);
			if (key != "" && key != null) this._set[key] = true;	
		} 
		//TODO remove dupes
	}
	essential.set("ArraySet",Generator(ArraySet,Array)); //TODO support this
	essential.set("DOMTokenList",Generator(ArraySet,Array)); //TODO support this

	ArraySet.prototype.item = function(index) {
		return this[index]; // use native array
	};

	ArraySet.prototype.has = function(id) {
		return this._set[id];
	};

	ArraySet.prototype.contains = 
	ArraySet.prototype.has = function(id) {
		return Boolean(this._set[id]);
	};

	ArraySet.prototype.set = function(id,value) {
		if (typeof id == "object"); //TODO set map removing rest
		if (value) { // set true
			this.add(id);
		} else { // set false
			this.remove(id);
		}
	};
	
	//TODO mixin with map of entries to set

	ArraySet.prototype.add = function(id) {
		if (!(id in this._set)) {
			this._set[id] = true;
			this.push(id);
		}
	};
	ArraySet.prototype.remove = function(id) {
		if (id in this._set) {
			for(var i=this.length-1; i>=0; --i) if (this[i] === id) this.splice(i,1);
			delete this._set[id];
		}
	};
	ArraySet.prototype.toggle = function(id) {
		if (this.has(id)) this.remove(id);
		else this.add(id);
	};
	
	ArraySet.prototype.separator = " ";

	ArraySet.prototype.toString = function() {
		return this.join(this.separator);
	};


	function instantiatePageSingletons()
	{
		for(var i=0,g; g = Generator.restricted[i]; ++i) {
			if (g.info.lifecycle == "page") {
				g();
			}
		}
	}

	function discardRestricted()
	{
		for(var i=0,g; g = Generator.restricted[i]; ++i) {
			var discarded = g.info.constructors[-1].discarded;
			for(var n in g.info.existing) {
				var instance = g.info.existing[n];
				if (discarded) {
					discarded.call(g,instance);
				}
			}
			g.info.constructors[-1].__generator__ = undefined;
			g.__generator__ = undefined;
		}
	}

	essential.set("_queueDelayedAssets",function(){});

	function fireDomReady()
	{
		essential("_queueDelayedAssets")();
		essential.set("_queueDelayedAssets",function(){});

		instantiatePageSingletons();
	}
	function fireLoad()
	{
		
	}
	function fireBeforeUnload()
	{
		discardRestricted();
	}

    function doScrollCheck() {
      try {
        // If IE is used, use the trick by Diego Perini
        // http://javascript.nwbox.com/IEContentLoaded/
        win.document.documentElement.doScroll("left");
      } catch(e) {
        setTimeout(doScrollCheck, 1);
        return;
      }

      // and execute any waiting functions
      fireDomReady();
    }  

	function listenForDomReady() 
	{
	    // Mozilla, Opera and webkit nightlies currently support this event
	    if (win.document.addEventListener) {
	      var DOMContentLoaded = function() {
	        win.document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
	        fireDomReady();
	      };
	      
	      win.document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
	      win.addEventListener("load", fireDomReady, false); // fallback
	      
	      // If IE event model is used
	    } else if (win.document.attachEvent) {
	      
	      var onreadystatechange = function() {
	        if (win.document.readyState === "complete") {
	          win.document.detachEvent("onreadystatechange", onreadystatechange);
	          fireDomReady();
	        }
	      };
	      
	      win.document.attachEvent("onreadystatechange", onreadystatechange);
	      win.attachEvent("onload", fireDomReady); // fallback

	      // If IE and not a frame, continually check to see if the document is ready
	      var toplevel = false;

	      try {
	        toplevel = win.frameElement == null;
	      } catch(e) {}

	      // The DOM ready check for Internet Explorer
	      if (win.document.documentElement.doScroll && toplevel) {
	        doScrollCheck();
	      }
	    } 
	}


	if (window.device) {
		//TODO PhoneGap support
	}
	else {
		listenForDomReady();		
		if (win.addEventListener) {
			win.addEventListener("load",fireLoad,false);
		} else {
			win.attachEvent("onload",fireLoad);
		}
		if (win.addEventListener) {
			win.addEventListener("beforeunload",fireBeforeUnload,false);
		} else {
			win.attachEvent("onbeforeunload",fireBeforeUnload);
		}
	}

	var proxyConsole = essential.declare("console",{});
	function setStubConsole() {
		function no_logging(level,parts) {}
 
		proxyConsole["log"] = function() { no_logging("none",arguments); };
		proxyConsole["trace"] = function() { no_logging("trace",arguments); };
		proxyConsole["debug"] = function() { no_logging("debug",arguments); };
		proxyConsole["info"] = function() { no_logging("info",arguments); };
		proxyConsole["warn"] = function() { no_logging("warn",arguments); };
		proxyConsole["error"] = function() { no_logging("error",arguments); };
	}
	essential.declare("setStubConsole",setStubConsole);
 
	function setWindowConsole() {
		proxyConsole["log"] = function() { window.console.log.apply(window.console,arguments); };
		proxyConsole["trace"] = function() { window.console.trace(); };
		proxyConsole["debug"] = function() { (window.console.debug || window.console.info).apply(window.console,arguments); };
		proxyConsole["info"] = function() { window.console.info.apply(window.console,arguments); };
		proxyConsole["warn"] = function() { window.console.warn.apply(window.console,arguments); };
		proxyConsole["error"] = function() { window.console.error.apply(window.console,arguments); };
 
		if (window.console.debug == undefined) {
			// IE8
			proxyConsole["log"] = function(m) { window.console.log(m); };
			proxyConsole["trace"] = function(m) { window.console.trace(); };
			proxyConsole["debug"] = function(m) { window.console.log(m); };
			proxyConsole["info"] = function(m) { window.console.info(m); };
			proxyConsole["warn"] = function(m) { window.console.warn(m); };
			proxyConsole["error"] = function(m) { window.console.error(m); };
		}
	}
	essential.declare("setWindowConsole",setWindowConsole);
	if (window.console) setWindowConsole();
	else setStubConsole();
 
 })(window);

/**
* XMLHttpRequest.js Copyright (C) 2011 Sergey Ilinsky (http://www.ilinsky.com)
*
* This work is free software; you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation; either version 2.1 of the License, or
* (at your option) any later version.
*
* This work is distributed in the hope that it will be useful,
* but without any warranty; without even the implied warranty of
* merchantability or fitness for a particular purpose. See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this library; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
*
* https://github.com/ilinsky/xmlhttprequest/commit/9f1d0fd49b0583073c1ca19e220dc13fe0f509b4
*/

(function () {

	// Save reference to earlier defined object implementation (if any)
	var oXMLHttpRequest = window.XMLHttpRequest;

	// Define on browser type
	var bGecko  = !!window.controllers;
	var bIE     = window.document.all && !window.opera;
	var bIE7    = bIE && window.navigator.userAgent.match(/MSIE 7.0/);

	// Enables "XMLHttpRequest()" call next to "new XMLHttpReques()"
	function fXMLHttpRequest() {
		this._object  = oXMLHttpRequest && !bIE7 ? new oXMLHttpRequest : new window.ActiveXObject("Microsoft.XMLHTTP");
		this._listeners = [];
	}

	// Constructor
	function cXMLHttpRequest() {
		return new fXMLHttpRequest;
	}
	cXMLHttpRequest.prototype = fXMLHttpRequest.prototype;

	// BUGFIX: Firefox with Firebug installed would break pages if not executed
	if (bGecko && oXMLHttpRequest.wrapped) {
		cXMLHttpRequest.wrapped = oXMLHttpRequest.wrapped;
	}

	// Constants
	cXMLHttpRequest.UNSENT            = 0;
	cXMLHttpRequest.OPENED            = 1;
	cXMLHttpRequest.HEADERS_RECEIVED  = 2;
	cXMLHttpRequest.LOADING           = 3;
	cXMLHttpRequest.DONE              = 4;

	// Public Properties
	cXMLHttpRequest.prototype.readyState    = cXMLHttpRequest.UNSENT;
	cXMLHttpRequest.prototype.responseText  = '';
	cXMLHttpRequest.prototype.responseXML   = null;
	cXMLHttpRequest.prototype.status        = 0;
	cXMLHttpRequest.prototype.statusText    = '';

	// Priority proposal
	cXMLHttpRequest.prototype.priority    = "NORMAL";

	// Instance-level Events Handlers
	cXMLHttpRequest.prototype.onreadystatechange  = null;

	// Class-level Events Handlers
	cXMLHttpRequest.onreadystatechange  = null;
	cXMLHttpRequest.onopen              = null;
	cXMLHttpRequest.onsend              = null;
	cXMLHttpRequest.onabort             = null;

	// Public Methods
	cXMLHttpRequest.prototype.open  = function(sMethod, sUrl, bAsync, sUser, sPassword) {
		// Delete headers, required when object is reused
		delete this._headers;

		// When bAsync parameter value is omitted, use true as default
		if (arguments.length < 3) {
			bAsync  = true;
		}

		// Save async parameter for fixing Gecko bug with missing readystatechange in synchronous requests
		this._async   = bAsync;

		// Set the onreadystatechange handler
		var oRequest  = this;
		var nState    = this.readyState;
		var fOnUnload = null;

		// BUGFIX: IE - memory leak on page unload (inter-page leak)
		if (bIE && bAsync) {
			fOnUnload = function() {
				if (nState != cXMLHttpRequest.DONE) {
					fCleanTransport(oRequest);
					// Safe to abort here since onreadystatechange handler removed
					oRequest.abort();
				}
			};
			window.attachEvent("onunload", fOnUnload);
		}

		// Add method sniffer
		if (cXMLHttpRequest.onopen) {
			cXMLHttpRequest.onopen.apply(this, arguments);
		}

		if (arguments.length > 4) {
			this._object.open(sMethod, sUrl, bAsync, sUser, sPassword);
		} else if (arguments.length > 3) {
			this._object.open(sMethod, sUrl, bAsync, sUser);
		} else {
			this._object.open(sMethod, sUrl, bAsync);
		}

		this.readyState = cXMLHttpRequest.OPENED;
		fReadyStateChange(this);

		this._object.onreadystatechange = function() {
			if (bGecko && !bAsync) {
				return;
			}

			// Synchronize state
			oRequest.readyState   = oRequest._object.readyState;
			fSynchronizeValues(oRequest);

			// BUGFIX: Firefox fires unnecessary DONE when aborting
			if (oRequest._aborted) {
				// Reset readyState to UNSENT
				oRequest.readyState = cXMLHttpRequest.UNSENT;

				// Return now
				return;
			}

			if (oRequest.readyState == cXMLHttpRequest.DONE) {
				// Free up queue
				delete oRequest._data;

				// Uncomment these lines for bAsync
				/**
				 * if (bAsync) {
				 * 	fQueue_remove(oRequest);
				 * }
				 */

				fCleanTransport(oRequest);

				// Uncomment this block if you need a fix for IE cache
				/**
				 * // BUGFIX: IE - cache issue
				 * if (!oRequest._object.getResponseHeader("Date")) {
				 * 	// Save object to cache
				 * 	oRequest._cached  = oRequest._object;
				 *
				 * 	// Instantiate a new transport object
				 * 	cXMLHttpRequest.call(oRequest);
				 *
				 * 	// Re-send request
				 * 	if (sUser) {
				 * 		if (sPassword) {
				 * 			oRequest._object.open(sMethod, sUrl, bAsync, sUser, sPassword);
				 * 		} else {
				 * 			oRequest._object.open(sMethod, sUrl, bAsync);
				 * 		}
				 *
				 * 		oRequest._object.setRequestHeader("If-Modified-Since", oRequest._cached.getResponseHeader("Last-Modified") || new window.Date(0));
				 * 		// Copy headers set
				 * 		if (oRequest._headers) {
				 * 			for (var sHeader in oRequest._headers) {
				 * 				// Some frameworks prototype objects with functions
				 * 				if (typeof oRequest._headers[sHeader] == "string") {
				 * 					oRequest._object.setRequestHeader(sHeader, oRequest._headers[sHeader]);
				 * 				}
				 * 			}
				 * 		}
				 * 		oRequest._object.onreadystatechange = function() {
				 * 			// Synchronize state
				 * 			oRequest.readyState   = oRequest._object.readyState;
				 *
				 * 			if (oRequest._aborted) {
				 * 				//
				 * 				oRequest.readyState = cXMLHttpRequest.UNSENT;
				 *
				 * 				// Return
				 * 				return;
				 * 			}
				 *
				 * 			if (oRequest.readyState == cXMLHttpRequest.DONE) {
				 * 				// Clean Object
				 * 				fCleanTransport(oRequest);
				 *
				 * 				// get cached request
				 * 				if (oRequest.status == 304) {
				 * 					oRequest._object  = oRequest._cached;
				 * 				}
				 *
				 * 				//
				 * 				delete oRequest._cached;
				 *
				 * 				//
				 * 				fSynchronizeValues(oRequest);
				 *
				 * 				//
				 * 				fReadyStateChange(oRequest);
				 *
				 * 				// BUGFIX: IE - memory leak in interrupted
				 * 				if (bIE && bAsync) {
				 * 					window.detachEvent("onunload", fOnUnload);
				 * 				}
				 *
				 * 			}
				 * 		};
				 * 		oRequest._object.send(null);
				 *
				 * 		// Return now - wait until re-sent request is finished
				 * 		return;
				 * 	};
				 */

				// BUGFIX: IE - memory leak in interrupted
				if (bIE && bAsync) {
					window.detachEvent("onunload", fOnUnload);
				}

				// BUGFIX: Some browsers (Internet Explorer, Gecko) fire OPEN readystate twice
				if (nState != oRequest.readyState) {
					fReadyStateChange(oRequest);
				}

				nState  = oRequest.readyState;
			}
		};
	};

	cXMLHttpRequest.prototype.send = function(vData) {
		// Add method sniffer
		if (cXMLHttpRequest.onsend) {
			cXMLHttpRequest.onsend.apply(this, arguments);
		}

		if (!arguments.length) {
			vData = null;
		}

		// BUGFIX: Safari - fails sending documents created/modified dynamically, so an explicit serialization required
		// BUGFIX: IE - rewrites any custom mime-type to "text/xml" in case an XMLNode is sent
		// BUGFIX: Gecko - fails sending Element (this is up to the implementation either to standard)
		if (vData && vData.nodeType) {
			vData = window.XMLSerializer ? new window.XMLSerializer().serializeToString(vData) : vData.xml;
			if (!this._headers["Content-Type"]) {
				this._object.setRequestHeader("Content-Type", "application/xml");
			}
		}

		this._data = vData;

		/**
		 * // Add to queue
		 * if (this._async) {
		 * 	fQueue_add(this);
		 * } else { */
		fXMLHttpRequest_send(this);
		 /**
		 * }
		 */
	};

	//non standard enhancement
	cXMLHttpRequest.prototype.sendEncoded = function(vData) {
		// Add method sniffer
		if (cXMLHttpRequest.onsend) {
			cXMLHttpRequest.onsend.apply(this, arguments);
		}

		if (!arguments.length) {
			vData = null;
		}

		if (vData && typeof vData == "object") {
			var contentType = this._headers["Content-Type"];
			if (!contentType) {
				this._object.setRequestHeader("Content-Type", "text/json");
				contentType = "text/json";
			}
			switch(contentType) {
				case "text/json":
					vData = JSON.stringify(vData); //TODO test
					break;
				case "application/x-www-form-urlencoded":
					var params = [];
					for(var n in vData) {
						params.push(n +"="+ encodeURIComponent(vData[n]));
					}
					vData = params.join("&");
					break;
			}
		}

		this._data = vData;

		/**
		 * // Add to queue
		 * if (this._async) {
		 * 	fQueue_add(this);
		 * } else { */
		fXMLHttpRequest_send(this);
		 /**
		 * }
		 */
	};

	cXMLHttpRequest.prototype.abort = function() {
		// Add method sniffer
		if (cXMLHttpRequest.onabort) {
			cXMLHttpRequest.onabort.apply(this, arguments);
		}

		// BUGFIX: Gecko - unnecessary DONE when aborting
		if (this.readyState > cXMLHttpRequest.UNSENT) {
			this._aborted = true;
		}

		this._object.abort();

		// BUGFIX: IE - memory leak
		fCleanTransport(this);

		this.readyState = cXMLHttpRequest.UNSENT;

		delete this._data;

		/* if (this._async) {
	 	* 	fQueue_remove(this);
	 	* }
	 	*/
	};

	cXMLHttpRequest.prototype.getAllResponseHeaders = function() {
		return this._object.getAllResponseHeaders();
	};

	cXMLHttpRequest.prototype.getResponseHeader = function(sName) {
		return this._object.getResponseHeader(sName);
	};

	cXMLHttpRequest.prototype.setRequestHeader  = function(sName, sValue) {
		// BUGFIX: IE - cache issue
		if (!this._headers) {
			this._headers = {};
		}

		this._headers[sName]  = sValue;

		return this._object.setRequestHeader(sName, sValue);
	};

	// EventTarget interface implementation
	cXMLHttpRequest.prototype.addEventListener  = function(sName, fHandler, bUseCapture) {
		for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++) {
			if (oListener[0] == sName && oListener[1] == fHandler && oListener[2] == bUseCapture) {
				return;
			}
		}

		// Add listener
		this._listeners.push([sName, fHandler, bUseCapture]);
	};

	cXMLHttpRequest.prototype.removeEventListener = function(sName, fHandler, bUseCapture) {
		for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++) {
			if (oListener[0] == sName && oListener[1] == fHandler && oListener[2] == bUseCapture) {
				break;
			}
		}

		// Remove listener
		if (oListener) {
			this._listeners.splice(nIndex, 1);
		}
	};

	cXMLHttpRequest.prototype.dispatchEvent = function(oEvent) {
		var oEventPseudo  = {
			'type':             oEvent.type,
			'target':           this,
			'currentTarget':    this,
			'eventPhase':       2,
			'bubbles':          oEvent.bubbles,
			'cancelable':       oEvent.cancelable,
			'timeStamp':        oEvent.timeStamp,
			'stopPropagation':  function() {},  // There is no flow
			'preventDefault':   function() {},  // There is no default action
			'initEvent':        function() {}   // Original event object should be initialized
		};

		// Execute onreadystatechange
		if (oEventPseudo.type == "readystatechange" && this.onreadystatechange) {
			(this.onreadystatechange.handleEvent || this.onreadystatechange).apply(this, [oEventPseudo]);
		}


		// Execute listeners
		for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++) {
			if (oListener[0] == oEventPseudo.type && !oListener[2]) {
				(oListener[1].handleEvent || oListener[1]).apply(this, [oEventPseudo]);
			}
		}

	};

	//
	cXMLHttpRequest.prototype.toString  = function() {
		return '[' + "object" + ' ' + "XMLHttpRequest" + ']';
	};

	cXMLHttpRequest.toString  = function() {
		return '[' + "XMLHttpRequest" + ']';
	};

	/**
	 * // Queue manager
	 * var oQueuePending = {"CRITICAL":[],"HIGH":[],"NORMAL":[],"LOW":[],"LOWEST":[]},
	 * aQueueRunning = [];
	 * function fQueue_add(oRequest) {
	 * 	oQueuePending[oRequest.priority in oQueuePending ? oRequest.priority : "NORMAL"].push(oRequest);
	 * 	//
	 * 	setTimeout(fQueue_process);
	 * };
	 *
	 * function fQueue_remove(oRequest) {
	 * 	for (var nIndex = 0, bFound = false; nIndex < aQueueRunning.length; nIndex++)
	 * 	if (bFound) {
	 * 		aQueueRunning[nIndex - 1] = aQueueRunning[nIndex];
	 * 	} else {
	 * 		if (aQueueRunning[nIndex] == oRequest) {
	 * 			bFound  = true;
	 * 		}
	 * }
	 *
	 * 	if (bFound) {
	 * 		aQueueRunning.length--;
	 * 	}
	 *
	 *
	 * 	//
	 * 	setTimeout(fQueue_process);
	 * };
	 *
	 * function fQueue_process() {
	 * if (aQueueRunning.length < 6) {
	 * for (var sPriority in oQueuePending) {
	 * if (oQueuePending[sPriority].length) {
	 * var oRequest  = oQueuePending[sPriority][0];
	 * oQueuePending[sPriority]  = oQueuePending[sPriority].slice(1);
	 * //
	 * aQueueRunning.push(oRequest);
	 * // Send request
	 * fXMLHttpRequest_send(oRequest);
	 * break;
	 * }
	 * }
	 * }
	 * };
	 */

	// Helper function
	function fXMLHttpRequest_send(oRequest) {
		oRequest._object.send(oRequest._data);

		// BUGFIX: Gecko - missing readystatechange calls in synchronous requests
		if (bGecko && !oRequest._async) {
			oRequest.readyState = cXMLHttpRequest.OPENED;

			// Synchronize state
			fSynchronizeValues(oRequest);

			// Simulate missing states
			while (oRequest.readyState < cXMLHttpRequest.DONE) {
				oRequest.readyState++;
				fReadyStateChange(oRequest);
				// Check if we are aborted
				if (oRequest._aborted) {
					return;
				}
			}
		}
	}

	function fReadyStateChange(oRequest) {
		// Sniffing code
		if (cXMLHttpRequest.onreadystatechange){
			cXMLHttpRequest.onreadystatechange.apply(oRequest);
		}


		// Fake event
		oRequest.dispatchEvent({
			'type':       "readystatechange",
			'bubbles':    false,
			'cancelable': false,
			'timeStamp':  new Date + 0
		});
	}

	function fGetDocument(oRequest) {
		var oDocument = oRequest.responseXML;
		var sResponse = oRequest.responseText;
		// Try parsing responseText
		if (bIE && sResponse && oDocument && !oDocument.documentElement && oRequest.getResponseHeader("Content-Type").match(/[^\/]+\/[^\+]+\+xml/)) {
			oDocument = new window.ActiveXObject("Microsoft.XMLDOM");
			oDocument.async       = false;
			oDocument.validateOnParse = false;
			oDocument.loadXML(sResponse);
		}

		// Check if there is no error in document
		if (oDocument){
			if ((bIE && oDocument.parseError !== 0) || !oDocument.documentElement || (oDocument.documentElement && oDocument.documentElement.tagName == "parsererror")) {
				return null;
			}
		}
		return oDocument;
	}

	function fSynchronizeValues(oRequest) {
		try { oRequest.responseText = oRequest._object.responseText;  } catch (e) {}
		try { oRequest.responseXML  = fGetDocument(oRequest._object); } catch (e) {}
		try { oRequest.status       = oRequest._object.status;        } catch (e) {}
		try { oRequest.statusText   = oRequest._object.statusText;    } catch (e) {}
	}

	function fCleanTransport(oRequest) {
		// BUGFIX: IE - memory leak (on-page leak)
		oRequest._object.onreadystatechange = new window.Function;
	}

	// Register new object with window
	Resolver("essential").set("XMLHttpRequest", cXMLHttpRequest); //TODO Generator(cXMLHttpRequest));

})();(function(){
	var essential = Resolver("essential",{});
	var ObjectType = essential("ObjectType");
    var console = essential("console");
    var baseUrl = location.href.substring(0,location.href.split("?")[0].lastIndexOf("/")+1);

	// this = element
	function regScriptOnload(domscript,trigger) {

		domscript.onload = function(ev) { 
		    if ( ! domscript.onloadDone ) {
		        domscript.onloadDone = true; 
		        trigger.call(domscript,ev || event); 
		    }
		};
		domscript.onreadystatechange = function(ev) { 
		    if ( ( "loaded" === domscript.readyState || "complete" === domscript.readyState ) && ! domscript.onloadDone ) {
		        domscript.onloadDone = true; 
		        trigger.call(domscript,ev || event);
		    }
		}

	}

	//TODO regScriptOnnotfound (onerror, status=404)

	function HTMLScriptElement(from,doc) {
		var e = (doc || document).createElement("SCRIPT");
		for(var n in from) {
			switch(n) {
				case "id":
				case "class":
				case "rel":
				case "lang":
				case "language":
				case "src":
				case "type":
					if (from[n] !== undefined) e[n] = from[n]; 
					break;
				//TODO case "onprogress": // partial script progress
				case "onload":
					regScriptOnload(e,from.onload);
					break;
				default:
					e.setAttribute(n,from[n]);
					break;
			}
		}
		return e;
	}
	essential.set("HTMLScriptElement",HTMLScriptElement);

    var pastloadScripts = {};

    function delayedScriptOnload(scriptRel) {
        function delayedOnload(ev) {
            pastloadScripts[this.src.replace(baseUrl,"")] = true;
            console.log("loaded: "+this.src.replace(baseUrl,""));
            ApplicationConfig().justUpdateState();
        }
        return delayedOnload;       
    }

    function _queueDelayedAssets()
    {
        console.debug("loading phased scripts");
        var links = document.getElementsByTagName("link");
        //TODO phase
        for(var i=0,l; l=links[i]; ++i) if (l.rel == "pastload") {
            var attrsStr = l.getAttribute("attrs");
            var attrs = {};
            if (attrsStr) {
                eval("attrs = {" + attrsStr + "}");
            }
            attrs["type"] = "text/javascript";
            attrs["src"] = l.getAttribute("src");
            //attrs["id"] = l.getAttribute("script-id");
            attrs["onload"] = delayedScriptOnload(l.rel);
            var relSrc = attrs["src"].replace(baseUrl,"");
            pastloadScripts[relSrc] = false;
            document.body.appendChild(HTMLScriptElement(attrs));
        }
    }
    essential.set("_queueDelayedAssets",_queueDelayedAssets);


    var requiredConfigs = {};

    function configRequired(url)
    {
        requiredConfigs[url] = false;
    }
    essential.set("configRequired",configRequired);

    function configLoaded(url)
    {
        requiredConfigs[url] = true;
        console.debug("config loaded:"+url);
        ApplicationConfig().justUpdateState();
    }
    essential.set("configLoaded",configLoaded);


    function _makeEventCleaner(listeners,bubble)
    {
        // must be called with element as this
        function cleaner() {
            if (this.removeEventListener) {
                for(var n in listeners) {
                    this.removeEventListener(n, listeners[n], bubble);
                    delete listeners[n];
                }
            } else {
                for(var n in listeners) {
                    this.detachEvent('on'+ n, listeners[n]);
                    delete listeners[n];
                }
            }
        }
        cleaner.listeners = listeners; // for removeEventListeners
        return cleaner;
    };


    /**
     * Register map of event listeners 
     * { event: function }
     * Using DOM style event names
     * 
     * @param {Object} eControl
     * @param {Map} listeners Map from event name to function 
     * @param {Object} bubble
     */
    function addEventListeners(eControl, listeners,bubble)
    {
        if (eControl._cleaners == undefined) eControl._cleaners = [];

        // need to remember the function to call
        // supports DOM 2 EventListener interface
        function makeIeListener(eControl,fCallOrThis) {
            var bListenerInstance = typeof fCallOrThis == "object";
            
            var oThis = bListenerInstance? fCallOrThis : eControl;
            var fCall = bListenerInstance? fCallOrThis.handleEvent : fCallOrThis;
            return function() { 
                return fCall.call(eControl,window.event); 
            };
        } 

        if (eControl.addEventListener) {
            for(var n in listeners) {
                eControl.addEventListener(n, listeners[n], bubble || false);
            }
            eControl._cleaners.push(_makeEventCleaner(listeners,bubble || false));
        } else {
            var listeners2 = {};
            for(var n in listeners) {
                listeners2[n] = makeIeListener(eControl,listeners[n]);
                eControl.attachEvent('on'+n,listeners2[n]);
            }
            eControl._cleaners.push(_makeEventCleaner(listeners2,bubble || false));
        }   
    }
    essential.declare("addEventListeners",addEventListeners);

    //TODO modifyable events object on IE

    //TODO removeEventListeners (eControl, listeners, bubble)

    /**
     * Cleans up registered event listeners and other references
     * 
     * @param {Object} eControl
     */
    function callCleaners(eControl)
    {
        var pCleaners = eControl._cleaners;
        if (pCleaners != undefined) {
            for(var i=0,c; c = pCleaners[i]; ++i) {
                c.call(eControl);
            }
            pCleaners = undefined;
        }
    };

    //TODO recursive clean of element and children?


	function DialogAction(actionName) {
		this.actionName = actionName;
	} 
    DialogAction.prototype.activateArea = activateArea; // shortcut to global essential function
	var DialogActionGenerator = essential.set("DialogAction",Generator(DialogAction));


    function resizeTriggersReflow(ev) {
        // debugger;
        DocumentRolesGenerator()._resize_descs();
    }

    function enhanceUnhandledElements() {
        // debugger;
        var statefuls = ApplicationConfig(); // Ensure that config is present
        var handlers = DocumentRolesGenerator.presets("handlers");
        //TODO listener to presets -> Doc Roles additional handlers
        DocumentRolesGenerator()._enhance_descs();
        //TODO time to default_enhance yet?
    }

	function DocumentRoles(handlers) {
	    this.handlers = handlers || this.handlers || { enhance:{}, discard:{}, layout:{} };
	    //TODO configure reference as DI arg
	    var statefuls = ApplicationConfig(); // Ensure that config is present

        if (window.addEventListener) {
            window.addEventListener("resize",resizeTriggersReflow,false);
            document.body.addEventListener("orientationchange",resizeTriggersReflow,false);
        } else {
            window.attachEvent("onresize",resizeTriggersReflow);
        }
        
	    if (document.querySelectorAll) {
            this.descs = this._role_descs(document.querySelectorAll("*[role]"));
	    } else {
	        this.descs = this._role_descs(document.getElementsByTagName("*"));
	    }
        this._enhance_descs();
	}
	var DocumentRolesGenerator = essential.set("DocumentRoles",Generator(DocumentRoles));
	
	DocumentRoles.args = [
	    ObjectType({ name:"handlers" })
	];

    DocumentRoles.prototype._enhance_descs = function() 
    {
        var statefuls = ApplicationConfig(); // Ensure that config is present

        for(var i=0,desc; desc=this.descs[i]; ++i) {
            if (!desc.enhanced && this.handlers.enhance[desc.role]) {
                desc.instance = this.handlers.enhance[desc.role].call(this,desc.el,desc.role,statefuls.getConfig(desc.el));
                desc.enhanced = true;
            }
        }
    };

    DocumentRoles.discarded = function(instance) {
        var statefuls = ApplicationConfig(); // Ensure that config is present

        for(var i=0,desc; desc=instance.descs[i]; ++i) {
            if (!desc.discarded) {
                if (instance.handlers.discard[desc.role]) {
                    instance.handlers.discard[desc.role].call(instance,desc.el,desc.role,desc.instance);
                } else {
                    DocumentRoles.default_discard.call(instance,desc.el,desc.role,desc.instance);
                }
                desc.discarded = true;
                //TODO clean layouter/laidout
                callCleaners(desc);
            }
        }
    };

    DocumentRoles.prototype._role_descs = function(elements) {
        var statefuls = ApplicationConfig(); // Ensure that config is present
        var descs = [];
        for(var i=0,e; e=elements[i]; ++i) {
            var role = e.getAttribute("role");
            if (role) {
                descs.push({
                    "role": role,
                    "el": e,
                    "instance": null,
                    "layout": {},
                    "enhanced": false,
                    "discarded": false
                });
            }
        }
        return descs;
    };

    DocumentRoles.prototype._resize_descs = function() {
        for(var i=0,desc; desc = this.descs[i]; ++i) {
            if (desc.enhanced && this.handlers.layout[desc.role]) {
                var ow = desc.el.offsetWidth, oh  = desc.el.offsetHeight;
                if (desc.layout.width != ow || desc.layout.height != oh) {
                    desc.layout.width = ow;
                    desc.layout.height = oh;
                    this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
                }
            }
        }
    };

    DocumentRoles.prototype._layout_descs = function() {
        for(var i=0,desc; desc = this.descs[i]; ++i) {
            if (desc.enhanced && this.handlers.layout[desc.role]) {
                var updateLayout = false;
                var ow = desc.el.offsetWidth, oh  = desc.el.offsetHeight;
                if (ow == 0 && oh == 0) {
                    if (desc.layout.displayed) updateLayout = true;
                    desc.layout.displayed = false;
                }
                if (desc.layout.width != ow || desc.layout.height != oh) {
                    desc.layout.width = ow;
                    desc.layout.height = oh;
                    updateLayout = true
                }
                if (updateLayout) this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
            }
        }
    };

    // Element specific handlers
    DocumentRolesGenerator.presets.declare("handlers.enhance", {});
    DocumentRolesGenerator.presets.declare("handlers.layout", {});
    DocumentRolesGenerator.presets.declare("handlers.discard", {});


    function form_onsubmit(ev) {
        var frm = this;
        setTimeout(function(){
            frm.submit();
        },0);
        return false;
    }
    function form_submit() {
        if (document.activeElement) document.activeElement.blur();
        this.blur();

        dialog_submit.call(this);
    }
    function dialog_submit(clicked) {
        var submitName = "trigger";
        if (this.elements) {

            for(var i=0,e; e=this.elements[i]; ++i) {
                if (e.type=="submit") submitName = e.name;
            }
        } else {

            var buttons = this.getElementsByTagName("button");
            for(var i=0,e; e=buttons[i]; ++i) {
                if (e.type=="submit") submitName = e.name;
            }
            var inputs = this.getElementsByTagName("input");
            for(var i=0,e; e=inputs[i]; ++i) {
                if (e.type=="submit") submitName = e.name;
            }
        }
        if (clicked && clicked.name) submitName = clicked.name;

        if (! this.actionVariant) {
            var action = this.getAttribute("action");
            if (action) {
                action = action.replace(baseUrl,"");
            } else {
                action = "submit";
            }

            this.actionVariant = DialogActionGenerator.variant(action)(action);
        }

        if (this.actionVariant[submitName]) this.actionVariant[submitName](this);
        else {
            var sn = submitName.replace("-","_").replace(" ","_");
            if (this.actionVariant[sn]) this.actionVariant[sn](this);
        }
        //TODO else dev_note("Submit of " submitName " unknown to DialogAction " action)
    }

    function toolbar_submit(clicked) {
        return dialog_submit.call(this,clicked);
    }

    function form_blur() {
        for(var i=0,e; e=this.elements[i]; ++i) e.blur();
    }
    function form_focus() {
        for(var i=0,e; e=this.elements[i]; ++i) {
            var autofocus = e.getAttribute("autofocus");
            if (autofocus == undefined) continue;
            e.focus();
            break; 
        }
    }

    function dialog_button_click(ev) {
        ev = ev || event;
        var e = ev.target || ev.srcElement;
        if (e.getAttribute("role") == "button") this.submit(e); else
        if (e.type=="submit") this.submit(e); //TODO action context
    }

	DocumentRolesGenerator.enhance_dialog = DocumentRoles.enhance_dialog = function (el,role,config) {
	    switch(el.tagName.toLowerCase()) {
	        case "form":
                // f.method=null; f.action=null;
                el.onsubmit = form_onsubmit;
                el.__builtinSubmit = el.submit;
                el.submit = form_submit;
                el.__builtinBlur = el.blur;
                el.blur = form_blur;
                el.__builtinFocus = el.focus;
                el.focus = form_focus;
	            break;
	            
	        default:
                el.submit = dialog_submit;
	        	// debugger;
	            //TODO capture enter from inputs, tweak tab indexes
	            break;
	    }
	    
        addEventListeners(el, {
            "click": dialog_button_click
        },false);

        return {};
    };

    DocumentRolesGenerator.discard_dialog = DocumentRoles.discard_dialog = function (el,role,instance) {
    };

    DocumentRolesGenerator.enhance_toolbar = DocumentRoles.enhance_toolbar = function(el,role,config) {
        el.submit = toolbar_submit;

        addEventListeners(el, {
            "click": dialog_button_click
        },false);

        return {};
    };

    DocumentRolesGenerator.discard_toolbar = DocumentRoles.layout_toolbar = function(el,layout,instance) {
        
    };

    DocumentRolesGenerator.discard_toolbar = DocumentRoles.discard_toolbar = function(el,role,instance) {
        
    };

    DocumentRolesGenerator.enhance_sheet = DocumentRoles.enhance_sheet = function(el,role,config) {
        
        return {};
    };

    DocumentRolesGenerator.discard_sheet = DocumentRoles.layout_sheet = function(el,layout,instance) {
        
    };

    DocumentRolesGenerator.discard_sheet = DocumentRoles.discard_sheet = function(el,role,instance) {
        
    };

    DocumentRoles.default_enhance = function(el,role,config) {
        
    };

    DocumentRoles.default_discard = function(el,role,config) {
        
    };
    
    function Layouter(key,el,conf) {

    }
    var LayouterGenerator = essential.declare("Layouter",Generator(Layouter));

    var stages = [];

    function StageLayouter(key,el,conf) {
    	this.key = key;
    	this.type = conf.layouter;
    	this.areaNames = conf["area-names"];
    	this.activeArea = null;

    	this.baseClass = conf["base-class"];
    	if (this.baseClass) this.baseClass += " ";
    	else this.baseClass = "";

    	stages.push(this); // for area updates
    }
    var StageLayouterGenerator = essential.declare("StageLayouter",Generator(StageLayouter));
    LayouterGenerator.variant("area-stage",StageLayouterGenerator);

    StageLayouter.prototype.refreshClass = function(el) {
    	var areaClasses = [];
    	for(var i=0,a; a = this.areaNames[i]; ++i) {
    		if (a == this.activeArea) areaClasses.push(a + "-area-active");
    		else areaClasses.push(a + "-area-inactive");
    	}
    	var newClass = this.baseClass + areaClasses.join(" ")
    	if (el.className != newClass) el.className = newClass;
    };

    StageLayouter.prototype.updateActiveArea = function(areaName) {
    	this.activeArea = areaName;
    	this.refreshClass(document.getElementById(this.key)); //TODO on delay	
    }

    function Laidout(key,el,conf) {

    }
    var LaidoutGenerator = essential.declare("Laidout",Generator(Laidout));

    function MemberLaidout(key,el,conf) {
    	this.key = key;
    	this.type = conf.laidout;
    	this.areaNames = conf["area-names"];

        this.baseClass = conf["base-class"];
        if (this.baseClass) this.baseClass += " ";
        else this.baseClass = "";

        el.className = this.baseClass + el.className;
    }
    var MemberLaidoutGenerator = essential.declare("MemberLaidout",Generator(MemberLaidout));
    LaidoutGenerator.variant("area-member",MemberLaidoutGenerator);


    function activateArea(areaName) {
    	for(var i=0,s; s = stages[i]; ++i) {
    		s.updateActiveArea(areaName);
    	}
        DocumentRolesGenerator()._layout_descs();
    }
    essential.set("activateArea",activateArea);

    function bringLive() {
    	var ap = ApplicationConfig();

        // Allow the browser to render the page, preventing initial transitions
        ap.state.livepage = true;
        ap.reflectState();

    	if (ap.isPageState("authenticated")) activateArea(ap.getAuthenticatedArea());
    	else activateArea(ap.getIntroductionArea());
    }

    function onPageLoad(ev) {
    }

    if (window.addEventListener) window.addEventListener("load",onPageLoad,false);
    else if (window.attachEvent) window.attachEvent("onload",onPageLoad);


    function _ApplicationConfig() {
    	this.config = {};
    	this._gather();
    	this._apply();

        this.state = {
            "livepage": false,
            "authenticated": false,
            "loading": true,
            "loadingConfig": true,
            "loadingScripts": true,
            "launched": false
        };
        this.state.authenticated = true; //TODO add authentication tester

    	setTimeout(bringLive,60);
    }
    var ApplicationConfig = Generator(_ApplicationConfig);
    essential.set("ApplicationConfig",ApplicationConfig).restrict({ "singleton":true, "lifecycle":"page" });

    ApplicationConfig.prototype.isPageState = function(whichState) {
    	return this.state[whichState];
    };
    ApplicationConfig.prototype.setPageState = function(whichState,v) {
        this.state[whichState] = v;
        if (this.state.launched) this.updateState();
    };
    ApplicationConfig.prototype.getAuthenticatedArea = function() {
    	// return "edit"; TODO
        return "explorer-sheet";
    };
    ApplicationConfig.prototype.getIntroductionArea = function() {
    	//return "signup"; TODO
        return "explorer-sheet";
    };

    ApplicationConfig.prototype.declare = function(key,value) {
    	this.config[key] = value;
    };
    ApplicationConfig.prototype._gather = function() {
    	var scripts = document.getElementsByTagName("script");
    	for(var i=0,s; s = scripts[i]; ++i) {
    		if (s.getAttribute("type") == "application/config") {
    			with(this) eval(s.text);
    		}
    	}
    };

    ApplicationConfig.prototype._apply = function() {
    	for(var k in this.config) {
    		var conf = this.config[k];
    		var el = this.getElement(k);

    		if (conf.layouter) {
    			el.layouter = LayouterGenerator.variant(conf.layouter)(k,el,conf);
    		}
    		if (conf.laidout) {
    			el.laidout = LaidoutGenerator.variant(conf.laidout)(k,el,conf);
    		}
    	}
    };

    ApplicationConfig.prototype._getElementRoleConfig = function(element) {

        var dataRole = element.getAttribute("data-role");
        if (dataRole) try {
            var map = JSON.parse("{" + dataRole + "}");
            //TODO extend this.config for elements with id?
            if (element.id) {
                this.config[element.id] = map;
            }
            return map;
        } catch(ex) {
            return { "invalid-config":dataRole };
        }
        return {};
    };

    ApplicationConfig.prototype.getConfig = function(element) {
    	if (element.id) {
    		return this.config[element.id] || this._getElementRoleConfig(element);
    	}
    	var name = element.getAttribute("name");
    	if (name) {
    		var p = element.parentNode;
    		while(p) {
	    		if (p.id) {
                    return this.config[p.id + "." + name] || this._getElementRoleConfig(element);
                } 
	    		p = p.parentNode;
    		} 
    	}
        return this._getElementRoleConfig(element);
    };

    ApplicationConfig.prototype.getElement = function(key) {
    	var keys = key.split(".");
    	var el = document.getElementById(keys[0]);
    	if (keys.length > 1) el = el.getElementByName(keys[1]);
    	return el;
    };

    ApplicationConfig.prototype.justUpdateState = function() 
    {   
        this.state.loading = false;
        this.state.loadingScripts = false;
        this.state.loadingConfig = false;

        for(var n in pastloadScripts) {
            if (pastloadScripts[n] == false) { this.state.loading = true; this.state.loadingScripts = true; console.debug(n+" missing")}
        }
        for(var n in requiredConfigs) {
            if (requiredConfigs[n] == false) { this.state.loading = true; this.state.loadingConfig = true; console.debug(n+" missing")}
        }
    };

    ApplicationConfig.prototype.updateState = function() 
    {   
        this.justUpdateState();

        if (this.state.loading == false) enhanceUnhandledElements();

        //TODO do this in justUpdateState as well?
        this.reflectState();
    };


    ApplicationConfig.prototype.reflectState = function()
    {
        return;
        //TODO implement

        var bodyClass = ArraySet.apply(null,document.body.className.split(" "));
        bodyClass.set("login",! this.state.authenticated);
        bodyClass.set("authenticated",this.state.authenticated);
        bodyClass.set("loading",this.state.loading);
        bodyClass.set("login-error",this.state.loginError);
        bodyClass.set("launched",this.state.launched);
        bodyClass.set("livepage",this.state.livepage);
        if (window.log) console.log("Changing body from '"+document.body.className+"' to '"+String(bodyClass)+"'");
        document.body.className = String(bodyClass);
    };

})();