/*!
    Essential JavaScript ❀ http://essentialjs.com
    Copyright (C) 2011 by Henrik Vendelbo

    Licensed under GNU Affero v3 and MIT. See http://essentialjs.com/license/
*/


function Resolver(name,ns,options)
{
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

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
    function resolver(name,onundefined) {
        if (typeof name == "object") {
            return _resolve(name.name.split("."),name.onundefined);
        }
        else {
            return _resolve(name.split("."),onundefined);
        }
    };

    resolver.named = name;
    resolver.namespace = ns;
    
    resolver.declare = function(name,value,onundefined) 
    {
        var names = name.split(".");
        var symbol = names.pop();
    	var base = _resolve(names,onundefined);
    	if (base[symbol] === undefined) { 
    		_setValue(value,names,base,symbol);
    		return value;
    	} else return base[symbol];
    };

    resolver.set = function(name,value,onundefined) 
    {
        var names = name.split(".");
        var symbol = names.pop();
    	var base = _resolve(names,onundefined);
		_setValue(value,names,base,symbol);
		return value;
    };

    resolver.reference = function(name,onundefined)
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

    resolver.override = function(ns,options)
    {
        options = options || {};
        var name = options.name || this.named; 
		Resolver[name] = Resolver(ns,options);
		Resolver[name].named = name;
		return Resolver[name];
    };

    if (options.mixinto) {
    	options.mixinto.declare = resolver.declare;
    	options.mixinto.set = resolver.set;
    	options.mixinto.reference = resolver.reference;
    	options.mixinto.override = resolver.override;
    }

    return resolver;
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
	//"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

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
		"no strict";
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
			mainConstr.prototype = info.extendsBuiltin.ctr.prototype; // help instanceof (non-strict) 
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
				bases.push(ctr);
			}
		}	
		var constructors = info.constructors;
		for(var i=0,b; b = bases[i];++i) {
			if (b.bases && b.info && b.info.constructors) {
				for(var j=0,b2; b2 = b.bases[j]; ++j) constructors.push(b.bases[j]);
				b = bases[i] = b.info.constructors[-1]
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
		return this;
	}
	generator.restrict = restrict;

	// Future calls will return this generator
	mainConstr.__generator__ = generator;
		
	return generator;
};

/* List of generators that have been restricted */
Generator.restricted = [];


