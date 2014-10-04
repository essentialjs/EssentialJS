/*!
    Essential JavaScript - v0.6.0 ❀ http://essentialjs.com
    Copyright (c) 2011-2014 Henrik Vendelbo

    This program is free software: you can redistribute it and/or modify it under the terms of
    the GNU Affero General Public License version 3 as published by the Free Software Foundation.

    Additionally,

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software
    and associated documentation files (the 'Software'), to deal in the Software without restriction,
    including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
    BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
window.html5 = {
	elements: "template message abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video"
};
	
;window.Modernizr=function(e,t,n){function C(e){f.cssText=e}function k(e,t){return C(h.join(e+";")+(t||""))}function L(e,t){return typeof e===t}function A(e,t){return!!~(""+e).indexOf(t)}function O(e,t){for(var r in e){var i=e[r];if(!A(i,"-")&&f[i]!==n)return t=="pfx"?i:!0}return!1}function M(e,t,r){for(var i in e){var s=t[e[i]];if(s!==n)return r===!1?e[i]:L(s,"function")?s.bind(r||t):s}return!1}function _(e,t,n){var r=e.charAt(0).toUpperCase()+e.slice(1),i=(e+" "+d.join(r+" ")+r).split(" ");return L(t,"string")||L(t,"undefined")?O(i,t):(i=(e+" "+v.join(r+" ")+r).split(" "),M(i,t,n))}var r="2.7.1",i={},s=!0,o=t.documentElement,u="modernizr",a=t.createElement(u),f=a.style,l,c={}.toString,h=" -webkit- -moz- -o- -ms- ".split(" "),p="Webkit Moz O ms",d=p.split(" "),v=p.toLowerCase().split(" "),m={},g={},y={},b=[],w=b.slice,E,S=function(e,n,r,i){var s,a,f,l,c=t.createElement("div"),h=t.body,p=h||t.createElement("body");if(parseInt(r,10))while(r--)f=t.createElement("div"),f.id=i?i[r]:u+(r+1),c.appendChild(f);return s=["&#173;",'<style id="s',u,'">',e,"</style>"].join(""),c.id=u,(h?c:p).innerHTML+=s,p.appendChild(c),h||(p.style.background="",p.style.overflow="hidden",l=o.style.overflow,o.style.overflow="hidden",o.appendChild(p)),a=n(c,e),h?c.parentNode.removeChild(c):(p.parentNode.removeChild(p),o.style.overflow=l),!!a},x=function(){function r(r,i){i=i||t.createElement(e[r]||"div"),r="on"+r;var s=r in i;return s||(i.setAttribute||(i=t.createElement("div")),i.setAttribute&&i.removeAttribute&&(i.setAttribute(r,""),s=L(i[r],"function"),L(i[r],"undefined")||(i[r]=n),i.removeAttribute(r))),i=null,s}var e={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return r}(),T={}.hasOwnProperty,N;!L(T,"undefined")&&!L(T.call,"undefined")?N=function(e,t){return T.call(e,t)}:N=function(e,t){return t in e&&L(e.constructor.prototype[t],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(t){var n=this;if(typeof n!="function")throw new TypeError;var r=w.call(arguments,1),i=function(){if(this instanceof i){var e=function(){};e.prototype=n.prototype;var s=new e,o=n.apply(s,r.concat(w.call(arguments)));return Object(o)===o?o:s}return n.apply(t,r.concat(w.call(arguments)))};return i}),m.touch=function(){var n;return"ontouchstart"in e||e.DocumentTouch&&t instanceof DocumentTouch?n=!0:S(["@media (",h.join("touch-enabled),("),u,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(e){n=e.offsetTop===9}),n},m.hashchange=function(){return x("hashchange",e)&&(t.documentMode===n||t.documentMode>7)},m.draganddrop=function(){var e=t.createElement("div");return"draggable"in e||"ondragstart"in e&&"ondrop"in e},m.websockets=function(){return"WebSocket"in e||"MozWebSocket"in e},m.backgroundsize=function(){return _("backgroundSize")},m.csscolumns=function(){return _("columnCount")};for(var D in m)N(m,D)&&(E=D.toLowerCase(),i[E]=m[D](),b.push((i[E]?"":"no-")+E));return i.addTest=function(e,t){if(typeof e=="object")for(var r in e)N(e,r)&&i.addTest(r,e[r]);else{e=e.toLowerCase();if(i[e]!==n)return i;t=typeof t=="function"?t():t,typeof s!="undefined"&&s&&(o.className+=" "+(t?"":"no-")+e),i[e]=t}return i},C(""),a=l=null,function(e,t){function c(e,t){var n=e.createElement("p"),r=e.getElementsByTagName("head")[0]||e.documentElement;return n.innerHTML="x<style>"+t+"</style>",r.insertBefore(n.lastChild,r.firstChild)}function h(){var e=y.elements;return typeof e=="string"?e.split(" "):e}function p(e){var t=f[e[u]];return t||(t={},a++,e[u]=a,f[a]=t),t}function d(e,n,r){n||(n=t);if(l)return n.createElement(e);r||(r=p(n));var o;return r.cache[e]?o=r.cache[e].cloneNode():s.test(e)?o=(r.cache[e]=r.createElem(e)).cloneNode():o=r.createElem(e),o.canHaveChildren&&!i.test(e)&&!o.tagUrn?r.frag.appendChild(o):o}function v(e,n){e||(e=t);if(l)return e.createDocumentFragment();n=n||p(e);var r=n.frag.cloneNode(),i=0,s=h(),o=s.length;for(;i<o;i++)r.createElement(s[i]);return r}function m(e,t){t.cache||(t.cache={},t.createElem=e.createElement,t.createFrag=e.createDocumentFragment,t.frag=t.createFrag()),e.createElement=function(n){return y.shivMethods?d(n,e,t):t.createElem(n)},e.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+h().join().replace(/[\w\-]+/g,function(e){return t.createElem(e),t.frag.createElement(e),'c("'+e+'")'})+");return n}")(y,t.frag)}function g(e){e||(e=t);var n=p(e);return y.shivCSS&&!o&&!n.hasCSS&&(n.hasCSS=!!c(e,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),l||m(e,n),e}var n="3.7.0",r=e.html5||{},i=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,s=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,o,u="_html5shiv",a=0,f={},l;(function(){try{var e=t.createElement("a");e.innerHTML="<xyz></xyz>",o="hidden"in e,l=e.childNodes.length==1||function(){t.createElement("a");var e=t.createDocumentFragment();return typeof e.cloneNode=="undefined"||typeof e.createDocumentFragment=="undefined"||typeof e.createElement=="undefined"}()}catch(n){o=!0,l=!0}})();var y={elements:r.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:n,shivCSS:r.shivCSS!==!1,supportsUnknownElements:l,shivMethods:r.shivMethods!==!1,type:"default",shivDocument:g,createElement:d,createDocumentFragment:v};e.html5=y,g(t)}(this,t),i._version=r,i._prefixes=h,i._domPrefixes=v,i._cssomPrefixes=d,i.hasEvent=x,i.testProp=function(e){return O([e])},i.testAllProps=_,i.testStyles=S,i.prefixed=function(e,t,n){return t?_(e,t,n):_(e,"pfx")},o.className=o.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(s?" js "+b.join(" "):""),i}(this,this.document),function(e,t,n){function r(e){return"[object Function]"==d.call(e)}function i(e){return"string"==typeof e}function s(){}function o(e){return!e||"loaded"==e||"complete"==e||"uninitialized"==e}function u(){var e=v.shift();m=1,e?e.t?h(function(){("c"==e.t?k.injectCss:k.injectJs)(e.s,0,e.a,e.x,e.e,1)},0):(e(),u()):m=0}function a(e,n,r,i,s,a,f){function l(t){if(!d&&o(c.readyState)&&(w.r=d=1,!m&&u(),c.onload=c.onreadystatechange=null,t)){"img"!=e&&h(function(){b.removeChild(c)},50);for(var r in T[n])T[n].hasOwnProperty(r)&&T[n][r].onload()}}var f=f||k.errorTimeout,c=t.createElement(e),d=0,g=0,w={t:r,s:n,e:s,a:a,x:f};1===T[n]&&(g=1,T[n]=[]),"object"==e?c.data=n:(c.src=n,c.type=e),c.width=c.height="0",c.onerror=c.onload=c.onreadystatechange=function(){l.call(this,g)},v.splice(i,0,w),"img"!=e&&(g||2===T[n]?(b.insertBefore(c,y?null:p),h(l,f)):T[n].push(c))}function f(e,t,n,r,s){return m=0,t=t||"j",i(e)?a("c"==t?E:w,e,t,this.i++,n,r,s):(v.splice(this.i++,0,e),1==v.length&&u()),this}function l(){var e=k;return e.loader={load:f,i:0},e}var c=t.documentElement,h=e.setTimeout,p=t.getElementsByTagName("script")[0],d={}.toString,v=[],m=0,g="MozAppearance"in c.style,y=g&&!!t.createRange().compareNode,b=y?c:p.parentNode,c=e.opera&&"[object Opera]"==d.call(e.opera),c=!!t.attachEvent&&!c,w=g?"object":c?"script":"img",E=c?"script":w,S=Array.isArray||function(e){return"[object Array]"==d.call(e)},x=[],T={},N={timeout:function(e,t){return t.length&&(e.timeout=t[0]),e}},C,k;k=function(e){function t(e){var e=e.split("!"),t=x.length,n=e.pop(),r=e.length,n={url:n,origUrl:n,prefixes:e},i,s,o;for(s=0;s<r;s++)o=e[s].split("="),(i=N[o.shift()])&&(n=i(n,o));for(s=0;s<t;s++)n=x[s](n);return n}function o(e,i,s,o,u){var a=t(e),f=a.autoCallback;a.url.split(".").pop().split("?").shift(),a.bypass||(i&&(i=r(i)?i:i[e]||i[o]||i[e.split("/").pop().split("?")[0]]),a.instead?a.instead(e,i,s,o,u):(T[a.url]?a.noexec=!0:T[a.url]=1,s.load(a.url,a.forceCSS||!a.forceJS&&"css"==a.url.split(".").pop().split("?").shift()?"c":n,a.noexec,a.attrs,a.timeout),(r(i)||r(f))&&s.load(function(){l(),i&&i(a.origUrl,u,o),f&&f(a.origUrl,u,o),T[a.url]=2})))}function u(e,t){function n(e,n){if(e){if(i(e))n||(f=function(){var e=[].slice.call(arguments);l.apply(this,e),c()}),o(e,f,t,0,u);else if(Object(e)===e)for(p in h=function(){var t=0,n;for(n in e)e.hasOwnProperty(n)&&t++;return t}(),e)e.hasOwnProperty(p)&&(!n&&!--h&&(r(f)?f=function(){var e=[].slice.call(arguments);l.apply(this,e),c()}:f[p]=function(e){return function(){var t=[].slice.call(arguments);e&&e.apply(this,t),c()}}(l[p])),o(e[p],f,t,p,u))}else!n&&c()}var u=!!e.test,a=e.load||e.both,f=e.callback||s,l=f,c=e.complete||s,h,p;n(u?e.yep:e.nope,!!a),a&&n(a)}var a,f,c=this.yepnope.loader;if(i(e))o(e,0,c,0);else if(S(e))for(a=0;a<e.length;a++)f=e[a],i(f)?o(f,0,c,0):S(f)?k(f):Object(f)===f&&u(f,c);else Object(e)===e&&u(e,c)},k.addPrefix=function(e,t){N[e]=t},k.addFilter=function(e){x.push(e)},k.errorTimeout=1e4,null==t.readyState&&t.addEventListener&&(t.readyState="loading",t.addEventListener("DOMContentLoaded",C=function(){t.removeEventListener("DOMContentLoaded",C,0),t.readyState="complete"},0)),e.yepnope=l(),e.yepnope.executeStack=u,e.yepnope.injectJs=function(e,n,r,i,a,f){var l=t.createElement("script"),c,d,i=i||k.errorTimeout;l.src=e;for(d in r)l.setAttribute(d,r[d]);n=f?u:n||s,l.onreadystatechange=l.onload=function(){!c&&o(l.readyState)&&(c=1,n(),l.onload=l.onreadystatechange=null)},h(function(){c||(c=1,n(1))},i),a?l.onload():p.parentNode.insertBefore(l,p)},e.yepnope.injectCss=function(e,n,r,i,o,a){var i=t.createElement("link"),f,n=a?u:n||s;i.href=e,i.rel="stylesheet",i.type="text/css";for(f in r)i.setAttribute(f,r[f]);o||(p.parentNode.insertBefore(i,p),h(n,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))},Modernizr.addTest("filereader",function(){return!!(window.File&&window.FileList&&window.FileReader)}),Modernizr.addTest("ie8compat",function(){return!window.addEventListener&&document.documentMode&&document.documentMode===7}),Modernizr.addTest("csscalc",function(){var e="width:",t="calc(10px);",n=document.createElement("div");return n.style.cssText=e+Modernizr._prefixes.join(t+e),!!n.style.length}),Modernizr.addTest("regions",function(){var e=Modernizr.prefixed("flowFrom"),t=Modernizr.prefixed("flowInto");if(!e||!t)return!1;var n=document.createElement("div"),r=document.createElement("div"),i=document.createElement("div"),s="modernizr_flow_for_regions_check";r.innerText="M",n.style.cssText="top: 150px; left: 150px; padding: 0px;",i.style.cssText="width: 50px; height: 50px; padding: 42px;",i.style[e]=s,n.appendChild(r),n.appendChild(i),document.documentElement.appendChild(n);var o,u,a=r.getBoundingClientRect();return r.style[t]=s,o=r.getBoundingClientRect(),u=o.left-a.left,document.documentElement.removeChild(n),r=i=n=undefined,u==42}),Modernizr.addTest("csspositionsticky",function(){var e="position:",t="sticky",n=document.createElement("modernizr"),r=n.style;return r.cssText=e+Modernizr._prefixes.join(t+";"+e).slice(0,-e.length),r.position.indexOf(t)!==-1});
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
                return resolver.namespace; //TODO default undefined?
            case 1:
                return resolver._noval(path, path.onundefined||"null"); //TODO default undefined?
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
                    symbol = names[names.length - 1],
                    old = base[symbol];
                if (old === undefined) {
                    base[symbol] = value;
                    if (trigger) trigger.call(resolver, "change", names, base, symbol, value, old); //TODO standard params
                }
                return base[symbol];

            case "set":
            //TODO names == undefined
                var base = resolver._get(names,onundefined,-1),
                    symbol = names[names.length - 1],
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

            case "remove":
            //TODO names == undefined
                var base = resolver._get(names,onundefined,-1),
                    symbol = names[names.length - 1],
                    old = base[symbol];
                if (old !== undefined) {
                    delete base[symbol];
                    if (trigger) trigger.call(resolver, "change", names, base, symbol, undefined, old); //TODO standard params & remove flag
                }
                return;
        }
    };

    var generator = options.generator || Generator.ObjectGenerator; // pre-plan object generator
    var notObject = new Error("Unresolved");

    // next non null node, can fill undefined
    function nextObject(node,name,names,fill) {
        if (fill && node[name]===undefined) return (node[name] = generator());
        var n = node[name], t = typeof n;
        if ((t==="object" && n!==null) || t==="function") return n;
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

        var node = resolver.root? resolver.root._get(resolver.prefix,baseu) : resolver.namespace; // passed namespace negates override
        if (names == undefined) return node;
        var l = names.length - 1, n;
        switch(baseu) {
            case "value":
                for (var j = 0; j<l; ++j)  {
                    node = nextObject(node,names[j],names,false);
                    if (node instanceof Error) return dflt;
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
                    node = nextObject(node,names[j],names,true);
                    if (node instanceof Error) throw node;
                }
                break;
        }
        switch(leafu) {
            case -1: return node;
            case "value":
                node = node[names[j]];
                return node===undefined? dflt:node;
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
    return this(name,'get',onundefined);
};

/*
    name = string/array
*/
Resolver.method.fn.declare = function(name,value,onundefined) 
{
    return this._exec(name,"declare",value,this._notifies,onundefined);

    // var names;
    // if (typeof name == "object" && name.join) {
    //     names = name;
    //     name = name.join(".");
    // } else {
    //     names = name.split("::");
    //     if (names.length > 1) {
    //         return Resolver(names.shift()).declare(names[0],value,onundefined);
    //     }
    //     names = name.split(".");
    // }
    // var symbol = names.pop();
    // var base = this._resolve(names,null,onundefined);
    // if (base[symbol] === undefined) { 
    //     if (this._setValue(value,names,base,symbol)) {
    //         //TODO references of resolver from reference or tree of references?
    //         var ref = resolver.references[name];
    //         if (ref) ref._callListener("change",names,base,symbol,value);
    //         var parentName = names.join(".");
    //         var parentRef = resolver.references[parentName];
    //         if (parentRef) parentRef._callListener("change",names,base,symbol,value);
    //     }
    //     return value;
    // } else return base[symbol];
};

