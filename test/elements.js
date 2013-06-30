module('Element constructors');

test('Basic element construction',function(){
	var HTMLElement = Resolver("essential::HTMLElement::");
	var callCleaners = Resolver("essential::callCleaners::");

	var div = HTMLElement("div",{ "class":"abc"},"<span>","abc","</span>");
	equal(div.tagName,"DIV");
	equal(div.className,"abc");
	equal(div.innerHTML.toLowerCase(),"<span>abc</span>");

	var span = HTMLElement("span",{ "id":"def"})
	equal(span.id,"def");

	callCleaners(div);
	equal(div._cleaners,undefined);
	callCleaners(null);
	callCleaners();
})

test('Script element construction',function(){
	var HTMLScriptElement = Resolver("essential::HTMLScriptElement::");

	var script = HTMLScriptElement({ "class":"abc"});
	equal(script.tagName,"SCRIPT");
	equal(script.className,"abc");

	var script = HTMLScriptElement({ "src":"abc/script.js"});
	equal(script.tagName,"SCRIPT");
	equal(script.getAttribute("src"),"abc/script.js");
	//equal(script.src,"abc/script.js");

})

test('Enhanced element config',function(){
	ok(true,"TODO configure just using data-role");
	ok(true,"TODO configure just using application/config");
	ok(true,"TODO configure combining a base from application/config and a mixin using data-role");
});

test('EnhancedDescriptor cross browser support',function(){
	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::");
	var HTMLElement = Resolver("essential::HTMLElement::");
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var sizingElements = Resolver("essential::sizingElements::");

	var div = HTMLElement("div",{ "abc":"abc" });
	var desc = EnhancedDescriptor(div,null,{},false,ApplicationConfig());
	equal(desc.uniqueId,div.uniqueId);
	equal(desc.getAttribute("abc"),"abc");

	ok(true,"TODO uniqueId works across multiple documents");
});

test('addEventListeners catch',function() {
	var HTMLElement = Resolver("essential::HTMLElement::");
	var MutableEvent = Resolver("essential::MutableEvent::");
	var addEventListeners = Resolver("essential::addEventListeners::");
	var removeEventListeners = Resolver("essential::removeEventListeners::");

	var div = HTMLElement("div",{ "class":"abc"},"<span>","abc","</span>");
	var events = {
		"click": sinon.spy(function(ev) {
			
		})
	};
	MutableEvent("click").trigger(div);
	equal(events.click.callCount,0);

	addEventListeners(div,events,false);
	MutableEvent("click").trigger(div);
	equal(events.click.callCount,1);

	removeEventListeners(div,events);
	MutableEvent("click").trigger(div);
	equal(events.click.callCount,1);
});

