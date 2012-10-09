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
		// Resolver("abc",null)
		// Resolver("abc",{})
		// Resolver("abc",{},{options})
		if (Resolver[name] == undefined) {
			if (ns == null && arguments.length > 1) return ns; // allow checking without creating a new namespace
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

	function _resolve(names,subnames,onundefined) {
        var top = ns;
        for (var j = 0, n; j<names.length; ++j) {
            n = names[j];
            var prev_top = top;
            top = top[n];
            if (top == undefined) { // catching null as well (not sure if it's desirable)
                switch(onundefined) {
                case undefined:
                case "generate":
                	if (top === undefined) {
	                    top = prev_top[n] = (options.generator || Generator.ObjectGenerator)();
	                    continue; // go to next now that we filled in an object
                	}
                //TODO "false"
                case "null":
                	if (top === undefined) return null;
                	break;
                case "undefined":
                	if (top === undefined) return undefined;
                	break;
                }
                if (j < names.length-1) {
	            	throw new Error("The '" + n + "' part of '" + names.join(".") + "' couldn't be resolved.");
                }
            }
        }
        if (subnames) {
        	for(var i=0,n; n = subnames[i]; ++i) {
	            var prev_top = top;
	            top = top[n];
	            if (top == undefined) { 
	                switch(onundefined) {
	                case undefined:
	                case "generate":
	                	if (top === undefined) {
		                    top = prev_top[n] = (options.generator || Generator.ObjectGenerator)();
		                    continue; // go to next now that we filled in an object
	                	}
	                //TODO "false"
	                case "null":
	                	if (top === undefined) return null;
	                	break;
	                case "undefined":
	                	if (top === undefined) return undefined;
	                	break;
	                }
	                if (j < names.length-1) {
		            	throw new Error("The '" + n + "' part of '" + subnames.join(".") + "' in '"+names.join(".")+"' couldn't be resolved.");
	                }
	            }
        	}
        }
        return top;
	}
	
    function _setValue(value,names,base,symbol)
    {
    	if (base[symbol] === value) return false;

    	base[symbol] = value;
		if (typeof value == "object" && value !== null && value.__generator__ == value) {
    		value.info.symbol = symbol;
    		value.info["package"] = names.join(".");
    		value.info.within = base;
    	}

    	return true;
    }

    function nopCall() {}

    function _makeResolverEvent(resolver,type,selector,data,callback) {
    	var e = {};

        e.resolver = resolver;
    	e.type = type;
    	e.selector = selector;
    	e.data = data;
    	e.callback = callback;
        e.inTrigger = 0;

    	function trigger(base,symbol,value) {
            if (this.inTrigger) return;
            ++this.inTrigger;
            this.base = base;
    		this.symbol = symbol;
    		this.value = value;
    		this.callback.call(resolver,this);
            --this.inTrigger;
    	}
    	e.trigger = callback? trigger : nopCall;

    	return e;
    }

    /**
     * Function returned by the Resolver call.
     * @param name To resolve
     * @param onundefined What to do for undefined symbols ("generate","null","throw")
     */
    function resolver(name,onundefined) {
        if (typeof name == "object") {
            // name is array
            if (name.length != undefined) return _resolve(name,null,onundefined);
            // {} call
            return _resolve(name.name.split("."),null,name.onundefined);
        }
        else {
            return _resolve(name.split("."),null,onundefined);
        }
    };

    resolver.get = resolver;
    resolver.named = options.name;
    if (options.name) Resolver[options.name] = resolver;
    resolver.namespace = arguments[0];
    resolver.references = { };

    var VALID_LISTENERS = {
    	"get": true, // allows for switching in alternate lookups
    	"change": true, // allows reflecting changes elsewhere
    	"undefined": true // allow filling in unfound entries
    };

    function _makeListeners() {
    	var listeners = {};
	    // listeners.get.<list of callbacks>
	    // listeners.change.<list of callbacks>
	    // ..
	    for(var n in VALID_LISTENERS) listeners[n] = [];
	    return listeners;
    }


    // relies of resolver
    function makeReference(name,onundefined,listeners)
    {
        var names = name.split(".");
        var leafName = names.pop();
        var baseRefName = names.join(".");
        var baseNames = names.slice(0);
        names.push(leafName);

        var onundefinedSet = (onundefined=="null"||onundefined=="undefined")? "throw":onundefined;

    	function get() {
    		if (arguments.length==1) {
                var subnames = (typeof arguments[0] == "object")? arguments[0] : arguments[0].split(".");
	        	var r = _resolve(names,subnames,onundefined);
    			//TODO onundefined for the arg
	        	return r;
    		} else {
	        	var base = _resolve(names,null,onundefined);
	        	return base;
    		}
        }
        function toggle() {
            if (arguments.length > 1) {
                var subnames = (typeof arguments[0] == "object")? arguments[0] : arguments[0].split(".");
                var symbol = subnames.pop();
                var base = _resolve(names,subnames,onundefinedSet);
                var combined = names.concat(subnames);
                var parentName = combined.join(".");
                subnames.push(symbol);
                value = !arguments[1]; //TODO configurable toggle

                if (_setValue(value,combined,base,symbol)) {
                    var childRef = resolver.references[parentName + "." + symbol];
                    if (childRef) childRef._callListener("change",combined,base,symbol,value);
                    var parentRef = resolver.references[parentName];
                    if (parentRef) parentRef._callListener("change",combined,base,symbol,value);
                }
            } else {
                var base = _resolve(baseNames,null,onundefinedSet);

                if (_setValue(value,baseNames,base,leafName)) {
                    this._callListener("change",baseNames,base,leafName,value);
                    //TODO test for triggering specific listeners
                    if (baseRefName) {
                        var parentRef = resolver.references[baseRefName];
                        if (parentRef) parentRef._callListener("change",baseNames,base,leafName,value);
                    }
                }
            }
            return value;
        }
        function set(value) {
        	if (arguments.length > 1) {
        		var subnames = (typeof arguments[0] == "object")? arguments[0] : arguments[0].split(".");
				var symbol = subnames.pop();
	        	var base = _resolve(names,subnames,onundefinedSet);
                var combined = names.concat(subnames);
                var parentName = combined.join(".");
                subnames.push(symbol);
	        	value = arguments[1];

                if (_setValue(value,combined,base,symbol)) {
                    var childRef = resolver.references[parentName + "." + symbol];
                    if (childRef) childRef._callListener("change",combined,base,symbol,value);
                    var parentRef = resolver.references[parentName];
                    if (parentRef) parentRef._callListener("change",combined,base,symbol,value);
                }
        	} else {
				var base = _resolve(baseNames,null,onundefinedSet);

                if (_setValue(value,baseNames,base,leafName)) {
                    this._callListener("change",baseNames,base,leafName,value);
                    //TODO test for triggering specific listeners
                    if (baseRefName) {
                        var parentRef = resolver.references[baseRefName];
                        if (parentRef) parentRef._callListener("change",baseNames,base,leafName,value);
                    }
                }
        	}
			return value;
        }
        function declare(value) {
        	if (arguments.length > 1) {
                var subnames = (typeof arguments[0] == "object")? arguments[0] : arguments[0].split(".");
                var symbol = subnames.pop();
                var base = _resolve(names,subnames,onundefinedSet);
                var combined = names.concat(subnames);
                var parentName = combined.join(".");
                subnames.push(symbol);
                value = arguments[1];

                if (base[symbol] === undefined) {
                    if (_setValue(value,combined,base,symbol)) {
                        var childRef = resolver.references[parentName + "." + symbol];
                        if (childRef) childRef._callListener("change",combined,base,symbol,value);
                        var parentRef = resolver.references[parentName];
                        if (parentRef) parentRef._callListener("change",combined,base,symbol,value);
                    }
                }
                return base[symbol];
        	} else {
                var base = _resolve(baseNames,null,onundefinedSet);

                if (base[leafName] === undefined) {
                    if (_setValue(value,baseNames,base,leafName)) {
                        this._callListener("change",baseNames,base,leafName,value);
                        //TODO test for triggering specific listeners
                        if (baseRefName) {
                            var parentRef = resolver.references[baseRefName];
                            if (parentRef) parentRef._callListener("change",baseNames,base,leafName,value);
                        }
                    }
                }
                return base[leafName];
        	}
        }
    	function getEntry(key) {
        	var base = _resolve(names,null,onundefined);
        	if (arguments.length) return base[key];
        	return base;
        }
        function declareEntry(key,value) {
            var symbol = names.pop();
        	var base = _resolve(names,null,onundefined);
        	names.push(symbol);
        	if (base[symbol] === undefined) _setValue({},names,base,symbol);
        	
        	if (base[symbol][key] === undefined) {
        		names.push(key);
        		if (_setValue(value,names,base[symbol],key)) {
			    	this._callListener("change",names,key,value);
	    	//TODO parent listeners
        		}
	    		names.pop(); // return names to unchanged
        	}
        }
        function setEntry(key,value) {
            var symbol = names.pop();
        	var base = _resolve(names,null,onundefined);
        	names.push(symbol);
        	if (base[symbol] === undefined) _setValue({},names,base,symbol);
        	
    		names.push(key);
    		if (_setValue(value,names,base[symbol],key)) {
		    	this._callListener("change",names,key,value);
	    	//TODO parent listeners
    		}
    		names.pop(); // return names to unchanged
        }
        function mixin(map) {
            var symbol = names.pop();
        	var base = _resolve(names,null,onundefined);
        	names.push(symbol);
        	if (base[symbol] === undefined) _setValue({},names,base,symbol);
        	var ni = names.length;
        	var mods = {};
        	for(var n in map) {
        		names[ni] = n;
        		if (_setValue(map[n],names,base[symbol],n)) {
        			mods[n] = map[n];
        		}
        	}
        	names.pop(); // return names to unchanged
	    	this._callListener("change",names,null,mods);
	    	//TODO parent listeners
        }
	    function on(type,data,callback) {
	    	if (! type in VALID_LISTENERS) return;//fail

	    	switch(arguments.length) {
	    		case 2: this._addListener(type,name,null,arguments[1]); break;
	    		case 3: this._addListener(type,name,data,callback); break;
	    	};
	    }

	    function trigger(type) {
	    	var base = _resolve(baseNames,null,onundefined);
            var value = base[leafName];

	    	this._callListener(type,baseNames,base,leafName,value);
			var parentRef = resolver.references[baseRefName];
			if (parentRef) parentRef._callListener("change",baseNames,_resolve(baseNames,null),leafName,value);
	    }

        function read_session(ref) {
            var v = sessionStorage[this.id];
            if (v != undefined) {
                var value;
                try { value = JSON.parse(v); }
                catch(ex) {} //TODO consider parse issue
                ref.set(value);
            }
        }
        function read_local(ref) {
            var v = localStorage[this.id];
            if (v != undefined) {
                var value;
                try { value = JSON.parse(v); }
                catch(ex) {} //TODO consider parse issue
                ref.set(value);
            }
        }
        function read_cookie(ref) {
            function readIt(id) {
                var wEQ = id + "=";
                var ca = document.cookie.split(';');
                for(var i=0;i < ca.length;i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1,c.length);
                    if (c.indexOf(wEQ) == 0) return c.substring(wEQ.length,c.length);
                }
                return undefined;
            }
            var value = readIt(this.id);
            if (value != undefined) {
                value = decodeURI(value);
                if (this.options.encoding == "string") {
                    // just use the string
                } else {
                    try { value = JSON.parse(value); }
                    catch(ex) {} //TODO consider parse issue
                }

                //TODO type coercion
                ref._reading_cookie = true;
                ref.set(value);
                delete ref._reading_cookie;
            }
        }

        function store_session(ref) {
            //TODO if (ref is defined)
            try {
                sessionStorage[this.id] = JSON.stringify(ref());
            } catch(ex) {} //TODO consider feedback
        }
        function store_local(ref) {
            //TODO if (ref is defined)
            try {
                localStorage[this.id] = JSON.stringify(ref());
            } catch(ex) {} //TODO consider feedback
        }
        function store_cookie(ref) {
            if (ref._reading_cookie) return; //TODO only if same cookie

            var value;
            if (this.options.encoding == "string") {
                // just use the string
                value = encodeURI(ref());
            } else {
                try { value = JSON.stringify(encodeURI(ref())); }
                catch(ex) {} //TODO consider parse issue
            }
            var days = this.options.days;

            if (days) {
                var date = new Date();
                date.setTime(date.getTime()+(days*24*60*60*1000));
                var expires = "; expires="+date.toGMTString();
            }
            else var expires = "";
            document.cookie = this.id+"="+value+expires+"; path=/";

            //TODO force an upload if this is unload
            if (this.options.touchURL) {
                //TODO reload script with url / frequency for uploading cookies
            }
        }

        //TODO support server remote storage mechanism

        // type = change/load/unload
        // dest = local/session/cookie
        function stored(type,dest,options) {
            options = options || {};
            if (/change/.test(type)) {
                if (this.storechanges == undefined) this.storechanges = {};
                var id = "resolver." + resolver.named + "#" + name;
                if (options.id) id = options.id;
                if (options.name) id = options.name;
                switch(dest) {
                    case "session": 
                        this.storechanges.session = { call: store_session, id:id, options: options }; break;
                    case "local":
                        this.storechanges.local = { call: store_local, id:id, options: options }; break;
                    case "cookie":
                        this.storechanges.cookie = { call: store_cookie, id:id, options: options }; break;
                }
            }
            if (/^load| load/.test(type)) {
                if (this.readloads == undefined) {
                    this.readloads = {};
                    Resolver.readloads.push(this);
                }
                var id = "resolver." + resolver.named + "#" + name;
                if (options.id) id = options.id;
                if (options.name) id = options.name;
                switch(dest) {
                    case "session": 
                        this.readloads.session = { call: read_session, id:id, options: options }; break;
                    case "local":
                        this.readloads.local = { call: read_local, id:id, options: options }; break;
                    case "cookie":
                        this.readloads.cookie = { call: read_cookie, id:id, options: options }; break;
                }
            }
            if (/unload/.test(type)) {
                if (this.storeunloads == undefined) {
                    this.storeunloads = {};
                    Resolver.storeunloads.push(this);
                }
                var id = "resolver." + resolver.named + "#" + name;
                if (options.id) id = options.id;
                if (options.name) id = options.name;
                switch(dest) {
                    case "session": 
                        this.storeunloads.session = { call: store_session, id:id, options: options || {} }; break;
                    case "local":
                        this.storeunloads.local = { call: store_local, id:id, options: options || {} }; break;
                    case "cookie":
                        this.storeunloads.cookie = { call: store_cookie, id:id, options: options || {} }; break;
                }
            }
        }    

        get.set = set;
        get.toggle = toggle;
        get.get = get;
        get.declare = declare;
        get.mixin = mixin;
        get.getEntry = getEntry;
        get.declareEntry = declareEntry;
        get.setEntry = setEntry;
        get.on = on;
        get.trigger = trigger;
        get.stored = stored;

        get.listeners = listeners || _makeListeners();

	    function _callListener(type,names,base,symbol,value) {
	    	for(var i=0,event; event = this.listeners[type][i]; ++i) {
	    		event.trigger(base,symbol,value);
	    	}
            if (this.storechanges && type == "change") {
                for(var n in this.storechanges) this.storechanges[n].call(this);
            }
	    }
	    get._callListener = _callListener;
	    
        function _addListener(type,selector,data,callback) {
	    	/*
	    		selector
	    		*
	    		a
	    		a.b
	    		a.b.c
	    	*/
	   		this.listeners[type].push(_makeResolverEvent(resolver,type,selector,data,callback));
	    }
	    get._addListener = _addListener;


        return get;
    };



    resolver.on = function(type,selector,data,callback) 
    {
    	if (! type in VALID_LISTENERS) return;//fail
    	switch(arguments.length) {
    		case 2: break; //TODO
    		case 3: if (typeof arguments[1] == "string") {
			    	this.reference(selector).on(type,null,arguments[2]);
    			} else { // middle param is data
			    	//TODO this.reference("*").on(type,arguments[1],arguments[2]);
    			}
    			break;
    		case 4:
		    	this.reference(selector).on(type,data,callback);
    			break;
    	}
    };
    
    /*
        name = string/array
    */
    resolver.declare = function(name,value,onundefined) 
    {
        var names;
        if (typeof name == "object" && name.join) {
            names = name;
            name = name.join(".");
        } else names = name.split(".");
        var symbol = names.pop();
    	var base = _resolve(names,null,onundefined);
    	if (base[symbol] === undefined) { 
    		if (_setValue(value,names,base,symbol)) {
	    		var ref = resolver.references[name];
	    		if (ref) ref._callListener("change",names,base,symbol,value);
				var parentName = names.join(".");
				var parentRef = resolver.references[parentName];
				if (parentRef) parentRef._callListener("change",names,base,symbol,value);
    		}
    		return value;
    	} else return base[symbol];
    };

    /*
        name = string/array
    */
    resolver.set = function(name,value,onundefined) 
    {
        var names;
        if (typeof name == "object" && name.join) {
            names = name;
            name = name.join(".");
        } else names = name.split(".");
		var symbol = names.pop();
		var base = _resolve(names,null,onundefined);
		if (_setValue(value,names,base,symbol)) {
			var ref = resolver.references[name];
			if (ref) ref._callListener("change",names,base,symbol,value);
			var parentName = names.join(".");
			var parentRef = resolver.references[parentName];
			if (parentRef) parentRef._callListener("change",names,base,symbol,value);
		}
		return value;
    };

    resolver.toggle = function(name,onundefined)
    {
        var names;
        if (typeof name == "object" && name.join) {
            names = name;
            name = name.join(".");
        } else names = name.split(".");
        var symbol = names.pop();
        var base = _resolve(names,null,onundefined);
        var value = ! base[symbol]; //TODO configurable toggle
        if (_setValue(value,names,base,symbol)) {
            var ref = resolver.references[name];
            if (ref) ref._callListener("change",names,base,symbol,value);
            var parentName = names.join(".");
            var parentRef = resolver.references[parentName];
            if (parentRef) parentRef._callListener("change",names,base,symbol,value);
        }
        return value;
    };

    resolver.reference = function(name,onundefined) 
    {
    	if (typeof name == "object") {
    		onundefined = name.onundefined;
    		name = name.name;
    	}
    	var ref = onundefined? name+":"+onundefined : name;
    	var entry = this.references[ref];
    	if (entry) return entry;

    	// make the default reference first
    	var defaultRef = this.references[name];
    	if (defaultRef == undefined) {
    		defaultRef = this.references[name] = makeReference(name,onundefined);
    		if (ref == name) return defaultRef;
    	}
    	// if requested reference is different return that one
    	return this.references[ref] = makeReference(name,onundefined,defaultRef.listeners);
    };

    resolver.proxy = function(dest,other,src) {
        other.on("change",src,this,function(ev){
            ev.data.set(dest,ev.value);
        });

        //TODO make proxy removable
    };

    resolver.override = function(ns,options)
    {
        options = options || {};
        var name = options.name || this.named; 
		Resolver[name] = Resolver(ns,options);
		Resolver[name].named = name;
		return Resolver[name];
    };

    resolver.destroy = function()
    {
        //TODO break down listeners
        //TODO clean up references
        for(var n in this.references) delete this.references[n];
    };

    if (options.mixinto) {
    	if (options.mixinto.get==null) options.mixinto.get = resolver;
    	if (options.mixinto.declare==null) options.mixinto.declare = resolver.declare;
    	if (options.mixinto.set==null) options.mixinto.set = resolver.set;
    	if (options.mixinto.reference==null) options.mixinto.reference = resolver.reference;
    	if (options.mixinto.override==null) options.mixinto.override = resolver.override;
    	if (options.mixinto.on==null) options.mixinto.on = resolver.on;
    }

    return resolver;
}

