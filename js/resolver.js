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
        if (name_andor_expr === window && Resolver.window) return Resolver.window;
        if (name_andor_expr === document && Resolver.document) return Resolver.document;
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
                case "force":
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

    	function trigger(base,symbol,value,oldValue) {
            if (this.inTrigger) return;
            ++this.inTrigger;
            this.base = base;
    		this.symbol = symbol;
    		this.value = value;
            this.oldValue = oldValue;
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
            var parts = name.split("::");
            if (parts.length > 1) {
                // name = parts[1];
                if (parts.length == 2) name += "::"; // return value by default not ref
                return Resolver(name,onundefined);
            }
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
                var oldValue = arguments[1];
                value = !oldValue; //TODO configurable toggle

                if (_setValue(value,combined,base,symbol)) {
                    var childRef = resolver.references[parentName + "." + symbol];
                    if (childRef) childRef._callListener("change",combined,base,symbol,value,oldValue);
                    var parentRef = resolver.references[parentName];
                    if (parentRef) parentRef._callListener("change",combined,base,symbol,value,oldValue);
                }
            } else {
                var base = _resolve(baseNames,null,onundefinedSet),
                    oldValue = arguments[0];
                value = !oldValue; //TODO configurable toggle

                if (_setValue(value,baseNames,base,leafName)) {
                    this._callListener("change",baseNames,base,leafName,value,oldValue);
                    //TODO test for triggering specific listeners
                    if (baseRefName) {
                        var parentRef = resolver.references[baseRefName];
                        if (parentRef) parentRef._callListener("change",baseNames,base,leafName,value,oldValue);
                    }
                }
            }
            return value;
        }

        function remove() {
            if (arguments.length > 0) {
                var subnames = (typeof arguments[0] == "object")? arguments[0] : arguments[0].split(".");
                var symbol = subnames.pop();
                var base = _resolve(names,subnames,onundefinedSet);
                var combined = names.concat(subnames);
                var parentName = combined.join(".");
                subnames.push(symbol);

                //TODO if typeof base != object 
                var oldValue = base[symbol];
                if (oldValue === undefined) return;
                delete base[symbol];

                var childRef = resolver.references[parentName + "." + symbol];
                if (childRef) childRef._callListener("change",combined,base,symbol,undefined,oldValue);
                var parentRef = resolver.references[parentName];
                if (parentRef) parentRef._callListener("change",combined,base,symbol,undefined,oldValue);

            } else {
                var symbol = names[names.length - 1];
                var base = _resolve(baseNames,null,onundefinedSet);
                var oldValue = base[symbol];
                if (oldValue === undefined) return;
                delete base[symbol];

                this._callListener("change",baseNames,base,leafName,undefined,oldValue);
                //TODO test for triggering specific listeners
                if (baseRefName) {
                    var parentRef = resolver.references[baseRefName];
                    if (parentRef) parentRef._callListener("change",baseNames,base,leafName,undefined,oldValue);
                }
            }
            return oldValue;
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
                var oldValue = base[symbol];

                if (_setValue(value,combined,base,symbol)) {
                    var childRef = resolver.references[parentName + "." + symbol];
                    if (childRef) childRef._callListener("change",combined,base,symbol,value,oldValue);
                    var parentRef = resolver.references[parentName];
                    if (parentRef) parentRef._callListener("change",combined,base,symbol,value,oldValue);
                }
        	} else {
				var base = _resolve(baseNames,null,onundefinedSet);
                var oldValue = base[symbol];

                if (_setValue(value,baseNames,base,leafName)) {
                    this._callListener("change",baseNames,base,leafName,value,oldValue);
                    //TODO test for triggering specific listeners
                    if (baseRefName) {
                        var parentRef = resolver.references[baseRefName];
                        if (parentRef) parentRef._callListener("change",baseNames,base,leafName,value,oldValue);
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
                var oldValue = base[symbol];

                if (base[symbol] === undefined) {
                    if (_setValue(value,combined,base,symbol)) {
                        var childRef = resolver.references[parentName + "." + symbol];
                        if (childRef) childRef._callListener("change",combined,base,symbol,value,oldValue);
                        var parentRef = resolver.references[parentName];
                        if (parentRef) parentRef._callListener("change",combined,base,symbol,value,oldValue);
                    }
                }
                return base[symbol];
        	} else {
                var base = _resolve(baseNames,null,onundefinedSet);
                var oldValue = base[symbol];

                if (base[leafName] === undefined) {
                    if (_setValue(value,baseNames,base,leafName)) {
                        this._callListener("change",baseNames,base,leafName,value,oldValue);
                        //TODO test for triggering specific listeners
                        if (baseRefName) {
                            var parentRef = resolver.references[baseRefName];
                            if (parentRef) parentRef._callListener("change",baseNames,base,leafName,value,oldValue);
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
            var oldValue = base[symbol];
        	names.push(symbol);
        	if (base[symbol] === undefined) _setValue({},names,base,symbol);
        	
        	if (base[symbol][key] === undefined) {
        		names.push(key);
        		if (_setValue(value,names,base[symbol],key)) {
			    	this._callListener("change",names,base,key,value,oldValue);
	    	//TODO parent listeners
        		}
	    		names.pop(); // return names to unchanged
        	}
        }
        function setEntry(key,value) {
            var symbol = names.pop();
        	var base = _resolve(names,null,onundefined);
            var oldValue = base[symbol];
        	names.push(symbol);
        	if (base[symbol] === undefined) _setValue({},names,base,symbol);
        	
    		names.push(key);
    		if (_setValue(value,names,base[symbol],key)) {
		    	this._callListener("change",names,base,key,value,oldValue);
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
            } catch(ex) { Resolver("essential::console::")().warn("Failed to read store_local = ",this.id,ex); } //TODO consider feedback
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
                    var newScript = Resolver("essential::HTMLScriptElement::")(script);
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

        get.remove = remove;
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

	    function _callListener(type,names,base,symbol,value,oldValue) {
            if (type == "change" && value === false) {
                for(var i=0,event; event = this.listeners["false"][i]; ++i) {
                    event.trigger(base,symbol,value,oldValue);
                }
            }
            if (type == "change" && value === true) {
                for(var i=0,event; event = this.listeners["true"][i]; ++i) {
                    event.trigger(base,symbol,value,oldValue);
                }
            }
	    	for(var i=0,event; event = this.listeners[type][i]; ++i) {
	    		event.trigger(base,symbol,value,oldValue);
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
                ev.binding = true;
                ev.trigger(base,leafName,base == undefined? undefined : base[leafName]);
                ev.binding = false;
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

    resolver.remove = function(name,onundefined)
    {
        var names;
        if (typeof name == "object" && name.join) {
            names = name;
            name = name.join(".");
        } else {
            names = name.split("::");
            if (names.length > 1) {
                return Resolver(names.shift()).remove(names[0],onundefined);
            }
            names = name.split(".");
        }
        var symbol = names.pop();
        var base = _resolve(names,null,onundefined), oldValue = base[symbol];
        if (oldValue === undefined) return;
        delete base[symbol];

        var ref = resolver.references[name];
        if (ref) ref._callListener("change",names,base,symbol,undefined);
        var parentName = names.join(".");
        var parentRef = resolver.references[parentName];
        if (parentRef) parentRef._callListener("change",names,base,symbol,undefined);
        return oldValue;
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
        } else {
            names = name.split("::");
            if (names.length > 1) {
                return Resolver(names.shift()).declare(names[0],value,onundefined);
            }
            names = name.split(".");
        }
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
        } else {
            names = name.split("::");
            if (names.length > 1) {
                return Resolver(names.shift()).set(names[0],value,onundefined);
            }
            names = name.split(".");
        }
		var symbol = names.pop();
		var base = _resolve(names,null,onundefined);
        if (onundefined=="force" && (typeof base != "object" || typeof base != "function")) {
            var leaf = names.pop();
            _resolve(names,null,onundefined)[leaf] = {};
            names.push(leaf);
            base = _resolve(names,null,onundefined);
        }
        var oldValue = base[symbol];
		if (_setValue(value,names,base,symbol)) {
			var ref = resolver.references[name];
			if (ref) ref._callListener("change",names,base,symbol,value,oldValue);
			var parentName = names.join(".");
			var parentRef = resolver.references[parentName];
			if (parentRef) parentRef._callListener("change",names,base,symbol,value,oldValue);
		}
		return value;
    };

    resolver.toggle = function(name,onundefined)
    {
        var names;
        if (typeof name == "object" && name.join) {
            names = name;
            name = name.join(".");
        } else {
            names = name.split("::");
            if (names.length > 1) {
                return Resolver(names.shift()).toggle(names[0],value,onundefined);
            }
            names = name.split(".");
        }
        var symbol = names.pop();
        var base = _resolve(names,null,onundefined);
        var value = ! base[symbol]; //TODO configurable toggle
        if (_setValue(value,names,base,symbol)) {
            var ref = resolver.references[name];
            if (ref) ref._callListener("change",names,base,symbol,value,!value);
            var parentName = names.join(".");
            var parentRef = resolver.references[parentName];
            if (parentRef) parentRef._callListener("change",names,base,symbol,value,!value);
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
        } else {
            if (name.indexOf("::") >= 0) return Resolver(name,onundefined);
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

Resolver.functionProxy = function(src) {

   // When executing the Function constructor, we are going
    // to wrap the source code in a WITH keyword block that
    // allows the THIS context to extend the local scope of
    // the function.
    //
    // NOTE: This works without a nested self-executing
    // function. I put it in there simply because it makes me
    // feel a little more comfortable with the use of the
    // WITH keyword.
    return(
        Function(
            "with (this){" +
                "return(" +
                    "(function(){" + src + "})()" +
                ");" +
            "};"
        )
    );
};

Resolver({},{ name:"default" });
Resolver(window, {name:"window"});
Resolver(document, {name:"document"});