test('Enhance element early or delayed',function() {
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::");
	var appConfig = ApplicationConfig();


	var handlers = {
		"init": {

		},		
		"enhance": {
			"early": sinon.stub(),
			"delayed": sinon.stub(),
			"other": sinon.stub()
		},
		"sizing": {},
		"layout": {
			"early": sinon.stub(),
			"delayed": sinon.stub()
		},
		"discard": {
			"early": sinon.stub(),
			"delayed": sinon.stub()
		}
	};
	handlers.enhance.delayed.returns(false);

	Resolver("page::handlers.init").mixin(handlers.init);
	Resolver("page::handlers.enhance").mixin(handlers.enhance);
	Resolver("page::handlers.sizing").mixin(handlers.sizing);
	Resolver("page::handlers.layout").mixin(handlers.layout);
	Resolver("page::handlers.discard").mixin(handlers.discard);
	Resolver("page").set("enabledRoles",{"early":true,"delayed":true});

	var page = appConfig.page("/test/pages/a2.html",{},[
		'<html><head>', '', '</head><body>',

		'<span role="delayed" id="a"></span>',
		'<span role="early" id="b"></span>',
		'<span role="other" id="c"></span>',

		'</body>'
		].join(""));
	var delayedSpan = page.body.getElementsByTagName("span")[1];
	var earlySpan = page.body.getElementsByTagName("span")[1];
	ok(delayedSpan);
	var delayedDesc = EnhancedDescriptor.all[delayedSpan.uniqueId];
	ok(delayedDesc);
	page.applyBody();
	var delayedDesc = EnhancedDescriptor.all[delayedSpan.uniqueId];
	ok(delayedDesc);

	var sinonConfig = {}; //TODO config for the sinon elem

	equal(handlers.enhance.early.callCount,1);
	equal(handlers.enhance.delayed.callCount,1);
	equal(handlers.layout.early.callCount,0);
	equal(handlers.discard.early.callCount,0);

	ok(handlers.enhance.early.alwaysCalledWith(earlySpan,"early"));
	//TODO equal(handlers.enhance.early.args[0][2],sinonConfig);

	ok(true,"TODO additional handlers, enhance call after initial round")

	handlers.enhance.additional = sinon.stub();
	handlers.enhance.delayed.returns({});
	EnhancedDescriptor.enhanceUnfinished();
	equal(handlers.enhance.early.callCount,1,"enhance should be completed already");
	equal(handlers.enhance.delayed.callCount,2);
	equal(handlers.layout.early.callCount,0);
	equal(handlers.discard.early.callCount,0);

	var delayedDesc = EnhancedDescriptor.all[delayedSpan.uniqueId];
	ok(delayedDesc);
	ok(! delayedDesc.layout.queued);
	delayedSpan.stateful.set("state.expanded",true);
	ok(delayedDesc.layout.queued);

	//TODO all with roles are enhanced
	//TODO discard called for all enhanced

	page.unapplyBody();
	page.destroy();

	EnhancedDescriptor.discardAll();
	equal(handlers.enhance.early.callCount,1);
	equal(handlers.enhance.delayed.callCount,2);
	equal(handlers.layout.early.callCount,0);
	equal(handlers.discard.early.callCount,1,"early has been discarded");
	equal(handlers.discard.delayed.callCount,1,"delayed has been discarded");
	//TODO make sure that discardHandler for other is blank

	Resolver("page::handlers.init").unmix(handlers.init);
	Resolver("page::handlers.enhance").unmix(handlers.enhance);
	Resolver("page::handlers.sizing").unmix(handlers.sizing);
	Resolver("page::handlers.layout").unmix(handlers.layout);
	Resolver("page::handlers.discard").unmix(handlers.discard);
	Resolver("page").set("enabledRoles",{});
});

//TODO layout and discard are optional handlers

function _TestLayouter(key,el,config) {
	this.key = key;
	this.type = config.layouter;
	this.el = el;
	this.config = config;

	this.sizing = {};
}
Resolver("essential::Layouter::").variant("test-group",Generator(_TestLayouter,Resolver("essential::Layouter::"),{
	prototype:{

		sizingElement : sinon.spy(function(el,parent,child,role,conf) {
			return true;
		}),

		layout: sinon.stub()
		// function(el,layout) {
		// 	debugger;
		// }
	}
}));


