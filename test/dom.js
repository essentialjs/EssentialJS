module("DOM API helpers");

test("Sub Document Creations",function() {
	var importHTMLDocument = Resolver("essential::importHTMLDocument::");

	var doc = importHTMLDocument('<!DOCTYPE html><html><head id="a1" attr="a1"><meta charset="utf-8"></head><body id="a2" attr="a2"><div id="first-id"></div></body></html>');
	ok(doc.uniqueID);
	equal(doc.head.id,"a1");
	equal(doc.head.getAttribute("attr"),"a1");
	if (! /MSIE 8/.test(navigator.userAgent)) equal(doc.head.firstChild.getAttribute("charset"),"utf-8");
	equal(doc.body.id,"a2");
	equal(doc.body.getAttribute("attr"),"a2");

	equal(doc.body.ownerDocument,document,"Imported owner to main document");
	ok(doc.body.querySelector("#first-id"));

	var doc = importHTMLDocument('<!DOCTYPE html><html><head id="a1" attr="a1"><meta charset="utf-8"></head>'+
			'<body id="a2" attr="a2"><header><h1></h1></header><article><section>section</section></article><footer>footer<q>q</q></footer></body></html>');
	ok(doc.uniqueID);
	equal(doc.body.childNodes[0].tagName.toLowerCase(),"header");	
	equal(doc.body.childNodes[1].tagName.toLowerCase(),"article");	
	equal(doc.body.childNodes[2].tagName.toLowerCase(),"footer");	
	equal(doc.body.childNodes.length,3);	

});

test("Document Creations",function() {
	var createHTMLDocument = Resolver("essential::createHTMLDocument::");

	var doc = createHTMLDocument('<!DOCTYPE html><html><head id="a1" attr="a1"><meta charset="utf-8"></head><body id="a2" attr="a2"></body></html>');
	ok(doc.uniqueID);
	equal(doc.head.id,"a1");
	equal(doc.head.getAttribute("attr"),"a1");
	if (! /MSIE 8/.test(navigator.userAgent)) equal(doc.head.firstChild.getAttribute("charset"),"utf-8");
	equal(doc.body.id,"a2");
	equal(doc.body.getAttribute("attr"),"a2");

	var doc = createHTMLDocument('<!DOCTYPE html "HTML 4.0"><html><head id="a1" attr="a1"><meta charset="utf-8"></head><body id="a2" attr="a2"></body></html>');
	equal(doc.head.id,"a1");
	equal(doc.head.getAttribute("attr"),"a1");
	if (! /MSIE 8/.test(navigator.userAgent)) equal(doc.head.firstChild.getAttribute("charset"),"utf-8");
	equal(doc.body.id,"a2");
	equal(doc.body.getAttribute("attr"),"a2");

	var doc = createHTMLDocument('<html><head id="a1" attr="a1"></head><body id="a2" attr="a2"></body></html>');
	equal(doc.head.id,"a1");
	equal(doc.head.getAttribute("attr"),"a1");
	equal(doc.body.id,"a2");
	equal(doc.body.getAttribute("attr"),"a2");

	var doc = createHTMLDocument('<head id="a1" attr="a1"></head>','<body id="a2" attr="a2"></body>');
	equal(doc.head.id,"a1");
	equal(doc.head.getAttribute("attr"),"a1");
	equal(doc.body.id,"a2");
	equal(doc.body.getAttribute("attr"),"a2");

	var doc = createHTMLDocument('<link rel="next" href="next.html">','<div id="a2" attr="a2"></div>');
	ok(doc.uniqueID);
	if (! /MSIE 8/.test(navigator.userAgent)) {
		//TODO try to find a way to make link elements work
		ok(doc.head.firstChild,"Head content");
		equal(doc.head.firstChild.getAttribute("rel"),"next");
		equal(doc.head.firstChild.getAttribute("href"),"next.html");
	}
	ok(doc.body.firstChild,"Head content");
	equal(doc.body.firstChild.id,"a2");
	equal(doc.body.firstChild.getAttribute("attr"),"a2");


	var doc = createHTMLDocument("",'<body id="a2" attr="a2"></body>');
	ok(doc.uniqueID);
	equal(doc.body.id,"a2");
	equal(doc.body.getAttribute("attr"),"a2");
	//TODO test the construction in IE

	var spans = '<span id="a" role="delayed"></span><span id="b" role="early"></span>';
	var doc = createHTMLDocument(spans);
	equal(doc.body.innerHTML.toLowerCase().replace(/"/g,""),spans.replace(/"/g,""));
});

