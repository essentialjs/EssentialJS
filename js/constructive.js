/*
    Essential JavaScript ❀ http://essentialjs.com
    Copyright (C) 2011 by Henrik Vendelbo

    This program is free software: you can redistribute it and/or modify it under the terms of
    the GNU Affero General Public License version 3 as published by the Free Software Foundation.

    Additionally,

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
    and associated documentation files (the "Software"), to deal in the Software without restriction, 
    including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
    and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
    BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/**
 * @param {Object} ns Namespace base (Optional)
 * " 
 * @param {Object} options Options { generator: function } (Optional) 
 */
function Resolver(name,ns,options)
{
	switch(typeof(name)) {
	case "undefined":
		// Resolver()
		return Resolver.default;
		
	case "string":
		// Resolver("abc")
		// Resolver("abc",{})
		// Resolver("abc",{},{options})
		if (Resolver[name] == undefined) {
			if (options == undefined) { options = ns; ns = {}; }
			Resolver[name] = Resolver(ns,options);
			Resolver[name].name = name;
			}
		return Resolver[name];
	}

	// Resolver({})
	// Resolver({},{options})
	options = ns || {};
	ns = name;
	name = options.name;
	var _generator = options.generator || Generator(Object); //TODO faster default

	function _resolve(names,onundefined) {
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
		if (value.__generator__ == value) {
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

    resolve.name = name;
    resolve.namespace = ns;
    
    resolve.declare = function(name,value,onundefined) 
    {
        var names = name.split(".");
        var symbol = names.pop();
    	var base = _resolve(names,onundefined);
    	if (base[symbol] === undefined) { 
    		_setValue(value,names,base,symbol);
    	}
    };

    resolve.set = function(name,value,onundefined) 
    {
        var names = name.split(".");
        var symbol = names.pop();
    	var base = _resolve(names,onundefined);
		_setValue(value,names,base,symbol);
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
        	base[symbol] = value;
        }
        function declare(value) {
            var symbol = names.pop();
        	var base = _resolve(names,onundefined);
        	names.push(symbol);
        	if (base[symbol] === undefined) base[symbol] = value;
        }
        get.set = set;
        get.get = get;
        get.declare = declare;

        return get;
    };

    resolve.override = function(ns,options)
    {
        options = options || {};
        var name = options.name || this.name; 
		Resolver[name] = Resolver(ns,options);
		Resolver[name].name = name;
		return Resolver[name];
    };

    return resolve;
}
Resolver.default = Resolver({},{ name:"default" });


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
		options: options,
		constructors: []
	};
	
	function newGenerator(a,b,c,d,e,f,g,h,i,j,k,l) {

		var instance = new generator.type();
		
		// constructors
		instance.__context__ = { generator:generator, info:info, args:[a,b,c,d,e,f,g,h,i,j,k,l] }; //TODO inject morphers that change the args for next constructor
		for(var i=0,g; g=info.constructors[i]; ++i) {
			info.constructors[i].apply(instance,instance.__context__.args);
		}
		delete instance.__context__;
		return instance;
	}

	function singletonGenerator(a,b,c,d,e,f,g,h,i,j,k,l) {
		if (info.options.singleton == null) {
			var instance = info.singleton = new generator.type();

			// constructors
			instance.__context__ = { generator:generator, info:info, args:[a,b,c,d,e,f,g,h,i,j,k,l] }; //TODO inject morphers that change the args for next constructor
			for(var i=0,g; g=info.constructors[i]; ++i) {
				info.constructors[i].apply(instance,instance.__context__.args);
			}
			delete instance.__context__;
		}
		return info.singleton;
	}

	function simpleGenerator(a,b,c,d,e,f,g,h,i,j,k,l) {
		var instance = mainConstr.apply(generator,arguments);
		return instance;
	}

	function presetMembers() {
		var args = this.__context__.generator.args;
		for(var i=0,a; a = args[i]; ++i) if (a.preset) {
			this[a.preset] = arguments[i];
		}
	}
	
	// pooled generator
	//TODO

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

		var generator = options.alloc === false? simpleGenerator : newGenerator;
		generator.__generator__ = generator;
		generator.info = info;

		// arguments planning
		generator.args = options.args || mainConstr.args || [];
		var argsPreset = false;
		for(var i=0,a; a = generator.args[i]; ++i) {
			a.no = i;
			info.arguments[a.name] = a;
			if (a.preset) argsPreset = true;
		}
		if (argsPreset) {
			info.constructors.push(presetMembers)
		}

		// get order of bases and constructors from the main constructor or the arguments
		var bases = generator.bases = mainConstr.bases || [];
		if (last > 0) {
			bases = generator.bases = [];
			for(var i=last,a; (i >= 1) &&(a = args[i]); --i) {
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

		
		return generator;
	})(arguments);

	function mixin(mix) {
		for(var n in mix) this.prototype[n] = mix[n];
	}
	generator.mixin = mixin;
	
	function variant(name,variantConstr,v1,v2,v3,v4) {
		if (variantConstr == undefined) { // Lookup the variant generator
			var g = this.variants[name];
			if (g.generator) return g.generator;
			var g = this.variants[""]; // default generator
			if (g.generator) return g.generator;
			return this;			
		} else {	// Set the variant generator
			var handlers = variantConstr.handlers;
			var bases = variantConstr.bases;
			this.variants[name] = { 
				func: variantConstr,
				handlers: handlers || {},
				bases: bases || [],
				additional: [v1,v2,v3,v4] 
			}; 
		}
	}

	// variant get/set function and variants map
	generator.variant = variant;
	generator.variants = {};

	// Future calls will return this generator
	mainConstr.__generator__ = generator;
		
	return generator;
};