test("Enhance layouter element",function() {
	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::");
	var sizingElements = Resolver("essential::sizingElements::");
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var appConfig = ApplicationConfig();

	equal(typeof Resolver("essential::Layouter.variants.test-group.generator::","undefined"),"function");

	var handlers = {
		"init": {

		},
		"enhance": {
			"early": sinon.stub()
		},
		"sizing": {},
		"layout": {
			"early": sinon.stub()
		},
		"discard": {
			"early": sinon.stub()
		}
	};
	Resolver("page::handlers.init").mixin(handlers.init);
	Resolver("page::handlers.enhance").mixin(handlers.enhance);
	Resolver("page::handlers.sizing").mixin(handlers.sizing);
	Resolver("page::handlers.layout").mixin(handlers.layout);
	Resolver("page::handlers.discard").mixin(handlers.discard);

	equal(Resolver("page")(["pages","/test/pages/a3.html"],"undefined"),undefined);

	var page = appConfig.page("/test/pages/a3.html",{},[
		'<html><head>', '', '</head><body>',

		'<span role="delayed"></span>',
		'<span data-role="',"'layouter':'test-group'",'"><em>abc</em></span>',

		'</body>'
		].join(""));
	var layouterSpan = page.body.firstChild.nextSibling;
	page.applyBody();

	equal(typeof layouterSpan.layouter,"object");
	var desc = page.resolver("descriptors")[layouterSpan.uniqueId];
	// page.body.firstChild.nextSibling.layouter
	ok(desc);
	ok(desc.enhanced || desc.layouter || desc.laidout,"Mark TestLayouter desc enhanced");
	ok(desc.layout.queued);
	
	equal(_TestLayouter.prototype.sizingElement.callCount,1);
	// var emDesc = page.resolver("descriptors")[page.body.firstChild.nextSibling.firstChild.uniqueId];
	ok(layouterSpan.firstChild.uniqueId);
	var emDesc = EnhancedDescriptor.all[layouterSpan.firstChild.uniqueId];
	ok(emDesc);
	equal(sizingElements[emDesc.uniqueId],emDesc);
	equal(emDesc.layouterParent,desc);

	EnhancedDescriptor.refreshAll();
	equal(_TestLayouter.prototype.layout.callCount,1);
	//TODO test no queued layout.queued
	//TODO sizing values
	//TODO sizing object in stateful is the one from EnhancedElement

	page.unapplyBody();
	page.destroy();
	EnhancedDescriptor.discardAll();
	Resolver("page::handlers.init").unmix(handlers.init);
	Resolver("page::handlers.enhance").unmix(handlers.enhance);
	Resolver("page::handlers.sizing").unmix(handlers.sizing);
	Resolver("page::handlers.layout").unmix(handlers.layout);
	Resolver("page::handlers.discard").unmix(handlers.discard);
	Resolver("page").set("enabledRoles",{});
});


test("Effective Element Role",function() {

	var HTMLElement = Resolver("essential::HTMLElement::"),
		StatefulResolver = Resolver("essential::StatefulResolver::"),
		effectiveRole = Resolver("essential::effectiveRole::");
	var MutableEvent = Resolver("essential::MutableEvent::");

	equal(effectiveRole(HTMLElement("div",{})),"default");
	equal(effectiveRole(HTMLElement("div",{"role":"button"})),"button");
	equal(effectiveRole(HTMLElement("input",{"type":"range"})),"slider");
	equal(effectiveRole(HTMLElement("select",{})),"listbox");

	var div = HTMLElement("div",{ "class":"abc"});
	StatefulResolver(div).set("impl.role","presenter");
	equal(effectiveRole(div),"presenter");

	var div = HTMLElement("div",{ "class":"abc"});
	StatefulResolver(div);
	equal(effectiveRole(div),"default");
	equal(StatefulResolver(div)("impl","undefined"),undefined);

	var button = HTMLElement("button",{"type":"button"});
	var ev = MutableEvent({ target: button }).withActionInfo();
	equal(ev.commandRole,"button");
	equal(ev.commandElement,button);
});

function makeFieldSpy() {
	var fieldSpy = sinon.spy();
	fieldSpy.prototype.destroy = sinon.spy();
	fieldSpy.prototype.discard = sinon.spy();
	return fieldSpy;
}

function makeFieldGenerator(a,b) {
	var g = Generator(a,b);
	g.prototype.__destroy = g.prototype.destroy;
	g.prototype.__discard = g.prototype.discard;
	g.prototype.destroy = function() {
		++g.prototype.destroy.callCount;
		if (this.__destroy) this.__destroy();
	};
	g.prototype.destroy.callCount = 0;
	g.prototype.discard = function() {
		++g.prototype.discard.callCount;
		if (this.__discard) this.__discard();
	};
	g.prototype.discard.callCount = 0;

	function g2(a,b,c) {
	    var instance = g.call(null,a,b,c);
	    instance.destroy = g.prototype.destroy;
	    instance.discard = g.prototype.discard;
	    return instance;
	}
	g2.prototype = g.prototype;
	return g2; 
}

