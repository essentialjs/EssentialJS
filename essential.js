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
        var names = [], leafName, baseRefName = "", baseNames = [];
        if (name!=="" && name!=null) {
            names = name.split(".");
            leafName = names.pop();
            baseRefName = names.join(".");
            baseNames = names.slice(0);
            names.push(leafName);
        }

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
            var value; //TODO
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
        function mixinto(target) {
            var base = _resolve(names,null,onundefined);
            for(var n in base) {
                target[n] = base[n];
            }
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
            var v;
            if (window.localStorage) v = localStorage[this.id];
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

            //TODO different name? reloadResource
            if (this.options.touchScript) {
                //TODO swap script with the id. If cachebuster param update timestamp
                var script = document.getElementById(this.options.touchScript);
                if (script) {
                    var newScript = Resolver("essential")("HTMLScriptElement")(script);
                    script.parentNode.replaceChild(newScript,script);
                }
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
        get.mixinto = mixinto;
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
            var ev = _makeResolverEvent(resolver,type,selector,data,callback);

            if (/^bind | bind | bind$|^bind$/.test(type)) {
                type = type.replace(" bind ","").replace("bind ","").replace(" bind","");
                this.listeners[type].push(ev);

                var baseNames = selector.split(".");
                var leafName = baseNames.pop();
                var base = _resolve(baseNames,null,"undefined");
                ev.trigger(base,leafName,base == undefined? undefined : base[leafName]);
            } else {
                this.listeners[type].push(ev);
            }
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

    function clone(src) {
        switch(src) {
            case "function":
                // if (src is reference) src()
                return src;
            case "object":
                var r = {};
                for(var n in src) r[n] = src[n];
                return r;

            // "undefined"   "boolean"  "number"  case "string"
            default:
                return src;
        }
    }


    resolver.reference = function(name,onundefined) 
    {
        name = name || "";
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

Resolver.exists = function(name) {
    return this[name] != undefined;
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


	function simpleBaseGenerator(a,b,c,d,e,f,g,h,i,j,k,l) {
		var instance,cst=info.constructors[0],
			__context__ = { generator:generator, info:info, args:[a,b,c,d,e,f,g,h,i,j,k,l] }; //TODO inject morphers that change the args for next constructor
		if (generator.info.existing) {
			//TODO perhaps different this pointer
			var id = generator.info.identifier.apply(generator.info,arguments);
			if (id in generator.info.existing) {
				return instance = generator.info.existing[id];
			} else {
				instance = generator.info.existing[id] = generator.type.apply(null,__context__.args);
				//TODO consider different strategies for JS engine
			}
		} else {
			instance = generator.type.apply(null,__context__.args);
		}

		// constructors
		instance.__context__ = __context__;
		for(var i=1; cst=info.constructors[i]; ++i) {
			cst.apply(instance,instance.__context__.args);
		}
		delete instance.__context__;

		return instance;
	}


	function simpleGenerator(a,b,c,d,e,f,g,h,i,j,k,l) {
		var instance,cst=info.constructors[0],
			__context__ = { generator:generator, info:info, args:[a,b,c,d,e,f,g,h,i,j,k,l] }; //TODO inject morphers that change the args for next constructor

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
		//TODO presets should be set on the reference. the reference should insert this function in the 
		// chain when the first preset is declared
		generator.presets.reference("").mixinto(this);
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

		// simple type with inheritance chain, fresh prototype
		function type() {}
		var generatorType = type;

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

		// is base simple?
		var simpleBase = false;
		if (bases.length && constructors[0].__generator__) {
			simpleBase = constructors[0].__generator__.info.options.alloc == false;
		}
		if (simpleBase || options.alloc === false) {
			generatorType = constructors.shift();
		}

		// determine the generator to use
		var generator = newGenerator;
		if (simpleBase) generator = simpleBaseGenerator;
		else if (options.alloc === false) generator = simpleBaseGenerator;
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

		//TODO if (generator.info.constructors[-1].name) type.name = generator.info.constructors[-1].name;
		generator.type = generatorType;
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
	//TODO way to flag preset/arg for leaf key when generator used by resolver

	
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



/*jslint white: true */
// types for describing generator arguments and generated properties
!function (win) {
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{});

	var isFileProtocol = (location.protocol === 'file:'    ||
	                      location.protocol === 'chrome:'  ||
	                      location.protocol === 'chrome-extension:'  ||
	                      location.protocol === 'resource:');

	essential.declare("isFileProtocol",isFileProtocol);

	var serverMode = (location.hostname == '127.0.0.1' ||
	                        location.hostname == '0.0.0.0'   ||
	                        location.hostname == 'localhost' ||
	                        location.port.length > 0         ||
	                        isFileProtocol                   ? 'development'
	                                                         : 'production');
	essential.declare("serverMode",serverMode);

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
	
	function arrayContains(array,item) {
		if (array.indexOf) return array.indexOf(item) >= 0;

		for(var i=0,e; e = array[i]; ++i) if (e == item) return true;
		return false;
	}
	essential.declare("arrayContains",arrayContains);

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
	ArraySet.prototype.item = function(index) {
		return this[index]; // use native array
	};

	ArraySet.prototype.contains = 
	ArraySet.prototype.has = function(value) {
		var entry = this._set[value];
		// single existing same value
		if (entry === value) return true;
		// single existing different value
		if (typeof entry != "object" || !entry.multiple_values) return false;
		// multiple existing
		return arrayContains(entry,value);
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

	ArraySet.prototype.add = function(value) {
		var entry = this._set[value];
		if (entry === undefined) {
			this._set[value] = value;
			this.push(value);
		} else {
			// single existing same value
			if (entry === value) return;
			// single existing different value
			if (typeof entry != "object" || !entry.multiple_values) {
				entry = this._set[value] = [entry];
				entry.multiple_values = true;
			}
			// single or multiple existing
			if (!arrayContains(entry,value)) {
				entry.push(value);
				this.push(value);
			}
		}

	};
	ArraySet.prototype.remove = function(value) {
		var entry = this._set[value];
		// single existing
		if (entry === undefined) return;
		if (entry === value) {
			for(var i=this.length-1; i>=0; --i) if (this[i] === value) this.splice(i,1);
			delete this._set[value];
			return;
		}
		// single existing different value 
		if (typeof entry != "object" || !entry.multiple_values) return;

		// multiple existing
		for(var i=this.length-1; i>=0; --i) if (this[i] === value) this.splice(i,1);
		for(var i=entry.length-1; i>=0; --i) if (entry[i] === value) entry.splice(i,1);
		if (entry.length==0) delete this._set[value];
	};

	ArraySet.prototype.toggle = function(id) {
		if (this.has(id)) this.remove(id);
		else this.add(id);
	};
	
	ArraySet.prototype.separator = " ";

	//TODO why doesn't this seem to be called for String(ArraySet) ?
	ArraySet.prototype.toString = function() {
		return this.join(this.separator);
	};

	function escapeJs(s) {
		return s.replace(/\\\\\\"/g,'\\\\\\\\"').replace(/\\\\"/g,'\\\\\\"').replace(/\\"/g,'\\\\"').replace(/"/g,'\\"');
	}
	essential.set("escapeJs",escapeJs);
	

	function _DOMTokenList() {

	}
	var DOMTokenList = essential.set("DOMTokenList",Generator(_DOMTokenList,ArraySet,Array)); //TODO support this

	DOMTokenList.prototype.emulateClassList = true;

	// use this for native DOMTokenList
	DOMTokenList.set = function(as,id,value) {
		if (typeof id == "object"); //TODO set map removing rest
		if (value) { // set true
			as.add(id);
		} else { // set false
			as.remove(id);
		}
	};

	DOMTokenList.mixin = function(dtl,mix) {
		if (mix.split) { // string
			var toset = mix.split(" ");
			for(var i=0,entry; entry = toset[i]; ++i) dtl.add(entry);
			return;
		}
		if (mix.length) {
			for(var i=0,entry; entry = mix[i]; ++i) dtl.add(entry);
			return;
		}
		for(var n in mix) dtl.set(n,mix[n]);
	}

	DOMTokenList.tmplClass = function(el,prefix,postfix,value) {
		var classList = el.classList;
		for(var i = classList.length-1; i>=0; --i) {
			var name = classList.item(i);
			var hasPrefix = prefix? name.substring(0,prefix.length)==prefix : true;
			var hasPostfix = postfix? name.substring(name.length-postfix.length,name.length)==postfix : true;
			if (hasPrefix && hasPostfix) classList.remove(name);
		}
		if (value) classList.add( (prefix||"") + value + (postfix||"") );

		if (classList.emulateClassList)
		 {
			//TODO make toString override work on IE, el.className = el.classList.toString();
			el.className = el.classList.join(el.classList.separator);
		}
	};

	DOMTokenList.eitherClass = function(el,trueName,falseName,value) {
		var classList = el.classList;
		var removeName = value? falseName:trueName;
		var addName = value? trueName:falseName;
		if (removeName) classList.remove(removeName);
		if (addName) classList.add(addName);

		if (classList.emulateClassList)
		 {
			//TODO make toString override work on IE, el.className = el.classList.toString();
			el.className = el.classList.join(el.classList.separator);
		}
	}
	
	//TODO regScriptOnnotfound (onerror, status=404)
	
	// (tagName,{attributes},content)
	// ({attributes},content)
	function HTMLElement(tagName,from,content_list,_document) {
		var c_from = 2, c_to = arguments.length-1, _tagName = tagName, _from = from;
		
		// optional document arg
		var d = arguments[c_to];
		var _doc = document;
		if (typeof d == "object" && d && "doctype" in d && c_to>1) { _doc = d; --c_to; }
		
		// optional tagName arg
		if (typeof _tagName == "object") { 
			_from = _tagName; 
			_tagName = _from.tagName || "span"; 
			--c_from; 
		}

		// real element with attributes
		if (_from && _from.nodeName && _from.attributes && _from.nodeName[0] != "#") {
			var __from = {};
			for(var i=0,a; a = _from.attributes[i]; ++i) {
				__from[a.name] = a.value;
			}
			_from = __from;
		}
		
		var e = _doc.createElement(_tagName);
		for(var n in _from) {
			switch(n) {
				case "tagName": break; // already used
				case "class":
					if (_from[n] !== undefined) e.className = _from[n]; 
					break;
				case "style":
					//TODO support object
					if (_from[n] !== undefined) e.style.cssText = _from[n]; 
					break;
					
				case "src":
					if (_from[n] !== undefined) {
						e[n] = _from[n];
						if (/cachebuster=/.test(_from[n])) {
							e[n] = e[n].replace(/cachebuster=*[0-9]/,"cachebuster="+ String(new Date().getTime()));
						}
					}
					break;

				case "id":
				case "className":
				case "rel":
				case "lang":
				case "language":
				case "type":
					if (_from[n] !== undefined) e[n] = _from[n]; 
					break;
				//TODO case "onprogress": // partial script progress
				case "onload":
					regScriptOnload(e,_from.onload);
					break;
				case "onclick":
				case "onmousemove":
				case "onmouseup":
				case "onmousedown":
					if (e.addEventListener) e.addEventListener(n.substring(2),_from[n],false);
					else if (e.attachEvent) e.attachEvent(n,_from[n]);
					break;
				default:
					if (_from[n] != null) e.setAttribute(n,_from[n]);
					break;
			}
		}
		var l = [];
		for(var i=c_from; i<=c_to; ++i) {
			var p = arguments[i];
			if (typeof p == "object" && "length" in p) l.concat(p);
			else if (typeof p == "string") l.push(arguments[i]);
		}
		if (l.length) {
			//TODO _document
			_document = document;
			var drop = _document._inner_drop;
			if (drop == undefined) {
				drop = _document._inner_drop = _document.createElement("DIV");
				_document.body.appendChild(drop);
			}
			drop.innerHTML = l.join("");	
			for(var c = drop.firstElementChild||drop.firstChild; c; c = drop.firstElementChild||drop.firstChild) e.appendChild(c);
		} 
		
		//TODO .appendTo function
		
		return e;
	}
	essential.set("HTMLElement",HTMLElement);
	
	
	//TODO element cleaner must remove .el references from listeners

	// this = element
	function regScriptOnload(domscript,trigger) {

		domscript.onload = function(ev) { 
			if ( ! this.onloadDone ) {
				this.onloadDone = true;
				trigger.call(this,ev || event); 
			}
		};
		domscript.onreadystatechange = function(ev) { 
			if ( ( "loaded" === this.readyState || "complete" === this.readyState ) && ! this.onloadDone ) {
				this.onloadDone = true; 
				trigger.call(this,ev || event);
			}
		}

	}

	//TODO regScriptOnnotfound (onerror, status=404)

	function HTMLScriptElement(from,doc) {
		return HTMLElement("SCRIPT",from,doc);
	}
	essential.set("HTMLScriptElement",HTMLScriptElement);

	var contains;
	function doc_contains(a,b) {
		return a !== b && (a.contains ? a.contains(b) : true);
	}
	function cdp_contains(a,b) {
		return !!(a.compareDocumentPosition(b) & 16);
	}
	function false_contains(a,b) { return false; }

	if (document.documentElement.contains) {
		contains = doc_contains;
	} else if (document.documentElement.compareDocumentPosition) {
		contains = cdp_contains;
	} else {
		contains = false_contains;
	}
	essential.declare("contains",contains);

	/*
		DOM Events
	*/
    
	function copyKeyEvent(src) {
		this.altKey = src.altKey;
		this.shiftKey = src.shiftKey;
		this.ctrlKey = src.ctrlKey;
		this.metaKey = src.metaKey;
		this.charCode = src.charCode;
	}
	function copyInputEvent(src) {
		copyKeyEvent.call(this,src);
	}
	function copyNavigateEvent(src) {
		copyKeyEvent.call(this,src);
	}
	function copyMouseEvent(src) {
		this.clientX = src.clientX;
		this.clientY = src.clientY;
		this.pageX = src.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		this.pageY = src.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		this.screenX = src.screenX;
		this.screenY = src.screenY;
		this.button = BUTTON_MAP[src.button]; //TODO check map
		this.buttons = src.button;
		//detail is repetitions
		//which == 1,2,3
	}
	function copyMouseEventOverOut(src) {
		copyMouseEvent.call(this,src);
		this.fromElement = src.fromElement;
		this.toElement = src.toElement;
		this.relatedTarget = src.relatedTarget;
	}
	var BUTTON_MAP = { "1":0, "2":2, "4":1 };
	var EVENTS = {
		// compositionstart/element/true compositionupdate/element/false
		"click" : {
			type: "MouseEvents",
			cancelable:false, //true
			copyEvent: copyMouseEvent
		},
		"dblclick" : {
			type: "MouseEvents",
			cancelable:false,
			copyEvent: copyMouseEvent
		},
		"contextmenu": {
			cancelable:false,
			copyEvent: copyMouseEvent
		},
		"mousemove": {
			type: "MouseEvents",
			cancelable:true,
			copyEvent: copyMouseEvent
		},
		"mouseup": {
			type: "MouseEvents",
			cancelable:true,
			copyEvent: copyMouseEvent
		},
		"mousedown": {
			type: "MouseEvents",
			cancelable:true,
			copyEvent: copyMouseEvent
		},
		"mousewheel": {
			cancelable:false,
			copyEvent: copyMouseEvent
		},
		"wheel": {
			cancelable:true,
			copyEvent: copyMouseEvent
		},
		"mouseenter": {
			type: "MouseEvents",
			cancelable:false,
			copyEvent: copyMouseEvent
		},
		"mouseleave": {
			type: "MouseEvents",
			cancelable:false,
			copyEvent: copyMouseEvent
		},
		"mouseout": {
			type: "MouseEvents",
			cancelable:true,
			copyEvent: copyMouseEventOverOut
		},
		"mouseover": {
			type: "MouseEvents",
			cancelable:true,
			copyEvent: copyMouseEventOverOut
		},

		"keyup": {
			cancelable:true,
			copyEvent: copyKeyEvent
		},
		"keydown": {
			cancelable:true,
			copyEvent: copyKeyEvent
		},
		"keypress": {
			cancelable:true,
			copyEvent: copyKeyEvent
		},

		"blur": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"focus": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"focusin": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"focusout": {
			cancelable:false,
			copyEvent: copyInputEvent
		},

		"copy": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"cut": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"change": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"input": {
			cancelable:false,
			copyEvent: copyInputEvent
		},
		"textinput": {
			cancelable:false,
			copyEvent: copyInputEvent
		},

		"scroll": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"reset": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"submit": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"select": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},

		"error": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"haschange": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"load": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"unload": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},
		"resize": {
			cancelable:false,
			copyEvent: copyNavigateEvent
		},


		"":{}
	};

	function MutableEvent_withActionInfo() {
		var element = this.target;
		// role of element or ancestor
		// TODO minor tags are traversed; Stop at document, header, aside etc
		
		while(element && element.tagName) {
			if (element.getElementById || element.getAttribute == undefined) return this; // document element not applicable

			var role = element.getAttribute("role");
			switch(role) {
				case "button":
				case "link":
				case "menuitem":
					this.stateful = element.stateful;
					//TODO configuration option for if state class map
					this.commandRole = role;
					this.commandElement = element;
					this.ariaDisabled = element.getAttribute("aria-disabled") != null;

					//determine commandName within action object
					this.commandName = element.getAttribute("data-name") || element.getAttribute("name"); //TODO name or id
					//TODO should links deduct actions and name from href
					element = null;
					break;
				case null:
					switch(element.tagName) {
						case "BUTTON":
						case "button":
							//TODO if element.type == "submit" && element.tagName == "BUTTON", set commandElement
							//TODO which submit buttons to turn stateful
							if (element.type == "submit") {
								this.stateful = element.stateful;
								//TODO configuration option for if state class map
								this.commandElement = element;
								this.ariaDisabled = element.getAttribute("aria-disabled") != null;
								this.commandName = element.getAttribute("data-name") || element.getAttribute("name"); //TODO name or id
								element = null;
							}
							break;
					}
					break;
			}
			if (element) element = element.parentNode;
		}
		if (this.commandElement == undefined) return this; // no command

		element = this.commandElement;
		while(element && element.tagName) {
			var action = element.getAttribute("action");
			if (action) {
				this.action = action;
				this.actionElement = element;
				element = null;
			}			
			if (element) element = element.parentNode;
		}

		return this;
	}

	function MutableEvent_withDefaultSubmit(form) {
		var commandName = "trigger";
		var commandElement = null;

		if (form.elements) {
			for(var i=0,e; e=form.elements[i]; ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
		} else {
			var buttons = form.getElementsByTagName("button");
			for(var i=0,e; e=buttons[i]; ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
			var inputs = form.getElementsByTagName("input");
			if (commandElement) for(var i=0,e; e=inputs[i]; ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
		}
		this.action = form.action;
		this.actionElement = form;
		this.commandElement = commandElement;
		this.commandName = commandName;

		return this;
	}


	function _MutableEvent(src) {
		this._original = src;
		this.type = src.type;
		this.target = src.target || src.srcElement;
		this.currentTarget = src.currentTarget|| src.target; 
		EVENTS[src.type].copyEvent.call(this,src);
	}
	_MutableEvent.prototype.relatedTarget = null;
	_MutableEvent.prototype.withActionInfo = MutableEvent_withActionInfo;
	_MutableEvent.prototype.withDefaultSubmit = MutableEvent_withDefaultSubmit;

	_MutableEvent.prototype.stopPropagation = function() {
		this._original.cancelBubble= true;
	};

	_MutableEvent.prototype.preventDefault = function() {
		this.defaultPrevented = true;
	};

	_MutableEvent.prototype.isDefaultPrevented = function() {
		return this.defaultPrevented;
	};

    _MutableEvent.prototype.CAPTURING_PHASE = 1;
	_MutableEvent.prototype.AT_TARGET = 2;
	_MutableEvent.prototype.BUBBLING_PHASE = 3;
    
    // trigger like jQuery
    _MutableEvent.prototype.trigger = function() {
        this.target.fireEvent("on" + this.type, this._original);
    };
    
    function _NativeEventIE(type,props) {
        var event = new _MutableEvent( document.createEventObject() );
        if (props) for (var name in props) event._original[name] = props[name];
        return event;
    }
    
    function _NativeEvent(type, props) {
        var event = document.createEvent(EVENTS[type].type || "Events"), bubbles = true;
        if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name]);
        event.initEvent(type, bubbles, EVENTS[type].cancelable, null, null, null, null, null, null, null, null, null, null, null, null);
        event.isDefaultPrevented = _MutableEvent.prototype.isDefaultPrevented;
        event.trigger = function(target) { (target || this.target).dispatchEvent(this); };
        return event;
    }

	//TODO consider moving ClonedEvent out of call
	function MutableEventModern(sourceEvent,props) {
        if (typeof sourceEvent == "string") return _NativeEvent(sourceEvent,props);
        
		if (sourceEvent.withActionInfo) return sourceEvent;
		function ClonedEvent() {
            this._original = sourceEvent;
			this.withActionInfo = MutableEvent_withActionInfo;
			this.withDefaultSubmit = MutableEvent_withDefaultSubmit;
            this.stopPropagation = function() { sourceEvent.stopPropagation(); };
            this.preventDefault = function() { sourceEvent.preventDefault(); };
	        this.isDefaultPrevented = _MutableEvent.prototype.isDefaultPrevented;
        }
		ClonedEvent.prototype = sourceEvent; 

		return  new ClonedEvent();
	}

	function MutableEventFF(sourceEvent,props) {
        if (typeof sourceEvent == "string") return _NativeEvent(sourceEvent,props);

        sourceEvent.withActionInfo = MutableEvent_withActionInfo;
		sourceEvent.withDefaultSubmit = MutableEvent_withDefaultSubmit;
	    sourceEvent.isDefaultPrevented = _MutableEvent.prototype.isDefaultPrevented;

		return sourceEvent;
	}

	function MutableEventIE(sourceEvent,props) {
        if (typeof sourceEvent == "string") return _NativeEventIE(sourceEvent,props);

        if (sourceEvent && sourceEvent.withActionInfo) return sourceEvent;
		return new _MutableEvent(sourceEvent == null? window.event : sourceEvent);
	}

	var MutableEvent;
	//TODO IE9 ?
	if (navigator.userAgent.match(/Firefox\//)) MutableEvent = essential.declare("MutableEvent",MutableEventFF);
	else if (navigator.userAgent.match(/MSIE /) && !navigator.userAgent.match(/Opera/)) MutableEvent = essential.declare("MutableEvent",MutableEventIE);
	else MutableEvent = essential.declare("MutableEvent",MutableEventModern);

	/**
	 * Cleans up registered event listeners and other references
	 * 
	 * @param {Element} el
	 */
	function callCleaners(el)
	{
		var _cleaners = el._cleaners, c;
		if (_cleaners != undefined) {
			do {
				c = _cleaners.pop();
				if (c) c.call(el);
			} while(c);
			_cleaners = undefined;
		}
	};
	essential.declare("callCleaners",callCleaners);

	//TODO recursive clean of element and children?
	function cleanRecursively(el) {
		callCleaners(el);
		for(var child=el.firstElementChild || el.firstChild; child; child = child.nextElementSibling || child.nextSibling) {
			cleanRecursively(child);
		}
	}
	essential.declare("cleanRecursively",cleanRecursively);

	// map of uniqueId referenced
	var enhancedElements = essential.declare("enhancedElements",{});

	// open windows
	var enhancedWindows = essential.declare("enhancedWindows",[]);

	function defaultEnhancedRefresh(desc) {

	}

	// used to emulate IE uniqueId property
	var lastUniqueId = 555;

	// Get the enhanced descriptor for and element
	function EnhancedDescriptor(el,force) {
		var uniqueId = el.uniqueId;
		if (uniqueId == undefined) uniqueId = el.uniqueId = ++lastUniqueId;
		var desc = enhancedElements[uniqueId];
		if (desc && !force) return desc;

		var roles = el.getAttribute("role").split(" ");
		var desc = {
			"roles": roles,
			"role": roles[0], //TODO document that the first role is the switch for enhance
			"el": el,
			"instance": null,
			"layout": {
				"displayed": !(el.offsetWidth == 0 && el.offsetHeight == 0),
				"lastDirectCall": 0
			},

			"refresh": defaultEnhancedRefresh,

			"liveCheck": function() {
				if (!this.enhanced || this.discarded) return;
				var inDom = contains(document.body,this.el);
				if (!inDom) {
					// discard it
					//TODO anything else ?
					callCleaners(this.el);
					delete this.el;
					this.discarded = true;					
				}
			},

			"enhanced": false,
			"discarded": false
		};
		desc.uniqueId = uniqueId;
		enhancedElements[uniqueId] = desc;
		return desc;
	}
	EnhancedDescriptor.all = enhancedElements;
	essential.declare("EnhancedDescriptor",EnhancedDescriptor);

	function discardEnhancedElements() 
	{
		for(var n in enhancedElements) {
			var desc = enhancedElements[n];
			if (desc.el) {
				callCleaners(desc.el); //TODO perhaps use cleanRecursively
				delete desc.el;
			}
			delete enhancedElements[n];
		}
		enhancedElements = essential.set("enhancedElements",{});
	}

	function maintainEnhancedElements() {

		for(var n in enhancedElements) {
			var desc = enhancedElements[n];

			desc.liveCheck();
			if (desc.enhanced) {
				if (!desc.discarded) {
					// maintain it
					desc.refresh();
				} else {
					delete enhancedElements[n];
				}
			}
		}
	}
	var enhancedElementsMaintainer = setInterval(maintainEnhancedElements,330); // minimum frequency 3 per sec

	function discardEnhancedWindows() {
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			if (w.window) w.window.close();
		}
		enhancedWindows = null;
		essential.set("enhancedWindows",[]);
	}

	function instantiatePageSingletons()
	{
		for(var i=0,g; g = Generator.restricted[i]; ++i) {
			if (g.info.lifecycle == "page") { // TODO  && g.info.existing[g.info.identifier(..)] == undefined
				g();
			}
		}
	}
	essential.set("instantiatePageSingletons",instantiatePageSingletons);

	function discardRestricted()
	{
		for(var i=Generator.restricted-1,g; g = Generator.restricted[i]; --i) {
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

	var _readyFired = false;

	function fireDomReady()
	{
		if (_readyFired) return;
		_readyFired = true;

		//TODO derive state.lang and locale from html.lang
		
		// stored entires	
		for(var i=0,ref; ref = Resolver.readloads[i]; ++i) {
			for(var n in ref.readloads) {
				ref.readloads[n].call(ref);
			}
		}

		try {
			essential("_queueDelayedAssets")();
			essential.set("_queueDelayedAssets",function(){});

			instantiatePageSingletons();
		}
		catch(ex) {
			console.error("Failed to launch delayed assets and singletons",ex);
			//debugger;
		}
	}
	function fireLoad()
	{
		
	}
	function fireUnload()
	{
		//TODO singleton deconstruct / before discard?

		// stored entires	
		for(var i=0,ref; ref = Resolver.storeunloads[i]; ++i) {
			for(var n in ref.storeunloads) {
				ref.storeunloads[n].call(ref);
			}
		}

		discardRestricted();
		clearInterval(enhancedElementsMaintainer);
		discardEnhancedElements();
		discardEnhancedWindows();

		for(var n in Resolver) {
			if (typeof Resolver[n].destroy == "function") Resolver[n].destroy();
		}
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
			win.addEventListener("unload",fireUnload,false);
		} else {
			win.attachEvent("onunload",fireUnload);
		}
	}

	var proxyConsole = essential.declare("console",{});
	function setStubConsole() {
		function no_logging(level,parts) {}
 
		proxyConsole["log"] = function() { 
			no_logging("none",arguments); };
		proxyConsole["trace"] = function() { 
			no_logging("trace",arguments); };
		proxyConsole["debug"] = function() { 
			no_logging("debug",arguments); };
		proxyConsole["info"] = function() { 
			no_logging("info",arguments); };
		proxyConsole["warn"] = function() { 
			no_logging("warn",arguments); };
		proxyConsole["error"] = function() { 
			no_logging("error",arguments); };
		proxyConsole["group"] = function() { 
			no_logging("group",arguments); };
		proxyConsole["groupEnd"] = function() { 
			no_logging("groupEnd",arguments); };
	}
	essential.declare("setStubConsole",setStubConsole);
 
	function setWindowConsole() {
		proxyConsole["log"] = function() { 
			window.console.log.apply(window.console,arguments); };
		proxyConsole["trace"] = function() { 
			window.console.trace(); };
		proxyConsole["debug"] = function() { 
			(window.console.debug || window.console.info).apply(window.console,arguments); };
		proxyConsole["info"] = function() { 
			window.console.info.apply(window.console,arguments); };
		proxyConsole["warn"] = function() { 
			window.console.warn.apply(window.console,arguments); };
		proxyConsole["error"] = function() { 
			window.console.error.apply(window.console,arguments); };
 
		if (window.console.debug == undefined) {
			// IE8
			proxyConsole["log"] = function(m) { 
				window.console.log(m); };
			proxyConsole["trace"] = function(m) { 
				window.console.trace(); };
			proxyConsole["debug"] = function(m) { 
				window.console.log(m); };
			proxyConsole["info"] = function(m) { 
				window.console.info(m); };
			proxyConsole["warn"] = function(m) { 
				window.console.warn(m); };
			proxyConsole["error"] = function(m) { 
				window.console.error(m); };
		}
	}
	essential.declare("setWindowConsole",setWindowConsole);
	
	if (window.console) setWindowConsole();
	else setStubConsole();

	function htmlEscape(str) {
		if (str == null) return str;
		return String(str)
			.replace(/&/g,'&amp;')
			.replace(/"/g,'&amp;')
			.replace(/'/g,'&amp;')
			.replace(/</g,'&amp;')
			.replace(/>/g,'&amp;');
		//TODO list of tags to retain, replace them back from escaped
	}
	essential.declare("htmlEscape",htmlEscape);

	var translations = Resolver("translations",{});
	var defaultLocale = window.navigator.userLanguage || window.navigator.language || "en"
	translations.declare("defaultLocale",defaultLocale);
	translations.declare("locale",defaultLocale);

	translations.on("change","locale",function(ev) {
		var s = ev.value.split("-");
		if (s.length == 1) s = ev.value.split("_");
		if (Resolver.exists("page")) Resolver("page").set("state.lang",s[0]);
	});

	/*
		locales.de = { chain:"en" }
	*/
	translations.declare("locales",{});
	translations.declare("keys",{});	// [ context, key, locale] 
	translations.declare("phrases",{});	// [ context, phrase, locale]

	function defaultLocaleConfig(locale) {
		var config = {};
		var split = locale.split("-");
		if (locale == "en") {
			// English has no default
		} if (split.length == 1) {
			// default to english
			config.chain = "en";
		} else {
			// chain to base language
			config.chain = split[0];
		}

		return config;
	}

	function setLocales(locales) {
		for(var i=0,l; l = locales[i]; ++i) {
			l = l.toLowerCase().replace("_","-");
			this.declare(["locales",l],defaultLocaleConfig(l));
		} 
	}

	function setKeysForLocale(locale,context,keys,BucketGenerator) {
		for(var key in keys) {
			if (BucketGenerator) this.declare(["keys",context,key],BucketGenerator())
			this.set(["keys",context, key, locale.toLowerCase().replace("_","-")],keys[key]); //TODO { generator: BucketGenerator }
			//TODO reverse lookup
		}
	}
	translations.setLocales = setLocales;
	translations.setKeysForLocale = setKeysForLocale;

	// (key,params)
	// ({ key:key },params)
	// ({ key:key, context:context },params)
	// ({ phrase:phrase },params)
	function translate(key,params) {
		var phrase = null;
		var context = null;
		if (typeof key == "object") {
			phrase = key.phrase;
			context = key.context || null;
			key = key.key;
		}
		var locales = translations("locales");
		var locale = translations("locale");
		if (locale) locale = locale.toLowerCase().replace("_","-");
		var t,l;
		var base;
		if (key) {
			base = translations.get(["keys",context,key],"undefined")
			while(t == undefined && base && locale) {
				t = base[locale];
				if (locales[locale]) locale = locales[locale].chain;
				else locale = null;
			}
		} else if (phrase) {
			base = translations.get(["phrases",context,phrase],"undefined");
			while(t == undefined && base && locale) {
				t = base[locale];
				if (locales[locale]) locale = locales[locale].chain;
				else locale = null;
			}
		}
		if (t) {
			if (params) {
				if (base.begin && base.end)
					for(var n in params) {
						t = t.replace(base.begin + n + base.end,params[n]);
					}
			}
			return t;
		}

		return phrase;
	}
	translations.translate = translate;
	translations._ = translate;
	essential.set("translate",translate); 
 
 }(window);


/*jslint white: true */
/*
	StatefulResolver and ApplicationConfig
*/
!function() {

	var essential = Resolver("essential",{}),
		console = essential("console"),
		DOMTokenList = essential("DOMTokenList"),
		MutableEvent = essential("MutableEvent"),
		arrayContains = essential("arrayContains"),
		escapeJs = essential("escapeJs"),
		HTMLElement = essential("HTMLElement"),
		HTMLScriptElement = essential("HTMLScriptElement"),
		enhancedElements = essential("enhancedElements"),
		enhancedWindows = essential("enhancedWindows");

	function createHTMLDocument(head,body) {
		if (typeof head == "object" && typeof head.length == "number") {
			head = head.join("");
		}
		if (typeof body == "object" && typeof body.length == "number") {
			body = body.join("");
		}

		// var doc = document.implementation.createDocument('','',
		// 	document.implementation.createDocumentType('body','',''));
		var doc;
		if (document.implementation && document.implementation.createHTMLDocument) {
			doc = document.implementation.createHTMLDocument("");
			doc.documentElement.innerHTML = '<html><head>' + head + '</head><body>' + body + '</body>';

		} else  if (window.ActiveXObject) {
			doc = new ActiveXObject("htmlfile");
			doc.appendChild(doc.createElement("html"));
			var _head = doc.createElement("head");
			var _body = doc.createElement("body");
			doc.documentElement.appendChild(_head);
			doc.documentElement.appendChild(_body);
	debugger;
			_body.innerHTML = body;
			if (head != "") _head.innerHTML = head;

		} else {
			return document.createElement("DIV");// dummy default
		}

		return doc;
	}

	var COPY_ATTRS = ["rel","href","media","type","src","lang","defer","async","name","content","http-equiv","charset"];
	var EMPTY_TAGS = { "link":true, "meta":true, "base":true, "img":true, "br":true, "hr":true, "input":true, "param":true }
	
	function outerHtml(e) {
		var attrs = [e.tagName.toLowerCase()];
		for(var i=0,n; n = COPY_ATTRS[i]; ++i) {
			var a = e[n] || e.getAttribute(n) || null; // tries property first to get absolute urls
			if (a != null) attrs.push(n+'="'+a+'"');
		}
		var tail = "";
		if (! EMPTY_TAGS[attrs[0]]) {
			tail = (e.text || e.innerHTML) + "</" + attrs[0] + ">";
		}

		return "<" + attrs.join(" ") + ">" + tail;
	}


	/* Container for laid out elements */
	function _Layouter(key,el,conf) {

	}
	var Layouter = essential.declare("Layouter",Generator(_Layouter));

	/* Laid out element within a container */
	function _Laidout(key,el,conf) {

	}
	var Laidout = essential.declare("Laidout",Generator(_Laidout));

	var nativeClassList = !!document.documentElement.classList;

	function readElementState(el,state) {
		state.disabled = el.disabled || false; // undefined before attach
		state.readOnly = el.readOnly || false;
		state.hidden = el.getAttribute("hidden") != null;
		state.required = el.getAttribute("required") != null;
	}

	function reflectProperty(el,key,value) {
		el[key] = !!value;
	}

	/*
		Reflect on the property if present otherwise the attribute. 
	*/
	function reflectAttribute(el,key,value) {
		if (typeof el[key] == "boolean") {
			el[key] = !!value;
			return;
		}
		if (value) {
			el.setAttribute(key,key);
		} else {
			el.removeAttribute(key);
		}
	}

	/*
		Reflect only aria property 
	*/
	function reflectAria(el,key,value) {
		if (value) {
			el.setAttribute("aria-"+key,key);
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	/*
		Reflect on property or attribute and aria equivalent. 
	*/
	function reflectAttributeAria(el,key,value) {
		if (typeof el[key] == "boolean") {
			el[key] = !!value;
		} else {
			if (value) {
				el.setAttribute(key,key);
			} else {
				el.removeAttribute(key);
			}
		}
		if (value) {
			el.setAttribute("aria-"+key,key);
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	function reflectAriaProp(el,key,value) {
		el[this.property] = value;
	}

	var state_treatment = {
		disabled: { index: 0, reflect: reflectAria, property:"ariaDisabled" }, // IE hardcodes a disabled text shadow for buttons and anchors
		readOnly: { index: 1, reflect: reflectProperty },
		hidden: { index: 2, reflect: reflectAttribute }, // Aria all elements
		required: { index: 3, reflect: reflectAttributeAria, property:"ariaRequired" }, //TODO ariaRequired
		expanded: { index: 4, reflect: reflectAttributeAria, property:"ariaExpanded" } //TODO ariaExpanded
		//TODO draggable
		//TODO contenteditable
		//TODO checked ariaChecked
		//TODO tooltip
		//TODO hover
		//TODO down ariaPressed
		//TODO ariaHidden
		//TODO ariaDisabled
		//TODO ariaSelected

		//TODO aria-hidden all elements http://www.w3.org/TR/wai-aria/states_and_properties#aria-hidden
		//TODO aria-invalid all elements http://www.w3.org/TR/wai-aria/states_and_properties#aria-invalid

		/*TODO IE aria props
			string:
			ariaPressed ariaSelected ariaSecret ariaRequired ariaRelevant ariaReadonly ariaLive
			ariaInvalid ariaHidden ariaBusy ariaActivedescendant ariaFlowto ariaDisabled


		*/

		//TODO restricted/forbidden tie in with session specific permissions

		//TODO focus for elements with focus
	};

	var DOMTokenList_eitherClass = essential("DOMTokenList.eitherClass");
	var DOMTokenList_mixin = essential("DOMTokenList.mixin");
	var DOMTokenList_tmplClass = essential("DOMTokenList.tmplClass");

	function reflectElementState(event) {
		var el = event.data;
		var treatment = state_treatment[event.symbol];
		if (treatment) {
			// known props
			treatment.reflect(el,event.symbol,event.value);
		} else {
			// extra state
		}

		var mapClass = el.stateful("map.class","undefined");
		if (mapClass) {
			var symbolState = mapClass.state[event.symbol],symbolNotState = mapClass.notstate[event.symbol];
			if (symbolState) {
				var bits = symbolState.split("%");

				if (bits.length > 1) {
					DOMTokenList_tmplClass(el,bits[0],bits[1],event.value);
				} 
				else DOMTokenList_eitherClass(el,symbolState,symbolNotState,event.value);
			}
		} 
	}

	/*
		class = <prefix classes> <model classes> <state classes>
	*/
	function reflectElementClass(event) {
		// state-hover state-active state-disabled
		var stateClasses = [];
		stateClasses[0] = state.disabled? "state-disabled" : "";
	}

	function ClassForState() {

	}
	ClassForState.prototype.disabled = "state-disabled";
	ClassForState.prototype.readOnly = "state-readOnly";
	ClassForState.prototype.hidden = "state-hidden";
	ClassForState.prototype.required = "state-required";
	ClassForState.prototype.expanded = "state-expanded";

	function ClassForNotState() {

	}
	ClassForNotState.prototype.disabled = "";
	ClassForNotState.prototype.readOnly = "";
	ClassForNotState.prototype.hidden = "";
	ClassForNotState.prototype.required = "";
	ClassForNotState.prototype.expanded = "";

	function make_Stateful_fireAction(el) {
		return function() {
			var ev = MutableEvent({
				"target":el
			}).withActionInfo(); 
			fireAction(ev);
		};
	}

	function Stateful_reflectStateOn(el,useAsSource) {
		var stateful = el.stateful = this;
		if (el._cleaners == undefined) el._cleaners = [];
		//TODO consider when to clean body element
		if (!arrayContains(el._cleaners,statefulCleaner)) el._cleaners.push(statefulCleaner); 
		if (useAsSource != false) readElementState(el,stateful("state"));
		stateful.on("change","state",el,reflectElementState); //TODO "livechange", queues up calls while not live
		if (!nativeClassList) {
			el.classList = DOMTokenList();
			DOMTokenList_mixin(el.classList,el.className);
		}
		var mapClass = el.stateful("map.class","undefined");
		if (mapClass) StatefulResolver.updateClass(stateful,el); //TODO move 
	}
 
	// all stateful elements whether field or not get a cleaner
	function statefulCleaner() {
		if (this.stateful) {
			this.stateful.destroy();
			if (this.stateful.discard) this.stateful.discard();
			this.stateful.fireAction = undefined;
			this.stateful = undefined;
		}
	}
	essential.declare("statefulCleaner",statefulCleaner);

	/*
	  StatefulResolver()
	  StatefulResolver(el)
	  StatefulResolver(el,true)
	*/
	function StatefulResolver(el,mapClassForState) {
		if (el && el.stateful) return el.stateful;

		var resolverOptions = {};
		if (typeof mapClassForState == "object") {
			resolverOptions = mapClassForState;
			mapClassForState = mapClassForState.mapClassForState;//TODO consider different name 
		}
		var stateful = Resolver({ state: {} },resolverOptions);
		if (mapClassForState) {
			stateful.set("map.class.state", new ClassForState());
			stateful.set("map.class.notstate", new ClassForNotState());
		}
		stateful.fireAction = make_Stateful_fireAction(el);
		stateful.reflectStateOn = Stateful_reflectStateOn;

		if (el) stateful.reflectStateOn(el);
		
		return stateful;
	}
	essential.declare("StatefulResolver",StatefulResolver);

	var pageResolver = StatefulResolver(null,{ name:"page", mapClassForState:true });
	pageResolver.declare("config",{});
	pageResolver.reference("state").mixin({
		"livepage": false,
		"authenticated": true,
		"authorised": true,
		"connected": true,
		"online": true, //TODO update
		"preloading": false,
		"loading": true,
		"loadingConfig": false,
		"loadingScripts": false,
		"configured": true,
		"fullscreen": false,
		"launching": false, 
		"launched": false,

		"lang": document.documentElement.lang || "en",

		"loadingScriptsUrl": {},
		"loadingConfigUrl": {}
		});
	pageResolver.reference("connection").mixin({
		"loadingProgress": "",
		"status": "connected",
		"detail": "",
		"userName": "",
		"logStatus": false
	});

	pageResolver.reference("map.class.state").mixin({
		authenticated: "authenticated",
		loading: "loading",
		//login-error
		launched: "launched",
		launching: "launching",
		livepage: "livepage"
	});

	pageResolver.reference("map.class.notstate").mixin({
		authenticated: "login"
	});

	StatefulResolver.updateClass = function(stateful,el) {
		var triggers = {};
		for(var n in state_treatment) triggers[n] = true;
		for(var n in stateful("map.class.state")) triggers[n] = true;
		for(var n in stateful("map.class.notstate")) triggers[n] = true;
		for(var n in triggers) {
			stateful.reference("state."+n,"null").trigger("change");
		}
	};

	var _activeAreaName,_liveAreas=false, stages = [];
	essential.set("stages",stages);

	function activateArea(areaName) {
		if (! _liveAreas) {
			_activeAreaName = areaName;
			return;
		}
		
		for(var i=0,s; s = stages[i]; ++i) {
			s.updateActiveArea(areaName);
		}
		_activeAreaName = areaName;
		// only use DocumentRoles layout if DOM is ready
		if (document.body) {
			var dr = essential("DocumentRoles")();
			dr._layout_descs(); //TODO could this be done somewhere else?	
		} 
	}
	essential.set("activateArea",activateArea);
	
	function getActiveArea() {
		return _activeAreaName;
	}
	essential.set("getActiveArea",getActiveArea);

	function bringLive() {
		var ap = ApplicationConfig(); //TODO factor this and possibly _liveAreas out

		for(var i=0,w; w = enhancedWindows[i]; ++i) if (w.openWhenReady) {
			w.openNow();
			delete w.openWhenReady;
		}
		EnhancedWindow.prototype.open = EnhancedWindow.prototype.openNow;

		//TODO if waiting for initial page src postpone this

		// Allow the browser to render the page, preventing initial transitions
		_liveAreas = true;
		ap.state.set("livepage",true);

	}

	function onPageLoad(ev) {
		var ap = ApplicationConfig();
		_liveAreas = true;
		ap.state.set("livepage",true);
	}

	if (window.addEventListener) window.addEventListener("load",onPageLoad,false);
	else if (window.attachEvent) window.attachEvent("onload",onPageLoad);

	Resolver("page").declare("pages",{});

	function _SubPage(appConfig) {
		if (appConfig) this.appConfig = appConfig;
		this.body = document.createElement("DIV");
	}
	var SubPage = Generator(_SubPage);

	SubPage.prototype.headPrefix = ['<head>'];
	var metas = (document.head || document.documentElement.firstChild).getElementsByTagName("meta");
	for(var i=0,e; e = metas[i]; ++i) {
		SubPage.prototype.headPrefix.push(outerHtml(e));
	}

	SubPage.prototype.fetch = function() {

		var XMLHttpRequest = essential("XMLHttpRequest");
	    var xhr = XMLHttpRequest();

	    if (typeof(xhr.overrideMimeType) === 'function') {
	        xhr.overrideMimeType('text/html');
	    }
	    xhr.open('GET', this.url, /* async */true);
	    //TODO utf-8
	    xhr.setRequestHeader('Accept', 'text/html; q=0.9, */*; q=0.5');
	    try {
		    xhr.send(null);

		    if (essential("isFileProtocol")) {
		        if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
		            this.loadedPageDone(xhr.responseText);
		        } else {
		            this.loadedPageError(xhr.status);
		        }
		    } else {
		        xhr.onreadystatechange = function () {
		            if (xhr.readyState == 4) {
		                handleResponse(xhr, this, this.loadedPageDone, this.loadedPageError);
		            }
		        };
		    } 
	    }
	    catch(ex) {
	    	this.loadedPageError(null,ex); //TODO no net for instance
	    }
	};

    function handleResponse(xhr, instance, callback, errback) {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback.call(instance,xhr.responseText,
                     xhr.getResponseHeader("Last-Modified"));
        } else if (typeof(errback) === 'function') {
            errback.call(instance,xhr.status);
        }
    }

	SubPage.prototype.loadedPageDone = function(text,lastModified) {
		var doc = createHTMLDocument(text);
	};

	SubPage.prototype.loadedPageError = function(status) {

	};

	SubPage.prototype.parseHTML = function(text) {
		var doc;
		if (document.implementation && document.implementation.createHTMLDocument) {
			doc = document.implementation.createHTMLDocument("");
			doc.documentElement.innerHTML = text;
			this.head = document.importNode(doc.head);
			this.body = document.importNode(doc.body);

		} else  if (window.ActiveXObject) {
			text = text.replace("<html",'<div id="esp-html"').replace("</html>","</div>");
			text = text.replace("<HTML",'<div id="esp-html"').replace("</HTML>","</div>");
			text = text.replace("<head",'<washead').replace("</head>","</washead>");
			text = text.replace("<HEAD",'<washead').replace("</HEAD>","</washead>");
			text = text.replace("<body",'<wasbody').replace("</body>","</wasbody>");
			text = text.replace("<BODY",'<wasbody').replace("</BODY>","</wasbody>");
			var div = document.createElement("DIV");
			div.innerHTML = text;
			this.head = div.getElementsByTagName("washead");
			this.body = div.getElementsByTagName("wasbody") || div;
			//TODO offline htmlfile object?
		}
	};

	SubPage.prototype.applyBody = function() {
		var e = this.body.firstElementChild!==undefined? this.body.firstElementChild : this.body.firstChild,
			db = document.body,
			fc = db.firstElementChild!==undefined? db.firstElementChild : db.firstChild;
		while(e) {
			// insert before the first permanent, or at the end
			if (fc == null) {
				db.appendChild(e);
			} else {
				db.insertBefore(e,fc);
			}
			e = this.body.firstElementChild!==undefined? this.body.firstElementChild : this.body.firstChild;
		}
	};

	SubPage.prototype.unapplyBody = function() {
		var db = document.body, 
			pc = null,
			e = db.lastElementChild!==undefined? db.lastElementChild : db.lastChild;

		while(e) {
			if (e.permanent) {
				// not part of subpage
				e = e.previousElementSibling || e.previousSibling;
			} else {
				if (pc == null) {
					this.body.appendChild(e);
				} else {
					this.body.insertBefore(e,pc)
				}
				pc = e;
			}
			e = db.lastElementChild!==undefined? db.lastElementChild : db.lastChild;
		}
	};

	SubPage.prototype.doesElementApply = function(el) {
		if (el.attrs) {
			return el.attrs["subpage"] == false? false : true;
		}
		if (el.getAttribute("subpage") == "false") return false;
		if (el.getAttribute("data-subpage") == "false") return false;
		return true;
	};

	SubPage.prototype.getHeadHtml = function() {
		var resources = ApplicationConfig().resources(),
			loadingScriptsUrl = ApplicationConfig().resolver("state.loadingScriptsUrl"),
			p = [],
			base = "";

		for(var i=0,r; r = resources[i]; ++i) {
			if (this.doesElementApply(r)) p.push( outerHtml(r) );
		}
		for(var u in loadingScriptsUrl) {
			var link = loadingScriptsUrl[u];
			base = link.attrs.base;
			if (this.doesElementApply(link)) p.push( outerHtml(link) );
		}
		if (base) base = '<base href="'+base+'">';
		p.push('</head>');
		return escapeJs(this.headPrefix.join("") + base + p.join(""));

	};

	SubPage.prototype.getBodyHtml = function() {
		var p = [
			'<body>',
			this.body.innerHTML,
			'</body>'
		];
		return p.join("");
		
	};

	SubPage.prototype.getInlineUrl = function() {
		var p = [
			'javascript:document.write("',
			'<html><!-- From Main Window -->',
			this.getHeadHtml(),
			this.getBodyHtml(),
			'</html>',
			'");'
		];

		return p.join("");
	};



	function _ApplicationConfig() {
		this.resolver = pageResolver;

		// copy state presets for backwards compatibility
		var state = this.resolver.reference("state","undefined");
		for(var n in this.state) state.set(n,this.state[n]);
		this.state = state;
		document.documentElement.lang = this.state("lang");
		state.on("change",this,this.onStateChange);
		this.resolver.on("change","state.loadingScriptsUrl",this,this.onLoadingScripts);
		this.resolver.on("change","state.loadingConfigUrl",this,this.onLoadingConfig);

		this.config = this.resolver.reference("config","undefined");
		this.pages = this.resolver.reference("pages",{ generator:SubPage});
		SubPage.prototype.appConfig = this;
		this.resolver.declare("resources",[]);
		this.resources = this.resolver.reference("resources");
		this.resolver.declare("inits",[]);
		this.inits = this.resolver.reference("inits");

		this._gather();
		this._apply();

		var bodySrc = document.body.getAttribute("src");
		if (bodySrc) {
			this.loadPage(bodySrc)
			//TODO queue loading this as the initial body content added before the first body child
		}

		this.modules = { "domReady":true };

		setTimeout(bringLive,60); 
	}

	var ApplicationConfig = Generator(_ApplicationConfig);
	essential.set("ApplicationConfig",ApplicationConfig).restrict({ "singleton":true, "lifecycle":"page" });
	
	// preset on instance (old api)
	ApplicationConfig.presets.declare("state", { });

	function enhanceUnhandledElements() {
		var statefuls = ApplicationConfig(); // Ensure that config is present
		//var handlers = DocumentRoles.presets("handlers");
		//TODO listener to presets -> Doc Roles additional handlers
		var dr = essential("DocumentRoles")()
		dr._enhance_descs(enhancedElements);
		//TODO time to default_enhance yet?
	}

	ApplicationConfig.prototype.onStateChange = function(ev) {
		switch(ev.symbol) {
			case "livepage":
				pageResolver.reflectStateOn(document.body,false);
				var ap = ev.data;
				//if (ev.value == true) ap.reflectState();
				ev.data.doInitScripts();
				if (_activeAreaName) {
					activateArea(_activeAreaName);
				} else {
					for(var i=0,s; s = stages[i]; ++i) {
						if (ev.base.authenticated) activateArea(s.getAuthenticatedArea());
						else activateArea(s.getIntroductionArea());
					}
				}
				break;
			case "loadingScripts":
			case "loadingConfig":
				//console.log("loading",this("state.loading"),this("state.loadingScripts"),this("state.loadingConfig"))
				--ev.inTrigger;
				this.set("state.loading",ev.base.loadingScripts || ev.base.loadingConfig);
				++ev.inTrigger;
				break;

			case "preloading":
				if (! ev.value) {
					for(var n in ev.base.loadingScriptsUrl) {
						var link = ev.base.loadingScriptsUrl[n];
						if (link.rel == "pastload" && !link.added) {
							var langOk = true;
							if (link.lang) langOk = (link.lang == pageResolver("state.lang"));
							if (langOk) document.body.appendChild(HTMLScriptElement(link.attrs));
							link.added = langOk;
						}
					}
				}
				break;

			case "loading":
				if (ev.value == false) {
					if (document.body) essential("instantiatePageSingletons")();
					ev.data.doInitScripts();	
					enhanceUnhandledElements();
					if (ev.base.configured == true && ev.base.authenticated == true 
						&& ev.base.authorised == true && ev.base.connected == true && ev.base.launched == false) {
						this.set("state.launching",true);
						// do the below as recursion is prohibited
						if (document.body) essential("instantiatePageSingletons")();
						enhanceUnhandledElements();
					}
				} 
				break;
			case "authenticated":
				for(var i=0,s; s = stages[i]; ++i) activateArea(ev.base.authenticated? s.getAuthenticatedArea():s.getIntroductionArea());
				// no break
			case "authorised":
			case "configured":
				if (ev.base.loading == false && ev.base.configured == true && ev.base.authenticated == true 
					&& ev.base.authorised == true && ev.base.connected == true && ev.base.launched == false) {
					this.set("state.launching",true);
					// do the below as recursion is prohibited
					if (document.body) essential("instantiatePageSingletons")();
					ev.data.doInitScripts();	
					enhanceUnhandledElements();
				}
				break;			
			case "launching":
			case "launched":
				if (ev.value == true) {
					if (document.body) essential("instantiatePageSingletons")();
					ev.data.doInitScripts();	
					enhanceUnhandledElements();
					if (ev.symbol == "launched") this.set("state.launching",false);
				}
				break;

			case "lang":
				document.documentElement.lang = ev.value;
				break;
			
			default:
				if (ev.base.loading==false && ev.base.launching==false && ev.base.launched==false) {
					if (document.body) essential("instantiatePageSingletons")();
				}
		}
	};

	ApplicationConfig.prototype.onLoadingScripts = function(ev) {
		var loadingScriptsUrl = this("state.loadingScriptsUrl");
			
		var loadingScripts = false;
		var preloading = false;
		for(var url in loadingScriptsUrl) {
			var link = loadingScriptsUrl[url];
			if (link.rel == "preload") preloading = true;
			if (link) loadingScripts = true;
		}
		this.set("state.loadingScripts",loadingScripts);
		this.set("state.preloading",preloading);
		if (ev.value==false) {
			// finished loading a script
			if (document.body) essential("instantiatePageSingletons")();
		}
	};

	ApplicationConfig.prototype.onLoadingConfig = function(ev) {
		var loadingConfigUrl = this("state.loadingConfigUrl");
			
		var loadingConfig = false;
		for(var url in loadingConfigUrl) {
			if (loadingConfigUrl[url]) loadingConfig = true;
		}
		this.set("state.loadingConfig",loadingConfig);
		if (ev.value==false) {
			// finished loading a config
			if (document.body) essential("instantiatePageSingletons")();
		}
	};

	ApplicationConfig.prototype.isPageState = function(whichState) {
		return this.resolver("state."+whichState);
	};
	ApplicationConfig.prototype.setPageState = function(whichState,v) {
		this.resolver.set(["state",whichState],v);
	};

	ApplicationConfig.prototype.declare = function(key,value) {
		this.config.declare(key,value);
	};

	ApplicationConfig.prototype.page = function(url,options,content) {
		//this.pages.declare(key,value);
		var page = this.pages()[url]; //TODO options in reference onundefined:generator & generate
		if (page == undefined) {
			page = this.pages()[url] = SubPage();
		}
		if (!page.loaded) {
			page.url = url;
			page.options = options;
			page.parseHTML(content);
		}
	};

	ApplicationConfig.prototype._apply = function() {
		for(var k in this.config()) {
			var el = this.getElement(k);
			var conf = el? this._getElementRoleConfig(el,k) : this.config()[k];

			if (conf.layouter && el) {
				el.layouter = Layouter.variant(conf.layouter)(k,el,conf);
			}
			if (conf.laidout && el) {
				el.laidout = Laidout.variant(conf.laidout)(k,el,conf);
			}
		}
	};

	var _singleQuotesRe = new RegExp("'","g");

	ApplicationConfig.prototype._getElementRoleConfig = function(element,key) {
		//TODO cache the config on element.stateful

		var config = {};

		// mixin the declared config
		if (key) {
			var declared = this.config(key);
			if (declared) {
				for(var n in declared) config[n] = declared[n];
			}
		}

		// mixin the data-role
		var dataRole = element.getAttribute("data-role");
		if (dataRole) try {
			var map = JSON.parse("{" + dataRole.replace(_singleQuotesRe,'"') + "}");
			for(var n in map) config[n] = map[n];
		} catch(ex) {
			console.debug("Invalid config: ",dataRole,ex);
			config["invalid-config"] = dataRole;
		}

		return config;
	};

	ApplicationConfig.prototype.getConfig = function(element) {
		if (element.id) {
			return this._getElementRoleConfig(element,element.id);
		}
		var name = element.getAttribute("name");
		if (name) {
			var p = element.parentNode;
			while(p && p.tagName) {
				if (p.id) {
					return this._getElementRoleConfig(element,p.id + "." + name);
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

	ApplicationConfig.prototype.loadPage = function(url) {
		var page = this.pages()[url]; //TODO options in reference onundefined:generator & generate
		if (page == undefined) {
			page = this.pages()[url] = SubPage();
		}
		if (!page.loaded) {
			page.url = url;
			page.fetch();
		}
	};

	ApplicationConfig.prototype.doInitScripts = function() {
		var inits = this.inits();
		for(var i=0,s; s = inits[i]; ++i) if (s.parentNode && !s.done) {
			// this.currently = s
			try {
				this.context["element"] = s;
				this.context["parentElement"] = s.parentElement || s.parentNode;
				with(this.context) eval(s.text);
				s.done = true;
			} catch(ex) {
				debugger;
			} //TODO only ignore ex.ignore
		}
		this.context["this"] = undefined;
	};

	ApplicationConfig.prototype.context = {
		"require": function(path) {
			var ac = ApplicationConfig.info.existing[0];
			if (ac == undefined || ac.modules[path] == undefined) {
				var ex = new Error("Missing module '" + path + "'");
				ex.ignore = true;
				throw ex;	
			} 
		}
	};

	function onmessage(ev) {
		var data = JSON.parse(ev.data);
		if (data && data.enhanced && data.enhanced.main.width && data.enhanced.main.height) {
			placement.setOptions(data.enhanced.options);
			placement.setMain(data.enhanced.main);
			placement.track();
		}
	} 

	var placement = {
		x: undefined, y: undefined,
		width: undefined, height: undefined,

		options: {},
		main: {},
		
		notifyNeeded: false,

		setOptions: function(options) {
			this.options = options;
		},

		setMain: function(main) {
			this.main = main;
		},

		// measure this window flagging if it notifyNeeded since last time
		measure: function() {
			var	x= window.screenX, y= window.screenY, width= window.outerWidth, height= window.outerHeight;
			this.notifyNeeded = (this.notifyNeeded || x != this.x || y != this.y || width != this.width || height != this.height);
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;

			this.data = JSON.stringify({
				x:x, y:y, width:width, height:height
			});
		},

		// track main window
		track: function() {
			var x=this.x, y=this.y, width=this.width, height=this.height;

			if (this.options.glueHeight) {
				y = this.main.y;
				height = this.main.height;
			}
			if (this.options.glueWidth) {
				x = this.main.x;
				width = this.main.width;
			}
			if (this.options.glueLeft) {
				x = this.main.x - this.options.width;
			} else if (this.options.glueRight) {
				x = this.main.x + this.main.width;
			}
			if (this.options.glueTop) {
				y = this.main.y - this.options.height;
			} else if (this.options.glueBottom) {
				y = this.main.y + this.main.height;
			}
			if (x != this.x || y != this.y) {
				var maxX = screen.width - this.width,maxY = screen.height - this.height;
				x = x === undefined? 0 : Math.min(Math.max(0,x),maxX);
				y = y === undefined? 0 : Math.min(Math.max(0,y),maxY);
			}

			if (x != this.x || y != this.y) {
				if (window.moveTo) window.moveTo(x - screen.availLeft,y - screen.availTop);
			}

			if (width != this.width || height != this.height) {
				if (window.resizeTo) window.resizeTo(width,height);
			}

			this.notifyNeeded = (this.notifyNeeded || x != this.x || y != this.y || width != this.width || height != this.height);
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}
	};
	placement.measure();
	placement.notifyNeeded = false;
	essential.declare("placement",placement);

	placement.broadcaster = setInterval(function() {
		placement.measure();
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			w.notify();
		}
		if (placement.notifyNeeded) ;//TODO hide elements if zero, show if pack from zero
		placement.notifyNeeded = false;
	},250);


	function trackMainWindow() {
		placement.track();
	}

	// tracking main window
	if (window.opener) {

		// TODO might not be needed
		setInterval(trackMainWindow,250);

		if (window.postMessage) {
			if (window.addEventListener) {
				window.addEventListener("message",onmessage,false);

			} else if (window.attachEvent) {
				window.attachEvent("onmessage",onmessage);

			}
			//TODO removeEvent
		}


	}

	function EnhancedWindow(url,name,options,index) {
		this.name = name;
		this.url = url;
		this.options = options || {};
		this.notifyNeeded = true;
		this.index = index;
		this.width = this.options.width || 100;
		this.height = this.options.height || 500;
	}

	EnhancedWindow.prototype.override = function(url,options) {
		this.url = url;
		this.options = options;
		this.notifyNeeded = true;
	};

	EnhancedWindow.prototype.content = function() {
		// get subpage
		// html, head, body
	};

	EnhancedWindow.prototype.close = function() {
		if (this.window) this.window.close();
		this.window = null;
	};

	EnhancedWindow.prototype.open = function() {
		this.openWhenReady = true;
	};

	EnhancedWindow.prototype.openNow = function() {
		this.close();
		var features = "menubar=no,width="+(this.width)+",height="+(this.height)+",status=no,location=no,toolbar=no";

		var page = ApplicationConfig().pages()[this.url];
		var url = page? page.getInlineUrl() : this.url;
		this.window = window.open(url,this.name,features);

		var that = this;
		// do this to fix Chrome 20
		setTimeout(function() {
			that.notify({});
		},50);
	};

	EnhancedWindow.prototype.anchor = function(html,opts) {
		var attrs = { href: 'javascript:void(0);' }, that = this;
		if (this.name) attrs.target = this.name;
		attrs.onclick = function(ev) {
			that.open();
			if (ev && ev.preventDefault) ev.preventDefault();
			return false;
		};
		if (opts["class"]) attrs["class"] = opts["class"];
		return HTMLElement("a",attrs,html);
	};

	EnhancedWindow.prototype.notify = function(ev) {
		if (this.window && this.window.postMessage && (this.notifyNeeded || placement.notifyNeeded)) {
			var options = JSON.stringify(this.options);
			this.window.postMessage('{"enhanced":{'+'"options":' + options + ', "main":' + placement.data + '}}',"*");
		} 
		this.notifyNeeded = false;
	};

	EnhancedWindow.prototype.reposition = function(ev) {
		//TODO

		if (this.options.focus && this.window.focus) this.window.focus();
	};

	function defineWindow(url,name,options) {
		if (name) for(var i=0,w; w = enhancedWindows[i]; ++i) {
			if (name == w.name) {
				w.override(url,options);
				w.open();
				return;
			}
		}
		var win = new EnhancedWindow(url,name,options,enhancedWindows.length);
		enhancedWindows.push(win);
		return win;
	}
	essential.declare("defineWindow",defineWindow);


	function openSidebar(url, options) {
		var nav = HTMLElement("nav");
		var subPage = getSubPage(url);
		subPage.fetch();
		nav.innerHTML = subPage.body.content;
		document.body.appendChild(nav);
	}
	essential.declare("openSidebar",openSidebar);

	function openWindow(url, name, options) {
		//TODO support proxied essential?
		var w = defineWindow(url, name, options);
		w.open();
		return w;
		//TODO position width 0 width tracking left/right
	}
	essential.declare("openWindow",openWindow);

}();

// need with context not supported in strict mode
Resolver("essential")("ApplicationConfig").prototype._gather = function() {
	var resources = this.resources();
	var inits = this.inits();

	var scripts = document.getElementsByTagName("script");
	for(var i=0,s; s = scripts[i]; ++i) {
		switch(s.getAttribute("type")) {
			case "application/config":
				try {
					with(this) eval(s.text);
				} catch(ex) {
					Resolver("essential")("console").error("Failed to parse application/config",s.text);
				}
				break;
			case "application/init": 
				inits.push(s);
				break;
			default:
				var name = s.getAttribute("name");
				if (name && s.getAttribute("src") == null) this.modules[name] = true; 
				//TODO onload if src to flag that module is loaded
				if (s.parentNode == document.head) {
					resources.push(s);
				}
				break;
		}
	}
};

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

!function () {
	//"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

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

}();
/*jslint white: true */
!function () {
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{}),
		ObjectType = essential("ObjectType"),
		console = essential("console"),
		MutableEvent = essential("MutableEvent"),
		StatefulResolver = essential("StatefulResolver"),
		ApplicationConfig = essential("ApplicationConfig"),
		pageResolver = Resolver("page"),
		getActiveArea = essential("getActiveArea"),
		arrayContains = essential("arrayContains"),
		statefulCleaner = essential("statefulCleaner"),
		HTMLElement = essential("HTMLElement"),
		HTMLScriptElement = essential("HTMLScriptElement"),
		Layouter = essential("Layouter"),
		Laidout = essential("Laidout"),
		baseUrl = location.href.substring(0,location.href.split("?")[0].lastIndexOf("/")+1),
		serverUrl = location.protocol + "//" + location.host,
		callCleaners = essential("callCleaners"),
		enhancedElements = essential("enhancedElements"),
		enhancedWindows = essential("enhancedWindows"),
		EnhancedDescriptor = essential("EnhancedDescriptor");

	function getScrollOffsets(el) {
		var left=0,top=0;
		while(el && !isNaN(el.scrollTop)){
			top += el.scrollTop;
			left += el.scrollLeft;
			el = el.parentNode;
		}
		return { left:left, top:top };
	}

	function getPageOffsets(el) {
		var scrolls = getScrollOffsets(el);

		var left=0,top=0;
		while(el){
			top += el.offsetTop;
			left += el.offsetLeft;
			el = el.offsetParent
		}
		return { left:left - scrolls.left, top:top - scrolls.top };
	}

	function delayedScriptOnload(scriptRel) {
		function delayedOnload(ev) {
			var el = this;
			var name = el.getAttribute("name");
			if (name) {
				ApplicationConfig().modules[name] = true;
			}
			setTimeout(function(){
				// make sure it's not called before script executes
				var scripts = pageResolver(["state","loadingScriptsUrl"]);
				if (scripts[el.src.replace(baseUrl,"")] != undefined) {
					// relative url
					pageResolver.set(["state","loadingScriptsUrl",el.src.replace(baseUrl,"")],false);
				} else if (scripts[el.src.replace(serverUrl,"")] != undefined) {
					// absolute url
					pageResolver.set(["state","loadingScriptsUrl",el.src.replace(serverUrl,"")],false);
				}
			},0);
		}
		return delayedOnload;       
	}

	function _queueDelayedAssets()
	{
		//TODO move this to pageResolver("state.ready")
		var config = ApplicationConfig();//TODO move the state transitions here
		var links = document.getElementsByTagName("link");

		//TODO differentiate on type == "text/javascript"
		for(var i=0,l; l=links[i]; ++i) switch(l.rel) {
			case "stylesheet":
				config.resources().push(l);
				break;			
			case "pastload":
			case "preload":
				//TODO differentiate on lang
				var attrsStr = l.getAttribute("attrs");
				var attrs = {};
				if (attrsStr) {
					try {
						eval("attrs = {" + attrsStr + "}");
					} catch(ex) {
						//TODO
					}
				}
				attrs["type"] = l.getAttribute("type") || "text/javascript";
				attrs["src"] = l.getAttribute("src");
				attrs["name"] = l.getAttribute("data-name") || l.getAttribute("name") || undefined;
				attrs["base"] = baseUrl;
				attrs["subpage"] = (l.getAttribute("subpage") == "false" || l.getAttribute("data-subpage") == "false")? false:true;
				//attrs["id"] = l.getAttribute("script-id");
				attrs["onload"] = delayedScriptOnload(l.rel);

				var relSrc = attrs["src"].replace(baseUrl,"");
				l.attrs = attrs;
				if (l.rel == "preload") {
					var langOk = true;
					if (l.lang) langOk = (l.lang == pageResolver("state.lang"));
					if (langOk) {
						pageResolver.set(["state","preloading"],true);
						pageResolver.set(["state","loadingScripts"],true);
						pageResolver.set(["state","loadingScriptsUrl",relSrc],l); 
						document.body.appendChild(HTMLScriptElement(attrs));
						l.added = true;
					} 
				} else {
					var langOk = true;
					if (l.lang) langOk = (l.lang == pageResolver("state.lang"));
					if (langOk) {
						pageResolver.set(["state","loadingScripts"],true);
						pageResolver.set(["state","loadingScriptsUrl",relSrc],l); 
					} 
				}
				break;
		}
		if (! pageResolver(["state","preloading"])) {
			var scripts = pageResolver(["state","loadingScriptsUrl"]);
			for(var n in scripts) {
				var link = scripts[n];
				if (link.rel == "pastload") {
					var langOk = true;
					if (link.lang) langOk = (link.lang == pageResolver("state.lang"));
					if (langOk) {
						document.body.appendChild(HTMLScriptElement(link.attrs));
						link.added = true;
					} 
				}
			}
		}

		// var scripts = document.head.getElementsByTagName("script");
		// for(var i=0,s; s = scripts[i]; ++i) {

		// }

		if (pageResolver(["state","loadingScripts"])) console.debug("loading phased scripts");

		var metas = document.getElementsByTagName("meta");
		for(var i=0,m; m = metas[i]; ++i) {
			switch((m.getAttribute("name") || "").toLowerCase()) {
				case "enhanced roles":
					DocumentRoles.useBuiltins((m.getAttribute("content") || "").split(" "));
					break;
			}
		}
	}
	essential.set("_queueDelayedAssets",_queueDelayedAssets);


	function configRequired(url)
	{
		pageResolver.set(["state","loadingConfig"],true);
		pageResolver.set(["state","loadingConfigUrl",url],true);
	}
	essential.set("configRequired",configRequired);

	function configLoaded(url)
	{
		pageResolver.set(["state","loadingConfigUrl",url],false);
	}
	essential.set("configLoaded",configLoaded);


	function _makeEventCleaner(listeners,sourceListeners,bubble)
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
		cleaner.listeners = sourceListeners; // for removeEventListeners
		return cleaner;
	}

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
				return fCall.call(eControl,MutableEvent(window.event)); 
			};
		} 

		var listeners2 = {};
		if (eControl.addEventListener) {
			for(var n in listeners) {
				listeners2[n] = listeners[n];
				eControl.addEventListener(n, listeners[n], bubble || false);
			}
		} else {
			for(var n in listeners) {
				listeners2[n] = makeIeListener(eControl,listeners[n]);
				eControl.attachEvent('on'+n,listeners2[n]);
			}
		}   
		eControl._cleaners.push(_makeEventCleaner(listeners2,listeners,bubble || false));
	}
	essential.declare("addEventListeners",addEventListeners);

	function removeEventListeners(el, listeners,bubble) {
		if (el._cleaners) {
			for(var i=0,c; c = el._cleaners[i]; ++i) if (c.listeners == listeners) {
				c.call(el);
				el._cleaners.splice(i,1);
			}
		} else {
			if (el.removeEventListener) {
				for(var n in listeners) {
					el.removeEventListener(n, listeners[n], bubble || false);
				}
			} else {
				for(var n in listeners) {
					el.detachEvent('on'+n,listeners[n]);
				}
			}
		}
	}
	essential.declare("removeEventListeners",removeEventListeners);

	function _DialogAction(actionName) {
		this.actionName = actionName;
	} 
	_DialogAction.prototype.activateArea = essential("activateArea"); // shortcut to global essential function
	var DialogAction = essential.set("DialogAction",Generator(_DialogAction));


	function resizeTriggersReflow(ev) {
		// debugger;
		DocumentRoles()._resize_descs();
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			w.notify(ev);
		}
	}

	/*
		action buttons not caught by enhanced dialogs/navigations
	*/
	function defaultButtonClick(ev) {
		ev = MutableEvent(ev).withActionInfo();
		if (ev.commandElement && ev.commandElement == ev.actionElement) {

			//TODO action event filtering
			//TODO disabled
			fireAction(ev);
		}
	}

	function fireAction(ev) 
	{
		var el = ev.actionElement, action = ev.action, name = ev.commandName;
		if (! el.actionVariant) {
			if (action) {
				action = action.replace(baseUrl,"");
			} else {
				action = "submit";
			}

			el.actionVariant = DialogAction.variant(action)(action);
		}

		if (el.actionVariant[name]) el.actionVariant[name](el);
		else {
			var sn = name.replace("-","_").replace(" ","_");
			if (el.actionVariant[sn]) el.actionVariant[sn](el);
		}
		//TODO else dev_note("Submit of " submitName " unknown to DialogAction " action)
	}
	essential.declare("fireAction",fireAction);


	function _StatefulField(name,el) {
		var stateful = StatefulResolver(el,true);
		return stateful;
	}
	var StatefulField = essential.declare("StatefulField",Generator(_StatefulField, { alloc:false }));

	StatefulField.prototype.destroy = function() {};
	StatefulField.prototype.discard = function() {};

	function _TextField() {

	}
	StatefulField.variant("input[type=text]",Generator(_TextField,_StatefulField));

	function _CheckboxField() {

	}
	StatefulField.variant("input[type=checkbox]",Generator(_CheckboxField,_StatefulField));

	function _TimeField() {

	}
	StatefulField.variant("input[type=time]",Generator(_TimeField,_StatefulField));

	function _CommandField(name,el,role) {

	}
	var CommandField = StatefulField.variant("*[role=link]",Generator(_CommandField,_StatefulField));
	StatefulField.variant("*[role=button]",Generator(_CommandField,_StatefulField));


	/* Enhance all stateful fields of a parent */
	function enhanceStatefulFields(parent) {

		for(var el = parent.firstChild; el; el = el.nextSibling) {
			//TODO avoid non elements, firstChildNode. Skip non type 1 (comments) on old IE
			//TODO do not enhance nested enhanced roles

			var name = el.name || el.getAttribute("data-name") || el.getAttribute("name");
			if (name) {
				var role = el.getAttribute("role");
				var variants = [];
				if (role) {
					//TODO support multiple roles
					if (el.type) variants.push("*[role="+role+",type="+el.type+"]");
					variants.push("*[role="+role+"]");
				} else {
					if (el.type) variants.push(el.tagName.toLowerCase()+"[type="+el.type+"]");
					variants.push(el.tagName.toLowerCase());
				}

				var stateful = StatefulField.variant(variants)(name,el,role);
			}

			enhanceStatefulFields(el); // enhance children
		}
	}
	essential.declare("enhanceStatefulFields",enhanceStatefulFields);

	function _DocumentRoles(handlers,doc) {
		this.handlers = handlers || this.handlers || { enhance:{}, discard:{}, layout:{} };
		this._on_event = [];
		doc = doc || document;
		
		//TODO configure reference as DI arg
		var statefuls = ApplicationConfig(); // Ensure that config is present

		if (window.addEventListener) {
			window.addEventListener("resize",resizeTriggersReflow,false);
			doc.body.addEventListener("orientationchange",resizeTriggersReflow,false);
			doc.body.addEventListener("click",defaultButtonClick,false);
		} else {
			window.attachEvent("onresize",resizeTriggersReflow);
			doc.body.attachEvent("onclick",defaultButtonClick);
		}

		this.enhanceBranch(doc);
	}
	var DocumentRoles = essential.set("DocumentRoles",Generator(_DocumentRoles));
	
	_DocumentRoles.args = [
		ObjectType({ name:"handlers" })
	];

	_DocumentRoles.prototype.enhanceBranch = function(el) {
		var descs;
		if (el.querySelectorAll) {
			descs = this._role_descs(el.querySelectorAll("*[role]"));
		} else {
			descs = this._role_descs(el.getElementsByTagName("*"));
		}
		this._enhance_descs(descs);
		//TODO reflow on resize etc
	};

	_DocumentRoles.prototype.discardBranch = function(el) {
		//TODO
	};

	function refreshRoleLayoutCallback(dr,layoutHandler) {
		// called on EnhancedDescription
		return function() {
			var updateLayout = false,
				ow = this.el.offsetWidth, 
				oh  = this.el.offsetHeight,
				sw = this.el.scrollWidth,
				sh = this.el.scrollHeight,
				displayed = !(ow == 0 && oh == 0);
			if (this.layout.displayed != displayed) {
				this.layout.displayed = displayed;
				updateLayout = true;
			}

			if (this.layout.width != ow || this.layout.height != oh) {
				this.layout.width = ow;
				this.layout.height = oh;
				updateLayout = true
			}
			if (this.layout.contentWidth != sw || this.layout.contentHeight != sh) {
				this.layout.contentWidth = sw;
				this.layout.contentHeight = sh;
				updateLayout = true
			}
			if (this.layout.area != getActiveArea()) { 
				this.layout.area = getActiveArea();
				updateLayout = true;
			}
			if (updateLayout) {
				//debugger;
				layoutHandler.call(dr,this.el,this.layout,this.instance);	
			}	
		};
	}

	_DocumentRoles.prototype._enhance_descs = function(descs) 
	{
		var statefuls = ApplicationConfig(); // Ensure that config is present
		var incomplete = false, enhancedCount = 0;

		for(var n in descs) {
			var desc = descs[n];

			StatefulResolver(desc.el,true);
			if (!desc.enhanced && this.handlers.enhance[desc.role]) {
				desc.instance = this.handlers.enhance[desc.role].call(this,desc.el,desc.role,statefuls.getConfig(desc.el));
				desc.enhanced = desc.instance === false? false:true;
				++enhancedCount;
				var layoutHandler = this.handlers.layout[desc.role];
				if (layoutHandler) desc.refresh = refreshRoleLayoutCallback(this,layoutHandler);
			}
			if (! desc.enhanced) incomplete = true;
		}
		
		// notify enhanced listeners
		if (! incomplete && enhancedCount > 0) {
			for(var i=0,oe; oe = this._on_event[i]; ++i) {
				if (oe.type == "enhanced") {
					var descs2 = [];

					// list of relevant descs
					for(var n in descs) {
						var desc = descs[n];
						if (oe.role== null || oe.role==desc.role) descs2.push(desc);
					}

					oe.func.call(this, this, descs2);
				}
			}
		} 
	};

	_DocumentRoles.discarded = function(instance) {
		for(var n in enhancedElements) {
			var desc = enhancedElements[n];
			if (desc.role && desc.enhanced && !desc.discarded) {

				callCleaners(desc.el);
				delete desc.el;
				delete enhancedElements[n];
			}
		}
	};

	_DocumentRoles.prototype._roleEnhancedCleaner = function(desc) {
		var dr = this, handler = this.handlers.discard[desc.role] || _DocumentRoles.default_discard;

		return function() {
			return handler.call(dr,desc.el,desc.role,desc.instance);
		};
	};

	_DocumentRoles.prototype._role_descs = function(elements) {
		var descs = [];
		for(var i=0,el; el=elements[i]; ++i) {
			var role = el.getAttribute("role");
			//TODO only in positive list
			if (role) {
				var desc = EnhancedDescriptor(el,true);
				descs.push(desc);
				if (el._cleaners == undefined) el._cleaners = [];
				if (!arrayContains(el._cleaners,statefulCleaner)) el._cleaners.push(this._roleEnhancedCleaner(desc)); 
			}
		}
		return descs;
	};

	_DocumentRoles.prototype._resize_descs = function() {
		for(var n in enhancedElements) {
			var desc = enhancedElements[n];

			if (desc.enhanced && !this.discarded && this.handlers.layout[desc.role]) {
				var ow = desc.el.offsetWidth, oh  = desc.el.offsetHeight;
				if (desc.layout.width != ow || desc.layout.height != oh) {
					desc.layout.width = ow;
					desc.layout.height = oh;
					var now = (new Date()).getTime();
					var throttle = this.handlers.layout[desc.role].throttle;
					if (desc.layout.delayed) {
						// set dimensions and let delayed do it
					} else if (typeof throttle != "number" || (desc.layout.lastDirectCall + throttle < now)) {
						// call now
						this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
						desc.layout.lastDirectCall = now;
					} else {
						// call in a bit
						var delay = now + throttle - desc.layout.lastDirectCall;
						// console.log("resizing in",delay);
						(function(desc){
							desc.layout.delayed = true;
							setTimeout(function(){
								DocumentRoles().handlers.layout[desc.role].call(DocumentRoles(),desc.el,desc.layout,desc.instance);
								desc.layout.lastDirectCall = now;
								desc.layout.delayed = false;
							},delay);
						})(desc);
					}
				}
			}
		}
	};

	_DocumentRoles.prototype._layout_descs = function() {
		for(var n in enhancedElements) {
			var desc = enhancedElements[n];

			if (desc.enhanced && !desc.discarded && this.handlers.layout[desc.role]) {
				var updateLayout = false,
					ow = desc.el.offsetWidth, 
					oh  = desc.el.offsetHeight,
					sw = desc.el.scrollWidth,
					sh = desc.el.scrollHeight,
					displayed = !(ow == 0 && oh == 0);
				if (desc.layout.displayed != displayed) {
					desc.layout.displayed = displayed;
					updateLayout = true;
				}
				if (desc.layout.width != ow || desc.layout.height != oh) {
					desc.layout.width = ow;
					desc.layout.height = oh;
					updateLayout = true
				}
				if (desc.layout.contentWidth != sw || desc.layout.contentHeight != sh) {
					desc.layout.contentWidth = sw;
					desc.layout.contentHeight = sh;
					updateLayout = true
				}
				if (desc.layout.area != getActiveArea()) { 
					desc.layout.area = getActiveArea();
					updateLayout = true;
				}
				if (updateLayout) this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
			}
		}
	};

	_DocumentRoles.prototype._area_changed_descs = function() {
		for(var n in enhancedElements) {
			var desc = enhancedElements[n];

			if (desc.enhanced && this.handlers.layout[desc.role]) {
				desc.layout.area = getActiveArea();
				this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
			}
		}
	};

	_DocumentRoles.prototype.on = function(name,role,func) {
		if (arguments.length == 2) func = role;
		
		//TODO
		this._on_event.push({ "type":name,"func":func,"name":name,"role":role });
	}
	
	// Element specific handlers
	DocumentRoles.presets.declare("handlers.enhance", {});
	DocumentRoles.presets.declare("handlers.layout", {});
	DocumentRoles.presets.declare("handlers.discard", {});


	_DocumentRoles.default_enhance = function(el,role,config) {
		
		return {};
	};

	_DocumentRoles.default_layout = function(el,layout,instance) {
		
	};
	
	_DocumentRoles.default_discard = function(el,role,instance) {
		
	};

	DocumentRoles.useBuiltins = function(list) {
		DocumentRoles.restrict({ singleton: true, lifecycle: "page" });
		for(var i=0,r; r = list[i]; ++i) {
			if (this["enhance_"+r]) this.presets.declare(["handlers","enhance",r], this["enhance_"+r]);
			if (this["layout_"+r]) this.presets.declare(["handlers","layout",r], this["layout_"+r]);
			if (this["discard_"+r]) this.presets.declare(["handlers","discard",r], this["discard_"+r]);
		}
	}

	var _scrollbarSize;
	function scrollbarSize() {
		if (_scrollbarSize === undefined) {
			var div = HTMLElement("div",{ style: "width:50px;height:50px;overflow:scroll;position:absolute;top:-200px;left:-200px;" },
				'<div style="height:100px;"></div>');
			document.body.appendChild(div);
			_scrollbarSize = (div.offsetWidth - div.clientWidth) || /* OSX Lion */7; 
			document.body.removeChild(div);
		}

		return _scrollbarSize;
	}
	essential.declare("scrollbarSize",scrollbarSize);

	
	function _StageLayouter(key,el,conf) {
		this.key = key;
		this.type = conf.layouter;
		this.areaNames = conf["area-names"];
		this.activeArea = null;
		this.introductionArea = conf["introduction-area"] || "introduction";
		this.authenticatedArea = conf["authenticated-area"] || "authenticated";

		this.baseClass = conf["base-class"];
		if (this.baseClass) this.baseClass += " ";
		else this.baseClass = "";

		essential("stages").push(this); // for area updates
	}
	var StageLayouter = essential.declare("StageLayouter",Generator(_StageLayouter,Layouter));
	Layouter.variant("area-stage",StageLayouter);

	_StageLayouter.prototype.getIntroductionArea = function() {
		return this.introductionArea;
	};

	_StageLayouter.prototype.getAuthenticatedArea = function() {
		return this.authenticatedArea;
	};

	_StageLayouter.prototype.refreshClass = function(el) {
		var areaClasses = [];
		for(var i=0,a; a = this.areaNames[i]; ++i) {
			if (a == this.activeArea) areaClasses.push(a + "-area-active");
			else areaClasses.push(a + "-area-inactive");
		}
		var newClass = this.baseClass + areaClasses.join(" ")
		if (el.className != newClass) el.className = newClass;
	};

	_StageLayouter.prototype.updateActiveArea = function(areaName) {
		this.activeArea = areaName;
		this.refreshClass(document.getElementById(this.key)); //TODO on delay	
	};

	function _MemberLaidout(key,el,conf) {
		this.key = key;
		this.type = conf.laidout;
		this.areaNames = conf["area-names"];

		this.baseClass = conf["base-class"];
		if (this.baseClass) this.baseClass += " ";
		else this.baseClass = "";

		if (el) el.className = this.baseClass + el.className;
	}
	var MemberLaidout = essential.declare("MemberLaidout",Generator(_MemberLaidout,Laidout));
	Laidout.variant("area-member",MemberLaidout);

}();


/*jshint forin:true, eqnull:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50, newcap:false, white:false, devel:true */
!function () {
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{}),
		ObjectType = essential("ObjectType"),
		console = essential("console"),
		MutableEvent = essential("MutableEvent"),
		StatefulResolver = essential("StatefulResolver"),
		statefulCleaner = essential("statefulCleaner"),
		HTMLElement = essential("HTMLElement"),
		HTMLScriptElement = essential("HTMLScriptElement"),
		Layouter = essential("Layouter"),
		Laidout = essential("Laidout"),
		EnhancedDescriptor = essential("EnhancedDescriptor"),
		callCleaners = essential("callCleaners"),
		addEventListeners = essential("addEventListeners"),
		removeEventListeners = essential("removeEventListeners"),
		DocumentRoles = essential("DocumentRoles"),
		fireAction = essential("fireAction"),
		scrollbarSize = essential("scrollbarSize"),
		baseUrl = location.href.substring(0,location.href.split("?")[0].lastIndexOf("/")+1),
		serverUrl = location.protocol + "//" + location.host;


	function form_onsubmit(ev) {
		var frm = this;
		setTimeout(function(){
			frm.submit(ev);
		},0);
		return false;
	}
	function form_submit(ev) {
		if (document.activeElement) { document.activeElement.blur(); }
		this.blur();

		dialog_submit.call(this,ev);
	}
	function dialog_submit(clicked) {
		if (clicked == undefined) { clicked = MutableEvent().withDefaultSubmit(this); }

		if (clicked.commandElement) {
			fireAction(clicked);
		} 
		//else {
			//TODO default submit when no submit button or event
		//}
	}

	function toolbar_submit(ev) {
		return dialog_submit.call(this,ev);
	}

	function form_blur() {
		for(var i=0,e; (e=this.elements[i]); ++i) { e.blur(); }
	}
	function form_focus() {
		for(var i=0,e; (e=this.elements[i]); ++i) {
			var autofocus = e.getAttribute("autofocus"); // null/"" if undefined
			if (!autofocus) continue;
			e.focus();
			break; 
		}
	}
	
	function dialog_button_click(ev) {
		ev = MutableEvent(ev).withActionInfo();

		if (ev.commandElement) {
			if (ev.stateful && ev.stateful("state.disabled")) return; // disable
			if (ev.ariaDisabled) return; //TODO fold into stateful

			this.submit(ev); //TODO action context
			ev.stopPropagation();
		}
		if (ev.defaultPrevented) return false;
	}


	DocumentRoles.enhance_dialog = function (el,role,config) {
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
				// make sure no submit buttons outside form, or enter key will fire the first one.
				forceNoSubmitType(el.getElementsByTagName("BUTTON"));
				applyDefaultRole(el.getElementsByTagName("BUTTON"));
				applyDefaultRole(el.getElementsByTagName("A"));

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

	DocumentRoles.layout_dialog = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_dialog = function (el,role,instance) {
	};

	function applyDefaultRole(elements) {
		for(var i=0,el; (el = elements[i]); ++i) {
			switch(el.tagName) {
				case "button":
				case "BUTTON":
					el.setAttribute("role","button");
					break;
				case "a":
				case "A":
					el.setAttribute("role","link");
					break;
				// menuitem
			}
		} 
	}

	/* convert listed button elements */
	function forceNoSubmitType(buttons) {

		for(var i=0,button; (button = buttons[i]); ++i) if (button.type === "submit") {
			button.setAttribute("type","button");
			if (button.type === "submit") button.type = "submit";
		}
	}

	DocumentRoles.enhance_toolbar = function(el,role,config) {
		// make sure no submit buttons outside form, or enter key will fire the first one.
		forceNoSubmitType(el.getElementsByTagName("BUTTON"));
		applyDefaultRole(el.getElementsByTagName("BUTTON"));
		applyDefaultRole(el.getElementsByTagName("A"));

		el.submit = toolbar_submit;

		addEventListeners(el, {
			"click": dialog_button_click
		},false);

		return {};
	};

	DocumentRoles.layout_toolbar = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_toolbar = function(el,role,instance) {
		
	};

	// menu, menubar
	DocumentRoles.enhance_navigation = 
	DocumentRoles.enhance_menu = DocumentRoles.enhance_menubar = DocumentRoles.enhance_toolbar;

	DocumentRoles.enhance_sheet = function(el,role,config) {
		
		return {};
	};

	DocumentRoles.layout_sheet = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_sheet = function(el,role,instance) {
		
	};

	DocumentRoles.enhance_spinner = function(el,role,config) {
		var opts = {
			lines: 8,
			length: 5,
			width: 5,
			radius: 8,
			color: '#fff',
			speed: 1,
			trail: 60,
			shadow: false,
			hwaccel: true,
			className: 'spinner',
			zIndex: config.zIndex != undefined? config.zIndex : 2e9, // data-role
			top: 'auto',
			left: 'auto'
		};
		return new Spinner(opts).spin(el);
	};

	DocumentRoles.layout_spinner = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_spinner = function(el,role,instance) {
		instance.stop();
		el.innerHTML = "";
	};
	
	function _lookup_generator(name,resolver) {
		var constructor = Resolver(resolver || "default")(name,"null");
		
		return constructor? Generator(constructor) : null;
	}

	DocumentRoles.enhance_application = function(el,role,config) {
		if (config.variant) {
//    		variant of generator (default ApplicationController)
		}
		if (config.generator) {
			var g = _lookup_generator(config.generator,config.resolver);
			if (g) {
				var instance = g(el,role,config);
				return instance;
			}
			else return false; // not yet ready
		}
		
		return {};
	};

	DocumentRoles.layout_application = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_application = function(el,role,instance) {
		
	};

	//TODO find parent of scrolled role

	function getOfRole(el,role,parentProp) {
		parentProp = parentProp || "parentNode";
		while(el) {
			//TODO test /$role | role$|$role$| role /
			if (el.getAttribute && el.getAttribute("role") == role) return el;
			el = el[parentProp];
		}
		return null;
	}

	var is_inside = 0;

	var ENHANCED_SCROLLED_PARENT_EVENTS = {
		"mousemove": function(ev) {
		},
		"mouseover": function(ev) {
			var enhanced = EnhancedDescriptor(this.scrolled).instance;

			if (this.stateful.movedOutInterval) clearTimeout(this.stateful.movedOutInterval);
			this.stateful.movedOutInterval = null;
			this.stateful.set("over",true);
			enhanced.vert.show();
			enhanced.horz.show();
		},
		"mouseout": function(ev) {
			var sp = this;
			var enhanced = EnhancedDescriptor(this.scrolled).instance;
			
			if (this.stateful.movedOutInterval) clearTimeout(this.stateful.movedOutInterval);
			this.stateful.movedOutInterval = setTimeout(function(){
				sp.stateful.set("over",false);
				if (sp.stateful("dragging") != true) {
					enhanced.vert.hide();
					enhanced.horz.hide();
				}
				//console.log("mouse out of scrolled.");
			},30);
		}

		// mousedown, scroll, mousewheel
	};

	var ENHANCED_SCROLLED_EVENTS = {
		"scroll": function(ev) {
			var enhanced = EnhancedDescriptor(this).instance;
			// if not shown, show and if not entered and not dragging, hide after 1500 ms
			if (!enhanced.vert.shown) {
				enhanced.vert.show();
				enhanced.horz.show();
				if (!this.stateful("over") && !this.stateful("dragging")) {
					enhanced.vert.delayedHide();
					enhanced.horz.delayedHide();
				}
			}
			enhanced.refresh(this);
		},
		"mousewheel": function(ev) {
			var delta = ev.delta, deltaX = ev.x, deltaY = ev.y;
			// calcs from jquery.mousewheel.js

			// Old school scrollwheel delta
			if (ev.wheelDelta) { delta = ev.wheelDelta/120; }
			if (ev.detail) { delta = -ev.detail/3; }

			// New school multidim scroll (touchpads) deltas
			deltaY = delta;

			// Gecko
			if (ev.axis != undefined && ev.axis == ev.HORIZONTAL_AXIS) {
				deltaY = 0;
				deltaX = -1 * delta;
			}

			// Webkit
			if (ev.wheelDeltaY !== undefined) { deltaY = ev.wheelDeltaY/120; }
			if (ev.wheelDeltaX !== undefined) { deltaX = -1 * ev.wheelDeltaX/120; }

			if ((deltaX < 0 && 0 == this.scrollLeft) || 
				(deltaX > 0 && (this.scrollLeft + Math.ceil(this.offsetWidth) == this.scrollWidth))) {

				if (ev.preventDefault) ev.preventDefault();
				return false;
			}
			// if webkitDirectionInvertedFromDevice == false do the inverse
			/*
			if ((deltaY < 0 && 0 == this.scrollTop) || 
				(deltaY > 0 && (this.scrollTop + Math.ceil(this.offsetHeight) == this.scrollHeight))) {

				if (ev.preventDefault) ev.preventDefault();
				return false;
			}
			*/
		}

		// mousedown, scroll, mousewheel
	};

	// Current active Movement activity
	var activeMovement = null;

	function ElementMovement() {
	}

	ElementMovement.prototype.track = function(ev) {

	};

	ElementMovement.prototype.start = function(el,event) {
		var movement = this;
		this.el = el;
		this.event = event;

		// Start and bounding offset
		this.startY = el.offsetTop; this.minY = 0; this.maxY = 1000;
		this.startX = el.offsetLeft; this.minX = 0; this.maxX = 1000;
		this.factorX = 1;
		this.factorY = 1;

		this.startPageY = event.pageY; // - getComputedStyle( 'top' )
		this.startPageX = event.pageX; //??
		document.onselectstart = function(ev) { return false; };

		//TODO capture in IE
		//movement.track(event,0,0);

		if (el.stateful) el.stateful.set("dragging",true);

		this.drag_events = {
			//TODO  keyup ESC
			"keyup": function(ev) {

			},
			"mousemove": function(ev) {
				var maxY = 1000, maxX = 1000;
				var y = Math.min( Math.max(movement.startY + movement.factorY*(ev.pageY - movement.startPageY),movement.minY), movement.maxY );
				var x = Math.min( Math.max(movement.startX + movement.factorX*(ev.pageX - movement.startPageX),movement.minX), movement.maxX );
				movement.track(ev,x,y);
				console.log(movement.factorX,movement.factorY)
			},
			"mouseup": function(ev) {
				movement.end();
			}
		};
		addEventListeners(document.body,this.drag_events);

		activeMovement = this;

		return this;
	};

	ElementMovement.prototype.end = function() {
		if (this.el.stateful) this.el.stateful.set("dragging",false);
		removeEventListeners(document.body,this.drag_events);

		delete document.onselectstart ;

		activeMovement = null;

		return this;
	};

	function mousedownVert(ev) {
		if (activeMovement != null) return;

		if (ev.preventDefault) ev.preventDefault();
		//TODO this.stateful instead of var scrolled = this.parentNode.scrolled;
		var scrolled = this.parentNode.scrolled;
		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			scrolled.scrollTop = y; //(scrolled.scrollHeight -  scrolled.clientHeight) * y / (scrolled.clientHeight - 9);
			//var posInfo = document.getElementById("pos-info");
			//posInfo.innerHTML = "x=" +x + " y="+y + " sy="+scrolled.scrollTop + " cy="+ev.clientY + " py="+ev.pageY;
		};
		movement.start(this,ev);
		movement.startY = scrolled.scrollTop;
		movement.startX = scrolled.scrollLeft;
		movement.factorY = scrolled.scrollHeight / movement.el.offsetHeight;
		movement.maxY = scrolled.scrollHeight - scrolled.clientHeight;
		return false; // prevent default
	}
	function mousedownHorz(ev) {
		if (activeMovement != null) return;

		if (ev.preventDefault) ev.preventDefault();
		//TODO this.stateful instead of var scrolled = this.parentNode.scrolled;
		var scrolled = this.parentNode.scrolled;
		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			scrolled.scrollLeft = x; //(scrolled.scrollWidth -  scrolled.clientWidth) * x / (scrolled.clientWidth - 9);
		};
		movement.start(this,ev);
		movement.startY = scrolled.scrollTop;
		movement.startX = scrolled.scrollLeft;
		movement.factorX = scrolled.scrollWidth / movement.el.offsetWidth;
		movement.maxX = scrolled.scrollWidth - scrolled.clientWidth;
		return false; // prevent default
	}


	function EnhancedScrollbar(el,container,opts,mousedownEvent) {
		this.scrolled = el;
		this.el = HTMLElement("div", { "class":opts["class"] }, '<header></header><footer></footer><nav><header></header><footer></footer></nav>');
		container.appendChild(this.el);
		this.sizeName = opts.sizeName; this.posName = opts.posName;
		this.sizeStyle = opts.sizeName.toLowerCase();
		this.posStyle = opts.posName.toLowerCase();
		this.autoHide = opts.autoHide;
		this.trackScroll = opts.trackScroll == false? false : true;;

		this.trackScrolled(el);

		addEventListeners(el,ENHANCED_SCROLLED_EVENTS);
		addEventListeners(this.el,{ "mousedown": mousedownEvent });

		if (opts.initialDisplay !== false) {
			if (this.show()) {
				this.hiding = setTimeout(this.hide.bind(this), parseInt(opts.initialDisplay,10) || 3000);
			}
		}
	}

	EnhancedScrollbar.prototype.trackScrolled = function(el) {
		if (this.trackScroll) {
			this.scrolledTo = el["scroll"+this.posName];
			this.scrolledContentSize = el["scroll"+this.sizeName];
		}
		this.scrolledSize = el["client"+this.sizeName]; //scrolled.offsetHeight - scrollbarSize();
	};

	EnhancedScrollbar.prototype.update = function(scrolled) {
		this.el.lastChild.style[this.posStyle] = (100 * this.scrolledTo / this.scrolledContentSize) + "%";
		this.el.lastChild.style[this.sizeStyle] = (100 * this.scrolledSize / this.scrolledContentSize) + "%";
	};

	EnhancedScrollbar.prototype.show = function() {
		if (this.scrolledContentSize <= this.scrolledSize) return false;

		if (!this.shown) {
			this.update(this.scrolled);
			this.el.className += " shown";
			if (this.hiding) {
				clearTimeout(this.hiding);
				delete this.hiding;
			}
			this.shown = true;

			return true;
		}
	};

	EnhancedScrollbar.prototype.hide = function() {
		if (this.autoHide !== false && this.shown) {
			this.el.className = this.el.className.replace(" shown","");
			if (this.hiding) {
				clearTimeout(this.hiding);
				delete this.hiding;
			}
			this.shown = false;
		}
	};

	EnhancedScrollbar.prototype.delayedHide = function(delay) {
		var that = this;

		this.hiding = setTimeout(function() { that.hide(); }, delay || 1500);
	};

	EnhancedScrollbar.prototype.destroy = function() {
		this.el.parentNode.removeChild(this.el);
		callCleaners(this.el);
		delete this.el;
	};


	function EnhancedScrolled(el,config) {
		//? this.el = el
		var container = el.parentNode;
		if (config.obscured) {
			el.parentNode.style.cssText = "position:absolute;left:0;right:0;top:0;bottom:0;overflow:hidden;";
			el.style.right = "-" + scrollbarSize() + "px";
			el.style.bottom = "-" + scrollbarSize() + "px";
			el.style.paddingRight = scrollbarSize() + "px";
			el.style.paddingBottom = scrollbarSize() + "px";
			container = container.parentNode;
		}

		this.x = false !== config.x;
		this.y = false !== config.y;
		this.vert = new EnhancedScrollbar(el,container,{ 
			"class":config.obscured?"vert-scroller obscured":"vert-scroller", 
			initialDisplay: config.initialDisplay,
			trackScroll: config.trackScroll,
			sizeName: "Height", posName: "Top" 
			},mousedownVert);
		this.vert.el.style.width = scrollbarSize() + "px";
		if (config.obscured) this.vert.el.style.right = "-" + scrollbarSize() + "px";
		this.horz = new EnhancedScrollbar(el,container,{ 
			"class":config.obscured?"horz-scroller obscured":"horz-scroller", 
			initialDisplay: config.initialDisplay, 
			trackScroll: config.trackScroll,
			sizeName: "Width", posName: "Left" 
			},mousedownHorz);
		this.horz.el.style.height = scrollbarSize() + "px";
		if (config.obscured) this.horz.el.style.bottom = "-" + scrollbarSize() + "px";

		container.scrolled = el;
		StatefulResolver(container,true);
		addEventListeners(container,ENHANCED_SCROLLED_PARENT_EVENTS);
		container.scrollContainer = "top";

		this.refresh(el);
	}

	EnhancedScrolled.prototype.refresh = function(el) {
		this.vert.trackScrolled(el);
		this.vert.update(el);
		this.horz.trackScrolled(el);
		this.horz.update(el);
	};

	EnhancedScrolled.prototype.layout = function(el,layout) {

		//TODO show scrollbars only if changed && in play
		if (!this.vert.shown) {
			this.vert.show();
			this.horz.show();
			if (!el.stateful("over") && !el.stateful("dragging")) {
				this.vert.delayedHide(750);
				this.horz.delayedHide(750);
			}
		}

		this.refresh(el);
		//TODO if movement happening update factors and max
	};

	EnhancedScrolled.prototype.discard = function(el) {
		if (this.vert) this.vert.destroy();
		if (this.horz) this.horz.destroy();
		delete this.vert;
		delete this.horz;

		callCleaners(el.parentNode); //TODO do this with the autodiscarder after it's removed from DOM
		callCleaners(el);
	};

	EnhancedScrolled.prototype.setContentHeight = function(h) {

	};

	DocumentRoles.enhance_scrolled = function(el,role,config) {
		StatefulResolver(el,true);
		el.style.cssText = 'position:absolute;left:0;right:0;top:0;bottom:0;overflow:scroll;';
		var r = new EnhancedScrolled(el,config);

		return r;
	};

	DocumentRoles.layout_scrolled = function(el,layout,instance) {
		instance.layout(el,layout);
	};
	
	DocumentRoles.discard_scrolled = function(el,role,instance) {
		instance.discard(el);
		if (el.stateful) el.stateful.destroy();
	};
	

}();