test("HTMLElement construction",function(){
	var HTMLElement = Resolver("essential::HTMLElement::");

	var div = HTMLElement("div");
	ok(div, "Created DIV element");
	equal(div.tagName,"DIV");
	equal(div.childNodes.length,0)

	var div = HTMLElement("div",null);
	ok(div);
	equal(div.tagName,"DIV");
	equal(div.childNodes.length,0)
	
	var div = HTMLElement("div",{});
	ok(div);
	equal(div.tagName,"DIV");
	equal(div.childNodes.length,0)
	
	var div = HTMLElement("div",{ "class":"test", "id":"myId", "name":"myName" });
	ok(div);
	equal(div.className,"test");
	equal(div.id,"myId")
	equal(div.getAttribute("name"),"myName")

	var br = HTMLElement("a",{ "class":"break"},"...");
	ok(br,"Created BR element");
	//ok(! br.innerHTML);
	equal(br.className,"break");
	//TODO equal(outerHtml(br),'<br class="break">')

	var div = HTMLElement("div",{},"abc","<span>","def","</span>","ghi");
	ok(div);
	equal(div.tagName,"DIV");
	equal(div.innerHTML.toLowerCase(),"abc<span>def</span>ghi");
	equal(div.childNodes.length,3)
	equal(div.childNodes[0].nodeName,"#text")
	equal(div.childNodes[1].innerHTML,"def")
	equal(div.childNodes[2].nodeName,"#text")

	if (!/ MSIE /.test(navigator.userAgent)) {
		var range = HTMLElement("input",{type:"range"});
		equal(range.tagName,"INPUT");
		equal(range.getAttribute("type"),"range");
	}

	var range = HTMLElement("input",{type:"date"});
	equal(range.tagName,"INPUT");
	equal(range.getAttribute("type"),"date");

	var range = HTMLElement("input",{type:"time"});
	equal(range.tagName,"INPUT");
	equal(range.getAttribute("type"),"time");

	var range = HTMLElement("input",{type:"number"});
	equal(range.tagName,"INPUT");
	equal(range.getAttribute("type"),"number");
})

test("HTMLElement core implementation set text",function() {

	var HTMLElement = Resolver("essential::HTMLElement::");

	var div = HTMLElement("div",{},"");
	equal(div.innerHTML.toLowerCase(),"");
	HTMLElement.fn.setPostfix(div,"abcd");
	equal(div.innerHTML.toLowerCase(),"abcd");

	var div = HTMLElement("div",{},"xx");
	equal(div.innerHTML.toLowerCase(),"xx");
	HTMLElement.fn.setPostfix(div,"abcd");
	equal(div.innerHTML.toLowerCase(),"abcd");

	var div = HTMLElement("div",{},"<span></span>");
	equal(div.innerHTML.toLowerCase(),"<span></span>");
	HTMLElement.fn.setPostfix(div,"abcd");
	equal(div.innerHTML.toLowerCase(),"<span></span>abcd");

	var div = HTMLElement("div",{},"1<span></span>2");
	equal(div.innerHTML.toLowerCase(),"1<span></span>2");
	HTMLElement.fn.setPostfix(div,"abcd");
	equal(div.innerHTML.toLowerCase(),"1<span></span>abcd");


	var div = HTMLElement("div",{},"");
	equal(div.innerHTML.toLowerCase(),"");
	HTMLElement.fn.setPrefix(div,"abcd");
	equal(div.innerHTML.toLowerCase(),"abcd");

	var div = HTMLElement("div",{},"xx");
	equal(div.innerHTML.toLowerCase(),"xx");
	HTMLElement.fn.setPrefix(div,"abcd");
	equal(div.innerHTML.toLowerCase(),"abcd");

	var div = HTMLElement("div",{},"<span></span>");
	equal(div.innerHTML.toLowerCase(),"<span></span>");
	HTMLElement.fn.setPrefix(div,"abcd");
	equal(div.innerHTML.toLowerCase(),"abcd<span></span>");

	var div = HTMLElement("div",{},"1<span></span>2");
	equal(div.innerHTML.toLowerCase(),"1<span></span>2");
	HTMLElement.fn.setPrefix(div,"abcd");
	equal(div.innerHTML.toLowerCase(),"abcd<span></span>2");
});

test("HTMLElement smarts",function() {

	var HTMLElement = Resolver("essential::HTMLElement::");

	var div = HTMLElement("div",{
		"make stateful":true		
	},"");

	ok(div.stateful,"make stateful flag adds resolver to new element");
	ok(div.stateful("map.class","null"),"class mapping");

	var div = HTMLElement("div",{
		"make stateful":false		
	},"");

	ok(div.stateful,"make stateful flag adds resolver to new element");
	ok(! div.stateful("map.class","null"),"no class mapping");


	var child = HTMLElement("div",{
		"append to": div
	});
	equal(child.parentNode,div,"append to appends the new element")

	var div = HTMLElement("div",{
		"enhanced element":true		
	},"");

});

test("Native events",function() {
	// ok(1); return;

	// target not applied to synthetic event until fire

	var HTMLElement = Resolver("essential::HTMLElement::");
	var MutableEvent = Resolver("essential::MutableEvent::");

	var div = HTMLElement("div");
    var ev = MutableEvent("click",{target:div});
    equal(ev.type,"click");
    // equal(ev.target,div);

    var ev2 = MutableEvent(ev._original || ev);
    // equal(ev.target,div);

});