test("Enhancing elements creating stateful fields",function() {

	var enhanceStatefulFields = Resolver("essential::enhanceStatefulFields::");
	var StatefulField = Resolver("essential::StatefulField::");
	var buttonField = StatefulField.variant("*[role=button]");
	var linkField = StatefulField.variant("*[role=link]");
	var createDocument = Resolver("essential::createHTMLDocument::");

	notEqual(buttonField,StatefulField);

	var buttonFieldSpy = sinon.spy();
	var submitFieldSpy = sinon.spy();
	var resetFieldSpy = sinon.spy();
	var linkFieldSpy = sinon.spy();
	var buttonField = StatefulField.variant("*[role=button]",makeFieldGenerator(buttonFieldSpy,buttonField));
	StatefulField.variant("button[type=button]",buttonField);
	var submitField = StatefulField.variant("button[type=submit]",makeFieldGenerator(submitFieldSpy,StatefulField));
	var resetField = StatefulField.variant("button[type=reset]",makeFieldGenerator(resetFieldSpy,StatefulField));
	var linkField = StatefulField.variant("*[role=link]",makeFieldGenerator(linkFieldSpy,linkField));
	var doc = createDocument([],[
		'<span role="navigation">',
		'<a name="x" role="link"></a>',
		'<span name="z" role="link"></span>',

		'<button name="a" role="button"></button>',
		'<button name="b" role="button"></button>',
		'<button name="c" role="button"></button>',
		'<button name="d" type="submit"></button>',
		'<button name="e" type="reset"></button>',
		'<button name="f" type="button"></button>',
		'</span>'
		]);
	//TODO expect calls with each of the elements
	enhanceStatefulFields(doc.body);
	equal(buttonFieldSpy.callCount,4);
	equal(submitFieldSpy.callCount,1);
	equal(resetFieldSpy.callCount,1);
	equal(linkFieldSpy.callCount,2);
	ok(doc.body.firstChild.childNodes[0].stateful);
	ok(doc.body.firstChild.childNodes[1].stateful);
	ok(doc.body.firstChild.childNodes[2].stateful);
	ok(doc.body.firstChild.childNodes[3].stateful);
	ok(doc.body.firstChild.childNodes[4].stateful);
	ok(doc.body.firstChild.childNodes[5].stateful);

	// destroy called for fields
	Resolver("essential")("cleanRecursively")(doc.body);
	equal(linkField.prototype.destroy.callCount,2);
	equal(linkField.prototype.discard.callCount,2);
	equal(buttonField.prototype.destroy.callCount,4);
	equal(buttonField.prototype.discard.callCount,4);
});

