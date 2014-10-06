/**
 *
 * options.name
 * options.generator
 * options.mixinto
 */
function Resolver(name_andor_expr,ns,options)
{
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

    var forDoc = false, forEl = false;

	switch(typeof(name_andor_expr)) {
	case "undefined":
		// Resolver()
		return Resolver.nm["default"];
		
	case "string":
        var name_expr = name_andor_expr.split("::");
        var name = name_expr[0] || "default", expr = name_expr[1];

        switch(name_expr.length) {
            case 1: 
                // Resolver("abc")
                // Resolver("abc",null)
                // Resolver("abc",{})
                // Resolver("abc",{},{options})
                return Resolver.get(name,ns,options,arguments.length==1 || ns);

            case 2: 
                var _r = Resolver.get(name,ns,options,arguments.length==1 || ns);
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
                    return Resolver.nm[name].get(expr,ns);

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
                    return Resolver.nm[name].get(expr,ns);

                default:
                case "reference":
                    return Resolver.nm[name].reference(expr)
            }
            return Resolver.nm[name][call](expr);
        }
		return Resolver.nm[name];

    case "function":
    case "object":
        // Resolver({})
        // Resolver({},{options})
        if (name_andor_expr === window && Resolver.nm.window) return Resolver.nm.window;
        else if (name_andor_expr.nodeType !== undefined) {
            forDoc = (name_andor_expr.nodeType === 9);
            forEl = !forDoc;
            var map = forDoc? Resolver.forDoc:Resolver.forEl;
            var existing = Resolver.getByUniqueID(map,name_andor_expr);
            if (existing) return existing;

            var resolver = Resolver.create(null,name_andor_expr,ns);
            return resolver;
        }

        return Resolver.create(null,name_andor_expr,ns);
	}

///////////////


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



    return resolver;
}

Resolver.nm = {}; // named resolvers
Resolver.forEl = {}; // for unique elements
Resolver.forDoc = {}; // for unique documents

Resolver.__lastUniqueID = 345;

Resolver.getByUniqueID = function(map,el,forceID) {
    if (el.nodeType === 9) {
        if (el.uniquePageID === undefined && forceID) el.uniquePageID = ++Resolver.__lastUniqueID;
        if (el.uniquePageID !== undefined) return map[el.uniquePageID];
    } else {
        if (el.uniqueID === undefined && forceID) el.uniqueID = ++Resolver.__lastUniqueID;
        if (el.uniqueID !== undefined) return map[el.uniqueID];
    }

    return null;
};

Resolver.setByUniqueID = function(map,el,value) {
    if (el.nodeType === 9) {
        if (el.uniquePageID === undefined) el.uniquePageID = ++Resolver.__lastUniqueID;
        map[el.uniquePageID] = value;
    } else {
        if (el.uniqueID === undefined) el.uniqueID = ++Resolver.__lastUniqueID;
        map[el.uniqueID] = value;
    }
};

Resolver.defaultOnUndefined = "null";

    // unnamed resolvers name=null