/*
    name = string/array
*/
Resolver.method.fn.set = function(name,value,onundefined) 
{
    return this._exec(name,"set",value,this._notifies,onundefined);

    // var names;
    // if (typeof name == "object" && name.join) {
    //     names = name;
    //     name = name.join(".");
    // } else {
    //     names = name.split("::");
    //     if (names.length > 1) {
    //         return Resolver(names.shift()).set(names[0],value,onundefined);
    //     }
    //     names = name.split(".");
    // }
    // var symbol = names.pop();
    // var base = this._resolve(names,null,onundefined);
    // if (onundefined=="force" && (typeof base != "object" || typeof base != "function")) {
    //     var leaf = names.pop();
    //     this._resolve(names,null,onundefined)[leaf] = {};
    //     names.push(leaf);
    //     base = this._resolve(names,null,onundefined);
    // }
    // var oldValue = base?base[symbol]:undefined;
    // if (this._setValue(value,names,base,symbol)) {
    //     var ref = this.references[name];
    //     if (ref) ref._callListener("change",names,base,symbol,value,oldValue);
    //     var parentName = names.join(".");
    //     var parentRef = this.references[parentName];
    //     if (parentRef) parentRef._callListener("change",names,base,symbol,value,oldValue);
    // }
    // return value;
};

Resolver.method.fn.toggle = function(name,onundefined)
{
    return this._noval(name,"toggle",this._notifies,onundefined);

    // var names;
    // if (typeof name == "object" && name.join) {
    //     names = name;
    //     name = name.join(".");
    // } else {
    //     names = name.split("::");
    //     if (names.length > 1) {
    //         return Resolver(names.shift()).toggle(names[0],value,onundefined);
    //     }
    //     names = name.split(".");
    // }
    // var symbol = names.pop();
    // var base = this._resolve(names,null,onundefined);
    // var value = ! base[symbol]; //TODO configurable toggle
    // if (this._setValue(value,names,base,symbol)) {
    //     var ref = resolver.references[name];
    //     if (ref) ref._callListener("change",names,base,symbol,value,!value);
    //     var parentName = names.join(".");
    //     var parentRef = resolver.references[parentName];
    //     if (parentRef) parentRef._callListener("change",names,base,symbol,value,!value);
    // }
    // return value;
};

Resolver.method.fn.remove = function(name,onundefined)
{
    return this._exec(name,"remove",0,this._notifies,onundefined);

    // var names;
    // if (typeof name == "object" && name.join) {
    //     names = name;
    //     name = name.join(".");
    // } else {
    //     names = name.split("::");
    //     if (names.length > 1) {
    //         return Resolver(names.shift()).remove(names[0],onundefined);
    //     }
    //     names = name.split(".");
    // }
    // var symbol = names.pop();
    // var base = this._resolve(names,null,onundefined), oldValue = base?base[symbol]:undefined;
    // if (oldValue === undefined) return;
    // delete base[symbol];

    // var ref = resolver.references[name];
    // if (ref) ref._callListener("change",names,base,symbol,undefined);
    // var parentName = names.join(".");
    // var parentRef = resolver.references[parentName];
    // if (parentRef) parentRef._callListener("change",names,base,symbol,undefined);
    // return oldValue;
};