asyncTest("jQuery trigger click",function() {
    // expect(1);

	function onClick(ev) {
        ok(true,"did the click");
        start();
	}    
    function Clicker(target) {
        this.target = target;
        
        this.target.one("click",onClick);
    }
    
  var event,
      $doc = $( document ),
      keys = new Clicker( $doc );
 
  // trigger event
  event = $.Event( "click" );
  event.button = 0;
  $doc.trigger( event );

});

test("MutableEvent construction mousemove",function() {
	var HTMLElement = Resolver("essential::HTMLElement::");
	var MutableEvent = Resolver("essential::MutableEvent::");

	var div = HTMLElement("div");
	document.body.appendChild(div);

	function onmousemove(ev) {

		var event = MutableEvent(ev);
		equal(event.target,div);
		//TODO addEventListeners pass currentTarget equal(event.currentTarget,div);
		equal(event.type,"mousemove");

	}	

	if (div.addEventListener) div.addEventListener("mousemove",onmousemove,false);
	else if (div.attachEvent) div.attachEvent("onmousemove",onmousemove);

	MutableEvent("mousemove").trigger(div);

    document.body.removeChild(div);
})

test("MutableEvent construction click",function(){
	var HTMLElement = Resolver("essential::HTMLElement::");
	var MutableEvent = Resolver("essential::MutableEvent::");

	var div = HTMLElement("div");
	document.body.appendChild(div);

	function onclick(ev) {
		var event = MutableEvent(ev);
		equal(event.target,div);
		//TODO addEventListeners pass currentTarget equal(event.currentTarget,div);
		equal(event.type,"click");
	}

	if (div.attachEvent) div.attachEvent("onclick",onclick);
	else if (div.addEventListener) div.addEventListener("click",onclick,false);

	MutableEvent("click").trigger(div);
	
    MutableEvent("click",{ view:window, detail:0,
    	screenX:0,screenY:0,clientX:0,clientY:0,
    	ctrlKey:false, altKey:false, shiftKey:false, metaKey:false,
    	button:0, relatedTarget: undefined
    }).trigger(div);

    document.body.removeChild(div);
});

test("MutableEvent preventDefault & stopPropagation",function() {
    expect(1); //2
	var HTMLElement = Resolver("essential::HTMLElement::");
	var MutableEvent = Resolver("essential::MutableEvent::");

	var div = HTMLElement("div");
	document.body.appendChild(div);

	function onclick(ev) {
		var event = MutableEvent(ev);
        event.stopPropagation();
        event.preventDefault()
        //TODO ok(event.isDefaultPrevented(),"Didn't prevent default behavior");
        ok(1,"No issues yet");
	}

	if (div.attachEvent) div.attachEvent("onclick",onclick);
	else if (div.addEventListener) div.addEventListener("click",onclick);

    MutableEvent("click").trigger(div);

    document.body.removeChild(div);
});    

asyncTest("Element Placement",function() {
	var HTMLElement = Resolver("essential::HTMLElement::");
	var ElementPlacement = Resolver("essential::ElementPlacement::");

	var nil = ElementPlacement();
	ok(nil,"nil placement doesn't blow up");

	var div = HTMLElement("div",{"append to":document.body});
	var pageBr = HTMLElement("br",{"class":"page","append to":document.body});

	setTimeout(function(){
		nil.compute(div);
		equal(nil.style.display,"block","measuring of custom element");

		var noBounds = ElementPlacement(div,["breakBefore","breakAfter"],false);
		equal(noBounds.bounds.top,undefined);
		equal(noBounds.bounds.bottom,undefined);
		equal(noBounds.style.marginLeft,undefined);
		equal(noBounds.style.marginRight,undefined);

		//TODO support
		// equal(typeof noBounds.style.breakBefore,"string");
		// equal(typeof noBounds.style.breakAfter,"string");

		div.setAttribute("style",'page-break-before:always;'); //TODO "column"
		noBounds.compute();
		equal(noBounds.style.breakBefore,"always","get the inline break style");

		var brPlacement = ElementPlacement(pageBr,["breakBefore","breakAfter"],false);
		equal(brPlacement.style.breakAfter,"always","br.page breaks page after");

		var placement = ElementPlacement(div);
		equal(placement.style.visibility.replace("inherit","visible"),"visible");
		equal(placement.style.marginLeft,"0px");
		equal(placement.style.marginRight,"0px");
		equal(placement.style.marginTop,"0px");
		equal(placement.style.marginBottom,"0px");

		//TODO 
		equal(placement.bounds.top,placement.bounds.bottom);
		equal(placement.bounds.height,0);

		//TODO refactor Webkit fix
		/*
			applies if value has %
		*/

	    document.body.removeChild(div);
	    document.body.removeChild(pageBr);
	    start();
	},50);

})

test("JSON2Attr data-role construction",function() {
	var JSON2Attr = Resolver("essential::JSON2Attr::");

	equal(JSON2Attr({a:"a",b:"b"}),'"a":"a","b":"b"');
	equal(JSON2Attr({a:"a",b:"b"},{a:true}),'"b":"b"');
	equal(JSON2Attr({}),"");
	equal(JSON2Attr({id:'abc',"laidout":"laidout2","layouter":"layouter1"}),'"id":"abc","laidout":"laidout2","layouter":"layouter1"');
})