Resolver.readloads = [];
Resolver.storeunloads = [];

Resolver.hasGenerator = function(subject) {
	if (subject.__generator__) return true;
	if (typeof subject == "function" && typeof subject.type == "function") return true;
	return false;
};

Resolver({},{ name:"default" });

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
				//TODO consider different strategies for JS engine
				instance.constructor = info.constructors[0]; // make the correct constructor appear in debuggers
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
        if (options.prototype)
            for(var n in options.prototype) generator.prototype[n] = options.prototype[n];
		mainConstr.prototype = generator.prototype;
		//TODO generator.fn = generator.prototype
		

		return generator;
	})(arguments);

	Resolver(generator.prototype,{ mixinto:generator, generator: Generator.ObjectGenerator });

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
			if (typeof name == "string") {
				var g = this.variants[name];
				if (g && g.generator) return g.generator;
			} else {
				// array like list of alternatives
				for(var i=0,n; n = name[i]; ++i) {
					var g = this.variants[n];
					if (g && g.generator) return g.generator;
				}				
			}
			var g = this.variants[""]; // default generator
			if (g && g.generator) return g.generator;
			return this;			
		} else {	// Set the variant generator
			var handlers = variantConstr.handlers;
			var bases = variantConstr.bases;
			var generator = Generator(variantConstr);
			this.variants[name] = { 
				func: variantConstr,
				generator: generator,
				handlers: handlers || {},
				bases: bases || [],
				additional: [v1,v2,v3,v4] 
			};
			return generator; 
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
			this.info.singleton = false;
			this.info.existing = null;
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
Generator.ObjectGenerator = Generator(Object);