Resolver.method.fn.on = function(type,selector,data,callback) 
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

        function get() {
            if (arguments.length==1) {
                var subnames = (typeof arguments[0] == "object")? arguments[0] : arguments[0].split(".");
                var r = resolver._resolve(names,subnames,onundefined);
                //TODO onundefined for the arg
                return r;
            } else {
                var base = resolver._resolve(names,null,onundefined);
                return base;
            }
        }
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

        function remove() {
            if (arguments.length > 0) {
                var subnames = (typeof arguments[0] == "object")? arguments[0] : arguments[0].split(".");
                var symbol = subnames.pop();
                var base = resolver._resolve(names,subnames,onundefinedSet);
                var combined = names.concat(subnames);
                var parentName = combined.join(".");
                subnames.push(symbol);

                //TODO if typeof base != object 
                var oldValue = base?base[symbol]:undefined;
                if (oldValue === undefined) return;
                delete base[symbol];

                var childRef = resolver.references[parentName + "." + symbol];
                if (childRef) childRef._callListener("change",combined,base,symbol,undefined,oldValue);
                var parentRef = resolver.references[parentName];
                if (parentRef) parentRef._callListener("change",combined,base,symbol,undefined,oldValue);

            } else {
                var symbol = names[names.length - 1];
                var base = resolver._resolve(baseNames,null,onundefinedSet);
                var oldValue = base?base[symbol]:undefined;
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
                var base = resolver._resolve(names,subnames,onundefinedSet);
                var combined = names.concat(subnames);
                var parentName = combined.join(".");
                subnames.push(symbol);
                value = arguments[1];
                var oldValue = base[symbol];

                if (resolver._setValue(value,combined,base,symbol)) {
                    var childRef = resolver.references[parentName + "." + symbol];
                    if (childRef) childRef._callListener("change",combined,base,symbol,value,oldValue);
                    var parentRef = resolver.references[parentName];
                    if (parentRef) parentRef._callListener("change",combined,base,symbol,value,oldValue);
                }
            } else {
                var base = resolver._resolve(baseNames,null,onundefinedSet);
                var oldValue = base?base[leafName]:undefined;

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
        function declare(value) {
            if (arguments.length > 1) {
                var subnames = (typeof arguments[0] == "object")? arguments[0] : arguments[0].split(".");
                var symbol = subnames.pop();
                var base = resolver._resolve(names,subnames,onundefinedSet);
                var combined = names.concat(subnames);
                var parentName = combined.join(".");
                subnames.push(symbol);
                value = arguments[1];
                var oldValue = base?base[symbol]:undefined;

                if (base[symbol] === undefined) {
                    if (resolver._setValue(value,combined,base,symbol)) {
                        var childRef = resolver.references[parentName + "." + symbol];
                        if (childRef) childRef._callListener("change",combined,base,symbol,value,oldValue);
                        var parentRef = resolver.references[parentName];
                        if (parentRef) parentRef._callListener("change",combined,base,symbol,value,oldValue);
                    }
                }
                return base[symbol];
            } else {
                var base = resolver._resolve(baseNames,null,onundefinedSet);
                var oldValue = base?base[leafName]:undefined;

                if (base[leafName] === undefined) {
                    if (resolver._setValue(value,baseNames,base,leafName)) {
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
        function mixinto(target) {
            var base = resolver._resolve(names,null,onundefined);
            for(var n in base) {
                target[n] = base[n];
            }
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
        function on(type,data,callback) {
            switch(arguments.length) {
                case 2: this._addListener(type,name,null,arguments[1]); break;
                case 3: this._addListener(type,name,data,callback); break;
            };
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
                var base = resolver._resolve(baseNames,null,"undefined");
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

	function destroy() {

	}
	generator.destroy = destroy;
	
	function discard() {
		var discarded = this.info.constructors[-1].discarded;
		for(var n in this.info.existing) {
			var instance = this.info.existing[n];
			if (discarded) discarded.call(this,instance);
			if (this.discarded) this.discarded.call(this,instance);
			if (this.info.options.discarded) this.info.options.discarded.call(this,instance);
		}

		this.info.existing = {};
	}
	generator.discard = discard; //TODO { destroy and then discard existing }

	// Future calls will return this generator
	mainConstr.__generator__ = generator;
		
	return generator;
};

Generator.instantiateSingletons	= function(lc)
{
	for(var i=0,g; g = Generator.restricted[i]; ++i) {
		if (g.info.lifecycle == lc) { // TODO  && g.info.existing[g.info.identifier(..)] == undefined
			g();
		}
	}
};

/* List of generators that have been restricted */
Generator.restricted = [];
Generator.ObjectGenerator = Generator(Object);

Generator.discardRestricted = function()
{
	for(var i=Generator.restricted.length-1,g; g = Generator.restricted[i]; --i) g.destroy();
	for(var i=Generator.restricted.length-1,g; g = Generator.restricted[i]; --i) {
		g.discard();
		g.info.constructors[-1].__generator__ = undefined;
		g.__generator__ = undefined;
	}
};


Resolver.create("default");
Resolver.create("window", window);

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

	function fixClass(cls) {
		cls = cls.replace(/   /g," ").replace(/  /g," ").replace(/ $/,'').replace(/^ /,'');
		return cls;
	}

	DOMTokenList.mixin = function(dtl,mix) {
		if (mix.split) { // string
			var toset = fixClass(mix).split(" ");
			for(var i=0,entry; entry = toset[i]; ++i) dtl.add(entry);
			return;
		}
		if (typeof mix.length == "number") {
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
	
	function ensureCleaner(el,cleaner) {

		if (el._cleaners == undefined) el._cleaners = [];
		if (!arrayContains(el._cleaners,cleaner)) el._cleaners.push(cleaner); 
	}
	essential.declare("ensureCleaner",ensureCleaner);

	/**
	 * Cleans up registered event listeners and other references
	 * LIFO call order
	 * 
	 * @param {Element} el
	 */
	function callCleaners(el)
	{
		if (typeof el == "object" && el) {
			var _cleaners = el._cleaners, c;
			if (_cleaners != undefined) {
				_cleaners._incall = (_cleaners._incall || 0) + 1;
				do {
					c = _cleaners.pop();
					if (c) c.call(el);
				} while(c);
				el._cleaners = undefined;
			}
		} 
	}
	essential.declare("callCleaners",callCleaners);

	/*
	 * Cleans up registered event listeners and other references
	 * Children first.
	 */
	function cleanRecursively(el,unwind,nested) {
		unwind = unwind || 0;
		var cleaners = el._cleaners = el._cleaners || [];
		var incall = cleaners._incall || 0;
		var cleanMe = !nested && !cleaners._inrecurse;

		if (incall > unwind) return; // if in the middle of cleaning leave branch alone

		cleaners._inrecurse = (cleaners._inrecurse || 0) + 1;

		for(var i=0, children=el.children, child; child=children && children[i]; ++i) {
			if (child.nodeType == 1) cleanRecursively(child,unwind,true);
		}

		if (cleanMe) callCleaners(el);
		--cleaners._inrecurse;
	}
	essential.declare("cleanRecursively",cleanRecursively);


	/* Container for laid out elements */
	function _Layouter(key,el,conf) {

		var layouterDesc = EnhancedDescriptor.all[el.uniqueID];
		var appConfig = Resolver("essential::ApplicationConfig::")();

		for(var i=0,c; c = el.children[i]; ++i) {
			var role = c.getAttribute("role"), conf = Resolver.config(c) || {};
			var se = this.sizingElement(el,el,c,role,conf);
			if (se) {
				// set { sizingElement:true } on conf?
				var desc = EnhancedDescriptor(c,role,conf,false,appConfig);
				desc.context.layouterParent = layouterDesc.layouter;
				sizingElements[desc.uniqueID] = desc;
			}
		}
	}
	var Layouter = essential.declare("Layouter",Generator(_Layouter));

	_Layouter.prototype.init = function(el,conf,sizing,layout) {};
	_Layouter.prototype.destroy = function(el) {};

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

	_Laidout.prototype.init = function(el,conf,sizing,layout) {};
	_Laidout.prototype.destroy = function(el) {};
	_Laidout.prototype.layout = function(el,layout) {};
	_Laidout.prototype.calcSizing = function(el,sizing) {};


	// map of uniqueID referenced (TODO array for performance/memory?)
	var enhancedElements = essential.declare("enhancedElements",{});

	//TODO Resolver("document::essential.unfinished::")
	var unfinishedElements = essential.declare("unfinishedElements",{});

	// map of uniqueID referenced
	var sizingElements = essential.declare("sizingElements",{});

	// map of uniqueID referenced
	var maintainedElements = essential.declare("maintainedElements",{});

	// open windows
	var enhancedWindows = essential.declare("enhancedWindows",[]);

	function DescriptorQuery(sel,el) {
		var q = [], context = { list:q };

		if (typeof sel == "string") {
			var strainer = selectorStrainer(sel);
			if (el) {
				var context = { list:q };
				findChildrenToEnhance(el || document.body,context,strainer);
			} else {
				for(var id in enhancedElements) {
					var desc = enhancedElements[id];
					if (strainer(desc.el,desc)) q.push(desc);
				}
			}

		} else {
			var ac = essential("ApplicationConfig")();
			el=sel; sel=undefined;
			if (typeof el.length == "number") {
				for(var i=0,e; e = el[i]; ++i) {

					var conf = Resolver.config(e), role = e.getAttribute("role");
					var desc = EnhancedDescriptor(e,role,conf,false,ac);
					if (desc) q.push(desc);
				}
			} else if (el.nodeType == 1) {
				//TODO third param context ? integrate with desc.context
				//TODO identify existing descriptors

				var conf = Resolver.config(el), role = el.getAttribute("role");
				var desc = EnhancedDescriptor(el,role,conf);
				if (desc) q.push(desc);
			}
		}
		q.el = el;
		for(var n in DescriptorQuery.fn) q[n] = DescriptorQuery.fn[n];

		return q;
	}
	essential.declare("DescriptorQuery",DescriptorQuery);

	DescriptorQuery.fn = {};

	DescriptorQuery.fn.enhance = function() {
		var pageResolver = Resolver("page"),
			handlers = pageResolver("handlers"), enabledRoles = pageResolver("enabledRoles");

		for(var i=0,desc; desc = this[i]; ++i) if (desc.inits.length>0) desc._init();

		for(var i=0,desc; desc = this[i]; ++i) {

			//already done: desc.ensureStateful();
			desc._tryEnhance(handlers,enabledRoles);
			desc._tryMakeLayouter(""); //TODO key?
			desc._tryMakeLaidout(""); //TODO key?

			if (desc.conf.sizingElement) sizingElements[desc.uniqueID] = desc;
		}

	};

	DescriptorQuery.fn.discard = function() {
		for(var i=0,desc; desc = this[i]; ++i) {
			if (desc) {
				desc.discardNow();
				desc._unlist();
			}
		}
	};

	DescriptorQuery.fn.queue = function() {
		for(var i=0,desc; desc = this[i]; ++i) {
			if (desc) {
				EnhancedDescriptor.unfinished[desc.uniqueID] = desc;
			}
		}
	};

	DescriptorQuery.fn.getInstance = function() {
		if (this.length) return this[0].instance;
		return null;
	};

	function findChildrenToEnhance(el,context,fn) {

		var e = el.firstElementChild!==undefined? el.firstElementChild : el.firstChild;
		while(e) {
			if (e.attributes) {
				var conf = Resolver.config(e), role = e.getAttribute("role");
				// var sizingElement = false;
				// if (context.layouter) sizingElement = context.layouter.sizingElement(el,e,role,conf);

				//TODO if not enabledRole skip

				var desc = EnhancedDescriptor(e,role,conf);
				var add = true;
				if (fn) add = fn(e,desc,conf);
				if (desc && add) {
					if (context.list) context.list.push(desc);
				} else {

				}
				if (desc==null || !desc.state.contentManaged) findChildrenToEnhance(e,{layouter:context.layouter,list:context.list},fn);
			}
			e = e.nextElementSibling!==undefined? e.nextElementSibling : e.nextSibling;
		}
	}

	function selectorStrainer(sel) {
		var attrEq = {};
		if (sel.charAt(0) == "[" && sel.charAt(sel.length-1) == "]") {
			var attrs = sel.substring(1,sel.length-1).split(",");
			for(var i=0,a; a = attrs[i]; ++i) {
				var attr = a.split("=");
				attrEq[attr[0]] = attr[1];
			}
		}

		return function(el,desc,conf) {
			for(var n in attrEq) {
				var v = el.getAttribute(n);
				if (v != attrEq[n]) return false;
			}
			return true;
		};
	}

	DescriptorQuery.fn.onlyBranch = function() {
		if (this.el == undefined) throw new Error('Branch of undefined element'); // not sure what to do
		var context = { list:this };
		this.length = 0;
		//TODO if the el is a layouter, pass that in conf
		findChildrenToEnhance(this.el,context);
		//TODO push those matched descriptors into q
		return this;
	};

	DescriptorQuery.fn.withBranch = function() {
		this.onlyBranch();

		var conf = Resolver.config(this.el), role = this.el.getAttribute("role");

				//TODO if not enabledRole skip
				
		var desc = EnhancedDescriptor(this.el,role,conf);
		if (desc) this.shift(desc);
		return this;
	};
 


	function EnhancedContext() {
	}
	essential.declare("EnhancedContext",EnhancedContext);

	EnhancedContext.prototype.clear = function() {
		this.instance = null;
		this.placement = null;

		// this.uniqueID
		this.el = null;
		this.stateful = null;

		this.controller = null;
		this.controllerID = null;
		this.controllerStateful = null;
		this.layouterParent = null;
		this.layouterEl = null;
	};
	// EnhancedContext.prototype.??

	function _EnhancedDescriptor(el,role,conf,page,uniqueID) {

		var roles = role? role.split(" ") : [];

		this.el = el;
		this.placement = essential("ElementPlacement")(el,[]);
		this.placement.manually(["overflow"]);
		if (this.placement.style.overflow == "visible") this._updateDisplayed = this._updateDisplayedNotNone;

		// sizingHandler
		this.sizing = {
			"contentWidth":0,"contentHeight":0,
			"currentStyle": this.placement.style,

			track: {
				sizeBy: "offset",
				contentBy: "scroll",
				width:true, height:true,
				contentWidth: true, contentHeight: true,
				scrollLeft:false, scrollTop: false
			}
		};

		this.layout = {
			// "displayed": !(el.offsetWidth == 0 && el.offsetHeight == 0),
			"currentStyle": this.placement.style,
			"lastDirectCall": 0,
			"enable": false,
			"throttle": null //TODO throttle by default?
		};
		this._updateDisplayed();
		this.ensureStateful();
		ensureCleaner(this.el,_roleEnhancedCleaner); //TODO either enhanced, layouter, or laidout
		this.stateful.set("state.needEnhance", roles.length > 0);
		this.uniqueID = uniqueID;
		this.roles = roles;
		this.role = roles[0]; //TODO document that the first role is the switch for enhance
		this.conf = conf || {};
		this.context = new EnhancedContext();
		this.context.placement = this.placement;
		this.instance = null;
		this.controller = null; // Enhanced Controller can be separate from instance

		// layoutHandler / maintained
		this.state.initDone = false; // might change to reconfigured=true
		this.state.enhanced = false;
		this.state.discarded = false;
		this.state.contentManaged = false; // The content HTML is managed by the enhanced element the content will not be enhanced automatically

		this.page = page;
		this.handlers = page.resolver("handlers");
		this.enabledRoles = page.resolver("enabledRoles");
		this.inits = [];

		if (this.role) this.inits.push(this._roleInit);

		this._updateContext();
	}

	_EnhancedDescriptor.prototype._init = function() {
		this._updateContext();
		for(var i=0,c; c = this.inits[i]; ++i) c.call(this);
		this.inits.length = 0;
	};

	_EnhancedDescriptor.prototype._roleInit = function() {
		if (this.handlers.init[this.role]) {
			this.handlers.init[this.role].call(this,this.el,this.role,this.conf,this.context);
		}
	};
	_EnhancedDescriptor.prototype._layouterInit = function() {
		if (this.layouter) this.layouter.init(this.el,this.conf,this.sizing,this.layout);
	};
	_EnhancedDescriptor.prototype._laidoutInit = function() {
		if (this.laidout) this.laidout.init(this.el,this.conf,this.sizing,this.layout);
	};

	// try during construction, before init and enhance

	_EnhancedDescriptor.prototype._updateContext = function() {
		if (this.conf.controllerID != undefined) {
			var desc = EnhancedDescriptor.all[this.conf.controllerID];
			this.context.controllerID = desc.uniqueID;
			this.context.controller = desc.controller || desc.instance;
			this.context.controllerStateful = this.context.controller.stateful || desc.stateful;
			return;
		}

		this.context.el = null;
		this.context.controller = null;
		for(var el = this.el.parentNode; el; el = el.parentNode) {
			if (el.uniqueID) {
				var desc = enhancedElements[el.uniqueID];
				if (desc) {

					// in case it wasn't set by the layouter constructor
					if (this.context.layouterParent == null && desc.layouter) {
						this.context.layouterParent = desc.layouter;
						this.context.layouterEl = desc.el;
					}
					if (this.context.el == null && (this.state.enhanced || this.state.needEnhance)) { // skip non-enhanced
						this.context.el = el;
						this.context.uniqueID = el.uniqueID;
						this.context.instance = desc.instance;
						this.context.stateful = desc.stateful;
					}
					if (this.context.controller == null && desc.conf.controller) {
						// make controller ? looking up generator/function
						this.context.controllerID = desc.uniqueID;
						this.context.controller = desc.controller || desc.instance;
						this.context.controllerStateful = this.context.controller? this.context.controller.stateful || desc.stateful : null;
					}

				}
			}
		}
	};

	_EnhancedDescriptor.prototype._updateLayouterContext = function() {
		this.context.el = null;
		this.context.controller = null;
		for(var el = this.el.parentNode; el; el = el.parentNode) {
			if (el.uniqueID) {
				var desc = enhancedElements[el.uniqueID];
				if (desc) {

					// in case it wasn't set by the layouter constructor
					if (this.context.layouterParent == null && desc.layouter) {
						this.context.layouterParent = desc.layouter;
						this.context.layouterEl = desc.el;
					}
				}
			}
		}
	};

	_EnhancedDescriptor.prototype.discardHandler = function() {

	};

	_EnhancedDescriptor.prototype.ensureStateful = function() {
		if (this.stateful) return;

		var stateful = this.stateful = essential("StatefulResolver")(this.el,true);
		this.state = stateful("state");
		stateful.set("sizing",this.sizing);
		stateful.set("layout",this.layout);
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


	function _roleEnhancedCleaner() {
		if (this.uniqueID == null) return; // just in case, shouldn't happen
		var desc = enhancedElements[this.uniqueID];
		if (desc) {
			var enhanced = desc.state.enhanced;
			if (desc.laidout) desc.laidout.destroy(desc.el);
			if (desc.layouter) desc.layouter.destroy(desc.el);
			//TODO destroy
			//TODO discard/destroy for layouter and laidout

			var controller = desc.controller || desc.getController();
			if (controller && controller.destroyed) controller.destroyed(desc.el,desc.instance);

			// if (desc.discardHandler) 
			var r = desc.discardHandler(desc.el,desc.role,desc.instance);
			// desc._domCheck();
			desc._unlist(true); // make sure that sizing stops

			if (controller && controller.discarded) controller.discarded(desc.el,desc.instance);

			//TODO discard queue for generator instances

			if (controller && enhanced) {
				--controller.__enhanced;
				if (controller.__enhanced == 0 && controller.destroy) {
					controller.destroy(desc.el);
					controller.__init_called = false;
				}	
			}

			return r;
		}
	}

	_EnhancedDescriptor.prototype.setInstance = function(instance) {
		this._initController();
		this.instance = instance;
		this._setInstance();
	};

	_EnhancedDescriptor.prototype._initController = function() {
		this._updateContext();
		var controller = this.getController();
		if (controller && ! controller.__init_called && controller.init) {
			controller.init(this.el,this.config,this.context);
			controller.__init_called = true;
		}
	};

	_EnhancedDescriptor.prototype._setInstance = function() {
		this.state.enhanced = this.instance === false? false:true;
		this.state.needEnhance = !this.state.enhanced;

		if (this.state.enhanced) {
			//TODO mark when it was enhanced so auto-discard can be equivalent
			var controller = this.getController();
			if (controller) {
				if (controller.enhanced) controller.enhanced(this.el,this.instance,this.config,this.context);
				controller.__enhanced = controller.__enhanced? controller.__enhanced+1 : 1;
			}

			this.sizingHandler = this.handlers.sizing[this.role];
			this.layoutHandler = this.handlers.layout[this.role];
			if (this.layoutHandler && this.layoutHandler.throttle) this.layout.throttle = this.layoutHandler.throttle;
			var discardHandler = this.handlers.discard[this.role];
			if (discardHandler) this.discardHandler = discardHandler;

			// if (this.sizingHandler), enhanced will update layout even if no sizingHandler
			if (this.sizingHandler !== false) sizingElements[this.uniqueID] = this;
			if (this.layoutHandler) {
				this.layout.enable = true;
				maintainedElements[this.uniqueID] = this;
			}
		} 
	};

	//TODO keep params on page

	_EnhancedDescriptor.prototype._tryEnhance = function(handlers,enabledRoles) {
		if (!this.state.needEnhance) return;
		if (handlers.enhance == undefined) debugger;
		// desc.callCount = 1;
		if (this.role && handlers.enhance[this.role] && enabledRoles[this.role]) {
			this._initController();
			//TODO allow parent to modify context
			this.instance = handlers.enhance[this.role].call(this,this.el,this.role,this.conf,this.context);
			this._setInstance();
		}
	};

	_EnhancedDescriptor.prototype._tryMakeLayouter = function(key) {

		if (this.conf.layouter && this.layouter==undefined) {
			this._updateLayouterContext();
			var varLayouter = Layouter.variants[this.conf.layouter];
			if (varLayouter) {
				// future API change parent parameter removed
				this.layouter = this.el.layouter = varLayouter.generator(key,this.el,this.conf,this.context.layouterParent,this.context);
				if (this.context.layouterParent) sizingElements[this.uniqueID] = this; //TODO not sure this is needed, adds overhead
				if (varLayouter.generator.prototype.hasOwnProperty("layout")) {
					this.layout.enable = true;
	                // this.layout.queued = true; laidout will queue it
	                maintainedElements[this.uniqueID] = this;
				}
				this.inits.push(this._layouterInit);
			}
		}
	};

	_EnhancedDescriptor.prototype._tryMakeLaidout = function(key) {

		if (this.conf.laidout && this.laidout==undefined) {
			this._updateLayouterContext();
			var varLaidout = Laidout.variants[this.conf.laidout];
			if (varLaidout) {
				this.laidout = this.el.laidout = varLaidout.generator(key,this.el,this.conf,this.context.layouterParent);
				sizingElements[this.uniqueID] = this;
				if (varLaidout.generator.prototype.hasOwnProperty("layout")) {
					this.layout.enable = true;
	                this.layout.queued = true;
	                maintainedElements[this.uniqueID] = this;
				}
				this.inits.push(this._laidoutInit);
			}
		}

	};

	
	//TODO _EnhancedDescriptor.prototype.prepareAncestors = function() {};

	_EnhancedDescriptor.prototype.refresh = function() {
		var getActiveArea = essential("getActiveArea"); //TODO switch to Resolver("page::activeArea")
		var updateLayout = false;

		if (this.el && this.el.stateful == null) this.liveCheck();
		
		if (this.layout.area != getActiveArea()) { 
			this.layout.area = getActiveArea();
			updateLayout = true;
		}

		if (updateLayout || this.layout.queued) {
			//proxyConsole().debug("Refresh element","w="+this.layout.width,"h="+this.layout.height, updateLayout?"updateLayout":"",this.layout.queued?"queued":"", this.role, this.uniqueID)
			if (this.layoutHandler) this.layoutHandler(this.el,this.layout,this.instance);
			var layouter = this.layouter, laidout = this.laidout;
			if (layouter) layouter.layout(this.el,this.layout,this.laidouts()); //TODO pass instance
			if (laidout) {
				laidout.layout(this.el,this.layout); //TODO pass instance
				if (this.context.layouterEl) this.context.layouterEl.stateful.set("layout.queued",true);
			}

            this.layout.queued = false;
		}	
	};

	_EnhancedDescriptor.prototype.laidouts = function() {
		var laidouts = []; // laidouts and layouter
        for(var n in sizingElements) {
            var desc = sizingElements[n];
            if (desc.context.layouterParent == this.layouter && desc.laidout) laidouts.push(desc.el);
        }        
		// for(var c = this.el.firstElementChild!==undefined? this.el.firstElementChild : this.el.firstChild; c; 
		// 				c = c.nextElementSibling!==undefined? c.nextElementSibling : c.nextSibling) {
		// 	if (c.stateful && c.stateful("sizing","undefined")) laidouts.push(c);
		// }
		return laidouts;
	};

	_EnhancedDescriptor.prototype._domCheck = function() {

		var inDom = document.body==this.el || essential("contains")(document.body,this.el); //TODO reorg import
		//TODO handle subpages
		if (!inDom) {
			//TODO destroy and queue discard
			this.discardNow();
		}
	};

	_EnhancedDescriptor.prototype.liveCheck = function() {
		if (!this.state.enhanced || this.state.discarded) return;
		this._domCheck();
	};

	_EnhancedDescriptor.prototype._null = function() {
		this.instance = null;
		this.controller = null;
		this.sizingHandler = undefined;
		this.layoutHandler = undefined;
		this.layouter = undefined;
		this.laidout = undefined;
		this.sizing.currentStyle = null;
		this.layout.currentStyle = null;
		this.layout.enable = false;					
		if (this.context) this.context.clear();
		this.context = undefined;
		this._updateContext = function() {}; //TODO why is this called after discard, fix that
	};

	_EnhancedDescriptor.prototype.discardNow = function() {
		if (this.state.discarded) return;

		cleanRecursively(this.el);
		this._null();
		this.el = undefined;
		this.state.enhanced = false;
		this.state.discarded = true;					
	};

	_EnhancedDescriptor.prototype._unlist = function(forget) {
		this.state.discarded = true;	//TODO is this correct??? prevents discardNow				
		if (this.layout.enable) delete maintainedElements[this.uniqueID];
		if (sizingElements[this.uniqueID]) delete sizingElements[this.uniqueID];
		if (unfinishedElements[this.uniqueID]) delete unfinishedElements[this.uniqueID];
		if (forget) delete enhancedElements[this.uniqueID];
		this._null();
	};

	_EnhancedDescriptor.prototype._queueLayout = function() {

		if (this.layout.displayed != this.sizing.displayed) {
			this.layout.displayed = this.sizing.displayed;
			this.layout.queued = true;
		}

		if (this.layout.width != this.sizing.width || this.layout.height != this.sizing.height) {
			this.layout.oldWidth = this.layout.width;
			this.layout.oldHeight = this.layout.height;
			this.layout.width = this.sizing.width;
			this.layout.height = this.sizing.height;
			this.layout.queued = true;
		}
		if (this.layout.contentWidth != this.sizing.contentWidth || this.layout.contentHeight != this.sizing.contentHeight) {
			this.layout.oldContentWidth = this.layout.contentWidth;
			this.layout.oldContentHeight = this.layout.contentHeight;
			this.layout.contentWidth = this.sizing.contentWidth;
			this.layout.contentHeight = this.sizing.contentHeight;
			this.layout.queued = true;
		}
	};

	_EnhancedDescriptor.prototype._updateDisplayed = function() {
		this.sizing.displayed = !(this.sizing.width == 0 && this.sizing.height == 0);
	};

	_EnhancedDescriptor.prototype._updateDisplayedNotNone = function() {
		//TODO 
		this.placement.manually(["display"])
		this.sizing.displayed = this.placement.style.display != "none";
	};

	_EnhancedDescriptor.prototype.checkSizing = function() {

		var track = this.sizing.track;

		// update sizing with element state
		this.sizing.width = this.el[track.sizeBy+"Width"];
		this.sizing.height = this.el[track.sizeBy+"Height"];
		this._updateDisplayed();

		// seems to be displayed
		if (this.sizing.displayed) {
			this.placement.compute();
			if (track.contentWidth) this.sizing.contentWidth = this.el[track.contentBy+"Width"];
			if (track.contentHeight) this.sizing.contentHeight = this.el[track.contentBy+"Height"];
			if (track.scrollTop) this.sizing.scrollTop = this.el.scrollTop;
			if (track.scrollLeft) this.sizing.scrollLeft = this.el.scrollLeft;

			if (this.sizingHandler) this.sizingHandler(this.el,this.sizing,this.instance);
			if (this.laidout) this.laidout.calcSizing(this.el,this.sizing);
			if (this.context.layouterParent) this.context.layouterParent.calcSizing(this.el,this.sizing,this.laidout);

			if (this.sizing.forceLayout) {
				this.sizing.forceLayout = false;
				this.sizing.queued = true;
			}
			this._queueLayout();

		// not displayed, and was last time			
		} else if (this.layout.displayed) {
			this.layout.displayed = false;
			this.layout.queued = true;
		}
	};

    _EnhancedDescriptor.prototype.applyStyle = function() {
        for(var n in this.layout.style) {
            this.el.style[n] = this.layout.style[n];
        }
    };
 
	_EnhancedDescriptor.prototype.getController = function() {
		// _updateContext

		return this.context? this.context.controller : null;
	};

	_EnhancedDescriptor.prototype.query = function(selector) {
		var q = DescriptorQuery(selector,this.el);
		return q;
	}

	// used to emulate IE uniqueID property
	var lastUniqueID = 555;

	//TODO Resolver.setByUniqueID

	// Get the enhanced descriptor for and element
	//TODO move to put this function on the document resolver for the page
	function EnhancedDescriptor(el,role,conf,force,page) {
		// forced replacement, or called with parameters to make a descriptor, so not a lookup
		var makeIt = force || ((role || conf) && arguments.length>=3);
		if (el.uniqueID === undefined && makeIt) el.uniqueID = ++lastUniqueID;

		var uniqueID = el.uniqueID;
		var desc = enhancedElements[uniqueID];
		if (desc || !makeIt) return desc;

		if (page == undefined) {
			var pageResolver = Resolver("page");
			page = pageResolver(["pagesById",(el.ownerDocument || document).uniquePageID || "main"],"null");
			if (page == null) page = Resolver("essential::ApplicationConfig::")();
		}
		desc = new _EnhancedDescriptor(el,role,conf,page,uniqueID);
		enhancedElements[uniqueID] = desc;
		var descriptors = page.resolver("descriptors");
		descriptors[uniqueID] = desc;

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

		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			if (desc.inits.length>0) desc._init();
		}

		for(var n in sizingElements) {
			var desc = sizingElements[n];
			desc.checkSizing();
		}

        for(var n in maintainedElements) {
            var desc = maintainedElements[n];
 
            if (desc.laidout && desc.layout.enable && !desc.state.discarded) {
                desc.refresh();
            }
        }
		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			if (!desc.laidout && desc.layout.enable && !desc.state.discarded) {
				desc.refresh();
			}
		}
		for(var n in sizingElements) {
			var desc = sizingElements[n];
            if (desc.layout.style) {
                desc.applyStyle();
                desc.layout.style = undefined;
            }
			desc.layout.queued = false;
		}
	};

	EnhancedDescriptor.maintainAll = function() {
		if (document.body == undefined) return;

		for(var n in maintainedElements) {
			var desc = maintainedElements[n];

			desc.liveCheck();
			//TODO if destroyed, in round 2 discard & move out of maintained 
			if (desc.state.discarded) {
				if (desc.el) cleanRecursively(desc.el);
				desc._unlist(); // leave it in .all}
			}
		}
	};

	EnhancedDescriptor.get = function(unique) {
		if (typeof unique == "object") {
			if (unique.uniqueID) return this.all[unique.uniqueID];
			return null;
		}

		return this.all[unique];
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

	// roles that have a prepare handler can tweak the original DOM content
	Resolver.docMethod("prepareDomWithRole", function() {

		var pageResolver = Resolver("page"),
			handlers = pageResolver("handlers"), enabledRoles = pageResolver("enabledRoles");

		if (handlers.prepare) {
			for(var n in enabledRoles) {
				var prepare = handlers.prepare[n];
				if (prepare) {
					var withRole = document.body.querySelectorAll("[role="+n+ "]");
					for(var i=0,el; el = withRole[i]; ++i) {
						prepare(el,n);
					}
				}
			}
		}
	});

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

	Resolver("document")._ready = function()
	{
		this._readyFired = true;

		this.seal(true);

		try {
			//TODO ap config _queueAssets
			Generator.instantiateSingletons("page");
			this.prepareDomWithRole();
			if (!this.namespace.loading) EnhancedDescriptor.enhanceUnfinished();
			//TODO flag module "dom" as ready

			// body can now be configured in script
			var body = this.namespace.body;
			var conf = Resolver.config(body), role = body.getAttribute("role");
			if (conf || role) EnhancedDescriptor(body,role,conf);

		}
		catch(ex) {
			proxyConsole().error("Failed to launch delayed assets and singletons",ex);
		}
	};

	Resolver("document")._load = function() {
		this._loadFired = true;
		this.seal(true);

		Resolver("page").set("state.livepage",true);
		this.reflectModules();
	};

	Resolver("document")._unload = function()
	{
		//TODO singleton deconstruct / before discard?

		Resolver.unloadWriteStored();

		Generator.discardRestricted();

		discardEnhancedElements();
		enhancedWindows.discardAll();

		//TODO Resolver resetPageState method
		Resolver("page").set("state.launched",false);
		Resolver("page").set("state.livepage",false);
		Resolver("page").set("pages",null);
		Resolver("page").set("pagesById",null);
	};

	// iBooks HTML widget
	if (window.widget) {
		widget.notifyContentExited = function() {
			fireUnload();
		};
	}

	function fireReadyStateChange() {

		Resolver("document::readyState").trigger("change");
	}

	if (window.device) {
		//TODO PhoneGap support
	}
	else {
		if (document.readyState === "complete") {
			fireDomReady();
			fireReadyStateChange();
		} 

		if (win.addEventListener) {
			win.document.addEventListener("readystatechange",fireReadyStateChange,false);
		} else {
			win.document.attachEvent("onreadystatechange",fireReadyStateChange);
		}
	}

	// get active console
	// - modern browsers return window.console
	// - IE8/9 return stub that always works
	// - Can be overridden with custom impl
	// usage
	// > var mylog = Resolver("essential::console::")();
	// > mylog.log("hello");
	var proxyConsole = essential.set("console",function() {
		return proxyConsole.custom || window.console&&window.console.debug&&window.console || ie8Console;
	});
	proxyConsole.custom = null;
	proxyConsole.destination = {};

	// make custom logger
	// - the destination named can be set to silent
	// - destination.queue can be set to array instance to dump logs
	// - destination.queue.push can be customised to make streaming/file loggers
	// - destination.defaultLevel can be set to override level
	proxyConsole.logger = function(dest,level) {
		var _dest = essential.declare(["console","destination",dest],{}), _con = proxyConsole();
		return function() {
			if (_dest.silent) return;
			//TODO optionally add destination name to end of logged line
			_con[_dest.defaultLevel || level].apply(_con,arguments);
			//TODO push to level / push combination

			if (_dest.queue && typeof _dest.queue.push == "function") {
				_dest.queue.push([].concat(arguments));
			}
		};
	};

	var stubConsole = {
		log: function() { this.nil("log",arguments); },
		trace: function() { this.nil("trace",arguments); },
		debug: function() { this.nil("debug",arguments); },
		info: function() { this.nil("info",arguments); },
		warn: function() { this.nil("warn",arguments); },
		error: function() { this.nil("error",arguments); },
		group: function() { this.nil("group",arguments); },
		groupEnd: function() { this.nil("groupEnd",arguments); },
		nil: function(level,parts) {}
	};
	var setStubConsole = essential.declare("setStubConsole",function(stub) {
		proxyConsole.custom = stub || stubConsole;
	});

	function _ielog(name) {
		return function() {
			if (window.console) console[name](Array.prototype.join.call(arguments," "));
		};
	}

	var ie8Console = {
		log: _ielog("log"),
		trace: _ielog("trace"),
		debug: _ielog("debug"),
		info: _ielog("info"),
		warn: _ielog("warn"),
		error: _ielog("error"),
		group: _ielog("group"),
		groupEnd: _ielog("groupEnd")
	};
	//TODO start out with object that queues, switch to _ielog when window.console is first seen


	var setWindowConsole = essential.declare("setWindowConsole",function() {
		proxyConsole.custom = null;
	});


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
	var defaultLocale = window.navigator.userLanguage || window.navigator.language || "en-US"
	var dl = defaultLocale.split("-");
	if (dl.length>1) {
		dl[1] = dl[1].toUpperCase();
		defaultLocale = dl.join("-");
	}
	translations.declare("defaultLocale",defaultLocale);
	translations.declare("locale",defaultLocale);

	Resolver("document").on("change","essential.locale",function(ev) {
		translations.set("locale",ev.value);
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
		log = essential("console")(),
		EnhancedDescriptor = essential("EnhancedDescriptor"),
		isIE = navigator.userAgent.indexOf("; MSIE ") > -1 && navigator.userAgent.indexOf("; Trident/") > -1;

	essential.declare("baseUrl",location.href.substring(0,location.href.split("?")[0].lastIndexOf("/")+1));

	var base = document.getElementsByTagName("BASE")[0];
	if (base) {
		var baseUrl = base.href;
		if (baseUrl.charAt(baseUrl.length - 1) != "/") baseUrl += "/";
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
		//TODO attributes[0] changed to attributes[i], check that it fixes stuff
		for(var i=0,a; !!(a = src.attributes[i]); ++i) if (a.name != "was") _body.appendChild(a);
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
		if (/; MSIE /.test(navigator.userAgent)) {
			markup = markup.replace(/<!doctype [^>]*>/,"").replace(/<!DOCTYPE [^>]*>/,"");
			try {
				doc = document.implementation.createHTMLDocument("");
				doc.documentElement.innerHTML = markup;
			} catch(ex) {
				doc = document.implementation.createHTMLDocument("");
				doc.open();
				doc.write(markup);
				doc.close();
			}

		} 
		else if (/Gecko\/20/.test(navigator.userAgent)) {
			markup = markup.replace(/<!doctype [^>]*>/,"").replace(/<!DOCTYPE [^>]*>/,"");
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
			markup = markup.replace("</head>", IE_HTML_SHIM + "</head>");
			markup = markup.replace("</HEAD>", IE_HTML_SHIM + "</HEAD>");
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

		//TODO callback when document is loaded

		var doc = {}, // perhaps make DocumentFragment instead
			markup = _combineHeadAndBody(head,body),
			hasDoctype = markup.substring(0,9).toLowerCase() == "<!doctype";

		try {
			var ext = _createStandardsDoc(markup);
			doc.nodeType = ext.nodeType;
			doc.pseudoDocument = true;
			doc.documentElement = ext.documentElement;
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
			doc.documentElement = ext.documentElement;
			doc.nodeType = ext.nodeType;
			doc.pseudoDocument = true;
			doc.body = _importNode(document,ext.head,true);
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


	function AllEvents(type,init,copy) { this.type=type;this.init=init;this.copy=copy; }
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
	MouseEvents.prototype = new AllEvents("MouseEvents",initMouseEvent,copyMouseEvent);

	function MouseOverOutEvents(m) {
		this.__(m);
	}
	MouseOverOutEvents.prototype = new AllEvents("MouseEvents",initMouseEvent,copyMouseEventOverOut);

	function KeyEvents(m) {
		this.__(m);
	}
	KeyEvents.prototype = new AllEvents("KeyboardEvent",initEvent,copyKeyEvent);
	
	function InputEvents(m) {
		this.__(m);
	}
	InputEvents.prototype = new AllEvents("FocusEvent",initFocusEvent,copyInputEvent);
	InputEvents.prototype.cancelable = false;

	function FocusEvents(m) {
		this.__(m);
	}
	FocusEvents.prototype = new AllEvents("FocusEvent",initFocusEvent,copyInputEvent);
	FocusEvents.prototype.cancelable = false;

	function UIEvents(m) {
		this.__(m);
	}
	UIEvents.prototype = new AllEvents("UIEvent",initUIEvent,copyNavigateEvent);
	UIEvents.prototype.cancelable = false;


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

		// log.log("deltas",{x:deltaX,y:deltaY},"scrollLeft",this.target.scrollLeft);

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
		var element = this._original? this._original.target : this.target;
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
			else log.warn("unhandled essential event",src.type,src);
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
		
		var e = _doc.createElement(_tagName), enhanced = false, enhance = false, appendTo, src;
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
						if (/cachebuster=/.test(_from[n])) {
							src = _from[n].replace(/cachebuster=*[0-9]/,"cachebuster="+ String(new Date().getTime()));
						} else src = _from[n];
					}
					if (src) e[n] = src; 
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
				case "async":
				case "lang":
				case "language":
					if (_from[n] !== undefined) e[n] = _from[n]; 
					break;

				case "set impl":
					if (_from[n]) e.impl = HTMLElement.impl(e);
					break;

				case "append to":
					appendTo = _from[n];
					break;
				case "enhanced element":
					enhanced = _from[n];
					break;
				case "enhance element":
					enhance = _from[n];
					break;
				case "make stateful":
					essential("StatefulResolver")(e,_from[n]);
					break;
				//TODO "set state" make stateful & mixin to "state."

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

		if (appendTo) appendTo.appendChild(e);
		if (enhanced) HTMLElement.query([e]).queue();
		if (enhance) HTMLElement.query([e]).enhance();
		
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

		if (!leaveInDom && el.parentNode) el.parentNode.removeChild(el);
	};

	
	//TODO element cleaner must remove .el references from listeners

	// this = element
	function regScriptOnload(domscript,trigger) {
		function onload(ev) {
			if ( ! this.onloadDone ) {
				this.onloadDone = true;
				trigger.call(this,ev || event); 
			}
		}

		function onreadystatechange(ev) {
			if ( ( "loaded" === this.readyState || "complete" === this.readyState ) && ! this.onloadDone ) {
				this.onloadDone = true; 
				trigger.call(this,ev || event);
			}
		}

		if (domscript.addEventListener) {
			domscript.addEventListener("load",onload,false);
		} else {
			domscript.onload = onload;
			domscript.onreadystatechange = onreadystatechange;
		}
	}

	//TODO regScriptOnnotfound (onerror, status=404)

	function HTMLScriptElement(from,doc) {
		return HTMLElement("SCRIPT",from,doc);
	}
	essential.set("HTMLScriptElement",HTMLScriptElement);

	function _ElementPlacement(el,track,calcBounds) {
		this.bounds = {};
		this.style = {};
		this.track = track || ["display","visibility","marginLeft","marginRight","marginTop","marginBottom"];
		this.calcBounds = calcBounds;

		this.compute(el || null);
	}
	var ElementPlacement = essential.declare("ElementPlacement",Generator(_ElementPlacement));

	_ElementPlacement.prototype.setElement = function(newEl) {
		this.el = newEl;
		this.computes = [];

		//TODO dedicated compute functions
		if (this.el && this.el.currentStyle &&(document.defaultView == undefined || document.defaultView.getComputedStyle == undefined)) {
			this._setComputed = this._setComputedIE;
			this._compute = this._computeIE;
		}
		if (document.body.getBoundingClientRect().width == undefined) {
			this._bounds = this._boundsIE;
		}

		if (this.calcBounds === false) this._bounds = function() {};

		this.doCompute = !(this.el == null || this.el.nodeType !== 1);

		this.computes = this._getComputes(this.track);
	};

	_ElementPlacement.prototype.setTrack = function(track) {
		this.track = track;
		this.computes = this._getComputes(this.track);
	};

	_ElementPlacement.prototype._getComputes = function(names) {

		var computes = [];
		for(var i=0,s; this.doCompute && !!(s = names[i]); ++i) {
			switch(s) {
				case "display":
				case "visibility":
				// case "zIndex":
				case "breakBefore":
				case "breakAfter":
					computes.push(this._compute_simple);
					break;
				default:
					computes.push(this._compute);
					break;
			}
		}
		return computes;
	};

	_ElementPlacement.prototype.compute = function(newEl) {
		if (newEl != undefined) this.setElement(newEl);

		if (newEl == undefined || contains(document.body,newEl)) {

			if (this.doCompute) {
				if (this.calcBounds !== false) this._bounds();
				this._setComputed();

				for(var i=0,fn; !!(fn = this.computes[i]); ++i) {
					this.style[this.track[i]] = fn.call(this,this.track[i]);
				}
			}
		} 
		// else ignore (could queue for compute)
	};

	_ElementPlacement.prototype.manually = function(names) {
		var computes = this._getComputes(names);
		this._setComputed();
		for(var i=0,fn; fn = computes[i]; ++i) {
			this.style[names[i]] = fn.call(this,names[i]);
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

	//TODO generate based on currentStyle
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

		'breakBefore': 'break-before',
		'breakAfter': 'break-after',
		
		'fontSize': 'font-size',
		'lineHeight': 'line-height',
		'textIndent': 'text-indent'
		
	};

	//TODO inverted CSS_NAME
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

		'break-before': 'breakBefore',
		'break-after': 'breakAfter',
		'alt breakBefore': 'pageBreakBefore',
		'alt breakAfter': 'pageBreakAfter',
		
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
		var inlineStyle = eElement.style[sProp];
		var runtimeStyle = eElement.runtimeStyle[sProp];
		try
		{
			eElement.runtimeStyle[sProp] = eElement.currentStyle[sProp];
			eElement.style[sProp] = sValue || 0;
			sValue = eElement.style[sPixelProp] + "px";
		}
		catch(ex)
		{
			
		}
		eElement.style[sProp] = inlineStyle;
		eElement.runtimeStyle[sProp] = runtimeStyle;

		return sValue;
	};
}


_ElementPlacement.prototype.TO_PIXELS_IE = {
	"left": _makeToPixelsIE("left"),
	"top": _makeToPixelsIE("top"),
	"size": _makeToPixelsIE("left")
};

_ElementPlacement.prototype._compute_simple = function(name) {
	var altName = this.JS_NAME["alt "+name],
		inlineStyle = this.el.style[name] || this.el.style[altName];
	if (inlineStyle) return inlineStyle;

	if (this.el.currentStyle) {
		return this.el.currentStyle[name] || this.el.currentStyle[altName];
	} else {
		return this._computed[name] || this._computed[altName]
	}
};

_ElementPlacement.prototype._setComputed = function()
{
	this._computed = document.defaultView.getComputedStyle(this.el, null);
};

_ElementPlacement.prototype._compute = function(name)
{
	var value = this._computed[name];
	//TODO do this test at load to see if needed
	if (typeof value == "string" && value.indexOf("%")>-1) {
		value = this.el[this.OFFSET_NAME[name]] + "px";
	}
		
	return value;
};

_ElementPlacement.prototype._setComputedIE = function()
{
};

_ElementPlacement.prototype._computeIE = function(style)
{
	var value;
	
	//TODO prepare this when setting track
	style = this.JS_NAME[style] || style;

	var v = this.el.currentStyle[style];
	var sPrecalc = this.KEYWORDS[v];
	if (sPrecalc !== undefined) return sPrecalc;
	if (v == "0" || (v.substring(v.length-2) == "px")) return v; 

	var fToPixels = this.TO_PIXELS_IE[this.CSS_TYPES[style]];
		value = fToPixels? fToPixels(this.el, v) : v;
		
	return value;
};


}();


// set("bodyResolver")

Resolver.docMethod("require",function(path) {
    if (this("essential.modules")[path] == undefined) {
        var ex = new Error("Missing module '" + path + "'");
        ex.ignore = true;
        throw ex;   
    } 
});

	//TODO resolver.exec("callInits",null)
Resolver.docMethod("callInits",function() {
	var inits = this("essential.inits");
	for(var i=0,fn; fn = inits[i]; ++i) if (!fn.done) {
		try {
			fn.call(fn.context || {});
			fn.done = true;
		} catch(ex) {
			// debugger;
		} //TODO only ignore ex.ignore
	}
});

//TODO Resolver.document.essential.elementsWithConfig = [];

/* 
	Resolver.config(document,'declare(..); declare("..")');
	var conf = Resolver.config(el)
*/
Resolver.config = function(el,script) {
	var log = Resolver("essential::console::")(),
		HTMLElement = Resolver("essential::HTMLElement::");
	var _singleQuotesRe = new RegExp("'","g");


	function _getRoleConfig(resolver, el,key) {
		//TODO cache the config on element.stateful

		var config = null, doc = resolver.namespace,
			ref = resolver.reference("essential.config","null"),
			appliedConfig = resolver("essential.appliedConfig");

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
		var dataRole = HTMLElement.fn.describeAttributes(el,Resolver.config.ROLE_POLICY)["data-role"];
		if (dataRole) {
			config = config || {};
			if (dataRole.error) {
				log.debug("Invalid config: ",dataRole);
				config["invalid-config"] = dataRole.error;
			}
			else for(var n in dataRole.props) config[n] = dataRole.props[n];
		}

		return config;
	}


	var doc = el.nodeType == 9? el : el.ownerDocument, docResolver = Resolver(doc);
	if (docResolver == null) return null; // if not known document

	if (script) {
		if (typeof script == "string") script = Resolver.functionProxy(script);
		var context = docResolver.reference("essential.config");
		//TODO extend the reference with additional api
		try {
			script.call(context);
		} catch(ex) {
			Resolver("essential::console::")().error("Failed to parse application/config",script.text);
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

Resolver.config.ROLE_POLICY = {
	DECORATORS: {
		"data-role": {
			props: true
		}
	}
};

Resolver.resolverFromElement = function(el,expr) {
	if (!expr) expr = "stateful(0)";

	//TODO consider optional force flag and support el(..)

	if (expr.substring(0,9) == "stateful(") {
		for(var jumps = parseFloat(expr.substring(9,expr.length-1)), sel = el; sel && jumps>0;--jumps) { 

			do { sel = sel.parentNode; } while(sel && sel.stateful == undefined);
		}
		return sel? sel.stateful : el.stateful;
	} else {
		return Resolver(expr);
	}

	return resolver;
};

Resolver.exec = function(resolver,expr,onundefined,cmd,value) {
	//TODO resolver.exec(expr,onundefined,cmd,value);
	switch(cmd) {
		case "toggle":
			resolver.toggle(expr);
			break;
		case "true":
			resolver.set(expr,true);
			break;
		case "false":
			resolver.set(expr,false);
			break;
		case "blank":
			resolver.set(expr,"");
			break;
		case "remove":
			resolver.remove(expr);
			break;
		case "=":
		case "set":
			resolver.set(expr,value);
			break;
		case "declare":
			resolver.declare(expr,value);
			break;
	}

};

!function() {
	var essential = Resolver("essential"),
		HTMLElement = essential("HTMLElement"),
		HTMLScriptElement = essential("HTMLScriptElement"),
		addEventListeners = essential("addEventListeners");

	function addHeadScript(text,doc) {

		//TODO support adding to other sub-documents
		if (false) {
			HTMLElement("script",{
				"append to": doc.head
			},text);	
		}
		else doc.write('<script>'+text+'</'+'script>')

	}

	function describeLink(link,lang) {

		var attrsStr = link.getAttribute("attrs");
		var attrs = {};
		if (attrsStr) {
			try {
				eval("attrs = {" + attrsStr + "}");
			} catch(ex) {
				//TODO
			}
		}
		attrs["rel"] = link.rel || attrs.rel;
		attrs["stage"] = link.getAttribute("stage") || attrs.stage || undefined;
		attrs["type"] = link.type || link.getAttribute("type") || attrs.type || "text/javascript";
		attrs["name"] = link.getAttribute("data-name") || link.getAttribute("name") || attrs.name || undefined;
		attrs["content"] = link.getAttribute("content") || attrs.content || undefined;
		attrs["base"] = essential("baseUrl");
		attrs["subpage"] = (link.getAttribute("subpage") == "false" || link.getAttribute("data-subpage") == "false")? false:true;
		//attrs["id"] = link.getAttribute("script-id");
		attrs["onload"] = flagLoaded;

		attrs["src"] = (link.href || link.getAttribute("src") || attrs.src || "").replace(essential("baseUrl"),"");

		switch(attrs.type) {
			case "text/javascript":
				attrs.stage = "loading";
				break;
			case "text/javascript+preloading":
			case "text/javascript+authenticated":
				var s = attrs.type.split("+");
				attrs.type = s[0];
				attrs.stage = s[1];
				break;

			//TODO XHR for others
		}

		return attrs;
	}

	function flagLoaded() {
		var name = this.getAttribute("data-module"); 

		setTimeout(function(){
			Resolver("document").setModuleLoaded(name,true);
		},0);
	}

	function Module(name) {this.name=name;}

	Module.prototype.scriptMarkup = function(subpage) {
		var loaded = "Resolver('document').setModuleLoaded(this.getAttribute('data-module'), true);",
			attr = subpage? "" : " defer";
		return '<script src="' + this.attrs.src + '" data-module="'+ this.name +'" onload="'+loaded+'"'+attr+'></'+'script>';
	};

	Module.prototype.addScript = function() {
		document.write(this.scriptMarkup());
		this.added = true;
		// console.log("added script",this.name);
	};

	Module.prototype.addScriptAsync = function() {
		// var src = this.attrs.src;
		this.attrs["append to"] = this.link.ownerDocument.head;
		// this.attrs.src = undefined;
		this.attrs.async = false;

		HTMLScriptElement(this.attrs);
		this.added = true;
		console.log("added script",this.name);
	};

	var pendingScripts = [];
	var firstScript = document.scripts[0];

	// Watch scripts load in IE
	function stateChange() {
	  // Execute as many scripts in order as we can
	  while (pendingScripts[0] && pendingScripts[0].readyState == 'loaded') {
	    var pendingScript = pendingScripts.shift();
	    // avoid future loading events from this script (eg, if src changes)
	    pendingScript.onreadystatechange = null;
	    // can't just appendChild, old IE bug if element isn't closed
	    firstScript.parentNode.insertBefore(pendingScript, firstScript);
	    flagLoaded.call(pendingScript);
	  }
	}	

	Module.prototype.addScriptIE = function() {

    	var script = document.createElement('script');
	    pendingScripts.push(script);
	    // listen for state changes
	    script.onreadystatechange = stateChange;
	    // must set src AFTER adding onreadystatechange listener
	    // else we’ll miss the loaded event for cached scripts
	    script.src = src;
		this.added = true;
	};

	if (firstScript) {
		if ('async' in firstScript) Module.prototype.addScript = Module.prototype.addScriptAsync;
		else if (firstScript.readyState) Module.prototype.addScript = Module.prototype.addScriptIE;
	} 

	Module.prototype.queueHead = function(stage,lang) {
		if (this.loaded || this.added) return;
		var langOk = (lang && this.link.lang)? (this.link.lang == lang) : true; //TODO test on add script
		if (this.attrs.stage==stage && langOk) this.addScript();
	};

	Resolver.docMethod("setModuleLoaded",function(name,loaded) {
		this.set(["essential","modules",name,"loaded"], loaded==undefined? true:loaded);
		this.reflectModules();
		if (document.body) Generator.instantiateSingletons("page");
	});

	Resolver.docMethod("setResourceAvailable",function(name,available) {
		if (this.namespace.essential.resources[name] == undefined) t
		this.set(["essential","resources",name,"available"], available==undefined? true:available);
		this.reflectModules();
		if (document.body) Generator.instantiateSingletons("page"); // perhaps move to common place
	});

	Resolver.docMethod("reflectModules", function() {
		var modules = this.namespace.essential.modules,
			resources = this.namespace.essential.resources;
		var flags = { loadingScripts:false, launchingScripts:false, loadingResources:false };
		var authenticated = Resolver("page::state.authenticated::");

		for(var n in modules) {
			var m = modules[n];
			if (m.attrs.type == "text/javascript") {
				if (! m.added) {
					if (m.attrs.stage == "authenticated" && authenticated) {
						m.addScript();
					}
				} else if (!m.loaded) {
					if (m.attrs.stage=="preloading" || m.attrs.stage=="loading") flags.loadingScripts = true;
					else flags[m.attrs.stage + "Scripts"] = true;
				}
			} 

			//TODO other types of modules
		}
		for(var n in resources) {
			var r = resources[n];
			if (r.required && (!r.available || !r.loaded)) {
				flags.loadingResources = true;
			}
		}

		this.set("essential.loading", flags.loadingScripts || flags.loadingResources);
		// Maybe/Maybe not, if (!flags.loadingScripts && !flags.loadingResources) this.callInits();
		//TODO set loading/launching
	});

	function queueModule(link,attrs) {
		var name = attrs.name || attrs.src; 

		var module = Resolver("document").declare(["essential","modules",name],new Module(name));
		module.link = link;
		module.attrs = attrs;
		module.attrs["data-module"] = module.name;
	}

	function useBuiltins(doc,list) {
		for(var i=0,r; r = list[i]; ++i) Resolver(doc).set(["essential","enabledRoles",r],true);
	}

    function readCookie(doc,id) {
        var wEQ = id + "=";
        var ca = doc.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(wEQ) == 0) return c.substring(wEQ.length,c.length);
        }
        return undefined;
    }

    function scanElements(doc,els) {
    	var resolver = Resolver(doc), inits = resolver("essential.inits"); 

		for(var i=0,el; el = els[i]; ++i) switch(el.tagName){
			case "meta":
			case "META":
				var attrs = describeLink(el);
				switch(attrs.name) {
					case "enhanced roles":
						if (!el.__applied__) useBuiltins(doc, (el.getAttribute("content") || "").split(" "));
						break;

					//TODO enhanced tags

					case "track main":
						if (this.opener) {
							// document.appstate.set("state.managed",true);
							// docResolver.set("essential.state.managed",true);
							Resolver("page").set("state.managed",true);
						}
						break;

					case "text selection":
						if (!el.__applied__) textSelection((el.getAttribute("content") || "").split(" "));
						break;

					case "lang cookie":
			            var value = readCookie(doc,attrs.content) || readCookie(document, attrs.content);
			            if (value != undefined) {
			                value = decodeURI(value);
			                resolver.set("essential.lang",value);
			            }
						break;

					case "locale cookie":
			            var value = readCookie(doc,attrs.content) || readCookie(document,attrs.content);
			            if (value != undefined) {
			                value = decodeURI(value);
			                resolver.set("essential.locale",value);
			                var s = value.toLowerCase().replace("_","-").split("-");
			                resolver.set("essential.lang",s[0]);
			            }
						break;

				}
				el.__applied__ = true;
				break;

			case "link":
			case "LINK":
				switch(el.rel) {
					// case "stylesheet":
					// 	this.resources().push(l);
					// 	break;			
					case "subresource":
					//case "preload":
					//case "load":
					//case "protected":
					//case "stylesheet":
						if (!el.__applied__) queueModule(el,describeLink(el));
						break;
				}
				el.__applied__ = true;
				break;

			case "script":
			case "SCRIPT":
				var attrs = describeLink(el);
				if (!el.__applied__) switch(attrs.type) {
					case "application/config":
						//TODO try catch log for parse errors
						Resolver.config(doc, el.text);
						break;
					case "application/init": 
						//TODO try catch log for parse errors
						var init = Resolver.functionProxy(el.text);
						init.context = new resolver.InitContext(el);
						inits.push(init);
						break;
					default:
						if (attrs.name && attrs.src == null) resolver.set("essential.modules",name,true); 
						break;
				}
				el.__applied__ = true;
				break;
		}

    }

	function scanHead(doc) {
		var resolver = Resolver(doc), inits = resolver("essential.inits");

		//TODO support text/html use base subpage functionality

		scanElements(doc, doc.head.children);

		// default is english (perhaps make it configurable)
		if (doc.documentElement.lang == "") doc.documentElement.lang = "en";
		if (doc.defaultLang == undefined) doc.defaultLang = doc.documentElement.lang;
	}

	Resolver.docMethod("queueHead", function(addSeal) {
		var doc = this.namespace, essential = doc.essential;
		scanHead(doc);

		for(var n in essential.modules) {
			essential.modules[n].queueHead("preloading",doc.documentElement.lang);
		}		
		if (addSeal !== false) addHeadScript('Resolver("document").seal();',doc);

		// this.reflectModules();	
	});

	Resolver.docMethod("seal",function(sealBody) {
		var essential = this.namespace.essential, doc = this.namespace;

		if (! essential.headSealed) {
			scanHead(doc);
			for(var n in essential.modules) {
				essential.modules[n].queueHead("loading",document.documentElement.lang);
			}		
			essential.headSealed = true;
		}
		if (sealBody && ! essential.bodySealed) {
			var scripts = doc.body.getElementsByTagName("script");
			scanElements(doc,scripts); //TODO use doc.scripts instead?

			for(var n in essential.modules) {
				essential.modules[n].queueHead("loading",document.documentElement.lang);
			}		
			essential.bodySealed = true;
		}
		this.reflectModules();
	});

	function textSelection(tags) {
		var pass = {};
		for(var i=0,n; n = tags[i]; ++i) {
			pass[n] = true;
			pass[n.toUpperCase()] = true;
		}

		var MutableEvent = Resolver("essential::MutableEvent::");
		
		//TODO Resolver.enhanceDocument(doc)
		//TODO test that this works, and register it regardless, just change the config
		addEventListeners(document.documentElement, {
			"selectstart": function(ev) {
				ev = MutableEvent(ev);
				var allow = false;
				for(var el = ev.target; el; el = el.parentNode) {
					if (pass[el.tagName || ""]) allow = true;
				} 
				if (!allow) ev.preventDefault();
				return allow;
			}
		}, true); // capture
	}




}();

Resolver.create("document",document);
Resolver.nm.document.declare("essential.appliedConfig",{});


/*
	StatefulResolver and ApplicationConfig
*/
!function() {

	var essential = Resolver("essential",{}),
		essentialRef = Resolver("document::essential"),
		log = essential("console")(),
		DOMTokenList = essential("DOMTokenList"),
		MutableEvent = essential("MutableEvent"),
		ensureCleaner = essential("ensureCleaner"),
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
			if (this.aria) el.setAttribute("aria-"+key,this["true"] || "true");
			el.setAttribute(this.html5,this["true"] || "true");
		} else {
			if (this.aria) el.removeAttribute("aria-"+key);
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
		expanded: { index: 5, reflect: reflectBoolean, read: readBoolean, aria:"ariaExpanded" }, //TODO ariaExpanded
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

		var mapClass = el.stateful? el.stateful("map.class","undefined") : null;
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
		//TODO consider when to clean body element
		ensureCleaner(el,statefulCleaner);
		if (useAsSource != false) readElementState(el,stateful("state"));
		stateful.on("change reflect","state",el,reflectElementState); //TODO "livechange", queues up calls while not live
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

		if (el) {
			stateful.reflectStateOn(el);
			stateful.uniqueID = el.uniqueID;
		}
		
		return stateful;
	}
	essential.declare("StatefulResolver",StatefulResolver);

	var pageResolver = StatefulResolver(null,{ name:"page", mapClassForState:true });

	// application/config declarations on the main page
	pageResolver.declare("config",Resolver("document::essential.config::"));

	// descriptors for elements on main page to enhance
	pageResolver.declare("descriptors",Resolver("document::essential.descriptors::"));

	pageResolver.reference("state").mixin({
		"livepage": false,
		"background": false, // is the page running in the background
		"managed": false, // managed by a main window
		"authenticated": true,
		"authorised": true,
		"connected": true,
		"online": true, //TODO update
		//"preloading": false,
		"loading": true,
		"configured": true,
		"fullscreen": false,
		"launching": false, 
		"launched": false,

		"lang": essentialRef("lang")
		});

	Resolver("translations").on("change bind","locale",function(ev) {
		var s = ev.value.split("-");
		if (s.length == 1) s = ev.value.split("_");
		if (Resolver.exists("page")) pageResolver.set("state.lang",s[0]);
	});

	Resolver("document").on("change","essential.lang",function(ev) {
		if (Resolver.exists("page")) pageResolver.set("state.lang",ev.value);
	});


	pageResolver.reference("connection").mixin({
		"loadingProgress": "",
		"status": "connected",
		"detail": "",
		"userName": "",
		"logStatus": false
	});

	pageResolver.declare("enabledRoles",Resolver("document::essential.enabledRoles::"));
	pageResolver.declare("handlers",Resolver("document::essential.handlers::"));

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
			stateful.reference("state."+n,"null").trigger("reflect");
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
	var _activeAreaName;

	function activateArea(areaName) {
		if (! pageResolver("state.livepage")) { //TODO switch to pageResolver("livepage")
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

	function launchWindows() {
		for(var i=0,w; w = enhancedWindows[i]; ++i) if (w.openWhenReady) {
			w.openNow();
			delete w.openWhenReady;
		}
		EnhancedWindow.prototype.open = EnhancedWindow.prototype.openNow;

		//TODO if waiting for initial page src postpone this
	}
	essential.set("launchWindows",launchWindows);

	// page state & sub pages instances of _Scripted indexed by logical URL / id
	pageResolver.declare("pages",{});
	pageResolver.declare("pagesById",{});
	pageResolver.declare("state.requiredPages",0);

	function _Scripted() {
		// the derived has to define resolver before this
		this.config = this.resolver.reference("config","undefined"); // obsolete
		this.resolver.declare("resources",[]);
		this.resources = this.resolver.reference("resources");
	}

	//TODO migrate to Resolver.config support
	_Scripted.prototype.declare = function(key,value) {
		this.config.declare(key,value);
		if (typeof value == "object") {
			if (value["introduction-area"]) this.resolver.declare("introduction-area",value["introduction-area"]);
			if (value["authenticated-area"]) this.resolver.declare("authenticated-area",value["authenticated-area"]);
		}
	}; 

	//config related, TODO review
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

	//TODO move to DescriptorQuery, move when improving scroller
	_Scripted.prototype._prep = function(el,context) {

		var e = el.firstElementChild!==undefined? el.firstElementChild : el.firstChild;
		while(e) {
			if (e.attributes) {
				var conf = Resolver.config(e), role = e.getAttribute("role");
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

		//TODO change

		//TODO call prepare handlers and identify the elements to enhance
		// DescriptorQuery(this.body).withBranch().queue();

		this._prep(this.body,{});
	};

	_Scripted.prototype._queueAssets = function() {
		//TODO additional links queue in modules
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
		if (this.uniquePageID) {
			delete Resolver("page::pagesById::")[this.uniquePageID];
		}
	};

	SubPage.prototype.page = function(url) {
		log.error("SubPage application/config cannot define pages ("+url+")",this.url);
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
		Resolver(doc).seal(true);
		this.uniquePageID = doc.uniquePageID;
		pageResolver.set(["pagesById",this.uniquePageID],this);
		this.head = doc.head;
		this.body = doc.body;
		this.documentLoaded = true;

		this.prepareEnhance();
		// DescriptorQuery(this.body).withBranch().queue();

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
		Resolver(doc).seal(true);
		this.uniquePageID = doc.uniquePageID;
		pageResolver.set(["pagesById",this.uniquePageID],this);
		this.head = doc.head;
		this.body = doc.body;
		this.documentLoaded = true;

		this.resolver.declare("handlers",pageResolver("handlers"));
		this.prepareEnhance();
		// DescriptorQuery(this.body).withBranch().queue();
	};

	SubPage.prototype.applyBody = function() {
		var e = this.body.firstElementChild!==undefined? this.body.firstElementChild : this.body.firstChild,
			db = document.body,
			fc = db.firstElementChild!==undefined? db.firstElementChild : db.firstChild;

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

		// debugger;
		var subResolver = Resolver(this.document);
		Resolver("document").set(["essential","appliedConfig",subResolver.uniquePageID],subResolver("essential.config"));
		subResolver.callInits();

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

		var subResolver = Resolver(this.document);
		Resolver("document").set(["essential","appliedConfig",subResolver.uniquePageID],undefined);

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

	//TODO emit modules injection
	SubPage.prototype.getHeadHtml = function() {
		var links = document.getElementsByTagName("link"),
			modules = essentialRef("modules"),
			p = [],
			base = "";

		for(var i=0,l; l = links[i]; ++i) {
			if (l.rel == "stylesheet" && this.doesElementApply(l)) p.push( outerHtml(l) );
		}
		for(var u in modules) {
			var module = modules[u];
			base = module.attrs.base;
			if (this.doesElementApply(module)) p.push( module.scriptMarkup(true) );
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
		//log.log("online status",navigator.onLine,ev);
		var online = window.navigator? window.navigator.onLine : true;
		if (online != undefined) {
			pageResolver.set(["state","online"],online);	
		}
	}
	updateOnlineStatus.frequency = 0; // set this to 5000 to check it every 5 seconds
	essential.set("updateOnlineStatus",updateOnlineStatus);

	function _ApplicationConfig() {
		this.resolver = pageResolver;
		//TODO kill it on document, it's a generator not a fixed number, pagesByName
		this.uniquePageID = document.uniquePageID;
		this.resolver.set(["pagesById",this.uniquePageID],this);
		this.document = document;
		this.head = this.document.head || this.document.body.previousSibling;
		this.body = this.document.body;
		_Scripted.call(this);

		// copy state presets for backwards compatibility
		var state = this.resolver.reference("state","undefined");
		for(var n in this.state) state.set(n,this.state[n]);
		this.state = state;
		document.documentElement.lang = this.state("lang");

		this.pages = this.resolver.reference("pages",{ generator:SubPage });
		SubPage.prototype.appConfig = this;

		pageResolver.reflectStateOn(document.body,false);
		this.prepareEnhance();
		// DescriptorQuery(this.body).withBranch().queue();

		this._markPermanents(); 
		this.applied = true; // descriptors are always applied
		var descs = this.resolver("descriptors");
		for(var n in descs) {
			EnhancedDescriptor.unfinished[n] = descs[n];
		}

		var bodySrc = document.body.getAttribute("data-src") || document.body.getAttribute("src");
		if (bodySrc) this._requiredPage(bodySrc);
	}

	var ApplicationConfig = essential.set("ApplicationConfig", Generator(_ApplicationConfig,{
		"prototype": _Scripted.prototype,
		"discarded": function(ac) {

			delete Resolver("page::pagesById::")[ac.uniquePageID];

			//TODO blank member vars config on generator
			ac.document = null;
			ac.head = null;
			ac.body = null;
			ac.resolver = null;
			ac.config = null;
			ac.resources = null;
			// ac.pages = null;
			// ac.state = null;
		}
	}) );
	
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
		//TODO allow marking it as protected
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
			if (desc && !desc.state.initDone) desc._init();
		}

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

	function appInits() {
		if (document.body) {
			Generator.instantiateSingletons("page");
			Resolver.nm.document.callInits();
		}
		enhanceUnfinishedElements();
	}

	Resolver("document").on("change","essential.loading",function(ev) {
		pageResolver.set("state.loading",ev.value);
	});

	pageResolver.on("change","state", onStateChange);

	function onStateChange(ev) {
		var b = ev.base;
		switch(ev.symbol) {
			case "livepage": 
				if (ev.value) {
					var ap = ApplicationConfig();

					Resolver.nm.document.callInits();
					enhanceUnfinishedElements();

					if (_activeAreaName) {
						activateArea(_activeAreaName);
					} else {
						if (ev.base.authenticated) activateArea(ap.getAuthenticatedArea());
						else activateArea(ap.getIntroductionArea());
					}
				}
				break;

			case "loading":
				if (ev.value == false) {
					appInits();
					if (window.widget) widget.notifyContentIsReady(); // iBooks widget support
					if (b.configured && b.authenticated 
						&& b.authorised && b.connected && !b.launched) {
						this.set("state.launching",true);
						// do the below as recursion is prohibited
						if (document.body) Generator.instantiateSingletons("page");
						enhanceUnfinishedElements();
					}
				} 
				else return; // temp fix for setting loading = true during tests
				break;
			case "authenticated":
				if (b.livepage) {
					Resolver("document").reflectModules();
					// updateScripts(document,b);
					var ap = ApplicationConfig();
					if (b.authenticated) activateArea(ap.getAuthenticatedArea());
					else activateArea(ap.getIntroductionArea());
				}
				// no break
			case "authorised":
			case "configured":
				if ( !b.loading && b.configured && b.authenticated 
					&& b.authorised && b.connected && !b.launched) {
					this.set("state.launching",true);
					appInits();
				}
				break;			
			case "launching":
				if (ev.value == true) {
					appInits();
				}
				break;
				//TODO autoLaunch on launchingScripts changing
			case "launched":
				if (ev.value == true) {
					appInits();
					if (b.requiredPages == 0) this.set("state.launching",false);
				} else {
					Resolver("essential::EnhancedDescriptor.discardAll::")(); //TODO allow marking elements that survive unlaunch
				}
				break;
			case "requiredPages":
				if (ev.value == 0 && !b.launching) {
					this.set("state.launching",false);
				}
				break;
			case "lang":
				document.documentElement.lang = ev.value;
				break;
			
			default:
				if (b.loading==false && b.launching==false && b.launched==false) {
					if (document.body) Generator.instantiateSingletons("page");
				} 
		}

		if (ev.symbol == "launching" && b.launching && b.authenticated) {
			//TODO only do if not already done.
			var modules = essentialRef("modules");
			for(var n in modules) {
				modules[n].queueHead("authenticated",document.head.lang);
			}		
		}

		//TODO switch to launched when all resources & modules required are loaded

		// should this be configurable in the future?
        if (b.launched && (!b.authorised || !b.authenticated) && b.autoUnlaunch !== false) {
            this.set("state.launched",false);
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

}();

/*!
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
!function () {
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{}),
		ObjectType = essential("ObjectType"),
		log = essential("console")(),
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
		if (!attrs || attrs["class"] !== undefined) {
		 	dst.className = dst.className? dst.className + " " + src.className : src.className;
		}
		if (!attrs || attrs["style"] !== undefined && src.style.cssText != "") {
			dst.style.cssText = src.style.cssText;
		}
		if (!attrs) {
			for(var i=0,a; a = src.attributes[i]; ++i) {
				var n = a.name;
				if (this.IGNORE_ATTRIBUTES[n]) continue;
				var value = src.getAttribute(n);
				if (value != null) dst.setAttribute(n,value);
				else dst.removeAttribute(n);	
			}
		} else {
			for(var n in attrs) {
				if (n == "class" || n == "style") continue;
				var value = src.getAttribute(n);
				if (value != null && value !== attrs[n]) {
					dst.setAttribute(n,value);
				}
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
		"data-role":"",
		"name": "",
		"id": "",
		"title": "",
		"dir": "",
		"lang": "",
		"language": "",
		"accesskey": "",
		"tabindex": 0
	};

	HTMLElement.fn.IGNORE_ATTRIBUTES = {
		"class": true,
		"classList": true,
		"style": true,
		"layouter": true,
		"laidout": true,
		"impl": true,
		"stateful": true,
		"_cleaners": true
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

	function parseProps(value) {
		var parts = value.split(";"), props = {};
		for(var i=0,prop,part; part = parts[i]; ++i) {
			prop = part.split(":");
			if (prop.length<2) throw Error("Configuration definitions must be divided by colon.");
			props[ prop.shift().replace(/ /g,"") ] = prop.join(":").replace(/^ +/,"");
		}
		return props;
	}

	var _singleQuotesRe = new RegExp("'","g");

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
	        	
	        	if (decorators[name].props) {
	        		//TODO catch parse failure and flag it in mAttributes
	        		try {
		        		if (value.charAt(0) == "'" || value.charAt(0) == '"') {
							mAttribute.props = JSON.parse("{" + value.replace(_singleQuotesRe,'"') + "}");
		        		} else {
			        		mAttribute.props = parseProps(value);
		        		}
	        		} catch(ex) {
	        			mAttribute.error = ex.message;
	        		}
	        	}

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
	    this.copyAttributes(stream.root,top);
	    (top.impl || this).enhance(top);
	};

	function renderParts(resolver) {
		var parts = [];
		for(var j=0,isVar = false, part; j<this.parts.length; ++j, isVar = !isVar) {
			part = this.parts[j];
			parts.push(isVar? resolver(part) : part);
		}
		this.node.nodeValue = parts.join("");
	}

	HTMLElement.fn.findTextSubstitutions = function(el) {
		var texts = [];
		for(var j=0,t; t = el.childNodes[j]; ++j) if (t.nodeName == "#text") {
			var curlz = t.nodeValue.indexOf("{{");
			if (curlz>=0) {
				var parts = t.nodeValue.split(/{{|}}/),
					selectors = [];
				for(var l=0,isVar=false,p; l<parts.length; ++l, isVar = !isVar) {
					p = parts[l];
					if (isVar) {
						selectors.push(parts[l] = p.replace(/^ +/,"").replace(/ +$/,""));
					}
				}
				texts.push({
					node: t,
					parts: parts,
					selectors: selectors,
					renderText: renderParts
				});
			}
		}
		return texts;
	};

	function renderSelector(resolver) {
		this.node.nodeValue = resolver(this.selectors[0]);
	}

	HTMLElement.fn.makeTextSubstitution = function(el,selector) {
		if (el.childNodes.length === 0 || el.childNodes[0].nodeName !== "#text") {
			var t = document.createTextNode("");
			if (el.childNodes.length) el.insertBeforeChild(t,el.childNodes[0]);
			else el.appendChild(t);
		}
		return {
			node: el.childNodes[0],
			selectors: [selector],
			renderText: renderSelector
		};
	};


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

			if (name) {
				if (el.actionVariant[name]) el.actionVariant[name](el,ev);
				else {
					var sn = (name || "").replace("-","_").replace(" ","_");
					if (el.actionVariant[sn]) el.actionVariant[sn](el,ev);
				}
				//TODO else dev_note("Submit of " submitName " unknown to DialogAction " action)
			}
		} 

		//TODO withAactionInfo perhaps decode commandName from href, or negotiate with router
		else if (ev.commandName) {
			var parts = ev.commandName.split("::"), cmd = parts.pop(),
				parent = HTMLElement.getEnhancedParent(ev.commandElement);
			var resolver = Resolver.resolverFromElement(ev.commandElement,parts.length==2? parts[0] : null);

			switch(cmd) {
			//TODO other builtin commands
			case "parent.toggle-expanded":
			// if (el == null) el = ancestor enhanced
				StatefulResolver(parent.parentNode,true).toggle("state.expanded");
				break;

			case "toggle-expanded":
				StatefulResolver(parent,true).toggle("state.expanded");
				break;

			case "close":
				//TODO close up shop
				if (ev.submitElement) HTMLElement.discard(ev.submitElement);
				break;
			default:
				if (parts.length) {
					var expr = parts.pop();
					var value; //TODO value for cmd
					Resolver.exec(resolver, expr, "fill",cmd.charAt(0) == "="? "=" : cmd, value);
				} 
				break;
			}
		}
	}
	essential.declare("fireAction",fireAction);


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


!function () {
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{}),
		ObjectType = essential("ObjectType"),
		log = essential("console")(),
		MutableEvent = essential("MutableEvent"),
		StatefulResolver = essential("StatefulResolver"),
		statefulCleaner = essential("statefulCleaner"),
		HTMLElement = essential("HTMLElement"),
		HTMLScriptElement = essential("HTMLScriptElement"),
		Layouter = essential("Layouter"),
		Laidout = essential("Laidout"),
		DescriptorQuery = essential("DescriptorQuery"),
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
		// TODO if (config['invalid-config']) log.log()

		var configTemplate = config.template,
			contentTemplate = config['content-template'], 
			contentClass = config['content-class'] || "dialog-content",
			contentRole = config['content-role'], contentConfig = config['content-config'];
		var children = [];
		for(var i=0,c; c = el.childNodes[i]; ++i) children.push(c);

		// template around the content
		if (configTemplate) {
			var template = Resolver("document::essential.templates","null")([configTemplate]);
			if (template == null) return false;

			var content = template.content.cloneNode(true);
			el.appendChild(content);
		}

		var header = el.getElementsByTagName("HEADER")[0],
			footer = el.getElementsByTagName("FOOTER")[0];

		var wrap = getChildWithRole(el,"content");
		// content-template appended to role=content or element
		if (contentTemplate) {
			var template = Resolver("document::essential.templates","null")([contentTemplate]);
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
			DescriptorQuery(wrap).withBranch().enhance();
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

		return { el:el, wrap:wrap };
	}
	pageResolver.set("handlers.enhance.dialog",enhance_dialog);

	function layout_dialog(el,layout,instance) {

		//TODO sizing if bodyHeight changed
		var top = el.offsetTop, 
			height = el.offsetHeight,
			newTop = Math.max(0, Math.min(top,document.body.offsetHeight - height - 12)); 
		if (top != newTop) {
			el.style.top = newTop + "px";
		}

	}
	pageResolver.set("handlers.layout.dialog",layout_dialog);

	//TODO turn into destroy_dialog so it happens before the discard of other elements, or slightly before
	function discard_dialog(el,role,instance) {
		var existing = 0, dialogs = DescriptorQuery("[role=dialog]");
		for(var i=0,d; d = dialogs[i]; ++i) {
			if (d.state.enhanced && !d.state.discarded) ++existing;
		}

		if (existing == 1) {
			dialog_top = initial_top;
			dialog_left = initial_left;
		} 
		if (el.parentElement) el.parentElement.removeChild(el);
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
			var template = Resolver("document::essential.templates","null")([config.template]);
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

		this.id = config.id || el.id;
		this.selector = config.selector || (this.id? ("#"+this.id) : null);
		// TODO class support, looking up on main document by querySelector

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
		var template = new Template(el,config);

		// template can be anonymouse
		if (template.selector) Resolver("document").set(["essential","templates",template.selector],template);

		return template;
	}
	pageResolver.set("handlers.enhance.template",enhance_template);

	function init_template(el,role,config,context) {
		this.state.contentManaged = true; // template content skipped
	}
	pageResolver.set("handlers.init.template",init_template);

	pageResolver.set("handlers.sizing.template",false);

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
			this.stateful.set("state.over",true);
			enhanced.vert.show();
			enhanced.horz.show();
		},
		"mouseout": function(ev) {
			var sp = this;
			var enhanced = EnhancedDescriptor(this.scrolled).instance;
			
			if (this.stateful.movedOutInterval) clearTimeout(this.stateful.movedOutInterval);
			this.stateful.movedOutInterval = setTimeout(function(){
				sp.stateful.set("state.over",false);
				if (sp.stateful("state.dragging") != true) {
					enhanced.vert.hide();
					enhanced.horz.hide();
				}
				//log.log("mouse out of scrolled.");
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
			// if (preventLeft) log.log("prevent left scroll ");
			var preventTop = preventWheel && ev.deltaY > 0 && chain.every(function(el) { return el.scrollTop == 0; });
			// if (preventTop) log.log("prevent top scroll ");

			var prevent = false;

			if (this.stateful("pos.scrollVert","0")) {
				// native scrolling default works fine
			} else {
				if (ev.deltaY != 0) {
					var max = Math.max(0, this.stateful("pos.scrollHeight","0") - this.offsetHeight);
					var top = this.stateful("pos.scrollTop","0");
					// log.log("vert delta",ev.deltaY, top, max, this.stateful("pos.scrollHeight"),this.offsetHeight);
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
	Resolver("page").set("activeMovement",null);

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

		if (el.stateful) el.stateful.set("state.dragging",true);
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
				// log.log(movement.factorX,movement.factorY)
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
		Resolver("page").set("activeMovement",this);

		return this;
	};

	ElementMovement.prototype.end = function() {
		if (this.el.stateful) this.el.stateful.set("state.dragging",false);
		removeEventListeners(this.target,this.drag_events);
		if (this.target.releaseCapture) this.target.releaseCapture();
		this.target = null;

		delete document.onselectstart ;

		activeMovement = null;
		Resolver("page").set("activeMovement",null);

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
		this.enable = opts.enable !== false;
        var sbsc = scrollbarSize();
		var lc = opts.horzvert.toLowerCase(), cn = lc+"-scroller";
		if (config.obscured) cn += " obscured";
		if (config.overhang) cn += " overhang";

		this.scrolled = el;
		var className = cn;
		this.el = HTMLElement("div", { "class":className }, '<header></header><footer></footer><nav><header></header><footer></footer></nav>');
		container.appendChild(this.el);
		this.contentName = "content"+ opts.sizeName;
		this.scrollName = "scroll"+ opts.sizeName; 
		this.sizeName = this.sizeStyle = opts.sizeName.toLowerCase();
		this.posName = opts.posName;
		this.posStyle = opts.posName.toLowerCase();
		this.autoHide = opts.autoHide;
		this.trackScroll = opts.trackScroll == false? false : true;;

		this.sizing = el.stateful("sizing");
		// this.trackScrolled(el);

		addEventListeners(el,ENHANCED_SCROLLED_EVENTS);
		addEventListeners(this.el,{ "mousedown": mousedownEvent });

		if (config.initialDisplay !== false) {
			if (this.show()) {
				this.hiding = setTimeout(this.hide.bind(this), parseInt(opts.initialDisplay,10) || 3000);
			}
		}
		// if (config.overhang) this.el.style[opts.edgeName] = "-" + (config[lc+"Offset"]!=undefined? config[lc+"Offset"]:sbsc) + "px";
  //       else this.el.style[opts.thicknessName] = sbsc + "px";
	}

	EnhancedScrollbar.prototype.trackScrolled = function(el) {
		if (this.trackScroll) {
			this.scrolledTo = el["scroll"+this.posName];
			this.scrolledContentSize = this.sizing[this.contentName]; //TODO remove intermediate variable
		}
		else {
			this.scrolledTo = this.scrolled.stateful("pos.scroll"+this.posName,"0");
			this.scrolledContentSize = this.scrolled.stateful("pos."+this.scrollName,"0");
		}
	};

	EnhancedScrollbar.prototype.update = function(scrolled) {
		if (this.scrolledContentSize) {
			this.el.lastChild.style[this.posStyle] = (100 * this.scrolledTo / this.scrolledContentSize) + "%";
			this.el.lastChild.style[this.sizeStyle] = (100 * this.sizing[this.sizeName] / this.scrolledContentSize) + "%";
		} else {
			this.el.lastChild.style[this.posStyle] = "0%";
			this.el.lastChild.style[this.sizeStyle] = "0%";
		}
		if (!this.enable || !this.scrolledContentSize || this.scrolledContentSize <= this.sizing[this.sizeName]) this.hide();
	};

	EnhancedScrollbar.prototype.show = function() {
		if (!this.enable || !this.scrolledContentSize || this.scrolledContentSize <= this.sizing[this.sizeName]) return false;

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
		if (this.autoHide !== false && this.shown && this.enable) {
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
			this.shown = this.enable = false;
		}
	};

	function EnhancedScrolled(el,config) {

		if (config.overhang == undefined) config.overhang = !!config.obscured;
		config.obscured = config.obscured !== false;
		//? this.el = el
		var container = this._getContainer(el,config);

		var trackScrollVert = !(config.trackScrollVert==false || config.trackScroll == false),
			trackScrollHorz = !(config.trackScrollHorz==false || config.trackScroll == false);

		el.stateful.declare("pos.scrollVert",trackScrollVert);
		el.stateful.declare("pos.scrollHorz",trackScrollHorz);
		el.stateful.declare("pos.scrollTop",0);
		el.stateful.declare("pos.scrollLeft",0);

		//TODO sizing.track = {} width,height,content,scroll
		el.stateful.set("sizing.track.sizeBy","client");

		this.x = false !== config.x;
		this.y = false !== config.y;
		this.vert = new EnhancedScrollbar(el,container,config,{
			enable: config.vert,
			horzvert: "Vert", 
			trackScroll: trackScrollVert,
			sizeName: "Height", 
			posName: "Top",
			thicknessName:"width",
			edgeName: "right" 
			},trackScrollVert? mousedownVert : mousedownStatefulVert);

		this.horz = new EnhancedScrollbar(el,container,config,{
			enable: config.horz, 
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

		// this.refresh(el);

		el.stateful.on("change","pos.scrollTop",{el:el,es:this},this.scrollTopChanged);
		el.stateful.on("change","pos.scrollLeft",{el:el,es:this},this.scrollLeftChanged);
	}

	EnhancedScrolled.prototype.scrollTopChanged = function(ev) {
		var el = ev.data.el, es = ev.data.es;

		// if not shown, show and if not entered and not dragging, hide after 1500 ms
		if (!es.vert.shown) {
			es.vert.show();
			if (!ev.resolver("state.over") && !ev.resolver("state.dragging")) {
				es.vert.delayedHide();
			}
		}

		es.vert.trackScrolled(el);
		es.vert.update(el);
	};

	EnhancedScrolled.prototype.scrollLeftChanged = function(ev) {
		var el = ev.data.el, es = ev.data.es;

		// if not shown, show and if not entered and not dragging, hide after 1500 ms
		if (!es.horz.shown) {
			es.horz.show();
			if (!el.stateful("state.over") && !el.stateful("state.dragging")) {
				es.horz.delayedHide();
			}
		}
		es.horz.trackScrolled(el);
		es.horz.update(el);
	};

	// Define on browser type
	var bGecko  = !!window.controllers;
	var bIE     = window.document.all && !window.opera;

	EnhancedScrolled.prototype._getContainer = function(el,config) {

        var sbsc = scrollbarSize();

		var container = el.parentNode;
		if (config.obscured) {
			if (! config.unstyledParent) el.parentNode.style.cssText = "position:absolute;left:0;right:0;top:0;bottom:0;overflow:hidden;";
			el.style.right = "-" + sbsc + "px";
			el.style.bottom = "-" + sbsc + "px";

			if (!bGecko && !bIE) {
				// fix incorrect width for children
				el.style.paddingRight = sbsc + "px";
				el.style.paddingBottom = sbsc + "px";
			}
			container = container.parentNode;
		}
		return container;
	};

	EnhancedScrolled.prototype.refresh = function(el) {

		//TODO get the information via layout call
		this.vert.trackScrolled(el);
		this.vert.update(el);
		this.horz.trackScrolled(el);
		this.horz.update(el);
	};

	EnhancedScrolled.prototype.layout = function(el,layout) {

		if (layout.contentHeight != layout.oldContentHeight && !this.vert.shown) {
			if (this.vert.show() === false) this.vert.hide(); // if content less/eq to space hide right now
			if (!el.stateful("state.over") && !el.stateful("state.dragging")) {
				this.vert.delayedHide(750);
			}
		}

		if (layout.contentWidth != layout.oldContentWidth && !this.horz.shown) {
			if (this.horz.show() === false) this.horz.hide(); // if content less/eq to space hide right now
			if (!el.stateful("state.over") && !el.stateful("state.dragging")) {
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
			var template = Resolver("document::essential.templates","null")([contentTemplate]);
			if (template == null) return false;

			var content = template.content.cloneNode(true);

			el.appendChild(content);
			DescriptorQuery(el).onlyBranch().enhance();
		}

		// StatefulResolver(el,true);
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
Resolver("document").queueHead();

Resolver("essential::ApplicationConfig::").restrict({ "singleton":true, "lifecycle":"page" });

Resolver("page").set("liveTimeout",60);
//TODO clearInterval on unload

Resolver("document").on("change","readyState",function(ev) {
	switch(ev.value) {
		case "loaded":
			Resolver("document").seal(false);
			break;

		case "interactive":
			if (! Resolver("document")._readyFired) Resolver("document")._ready();

			var liveTimeout = Resolver("page::liveTimeout","null");
			if (liveTimeout) {
				// Allow the browser to render the page, preventing initial transitions
				setTimeout(function() {
					Resolver("page").set("state.livepage",true);
				},liveTimeout);
			}
			else if (liveTimeout == 0) Resolver("page").set("state.livepage",true);
			break;

		case "complete":
			Resolver("document")._load();
			break;
	}
});

!function() {

var EnhancedDescriptor = Resolver("essential::EnhancedDescriptor::"),
	enhancedWindows = Resolver("essential::enhancedWindows::"),
	placement = Resolver("essential::placement::"),
	defaultButtonClick = Resolver("essential::defaultButtonClick::"),
	pageResolver = Resolver("page"),
	updateOnlineStatus = Resolver("essential::updateOnlineStatus::");


function onPageUnLoad(ev) {

	if (EnhancedDescriptor.maintainer) clearInterval(EnhancedDescriptor.maintainer);
	EnhancedDescriptor.maintainer = null;

	Resolver("document")._unload();

	for(var n in Resolver.nm) {
		if (typeof Resolver.nm[n].destroy == "function") Resolver.nm[n].destroy();
	}
	Resolver.nm = undefined;
}
if (window.addEventListener) window.addEventListener("unload",onPageUnLoad,false);
else if (window.attachEvent) window.attachEvent("onunload",onPageUnLoad);


Resolver("page::state.livepage").on("change",function(ev) {
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
		if (updateOnlineStatus.frequency > 0) pageResolver.uosInterval = setInterval(updateOnlineStatus,updateOnlineStatus.frequency);

		EnhancedDescriptor.maintainer = setInterval(EnhancedDescriptor.maintainAll,330); // minimum frequency 3 per sec
		EnhancedDescriptor.refresher = setInterval(EnhancedDescriptor.refreshAll,160); // minimum frequency 6 per sec

		updateOnlineStatus();

		if (window.addEventListener) {
			document.body.addEventListener("online",updateOnlineStatus);
			document.body.addEventListener("offline",updateOnlineStatus);
		
			if (window.applicationCache) applicationCache.addEventListener("error", updateOnlineStatus);

			window.addEventListener("resize",resizeTriggersReflow,false);
			document.body.addEventListener("orientationchange",resizeTriggersReflow,false);
			document.body.addEventListener("click",defaultButtonClick,false);
		} else {
			// IE8
			window.attachEvent("onresize",resizeTriggersReflow);
			document.body.attachEvent("onclick",defaultButtonClick);

			document.body.attachEvent("online",updateOnlineStatus);
			document.body.attachEvent("offline",updateOnlineStatus);
		}

		Resolver("essential")("launchWindows")();

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

}();
