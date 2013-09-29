/*!
    Essential JavaScript ❀ http://essentialjs.com
    Copyright (C) 2011-2013 by Henrik Vendelbo

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
 *
 * options.name
 * options.generator
 * options.mixinto
 */
function Resolver(name_andor_expr,ns,options)
{
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	switch(typeof(name_andor_expr)) {
	case "undefined":
		// Resolver()
		return Resolver["default"];
		
	case "string":
        var name_expr = name_andor_expr.split("::");
        var name = name_expr[0] || "default", expr = name_expr[1];

        switch(name_expr.length) {
            case 1: 
                // Resolver("abc")
                // Resolver("abc",null)
                // Resolver("abc",{})
                // Resolver("abc",{},{options})
                return _resolver(name,ns,options,arguments.length==1 || ns); //TODO return namespace

            case 2: 
                var _r = _resolver(name,ns,options,arguments.length==1 || ns);
                // Resolver("abc::") returns the namespace of resolver 
                if (expr == "") {
                    return _r.namespace;

                // Resolver("abc::def") returns reference for expression
                } else {
                    return _r.reference(expr,ns);

                }
                break;
            case 3: 
                // Resolver("abc::def::")  returns value for expression
                if (name_expr[2] == "") {
                    return Resolver[name].get(expr,ns);

                // Resolver("abc::def::ghi")
                } else {

                }
                break;
        }

        if (name_expr.length>1 && expr) {
            var call = "reference";
            switch(ns) {
                case "0":
                case "false":
                case "generate":
                case "null":
                case "undefined":
                case "throw":
                    return Resolver[name].get(expr,ns);

                default:
                case "reference":
                    return Resolver[name].reference(expr)
            }
            return Resolver[name][call](expr);
        }
		return Resolver[name];

    case "function":
    case "object":
        // Resolver({})
        // Resolver({},{options})
        options = ns || {};
        ns = name_andor_expr;
        break;
	}


    function _resolver(name,ns,options,auto) {
        if (Resolver[name] == undefined) {
            if (!auto) return ns;
            Resolver[name] = Resolver(ns || {},options || {});
            Resolver[name].named = name;
        }
        return Resolver[name];
    }


	function _resolve(names,subnames,onundefined) {
        // var top = ns; TODO passed namespace negates override
        var top = resolver.namespace;

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
                //TODO use map to determine return
                case "false":
                    if (top === undefined) return false;
                    break;
                case "null":
                	if (top === undefined) return null;
                	break;
                case "undefined":
                	if (top === undefined) return undefined;
                	break;
                case "0":
                    if (top === undefined) return 0;
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
                    case "false":
                        if (top === undefined) return false;
                        break;
	                case "null":
	                	if (top === undefined) return null;
	                	break;
	                case "undefined":
	                	if (top === undefined) return undefined;
	                	break;
                    case "0":
                        if (top === undefined) return 0;
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
        "true": true, // change to true value
        "false": true, // change to false value
        "reflect": true, // allows forcing reflection of current value
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

        var onundefinedSet = (onundefined=="null"||onundefined=="undefined")? "throw":onundefined; //TODO what about "false" "0"

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
			    	this._callListener("change",names,base,key,value);
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
		    	this._callListener("change",names,base,key,value);
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
	    	this._callListener("change",names,base[symbol],null,mods);
	    	//TODO parent listeners
        }
        function unmix(map) {
            var symbol = names.pop();
            var base = _resolve(names,null,onundefined);
            names.push(symbol);

            if (base[symbol] === undefined) _setValue({},names,base,symbol);
            var ni = names.length;
            var mods = {};

            for(var n in map) {
                names[ni] = n;
                if (_setValue(undefined,names,base[symbol],n)) {
                    mods[n] = undefined;
                }
            }

            names.pop(); // return names to unchanged
            this._callListener("change",names,base[symbol],null,mods);
        }
        function mixinto(target) {
            var base = _resolve(names,null,onundefined);
            for(var n in base) {
                target[n] = base[n];
            }
        }
	    function on(type,data,callback) {
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
			if (parentRef) parentRef._callListener(type,baseNames,_resolve(baseNames,null),leafName,value);
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
            } catch(ex) { console.warn("Failed to read store_local = ",this.id,ex); } //TODO consider feedback
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
                    var newScript = Resolver("essential::HTMLScriptElement")(script);
                    try {
                        //TODO if (! state.unloading)
                    script.parentNode.replaceChild(newScript,script);
                    } catch(ex) {} // fails during unload
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
        get.unmix = unmix;
        get.mixinto = mixinto;
        get.getEntry = getEntry;
        get.declareEntry = declareEntry;
        get.setEntry = setEntry;
        get.on = on;
        get.trigger = trigger;
        get.stored = stored;

        get.listeners = listeners || _makeListeners();

	    function _callListener(type,names,base,symbol,value) {
            if (type == "change" && value === false) {
                for(var i=0,event; event = this.listeners["false"][i]; ++i) {
                    event.trigger(base,symbol,value);
                }
            }
            if (type == "change" && value === true) {
                for(var i=0,event; event = this.listeners["true"][i]; ++i) {
                    event.trigger(base,symbol,value);
                }
            }
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
            if (/^bind | bind | bind$|^bind$/.test(type)) {
                type = type.replace(" bind "," ").replace("bind ","").replace(" bind","");

                var baseNames = selector.split(".");
                var leafName = baseNames.pop();
                var base = _resolve(baseNames,null,"undefined");
                var ev = _makeResolverEvent(resolver,type,selector,data,callback);
                ev.trigger(base,leafName,base == undefined? undefined : base[leafName]);
            }
            var types = type.split(" ");
            for(var i=0,type; type = types[i]; ++i) {
                var ev = _makeResolverEvent(resolver,type,selector,data,callback);
                this.listeners[type].push(ev);
            }
	    }
	    get._addListener = _addListener;


        return get;
    };



    resolver.on = function(type,selector,data,callback) 
    {
    	switch(arguments.length) {
    		case 2: break; //TODO
    		case 3: if (typeof arguments[1] == "string") {
                    //TODO reference "undefined" ?
			    	this.reference(selector).on(type,null,arguments[2]);
    			} else { // middle param is data
			    	//TODO this.reference("*").on(type,arguments[1],arguments[2]);
    			}
    			break;
    		case 4:
                    //TODO reference "undefined" ?
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
        this.namespace = ns;
        //TODO options
        return this;
//       options = options || {};
//       var name = options.name || this.named; 
		// Resolver[name] = Resolver(ns,options);
		// Resolver[name].named = name;
		// return Resolver[name];
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

Resolver.loadReadStored = function() {
    for(var i=0,ref; ref = Resolver.readloads[i]; ++i) {
        for(var n in ref.readloads) {
            ref.readloads[n].call(ref);
        }
    }
};

Resolver.unloadWriteStored = function() {

    for(var i=0,ref; ref = Resolver.storeunloads[i]; ++i) {
        for(var n in ref.storeunloads) {
            ref.storeunloads[n].call(ref);
        }
    }
};

Resolver.hasGenerator = function(subject) {
	if (subject.__generator__) return true;
	if (typeof subject == "function" && typeof subject.type == "function") return true;
	return false;
};

Resolver.exists = function(name) {
    return this[name] != undefined;
};

Resolver({},{ name:"default" });
Resolver(window, {name:"window"});

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
	
	/**
	 * Cleans up registered event listeners and other references
	 * 
	 * @param {Element} el
	 */
	function callCleaners(el)
	{
		if (typeof el == "object" && el) {
			var _cleaners = el._cleaners, c;
			if (_cleaners != undefined) {
				do {
					c = _cleaners.pop();
					if (c) c.call(el);
				} while(c);
				_cleaners = undefined;
			}
		} 
	};
	essential.declare("callCleaners",callCleaners);

	//TODO recursive clean of element and children?
	function cleanRecursively(el) {
		callCleaners(el);
		for(var child=el.firstElementChild!==undefined? el.firstElementChild : el.firstChild; child; 
			child = child.nextElementSibling!==undefined? child.nextElementSibling : child.nextSibling) {
			cleanRecursively(child);
		}
	}
	essential.declare("cleanRecursively",cleanRecursively);


	/* Container for laid out elements */
	function _Layouter(key,el,conf) {

		var layouterDesc = EnhancedDescriptor.all[el.uniqueID];
		var appConfig = Resolver("essential::ApplicationConfig::")();

		for(var i=0,c; c = el.children[i]; ++i) {
			var role = c.getAttribute("role"), conf = appConfig.getConfig(c) || {};
			var se = this.sizingElement(el,el,c,role,conf);
			if (se) {
				// set { sizingElement:true } on conf?
				var desc = EnhancedDescriptor(c,role,conf,false,appConfig);
				desc.layouterParent = layouterDesc;
				sizingElements[desc.uniqueID] = desc;
			}
		}
	}
	var Layouter = essential.declare("Layouter",Generator(_Layouter));

	/*
		Called for descendants of the layouter to allow forcing sizing, return true to force
	*/
	_Layouter.prototype.sizingElement = function(el,parent,child,role,conf) {
		return false;
	};

	/*
		Called for children in sizingElements
	*/
	_Layouter.prototype.calcSizing = function(el,sizing) {};

	/*
		Called to adjust the layout of the element and laid out children
	*/
	_Layouter.prototype.layout = function(el,layout,sizingEls) {};

	_Layouter.prototype.updateActiveArea = function(areaName,el) {};
	_Layouter.prototype.childLayouterUpdated = function(layouter,el,layout) {};
	_Layouter.prototype.childLaidoutUpdated = function(laidout,el,layout) {};

	/* Laid out element within a container */
	function _Laidout(key,el,conf) {

	}
	var Laidout = essential.declare("Laidout",Generator(_Laidout));

	_Laidout.prototype.layout = function(el,layout) {};
	_Laidout.prototype.calcSizing = function(el,sizing) {};


	// map of uniqueID referenced (TODO array for performance/memory?)
	var enhancedElements = essential.declare("enhancedElements",{});

	var unfinishedElements = essential.declare("unfinishedElements",{});

	// map of uniqueID referenced
	var sizingElements = essential.declare("sizingElements",{});

	// map of uniqueID referenced
	var maintainedElements = essential.declare("maintainedElements",{});

	// open windows
	var enhancedWindows = essential.declare("enhancedWindows",[]);

	function enhanceQuery() {
		var pageResolver = Resolver("page"),
			handlers = pageResolver("handlers"), enabledRoles = pageResolver("enabledRoles");
		for(var i=0,desc; desc = this[i]; ++i) {

			desc.ensureStateful();
			desc._tryEnhance(handlers,enabledRoles);
			desc._tryMakeLayouter(""); //TODO key?
			desc._tryMakeLaidout(""); //TODO key?

			if (desc.conf.sizingElement) sizingElements[desc.uniqueID] = desc;
		}

	}

	function discardQuery() {
		for(var i=0,desc; desc = this[i]; ++i) {
			if (desc) {
				desc.discardNow();
				desc._unlist();
			}
		}
	}


	function DescriptorQuery(sel,el) {
		var q = [], context = { list:q };

		if (typeof sel == "string") {
			//TODO
			if (el) {

			}
		} else {
			var ac = essential("ApplicationConfig")();
			el=sel; sel=undefined;
			if (el instanceof Array) {
				for(var i=0,e; e = el[i]; ++i) {

					var conf = ac.getConfig(e), role = e.getAttribute("role");
					var desc = EnhancedDescriptor(e,role,conf,false,ac);
					if (desc) {
						q.push(desc);
						// if (sizingElement) sizingElements[desc.uniqueID] = desc;
						desc.layouterParent = context.layouter;
						if (desc.conf.layouter) {
							context.layouter = desc;
						}
					} 
				}
			} else {
				//TODO third param context ? integrate with desc.context
				//TODO identify existing descriptors

				//TODO if the el is a layouter, pass that in conf
				ac._prep(el,context);
				//TODO push those matched descriptors into q
			}
		}
		q.el = el;
		q.enhance = enhanceQuery;
		q.discard = discardQuery;
		return q;
	}
	essential.declare("DescriptorQuery",DescriptorQuery);


	function EnhancedContext() {
	}
	// EnhancedContext.prototype.??

	function _EnhancedDescriptor(el,role,conf,page,uniqueID) {

		var roles = role? role.split(" ") : [];

		this.el = el;
		this.sizing = {
			"contentWidth":0,"contentHeight":0
		};
		this.ensureStateful();
		this.stateful.set("state.needEnhance", roles.length > 0);
		this.uniqueID = uniqueID;
		this.roles = roles;
		this.role = roles[0]; //TODO document that the first role is the switch for enhance
		this.conf = conf || {};
		this.context = new EnhancedContext();
		this.instance = null;

		// sizingHandler
		this.layout = {
			"displayed": !(el.offsetWidth == 0 && el.offsetHeight == 0),
			"lastDirectCall": 0,
			"enable": false,
			"throttle": null //TODO throttle by default?
		};
		// layoutHandler
		this.state.enhanced = false;
		this.state.discarded = false;
		this.state.contentManaged = false; // The content HTML is managed by the enhanced element the content will not be enhanced automatically

		this.page = page;
		this.handlers = page.resolver("handlers");
		this.enabledRoles = page.resolver("enabledRoles");
		this._updateContext();
		this._init();
	}

	_EnhancedDescriptor.prototype._updateContext = function() {
		for(var el = this.el.parentNode; el; el = el.parentNode) {
			if (el.uniqueID) {
				var desc = enhancedElements[el.uniqueID];
				if (desc) {
					this.context.el = el;
					this.context.uniqueID = el.uniqueID;
					this.context.instance = desc.instance;
				}
			}
		}
	};

	_EnhancedDescriptor.prototype._init = function() {
		if (this.role && this.handlers.init[this.role]) {
			this.handlers.init[this.role].call(this,this.el,this.role,this.conf,this.context);
		}
	};

	_EnhancedDescriptor.prototype.discardHandler = function() {

	};

	_EnhancedDescriptor.prototype.ensureStateful = function() {
		if (this.stateful) return;

		var stateful = this.stateful = essential("StatefulResolver")(this.el,true);
		this.state = stateful("state");
		stateful.set("sizing",this.sizing);
		stateful.on("change","state",this,this.onStateChange); //TODO remove on discard
	};	

	_EnhancedDescriptor.prototype.onStateChange = function(ev) {
		switch(ev.symbol) {
			case "expanded":
				ev.data.layout.queued = true;
				break;
		}
	};

	_EnhancedDescriptor.prototype.getAttribute = function(name) {
		return this.el.getAttribute(name);
	};

	_EnhancedDescriptor.prototype.setAttribute = function(name,value) {
		return this.el.setAttribute(name,value);
	};


	function _roleEnhancedCleaner(desc) {
		return function() {
			//TODO destroy
			//TODO discard/destroy for layouter and laidout
			// if (desc.discardHandler) 
			return desc.discardHandler(desc.el,desc.role,desc.instance);
		};
	};

	//TODO keep params on page

	_EnhancedDescriptor.prototype._tryEnhance = function(handlers,enabledRoles) {
		if (!this.state.needEnhance) return;
		if (handlers.enhance == undefined) debugger;
		// desc.callCount = 1;
		if (this.role && handlers.enhance[this.role] && enabledRoles[this.role]) {
			this._updateContext();
			//TODO allow parent to modify context
			this.instance = handlers.enhance[this.role].call(this,this.el,this.role,this.conf,this.context);
			this.state.enhanced = this.instance === false? false:true;
			this.state.needEnhance = !this.state.enhanced;
		}
		if (this.state.enhanced) {
			this.sizingHandler = handlers.sizing[this.role];
			this.layoutHandler = handlers.layout[this.role];
			if (this.layoutHandler && this.layoutHandler.throttle) this.layout.throttle = this.layoutHandler.throttle;
			var discardHandler = handlers.discard[this.role];
			if (discardHandler) this.discardHandler = discardHandler;
			this.el._cleaners.push(_roleEnhancedCleaner(this)); //TODO either enhanced, layouter, or laidout
			if (this.sizingHandler) sizingElements[this.uniqueID] = this;
			if (this.layoutHandler) {
				this.layout.enable = true;
				maintainedElements[this.uniqueID] = this;
			}
		} 
	};

	_EnhancedDescriptor.prototype._tryMakeLayouter = function(key) {

		if (this.conf.layouter && this.layouter==undefined) {
			var varLayouter = Layouter.variants[this.conf.layouter];
			if (varLayouter) {
				this.layouter = this.el.layouter = varLayouter.generator(key,this.el,this.conf,this.layouterParent);
				if (this.layouterParent) sizingElements[this.uniqueID] = this;
				if (varLayouter.generator.prototype.hasOwnProperty("layout")) {
					this.layout.enable = true;
	                this.layout.queued = true;
	                maintainedElements[this.uniqueID] = this;
				}
			}
		}
	};

	_EnhancedDescriptor.prototype._tryMakeLaidout = function(key) {

		if (this.conf.laidout && this.laidout==undefined) {
			var varLaidout = Laidout.variants[this.conf.laidout];
			if (varLaidout) {
				this.laidout = this.el.laidout = varLaidout.generator(key,this.el,this.conf,this.layouterParent);
				sizingElements[this.uniqueID] = this;
				if (varLaidout.generator.prototype.hasOwnProperty("layout")) {
					this.layout.enable = true;
	                this.layout.queued = true;
	                maintainedElements[this.uniqueID] = this;
				}
			}
		}

	};

	
	//TODO _EnhancedDescriptor.prototype.prepareAncestors = function() {};

	_EnhancedDescriptor.prototype.refresh = function() {
		var getActiveArea = essential("getActiveArea"); //TODO switch to Resolver("page::activeArea")
		var updateLayout = false;
		
		if (this.layout.area != getActiveArea()) { 
			this.layout.area = getActiveArea();
			updateLayout = true;
		}

		if (updateLayout || this.layout.queued) {
			if (this.layoutHandler) this.layoutHandler(this.el,this.layout,this.instance);
			var layouter = this.layouter, laidout = this.laidout;
			if (layouter) layouter.layout(this.el,this.layout,this.laidouts()); //TODO pass instance
			if (laidout) laidout.layout(this.el,this.layout); //TODO pass instance

            this.layout.queued = false;
		}	
	};

	_EnhancedDescriptor.prototype.laidouts = function() {
		var laidouts = []; // laidouts and layouter
        for(var n in sizingElements) {
            var desc = sizingElements[n];
            if (desc.layouterParent == this) laidouts.push(desc.el);
        }        
		// for(var c = this.el.firstElementChild!==undefined? this.el.firstElementChild : this.el.firstChild; c; 
		// 				c = c.nextElementSibling!==undefined? c.nextElementSibling : c.nextSibling) {
		// 	if (c.stateful && c.stateful("sizing","undefined")) laidouts.push(c);
		// }
		return laidouts;
	};

	_EnhancedDescriptor.prototype.liveCheck = function() {
		if (!this.state.enhanced || this.state.discarded) return;
		var inDom = document.body==this.el || essential("contains")(document.body,this.el); //TODO reorg import
		//TODO handle subpages
		if (!inDom) {
			//TODO destroy and queue discard
			this.discardNow();
		}
	};

	_EnhancedDescriptor.prototype.discardNow = function() {
		if (this.state.discarded) return;

		cleanRecursively(this.el);
		this.context = undefined;
		this.el = undefined;
		this.state.discarded = true;					
		this.layout.enable = false;					
	};

	_EnhancedDescriptor.prototype._unlist = function(forget) {
		this.state.discarded = true;					
		if (this.layout.enable) delete maintainedElements[this.uniqueID];
		if (sizingElements[this.uniqueID]) delete sizingElements[this.uniqueID];
		if (unfinishedElements[this.uniqueID]) delete unfinishedElements[this.uniqueID];
		if (forget) delete enhancedElements[this.uniqueID];
	};

	_EnhancedDescriptor.prototype._queueLayout = function() {

		if (this.layout.displayed != this.sizing.displayed) {
			this.layout.displayed = this.sizing.displayed;
			this.layout.queued = true;
		}

		if (this.layout.width != this.sizing.width || this.layout.height != this.sizing.height) {
			this.layout.width = this.sizing.width;
			this.layout.height = this.sizing.height;
			this.layout.queued = true;
		}
		if (this.layout.contentWidth != this.sizing.contentWidth || this.layout.contentHeight != this.sizing.contentHeight) {
			this.layout.contentWidth = this.sizing.contentWidth;
			this.layout.contentHeight = this.sizing.contentHeight;
			this.layout.queued = true;
		}
	};

	_EnhancedDescriptor.prototype.checkSizing = function() {

		// update sizing with element state
		var ow = this.sizing.width = this.el.offsetWidth;
		var oh = this.sizing.height = this.el.offsetHeight;
		this.sizing.displayed = !(ow == 0 && oh == 0);
		this.sizing.contentWidth = this.el.scrollWidth;
		this.sizing.contentHeight = this.el.scrollHeight;

		if (this.sizingHandler) this.sizingHandler(this.el,this.sizing,this.instance);
		if (this.laidout) this.laidout.calcSizing(this.el,this.sizing);
		if (this.layouterParent) this.layouterParent.layouter.calcSizing(this.el,this.sizing,this.laidout);

		this._queueLayout();
		if (this.layout.queued) {
			if (this.layouterParent) this.layouterParent.layout.queued = true;
		}
	};

	// used to emulate IE uniqueID property
	var lastUniqueID = 555;

	// Get the enhanced descriptor for and element
	function EnhancedDescriptor(el,role,conf,force,page) {
		if (!force && role==null && conf==null && arguments.length>=3) return null;

		var uniqueID = el.uniqueID;
		if (uniqueID == undefined) uniqueID = el.uniqueID = ++lastUniqueID;
		var desc = enhancedElements[uniqueID];
		if (desc && !force) return desc;

		if (page == undefined) {
			var pageResolver = Resolver("page");
			page = pageResolver(["pagesById",el.ownerDocument.uniqueID],"null");
		}
		desc = new _EnhancedDescriptor(el,role,conf,page,uniqueID);
		enhancedElements[uniqueID] = desc;
		var descriptors = page.resolver("descriptors");
		descriptors[uniqueID] = desc;
		if (el._cleaners == undefined) el._cleaners = [];

		return desc;
	}
	EnhancedDescriptor.all = enhancedElements;
	EnhancedDescriptor.unfinished = unfinishedElements;
	EnhancedDescriptor.query = DescriptorQuery;
	EnhancedDescriptor.maintainer = null; // interval handler
	essential.declare("EnhancedDescriptor",EnhancedDescriptor);

	function discardEnhancedElements() 
	{
		for(var n in enhancedElements) {
			var desc = enhancedElements[n];

			desc.discardNow();
			desc._unlist(true);
			// delete enhancedElements[n];
		}
		enhancedElements = EnhancedDescriptor.all = essential.set("enhancedElements",{});
	}
	EnhancedDescriptor.discardAll = discardEnhancedElements;

	EnhancedDescriptor.refreshAll = function() {
		if (document.body == undefined) return;

		for(var n in sizingElements) {
			var desc = sizingElements[n];
			desc.checkSizing();
		}

		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			if (desc.layout.enable && !desc.state.discarded) {
				desc.refresh();
			}
		}
		for(var n in sizingElements) {
			var desc = sizingElements[n];
			desc.layout.queued = false;
		}
	};

	EnhancedDescriptor.maintainAll = function() {
		if (document.body == undefined) return;

		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			desc.liveCheck();
			//TODO if destroyed, in round 2 discard & move out of maintained 
			if (desc.state.discarded) desc._unlist(); // leave it in .all
		}
	};