Generator.setVariantGenerator = function(mainConstr,variant,fGenerator,mHandlers,pConstruction,v1,v2,v3,v4)
{
	variant = variant || null; // defaults to null
	
	// ensure that variants map is present on base constructor
	mainConstr.generator_variants = mainConstr.generator_variants || {}; 

	mainConstr.generator_variants[variant] = { 
		generator: fGenerator,
		handlers: mHandlers || {},
		construction: pConstruction || [],
		additional: [v1,v2,v3,v4] 
	}; 
};

/**
 * Configure the base constructor to generate a singleton of a specific variant
 */
Generator.setSingleton = function(mainConstr,variant)
{
	// ensure that variants map is present on base constructor
	mainConstr.generator_variants = fConstructor.generator_variants || {}; 
	mainConstr.generator_variants[null] = fConstructor.generator_variants[null] || {};
	
	mainConstr.generator_variants[null].default_variant = variant || null; // defaults to null
	mainConstr.generator_variants[null].singleton = null;
};

 
/**
 * Configure the base constructor to generate a instances of a specific variant limited by a pool size
 */
Generator.setPoolSize = function(mainConstr,variant,nSize)
{
	// ensure that variants map is present on base constructor
	mainConstr.generator_variants = mainConstr.generator_variants || {}; 
	mainConstr.generator_variants[null] = mainConstr.generator_variants[null] || {};
	
	mainConstr.generator_variants[null].default_variant = variant || null; // defaults to null
	mainConstr.generator_variants[null].pool = {};
	mainConstr.generator_variants[null].pool_size = nSize;
};

// types for describing generator arguments and generated properties
(function(){
	var essential = Resolver("essential",{});
	function Type(options) {
		this.options = options || {};
		this.name = this.options.name;
		this.preset = this.options.preset === true? this.name : this.options.preset;
	}
	essential.set("Type",Generator(Type));
	
	function StringType(options) {
		this.type = String;
	}
	essential.set("StringType",Generator(StringType,Type));
	essential.namespace.Type.variant("String",essential.namespace.StringType);
		
	function NumberType(options) {
		this.type = Number;
	}
	essential.set("NumberType",Generator(NumberType,Type));
	essential.namespace.Type.variant("Number",essential.namespace.NumberType);
	
	function DateType(options) {
		this.type = Date;
	}
	essential.set("DateType",Generator(DateType,Type));
	essential.namespace.Type.variant("Date",essential.namespace.DateType);
	
	function BooleanType(options) {
		this.type = Boolean;
	}
	essential.set("BooleanType",Generator(BooleanType,Type));
	essential.namespace.Type.variant("Boolean",essential.namespace.BooleanType);
	
	function ObjectType(options) {
		this.type = Object;
	}
	essential.set("ObjectType",Generator(ObjectType,Type));
	essential.namespace.Type.variant("Object",essential.namespace.ObjectType);
	
	function ArrayType(options) {
		this.type = Array;
	}
	essential.set("ArrayType",Generator(ArrayType,Type));
	essential.namespace.Type.variant("Array",essential.namespace.ArrayType);
	
function enhanceTryout() {
    var scripts = document.getElementsByTagName("script");
    for(var i=0,s; s = scripts[i]; ++i) if (s.getAttribute("type") == "tryout/javascript") {
        var others = document.getElementsByName(s.getAttribute("name"));
        for(var j=0,o; o = others[j]; ++j) if (o.nodeName.toLowerCase() != "script"){
            if (o.value != undefined && s.firstChild) o.value = s.firstChild.nodeValue;
        }
    }
    
}

	if (window.attachEvent) window.attachEvent("onload",enhanceTryout);
	else window.addEventListener("load",enhanceTryout,false);
})();


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
assert("undefined === Resolver.default.namespace.my");
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
Shape.arguments = [ ];

function Rectangle(width,height) {
	
}
Rectangle.bases = [Shape];
Rectangle.arguments = [ NumberType({name:"width",preset:true}), NumberType({name:"height",preset:true}) ]; //TODO NumberType({name:"width"}) optional: , default:  seed:
Rectangle.prototype.earlyFunc = function() {};

shapes.Shape = Generator(Shape);
shapes.Rectangle = Generator(Rectangle);

Rectangle.prototype.getWidth = function() {
	return this.width;
};

assert("typeof shapes.Shape.info.options == 'object'");
assert("shapes.Rectangle.bases == Rectangle.bases");
assert("shapes.Rectangle.arguments == Rectangle.arguments");

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
	arguments : [ NumberType({name:"diameter",preset:true}) ] //TODO NumberType({name:"width"}) optional: , default:  seed:
});

Circle.prototype.getWidth = function() {
	return this.diameter;
};

assert("shapes.Circle.bases.length == 1");
assert("shapes.Circle.bases[0] == Shape");
assert("shapes.Circle.info.options.arguments.length == 1");
assert("typeof shapes.Circle.info.options.arguments[0] == 'object'");
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

*/