/* TODO what do we want to test here without hacking the handlers 
  and considering enhancedRoles.dialog = true

test('Enhancing Document Roles with builtin handlers',function(){
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::");
	var appConfig = ApplicationConfig();
	var pageHandlers = Resolver("page::handlers::");

	var handlers = {
		"enhance": {
			"dialog": sinon.spy(pageHandlers.enhance.dialog),// ,
			"navigation": sinon.spy(pageHandlers.enhance.toolbar),// ,
			"spinner": sinon.spy(pageHandlers.enhance.spinner),// ,
			"application": sinon.spy(pageHandlers.enhance.application)// 
		},
		"sizing": {},
		"layout": {
			"dialog": sinon.spy(),// pageHandlers.layout.dialog,
			"navigation": sinon.spy(),// pageHandlers.layout_toolbar,
			"spinner": sinon.spy(),// pageHandlers.layout_spinner,
			"application": sinon.spy()// pageHandlers.layout_application
		},
		"discard": {
			"dialog": sinon.spy(),// pageHandlers.discard_dialog,
			"navigation": sinon.spy(),// pageHandlers.discard_toolbar,
			"spinner": sinon.spy(),// pageHandlers.discard_spinner,
			"application": sinon.spy()// pageHandlers.discard_application
		}
	};
	Resolver("page::handlers.init").mixin(handlers.init);
	Resolver("page::handlers.enhance").mixin(handlers.enhance);
	Resolver("page::handlers.sizing").mixin(handlers.sizing);
	Resolver("page::handlers.layout").mixin(handlers.layout);
	Resolver("page::handlers.discard").mixin(handlers.discard);

	var page = appConfig.page("/test/pages/a4.html",{},[
		'<html><head>', '', '</head><body>',

		'<span role="navigation">',
		'<button name="a"></button>',
		'</span>',

		'</body>'
		].join(""));

	page.applyBody();

	equal(handlers.enhance.navigation.callCount,1);
	equal(handlers.layout.navigation.callCount,0);
	equal(handlers.discard.navigation.callCount,0);

	EnhancedDescriptor.enhanceUnfinished();
	equal(handlers.enhance.navigation.callCount,1,"enhance should be completed already");
	equal(handlers.layout.navigation.callCount,0);
	equal(handlers.discard.navigation.callCount,0);


	// Submit buttons turned into ordinary
	var buttons = page.body.getElementsByTagName("BUTTON");
	for(var i=0,button; button=buttons[i]; ++i) {
		equal(button.type,"button");
	}

	//TODO _resize_descs
	//TODO _layout_descs

	//TODO all with roles are enhanced
	//TODO discard called for all enhanced

	page.unapplyBody();
	page.destroy();

	EnhancedDescriptor.discardAll();
	//TODO Resolver("page::handlers").unmix(handlers);
	Resolver("page").set("enabledRoles",{});
});
*/

test('Discarding enhanced',function() {

	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::");
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	// var force = true;
	// var desc = EnhancedDescriptor(document.body,"application",{},force,ApplicationConfig());
	// desc.enhanced = true;
	// desc.liveCheck();
	// ok(!desc.discarded,"liveCheck on document.body doesn't discard");
	// document.body.stateful = null;
	// desc.discardNow();
	// document.body.stateful = ApplicationConfig().resolver;

	ok(1,"Discard handler called when discarded");

	ok(1,"Maintain will discard unattached elements");

	ok(1,"Maintain all will not discard elements (especially body) being enhanced");

	EnhancedDescriptor.discardAll();
})

test('Template cloneNode',function() {

	equal(typeof Resolver("page::templates::",undefined),"object");

	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::");
	var HTMLElement = Resolver("essential::HTMLElement::","null");
	ok(HTMLElement,"HTMLElement");
	var enhance_template = Resolver("page::handlers.enhance.template::","null");
	equal(typeof enhance_template,"function","enhance_template");


	var div = HTMLElement("div",{},"abc<span>def</span>");
	var tplAbcNew = enhance_template(div,"template",{ id:"abc" });
	ok(tplAbcNew);
	equal(tplAbcNew,Resolver("page")(["templates","#abc"],"undefined"));

	var tplAbc = Resolver("page")(["templates","#abc"],"undefined"); //TODO Resolver("templates")("#abc"); ?
	ok(tplAbc);
	equal(tplAbc,tplAbcNew);

	var cloned = tplAbc.content.cloneNode(true);
	// ok(isDocumentFragment(cloned));
	equal(cloned.childNodes[0].data,"abc");
	equal(cloned.childNodes[1].innerHTML,"def");

	var tpl2 = HTMLElement("template",{ id:"tpl2" }, "abc<span>def</span>");
	// document.body.appendChild(tpl2);
	// (tpl2.content || tpl2).appendChild(document.createTextNode("abc"));
	// (tpl2.content || tpl2).appendChild(HTMLElement("span",{},"def"));
	enhance_template(tpl2,"template",{ id:"2" });

	var cloned2 = tpl2.content.cloneNode(true);
	equal(cloned2.childNodes[0].data,"abc");
	equal(cloned2.childNodes[1].innerHTML,"def");
	// document.body.removeChild(tpl2);

	// Cloning template loaded in page
	var conf = ApplicationConfig();
	var tpl3 = document.getElementById("abcd");
	var desc3 = EnhancedDescriptor(tpl3,"template",{},false,conf);

	enhance_template(tpl3,"template",{}); //TODO call on descriptor

	var cloned3 = tpl3.content.cloneNode(true);
	equal(cloned3.childNodes[0].data,"hello");
	equal(cloned3.childNodes[1].innerHTML,"there");
	equal(cloned3.childNodes[2].data,"how");
	equal(cloned3.childNodes[3].innerHTML,"are");

			//TODO anonymous template tag

	//TODO test querySelector template lookup

})