/* was _resize_descs
	EnhancedDescriptor._resizeAll = function() {
		//TODO migrate to desc.refresh
		for(var n in maintainedElements) { //TODO maintainedElements
			var desc = maintainedElements[n];

			if (desc.layout.enable) {
				var ow = desc.el.offsetWidth, oh  = desc.el.offsetHeight;
				if (desc.layout.width != ow || desc.layout.height != oh) {
					desc.layout.width = ow;
					desc.layout.height = oh;
					var now = (new Date()).getTime();
					var throttle = desc.layout.throttle;
					if (desc.layout.delayed) {
						// set dimensions and let delayed do it
					} else if (typeof throttle != "number" || (desc.layout.lastDirectCall + throttle < now)) {
						// call now
						desc.refresh();
						desc.layout.lastDirectCall = now;
						if (desc.layouterParent) desc.layouterParent.layout.queued = true;
					} else {
						// call in a bit
						var delay = now + throttle - desc.layout.lastDirectCall;
						// console.log("resizing in",delay);
						(function(desc){
							desc.layout.delayed = true;
							setTimeout(function(){
								desc.refresh();
								desc.layout.lastDirectCall = now;
								desc.layout.delayed = false;
								if (desc.layouterParent) desc.layouterParent.layout.queued = true;
							},delay);
						})(desc);
					}
				}
			}
		}
	};

	// refreshAll
	function _area_changed_descs() {
		//TODO only active pages
		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			if (desc.layout.enable) desc.refresh();
		}
	};
*/

	function branchDescs(el) {
		var descs = [];
		var e = el.firstElementChild!==undefined? el.firstElementChild : el.firstChild;
		while(e) {
			if (e.attributes) {
				var desc = EnhancedDescriptor.all[e.uniqueID];
				if (desc) descs.push(desc);
			}
			e = e.nextElementSibling!==undefined? e.nextElementSibling : e.nextSibling;
		}
		return descs;
	}

	enhancedWindows.notifyAll = function() {
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			w.notify(ev);
		}
	};
	enhancedWindows.discardAll = function() {
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			if (w.window) w.window.close();
		}
		enhancedWindows = null;
		essential.set("enhancedWindows.length",0);
		//TODO clearInterval(placement.broadcaster) ?
	};

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

	var _essentialTesting = !!document.documentElement.getAttribute("essential-testing");
	var _readyFired = _essentialTesting;

	function fireDomReady()
	{
		if (_readyFired) return;
		_readyFired = true;

		//TODO derive state.lang and locale from html.lang
		
		Resolver.loadReadStored();

		try {
			essential("_queueDelayedAssets")();
			essential.set("_queueDelayedAssets",function(){});

			instantiatePageSingletons();
		}
		catch(ex) {
			essential("console").error("Failed to launch delayed assets and singletons",ex);
		}
	}
	function fireLoad()
	{

	}
	function fireUnload()
	{
		//TODO singleton deconstruct / before discard?

		Resolver.unloadWriteStored();

		discardRestricted();

		//TODO move to configured
		if (EnhancedDescriptor.maintainer) clearInterval(EnhancedDescriptor.maintainer);
		EnhancedDescriptor.maintainer = null;
		discardEnhancedElements();
		enhancedWindows.discardAll();

		for(var n in Resolver) {
			if (typeof Resolver[n].destroy == "function") Resolver[n].destroy();
		}
		Resolver("page").set("state.launched",false);
		Resolver("page").set("state.livepage",false);
		Resolver("page").set("pages",null);
		Resolver("page").set("pagesById",null);
	}

	// iBooks HTML widget
	if (window.widget) {
		widget.notifyContentExited = function() {
			fireUnload();
		};
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
			translations.declare(["locales",l],defaultLocaleConfig(l));
		} 
	}
	translations.setLocales = setLocales;

    function setKeysForLocale(locale,context,keys,BucketGenerator) {
        var _locale = locale.toLowerCase().replace("_","-");
        for(var key in keys) {
            var sentence = keys[key];
            if (BucketGenerator) translations.declare(["keys",context,key],BucketGenerator());
            translations.set(["keys",context, key, _locale],sentence); //TODO { generator: BucketGenerator }
 
            if (BucketGenerator) translations.declare(["sentences",sentence,context],BucketGenerator());
            translations.set(["sentences",sentence,context,_locale,"key"],key);
        }
    }
    //TODO all these should be bound
    translations.setKeysForLocale = setKeysForLocale;

    function applyTranslationsAPI(resolver) {

		// (key,params)
		// ({ key:key },params)
		// ({ key:key, context:context },params)
		// ({ phrase:phrase },params)
		function translate(key,params) {
			var phrase = null;
			var context = resolver.defaultContext || null;
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
				base = resolver.get(["keys",context,key],"undefined")
				while(t == undefined && base && locale) {
					t = base[locale];
					if (locales[locale]) locale = locales[locale].chain;
					else locale = null;
				}
			} else if (phrase) {
				base = resolver.get(["phrases",context,phrase],"undefined");
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
		resolver.translate = translate;
		resolver._ = translate;
		resolver.set("translate",translate);

		function prepareReverse() {

	        var locale = translations("locale");
	        if (locale) locale = locale.toLowerCase().replace("_","-");
	 
	        // default context
	        for(var context in resolver.namespace.keys) {
	        	var contextKeys = resolver.namespace.keys[context];

		        for(var key in contextKeys) {
	                var bucket = contextKeys[key];
	                if (bucket[locale]) resolver.set(["sentences",bucket[locale].toLowerCase(),context,locale,"key"],key);
		        }
	        }
		}

        function reverseTranslate(sentence,params) {
        	if (resolver.namespace.sentences == undefined) prepareReverse();

            var context = null,
                locale = translations("locale");
            if (locale) locale = locale.toLowerCase().replace("_","-");
            sentence = sentence.toLowerCase();
 
            var r = resolver(["sentences",sentence,context,locale],"undefined");
            if (r == undefined) {
                r = { matches:[] };
                var sentences = resolver("sentences");
                if (sentence.length > 1) for(var n in sentences) {
                    var candidate = resolver(["sentences",sentences[n],context,locale],"undefined");
                    if (candidate && candidate.key && n.indexOf(sentence) >= 0) r.matches.push(candidate.key);
                }
               
            }
            return r;
        }
		resolver.reverseTranslate = reverseTranslate;
		resolver.set("translate",reverseTranslate);
    }
    applyTranslationsAPI(translations);
    essential.set("translate",translations._);
 
 
    function makeKeyTranslationSubset(prefix) {
        var subset = Resolver({});
        applyTranslationsAPI(subset);

        var context = null,
            locale = translations("locale");
        if (locale) locale = locale.toLowerCase().replace("_","-");
 
        // default context
        var defaultKeys = translations(["keys",null]);
        for(var key in defaultKeys) {
            if (key.substring(0,prefix.length) == prefix) {
                var bucket = defaultKeys[key];
                subset.set(["keys",context,key], bucket);
 
                //subset.set(["sentences",bucket[locale].toLowerCase(),context,locale,"key"],key);
            }
        }
 
        //copy context = prefix
        var contextKeys = translations(["keys",prefix],"undefined");
        if (contextKeys) {
	        subset.defaultContext = prefix;
        	subset.set(["keys",prefix],contextKeys);
        }
 
        //TODO sentence translation

        return subset;
    }
    translations.makeKeyTranslationSubset = makeKeyTranslationSubset;

 
 }(window);
 


