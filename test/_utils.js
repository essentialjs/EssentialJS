
var bElementClickWorks = false; //Ext.isIE;

var eventToModule = {
    "DOMFocusIn":"UIEvent", "DOMFocusOut":"UIEvent", "DOMActivate":"UIEvent",
    
    "mousedown":"MouseEvent","mouseup":"MouseEvent","mouseover":"MouseEvent",
    "mousemove":"MouseEvent","mouseout":"MouseEvent", "click":"MouseEvent",
    
    "load":"Event", "unload":"Event", "resize":"Event", "scroll":"Event",
    "abort":"Event", "error":"Event", "select":"Event",
    "change":"Event", "submit":"Event",
    "reset":"Event", "focus":"Event", "blur":"Event",
 
    "":"Events"
};  

function sendEvent(doc, target, ename, props) {
	if (doc.createEvent) {
	  var e = doc.createEvent(eventToModule[ename] || "Events");
	  e.initEvent(ename,true,false);
	}
	else if (doc.createEventObject) {
	  var e = doc.createEventObject();
	}
	else throw new ExampleException("No support for synthetic events");
	
	for(var n in props) e[n] = props[n];;
	
	if (target.dispatchEvent) target.dispatchEvent(e); //DOM
	else if (target.fireEvent) target.fireEvent("on"+ename,e); //IE
}

// adopted from the script.actulo.us/unittest.js
function simulateMouse(doc,element,eventName, props) {
	var options = {
	  pointerX: 0, pointerY: 0,
	  button:0, // 0=left 2=right
	  detail: 1, // click count
	  ctrlKey: false, altKey: false, shiftKey: false, metaKey:false,
	  target: element,
	  relatedTarget: null
	};
	if (eventName == "mouseover" || eventName == "mouseout") options.relatedTarget = element;//TODO alternative elem?
	if (props)
	  for(var n in props) options[n] = props[n];;
	
	if (doc.createEventObject) { // IE
	  options.clientX = options.pointerX;
	  options.clientY = options.pointerY;      
	  var e = doc.createEventObject();
	  for(var n in options) e[n] = options[n];
	  element.fireEvent("on"+eventName,e)
	} else
	if (doc.createEvent) {
	  var e = doc.createEvent("MouseEvents");
	  if (e.initMouseEvent && false) { // DOM
	    e.initMouseEvent(eventName,true,true,doc.defaultView,
	      options.detail, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
	      options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, options.relatedTarget);
	  } else { // Safari
	  	//e = document.createEvent("UIEvents");
	    //TODO add extra props
	    for(var n in options) e[n] = options[n];
	    e.initEvent(eventName, true, true);
	  }
	  element.dispatchEvent(e);
	}
	else throw new ExampleException("No support for synthetic events");
}

function simulateClick(target,call) {
	call = call || target;
    simulateMouse(document,target,"mouseover",{relatedTarget:document.body});
    simulateMouse(document,target,"mousedown",{});
    sendEvent(document,target,"focus",{});
    simulateMouse(document,target,"mouseup",{});
	if (target.click && bElementClickWorks) {
		target.click();
	}
	else 
		simulateMouse(document, target, "click", {});
    simulateMouse(document,target,"mouseout",{relatedTarget:document.body});
}

function simulateKey(doc, element, eventName, props) {
	var options = {
		keyCode:0, charCode:0,
		ctrlKey: false, altKey: false, shiftKey: false, metaKey:false
	};
	if (props)
		for(var n in props) options[n] = props[n];;

	if (doc.createEventObject) {
		var e = doc.createEventObject();
		//e.type = eventName;
		//for(var n in options) e[n] = options[n];
		e.ctrlKey = options.ctrlKey;
		e.altKey = options.altKey;
		e.shiftKey = options.shiftKey;
		e.metaKey = options.metaKey;
		e.keyCode = options.keyCode;
		element.fireEvent("on"+eventName,e);
	} else
	if (doc.createEvent && element.dispatchEvent) {
		if (window.KeyEvent) {
			var e = doc.createEvent("KeyEvents");
			e.initKeyEvent(eventName,true,true,doc.defaultView,
				options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.keyCode, options.charCode );
		} else {
			var e = doc.createEvent('UIEvents');
			e.ctrlKey = options.ctrlKey;
			e.altKey = options.altKey;
			e.shiftKey = options.shiftKey;
			e.metaKey = options.metaKey;
			e.initUIEvent(eventName, true, true, doc.defaultView, 1);
			e.keyCode = options.keyCode;
			e.which = options.keyCode;
		}
		element.dispatchEvent(e);
	}
	else throw new ExampleException("No support for synthetic events");
}

test("Simulate MouseEvent",function(){
	var el = document.createElement("div");
	var clickHandler = sinon.spy();
	if (el.addEventListener) el.addEventListener("click",clickHandler,false);
	else {
		ok(el.attachEvent);
		el.attachEvent("onclick",clickHandler);
	}
	simulateMouse(document, el, "click", {});
	equal(clickHandler.callCount,1);

});
