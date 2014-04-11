

// set("bodyResolver")

Resolver.docMethod("require",function(path) {
    if (this("enhanced.modules")[path] == undefined) {
        var ex = new Error("Missing module '" + path + "'");
        ex.ignore = true;
        throw ex;   
    } 
});

	//TODO resolver.exec("callInits",null)
Resolver.docMethod("callInits",function() {
	var inits = this("enhanced.inits");
	for(var i=0,fn; fn = inits[i]; ++i) if (!fn.done) {
		try {
			fn.call(fn.context || {});
			fn.done = true;
		} catch(ex) {
			// debugger;
		} //TODO only ignore ex.ignore
	}
});

/* 
	Resolver.config(document,'declare(..); declare("..")');
	var conf = Resolver.config(el)
*/
Resolver.config = function(el,script) {
	var log = Resolver("essential::console::")();
	var _singleQuotesRe = new RegExp("'","g");


	function _getRoleConfig(resolver, el,key) {
		//TODO cache the config on element.stateful

		var config = null, doc = resolver.namespace,
			ref = resolver.reference("enhanced.config","null"),
			appliedConfig = resolver("enhanced.appliedConfig");

		function eitherConfig(key) {
			for(var n in appliedConfig) 
				if (appliedConfig[n] && appliedConfig[n][key]) return appliedConfig[n][key];
			return ref(key);
		}

		function mixinConfig(config,key) {
			var declared = eitherConfig(key);
			if (declared) {
				config = config || {};
				for(var n in declared) config[n] = declared[n];
			}
			return config;
		}

		// mixin the declared config
		if (key) config = mixinConfig(config,key);
		if (el.nodeName == "HEAD" || el.nodeName == "BODY") config = mixinConfig(config,el.nodeName.toLowerCase());

		// mixin the data-role
		var dataRole = el.getAttribute("data-role");
		if (dataRole) try {
			config = config || {};
			//TODO alternate CSS like syntax
			var map = JSON.parse("{" + dataRole.replace(_singleQuotesRe,'"') + "}");
			for(var n in map) config[n] = map[n];
		} catch(ex) {
			log.debug("Invalid config: ",dataRole,ex);
			config["invalid-config"] = dataRole;
		}

		return config;
	}


	var doc = el.nodeType == 9? el : el.ownerDocument, docResolver = Resolver(doc);
	if (docResolver == null) return null; // if not known document

	if (script) {
		if (typeof script == "string") script = Resolver.functionProxy(script);
		var context = docResolver.reference("enhanced.config");
		//TODO extend the reference with additional api
		try {
			script.call(context);
		} catch(ex) {
			Resolver("essential::console::")().error("Failed to parse application/config",s.text);
		}

	} else {
		if (el.id) {
			return _getRoleConfig(docResolver, el,el.id);
		}
		var name;
		try {
			name = el.getAttribute("name");
		}
		catch(ex) { // access denied
			return null;
		}
		if (name) {
			var p = el.parentNode;
			while(p && p.tagName) {
				if (p.id) {
					return _getRoleConfig(docResolver, el,p.id + "." + name);
				} 
				p = p.parentNode;
			} 
		}
		return _getRoleConfig(docResolver, el);
	}
};