!function() {

	var essential = Resolver("essential",{}),
		console = essential("console"),
		EnhancedDescriptor = essential("EnhancedDescriptor"),
		isIE = navigator.userAgent.indexOf("; MSIE ") > -1 && navigator.userAgent.indexOf("; Trident/") > -1;

	essential.declare("baseUrl",location.href.substring(0,location.href.split("?")[0].lastIndexOf("/")+1));

	var base = document.getElementsByTagName("BASE")[0];
	if (base) {
		var baseUrl = base.href;
		if (baseUrl.charAt(baseUrl.length - 1) != "/") baseUrl += "/";
		// debugger;
		essential.set("baseUrl",baseUrl);
	}

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

	// str includes the outerHTML for body
	function _applyBody(doc,str) {
		str = str.replace("<body",'<div was="body"').replace("</body>","</div>");
		str = str.replace("<BODY",'<div was="body"').replace("</BODY>","</div>");

		var _body = doc.createElement("body");
		doc.appendChild(_body);

		_body.innerHTML = str;

		var src = _body.firstChild;
		for(var i=0,a; !!(a = src.attributes[0]); ++i) if (a.name != "was") _body.appendChild(a);
		_body.innerHTML = src.innerHTML;

	}

	function _combineHeadAndBody(head,body) { //TODO ,doctype
		if (typeof head == "object" && typeof head.length == "number") {
			head = head.join("");
		}
		if (typeof body == "object" && typeof body.length == "number") {
			body = body.join("");
		}

		if (head && body) {
			if (head.substring(0,5).toLowerCase() != "<head") head = '<head>'+head+'</head>';
			if (body.substring(0,5).toLowerCase() != "<body") body = '<body>'+body+'</body>';
		}

		var text = (head||"") + (body||"");
		if ((head.substring(0,5).toLowerCase() != "<head") && (/<\/body>/.test(text) === false)) text = "<body>" + text + "</body>";
		if (/<\/html>/.test(text) === false) text = '<html>' + text + '</html>';

		text = text.replace("<!DOCTYPE","<!doctype");

		return text;
	}

	function _createStandardsDoc(markup) {
		var doc;
		if (/Gecko\/20/.test(navigator.userAgent)) {
			doc = document.implementation.createHTMLDocument("");
			// if (hasDoctype) 
				doc.documentElement.innerHTML = markup;
			// else doc.body.innerHTML = markup;
			// parser = new DOMParser();
			// doc = parser.parseFromString(_combineHeadAndBody(head,body),"text/html");
		}
		else {
			doc = document.implementation.createHTMLDocument("");
			doc.open();
			doc.write(markup);
			doc.close();
		}
		return doc;
	}

	function _importNode(doc,node,all) {
		if (node.nodeType == 1) { // ELEMENT_NODE
			var nn = doc.createElement(node.nodeName);
			if (node.attributes && node.attributes.length > 0) {
				for(var i=0,a; a=node.attributes[i]; ++i) nn.setAttribute(a.nodeName, node.getAttribute(a.nodeName));
			}
			if (all && node.childNodes && node.childNodes.length>0) {
				for(var i=0,c; c = node.childNodes[i]; ++i) nn.appendChild(_importNode(doc,c,all));
			}
			return nn;
		}

		// TEXT_NODE CDATA_SECTION_NODE COMMENT_NODE
		return doc.createTextNode(node.nodeValue);
	}

	var SUPPORTED_TAGS = "template message abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video".split(" ");
	var IE_HTML_SHIM;

	function shimMarkup(markup) {
		if (IE_HTML_SHIM == undefined) {

			var bits = ["<script>"];
			for(var i=0,t; t = SUPPORTED_TAGS[i]; ++i) bits.push('document.createElement("'+t+'");');			
			bits.push("</script>");
			IE_HTML_SHIM = bits.join("");
		}
		if (markup.indexOf("</head>") >= 0 || markup.indexOf("</HEAD>") >= 0) {
			markup = markup.replace("</head>","</head>" + IE_HTML_SHIM);
			markup = markup.replace("</HEAD>","</HEAD>" + IE_HTML_SHIM);
		} else {
			markup = markup.replace("<body",IE_HTML_SHIM + "<body");
			markup = markup.replace("<BODY",IE_HTML_SHIM + "<BODY");
		}
		return markup;
	}

	var documentId = 444;

	/**
	 * (html) or (head,body) rename to importHTMLDocument ?

	 * head will belong to external doc
	 * body will be imported so elements can be mixed in
	 */
	function importHTMLDocument(head,body) {

		var doc = {},
			markup = _combineHeadAndBody(head,body),
			hasDoctype = markup.substring(0,9).toLowerCase() == "<!doctype";

		try {
			var ext = _createStandardsDoc(markup);
			if (document.adoptNode) {
				doc.head = document.adoptNode(ext.head);
				doc.body = document.adoptNode(ext.body);
			} else {
				doc.head = document.importNode(ext.head);
				doc.body = document.importNode(ext.body);
			}
		}
		catch(ex) {
			var ext = new ActiveXObject("htmlfile");
			markup = shimMarkup(markup);
			ext.write(markup);
			if (ext.head === undefined) ext.head = ext.body.previousSibling;

			doc.uniqueID = ext.uniqueID;
			doc.head = ext.head;
			doc.body = _importNode(document,ext.body,true);

			// markup = markup.replace("<head",'<washead').replace("</head>","</washead>");
			// markup = markup.replace("<HEAD",'<washead').replace("</HEAD>","</washead>");
			// markup = markup.replace("<body",'<wasbody').replace("</body>","</wasbody>");
			// markup = markup.replace("<BODY",'<wasbody').replace("</BODY>","</wasbody>");
		}
		if (!doc.uniqueID) doc.uniqueID = documentId++;

		return doc;
	}
	essential.declare("importHTMLDocument",importHTMLDocument);

 	/**
 	 * (html) or (head,body)
 	 */
	function createHTMLDocument(head,body) {

		var doc,parser,markup = _combineHeadAndBody(head,body),
			hasDoctype = markup.substring(0,9).toLowerCase() == "<!doctype";
		try {
			doc = _createStandardsDoc(markup);
		} catch(ex) {
			// IE can't or won't do it

			if (window.ActiveXObject) {
				//TODO make super sure that this is garbage collected, supposedly sticky
				doc = new ActiveXObject("htmlfile");
				doc.write(markup);
				if (doc.head === undefined) doc.head = doc.body.previousSibling;
			} else {
				doc = document.createElement("DIV");// dummy default

				// this.head = div.getElementsByTagName("washead");
				// this.body = div.getElementsByTagName("wasbody") || div;
				// var __head = _body.getElementsByTagName("washead");
				// var __body = _body.getElementsByTagName("wasbody");
			}
		}
		if (!doc.uniqueID) doc.uniqueID = documentId++;

		return doc;
	}
	essential.declare("createHTMLDocument",createHTMLDocument);

	function DOMParser() {
		//TODO crossbrowser support text/html,text/xml, pluggable mimes
	}

	/*
		Default roles for determining effective role
	*/
	var ROLE = {
		//TODO optional tweak role function

		form: { role:"form" },
		iframe: { role:"presentation"},
		object: { role:"presentation"},
		a: { role:"link" },
		img: { role:"img" },

		label: { role:"note" },
		input: {
			role: "textbox",
			//TODO tweak: tweakInputRole(role,el,parent)
			type: {
				// text: number: date: time: url: email:
				// image: file: tel: search: password: hidden:
				range:"slider", checkbox:"checkbox", radio:"radio",
				button:"button", submit:"button", reset:"button"
			}
		},
		select: { role: "listbox" },
		button: { role:"button" },
		textarea: { role:"textbox" },
		fieldset: { role:"group" },
		progress: { role:"progressbar" },

		"default": {
			role:"default"
		}
	};

	/*
		ROLE
		1) if stateful, by stateful("role")
		1) by role
		2) by implied role (tag,type)
	*/
	function effectiveRole(el) {
		var role;
		if (el.stateful) {
			role = el.stateful("impl.role","undefined");
			if (role) return role;
		}

		// explicit role attribute
		role = el.getAttribute("role");
		if (role) return role;

		// implicit
		var tag = el.tagName || el.nodeName || "default";
		var desc = ROLE[tag.toLowerCase()] || ROLE["default"];
		role = desc.role;

		if (desc.type&&el.type) {
			var type = el.getAttribute("type"); //TODO handlers for unsupported types
			role = desc.type[type] || role;
		}
		if (desc.tweak) role = desc.tweak(role,el);

		return role;
	}
	effectiveRole.ROLE = ROLE;
	essential.set("effectiveRole",effectiveRole);


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

	function _defaultEventProps(ev) {
		ev.bubbles = true; ev.view = window;

		ev.detail = 0;
		ev.screenX = 0; ev.screenY = 0; //TODO map client to screen
		ev.clientX = 1; ev.clientY = 1;
		ev.ctrlKey = false; ev.altKey = false; 
		ev.shiftKey = false; ev.metaKey = false;
		ev.button = 0; //?
		ev.relatedTarget = undefined;
	}

	function createEventIE(type,props) {
		var ev = document.createEventObject();
		_defaultEventProps(ev);
		ev.type = type;
		ev.cancelable = this.cancelable;

        if (props) {
    	 	for (var name in props) ev[name] = props[name];
			ev.button = {0:1, 1:4, 2:2}[props.button] || props.button; 
        }

		return ev;
	}

	function createEventDOM(type,props) {
		var ev = document.createEvent(this.type || "Event"), combined = {};
		_defaultEventProps(combined);
		if (props) {
			for (var name in props) (name == 'bubbles') ? (combined.bubbles = !!props[name]) : (combined[name] = props[name]);
		}
		this.init(ev,combined);

		return ev;
	}

	function initEvent(ev,m) {
		ev.initEvent(this.name,m.bubbles,m.cancelable, m.view,
			m.detail,
			m.screenX, m.screenY, m.clientX, m.clientY,
			m.ctrlKey, m.altKey, m.shiftKey, m.metaKey,
			m.button,
			m.relatedTarget || document.body.parentNode);
	}

	function initFocusEvent(ev,m) {
		ev.initFocusEvent(this.name,m.bubbles,m.cancelable, m.view,
			m.detail,
			m.relatedTarget || document.body.parentNode);
	}

	function initUIEvent(ev,m) {
		ev.initUIEvent(this.name,m.bubbles,m.cancelable, m.view,m.detail);
	}

	function initMouseEvent(ev,m) {
		var eventDoc, doc, body;

		ev.initMouseEvent(this.name,m.bubbles,this.cancelable, m.view,
			m.detail,
			m.screenX, m.screenY, m.clientX, m.clientY,
			m.ctrlKey, m.altKey, m.shiftKey, m.metaKey,
			m.button,
			m.relatedTarget || document.body.parentNode);


		// IE 9+ creates events with pageX and pageY set to 0.
		// Trying to modify the properties throws an error,
		// so we define getters to return the correct values.
		if ( ev.pageX === 0 && ev.pageY === 0 && Object.defineProperty && isIE) {
			eventDoc = ev.relatedTarget.ownerDocument || document;
			doc = eventDoc.documentElement;
			body = eventDoc.body;

			Object.defineProperty( ev, "pageX", {
				get: function() {
					return m.clientX +
						( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
						( doc && doc.clientLeft || body && body.clientLeft || 0 );
				}
			});
			Object.defineProperty( ev, "pageY", {
				get: function() {
					return m.clientY +
						( doc && doc.scrollTop || body && body.scrollTop || 0 ) -
						( doc && doc.clientTop || body && body.clientTop || 0 );
				}
			});
		}
	}

	function triggerEventDOM(el,ev) {
		if (isIE && ev.type == "click") {
			return el.click();
		}
		return el.dispatchEvent(ev);
	}

	function triggerEventIE(el,ev) {
		if (ev.type == "click") {
			return el.click();
		}
		//TODO doScroll for scroll-bars

		if (el) return el.fireEvent("on"+ ev.type,ev);
		else return ev.target.fireEvent("on"+ ev.type,ev);
	}


	function AllEvents() {}
	AllEvents.prototype.__ = function(m) { if (m) for(var n in m) this[n] = m[n]; };
	AllEvents.prototype.cancelable = true;
	AllEvents.prototype.create = createEventDOM;
	AllEvents.prototype.init = initEvent;
	AllEvents.prototype.trigger = triggerEventDOM;

	if (typeof document.createEvent !== "function") {
		AllEvents.prototype.create = createEventIE;
		AllEvents.prototype.trigger = triggerEventIE;
	}


	function MouseEvents(m) {
		this.__(m);
	}
	MouseEvents.prototype = new AllEvents();
	MouseEvents.prototype.type = "MouseEvents";
	MouseEvents.prototype.init = initMouseEvent;
	MouseEvents.prototype.copy = copyMouseEvent;


	function MouseOverOutEvents(m) {
		this.__(m);
	}
	MouseOverOutEvents.prototype = new AllEvents();
	MouseOverOutEvents.prototype.type = "MouseEvents";
	MouseOverOutEvents.prototype.init = initMouseEvent;
	MouseOverOutEvents.prototype.copy = copyMouseEventOverOut;


	function KeyEvents(m) {
		this.__(m);
	}
	KeyEvents.prototype = new AllEvents();
	KeyEvents.prototype.type = "KeyboardEvent";
	KeyEvents.prototype.init = initEvent;
	KeyEvents.prototype.copy = copyKeyEvent;

	
	function InputEvents(m) {
		this.__(m);
	}
	InputEvents.prototype = new AllEvents();
	InputEvents.prototype.type = "FocusEvent";
	InputEvents.prototype.init = initFocusEvent;
	InputEvents.prototype.cancelable = false;
	InputEvents.prototype.copy = copyInputEvent;


	function FocusEvents(m) {
		this.__(m);
	}
	FocusEvents.prototype = new AllEvents();
	FocusEvents.prototype.type = "FocusEvent";
	FocusEvents.prototype.init = initFocusEvent;
	FocusEvents.prototype.cancelable = false;
	FocusEvents.prototype.copy = copyInputEvent;


	function UIEvents(m) {
		this.__(m);
	}
	UIEvents.prototype = new AllEvents();
	UIEvents.prototype.type = "UIEvent";
	UIEvents.prototype.init = initUIEvent;
	UIEvents.prototype.cancelable = false;
	UIEvents.prototype.copy = copyNavigateEvent;


	var BUTTON_MAP = { "1":0, "2":2, "4":1 };
	var EVENTS = {
		// compositionstart/element/true compositionupdate/element/false
		"click" : new MouseEvents({cancelable:false}),
		"dblclick" : new MouseEvents({cancelable:false}),
		"contextmenu": new MouseEvents({cancelable:false}),

		"mousemove": new MouseEvents({cancelable:false}),
		"mouseup": new MouseEvents(),
		"mousedown": new MouseEvents(),
		"mousewheel": new MouseEvents({cancelable:false,type:"MouseWheelEvent"}), //TODO initMouseWheelEvent
		"wheel": new MouseEvents({type:"MouseEvent"}), //?? WheelEvent ?
		"mouseenter": new MouseEvents({cancelable:false}),
		"mouseleave": new MouseEvents({cancelable:false}),

		"mouseout": new MouseOverOutEvents(),
		"mouseover": new MouseOverOutEvents(),

		"keyup": new KeyEvents(),
		"keydown": new KeyEvents(),
		"keypress": new KeyEvents(),

		"blur": new FocusEvents(),
		"focus": new FocusEvents(),
		"focusin": new FocusEvents(),
		"focusout": new FocusEvents(),

		"copy": new InputEvents(),
		"cut": new InputEvents(),
		"change": new InputEvents(),
		// "input": new InputEvents(),
		// "textinput": new InputEvents(),
		"selectstart": new InputEvents(),

		"scroll": new UIEvents(),

		"reset": new InputEvents(),
		"submit": new InputEvents(),

		"select": new UIEvents(),
		"abort": new UIEvents(),
		"error": new UIEvents(),

		"haschange": new UIEvents(),

		"load": new UIEvents(),
		"unload": new UIEvents(),
		"resize": new UIEvents(),


		"":{}
	};
	for(var n in EVENTS) EVENTS[n].name = n;


	var lowestDelta = 1E10, lowestDeltaXY = 1E10;

	function MutableEvent_withMouseInfo() {
		/*
			deltaX,deltaY origin top left
			wheelDeltaX,wheelDeltaY origin ?
		*/
		var delta = 0, deltaX = 0, deltaY = 0, absDelta = 0, absDeltaXY = 0;

		// New school FF17+
		if (typeof this.deltaX == "number" && typeof this.deltaY == "number") {
			deltaX = this.deltaX; deltaY = this.deltaX;
			this.delta = this.deltaY? this.deltaY : this.deltaX;

			delta = this.delta;
		}
		// Webkit
		else if (typeof this.wheelDeltaX == "number" && typeof this.wheelDeltaY == "number") {
			this.deltaX = deltaX = this.wheelDeltaX;
			this.deltaY = deltaY = this.wheelDeltaY;
		}
		else if (this.axis != undefined) {
			// DOMMouseScroll FF3.5+
			deltaX = this.deltaX = this.axis == ev.HORIZONTAL_AXIS? -this.delta : 0;
			deltaY = this.deltaY = this.axis == ev.VERTICAL_AXIS? this.delta : 0;
		}
		else {

		}

		//TODO normalised props based on jquery-mousewheel
		absDelta = Math.abs(delta);
		absDeltaXY = Math.max(Math.abs(deltaY),Math.abs(deltaX));

		// console.log("deltas",{x:deltaX,y:deltaY},"scrollLeft",this.target.scrollLeft);

		/*
		var delta = this.delta;
		this.deltaX = this.x;
		this.deltaY = this.y;

		// Old school scrollwheel delta
		if (ev.wheelDelta) { delta = ev.wheelDelta/120; }
		if (ev.detail) { delta = -ev.detail/3; }

		// New school multidim scroll (touchpads) deltas
		this.deltaY = delta;


		// Webkit
		if (ev.wheelDeltaY !== undefined) { this.deltaY = ev.wheelDeltaY/120; }
		if (ev.wheelDeltaX !== undefined) { this.deltaX = -1 * ev.wheelDeltaX/120; }
		*/
		return this;
	}


	function MutableEvent_withActionInfo() {
		var element = this.target;
		// role of element or ancestor
		// TODO minor tags are traversed; Stop at document, header, aside etc
		
		while(element && element.tagName) {
			if (element.getElementById || element.getAttribute == undefined) return this; // document element not applicable

			var role = element.getAttribute("role") || effectiveRole(element);
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
				/*
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
				*/
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
		var commandName = "trigger",
			commandElement = null, i, e;

		if (form.elements) {
			for(i=0; !!(e=form.elements[i]); ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
		} else {
			var buttons = form.getElementsByTagName("button");
			for(i=0;!!(e=buttons[i]); ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
			var inputs = form.getElementsByTagName("input");
			if (commandElement) for(i=0;!!(e=inputs[i]); ++i) {
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
		this.target = src.target || src.srcElement;
		this.currentTarget = src.currentTarget|| src.target; 
		if (src.type) {
			this.type = src.type;
			var r = EVENTS[src.type];
			if (r) r.copy.call(this,src);
			else console.warn("unhandled essential event",src.type,src);
		}
	}
	_MutableEvent.prototype.relatedTarget = null;
	_MutableEvent.prototype.withMouseInfo = MutableEvent_withMouseInfo;
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
    _MutableEvent.prototype.trigger = function(el) {
	 	// returns false if cancelled
        return EVENTS[this.type].trigger(el || this.target, this._original);
    };
    
    function _NativeEventIE(type,props) {
		var _native = EVENTS[type].create(type,props);
		// setting type/srcElement on _native breaks fireEvent
        var event = new _MutableEvent( _native );
        event.type = type;
		if (props && props.target) event.target = props.target;
        return event;
    }
    
    function _NativeEvent(type, props) {
		var event = EVENTS[type].create(type,props);
        // var event = document.createEvent(EVENTS[type].type || "Events"), bubbles = true;
        // if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name]);
        // event.initEvent(type, bubbles, EVENTS[type].cancelable, null, null, null, null, null, null, null, null, null, null, null, null);
        event.isDefaultPrevented = _MutableEvent.prototype.isDefaultPrevented;
        event.trigger = function(target) { return EVENTS[type].trigger(target || this.target,this); };
        return event;
    }

	//TODO consider moving ClonedEvent out of call
	function MutableEventModern(sourceEvent,props) {
        if (typeof sourceEvent == "string") return _NativeEvent(sourceEvent,props);
        
		if (sourceEvent.withActionInfo) return sourceEvent;
		function ClonedEvent() {
            this._original = sourceEvent;
            this.withMouseInfo = MutableEvent_withMouseInfo;
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

        sourceEvent.withMouseInfo = MutableEvent_withMouseInfo;
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

	function getScrollOffsets(el) {
		var left=0,top=0;
		while(el && !isNaN(el.scrollTop)){
			top += el.scrollTop;
			left += el.scrollLeft;
			el = el.parentNode;
		}
		return { left:left, top:top };
	}
	essential.declare("getScrollOffsets",getScrollOffsets);

	function getPageOffsets(el) {
		var scrolls = getScrollOffsets(el);

		var left=0,top=0;
		while(el){
			top += el.offsetTop;
			left += el.offsetLeft;
			el = el.offsetParent;
		}
		return { left:left - scrolls.left, top:top - scrolls.top };
	}
	essential.declare("getPageOffsets",getPageOffsets);

	var _innerHTML = function(_document,el,html) {
		el.innerHTML = html;
	}
	if (isIE){
		_innerHTML = _innerHTMLIE; //TODO do all IE do this shit?
	}

	function _innerHTMLIE(_document,el,html) {
		if (_document.body==null) return; // no way to set html then :(
		if (contains(document.body,el)) el.innerHTML = html;
		else {
			var drop = _document._inner_drop;
			if (drop == undefined) {
				drop = _document._inner_drop = _document.createElement("DIV");
				_document.body.appendChild(drop);
			}
			drop.innerHTML = html;
			for(var c = drop.firstChild; c; c = drop.firstChild) el.appendChild(c);
		}
	}

	// (tagName,{attributes},content)
	// ({attributes},content)
	function HTMLElement(tagName,from,content_list,_document) {
			//TODO _document
		var c_from = 2, c_to = arguments.length-1, _tagName = tagName, _from = from;
		
		// optional document arg
		var d = arguments[c_to];
		var _doc = document; //TODO override if last arg is a document
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
			for(var i=0,a; !!(a = _from.attributes[i]); ++i) {
				__from[a.name] = a.value;
			}
			_from = __from;
		}
		
		var e = _doc.createElement(_tagName), enhanced = false;
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

				case "data-role":
					if (typeof _from[n] == "object") {
						var s = JSON.stringify(_from[n]);
						e.setAttribute(n,s.substring(1,s.length-1));
					}
					else e.setAttribute(n,_from[n]);
					break;

				case "id":
				case "className":
				case "rel":
				case "lang":
				case "language":
					if (_from[n] !== undefined) e[n] = _from[n]; 
					break;

				case "impl":
					if (_from[n]) e.impl = HTMLElement.impl(e);
					break;

				case "enhanced":
					enhanced = _from[n];
					break;

				// "type" IE9 el.type is readonly:

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
			_innerHTML(_doc,e,l.join("")); 
		} 
		
		//TODO .appendTo function
		
		if (enhanced) HTMLElement.query([e]); //TODO call enhance?
		
		return e;
	}
	essential.set("HTMLElement",HTMLElement);
	
	HTMLElement.query = essential("DescriptorQuery");

	HTMLElement.getEnhancedParent = function(el) {
		for(el = el.parentNode; el; el = el.parentNode) {
			var desc = EnhancedDescriptor.all[el.uniqueID];
			if (desc && (desc.state.enhanced || desc.state.needEnhance)) return el;
		}
		return null;
	};

	/*
		Discard the element call handlers & cleaners, unlist it if enhanced, remove from DOM
	*/
	HTMLElement.discard = function(el,leaveInDom) {

		this.query(el).discard();
		// var desc = EnhancedDescriptor.all[el.uniqueID];
		// if (desc) {
		// 	desc.discardNow();
		// 	desc._unlist();
		// }
		essential("cleanRecursively")(el);

		if (!leaveInDom) el.parentNode.removeChild(el);
	};

	
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


	function _ElementPlacement(el,track) {
		this.el = el;
		this.bounds = {};
		this.style = {};
		this.track = track || ["visibility","marginLeft","marginRight","marginTop","marginBottom"];

		if (el.currentStyle &&(document.defaultView == undefined || document.defaultView.getComputedStyle == undefined)) {
			this._compute = this._computeIE;
		}
		if (document.body.getBoundingClientRect().width == undefined) {
			this._bounds = this._boundsIE;
		}

		this.compute();
	}
	var ElementPlacement = essential.declare("ElementPlacement",Generator(_ElementPlacement));

	_ElementPlacement.prototype.compute = function() {
		this._bounds();
		for(var i=0,s; !!(s = this.track[i]); ++i) {
			this.style[s] = this._compute(s);
		}
	};

	_ElementPlacement.prototype._bounds = function() {
		this.bounds = this.el.getBoundingClientRect();
	};

	_ElementPlacement.prototype._boundsIE = function() {
		var bounds = this.el.getBoundingClientRect();
		this.bounds = {
			width: bounds.right - bounds.left, height: bounds.bottom - bounds.top,
			left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom
		};
	};

	_ElementPlacement.prototype.PIXEL = /^\d+(px)?$/i;

	_ElementPlacement.prototype.KEYWORDS = {
		'medium':"2px"	
	};

	_ElementPlacement.prototype.CSS_TYPES = {
		'border-width':'size',
		'border-left-width':'size',
		'border-right-width':'size',
		'border-bottom-width':'top',
		'border-top-width':'top',
		'borderWidth':'size',
		'borderLeftWidth':'size',
		'borderRightWidth':'size',
		'borderBottomWidth':'top',
		'borderTopWidth':'top',


		'padding': 'size',
		'padding-left': 'size',
		'padding-right': 'size',
		'padding-top': 'top',
		'padding-bottom': 'top',
		'paddingLeft': 'size',
		'paddingRight': 'size',
		'paddingTop': 'top',
		'paddingBottom': 'top',

		'margin': 'size',
		'margin-left': 'size',
		'margin-right': 'size',
		'margin-top': 'top',
		'margin-bottom': 'top',
		'marginLeft': 'size',
		'marginRight': 'size',
		'marginTop': 'top',
		'marginBottom': 'top',
		
		'font-size': 'size',
		'fontSize': 'size',
		'line-height': 'top', 
		'lineHeight': 'top', 
		'text-indent': 'size',
		'textIndent': 'size',
		
		'width': 'size',
		'height': 'top',
		'max-width': 'size',
		'max-height': 'top',
		'min-width': 'size',
		'min-height': 'top',
		'maxWidth': 'size',
		'maxHeight': 'top',
		'minWidth': 'size',
		'minHeight': 'top',
		'left':'size',
		'right':'size',
		'top': 'top',
		'bottom': 'top'
	};

	_ElementPlacement.prototype.OFFSET_NAME = {
		"left":"offsetLeft",
		"width":"offsetWidth",
		"top":"offsetTop",
		"height":"offsetHeight"
	};

	_ElementPlacement.prototype.CSS_NAME = {
		'backgroundColor':'background-color',
		'backgroundImage':'background-image',
		'backgroundPosition':'background-position',
		'backgroundRepeat':'background-repeat',

		'borderWidth':'border-width',
		'borderLeft':'border-left',
		'borderRight':'border-right',
		'borderTop':'border-top',
		'borderBottom':'border-bottom',
		'borderLeftWidth':'border-left-width',
		'borderRightWidth':'border-right-width',
		'borderBottomWidth':'border-bottom-width',
		'borderTopWidth':'border-top-width',

		'paddingLeft': 'padding-left',
		'paddingRight': 'padding-right',
		'paddingTop': 'padding-top',
		'paddingBottom': 'padding-bottom',

		'marginLeft': 'margin-left',
		'marginRight': 'margin-right',
		'marginTop': 'margin-top',
		'marginBottom': 'margin-bottom',
		
		'fontSize': 'font-size',
		'lineHeight': 'line-height',
		'textIndent': 'text-indent'
		
	};

	_ElementPlacement.prototype.JS_NAME = {
		'background-color':'backgroundColor',
		'background-image':'backgroundImage',
		'background-position':'backgroundPosition',
		'background-repeat':'backgroundRepeat',

		'border-width':'borderWidth',
		'border-left':'borderLeft',
		'border-right':'borderRight',
		'border-top':'borderTop',
		'border-bottom':'borderBottom',
		'border-left-width':'borderLeftWidth',
		'border-right-width':'borderRightWidth',
		'border-bottom-width':'borderBottomWidth',
		'border-top-width':'borderTopWidth',

		'padding-left':'paddingLeft',
		'padding-right':'paddingRight',
		'padding-top':'paddingTop',
		'padding-bottom':'paddingBottom',

		'margin-left':'marginLeft',
		'margin-right':'marginRight',
		'margin-top':'marginTop',
		'margin-bottom':'marginBottom',
		
		'font-size':'fontSize',
		'line-height':'lineHeight',
		'text-indent':'textIndent'
		
	};

/**
 * Computes a value into pixels on InternetExplorer, if it is possible.
 * @private
 * 
 * @param {String} sProp 'size', 'left' or 'top'
 * @returns function that returns Pixels in CSS format. IE. 123px
 */
function _makeToPixelsIE(sProp)
{
	
	var sPixelProp = "pixel" + sProp.substring(0,1).toUpperCase() + sProp.substring(1);

	return function(eElement,sValue) {
		var sInlineStyle = eElement.style[sProp];
		var sRuntimeStyle = eElement.runtimeStyle[sProp];
		try
		{
			eElement.runtimeStyle[sProp] = eElement.currentStyle[sProp];
			eElement.style[sProp] = sValue || 0;
			sValue = eElement.style[sPixelProp] + "px";
		}
		catch(ex)
		{
			
		}
		eElement.style[sProp] = sInlineStyle;
		eElement.runtimeStyle[sProp] = sRuntimeStyle;

		return sValue;
	};
}


_ElementPlacement.prototype.TO_PIXELS_IE = {
	"left": _makeToPixelsIE("left"),
	"top": _makeToPixelsIE("top"),
	"size": _makeToPixelsIE("left")
};


_ElementPlacement.prototype._compute = function(style)
{
	var value = document.defaultView.getComputedStyle(this.el, null)[style];
	//TODO do this test at load to see if needed
	if (typeof value == "string" && value.indexOf("%")>-1) {
		value = this.el[this.OFFSET_NAME[style]] + "px";
	}
		
	return value;
};

_ElementPlacement.prototype._computeIE = function(style)
{
	var value;
	
	style = this.JS_NAME[style] || style;

	var v = this.el.currentStyle[style];
	var sPrecalc = this.KEYWORDS[v];
	if (sPrecalc !== undefined) return sPrecalc; 
	if (this.PIXEL.test(v)) return v;

	var fToPixels = this.TO_PIXELS_IE[this.CSS_TYPES[style]];
		value = fToPixels? fToPixels(this.el, v) : v;
		
	return value;
};


}();
/*jslint white: true */
/*
	StatefulResolver and ApplicationConfig
*/
!function(Scripted_gather) {

	var essential = Resolver("essential",{}),
		console = essential("console"),
		DOMTokenList = essential("DOMTokenList"),
		MutableEvent = essential("MutableEvent"),
		arrayContains = essential("arrayContains"),
		escapeJs = essential("escapeJs"),
		HTMLElement = essential("HTMLElement"),
		serverUrl = location.protocol + "//" + location.host,
		HTMLScriptElement = essential("HTMLScriptElement"),
		EnhancedDescriptor = essential("EnhancedDescriptor"),
		sizingElements = essential("sizingElements"),
		enhancedWindows = essential("enhancedWindows");
	var contains = essential("contains"),
		importHTMLDocument = essential("importHTMLDocument");

	var COPY_ATTRS = ["rel","href","media","type","src","lang","defer","async","name","content","http-equiv","charset"];
	var EMPTY_TAGS = { "link":true, "meta":true, "base":true, "img":true, "br":true, "hr":true, "input":true, "param":true };
	
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

	var nativeClassList = !!document.documentElement.classList;

	function readElementState(el,state) {

		for(var n in state_treatment) {
			var treatment = state_treatment[n], value;
			if (treatment.read) value = treatment.read(el,n);
			if (value == undefined) value = treatment["default"];
			if (value !== undefined) state[n] = value;
		}
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
			el.setAttribute(key,this["true"] || "true");
		} else {
			el.removeAttribute(key);
		}
	}

	/*
		Reflect only aria property 
	*/
	function reflectAria(el,key,value) {
		if (value) {
			el.setAttribute("aria-"+key,this["true"] || "true");
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	/*
		Reflect on property or attribute and aria equivalent. 
	*/
	function reflectAttributeAria(el,key,value) {
		if (value) {
			el.setAttribute(key,this["true"] || "true");
		} else {
			el.removeAttribute(key);
		}

		if (value) {
			el.setAttribute("aria-"+key,this["true"] || "true");
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	function reflectPropertyAria(el,key,value) {
		if (typeof el[key] == "boolean") {
			el[key] = !!value;
		} else {
			if (value) {
				el.setAttribute(key,this["true"] || "true");
			} else {
				el.removeAttribute(key);
			}
		}
		if (value) {
			el.setAttribute("aria-"+key,this["true"] || "true");
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	function reflectAriaProp(el,key,value) {
		el[this.property] = value;
	}

	function reflectBoolean(el,key,value) {
		// html5: html5 property/attribute name
		// aria: aria property name
		if (this.html5 !== false && typeof el[this.html5 || key] == "boolean") {
			el[this.html5] = !!value;
		} 
		// Set aria prop or leave it to the attribute ?
		if (this.aria && typeof el[this.aria] == "boolean") {
			el[this.aria] = !!value;
		} 

		if (value) {
			el.setAttribute("aria-"+key,this["true"] || "true");
			el.setAttribute(this.html5,this["true"] || "true");
		} else {
			el.removeAttribute("aria-"+key);
			el.removeAttribute(this.html5);
		}
	}


	function readPropertyAria(el,key) {
		var value = el.getAttribute("aria-"+key), result;
		if (value != null) result = value != "false" && value != ""; 

		if (el[key] != undefined && !(el[key] === this["default"] && result !== undefined)) result = el[key]; // el.disabled is undefined before attach
		if (result == undefined && ! contains(el.ownerDocument.body,el)) {
			//TODO shift this to an init function used if not parentNode
			value = el.getAttribute(key);
			if (value != null) result = value != "false";//TODO should this be special config for disabled?,.. && value != ""; 
		}

		return result;
	}

	function readAttribute(el,key) {
		var value = el.getAttribute(key), result;
		if (value != null) result = value != "false" && value != ""; 

		return result;
	}

	function readAttributeAria(el,key) {
		var value = el.getAttribute("aria-"+key), result;
		if (value != null) result = value != "false" && value != ""; 

		value = el.getAttribute(key);
		if (value != null) result = value != "false" && value != ""; 

		return result;
	}

	function readBoolean(el,key) {
		// html5: html5 property/attribute name
		// aria: aria property name
		if (this.html5 !== false && typeof el[this.html5 || key] == "boolean") {
			if (el[this.html5]) return true;
		} 
		if (this.aria && typeof el[this.aria] == "boolean") {
			if (el[this.aria]) return true;
		} 

		var value = el.getAttribute("aria-"+key), result;
		if (value != null) result = value != "false" && value != ""; 

		value = el.getAttribute(this.html5 || key);
		if (value != null) result = value != "false" && value != ""; 

		return !!result;
	}

	function readAria(el,key) {
		var value = el.getAttribute("aria-"+key), result;
		if (value != null) result = value != "false" && value != ""; 

		value = el.getAttribute(key);
		if (value != null) result = value != "false" && value != ""; 

		return result;
	}

	var state_treatment = {
		disabled: { index: 0, reflect: reflectPropertyAria, read: readPropertyAria, "default":false, property:"ariaDisabled", "true":"disabled" }, // IE hardcodes a disabled text shadow for buttons and anchors
		readOnly: { index: 1, read: readPropertyAria, "default":false, reflect: reflectProperty },
		hidden: { index: 2, reflect: reflectBoolean, read: readBoolean, aria:"ariaHidden", html5:"hidden" }, // Aria all elements
		required: { index: 3, reflect: reflectBoolean, read: readBoolean, aria:"ariaRequired", html5:"required" },
		invalid: { index: 4, reflect: reflectBoolean, read: readBoolean, aria:"ariaInvalid", html5:false },
		expanded: { index: 5, reflect: reflectAttributeAria, read: readAria, property:"ariaExpanded" }, //TODO ariaExpanded
		checked: { index: 6, reflect:reflectProperty, read: readPropertyAria, property:"ariaChecked" }, //TODO ariaChecked ?
		pressed: { index: 7, reflect: reflectBoolean, read: readBoolean, aria:"ariaPressed", html5:false },
		selected: { index: 8, reflect: reflectBoolean, read: readBoolean, "default":false, aria:"ariaSelected", html5:"selected" },
		active: { index: 9, reflect:reflectAttribute, read: readAttribute } //TODO custom attribute: "data-active"

		//TODO inert
		//TODO draggable
		//TODO contenteditable
		//TODO tooltip
		//TODO hover
		//TODO down 
		//TODO ariaDisabled

		/*TODO IE aria props
			string:
			ariaPressed ariaSecret ariaRelevant ariaReadonly ariaLive
			ariaBusy ariaActivedescendant ariaFlowto ariaDisabled
		*/

		//TODO restricted/forbidden tie in with session specific permissions

		//TODO focus for elements with focus
	};

    //Temp Old IE check, TODO move to IE shim, shift disabled attr to aria-disabled if IE
    if (document.addEventListener) {
        state_treatment.disabled.reflect = reflectAria;
        // state_treatment.disabled.read = readAttributeAria;
    }
 
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
			var bits = (symbolState||"").split("%");

			if (bits.length > 1) {
				DOMTokenList_tmplClass(el,bits[0],bits[1],event.value);
			} 
			else DOMTokenList_eitherClass(el,symbolState,symbolNotState,event.value);
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
	ClassForState.prototype.active = "state-active";

	function ClassForNotState() {

	}
	ClassForNotState.prototype.disabled = "";
	ClassForNotState.prototype.readOnly = "";
	ClassForNotState.prototype.hidden = "";
	ClassForNotState.prototype.required = "";
	ClassForNotState.prototype.expanded = "";
	ClassForNotState.prototype.active = "";

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

	// application/config declarations on the main page
	pageResolver.declare("config",{});

	// descriptors for elements on main page to enhance
	pageResolver.declare("descriptors",{});

	pageResolver.reference("state").mixin({
		"livepage": false,
		"background": false, // is the page running in the background
		"managed": false, // managed by a main window
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

	pageResolver.declare("enabledRoles",{});
	pageResolver.declare("handlers.init",{});
	pageResolver.declare("handlers.enhance",{});
	pageResolver.declare("handlers.sizing",{});
	pageResolver.declare("handlers.layout",{});
	pageResolver.declare("handlers.discard",{});

	pageResolver.declare("templates",{});

	// Object.defineProperty(pageResolver.namespace,'handlers',{
	// 	get: function() { return pageResolver.namespace.__handlers; },
	// 	set: function(value) {
	// 		debugger;
	// 		pageResolver.namespace.__handlers = value;
	// 	}
	// });

	// Object.defineProperty(pageResolver("handlers"),'enhance',{
	// 	get: function() { return pageResolver.namespace.handlers.__enhance; },
	// 	set: function(value) {
	// 		debugger;
	// 		pageResolver.namespace.handlers.__enhance = value;
	// 	}
	// });


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


	/* Active Element (pagewide) */
	var oldActiveElement = null;
	pageResolver.set("activeElement",null);
	pageResolver.reference("activeElement").on("change",function(ev){
		if (oldActiveElement) StatefulResolver(oldActiveElement).set("state.active",false);
		if (ev.value) StatefulResolver(ev.value,true).set("state.active",true);
		oldActiveElement = ev.value;
	});


	/*
		Area Activation
	*/
	var _activeAreaName,_liveAreas=false;

	function activateArea(areaName) {
		if (! _liveAreas) { //TODO switch to pageResolver("livepage")
			_activeAreaName = areaName;
			return;
		}
		
		//TODO maintained & reacting to resolver change state.activeArea
		for(var n in EnhancedDescriptor.all) {
			var desc = EnhancedDescriptor.all[n];
			if (desc.layouter) desc.layouter.updateActiveArea(areaName,desc.el);
		}
		_activeAreaName = areaName;
		EnhancedDescriptor.maintainAll();
	}
	essential.set("activateArea",activateArea);
	
	function getActiveArea() {
		return _activeAreaName;
	}
	essential.set("getActiveArea",getActiveArea);

	var _essentialTesting = !!document.documentElement.getAttribute("essential-testing");

	function bringLive() {
		// var ap = ApplicationConfig(); //TODO factor this and possibly _liveAreas out

		for(var i=0,w; w = enhancedWindows[i]; ++i) if (w.openWhenReady) {
			w.openNow();
			delete w.openWhenReady;
		}
		EnhancedWindow.prototype.open = EnhancedWindow.prototype.openNow;

		//TODO if waiting for initial page src postpone this

		// Allow the browser to render the page, preventing initial transitions
		_liveAreas = true;
		pageResolver.set("state.livepage",true);

	}

	function onPageLoad(ev) {
		_liveAreas = true;
		pageResolver.set("state.livepage",true);
	}

	if (!_essentialTesting) {
		if (window.addEventListener) window.addEventListener("load",onPageLoad,false);
		else if (window.attachEvent) window.attachEvent("onload",onPageLoad);
	}

	// page state & sub pages instances of _Scripted indexed by logical URL / id
	Resolver("page").declare("pages",{});
	Resolver("page").declare("pagesById",{});
	Resolver("page").declare("state.requiredPages",0);

	function _Scripted() {
		// the derived has to define resolver before this
		this.config = this.resolver.reference("config","undefined");
		this.resolver.declare("resources",[]);
		this.resources = this.resolver.reference("resources");
		this.resolver.declare("inits",[]);
		this.inits = this.resolver.reference("inits");
	}

	_Scripted.prototype.declare = function(key,value) {
		this.config.declare(key,value);
		if (typeof value == "object") {
			if (value["introduction-area"]) this.resolver.declare("introduction-area",value["introduction-area"]);
			if (value["authenticated-area"]) this.resolver.declare("authenticated-area",value["authenticated-area"]);
		}
	}; 

	_Scripted.prototype.modules = { "domReady":true };	// keep track of what modules are loaded

	_Scripted.prototype.context = {
		"require": function(path) {
			if (this.modules[path] == undefined) {
				var ex = new Error("Missing module '" + path + "'");
				ex.ignore = true;
				throw ex;	
			} 
		}
	};

	_Scripted.prototype._gather = Scripted_gather;

	var _singleQuotesRe = new RegExp("'","g");

	_Scripted.prototype._getElementRoleConfig = function(element,key) {
		//TODO cache the config on element.stateful

		var config = null;

		// mixin the declared config
		if (key) {
			var declared = this.config(key);
			if (declared) {
				config = {};
				for(var n in declared) config[n] = declared[n];
			}
		}

		if (element == this.body) {
			var declared = this.config("body");
			if (declared) {
				config = config || {};
				for(var n in declared) config[n] = declared[n];
			}
		}
		else if (element == this.head) {
			var declared = this.config("head");
			if (declared) {
				config = config || {};
				for(var n in declared) config[n] = declared[n];
			}
		}

		// mixin the data-role
		var dataRole = element.getAttribute("data-role");
		if (dataRole) try {
			config = config || {};
			var map = JSON.parse("{" + dataRole.replace(_singleQuotesRe,'"') + "}");
			for(var n in map) config[n] = map[n];
		} catch(ex) {
			console.debug("Invalid config: ",dataRole,ex);
			config["invalid-config"] = dataRole;
		}

		return config;
	};

	_Scripted.prototype.getElement = function(key) {
		var keys = key.split(".");
		// var el = this.document.getElementById(keys[0]);
		var el = this.document.body.querySelector("#"+keys[0]); //TODO API
		if (el && keys.length > 1) el = el.getElementByName(keys[1]);
		return el;
	};

	_Scripted.prototype.declare = function(key,value) {
		this.config.declare(key,value);
	};

	_Scripted.prototype.getConfig = function(element) {
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

	_Scripted.prototype.doInitScripts = function() {
		var inits = this.inits();
		for(var i=0,s; s = inits[i]; ++i) if (s.parentNode && !s.done) {
			// this.currently = s
			try {
				this.context["element"] = s;
				this.context["parentElement"] = s.parentElement || s.parentNode;
				with(this.context) eval(s.text);
				s.done = true;
			} catch(ex) {
				// debugger;
			} //TODO only ignore ex.ignore
		}
		this.context["this"] = undefined;
	};

	//TODO move to DescriptorQuery, move when improving scroller
	_Scripted.prototype._prep = function(el,context) {

		var e = el.firstElementChild!==undefined? el.firstElementChild : el.firstChild;
		while(e) {
			if (e.attributes) {
				var conf = this.getConfig(e), role = e.getAttribute("role");
				// var sizingElement = false;
				// if (context.layouter) sizingElement = context.layouter.sizingElement(el,e,role,conf);
				var desc = EnhancedDescriptor(e,role,conf,false,this);
				if (desc) {
					if (context.list) context.list.push(desc);
					// if (sizingElement) sizingElements[desc.uniqueID] = desc;
					desc.layouterParent = context.layouter;
					if (desc.conf.layouter) {
						context.layouter = desc;
					}
				} else {

				}
				if (desc==null || !desc.state.contentManaged) this._prep(e,{layouter:context.layouter,list:context.list});
			}
			e = e.nextElementSibling!==undefined? e.nextElementSibling : e.nextSibling;
		}
	};

	/*
		Prepare enhancing elements with roles/layout/laidout
	*/
	_Scripted.prototype.prepareEnhance = function() {

		this._gather(this.head.getElementsByTagName("script"));
		this._gather(this.body.getElementsByTagName("script"));		
		this._prep(this.body,{});
	};

	function delayedScriptOnload(scriptRel) {
		function delayedOnload(ev) {
			var el = this, src = el.getAttribute("src");
			var name = el.getAttribute("name");
			if (name) {
				ApplicationConfig().modules[name] = true;
			}
			setTimeout(function(){
				// make sure it's not called before script executes
				var scripts = pageResolver(["state","loadingScriptsUrl"]);
				//console.info("script",el.getAttribute("src"),el.src,scriptRel);

				if (scripts[src] != undefined) {
					// relative url
					pageResolver.set(["state","loadingScriptsUrl",src],false);
				} else if (scripts[el.src.replace(serverUrl,"")] != undefined) {
					//TODO absolute url
					pageResolver.set(["state","loadingScriptsUrl",el.src.replace(serverUrl,"")],false);
				}
			},0);
		}
		return delayedOnload;       
	}

	_Scripted.prototype._queueAssets = function() {

		var links = this.document.getElementsByTagName("link");

		//TODO differentiate on type == "text/javascript"
		for(var i=0,l; l=links[i]; ++i) switch(l.rel) {
			case "stylesheet":
				this.resources().push(l);
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
				attrs["base"] = essential("baseUrl");
				attrs["subpage"] = (l.getAttribute("subpage") == "false" || l.getAttribute("data-subpage") == "false")? false:true;
				//attrs["id"] = l.getAttribute("script-id");
				attrs["onload"] = delayedScriptOnload(l.rel);

				var relSrc = attrs["src"].replace(essential("baseUrl"),"");
				l.attrs = attrs;
				if (l.rel == "preload") {
					var langOk = true;
					if (l.lang) langOk = (l.lang == this.resolver("state.lang"));
					if (langOk) {
						this.resolver.set(["state","preloading"],true);
						this.resolver.set(["state","loadingScripts"],true);
						this.resolver.set(["state","loadingScriptsUrl",relSrc],l); 
						this.body.appendChild(HTMLScriptElement(attrs));
						l.added = true;
					} 
				} else {
					var langOk = true;
					if (l.lang) langOk = (l.lang == this.resolver("state.lang"));
					if (langOk) {
						this.resolver.set(["state","loadingScripts"],true);
						this.resolver.set(["state","loadingScriptsUrl",relSrc],l); 
					} 
				}
				break;
		}
		if (! this.resolver(["state","preloading"])) {
			var scripts = this.resolver(["state","loadingScriptsUrl"]);
			for(var n in scripts) {
				var link = scripts[n];
				if (link.rel == "pastload") {
					var langOk = true;
					if (link.lang) langOk = (link.lang == this.resolver("state.lang"));
					if (langOk) {
						this.body.appendChild(HTMLScriptElement(link.attrs));
						link.added = true;
					} 
				}
			}
		}

	};



	function _SubPage(appConfig) {
		// subpage application/config and enhanced element descriptors
		this.resolver = Resolver({ "config":{}, "descriptors":{}, "handlers":pageResolver("handlers"), "enabledRoles":pageResolver("enabledRoles") });
		this.document = document;
		_Scripted.call(this);

		if (appConfig) this.appConfig = appConfig; // otherwise the prototype will have the default
		this.body = document.createElement("DIV");
	}
	var SubPage = Generator(_SubPage,{"prototype":_Scripted.prototype});

	SubPage.prototype.destroy = function() {
		if (this.applied) this.unapplyBody();
		this.head = undefined;
		this.body = undefined;
		this.document = undefined;
		if (this.url) {
			delete Resolver("page::pages::")[this.url];
		}
		if (this.uniqueID) {
			delete Resolver("page::pagesById::")[this.uniqueID];
		}
	};

	SubPage.prototype.page = function(url) {
		console.error("SubPage application/config cannot define pages ("+url+")",this.url);
	};

	// keep a head prefix with meta tags for iframe/window subpages
	SubPage.prototype.headPrefix = ['<head>'];
	var metas = (document.head || document.documentElement.firstChild).getElementsByTagName("meta");
	for(var i=0,e; e = metas[i]; ++i) {
		SubPage.prototype.headPrefix.push(outerHtml(e));
	}

	SubPage.prototype.fetch = function() {

		var XMLHttpRequest = essential("XMLHttpRequest");
	    var xhr = XMLHttpRequest();
	    xhr.page = this;

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
		                handleResponse(xhr, this.page, this.page.loadedPageDone, this.page.loadedPageError);
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
		var doc = this.document = importHTMLDocument(text);
		this.uniqueID = doc.uniqueID;
		Resolver("page").set(["pagesById",this.uniqueID],this);
		this.head = doc.head;
		this.body = doc.body;
		this.documentLoaded = true;

		this.prepareEnhance();

		if (this.requiredForLaunch) {
			var requiredPages = pageResolver("state.requiredPages") - 1;
			pageResolver.set("state.requiredPages",requiredPages);
		}

        if (this.onload) this.onload({});
		//TODO applyBody to other destinations?
	};

	SubPage.prototype.loadedPageError = function(status) {
		this.documentError = status;
		this.documentLoaded = true;
	};

	//TODO should it be(head,body,options) ?
	SubPage.prototype.parseHTML = function(text,text2) {
		var head = (this.options && this.options["track main"])? '<meta name="track main" content="true">' : text2||'';
		var doc = this.document = importHTMLDocument(head,text);
		this.uniqueID = doc.uniqueID;
		Resolver("page").set(["pagesById",this.uniqueID],this);
		this.head = doc.head;
		this.body = doc.body;
		this.documentLoaded = true;

		this.resolver.declare("handlers",pageResolver("handlers"));
		this.prepareEnhance();
	};

	SubPage.prototype.applyBody = function() {
		var e = this.body.firstElementChild!==undefined? this.body.firstElementChild : this.body.firstChild,
			db = document.body,
			fc = db.firstElementChild!==undefined? db.firstElementChild : db.firstChild;


		//TODO import the elements ? or only allow getElement for a while
		// try {
		// 	this.head = document.importNode(doc.head,true);
		// 	this.body = document.importNode(doc.body,true);
		// }
		// catch(ex) {
		// 	this.head = doc.head;
		// 	this.body = doc.body;
		// }
		if (this.applied) return;

		var applied = this.applied = [];
		while(e) {
			// insert before the first permanent, or at the end
			if (fc == null) {
				db.appendChild(e);
			} else {
				db.insertBefore(e,fc);
			}
			applied.push(e);
			e = this.body.firstElementChild!==undefined? this.body.firstElementChild : this.body.firstChild;
		}

		this.doInitScripts();

		//TODO put descriptors in reheating them
		var descs = this.resolver("descriptors");
		for(var n in descs) {
			EnhancedDescriptor.unfinished[n] = descs[n];
		}
		enhanceUnfinishedElements();
	};

	SubPage.prototype.unapplyBody = function() {
		var db = document.body, 
			pc = null,
			e = db.lastElementChild!==undefined? db.lastElementChild : db.lastChild;

		if (this.applied == null) return;
		var applied = this.applied;
		this.applied = null;

		//TODO pull the descriptors out, freeze them
		var descs = this.resolver("descriptors");
		for(var n in descs) {
			EnhancedDescriptor.unfinished[n] = descs[n];
		}
		enhanceUnfinishedElements();
		//TODO move descriptors out

		// move out of main page body into subpage body
		for(var i=0,e; e = applied[i]; ++i) this.body.appendChild(e);

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
		if (this.options && this.options["track main"]) p.push('<meta name="track main" content="true">');
		if (base) p.push('<base href="'+base+'">');
		p.push('</head>');
		return escapeJs(this.headPrefix.join("") + p.join(""));

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
			this.getBodyHtml(),//.replace("</body>",'<script>debugger;Resolver("essential::_queueDelayedAssets::")();</script></body>'),
			'</html>',
			'");'
		];

		return p.join("");
	};


	function cacheError(ev) {
		pageResolver.set(["state","online"],false);	
	}

	function updateOnlineStatus(ev) {
		//console.log("online status",navigator.onLine,ev);
		var online = navigator.onLine;
		if (online != undefined) {
			pageResolver.set(["state","online"],online);	
		}
	}
	pageResolver.updateOnlineStatus = updateOnlineStatus;


	function _ApplicationConfig() {
		this.resolver = pageResolver;
		this.uniqueID = document.uniqueID || "main";
		Resolver("page").set(["pagesById",this.uniqueID],this);
		this.document = document;
		this.head = this.document.head || this.document.body.previousSibling;
		this.body = this.document.body;
		_Scripted.call(this);

		// copy state presets for backwards compatibility
		var state = this.resolver.reference("state","undefined");
		for(var n in this.state) state.set(n,this.state[n]);
		this.state = state;
		document.documentElement.lang = this.state("lang");
		state.on("change",this,this.onStateChange);
		this.resolver.on("change","state.loadingScriptsUrl",this,this.onLoadingScripts);
		this.resolver.on("change","state.loadingConfigUrl",this,this.onLoadingConfig);

		this.pages = this.resolver.reference("pages",{ generator:SubPage});
		SubPage.prototype.appConfig = this;

		pageResolver.reflectStateOn(document.body,false);
		this.prepareEnhance();

		var conf = this.getConfig(this.body), role = this.body.getAttribute("role");
		if (conf || role)  EnhancedDescriptor(this.body,role,conf,false,this);

		this._markPermanents(); 
		this.applied = true; // descriptors are always applied
		var descs = this.resolver("descriptors");
		for(var n in descs) {
			EnhancedDescriptor.unfinished[n] = descs[n];
		}

		var bodySrc = document.body.getAttribute("data-src") || document.body.getAttribute("src");
		if (bodySrc) this._requiredPage(bodySrc);

		if (!_essentialTesting) setTimeout(bringLive,60); 
	}

	var ApplicationConfig = essential.set("ApplicationConfig", Generator(_ApplicationConfig,{"prototype":_Scripted.prototype}) );
	
	// preset on instance (old api)
	ApplicationConfig.presets.declare("state", { });

	ApplicationConfig.prototype.getIntroductionArea = function() {
		var pages = this.resolver("pages");
		for(var n in pages) {
			var page = pages[n];
			if (page.applied) {
				var area = page.resolver("introduction-area","null");
				if (area) return area;
			}
		}
		return this.resolver("introduction-area","null") || "introduction";
	};

	ApplicationConfig.prototype.getAuthenticatedArea = function() {
		var pages = this.resolver("pages");
		for(var n in pages) {
			var page = pages[n];
			if (page.applied) {
				var area = page.resolver("authenticated-area","null");
				if (area) return area;
			}
		}
		return this.resolver("authenticated-area","null") || "authenticated";
	};

	//TODO sure we want to support many content strings?
	ApplicationConfig.prototype.page = function(url,options,content,content2) {
		//this.pages.declare(key,value);
		var page = this.pages()[url]; //TODO options in reference onundefined:generator & generate
		if (page == undefined) {
			page = this.pages()[url] = SubPage();
		}
		if (!page.documentLoaded) {
			page.url = url;
			page.options = options;
			page.parseHTML(content,content2);
		}

		return page;
	};

	ApplicationConfig.prototype._requiredPage = function(src)
	{
		//TODO if already there page.applyBody();
		var page = this.loadPage(src,true);
		this.bodySrc = src;
		this.appliedSrc = null;
        page.onload = function(ev) {
            //TODO unapply if another is applied
            this.applyBody();
        };
		//TODO what about multiple calls ?
		//TODO queue loading this as the initial body content added before the first body child
	};

	ApplicationConfig.prototype.loadPage = function(url,requiredForLaunch,onload) {
		var page = this.pages()[url]; //TODO options in reference onundefined:generator & generate
		if (page == undefined) {
			page = this.pages()[url] = SubPage();
			page.url = url;
			page.requiredForLaunch = requiredForLaunch;
			if (requiredForLaunch) {
				var requiredPages = pageResolver("state.requiredPages") + 1;
				pageResolver.set("state.requiredPages",requiredPages);
			}
			page.onload = onload;
		}
		if (!page.documentLoaded) {
			page.fetch();
		}

		return page;
	};

	function enhanceUnfinishedElements() {
		var handlers = pageResolver("handlers"), enabledRoles = pageResolver("enabledRoles");

		for(var n in EnhancedDescriptor.unfinished) {
			var desc = EnhancedDescriptor.unfinished[n];

			//TODO speed up outstanding enhance check
			if (desc) {
				if (desc.page.applied) {
					// enhance elements of applied subpage

					desc.ensureStateful();
					desc._tryEnhance(handlers,enabledRoles);
					desc._tryMakeLayouter(""); //TODO key?
					desc._tryMakeLaidout(""); //TODO key?

					if (desc.conf.sizingElement) sizingElements[n] = desc;
					if (!desc.state.needEnhance && true/*TODO need others?*/) EnhancedDescriptor.unfinished[n] = undefined;
				} else {
					// freeze in unapplied subpage
					//TODO & reheat
					// if (desc.state.needEnhance && true/*TODO need others?*/) EnhancedDescriptor.unfinished[n] = undefined;
				}
			}
		}
	}
	EnhancedDescriptor.enhanceUnfinished = enhanceUnfinishedElements;

	ApplicationConfig.prototype.onStateChange = function(ev) {
		switch(ev.symbol) {
			case "livepage":
				var ap = ev.data;
				//if (ev.value == true) ap.reflectState();
				ev.data.doInitScripts();
				if (_activeAreaName) {
					activateArea(_activeAreaName);
				} else {
					if (ev.base.authenticated) activateArea(ap.getAuthenticatedArea());
					else activateArea(ap.getIntroductionArea());
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
					enhanceUnfinishedElements();
					if (window.widget) widget.notifyContentIsReady(); // iBooks widget support
					if (ev.base.configured == true && ev.base.authenticated == true 
						&& ev.base.authorised == true && ev.base.connected == true && ev.base.launched == false) {
						this.set("state.launching",true);
						// do the below as recursion is prohibited
						if (document.body) essential("instantiatePageSingletons")();
						enhanceUnfinishedElements();
					}
				} 
				break;
			case "authenticated":
				var ap = ev.data;
				if (ev.base.authenticated) activateArea(ap.getAuthenticatedArea());
				else activateArea(ap.getIntroductionArea());
				// no break
			case "authorised":
			case "configured":
				if (ev.base.loading == false && ev.base.configured == true && ev.base.authenticated == true 
					&& ev.base.authorised == true && ev.base.connected == true && ev.base.launched == false) {
					this.set("state.launching",true);
					// do the below as recursion is prohibited
					if (document.body) essential("instantiatePageSingletons")();
					ev.data.doInitScripts();	
					enhanceUnfinishedElements();
				}
				break;			
			case "launching":
			case "launched":
				if (ev.value == true) {
					if (document.body) essential("instantiatePageSingletons")();
					ev.data.doInitScripts();	
					enhanceUnfinishedElements();
					if (ev.symbol == "launched" && ev.base.requiredPages == 0) this.set("state.launching",false);
				}
				break;
			case "requiredPages":
				if (ev.value == 0 && !ev.base.launching) {
					this.set("state.launching",false);
				}
				break
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

	//TODO split list of permanent and those with page, put it in subpage
	ApplicationConfig.prototype._markPermanents = function() 
	{
		var e = document.body.firstElementChild!==undefined? document.body.firstElementChild : document.body.firstChild;
		while(e) {
			try {
				e.permanent = true;
			} catch(ex) {
				//TODO handle text elements
				// will probably have to be a managed list of permanent elements or uniqueID
			}
			e = e.nextElementSibling!==undefined? e.nextElementSibling : e.nextSibling;
		}
	};

	// iBooks HTML widget
	if (window.widget) {
		widget.pauseAudioVisual = function() {
			pageResolver.set("state.background",true);
		};

		widget.didEnterWidgetMode = function() {
			pageResolver.set("state.background",false);
		};	
	}

	function onmessage(ev) {
		if (ev.data) {
			var data = JSON.parse(ev.data);
			if (data && data.enhanced && data.enhanced.main.width && data.enhanced.main.height) {
				placement.setOptions(data.enhanced.options);
				placement.setMain(data.enhanced.main);
				placement.track();
			}
		}
		//TODO else foreign message, or IE support?
	} 

	function placementBroadcaster() {
		placement.measure();
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			w.notify();
		}
		if (placement.notifyNeeded) ;//TODO hide elements if zero, show if pack from zero
		placement.notifyNeeded = false;
	}

	function trackMainWindow() {
		placement.track();
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
		},

		"startTrackMain": function() {
			if (this.mainTracker) return;

			this.mainTracker = setInterval(trackMainWindow,250);

			if (window.postMessage) {
				if (window.addEventListener) {
					window.addEventListener("message",onmessage,false);

				} else if (window.attachEvent) {
					window.attachEvent("onmessage",onmessage);
				}
			}
		},
		"stopTrackMain": function() {
			if (!this.mainTracker) return;

			clearInterval(this.mainTracker);
			this.mainTracker = null;

			if (window.postMessage) {
				if (window.removeEventListener) {
					window.removeEventListener("message",onmessage);

				} else if (window.attachEvent) {
					window.deattachEvent("onmessage",onmessage);
				}
			}
		},

		"ensureBroadcaster": function() {
			if (this.broadcaster) return;

			placement.measure();
			placement.notifyNeeded = false;
			this.broadcaster = setInterval(placementBroadcaster,250);
		}
	};

	essential.declare("placement",placement);


	function EnhancedWindow(url,name,options,index) {
		this.name = name;
		this.url = url;
		this.options = options || {};
		this.notifyNeeded = true;
		this.index = index;
		this.width = this.options.width || 100;
		this.height = this.options.height || 500;

		placement.ensureBroadcaster();
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

}(
// need with context not supported in strict mode
function(scripts) {
	var resources = this.resources();
	var inits = this.inits();

	for(var i=0,s; s = scripts[i]; ++i) {
		switch(s.getAttribute("type")) {
			case "application/config":
				try {
					with(this) eval(s.text);
				} catch(ex) {
					Resolver("essential::console").error("Failed to parse application/config",s.text);
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
}
);

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
		//TODO XDomainRequest support
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
		HTMLElement = essential("HTMLElement"),
		callCleaners = essential("callCleaners"),
		cleanRecursively = essential("cleanRecursively"),
		addEventListeners = essential("addEventListeners");



	/**
	 * Determines the default implementation for an element.
	 * The implementation can provide information about the template element.
	 *
	 * @return HTMLImplementation appropriate for the template element.
	 *
	 * @param {HTMLElement} clone Template Element
	 */
	function HTMLImplementation(el) {

		if (typeof el == "string") {
			var defaultIndex = el;
			var commonIndex = el;
		} else {
			if (typeof el.impl === "object") return el.impl;

			var type = el.getAttribute? el.getAttribute("type") : null;
			var defaultIndex = type? el.nodeName.toLowerCase() + " " + type : el.nodeName.toLowerCase();
			var commonIndex = el.nodeName.toLowerCase();
		}

		if (IMPL[defaultIndex]) return IMPL[defaultIndex];
		if (IMPL[commonIndex]) return IMPL[commonIndex];
		return IMPL.span;
	}
	HTMLElement.impl = essential.set("HTMLImplementation",HTMLImplementation);

	function _HTMLImplementation(fn) {
		this._init(fn);
	}
	HTMLElement.fn = HTMLImplementation.fn = _HTMLImplementation.prototype;

	HTMLElement.fn._init = function(fn) {
		this.core = this; // allows access to the core implementation when proxied
		for(var n in fn) this[n] = fn[n];
	}

	function _ButtonImplementation(fn) {
		this._init(fn);
	}
	_ButtonImplementation.prototype = new _HTMLImplementation;
	HTMLElement.Button = _ButtonImplementation;

	function _SelectImplementation(fn) {
		this._init(fn);
	}
	_SelectImplementation.prototype = new _HTMLImplementation;
	HTMLElement.Select = _SelectImplementation;

	function _TextInputImplementation(fn) {
		this._init(fn);
	}
	_TextInputImplementation.prototype = new _HTMLImplementation;
	HTMLElement.TextInput = _TextInputImplementation;

	function _DateInputImplementation(fn) {
		this._init(fn);
	}
	_DateInputImplementation.prototype = new _HTMLImplementation;
	HTMLElement.DateInput = _DateInputImplementation;

	function _NumberInputImplementation(fn) {
		this._init(fn);
	}
	_NumberInputImplementation.prototype = new _HTMLImplementation;
	HTMLElement.NumberInput = _NumberInputImplementation;

	function _RadioImplementation(fn) {
		this._init(fn);
	}
	_RadioImplementation.prototype = new _HTMLImplementation;
	HTMLElement.Radio = _RadioImplementation;

	function _CheckboxImplementation(fn) {
		this._init(fn);
	}
	_CheckboxImplementation.prototype = new _HTMLImplementation;
	HTMLElement.Checkbox = _CheckboxImplementation;

	function _WrapperImplementation(fn) {
		this._init(fn);
	}
	_WrapperImplementation.prototype = new _HTMLImplementation;
	HTMLElement.Wrapper = _WrapperImplementation;

	function _FragmentImplementation(fn) {
		this._init(fn);
	}
	_FragmentImplementation.prototype = new _HTMLImplementation;
	HTMLElement.Fragment = _FragmentImplementation;
	_FragmentImplementation.prototype.copyAttributes = function() {}


	var IMPL = HTMLImplementation.IMPL = {
		"input": new _TextInputImplementation(),
		// "input text": new _TextInputImplementation(),
		// "input url": new _TextInputImplementation(),
		"input search": new _TextInputImplementation(/*{fixInputSpin:fixInputSpin}*/),
		// "input email": new _TextInputImplementation(),
		// "input tel": new _TextInputImplementation(),
		// "input password": new _TextInputImplementation(),
		// "input hidden": new _TextInputImplementation(),
		// "input file": new _TextInputImplementation(),

		"input date": new _DateInputImplementation(/*{fixInputSpin:fixInputSpin}*/),
		"input time": new _DateInputImplementation(/*{fixInputSpin:fixInputSpin}*/),

    	"input number": new _NumberInputImplementation(/*{fixInputSpin:fixInputSpin}*/),
    	"input range": new _NumberInputImplementation(/*{fixInputSpin:fixInputSpin}*/),

	    "input image": new _HTMLImplementation({
	            //?? handleOnChange:true,
	            getContent: function() { return ''; },
	            setContent: function() { return ''; },
	            getValue: function() { return ''; },
	            setValue: function() { return ''; }
	        }),
	    "input button": new _TextInputImplementation(),
	    // "input submit": new _TextInputImplementation(),
	    // "input reset": new _TextInputImplementation(),

	    "button": new _ButtonImplementation(),
	    // "button button": new _ButtonImplementation(),
	    // "button submit": new _ButtonImplementation(),
	    // "button reset": new _ButtonImplementation(),


	    "button radio": new _RadioImplementation(),
	    "input radio": new _RadioImplementation(),
	    "button checkbox": new _CheckboxImplementation(),
	    "input checkbox": new _CheckboxImplementation(),

	    "select": new _SelectImplementation(),
	    // "select select-one": new _SelectImplementation(),

	    "textarea": new _HTMLImplementation(),
	    // "textarea textarea": new _HTMLImplementation(),

	    "img": new _WrapperImplementation(),
	    "a": new _WrapperImplementation(),
	    "iframe": new _WrapperImplementation(),
	    "object": new _WrapperImplementation(),
	    "fieldset": new _WrapperImplementation(),
	    "form": new _WrapperImplementation(),

	    "#document-fragment": new _FragmentImplementation(),
	    // "label": new _HTMLImplementation(),
	    // "div": new _HTMLImplementation(),

	    "span": new _HTMLImplementation()
	};

	/**
	 * Check if a thing is a document fragment created by HTMLTemplate
	 *
	 * @param {Any} vThing Any instance
	 */
	HTMLElement.fn.isFragment = function(thing)
	{
		return typeof thing == "object" && thing instanceof DocumentFragment;
	};

	/** @private */
	HTMLElement.fn.isFragmentIE = function(thing)
	{
		return typeof thing == "object" && thing.nodeName == "#document-fragment";// thing.toHTML && thing.isDocumentFragment; 
	};

	/**
	 * Copy html attributes according to a positive list
	 * @param {HTMLElement} src Source element
	 * @param {HTMLElement} dst Destination element
	 * @param {Object} attrs Map of attributes and their default value
	 */
	HTMLElement.fn.copyAttributes = function(src,dst,attrs)
	{
		if (!attrs) attrs = this.CLONED_ATTRIBUTES;

		if (attrs["class"] !== undefined) {
		 	dst.className = dst.className? dst.className + " " + src.className : src.className;
		}
		if (attrs["style"] !== undefined && src.style.cssText != "") {
			dst.style.cssText = src.style.cssText;
		}
		for(var n in attrs) {
			if (n == "class" || n == "style") continue;
			var value = src.getAttribute(n);
			if (value != null && value !== attrs[n]) {
				dst.setAttribute(n,value);
			}
		}
	};

	HTMLElement.fn.CLONED_ATTRIBUTES = {
		"class": "",
		"style": "",
		"size": "",
		"cols": 0,
		"rows": 0,
		// not supported properly by IE, "type": true,
		"role": "",
		"name": "",
		"id": "",
		"title": "",
		"dir": "",
		"lang": "",
		"language": "",
		"accesskey": "",
		"tabindex": 0
	};

	// stream.cloneNode that can be copied to .content
	function streamCloneNode(deep,state) {
		var root = this.nodeName? this:this.root;
		var fragment = root.ownerDocument.createDocumentFragment();
		if (deep) {
			root.impl.renderStream(fragment,this,state);
		}
		return fragment;
	}

	/**
	 * Create an array describing the DOM tree using clonable implementations.
	 * null entries indicates the previous element was a leaf
	 */
	HTMLElement.describeStream = function(root,policy)
	{
	    var stream = [];//EnhancedArray([]);
	    stream.cloneNode = streamCloneNode;
	    if (root.impl == null) root.impl = HTMLImplementation(root);
	    stream.root = root;
	    var firstText = root.childNodes[0];
	    stream.prefix = firstText && firstText.nodeType == 3? firstText.nodeValue : ""; 
	    this._describeStream(root,stream,root.impl,policy);
	    //TODO apply default values to elements
	    return stream;
	};

	/**
	 */
	HTMLElement.forgetStream = function(stream,policy)
	{
	    for(var i=0,impl; impl=stream[i]; ++i) {
	        if (typeof impl == "object" && impl.forgetUnique) {
	            impl.forgetUnique();
	        }
	    }
	};

	// IE workaround for cloneNode not working for HTML5 elements
	function ieClonable(child,deep) {
		var pseudo = {
			"cloneNode":function() {
				var el = this.ownerDocument.createElement(this.tagName);
				this.impl.copyAttributes(child,el);
				el.innerHTML = this.innerHTML;
				return el;
			},
			"removeAttribute": function() {},

			"ownerDocument":child.ownerDocument,
			"impl": HTMLElement.impl(child),
			"tagName": child.tagName,
			"nodeName": child.nodeName,
			"innerHTML": deep? child.innerHTML : ""
		};
		return pseudo;
	}

	/*
		Make an implementation for a cloned element which knows about the original
		from snippet/template. The cloned element is slightly different, as some content
		and attributes will not apply. 
	*/
	HTMLElement.fn.childWrapper = function(el,child,props,policy)
	{
		var impl = this.uniqueForChild(child,policy);
	    impl.original = child;
	    // impl.toClone = el.children? ieClonable(child,false) : child.cloneNode(false);
	    impl.toClone = child.cloneNode(false);
	    var firstText = child.childNodes[0];
	    if (firstText && firstText.nodeType != 3) firstText = null;
	    if (firstText) {
	        impl.toClone.appendChild(impl.toClone.ownerDocument.createTextNode(firstText.nodeValue));
	    }

	    //TODO deep if no enhancement needed
	    impl.idx = props.idx;
	    impl.parent = props.parent;
	    impl.attributes = impl.describeAttributes(el,policy);
	    impl.context = impl.describeContext(el,policy);
	    impl.decorators = impl.describeDecorators(impl,policy);
	    var repeat = child.getAttribute("repeat");
	    impl.repeat = typeof repeat == "string"? parseFloat(repeat) : 1;

	    // no need to clone the snippet attributes
	    for(var n in impl.attributes) {
	        impl.toClone.removeAttribute(n);
	    }
	    impl.toClone.removeAttribute("repeat");

	    // handlers on snippet ? or use decorators for "data-implementation" ?
	    // var oData = eClone.data;
	    // if (oData) {
	    //  oImplementation = oData.fireTrigger(null,"implementation","init",oImplementation);
	    // }
	    //TODO call before decorators oImplementation.decorate(eClone,eForm,mNames);

	    return impl;
	};

	HTMLElement.fn._cloneNode = function(src,deep) {
		return src.cloneNode(deep);
	};

	HTMLElement.fn._cloneNodeIE = function(src,deep) {
		var el = src.ownerDocument.createElement(src.tagName);
		this.copyAttributes(src,el);
		// el.innerHTML = src.innerHTML;
		if (src.firstChild) el.appendChild(el.ownerDocument.createTextNode(src.firstChild.data)); //TODO review this
		return el;
	};

	//IE8 cloneNode for HTML5
	if (/MSIE/.test(navigator.userAgent)) HTMLElement.fn._cloneNode = HTMLElement.fn._cloneNodeIE;

	/**
	 * Default behaviour for making a unique template implementation wrapper.
	 * Can be overridden for enhanced elements. Called on implementation of the source element.
	 *
	 * @param original Template element.
	 * @param policy Policy used to determine constructor
	 */
	HTMLElement.fn.uniqueForChild = function(original,policy)
	{
		return HTMLImplementation(original).makeUnique(policy);
	};

	// Default way to make unique implementation for a cloned element. Can be overridden for special implementations
	HTMLElement.fn.makeUnique = function(policy)
	{
		function ImplProxy() {}
		ImplProxy.prototype = this;
		return new ImplProxy();
	};

	/*
	TODO cleanHandler?
	*/
	HTMLElement.fn.forgetUnique = function()
	{
	    //TODO call "implementation" "destroy" handler
	    
	    // var oImplementation = this;
	    // oImplementation.undecorate(eClone,eForm);
	    // var oData = eClone.data;
	    // if (oData) {
	    //  oData.fireLifecycleTrigger("implementation","destroy",eForm,eClone,oImplementation);
	    // }
	    // this.callCleaners(eClone);
	    //     eClone.implementation = null;
	    
	};

	/**
	 * @param el Template Element with attributes
	 * @param decorators Map of objects specifying decorator functions and category attributes
	 */
	HTMLElement.fn.describeAttributes = function(el,policy)
	{
	    var attributes = {};
	    var decorators = policy.DECORATORS || {};
	    for(var name in decorators) {
	        var value = el.getAttribute(name);
	        if (value != null) {
	        	var mAttribute = {
	        	    value: value,
	        	    defaults: [],
	        	    
	        	    is_context: decorators[name].context,
	        	    is_refs: decorators[name].refs,
	        	    is_simple: decorators[name].simple
	        	};
	        	
	        	// *entry:mapping references decoding
	            if (decorators[name].refs) { //TODO review the flag to filter on !!!
	            	var pParts = [];
	        		var pNames = value.indexOf(" ") >= 0? value.split(" ") : value.split(",");
	        		for(var i=0,n; n = pNames[i]; ++i) {
	        			var pExpressAndMapping = n.split(":");
	        			pParts[i] = /([!+-]*)(.*)/.exec(pExpressAndMapping[0]);
	        			pParts[i].mapping = pExpressAndMapping[1]; // name of mapping for the data entry
	        			pParts[i].name = pNames[i] = pParts[i][2]; // third entry is the name
	        		}

	        		mAttribute.name = pNames[0];
	        		mAttribute.parts = pParts;
	        		mAttribute.names = pNames;
	            } 
	            attributes[name] = mAttribute;
	        } // value != null
	    }
	    return attributes;
	};

	HTMLElement.fn.describeContext = function(el,policy)
	{
	    //TODO consider improving context determination
	    
	    for(var impl = this; impl; impl = impl.parent) {
	        var decorators = policy.DECORATORS || {};
	        for(var n in decorators) {
	            if (policy.DECORATORS[n].context) {
	                var value = el.getAttribute(n);
	                if (value) return value;
	            }
	        }
	    }
	    return policy.defaultContext;
	};

	HTMLElement.fn.describeDecorators = function(impl,policy)
	{
	    var decorators = [];
	    for(var name in impl.attributes) {
	        var attribute = impl.attributes[name];
	        var decorator = policy.DECORATORS[name];
	        if (typeof decorator == "function") {
	            var func = decorator.call(impl,name,attribute);
	            if (func) decorators.push(func);
	        }
	    }
	    
	    return decorators;
	};

	HTMLElement.fn.decorate = function(clone,eForm,mNames)
	{
		//TODO
	};

	HTMLElement.fn.undecorate = function(clone,eForm)
	{
		//TODO
	};

	// enhance the branch
	HTMLElement.fn.enhance = function(clone)
	{
		//TODO
	};


	/**
	  Called on wrapped implementation to clone the original element.
	 */
	HTMLElement.fn.cloneOriginal = function(state)
	{
	    //TODO allow configuration override
	    
	    var el = this._cloneNode(this.toClone,true);
	    el.impl = this;
	    // el.state = state; //TODO really?
	    
	    this.decorate(el); //TODO (el,container/enhanced,names)

	    for(var i=0,d; d = this.decorators[i]; ++i) {
	        d.call(this,el.state,el);
	    }
		return el; 
	};

	HTMLElement.fn.setPrefix = function(el,text) {

		if (el.firstChild == null) {
			el.appendChild(el.ownerDocument.createTextNode(''));
		} else if (el.firstChild.nodeType != 3/* TEXTNODE */) {
			el.insertBefore(el.ownerDocument.createTextNode(''),el.firstChild);
		}
		el.firstChild.nodeValue = text;
	};

	HTMLElement.fn.setPostfix = function(el,text) {

		if (el.lastChild == null || el.lastChild.nodeType != 3/* TEXTNODE */) el.appendChild(el.ownerDocument.createTextNode(''));
		// if (ev.lastChild.)
		el.lastChild.nodeValue = text;
	};


	HTMLElement._describeStream = function(root,stream,rootImpl,policy)
	{
	    var prev = null;
	    for(var i=0,childNodes = root.childNodes,node; node = childNodes[i]; ++i) {
	        switch(node.nodeType) {
	            case 1 : // ELEMENT_NODE
	            	var impl = rootImpl.childWrapper(root,node,{idx:i},policy);
	                // impl.level
	                // impl.locator
	                impl.postfix = "";
	                stream.push(impl);
	                prev = impl;

	                if (node.firstElementChild || // modern browser
	                	(node.children && node.children[0])) { // IE browser
	                    stream.push(1);
	                    this._describeStream(node,stream,impl,policy);
	                    stream.push(-1);
	                } 
	                break;
	            case 3 : // TEXT_NODE
	                if (prev) prev.postfix = node.nodeValue;
	                break;
	            case 4 : // CDATA_SECTION_NODE
	            case 7 : // PROCESSING_INSTRUCTION_NODE
	            case 8 : // COMMENT_NODE
	            case 12 : // NOTATION_NODE
	        };
	    } 
	};

	/**
	 * Render a stream to an element
	 */
	HTMLElement.fn.renderStream = function(top,stream,state)
	{
	    if (stream.prefix) top.appendChild(document.createTextNode(stream.prefix));
	    var el = top;
	    var stack = [el];
	    for(var i=0,entry; entry = stream[i]; ++i) {
	        if (entry === -1) stack.pop();
	        else if (entry === 1) stack.push(el);
	        else {
	            //TODO do the substream for each repeat
	            var parent = stack[stack.length-1];
	            for(var r=0; r < entry.repeat; ++r) {
	                el = entry.cloneOriginal(state? state.getElementState(entry) : null);
	                parent.appendChild(el);
	            }
	            if (entry.postfix) {
	                parent.appendChild(document.createTextNode(entry.postfix));
	            } 
	        }
	    }
	    this.copyAttributes(stream.root,top,this.CLONED_ATTRIBUTES);
	    (top.impl || this).enhance(top);
	};



	function _queueDelayedAssets()
	{
		//TODO move this to pageResolver("state.ready")
		var config = ApplicationConfig();//TODO move the state transitions here
		config._queueAssets();

		// var scripts = document.head.getElementsByTagName("script");
		// for(var i=0,s; s = scripts[i]; ++i) {

		// }

		if (pageResolver(["state","loadingScripts"])) console.debug("loading phased scripts");

		var metas = document.getElementsByTagName("meta");
		for(var i=0,m; m = metas[i]; ++i) {
			switch((m.getAttribute("name") || "").toLowerCase()) {
				case "text selection":
					textSelection((m.getAttribute("content") || "").split(" "));
					break;
				case "enhanced roles":
					useBuiltins((m.getAttribute("content") || "").split(" "));
					break;
				case "track main":
					if (this.opener) {
						pageResolver.set("state.managed",true);
					}
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


	function _DialogAction(actionName) {
		this.actionName = actionName;
	} 
	_DialogAction.prototype.activateArea = essential("activateArea"); // shortcut to global essential function
	var DialogAction = essential.set("DialogAction",Generator(_DialogAction));


	/*
		action buttons not caught by enhanced dialogs/navigations
	*/
	function defaultButtonClick(ev) {
		ev = MutableEvent(ev).withActionInfo();
		if (ev.commandElement && (ev.commandElement == ev.actionElement || ev.actionElement == null)) {

			//TODO action event filtering
			//TODO disabled
			fireAction(ev);
			if (ev.isDefaultPrevented()) return false;
		}
	}
	essential.declare("defaultButtonClick",defaultButtonClick);

	function fireAction(ev) 
	{
		var el = ev.actionElement, action = ev.action, name = ev.commandName;
		if (el) {

			if (! el.actionVariant) {
				if (action) {
					action = action.replace(essential("baseUrl"),"");
				} else {
					action = "submit";
				}

				el.actionVariant = DialogAction.variant(action)(action);
			}

			if (el.actionVariant[name]) el.actionVariant[name](el,ev);
			else {
				var sn = name.replace("-","_").replace(" ","_");
				if (el.actionVariant[sn]) el.actionVariant[sn](el,ev);
			}
			//TODO else dev_note("Submit of " submitName " unknown to DialogAction " action)

		} 
		else {
			el = HTMLElement.getEnhancedParent(ev.commandElement);

			switch(ev.commandName) {
			//TODO other builtin commands
			case "parent.toggle-expanded":
			// if (el == null) el = ancestor enhanced
				StatefulResolver(el.parentNode,true).toggle("state.expanded");
				break;

			case "toggle-expanded":
				StatefulResolver(el,true).toggle("state.expanded");
				break;

			case "close":
				//TODO close up shop
				if (ev.submitElement) HTMLElement.discard(ev.submitElement);
				break;
			}
		}
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

	function useBuiltins(list) {
		for(var i=0,r; r = list[i]; ++i) pageResolver.set(["enabledRoles",r],true);
	}

	function textSelection(tags) {
		var pass = {};
		for(var i=0,n; n = tags[i]; ++i) {
			pass[n] = true;
			pass[n.toUpperCase()] = true;
		}
		addEventListeners(document.body, {
			"selectstart": function(ev) {
				ev = MutableEvent(ev);
				var allow = pass[ev.target.tagName || ""] || false;
				if (!allow) ev.preventDefault();
				return allow;
			}
		});
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
		ApplicationConfig = essential("ApplicationConfig"),
		pageResolver = Resolver("page"),
		fireAction = essential("fireAction"),
		scrollbarSize = essential("scrollbarSize"),
		serverUrl = location.protocol + "//" + location.host;


	
	function _StageLayouter(key,el,conf) {
		this.key = key;
		this.type = conf.layouter;
		this.areaNames = conf["area-names"];
		this.activeArea = null;

		this.baseClass = conf["base-class"];
		if (this.baseClass) this.baseClass += " ";
		else this.baseClass = "";
	}
	var StageLayouter = essential.declare("StageLayouter",Generator(_StageLayouter,Layouter));
	Layouter.variant("area-stage",StageLayouter);

	_StageLayouter.prototype.refreshClass = function(el) {
		var areaClasses = [];
		for(var i=0,a; a = this.areaNames[i]; ++i) {
			if (a == this.activeArea) areaClasses.push(a + "-area-active");
			else areaClasses.push(a + "-area-inactive");
		}
		var newClass = this.baseClass + areaClasses.join(" ")
		if (el.className != newClass) el.className = newClass;
	};

	_StageLayouter.prototype.updateActiveArea = function(areaName,el) {
		this.activeArea = areaName;
		this.refreshClass(el); //TODO on delay	
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
			clicked.submitElement = this;
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

	function mousedownDialogHeader(ev) {
		if (activeMovement != null) return;
		if (ev.target.tagName == "BUTTON") return; // don't drag on close button
		var dialog = this.parentNode;
		if (ev.button > 0 || ev.ctrlKey || ev.altKey || ev.shiftKey || ev.metaKey) return;
		Resolver("page").set("activeElement",dialog);
		dialog.parentNode.appendChild(dialog);

		if (ev.preventDefault) ev.preventDefault();

		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			dialog.style.left = x + "px"; 
			dialog.style.top = y + "px"; 
		};
		movement.start(this,ev);
		movement.startY = dialog.offsetTop;
		movement.startX = dialog.offsetLeft;
		movement.maxY = document.body.offsetHeight - dialog.offsetHeight;
		movement.maxX = document.body.offsetWidth - dialog.offsetWidth;

		return false; // prevent default
	}

	function getChildWithRole(el,role) {
		if (el.querySelector && !/; MSIE /.test(navigator.userAgent)) return el.querySelector("[role="+role+"]");

		for(var c=el.firstChild; c; c = c.nextSibling) if (c.getAttribute) {
			if (c.getAttribute("role") == role) return c;
			if (c.firstChild) {
				var match = getChildWithRole(c,role);
				if (match) return match;
			}
		}
		return null;
	}

	// TODO resolver entries for bounds, use layouter to position
	var initial_top = 100, initial_left = 40, dialog_top_inc = 32, dialog_left_inc = 32, 
		dialog_top = initial_top, dialog_left = initial_left,
		dialog_next_down = initial_top;

	function enhance_dialog(el,role,config,context) {
		// TODO if (config['invalid-config']) console.log()

		var configTemplate = config.template,
			contentTemplate = config['content-template'], 
			contentClass = config['content-class'] || "dialog-content",
			contentRole = config['content-role'], contentConfig = config['content-config'];
		var children = [];
		for(var i=0,c; c = el.childNodes[i]; ++i) children.push(c);

		// template around the content
		if (configTemplate) {
			var template = Resolver("page::templates","null")([configTemplate]);
			if (template == null) return false;

			var content = template.content.cloneNode(true);
			el.appendChild(content);
		}

		var header = el.getElementsByTagName("HEADER")[0],
			footer = el.getElementsByTagName("FOOTER")[0];

		var wrap = getChildWithRole(el,"content");
		// content-template appended to role=content or element
		if (contentTemplate) {
			var template = Resolver("page::templates","null")([contentTemplate]);
			if (template == null) return false;

			var content = template.content.cloneNode(true);

			(wrap || el).appendChild(content);
		}
		else {
			if (wrap == null) wrap = HTMLElement("div",{});
				
			if (contentRole) {
				wrap.setAttribute("role",contentRole);
			}
			while(children.length) wrap.appendChild(children.shift());


			if (contentConfig) {
				if (typeof contentConfig == "object") {
					var c = JSON.stringify(contentConfig);
					contentConfig = c.substring(1,c.length-1);
				}
				wrap.setAttribute("data-role",contentConfig);
			}
		} 
		if (wrap) {
			wrap.className = ((wrap.className||"") + " "+contentClass).replace("  "," ");
			essential("DescriptorQuery")(wrap).enhance();
		}

		// restrict height to body (TODO use layouter to restrict this on page resize)
		if (el.offsetHeight > document.body.offsetHeight) {
			var height = document.body.offsetHeight - 20;
			if (header) height -= header.offsetHeight;
			if (footer) height -= footer.offsetHeight;
			wrap.style.maxHeight = height + "px";
		}

		// position the dialog
		if (config.placement) { // explicit position
			if (config.placement.bottom) el.style.bottom = config.placement.bottom + "px";
			else el.style.top = (config.placement.top || 0) + "px";

			if (config.placement.right) el.style.right = config.placement.right + "px";
			else el.style.left = (config.placement.left || 0) + "px";
		} else { // managed position

			if (dialog_top + el.offsetHeight > document.body.offsetHeight) {
				dialog_top = initial_top;
			}
			if (dialog_left + el.offsetWidth > document.body.offsetWidth) {
				initial_left += dialog_left_inc;
				dialog_left = initial_left;
				if (config.tile) {
					if (dialog_next_down + el.offsetHeight > document.body.offsetHeight) {
						initial_top += dialog_top_inc;
						dialog_next_down =  initial_top;
					}
					dialog_top = dialog_next_down;
				}
			}
			el.style.top = Math.max(0,Math.min(dialog_top,document.body.offsetHeight - el.offsetHeight - 12)) + "px";
			el.style.left = Math.max(0,dialog_left) + "px";

			if (config.tile) { // side by side
				dialog_left += el.offsetWidth + dialog_left_inc;
				dialog_next_down = dialog_top + el.offsetHeight + dialog_top_inc;
			} else { // stacked
				dialog_top += dialog_top_inc;
				dialog_left += dialog_left_inc;
				//TODO move down by height of header
			}
		}


		// dialog header present
		if (header && header.parentNode == el) {

			addEventListeners(header,{ "mousedown": mousedownDialogHeader });
		}

		//TODO header instrumentation


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
	}
	pageResolver.set("handlers.enhance.dialog",enhance_dialog);

	function layout_dialog(el,layout,instance) {		
	}
	pageResolver.set("handlers.layout.dialog",layout_dialog);

	function discard_dialog(el,role,instance) {
	}
	pageResolver.set("handlers.discard.dialog",discard_dialog);

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

	function enhance_toolbar(el,role,config,context) {
		// make sure no submit buttons outside form, or enter key will fire the first one.
		forceNoSubmitType(el.getElementsByTagName("BUTTON"));
		applyDefaultRole(el.getElementsByTagName("BUTTON"));
		applyDefaultRole(el.getElementsByTagName("A"));

		el.submit = toolbar_submit;

		addEventListeners(el, {
			"click": dialog_button_click
		},false);

		return {};
	}
	pageResolver.set("handlers.enhance.toolbar",enhance_toolbar);
	pageResolver.set("handlers.enhance.menu",enhance_toolbar);
	pageResolver.set("handlers.enhance.menubar",enhance_toolbar);
	pageResolver.set("handlers.enhance.navigation",enhance_toolbar);

	function layout_toolbar(el,layout,instance) {		
	}
	pageResolver.set("handlers.layout.toolbar",layout_toolbar);

	function discard_toolbar(el,role,instance) {
	}
	pageResolver.set("handlers.discard.toolbar",discard_toolbar);

	function enhance_sheet(el,role,config,context) {
		
		return {};
	}
	pageResolver.set("handlers.enhance.sheet",enhance_sheet);

	function enhance_spinner(el,role,config,context) {
		if (window.Spinner == undefined) return false;

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
	}
	pageResolver.set("handlers.enhance.spinner",enhance_spinner);

	function layout_spinner(el,layout,instance) {
		//TODO when hiding stop the spinner		
	}
	pageResolver.set("handlers.layout.spinner",layout_spinner);

	function discard_spinner(el,role,instance) {
		instance.stop();
		el.innerHTML = "";
	}
	pageResolver.set("handlers.discard.spinner",discard_spinner);
	
	function _lookup_generator(name,resolver) {
		var constructor = Resolver(resolver || "default")(name,"null");
		
		return constructor? Generator(constructor) : null;
	}

	function enhance_application(el,role,config,context) {
		// template around the content
		if (config.template) {
			var template = Resolver("page::templates","null")([config.template]);
			if (template == null) return false;

			var content = template.content.cloneNode(true);
			el.appendChild(content);
		}

		if (config.variant) {
//    		variant of generator (default ApplicationController)
		}
		if (config.generator) {
			var g = _lookup_generator(config.generator,config.resolver);
			if (g) {
				var instance = g(el,role,config,context);
				return instance;
			}
			else return false; // not yet ready
		}
		
		return {};
	};
	pageResolver.set("handlers.enhance.application",enhance_application);

	function layout_application(el,layout,instance) {	
	}
	pageResolver.set("handlers.layout.application",layout_application);

	function discard_application(el,role,instance) {	
		//TODO destroy/discard support on generator ?
	}
	pageResolver.set("handlers.discard.application",discard_application);

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

	function JSON2Attr(obj,excludes) {
		excludes = excludes || {};
		var r = {};
		for(var n in obj) if (! (n in excludes)) r[n] = obj[n];
		var txt = JSON.stringify(r);
		return txt.substring(1,txt.length-1);
	}
	essential.declare("JSON2Attr",JSON2Attr);


	// Templates

	function Template(el,config) {
		this.el = el; // TODO switch to uniqueID
		this.tagName = el.tagName;
		this.dataRole = JSON2Attr(config,{id:true});

		// HTML5 template tag support
		if ('content' in el) {
			this.content = el.content;
			//TODO additional functionality in cloneNode
		// HTML4 shim
		} else {
			this.content = el.content = el.ownerDocument.createDocumentFragment();
			while(el.firstChild) this.content.appendChild(el.firstChild);
			var policy = {};
			this.stream = HTMLElement.describeStream(this.content,policy);
			//TODO handle img preloading
			//TODO handle sources in img/object/audio/video in cloneNode, initially inert

			this.content.cloneNode = this.stream.cloneNode.bind(this.stream);
		}
	}

	Template.prototype.getDataRole = function() {
		return this.dataRole;
	};

	Template.prototype.getAttribute = function(name) {
		return this.el.getAttribute(name);
	};

	Template.prototype.setAttribute = function(name,value) {
		return this.el.setAttribute(name,value);
	};


	Template.prototype.contentCloneFunc = function(el) {
		return function(deep) {
			var fragment = el.ownerDocument.createDocumentFragment();
			if (! deep) return fragment; // shallow just gives fragment

			for(var c = el.firstChild; c; c = c.nextSibling) {
				switch(c.nodeType) {
					case 1:
						fragment.appendChild(c.cloneNode(true));
						break;
					case 3:
						fragment.appendChild(el.ownerDocument.createTextNode(c.data));
						break;
					case 8: // comment ignored
						// fragment.appendChild(el.ownerDocument.createComment(c.data));
						break;

				}
			}

			return fragment;
		};
	};

	//TODO TemplateContent.prototype.clone = function(config,model) {}

	function enhance_template(el,role,config,context) {
		var id = config.id || el.id;
		var template = new Template(el,config);

		// template can be anonymouse
		if (id) pageResolver.set(["templates","#"+id],template);
		// TODO class support, looking up on main document by querySelector

		return template;
	}
	pageResolver.set("handlers.enhance.template",enhance_template);

	function init_template(el,role,config,context) {
		this.state.contentManaged = true; // template content skipped
	}
	pageResolver.set("handlers.init.template",init_template);

	function init_templated(el,role,config,context) {
		this.state.contentManaged = true; // templated content skipped
	}
	pageResolver.set("handlers.init.templated",init_templated);


	// Scrolled

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

	var preventWheel = false; //navigator.userAgent.match(/Macintosh/) != null;

	function parentChain(el) {
		var p = [];
		while(el && el != el.ownerDocument.body) { p.push(el); el = el.parentNode; }
		return p;
	}

	var ENHANCED_SCROLLED_EVENTS = {
		"scroll": function(ev) {
			var el = ev? (ev.target || ev.scrElement) : event.srcElement;

			if (el.stateful("pos.scrollVert","0")) el.stateful.set("pos.scrollTop",el.scrollTop);
			if (el.stateful("pos.scrollHorz","0")) el.stateful.set("pos.scrollLeft",el.scrollLeft);
		},
		"DOMMouseScroll": function(ev) {
			// Firefox with axis
		},
		"wheel": function(ev) {
			// Newer Firefox + IE9/10
		},
		"mousewheel": function(ev) {
			ev = MutableEvent(ev).withMouseInfo();
			// ev.stateful = ev.target.stateful; //TODO withStatefulTarget, self or parent that is stateful 

			// scrolling in two dimensions is problematic as you can only prevent or not. An acceleration is native

			//TODO check natural swipe setting/direction
			// if webkitDirectionInvertedFromDevice == false do the inverse

			var chain = parentChain(ev.target);
			var preventLeft = preventWheel && ev.deltaX > 0 && chain.every(function(el) { return el.scrollLeft == 0; });
			// if (preventLeft) console.log("prevent left scroll ");
			var preventTop = preventWheel && ev.deltaY > 0 && chain.every(function(el) { return el.scrollTop == 0; });
			// if (preventTop) console.log("prevent top scroll ");

			var prevent = false;

			if (this.stateful("pos.scrollVert","0")) {
				// native scrolling default works fine
			} else {
				if (ev.deltaY != 0) {
					var max = Math.max(0, this.stateful("pos.scrollHeight","0") - this.offsetHeight);
					var top = this.stateful("pos.scrollTop","0");
					// console.log("vert delta",ev.deltaY, top, max, this.stateful("pos.scrollHeight"),this.offsetHeight);
					top = Math.min(max,Math.max(0, top - ev.deltaY));
					this.stateful.set("pos.scrollTop",top);
					prevent = true;
				}
			}

			if (this.stateful("pos.scrollHorz","0")) { // native scrolling?
				// native scrolling default works fine
			} else {
				if (ev.deltaX != 0) {
					var max = Math.max(0,this.stateful("pos.scrollWidth","0") - this.offsetWidth);
					var left = this.stateful("pos.scrollLeft","0");
					left =  Math.min(max,Math.max(0,left + ev.deltaY)); //TODO inverted?
					this.stateful.set("pos.scrollLeft",left);
					prevent = true;
				}
			}


			// if ((ev.deltaX < 0 && (this.scrollLeft + Math.ceil(this.offsetWidth) >= this.scrollWidth))) {

			// 	ev.preventDefault();
			// 	return false;
			// }
			// if ((ev.deltaY < 0 && (this.scrollTop + Math.ceil(this.offsetHeight) >= this.scrollHeight))) {

			// 	ev.preventDefault();
			// 	return false;
			// }

			if (prevent || preventLeft || preventTop) {
				ev.preventDefault();
				return false;
			}
		}

		// mousedown, scroll, mousewheel
	};

	// Current active Movement activity
	var activeMovement = null;

	/*
		The user operation of moving an element within the existing parent element.
	*/
	function ElementMovement() {
	}

	ElementMovement.prototype.track = function(ev) {

	};

	//TODO support fixed position offsetTop/Bottom in IE, kinda crap negative offsets

	//TODO support bottom/right positioning
	
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
		document.onselectstart = function(ev) { return false; }; //TODO save old handler?

		//TODO capture in IE
		//movement.track(event,0,0);

		if (el.stateful) el.stateful.set("dragging",true);
		this.target = document.body;
		if (document.body.setCapture) {
			this.target = this.el;
			this.target.setCapture();
		}

		this.drag_events = {
			//TODO  keyup ESC
			"keyup": function(ev) {

			},
			"mousemove": function(ev) {
				var maxY = 1000, maxX = 1000;
				var y = Math.min( Math.max(movement.startY + movement.factorY*(ev.pageY - movement.startPageY),movement.minY), movement.maxY );
				var x = Math.min( Math.max(movement.startX + movement.factorX*(ev.pageX - movement.startPageX),movement.minX), movement.maxX );
				movement.track(ev,x,y);
				// console.log(movement.factorX,movement.factorY)
			},
			"click": function(ev) {
				ev.preventDefault();
				ev.stopPropagation(); //TODO ev.stopImmediatePropagation() ?
				return false;
			},
			"mouseup": function(ev) {
				movement.end();
				ev.preventDefault();
				ev.stopPropagation(); //TODO ev.stopImmediatePropagation() ?
				return false;
			}
		};
		addEventListeners(this.target,this.drag_events);

		activeMovement = this;

		return this;
	};

	ElementMovement.prototype.end = function() {
		if (this.el.stateful) this.el.stateful.set("dragging",false);
		removeEventListeners(this.target,this.drag_events);
		if (this.target.releaseCapture) this.target.releaseCapture();
		this.target = null;

		delete document.onselectstart ;

		activeMovement = null;

		return this;
	};

	function mousedownVert(ev) {
		if (activeMovement != null) return;

		if (ev.preventDefault) ev.preventDefault();
		//TODO this.stateful instead of var scrolled = this.parentNode.scrolled;
		var scrolled = this.parentNode.scrolled; //TODO better way to pass ?
		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			scrolled.scrollTop = y; //(scrolled.scrollHeight -  scrolled.clientHeight) * y / (scrolled.clientHeight - 9);
			scrolled.stateful.set("pos.scrollTop",y);
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
	function mousedownStatefulVert(ev) {
		if (activeMovement != null) return;

		if (ev.preventDefault) ev.preventDefault();
		//TODO this.stateful instead of var scrolled = this.parentNode.scrolled;
		var scrolled = this.parentNode.scrolled; //TODO better way to pass ?
		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			scrolled.stateful.set("pos.scrollTop",y);
			this.scrolledTo = y;
			//var posInfo = document.getElementById("pos-info");
			//posInfo.innerHTML = "x=" +x + " y="+y + " sy="+scrolled.scrollTop + " cy="+ev.clientY + " py="+ev.pageY;
		};
		movement.start(this,ev);
		movement.startY = scrolled.stateful("pos.scrollTop","0");
		movement.startX = scrolled.stateful("pos.scrollLeft","0");
		movement.factorY = scrolled.stateful("pos.scrollHeight","0") / movement.el.offsetHeight;
		movement.maxY = scrolled.stateful("pos.scrollHeight","0") - scrolled.clientHeight;
		return false; // prevent default
	}

	function mousedownHorz(ev) {
		if (activeMovement != null) return;

		if (ev.preventDefault) ev.preventDefault();
		//TODO this.stateful instead of var scrolled = this.parentNode.scrolled;
		var scrolled = this.parentNode.scrolled; //TODO better way to pass ?
		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			scrolled.scrollLeft = x; //(scrolled.scrollWidth -  scrolled.clientWidth) * x / (scrolled.clientWidth - 9);
			scrolled.stateful.set("pos.scrollLeft",x);
		};
		movement.start(this,ev);
		movement.startY = scrolled.scrollTop;
		movement.startX = scrolled.scrollLeft;
		movement.factorX = scrolled.scrollWidth / movement.el.offsetWidth;
		movement.maxX = scrolled.scrollWidth - scrolled.clientWidth;
		return false; // prevent default
	}
	function mousedownStatefulHorz(ev) {
		if (activeMovement != null) return;

		if (ev.preventDefault) ev.preventDefault();
		//TODO this.stateful instead of var scrolled = this.parentNode.scrolled;
		var scrolled = this.parentNode.scrolled; //TODO better way to pass ?
		var movement = new ElementMovement();
		movement.track = function(ev,x,y) {
			scrolled.stateful.set("pos.scrollLeft",x);
			this.scrolledTo = x;
		};
		movement.start(this,ev);
		movement.startY = scrolled.stateful("pos.scrollTop","0");
		movement.startX = scrolled.stateful("pos.scrollLeft","0");
		movement.factorX = scrolled.stateful("pos.scrollWidth","0") / movement.el.offsetWidth;
		movement.maxY = scrolled.stateful("pos.scrollWidth","0") - scrolled.clientWidth;
		return false; // prevent default
	}


	function EnhancedScrollbar(el,container,config,opts,mousedownEvent) {
        var sbsc = scrollbarSize();
		var lc = opts.horzvert.toLowerCase();

		this.scrolled = el;
		var className = config.obscured? lc+"-scroller obscured" : lc+"-scroller";
		this.el = HTMLElement("div", { "class":className }, '<header></header><footer></footer><nav><header></header><footer></footer></nav>');
		container.appendChild(this.el);
		this.sizeName = opts.sizeName; this.posName = opts.posName;
		this.sizeStyle = opts.sizeName.toLowerCase();
		this.posStyle = opts.posName.toLowerCase();
		this.autoHide = opts.autoHide;
		this.trackScroll = opts.trackScroll == false? false : true;;

		this.trackScrolled(el);

		addEventListeners(el,ENHANCED_SCROLLED_EVENTS);
		addEventListeners(this.el,{ "mousedown": mousedownEvent });

		if (config.initialDisplay !== false) {
			if (this.show()) {
				this.hiding = setTimeout(this.hide.bind(this), parseInt(opts.initialDisplay,10) || 3000);
			}
		}
		if (config.obscured) this.el.style[opts.edgeName] = "-" + (config[lc+"Offset"]!=undefined? config[lc+"Offset"]:sbsc) + "px";
        else this.el.style[opts.thicknessName] = sbsc + "px";
	}

	EnhancedScrollbar.prototype.trackScrolled = function(el) {
		if (this.trackScroll) {
			this.scrolledTo = el["scroll"+this.posName];
			this.scrolledContentSize = el["scroll"+this.sizeName];
		}
		else {
			this.scrolledTo = this.scrolled.stateful("pos.scroll"+this.posName,"0");
			this.scrolledContentSize = this.scrolled.stateful("pos.scroll"+this.sizeName,"0");
		}
		this.scrolledSize = el["client"+this.sizeName]; //scrolled.offsetHeight - scrollbarSize();
	};

	EnhancedScrollbar.prototype.update = function(scrolled) {
		if (this.scrolledContentSize) {
			this.el.lastChild.style[this.posStyle] = (100 * this.scrolledTo / this.scrolledContentSize) + "%";
			this.el.lastChild.style[this.sizeStyle] = (100 * this.scrolledSize / this.scrolledContentSize) + "%";
		} else {
			this.el.lastChild.style[this.posStyle] = "0%";
			this.el.lastChild.style[this.sizeStyle] = "0%";
		}
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
		if (this.el) {
			if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
			callCleaners(this.el);
			this.el = undefined;
		}
	};

	function EnhancedScrolled(el,config) {

		//? this.el = el
		var container = this._getContainer(el,config);


		var trackScrollVert = !(config.trackScrollVert==false || config.trackScroll == false),
			trackScrollHorz = !(config.trackScrollHorz==false || config.trackScroll == false);

		el.stateful.declare("pos.scrollVert",trackScrollVert);
		el.stateful.declare("pos.scrollHorz",trackScrollHorz);
		el.stateful.declare("pos.scrollTop",0);
		el.stateful.declare("pos.scrollLeft",0);

		this.x = false !== config.x;
		this.y = false !== config.y;
		this.vert = new EnhancedScrollbar(el,container,config,{
			horzvert: "Vert", 
			trackScroll: trackScrollVert,
			sizeName: "Height", 
			posName: "Top",
			thicknessName:"width",
			edgeName: "right" 
			},trackScrollVert? mousedownVert : mousedownStatefulVert);

		this.horz = new EnhancedScrollbar(el,container,config,{ 
			horzvert: "Horz",
			trackScroll: trackScrollHorz,
			sizeName: "Width", 
			posName: "Left", 
			thicknessName:"height",
			edgeName: "bottom" 
			},trackScrollHorz? mousedownHorz : mousedownStatefulHorz);

		container.scrolled = el;
		StatefulResolver(container,true);
		addEventListeners(container,ENHANCED_SCROLLED_PARENT_EVENTS);
		container.scrollContainer = "top";

		this.refresh(el);

		el.stateful.on("change","pos.scrollTop",{el:el,es:this},this.scrollTopChanged);
		el.stateful.on("change","pos.scrollLeft",{el:el,es:this},this.scrollLeftChanged);
	}

	EnhancedScrolled.prototype.scrollTopChanged = function(ev) {
		var el = ev.data.el, es = ev.data.es;

		// if not shown, show and if not entered and not dragging, hide after 1500 ms
		if (!es.vert.shown) {
			es.vert.show();
			es.horz.show();
			if (!ev.resolver("over") && !ev.resolver("dragging")) {
				es.vert.delayedHide();
				es.horz.delayedHide();
			}
		}

		es.vert.trackScrolled(el);
		es.vert.update(el);
	};

	EnhancedScrolled.prototype.scrollLeftChanged = function(ev) {
		var el = ev.data.el, es = ev.data.es;

		// if not shown, show and if not entered and not dragging, hide after 1500 ms
		if (!es.vert.shown) {
			es.vert.show();
			es.horz.show();
			if (!el.stateful("over") && !el.stateful("dragging")) {
				es.vert.delayedHide();
				es.horz.delayedHide();
			}
		}
		es.horz.trackScrolled(el);
		es.horz.update(el);
	};

	EnhancedScrolled.prototype._getContainer = function(el,config) {

        var sbsc = scrollbarSize();

		var container = el.parentNode;
		if (config.obscured) {
			if (! config.unstyledParent) el.parentNode.style.cssText = "position:absolute;left:0;right:0;top:0;bottom:0;overflow:hidden;";
			el.style.right = "-" + sbsc + "px";
			el.style.bottom = "-" + sbsc + "px";
			el.style.paddingRight = sbsc + "px";
			el.style.paddingBottom = sbsc + "px";
			container = container.parentNode;
		}
		return container;
	};

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

	function enhance_scrolled(el,role,config,context) {

		var contentTemplate = config.template;
		if (contentTemplate) {
			var template = Resolver("page::templates","null")([contentTemplate]);
			if (template == null) return false;

			var content = template.content.cloneNode(true);

			el.appendChild(content);
			var context = { layouter: this.parentLayouter };
			if (config.layouter) context.layouter = this; //TODO temp fix, move _prep to descriptor
			// essential("DescriptorQuery")(wrap).enhance();
			ApplicationConfig()._prep(el,context); //TODO prepAncestors
		}

		StatefulResolver(el,true);
		el.style.cssText = 'position:absolute;left:0;right:0;top:0;bottom:0;overflow:scroll;';
		var r = new EnhancedScrolled(el,config);

		return r;
	}
	pageResolver.set("handlers.enhance.scrolled",enhance_scrolled);

	function layout_scrolled(el,layout,instance) {
		instance.layout(el,layout);
	}
	pageResolver.set("handlers.layout.scrolled",layout_scrolled);
	
	function discard_scrolled(el,role,instance) {
		instance.discard(el);
		if (el.stateful) el.stateful.destroy();
	}
	pageResolver.set("handlers.discard.scrolled",discard_scrolled);
	
}();
Resolver("essential::ApplicationConfig::").restrict({ "singleton":true, "lifecycle":"page" });

//TODO clearInterval on unload

Resolver("page::state.livepage").on("change",function(ev) {
	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::"),
		enhancedWindows = Resolver("essential::enhancedWindows::"),
		placement = Resolver("essential::placement::"),
		defaultButtonClick = Resolver("essential::defaultButtonClick::"),
		pageResolver = Resolver("page"),
		updateOnlineStatus = pageResolver("updateOnlineStatus");

	function resizeTriggersReflow(ev) {
		EnhancedDescriptor.refreshAll();
		enhancedWindows.notifyAll(ev);
		for(var i=0,w; w = enhancedWindows[i]; ++i) {
			w.notify(ev);
		}
	}

	if (ev.value) { // bring live
		
		//TODO manage interval in configured.js, and space it out consistent results
		// for browsers that don't support events
		pageResolver.uosInterval = setInterval(pageResolver.updateOnlineStatus,5000);

		EnhancedDescriptor.maintainer = setInterval(EnhancedDescriptor.maintainAll,330); // minimum frequency 3 per sec
		EnhancedDescriptor.refresher = setInterval(EnhancedDescriptor.refreshAll,160); // minimum frequency 3 per sec

		updateOnlineStatus();

		if (window.addEventListener) {
			this.body.addEventListener("online",updateOnlineStatus);
			this.body.addEventListener("offline",updateOnlineStatus);
		
			if (window.applicationCache) applicationCache.addEventListener("error", updateOnlineStatus);

			window.addEventListener("resize",resizeTriggersReflow,false);
			document.body.addEventListener("orientationchange",resizeTriggersReflow,false);
			document.body.addEventListener("click",defaultButtonClick,false);
		} else {
			// IE8
			window.attachEvent("onresize",resizeTriggersReflow);
			document.body.attachEvent("onclick",defaultButtonClick);

			this.body.attachEvent("online",updateOnlineStatus);
			this.body.attachEvent("offline",updateOnlineStatus);
		}

	} else { // unload

		if (window.removeEventListener) {
			window.removeEventListener("resize",resizeTriggersReflow);
			document.body.removeEventListener("orientationchange",resizeTriggersReflow);
			document.body.removeEventListener("click",defaultButtonClick);
		} else {
			window.detachEvent("onresize",resizeTriggersReflow);
			document.body.detachEvent("onclick",defaultButtonClick);
		}

		clearInterval(pageResolver.uosInterval);
		pageResolver.uosInterval = null;
		clearInterval(EnhancedDescriptor.maintainer);
		EnhancedDescriptor.maintainer = null;
		clearInterval(EnhancedDescriptor.refresher);
		EnhancedDescriptor.refresher = null;
		if (placement.broadcaster) clearInterval(placement.broadcaster);
		placement.broadcaster = null;
		placement.stopTrackMain();
	}
});

Resolver("page::state.managed").on("change",function(ev) {

	var	placement = Resolver("essential::placement::");

	if (ev.value) {
		placement.startTrackMain();
	}
});

