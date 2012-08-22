// types for describing generator arguments and generated properties
(function(win){
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

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

	var nativeClassList = !!document.documentElement.classList;

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

	//TODO why doesn't this seem to be called for String(ArraySet) ?
	ArraySet.prototype.toString = function() {
		return this.join(this.separator);
	};

	function _DOMTokenList() {

	}
	essential.set("DOMTokenList",Generator(_DOMTokenList,ArraySet,Array)); //TODO support this

	// use this for native DOMTokenList
	_DOMTokenList.set = function(as,id,value) {
		if (typeof id == "object"); //TODO set map removing rest
		if (value) { // set true
			as.add(id);
		} else { // set false
			as.remove(id);
		}
	};
	essential.set("DOMTokenList.set",_DOMTokenList.set);

	_DOMTokenList.mixin = function(dtl,mix) {
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
	essential.set("DOMTokenList.mixin",_DOMTokenList.mixin);

	_DOMTokenList.eitherClass = function(el,trueName,falseName,value) {
		var classList = el.classList;
		var removeName = value? falseName:trueName;
		var addName = value? trueName:falseName;
		if (removeName) classList.remove(removeName);
		if (addName) classList.add(addName);
		if (!nativeClassList)
		 {
			el.className = el.classList.toString();
		}
	}
	essential.set("DOMTokenList.eitherClass",_DOMTokenList.eitherClass);
	

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

	var _readyFired = false;

	function fireDomReady()
	{
		if (_readyFired) return;
		_readyFired = true;
		
		essential("_queueDelayedAssets")();
		essential.set("_queueDelayedAssets",function(){});

		instantiatePageSingletons();
	}
	function fireLoad()
	{
		
	}
	function fireUnload()
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
			win.addEventListener("unload",fireUnload,false);
		} else {
			win.attachEvent("onunload",fireUnload);
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
		proxyConsole["group"] = function() { no_logging("group",arguments); };
		proxyConsole["groupEnd"] = function() { no_logging("groupEnd",arguments); };
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

