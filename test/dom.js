module("DOM API helpers");

test("Document Creations",function() {
	var createHTMLDocument = Resolver("essential::createHTMLDocument::");

	var doc = createHTMLDocument('<!DOCTYPE html><html><head id="a1" attr="a1"></head><body id="a2" attr="a2"></body></html>');
	equal(doc.head.id,"a1");
	equal(doc.head.getAttribute("attr"),"a1");
	equal(doc.body.id,"a2");
	equal(doc.body.getAttribute("attr"),"a2");

	var doc = createHTMLDocument('<!DOCTYPE html "HTML 4.0"><html><head id="a1" attr="a1"></head><body id="a2" attr="a2"></body></html>');
	equal(doc.head.id,"a1");
	equal(doc.head.getAttribute("attr"),"a1");
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

	var doc = createHTMLDocument('<link id="a1" attr="a1">','<div id="a2" attr="a2"></div>');
	ok(doc.head.firstChild,"Head content");
	equal(doc.head.firstChild.id,"a1");
	equal(doc.head.firstChild.getAttribute("attr"),"a1");
	ok(doc.body.firstChild,"Head content");
	equal(doc.body.firstChild.id,"a2");
	equal(doc.body.firstChild.getAttribute("attr"),"a2");


	var doc = createHTMLDocument("",'<body id="a2" attr="a2"></body>');
	equal(doc.body.id,"a2");
	equal(doc.body.getAttribute("attr"),"a2");
	//TODO test the construction in IE
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
	equal(div.innerHTML,"abc<span>def</span>ghi");
	equal(div.childNodes.length,3)
	equal(div.childNodes[0].nodeName,"#text")
	equal(div.childNodes[1].innerHTML,"def")
	equal(div.childNodes[2].nodeName,"#text")
})

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

test("jQuery trigger click",function() {
    expect(1);
    
    function Clicker(target) {
        this.target = target;
        
        this.target.off("click").on("click",function(ev) {
            ok(1,"did the click");
        });
    }
    
  var event,
      $doc = $( document ),
      keys = new Clicker( $doc );
 
  // trigger event
  event = $.Event( "click" );
  event.button = 0;
  $doc.trigger( event );

});

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
});    

