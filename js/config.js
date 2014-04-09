Resolver.document.set("enhanced", { //TODO back to declare
	enabledRoles: {},
	handlers: { init:{}, enhance:{}, sizing:{}, layout:{}, discard:{} },
	config: {},
	inits: [],
	modules: {},
	templates: {},
	descriptors: {}
});

// set("bodyResolver")

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
			ref = resolver.reference("enhanced.config","null");

		// mixin the declared config
		if (key) {
			var declared = ref(key);
			if (declared) {
				config = {};
				for(var n in declared) config[n] = declared[n];
			}
		}

		if (el == doc.body) {
			var declared = ref("body");
			if (declared) {
				config = config || {};
				for(var n in declared) config[n] = declared[n];
			}
		}
		else if (el == doc.head) {
			var declared = ref("head");
			if (declared) {
				config = config || {};
				for(var n in declared) config[n] = declared[n];
			}
		}

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