Resolver.create = function(name,ns,options,parent) {
    if (parent) {
        resolver.prefix = parent.prefix? parent.prefix.slice(0) : [];
        resolver.prefix.push(name);
        resolver.root = parent.root || parent;
        resolver.namespace = resolver.root.namespace;
    } else {
        ns = ns || {};
        options = options || {};
        name = name || options.name;
        //TODO forEl, forDoc byId
        if (name) Resolver.nm[name] = resolver;
        resolver.named = name;
        resolver.namespace = ns;
        resolver.root = null;

        // Namespace is el/doc
        if (typeof ns.nodeType == "number") {
            var ownerDoc = ns.ownerDocument;
            if (ownerDoc == null) {
                Resolver._docDefaults(resolver); //TODO move in here ?
                Resolver.setByUniqueID(Resolver.forDoc,ns,resolver);
                resolver.uniquePageID = ns.uniquePageID;
            }
            else {
                //TODO maintain map on the ownerDocument
                Resolver.setByUniqueID(Resolver.forEl,ns,resolver);
                resolver.uniqueID = ns.uniqueID;
            }
        } 

        if (options.mixinto) {
            for(var n in Resolver.method.fn) {
                options.mixinto[n] = Resolver.method.fn[n].bind(resolver);
                //?? more ?
            }
        }
    }
    resolver.references = { }; // on references perhaps ref this as well

    /**
     * Function returned by the Resolver call.
     * @param path To resolve
     * @param method Optional method to do
     * @param onundefined What to do for undefined symbols ("generate","null","throw")

      (expr)
      (expr,"null")
      (expr,"=",5)
      (expr,"declare",5,"object")
     */
    function resolver(path,method /* or onundefined */) {
        switch(arguments.length) {
            case 0: 
                return resolver._noval(null,Resolver.defaultOnUndefined); 
            case 1:
                return resolver._noval(path, path.onundefined||Resolver.defaultOnUndefined); 
            case 2:
                return resolver._noval(path,method);
            default:
                return resolver._exec.apply(resolver,arguments);
        }
    }

    resolver._noval = function(path, cmd, trigger, onundefined) {
        var parts, names, ref=false, src = resolver;
        if (typeof path == "string") {
            parts = path.split("::");
            if(parts.length == 1) {
                names = path.split(".");
            } else if (parts.length == 2 && parts[1].length == 0) {
                ref = true;
            } else if (parts.length >= 2) {
                src = Resolver.get(parts[0]);
                names = parts[1].split(".");
            } 

            if (parts.length == 3 && parts[2].length == 0) {
                ref = true;
            }
        } else if (path) { // if "" / null leave undefined
            if (path.length != undefined) { names=path; } 
            else { names = path.name.split("."); /*onundefined = path.onundefined || onundefined;*/ }
        }

        switch(cmd) {
            case "toggle":
                var base = resolver._get(names,onundefined,-1),
                    symbol = names[names.length - 1],
                    old = base[symbol];
                base[symbol] = !old;
                if (trigger) trigger.call(resolver, "change", names, base, symbol, !old, old); //TODO standard params
                return base[symbol];

            case "empty":
                break;
            case "blank":
                break;
            // turnon turnoff

            case "read":
            case "store":
                break;            

            case "resolver":
                if (path == null) {
                    //TODO get onundefined variant
                    return this;
                } else {
                    //TODO fill out default resolver
                    return resolver._reference(names);
                }
                break;


            case "throw":
            //TODO names == undefined
                if (ref) return resolver._reference(names);
                return resolver._get(names,"throw","throw");

            case "generate":
            case "force":
            //TODO names == undefined
                if (ref) return resolver._reference(names);
                return resolver._get(names,"generate","generate"); 

            case "get": // which is default?
            case "null":
            case "undefined":
            case "false":
            case "0":
            //TODO names == undefined
                if (ref) return resolver._reference(names);
                return resolver._get(names,"value","value",UNDEF[cmd]);
        }

    };

    var UNDEF = { "get":null, "null":null, "undefined":undefined, "false":false, "0":0 };

    resolver._exec = function(path, cmd, value, trigger, onundefined) {
        var parts, names, ref=false, src = resolver;
        if (typeof path == "string") {
            parts = path.split("::");
            if(parts.length == 1) {
                names = path.split(".");
            } else if (parts.length == 2 && parts[1].length == 0) {
                ref = true;
            } else if (parts.length >= 2) {
                src = Resolver.get(parts[0]);
                names = parts[1].split(".");
            } 

            if (parts.length == 3 && parts[2].length == 0) {
                ref = true;
            }
        } else if (path) { // if "" / null leave undefined
            if (path.length != undefined) { names=path; } 
            else { names = path.name.split("."); /*onundefined = path.onundefined || onundefined;*/ }
        }

        switch(cmd) {
            case "declare":
            //TODO names == undefined
                var base = resolver._get(names,onundefined,-1),
                    symbol = names? names[names.length - 1] : resolver.prefix[resolver.prefix.length - 1],
                    old = base[symbol];
                if (old === undefined) {
                    base[symbol] = value;
                    if (trigger) trigger.call(resolver, "change", names, base, symbol, value, old); //TODO standard params
                }
                return base[symbol];

            case "set":
            //TODO names == undefined
                var base = resolver._get(names,onundefined,-1),
                    symbol = names? names[names.length - 1] : resolver.prefix[resolver.prefix.length - 1],
                    old = base[symbol];
                if (old !== value) {
                    base[symbol] = value;
                    if (trigger) trigger.call(resolver, "change", names, base, symbol, value, old); //TODO standard params
                }
                return base[symbol];

            // case "declareEntry":
            case "setEntry":
            case "mixin":
            case "unmix":
            //TODO names == undefined
                break;

            case "mixinto":
                var src = resolver._get(names);
                for(var n in src) value[n] = src[n];
                break;

            case "remove":
            //TODO names == undefined
                var base = resolver._get(names,"error",-1),
                    symbol = names? names[names.length - 1] : resolver.prefix[resolver.prefix.length - 1];
                if (base == null || base instanceof Error) return; // ignore higher being removed already
                var old = base[symbol];
                if (old !== undefined) {
                    delete base[symbol];
                    if (trigger) trigger.call(resolver, "change", names, base, symbol, undefined, old); //TODO standard params & remove flag
                }
                return old;
        }
    };

    var generator = options.generator || Generator.ObjectGenerator; // pre-plan object generator
    var notObject = new Error("Unresolved");

    // next non null node, can fill undefined
    function nextObject(node,name,names,fill,force) {
        var n = node[name], t = typeof n;
        if ((t==="object" && n!==null) || t==="function") return n;
        if (force || (fill && n===undefined)) return (node[name] = generator());
        return new Error("The '" + name + "' part of '" + names.join(".") + "' couldn't be resolved.");
    }

    // might not need it
    function getValue(node,name,names,fill) {
        var n = node[name], t = typeof n;
        if (n !== undefined) return n;
        if (fill) return (node[name] = generator());
        return new Error("The '" + name + "' part of '" + names.join(".") + "' couldn't be resolved.");
    }

    // leafu == -1 returns base
    resolver._get = function(names,baseu,leafu,dflt) {
        //TODO names == undefined, return namespace

        var node = resolver.root? resolver.root._get(resolver.prefix,baseu,names==undefined? leafu:baseu) : resolver.namespace; // passed namespace negates override
        if (node == null || names == undefined) return node;
        var l = names.length - 1, n;
        switch(baseu) {
            case "value":
                for (var j = 0; j<l; ++j)  {
                    node = nextObject(node,names[j],names,false);
                    if (node instanceof Error) return dflt;
                }
                break;
            case "error":
                for (var j = 0; j<l; ++j) {
                    node = nextObject(node,names[j],names,false);
                    if (node instanceof Error) return node;
                }
                break;
            case "throw":
                for (var j = 0; j<l; ++j) {
                    node = nextObject(node,names[j],names,false);
                    if (node instanceof Error) throw node;
                }
                break;
            default:
                for (var j = 0; j<l; ++j) {
                    node = nextObject(node,names[j],names,true, baseu=="force");
                    if (node instanceof Error) throw node;
                }
                break;
        }
        switch(leafu) {
            case -1: return node;
            case "value":
                node = node[names[j]];
                return node===undefined? dflt:node;
            case "error":
                node = getValue(node,names[j],names,false);
                return node;
            case "throw":
                node = getValue(node,names[j],names,false);
                if (node instanceof Error) throw node;
                return node;
            default:
                var leaf = node[names[j]];
                return leaf===undefined? (node[names[j]] = generator()):leaf;
        }
    };

    resolver._reference = function(names) {
        var ref = resolver;
        for(var i=0,n; n = names[i]; ++i) {
            if (ref.references[n] == undefined) {
                ref.references[n] = Resolver.create(n,undefined,{},ref);    
            }
            ref = ref.references[n];
        }
        return ref;
    };

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


    resolver.listeners = options.listeners || _makeListeners();


    function _callListener(sourceResolver, type,names,base,symbol,value,oldValue) {
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
    resolver._callListener = _callListener;

    resolver._notifies = function(evName, parts, base, symbol, value, old) {
        this._callListener(this, evName, parts, base, symbol, value, old);
        if (parent) parent._callListener(this, evName, parts, base, symbol, value, old);
    };


    // obsolete
    function _resolve(names,subnames,onundefined) {
        
        var top = resolver.namespace; // passed namespace negates override

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
                        top = prev_top[n] = generator();
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
    resolver._resolve = _resolve;

    // obsolete
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
    resolver._setValue = _setValue;    

    for(var n in Resolver.method.fn) {
        resolver[n] = Resolver.method.fn[n];
    }

    return resolver;
};

Resolver.get = function(name,ns,options,auto) {
    if (this.nm[name]) return this.nm[name];
    if (!auto) return ns;
    return this.create(name, ns,options);
};

Resolver.storeunloads = [];

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
    return this.nm[name] != undefined;
};

Resolver.method = function(name,fn) {
    Resolver.method.fn[name] = fn;
    //TODO fix up named/known resolver references
};
Resolver.method.fn = {};

Resolver.method.fn.get = function(name,onundefined) {
    return this._noval(name,onundefined || Resolver.defaultOnUndefined);
};

/*
    name = string/array
*/
Resolver.method.fn.declare = function(name,value,onundefined) 
{
    if (arguments.length==1) return this._exec(null,"declare",arguments[0],this._notifies);
    return this._exec(name,"declare",value,this._notifies,onundefined);
};

/*
    name = string/array
*/
Resolver.method.fn.set = function(name,value,onundefined) 
{
    if (arguments.length==1) return this._exec(null,"set",arguments[0],this._notifies);
    return this._exec(name,"set",value,this._notifies,onundefined);
};

Resolver.method.fn.toggle = function(name,onundefined)
{
    return this._noval(name,"toggle",this._notifies,onundefined);
};

Resolver.method.fn.remove = function(name,onundefined)
{
    return this._exec(name,"remove",0,this._notifies,onundefined);
};

Resolver.method.fn.mixinto = function(target) {
    if (arguments.length==1) return this._exec(null,"mixinto",target);
    return this._exec(arguments[0],"mixinto",arguments[1]);
};


Resolver.method.fn.on = function(type,selector,data,callback) 
{
    var ref = this;
    switch(arguments.length) {
        case 2:
            callback = selector; data = null; 
            break;

        case 3: if (typeof arguments[1] == "string") {
                ref = this.reference(selector);
                data = null;
            } else { // middle param is data
                //TODO this.reference("*").on(type,arguments[1],arguments[2]);
                data = arguments[1];
            }
            callback = arguments[2];
            break;
        case 4:
            ref = this.reference(selector);
            break;
    }

    ref._addListener(type,data,callback);
};

// called on the leaf
Resolver.method.fn._addListener = function (type,data,callback) {

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

    var selector = this.prefix.join("."), leafName = this.prefix[this.prefix.length - 1];

    if (/^bind | bind | bind$|^bind$/.test(type)) {
        type = type.replace(" bind "," ").replace("bind ","").replace(" bind","");

        var base = this._get(null,"undefined",-1);
        var ev = _makeResolverEvent(this.root,type,selector,data,callback);
        ev.binding = true;
        ev.trigger(base,leafName,base == undefined? undefined : base[leafName]);
        ev.binding = false;
    }
    var types = type.split(" ");
    for(var i=0,type; type = types[i]; ++i) {
        var ev = _makeResolverEvent(this.root,type,selector,data,callback);
        this.listeners[type].push(ev);
    }
};

// Resolver.method.fn._removeListener
// Resolver.method.fn.off
    
Resolver.method.fn.reference = function(name,onundefined) 
{
    var ref = this._noval(name,"resolver"); //,0,onundefined);

    return ref._noval(null,"resolver",0,onundefined);

    // obsolete

    // name = name || "";
    // if (typeof name == "object") {
    //     onundefined = name.onundefined;
    //     name = name.name;
    // } else {
    //     if (name.indexOf("::") >= 0) return Resolver(name,onundefined);
    // }
    var ref = onundefined? name+":"+onundefined : name;
    var entry = this.references[ref];
    if (entry) {
        //TODO track the version number of the API and update if higher
        for(var n in Resolver.method.fn) {
            if (entry[n] === undefined) entry[n] = Resolver.method.fn[n];
        }
        return entry;
    }

    // make the default reference first
    var defaultRef = this.references[name];
    if (defaultRef == undefined) {
        defaultRef = this.references[name] = this.makeReference(name,onundefined);
        if (ref == name) return defaultRef;
    }
    // if requested reference is different return that one
    return this.references[ref] = this.makeReference(name,onundefined,defaultRef.listeners);
};

    // relies of resolver
Resolver.method.fn.makeReference = function(name,onundefined,listeners)
{
    var resolver = this;
        var names = [], leafName, baseRefName = "", baseNames = [];
        if (name!=="" && name!=null) {
            names = name.split(".");
            leafName = names.pop();
            baseRefName = names.join(".");
            baseNames = names.slice(0);
            names.push(leafName);
        }

        var onundefinedSet = (onundefined=="null"||onundefined=="undefined")? "throw":onundefined; //TODO what about "false" "0"

        function toggle() {
            var value; //TODO
            if (arguments.length > 1) {
                var subnames = (typeof arguments[0] == "object")? arguments[0] : arguments[0].split(".");
                var symbol = subnames.pop();
                var base = resolver._resolve(names,subnames,onundefinedSet);
                var combined = names.concat(subnames);
                var parentName = combined.join(".");
                subnames.push(symbol);
                var oldValue = arguments[1];
                value = !oldValue; //TODO configurable toggle

                if (resolver._setValue(value,combined,base,symbol)) {
                    var childRef = resolver.references[parentName + "." + symbol];
                    if (childRef) childRef._callListener("change",combined,base,symbol,value,oldValue);
                    var parentRef = resolver.references[parentName];
                    if (parentRef) parentRef._callListener("change",combined,base,symbol,value,oldValue);
                }
            } else {
                var base = resolver._resolve(baseNames,null,onundefinedSet),
                    oldValue = arguments[0];
                value = !oldValue; //TODO configurable toggle

                if (resolver._setValue(value,baseNames,base,leafName)) {
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

        function getEntry(key) {
            var base = resolver._resolve(names,null,onundefined);
            if (arguments.length) return base[key];
            return base;
        }
        function declareEntry(key,value) {
            var symbol = names.pop();
            var base = resolver._resolve(names,null,onundefined);
            var oldValue = base[symbol];
            names.push(symbol);
            if (base[symbol] === undefined) resolver._setValue({},names,base,symbol);
            
            if (base[symbol][key] === undefined) {
                names.push(key);
                if (resolver._setValue(value,names,base[symbol],key)) {
                    this._callListener("change",names,base,key,value,oldValue);
            //TODO parent listeners
                }
                names.pop(); // return names to unchanged
            }
        }
        function setEntry(key,value) {
            var symbol = names.pop();
            var base = resolver._resolve(names,null,onundefined);
            var oldValue = base?base[symbol]:undefined;
            names.push(symbol);
            if (base[symbol] === undefined) resolver._setValue({},names,base,symbol);
            
            names.push(key);
            if (resolver._setValue(value,names,base[symbol],key)) {
                this._callListener("change",names,base,key,value,oldValue);
            //TODO parent listeners
            }
            names.pop(); // return names to unchanged
        }
        function mixin(map) {
            var symbol = names.pop();
            var base = resolver._resolve(names,null,onundefined);
            names.push(symbol);
            if (base[symbol] === undefined) resolver._setValue({},names,base,symbol);
            var ni = names.length;
            var mods = {};
            for(var n in map) {
                names[ni] = n;
                if (resolver._setValue(map[n],names,base[symbol],n)) {
                    mods[n] = map[n];
                }
            }
            names.pop(); // return names to unchanged
            this._callListener("change",names,base[symbol],null,mods);
            //TODO parent listeners
        }
        function unmix(map) {
            var symbol = names.pop();
            var base = resolver._resolve(names,null,onundefined);
            names.push(symbol);

            if (base[symbol] === undefined) resolver._setValue({},names,base,symbol);
            var ni = names.length;
            var mods = {};

            for(var n in map) {
                names[ni] = n;
                if (resolver._setValue(undefined,names,base[symbol],n)) {
                    mods[n] = undefined;
                }
            }

            names.pop(); // return names to unchanged
            this._callListener("change",names,base[symbol],null,mods);
        }
        function empty(key) {
            var oldValue;
            if (arguments.length > 0) {
                var subnames = (typeof arguments[0] == "object")? arguments[0] : arguments[0].split(".");
                var symbol = subnames.pop();
                var base = resolver._resolve(names,subnames,onundefinedSet);
                var combined = names.concat(subnames);
                var parentName = combined.join(".");
                subnames.push(symbol);

                //TODO if typeof base != object 
                // var oldValue = base?base[symbol]:undefined;
                resolver._setValue({},names,base,symbol);

                var childRef = resolver.references[parentName + "." + symbol];
                if (childRef) childRef._callListener("change",combined,base,symbol,undefined,oldValue);
                var parentRef = resolver.references[parentName];
                if (parentRef) parentRef._callListener("change",combined,base,symbol,undefined,oldValue);

            } else {
                 var symbol = names.pop();
                var base = resolver._resolve(names,null,onundefined);
                names.push(symbol);

                resolver._setValue({},names,base,symbol);
                this._callListener("change",names,base[symbol],null,mods);
                //TODO parent listeners
           }
            // return oldValue;
        }

        function trigger(type) {
            var base = resolver._resolve(baseNames,null,onundefined);
            var value = base[leafName];

            this._callListener(type,baseNames,base,leafName,value);
            var parentRef = resolver.references[baseRefName];
            if (parentRef) parentRef._callListener(type,baseNames,_resolve(baseNames,null),leafName,value);
        }

        // type = change/load/unload
        // dest = local/session/cookie
        function stored(type,dest,options) {
            options = options || {};
            var id = "resolver." + resolver.named + "#" + name;
            if (options.id) id = options.id;
            if (options.name) id = options.name;

            if (/change/.test(type)) {
                if (this.storechanges == undefined) this.storechanges = {};
                var todo = { storage: Resolver.storages[dest], id:id, options:options };
                if (todo.storage) { todo.call = todo.storage.store; this.storechanges[dest] = todo; }
            }
            if (/^load| load/.test(type)) {
                var todo = { storage: Resolver.storages[dest], id:id, options:options };
                // read it straight away
                if (todo.storage) { todo.call = todo.storage.read; todo.call(this); }

                /* no load later should be needed
                if (this.readloads == undefined) {
                    this.readloads = {};
                    Resolver.readloads.push(this);
                }
                if (todo.storage) this.readloads[dest] = todo;
                */
            }
            if (/unload/.test(type)) {
                if (this.storeunloads == undefined) {
                    this.storeunloads = {};
                    Resolver.storeunloads.push(this);
                }
                var todo = { storage: Resolver.storages[dest], id:id, options:options };
                if (todo.storage) { todo.call = todo.storage.store; this.storeunloads[dest] = todo; }
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
        get.empty = empty;
        get.getEntry = getEntry;
        get.declareEntry = declareEntry;
        get.setEntry = setEntry;
        get.on = on;
        get.trigger = trigger;
        get.stored = stored;

        for(var n in Resolver.method.fn) {
            get[n] = Resolver.method.fn[n];
        }

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
        


        return get;
};

Resolver.method.fn.proxy = function(dest,other,src) {
    other.on("change",src,this,function(ev){
        ev.data.set(dest,ev.value);
    });

    //TODO make proxy removable
};

Resolver.method.fn.override = function(ns,options)
{
    this.namespace = ns;
    //TODO options
    return this;
};

Resolver.method.fn.destroy = function()
{
    this.root = undefined;
    this.parent = undefined;

    //TODO break down listeners
    //TODO clean up references
    for(var n in this.references) delete this.references[n];
};



Resolver.docMethod = function(name,fn) {
    Resolver.docMethod.fn[name] = fn;
    //TODO extend .docExec prototype
    for(var id in Resolver.forDoc) {
        var resolver = Resolver.forDoc[id],
            icp = resolver.InitContext.prototype;
        if (resolver[name] === undefined) resolver[name] = fn;
        if (icp[name] === undefined) icp[name] = fn.bind(resolver);
    }
};
Resolver.docMethod.fn = {};

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

Resolver._docDefaults = function(resolver) {
    var esn = resolver.namespace.essential = resolver.namespace.essential || {};
    esn.enabledRoles = esn.enabledRoles || {};
    esn.handlers = esn.handlers || { init:{}, enhance:{}, sizing:{}, layout:{}, discard:{} };

    esn.config = esn.config || {}; // from config scripts
    resolver.InitContext = function(el) { 
        this.element = el; 
        if (el) this.parentElement = el.parentElement || el.parentNode;
        this.document = resolver.namespace;
        this.resolver = resolver;
    };
    resolver.InitContext.prototype = {
        modules: esn.modules
    };
    // this._setDocMethods(resolver);
    var icp = resolver.InitContext.prototype,fn;
    for(var n in Resolver.docMethod.fn) {
        fn = Resolver.docMethod.fn[n];
        if (resolver[n] === undefined) resolver[n] = fn;
        if (icp[n] === undefined) icp[n] = fn.bind(resolver);
    }

    esn.inits = esn.inits || []; // init scripts
    esn.modules = esn.modules || {};
    esn.resources = esn.resources || {};
    esn.templates = esn.templates || {};
    esn.descriptors = esn.descriptors || {};

    esn.lang = document.documentElement.lang || "en";
    esn.locale = "en-us";
};

// Resolver._setDocMethods = function(resolver) {
// };

Resolver.storages = {};

Resolver.storages.session = {
    read: function(ref) {
        var v = sessionStorage[this.id];
        if (v != undefined) {
            var value;
            try { value = JSON.parse(v); }
            catch(ex) {} //TODO consider parse issue
            ref.set(value); //TODO call internal version that doesn't store
        }
    },
    store: function(ref) {
        //TODO if (ref is defined)
        try {
            sessionStorage[this.id] = JSON.stringify(ref());
        } catch(ex) {} //TODO consider feedback
    }
};


Resolver.storages.local = {
    read: function(ref) {
        var v;
        if (window.localStorage) v = localStorage[this.id];
        if (v != undefined) {
            var value;
            try { value = JSON.parse(v); }
            catch(ex) {} //TODO consider parse issue
            ref.set(value);//TODO call internal version that doesn't store
        }
    },

    store: function(ref) {
        //TODO if (ref is defined)
        try {
            localStorage[this.id] = JSON.stringify(ref());
        } catch(ex) { Resolver("essential::console::")().warn("Failed to read store_local = ",this.id,ex); } //TODO consider feedback
    }
};

Resolver.storages.cookie = {
    read: function(ref) {
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
            ref.set(value);//TODO call internal version that doesn't store
            delete ref._reading_cookie;
        }
    },

    store: function(ref) {
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
};

//TODO support server remote storage mechanism