test('Role navigation action',function(){
	var DialogAction = Resolver("essential::DialogAction::");
	var pageHandlers = Resolver("page::handlers::");
	var ApplicationConfig = Resolver("essential::ApplicationConfig::");
	var appConfig = ApplicationConfig();
	var fireAction = Resolver("essential::fireAction::");

	function ABC_DialogAction() {

	}
	ABC_DialogAction.prototype.button1 = sinon.spy();
	DialogAction.variant("a/b/c",Generator(ABC_DialogAction,DialogAction));

	function DEF_DialogAction() {

	}
	DEF_DialogAction.prototype.button2 = sinon.spy();
	DialogAction.variant("d/e/f",Generator(DEF_DialogAction,DialogAction));

	var handlers = {
		"enhance": {
			"navigation": pageHandlers.enhance.toolbar
		},
		"sizing": {},
		"layout": {
			"navigation": pageHandlers.layout.toolbar
		},
		"discard": {
			"navigation": pageHandlers.discard.toolbar
		}
	};
	Resolver("page::handlers.init").mixin(handlers.init);
	Resolver("page::handlers.enhance").mixin(handlers.enhance);
	Resolver("page::handlers.sizing").mixin(handlers.sizing);
	Resolver("page::handlers.layout").mixin(handlers.layout);
	Resolver("page::handlers.discard").mixin(handlers.discard);

	var page = appConfig.page("/test/pages/a5.html",{},[
		'<html><head>', '', '</head><body>',

		'<span role="navigation" action="a/b/c">',
		'<button name="button1" role="button"></button>',
		'</span>',
		'<button name="button2" role="button" action="d/e/f"></button>',

		'</body>'
		].join(""));

	var dialog = page.body.firstChild;

	page.applyBody();

	//page.body.firstChild.firstChild.click();
	//simulateClick(page.body.firstChild);//.firstChild);
	dialog.submit({ commandElement: dialog.firstChild, actionElement:dialog, action:"a/b/c", commandName:"button1" });
	ok(ABC_DialogAction.prototype.button1.called);
	fireAction({ commandElement: dialog.nextSibling, actionElement:dialog.nextSibling, action: "d/e/f", commandName: "button2" });
	ok(DEF_DialogAction.prototype.button2.called);

	//TODO events that might trigger actions are extended with action info and filtered through
	// permissions and routers

	//TODO assert action(el,ev)
	page.unapplyBody();
	page.destroy();

	EnhancedDescriptor.discardAll();
	Resolver("page::handlers.init").unmix(handlers.init);
	Resolver("page::handlers.enhance").unmix(handlers.enhance);
	Resolver("page::handlers.sizing").unmix(handlers.sizing);
	Resolver("page::handlers.layout").unmix(handlers.layout);
	Resolver("page::handlers.discard").unmix(handlers.discard);
	Resolver("page").set("enabledRoles",{});
});


test("Language choice",function(){
	var pager = Resolver("page");

	equal(pager("state.lang"),"en");
	pager.set("state.lang","de");
	equal(document.documentElement.lang,"de");
	pager.set("state.lang","fr");
	equal(document.documentElement.lang,"fr");

});

