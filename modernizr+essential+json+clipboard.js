
window.iepp = {
	html5elements: 'template|message|property|properties|renderer|value|abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video'
};
	
/*!
 * Modernizr v2.0.6
 * http://www.modernizr.com
 *
 * Copyright (c) 2009-2011 Faruk Ates, Paul Irish, Alex Sexton
 * Dual-licensed under the BSD or MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton, 
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.0.6',

    Modernizr = {},
    
    // option for enabling the HTML classes to be added
    enableClasses = true,

    docElement = document.documentElement,
    docHead = document.head || document.getElementsByTagName('head')[0],

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem = document.createElement('input'),

    smile = ':)',

    toString = Object.prototype.toString,

    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- -khtml- '.split(' '),

    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft foregoes prefixes entirely <= IE8, but appears to
    //   use a lowercase `ms` instead of the correct `Ms` in IE9

    // More here: http://github.com/Modernizr/Modernizr/issues/issue/21
    domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),

    ns = {'svg': 'http://www.w3.org/2000/svg'},

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    featureName, // used in testing loop


    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node,
          div = document.createElement('div');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // http://msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      style = ['&shy;', '<style>', rule, '</style>'].join('');
      div.id = mod;
      div.innerHTML += style;
      docElement.appendChild(div);

      ret = callback(div, rule);
      div.parentNode.removeChild(div);

      return !!ret;

    },


    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      if ( window.matchMedia ) {
        return matchMedia(mq).matches;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },


    /**
      * isEventSupported determines if a given element supports the given event
      * function from http://yura.thinkweb2.com/isEventSupported/
      */
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], undefined) ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })();

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    var _hasOwnProperty = ({}).hasOwnProperty, hasOwnProperty;
    if ( !is(_hasOwnProperty, undefined) && !is(_hasOwnProperty.call, undefined) ) {
      hasOwnProperty = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProperty = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], undefined));
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /**
     * testProps is a generic CSS / DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     *   A supported CSS property returns empty string when its not yet set.
     */
    function testProps( props, prefixed ) {
        for ( var i in props ) {
            if ( mStyle[ props[i] ] !== undefined ) {
                return prefixed == 'pfx' ? props[i] : true;
            }
        }
        return false;
    }

    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
            props   = (prop + ' ' + domPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        return testProps(props, prefixed);
    }

    /**
     * testBundle tests a list of CSS features that require element and style injection.
     *   By bundling them together we can reduce the need to touch the DOM multiple times.
     */
    /*>>testBundle*/
    var testBundle = (function( styles, tests ) {
        var style = styles.join(''),
            len = tests.length;

        injectElementWithStyles(style, function( node, rule ) {
            var style = document.styleSheets[document.styleSheets.length - 1],
                // IE8 will bork if you create a custom build that excludes both fontface and generatedcontent tests.
                // So we check for cssRules and that there is a rule available
                // More here: https://github.com/Modernizr/Modernizr/issues/288 & https://github.com/Modernizr/Modernizr/issues/293
                cssText = style.cssRules && style.cssRules[0] ? style.cssRules[0].cssText : style.cssText || "",
                children = node.childNodes, hash = {};

            while ( len-- ) {
                hash[children[len].id] = children[len];
            }

            /*>>touch*/           Modernizr['touch'] = ('ontouchstart' in window) || hash['touch'].offsetTop === 9; /*>>touch*/
            /*>>csstransforms3d*/ Modernizr['csstransforms3d'] = hash['csstransforms3d'].offsetLeft === 9;          /*>>csstransforms3d*/
            /*>>generatedcontent*/Modernizr['generatedcontent'] = hash['generatedcontent'].offsetHeight >= 1;       /*>>generatedcontent*/
            /*>>fontface*/        Modernizr['fontface'] = /src/i.test(cssText) &&
                                                                  cssText.indexOf(rule.split(' ')[0]) === 0;        /*>>fontface*/
        }, len, tests);

    })([
        // Pass in styles to be injected into document
        /*>>fontface*/        '@font-face {font-family:"font";src:url("https://")}'         /*>>fontface*/
        
        /*>>touch*/           ,['@media (',prefixes.join('touch-enabled),('),mod,')',
                                '{#touch{top:9px;position:absolute}}'].join('')           /*>>touch*/
                                
        /*>>csstransforms3d*/ ,['@media (',prefixes.join('transform-3d),('),mod,')',
                                '{#csstransforms3d{left:9px;position:absolute}}'].join('')/*>>csstransforms3d*/
                                
        /*>>generatedcontent*/,['#generatedcontent:after{content:"',smile,'";visibility:hidden}'].join('')  /*>>generatedcontent*/
    ],
      [
        /*>>fontface*/        'fontface'          /*>>fontface*/
        /*>>touch*/           ,'touch'            /*>>touch*/
        /*>>csstransforms3d*/ ,'csstransforms3d'  /*>>csstransforms3d*/
        /*>>generatedcontent*/,'generatedcontent' /*>>generatedcontent*/
        
    ]);/*>>testBundle*/


    /**
     * Tests
     * -----
     */

    tests['flexbox'] = function() {
        /**
         * setPrefixedValueCSS sets the property of a specified element
         * adding vendor prefixes to the VALUE of the property.
         * @param {Element} element
         * @param {string} property The property name. This will not be prefixed.
         * @param {string} value The value of the property. This WILL be prefixed.
         * @param {string=} extra Additional CSS to append unmodified to the end of
         * the CSS string.
         */
        function setPrefixedValueCSS( element, property, value, extra ) {
            property += ':';
            element.style.cssText = (property + prefixes.join(value + ';' + property)).slice(0, -property.length) + (extra || '');
        }

        /**
         * setPrefixedPropertyCSS sets the property of a specified element
         * adding vendor prefixes to the NAME of the property.
         * @param {Element} element
         * @param {string} property The property name. This WILL be prefixed.
         * @param {string} value The value of the property. This will not be prefixed.
         * @param {string=} extra Additional CSS to append unmodified to the end of
         * the CSS string.
         */
        function setPrefixedPropertyCSS( element, property, value, extra ) {
            element.style.cssText = prefixes.join(property + ':' + value + ';') + (extra || '');
        }

        var c = document.createElement('div'),
            elem = document.createElement('div');

        setPrefixedValueCSS(c, 'display', 'box', 'width:42px;padding:0;');
        setPrefixedPropertyCSS(elem, 'box-flex', '1', 'width:10px;');

        c.appendChild(elem);
        docElement.appendChild(c);

        var ret = elem.offsetWidth === 42;

        c.removeChild(elem);
        docElement.removeChild(c);

        return ret;
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // http://github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // This WebGL test may false positive. 
    // But really it's quite impossible to know whether webgl will succeed until after you create the context. 
    // You might have hardware that can support a 100x100 webgl canvas, but will not support a 1000x1000 webgl 
    // canvas. So this feature inference is weak, but intentionally so.
    
    // It is known to false positive in FF4 with certain hardware and the iPad 2.
    
    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: http://crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: http://modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        return Modernizr['touch'];
    };

    /**
     * geolocation tests for the new Geolocation API specification.
     *   This test is a standards compliant-only test; for more complete
     *   testing, including a Google Gears fallback, please see:
     *   http://code.google.com/p/geo-location-javascript/
     * or view a fallback solution using google's geo API:
     *   http://gist.github.com/366184
     */
    tests['geolocation'] = function() {
        return !!navigator.geolocation;
    };

    // Per 1.6:
    // This used to be Modernizr.crosswindowmessaging but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['postmessage'] = function() {
      return !!window.postMessage;
    };

    // Web SQL database detection is tricky:

    // In chrome incognito mode, openDatabase is truthy, but using it will
    //   throw an exception: http://crbug.com/42380
    // We can create a dummy database, but there is no way to delete it afterwards.

    // Meanwhile, Safari users can get prompted on any database creation.
    //   If they do, any page with Modernizr will give them a prompt:
    //   http://github.com/Modernizr/Modernizr/issues/closed#issue/113

    // We have chosen to allow the Chrome incognito false positive, so that Modernizr
    //   doesn't litter the web with these test databases. As a developer, you'll have
    //   to account for this gotcha yourself.
    tests['websqldatabase'] = function() {
      var result = !!window.openDatabase;
      /*  if (result){
            try {
              result = !!openDatabase( mod + "testdb", "1.0", mod + "testdb", 2e4);
            } catch(e) {
            }
          }  */
      return result;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      for ( var i = -1, len = domPrefixes.length; ++i < len; ){
        if ( window[domPrefixes[i].toLowerCase() + 'IndexedDB'] ){
          return true;
        }
      }
      return !!window.indexedDB;
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        return isEventSupported('dragstart') && isEventSupported('drop');
    };

    // Mozilla is targeting to land MozWebSocket for FF6
    // bugzil.la/659324
    tests['websockets'] = function() {
        for ( var i = -1, len = domPrefixes.length; ++i < len; ){
          if ( window[domPrefixes[i] + 'WebSocket'] ){
            return true;
          }
        }
        return 'WebSocket' in window;
    };


    // http://css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return /(url\s*\(.*?){3}/.test(mStyle.background);
    };


    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.


    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: http://muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // https://github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return /^0.55$/.test(mStyle.opacity);
    };


    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * http://webkit.org/blog/175/introducing-css-gradients/
         * https://developer.mozilla.org/en/CSS/-moz-linear-gradient
         * https://developer.mozilla.org/en/CSS/-moz-radial-gradient
         * http://dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
            (str1 + prefixes.join(str2 + str1) + prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testProps(['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform']);
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testProps(['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']);

        // Webkitâ€™s 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-ms-transform-3d),(-webkit-transform-3d),(modernizr){ ... }`
          ret = Modernizr['csstransforms3d'];
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transitionProperty');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // http://javascript.nwbox.com/CSSSupport/
    tests['fontface'] = function() {
        return Modernizr['fontface'];
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        return Modernizr['generatedcontent'];
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : http://github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in FF 3.5.1 and 3.5.0, "no" was a return value instead of empty string.
    //   Modernizr does not normalize for that.

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;
            
        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"');

                // Workaround required for IE9, which doesn't report video support without audio codec specified.
                //   bug 599718 @ msft connect
                var h264 = 'video/mp4; codecs="avc1.42E01E';
                bool.h264 = elem.canPlayType(h264 + '"') || elem.canPlayType(h264 + ', mp4a.40.2"');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"');
            }
            
        } catch(e) { }
        
        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try { 
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"');
                bool.mp3  = elem.canPlayType('audio/mpeg;');

                // Mimetypes accepted:
                //   https://developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   http://bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"');
                bool.m4a  = elem.canPlayType('audio/x-m4a;') || elem.canPlayType('audio/aac;');
            }
        } catch(e) { }
        
        return bool;
    };


    // Firefox has made these tests rather unfun.

    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw http://bugzil.la/365772 if cookies are disabled

    // However, in Firefox 4 betas, if dom.storage.enabled == false, just mentioning
    //   the property will throw an exception. http://bugzil.la/599479
    // This looks to be fixed for FF4 Final.

    // Because we are forced to try/catch this, we'll go aggressive.

    // FWIW: IE8 Compat mode supports these features completely:
    //   http://www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            return !!localStorage.getItem;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            return !!sessionStorage.getItem;
        } catch(e){
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // Thanks to F1lt3r and lucideer, ticket #35
    tests['smil'] = function() {
        return !!document.createElementNS && /SVG/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    tests['svgclippaths'] = function() {
        // Possibly returns a false positive in Safari 3.2?
        return !!document.createElementNS && /SVG/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   http://miketaylr.com/code/input-type-attr.html
        // spec: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
        
        // Only input placeholder is tested while textarea's placeholder is not. 
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));

        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. http://miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesnt define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else if ( /^color$/.test(inputElemType) ) {
                        // chuck into DOM and force reflow for Opera bug in 11.00
                        // github.com/Modernizr/Modernizr/issues#issue/159
                        docElement.appendChild(inputElem);
                        docElement.offsetWidth;
                        bool = inputElem.value != smile;
                        docElement.removeChild(inputElem);

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
    }


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProperty(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    // input tests need to run.
    Modernizr.input || webforms();


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == "object" ) {
         for ( var key in feature ) {
           if ( hasOwnProperty( feature, key ) ) { 
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");  
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return; 
         }

         test = typeof test == "boolean" ? test : !!test();

         docElement.className += ' ' + (test ? '' : 'no-') + feature;
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };
    

    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    //>>BEGIN IEPP
    // Enable HTML 5 elements for styling (and printing) in IE.
    if ( window.attachEvent && (function(){ var elem = document.createElement('div');
                                            elem.innerHTML = '<elem></elem>';
                                            return elem.childNodes.length !== 1; })() ) {
                                              
        // iepp v2 by @jon_neal & afarkas : github.com/aFarkas/iepp/
        (function(win, doc) {
          win.iepp = win.iepp || {};
          var iepp = win.iepp,
            elems = iepp.html5elements || 'abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video',
            elemsArr = elems.split('|'),
            elemsArrLen = elemsArr.length,
            elemRegExp = new RegExp('(^|\\s)('+elems+')', 'gi'),
            tagRegExp = new RegExp('<(\/*)('+elems+')', 'gi'),
            filterReg = /^\s*[\{\}]\s*$/,
            ruleRegExp = new RegExp('(^|[^\\n]*?\\s)('+elems+')([^\\n]*)({[\\n\\w\\W]*?})', 'gi'),
            docFrag = doc.createDocumentFragment(),
            html = doc.documentElement,
            head = html.firstChild,
            bodyElem = doc.createElement('body'),
            styleElem = doc.createElement('style'),
            printMedias = /print|all/,
            body;
          function shim(doc) {
            var a = -1;
            while (++a < elemsArrLen)
              // Use createElement so IE allows HTML5-named elements in a document
              doc.createElement(elemsArr[a]);
          }

          iepp.getCSS = function(styleSheetList, mediaType) {
            if(styleSheetList+'' === undefined){return '';}
            var a = -1,
              len = styleSheetList.length,
              styleSheet,
              cssTextArr = [];
            while (++a < len) {
              styleSheet = styleSheetList[a];
              //currently no test for disabled/alternate stylesheets
              if(styleSheet.disabled){continue;}
              mediaType = styleSheet.media || mediaType;
              // Get css from all non-screen stylesheets and their imports
              if (printMedias.test(mediaType)) cssTextArr.push(iepp.getCSS(styleSheet.imports, mediaType), styleSheet.cssText);
              //reset mediaType to all with every new *not imported* stylesheet
              mediaType = 'all';
            }
            return cssTextArr.join('');
          };

          iepp.parseCSS = function(cssText) {
            var cssTextArr = [],
              rule;
            while ((rule = ruleRegExp.exec(cssText)) != null){
              // Replace all html5 element references with iepp substitute classnames
              cssTextArr.push(( (filterReg.exec(rule[1]) ? '\n' : rule[1]) +rule[2]+rule[3]).replace(elemRegExp, '$1.iepp_$2')+rule[4]);
            }
            return cssTextArr.join('\n');
          };

          iepp.writeHTML = function() {
            var a = -1;
            body = body || doc.body;
            while (++a < elemsArrLen) {
              var nodeList = doc.getElementsByTagName(elemsArr[a]),
                nodeListLen = nodeList.length,
                b = -1;
              while (++b < nodeListLen)
                if (nodeList[b].className.indexOf('iepp_') < 0)
                  // Append iepp substitute classnames to all html5 elements
                  nodeList[b].className += ' iepp_'+elemsArr[a];
            }
            docFrag.appendChild(body);
            html.appendChild(bodyElem);
            // Write iepp substitute print-safe document
            bodyElem.className = body.className;
            bodyElem.id = body.id;
            // Replace HTML5 elements with <font> which is print-safe and shouldn't conflict since it isn't part of html5
            bodyElem.innerHTML = body.innerHTML.replace(tagRegExp, '<$1font');
          };


          iepp._beforePrint = function() {
            // Write iepp custom print CSS
            styleElem.styleSheet.cssText = iepp.parseCSS(iepp.getCSS(doc.styleSheets, 'all'));
            iepp.writeHTML();
          };

          iepp.restoreHTML = function(){
            // Undo everything done in onbeforeprint
            bodyElem.innerHTML = '';
            html.removeChild(bodyElem);
            html.appendChild(body);
          };

          iepp._afterPrint = function(){
            // Undo everything done in onbeforeprint
            iepp.restoreHTML();
            styleElem.styleSheet.cssText = '';
          };



          // Shim the document and iepp fragment
          shim(doc);
          shim(docFrag);

          //
          if(iepp.disablePP){return;}

          // Add iepp custom print style element
          head.insertBefore(styleElem, head.firstChild);
          styleElem.media = 'print';
          styleElem.className = 'iepp-printshim';
          win.attachEvent(
            'onbeforeprint',
            iepp._beforePrint
          );
          win.attachEvent(
            'onafterprint',
            iepp._afterPrint
          );
        })(window, document);
    }
    //>>END IEPP

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    Modernizr._prefixes     = prefixes;
    Modernizr._domPrefixes  = domPrefixes;
    
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use: 
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;   
    
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported; 

    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };        

    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')    
    Modernizr.testAllProps  = testPropsAll;     


    
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles; 


    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'
    
    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');
    
    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    // 
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'msTransitionEnd', // maybe?
    //       'transition'       : 'transitionEnd'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];
    
    Modernizr.prefixed      = function(prop){
      return testPropsAll(prop, 'pfx');
    };



    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/\bno-js\b/, '')
                            
                            // Add the new classes to the <html> element.
                            + (enableClasses ? ' js ' + classes.join(' ') : '');

    return Modernizr;

})(this, this.document);/*
    Essential JavaScript ❀ http://essentialjs.com
    Copyright (C) 2011 by Henrik Vendelbo

    This program is free software: you can redistribute it and/or modify it under the terms of
    the GNU Affero General Public License version 3 as published by the Free Software Foundation.

    Additionally,

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
    and associated documentation files (the "Software"), to deal in the Software without restriction, 
    including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
    and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
    BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*!
    Essential JavaScript ❀ http://essentialjs.com
    Copyright (C) 2011 by Henrik Vendelbo

    Licensed under GNU Affero v3 and MIT. See http://essentialjs.com/license/
*/


function Resolver(name,ns,options)
{
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	switch(typeof(name)) {
	case "undefined":
		// Resolver()
		return Resolver["default"];
		
	case "string":
		// Resolver("abc")
		// Resolver("abc",null)
		// Resolver("abc",{})
		// Resolver("abc",{},{options})
		if (Resolver[name] == undefined) {
			if (ns == null && arguments.length > 1) return ns; // allow checking without creating a new namespace
			if (options == undefined) { options = ns; ns = {}; }
			Resolver[name] = Resolver(ns,options);
			Resolver[name].named = name;
			}
		return Resolver[name];
	}

	// Resolver({})
	// Resolver({},{options})
	options = ns || {};
	ns = name;

	function _resolve(names,subnames,onundefined) {
        var top = ns;
        for (var j = 0, n; n = names[j]; ++j) {
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
                //TODO "false"
                case "null":
                	if (top === undefined) return null;
                	break;
                case "undefined":
                	if (top === undefined) return undefined;
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
	                //TODO "false"
	                case "null":
	                	if (top === undefined) return null;
	                	break;
	                case "undefined":
	                	if (top === undefined) return undefined;
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

    	e.type = type;
    	e.selector = selector;
    	e.data = data;
    	e.callback = callback;

    	function trigger(symbol,value) {
    		this.symbol = symbol;
    		this.value = value;
    		this.callback.call(resolver,this);
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
            return _resolve(name.name.split("."),null,name.onundefined);
        }
        else {
            return _resolve(name.split("."),null,onundefined);
        }
    };

    resolver.named = options.name;
    if (options.name) Resolver[options.name] = resolver;
    resolver.namespace = arguments[0];
    resolver.references = { };

    var VALID_LISTENERS = {
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
        var names = name.split(".");

        var onundefinedSet = (onundefined=="null"||onundefined=="undefined")? "throw":onundefined;

    	function get() {
    		if (arguments.length==1) {
	        	var r = _resolve(names,arguments[0].split("."),onundefined);
    			//TODO onundefined for the arg
	        	return r;
    		} else {
	        	var base = _resolve(names,null,onundefined);
	        	return base;
    		}
        }
        function set(value) {
        	if (arguments.length > 1) {
        		var subnames = arguments[0].split(".");
				var symbol = subnames.pop();
	        	var base = _resolve(names,subnames,onundefinedSet);
	        	value = arguments[1];
        	} else {
				var symbol = names.pop();
				var base = _resolve(names,null,onundefinedSet);
				names.push(symbol);
        	}
			if (_setValue(value,names,base,symbol)) {
				this._callListener("change",names,symbol,value);
	    	//TODO parent listeners
			}
			return value;
        }
        function declare(value) {
        	if (arguments.length > 1) {
        		var subnames = arguments[0].split(".");
				var symbol = subnames.pop();
	        	var base = _resolve(names,subnames,onundefinedSet);
	        	value = arguments[1];
        	} else {
	            var symbol = names.pop();
	        	var base = _resolve(names,null,onundefinedSet);
	        	names.push(symbol);
        	}
        	if (base[symbol] === undefined) {
        		if (_setValue(value,names,base,symbol)) {
			    	this._callListener("change",names,symbol,value);
	    	//TODO parent listeners
			    }
        		return value
        	} else return base[symbol];
        }
    	function getEntry(key) {
        	var base = _resolve(names,null,onundefined);
        	if (arguments.length) return base[key];
        	return base;
        }
        function declareEntry(key,value) {
            var symbol = names.pop();
        	var base = _resolve(names,null,onundefined);
        	names.push(symbol);
        	if (base[symbol] === undefined) _setValue({},names,base,symbol);
        	
        	if (base[symbol][key] === undefined) {
        		names.push(key);
        		if (_setValue(value,names,base[symbol],key)) {
			    	this._callListener("change",names,key,value);
	    	//TODO parent listeners
        		}
	    		names.pop(); // return names to unchanged
        	}
        }
        function setEntry(key,value) {
            var symbol = names.pop();
        	var base = _resolve(names,null,onundefined);
        	names.push(symbol);
        	if (base[symbol] === undefined) _setValue({},names,base,symbol);
        	
    		names.push(key);
    		if (_setValue(value,names,base[symbol],key)) {
		    	this._callListener("change",names,key,value);
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
	    	this._callListener("change",names,null,mods);
	    	//TODO parent listeners
        }
	    function on(type,data,callback) {
	    	if (! type in VALID_LISTENERS) return;//fail

	    	switch(arguments.length) {
	    		case 2: this._addListener(type,name,null,arguments[1]); break;
	    		case 3: this._addListener(type,name,data,callback); break;
	    	};
	    }

	    function trigger(type) {
	    	var value = _resolve(names,null,onundefined);
	    	var symbol = names.pop();
			var parentName = names.join(".");

	    	this._callListener(type,names,symbol,value);
			var parentRef = resolver.references[parentName];
			if (parentRef) parentRef._callListener("change",names,symbol,value);

			names.push(symbol);
	    }    

        get.set = set;
        get.get = get;
        get.declare = declare;
        get.mixin = mixin;
        get.getEntry = getEntry;
        get.declareEntry = declareEntry;
        get.setEntry = setEntry;
        get.on = on;
        get.trigger = trigger;
        get.listeners = listeners || _makeListeners();

	    function _callListener(type,names,symbol,value) {
	    	for(var i=0,event; event = this.listeners[type][i]; ++i) {
	    		event.trigger(symbol,value);
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
	   		this.listeners[type].push(_makeResolverEvent(resolver,type,selector,data,callback));
	    }
	    get._addListener = _addListener;


        return get;
    };



    resolver.on = function(type,selector,data,callback) 
    {
    	if (! type in VALID_LISTENERS) return;//fail
    	switch(arguments.length) {
    		case 2: break; //TODO
    		case 3: if (typeof arguments[1] == "string") {
			    	this.reference(selector).on(type,null,arguments[2]);
    			} else { // middle param is data
			    	//TODO this.reference("*").on(type,arguments[1],arguments[2]);
    			}
    			break;
    		case 4:
		    	this.reference(selector).on(type,selector,data,callback);
    			break;
    	}
    };
    
    resolver.declare = function(name,value,onundefined) 
    {
        var names = name.split(".");
        var symbol = names.pop();
    	var base = _resolve(names,null,onundefined);
    	if (base[symbol] === undefined) { 
    		if (_setValue(value,names,base,symbol)) {
	    		var ref = resolver.references[name];
	    		if (ref) ref._callListener("change",names,symbol,value);
				var parentName = names.join(".");
				var parentRef = resolver.references[parentName];
				if (parentRef) parentRef._callListener("change",names,symbol,value);
    		}
    		return value;
    	} else return base[symbol];
    };

    resolver.set = function(name,value,onundefined) 
    {
		var names = name.split(".");
		var symbol = names.pop();
		var base = _resolve(names,null,onundefined);
		if (_setValue(value,names,base,symbol)) {
			var ref = resolver.references[name];
			if (ref) ref._callListener("change",names,symbol,value);
			var parentName = names.join(".");
			var parentRef = resolver.references[parentName];
			if (parentRef) parentRef._callListener("change",names,symbol,value);
		}
		return value;
    };

    resolver.reference = function(name,onundefined) 
    {
    	if (typeof name == "object") {
    		onundefined = name.onundefined;
    		name = name.name;
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

    resolver.override = function(ns,options)
    {
        options = options || {};
        var name = options.name || this.named; 
		Resolver[name] = Resolver(ns,options);
		Resolver[name].named = name;
		return Resolver[name];
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
Resolver({},{ name:"default" });

Resolver.hasGenerator = function(subject) {
	if (subject.__generator__) return true;
	if (typeof subject == "function" && typeof subject.type == "function") return true;
	return false;
};

/**
 * Generator(constr) - get cached or new generator
 * Generator(constr,base1,base2) - define with bases
 * Generator(constr,base,options) - define with options 
 *
 * options { singleton: false, pool: undefined, allocate: true } 
 *
 */
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
				instance.constructor = info.constructors[0]; // make the correct constructor appear in debuggers
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


	function simpleGenerator(a,b,c,d,e,f,g,h,i,j,k,l) {
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
		for(var n in info.presets) this[n] = info.presets[n];
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

		// determine the generator to use
		var generator = newGenerator;
		if (options.alloc === false) generator = simpleGenerator;
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

		// simple type with inheritance chain, fresh prototype
		function type() {}
		generator.type = type;
		generator.type.prototype = generator.prototype;

		// migrate prototype
		for(var n in mainConstr.prototype) generator.prototype[n] = mainConstr.prototype[n];
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
		}
		this.info.restrictedArgs = args;
		if (args) {
			this.info.constructors.unshift(fillMissingArgs);
		}
		return this;
	}
	generator.restrict = restrict;

	// Future calls will return this generator
	mainConstr.__generator__ = generator;
		
	return generator;
};

/* List of generators that have been restricted */
Generator.restricted = [];
Generator.ObjectGenerator = Generator(Object);



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

	DOMTokenList.mixin = function(dtl,mix) {
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
		
		try {
			essential("_queueDelayedAssets")();
			essential.set("_queueDelayedAssets",function(){});

			instantiatePageSingletons();
		}
		catch(ex) {
			console.error("Failed to launch delayed assets and singletons",ex);
			//debugger;
		}
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


/**
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

(function () {
	//"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	// Save reference to earlier defined object implementation (if any)
	var oXMLHttpRequest = window.XMLHttpRequest;

	// Define on browser type
	var bGecko  = !!window.controllers;
	var bIE     = window.document.all && !window.opera;
	var bIE7    = bIE && window.navigator.userAgent.match(/MSIE 7.0/);

	// Enables "XMLHttpRequest()" call next to "new XMLHttpReques()"
	function fXMLHttpRequest() {
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

})();
(function(){
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

	var essential = Resolver("essential",{});
	var ObjectType = essential("ObjectType");
	var console = essential("console");
	var ArraySet = essential("ArraySet");
	var DOMTokenList = essential("DOMTokenList");
	var baseUrl = location.href.substring(0,location.href.split("?")[0].lastIndexOf("/")+1);

	//TODO regScriptOnnotfound (onerror, status=404)
	
	// (tagName,{attributes},content)
	// ({attributes},content)
	function HTMLElement(tagName,from,content_list,_document) {
		var c_from = 2, c_to = arguments.length-1, _tagName = tagName, _from = from;
		
		// optional document arg
		var d = arguments[c_to];
		var _doc = document;
		if (typeof d == "object" && "doctype" in d && c_to>1) { _doc = d; --c_to; }
		
		// optional tagName arg
		if (typeof _tagName == "object") { 
			_from = _tagName; 
			_tagName = _from.tagName || "span"; 
			--c_from; 
		}
		
		var e = _doc.createElement(_tagName);
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
					
				case "id":
				case "className":
				case "rel":
				case "lang":
				case "language":
				case "src":
				case "type":
					if (_from[n] !== undefined) e[n] = _from[n]; 
					break;
				//TODO case "onprogress": // partial script progress
				case "onload":
					regScriptOnload(e,_from.onload);
					break;
				default:
					e.setAttribute(n,_from[n]);
					break;
			}
		}
		var l = [];
		for(var i=c_from; i<=c_to; ++i) {
			var p = arguments[i];
			if (typeof p == "object" && "length" in p) l.concat(p);
			else if (typeof p == "string") l.push(arguments[i]);
		}
		if (l.length) e.innerHTML = l.join("");
		
		//TODO .appendTo function
		
		return e;
	}
	essential.set("HTMLElement",HTMLElement);
	
	
	var nativeClassList = !!document.documentElement.classList;

	function mixinElementState(el,state) {
		state.disabled = el.disabled || false; // undefined before attach
		state.readOnly = el.readOnly || false;
		state.hidden = el.getAttribute("hidden") != null;
		state.required = el.getAttribute("required") != null;
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
			el.setAttribute(key,key);
		} else {
			el.removeAttribute(key);
		}
	}

	/*
		Reflect only aria property 
	*/
	function reflectAria(el,key,value) {
		if (value) {
			el.setAttribute("aria-"+key,key);
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	/*
		Reflect on property or attribute and aria equivalent. 
	*/
	function reflectAttributeAria(el,key,value) {
		if (typeof el[key] == "boolean") {
			el[key] = !!value;
		} else {
			if (value) {
				el.setAttribute(key,key);
			} else {
				el.removeAttribute(key);
			}
		}
		if (value) {
			el.setAttribute("aria-"+key,key);
		} else {
			el.removeAttribute("aria-"+key);
		}
	}

	var state_treatment = {
		disabled: { index: 0, reflect: reflectAria }, // IE hardcodes a disabled text shadow for buttons and anchors
		readOnly: { index: 1, reflect: reflectProperty },
		hidden: { index: 2, reflect: reflectAttribute }, // Aria all elements
		required: { index: 3, reflect: reflectAttributeAria }
		//TODO draggable
		//TODO contenteditable
		//TODO checked ariaChecked
		//TODO tooltip
		//TODO hover
		//TODO down ariaPressed
		//TODO ariaHidden
		//TODO ariaDisabled
		//TODO ariaRequired
		//TODO ariaExpanded
		//TODO ariaSelected

		//TODO aria-hidden all elements http://www.w3.org/TR/wai-aria/states_and_properties#aria-hidden
		//TODO aria-invalid all elements http://www.w3.org/TR/wai-aria/states_and_properties#aria-invalid

		/*TODO IE aria props
			string:
			ariaPressed ariaSelected ariaSecret ariaRequired ariaRelevant ariaReadonly ariaLive
			ariaInvalid ariaHidden ariaBusy ariaActivedescendant ariaFlowto ariaDisabled


		*/

		//TODO restricted/forbidden tie in with session specific permissions

		//TODO focus for elements with focus
	};

	var DOMTokenList_eitherClass = essential("DOMTokenList.eitherClass");
	var DOMTokenList_mixin = essential("DOMTokenList.mixin");

	function reflectElementState(event) {
		var el = event.data;
		var treatment = state_treatment[event.symbol];
		if (treatment) {
			// known props
			treatment.reflect(el,event.symbol,event.value);
		} else {
			// extra state
		}

		var mapClass = el.stateful("map.class","undefined");
		if (mapClass) {
			DOMTokenList_eitherClass(el,mapClass.state[event.symbol],mapClass.notstate[event.symbol],event.value);
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

	function ClassForNotState() {

	}
	ClassForNotState.prototype.disabled = "";
	ClassForNotState.prototype.readOnly = "";
	ClassForNotState.prototype.hidden = "";
	ClassForNotState.prototype.required = "";

	function make_Stateful_fireAction(el) {
		return function() {
			var ev = MutableEvent({
				"target":el
			}).withActionInfo(); 
			fireAction(ev);
		};
	}

	function Stateful_setField(field) {
		this.field = field;
		return field;
	}

	function Stateful_destroy() {

	}

	// all stateful elements whether field or not get a cleaner
	function statefulCleaner() {
		if (this.stateful) {
			if (this.stateful.field) {
				this.stateful.field.destroy();
				this.stateful.field.discard();
			}
			this.stateful.field = undefined;
			this.stateful.destroy();
			this.stateful.fireAction = undefined;
			this.stateful.setField = undefined;
			this.stateful.destroy = undefined;
			this.stateful = undefined;
		}
	}

	/*
	  StatefulResolver()
	  StatefulResolver(el)
	  StatefulResolver(el,true)
	*/
	function StatefulResolver(el,mapClassForState) {
		if (el) {
			if (el.stateful) return el.stateful;
			var resolverOptions = {};
			if (typeof mapClassForState == "object") {
				resolverOptions = mapClassForState;
				mapClassForState = mapClassForState.mapClassForState;//TODO consider different name 
			}
			var stateful = el.stateful = Resolver({ state: {} },resolverOptions);
			if (el._cleaners == undefined) el._cleaners = [];
			if (!arrayContains(el._cleaners,statefulCleaner)) el._cleaners.push(statefulCleaner); 
			mixinElementState(el,stateful("state"));
			stateful.reference("state").on("change",el,reflectElementState);
			if (!nativeClassList) {
				el.classList = DOMTokenList();
			}
			DOMTokenList_mixin(el.classList,el.className);
		} else {
			var resolverOptions = typeof mapClassForState == "object"? mapClassForState : {}
			mapClassForState = false;
			var stateful = Resolver({ state: {} },resolverOptions);
		}
		if (mapClassForState) {
			stateful.set("map.class.state", new ClassForState());
			stateful.set("map.class.notstate", new ClassForNotState());
			StatefulResolver.updateClass(stateful,el);
		}
		stateful.fireAction = make_Stateful_fireAction(el);
		stateful.setField = Stateful_setField;
		stateful.destroy = Stateful_destroy;

		return stateful;
	}
	essential.declare("StatefulResolver",StatefulResolver);

	var pageResolver = StatefulResolver(null,{ name:"page" });
	pageResolver.declare("config",{});
	pageResolver.reference("state").mixin({
		"livepage": false,
		"authenticated": true,
		"authorised": true,
		"connected": true,
		"online": true, //TODO update
		"loading": true,
		"loadingConfig": true,
		"loadingScripts": true,
		"configured": true,
		"fullscreen": false, 
		"launched": false
		});


	StatefulResolver.updateClass = function(stateful,el) {
		var triggers = {};
		for(var n in state_treatment) triggers[n] = true;
		for(var n in stateful("map.class.state")) triggers[n] = true;
		for(var n in stateful("map.class.notstate")) triggers[n] = true;
		for(var n in triggers) {
			stateful.reference("state."+n,"null").trigger("change");
		}
	};

	//TODO element cleaner must remove .el references from listeners

	// this = element
	function regScriptOnload(domscript,trigger) {

		domscript.onload = function(ev) { 
			if ( ! this.onloadDone ) {
				this.onloadDone = true; 
				trigger.call(this,ev || event); 
			}
		};
		domscript.onreadystatechange = function(ev) { 
			if ( ( "loaded" === this.readyState || "complete" === this.readyState ) && ! this.onloadDone ) {
				this.onloadDone = true; 
				trigger.call(this,ev || event);
			}
		}

	}

	//TODO regScriptOnnotfound (onerror, status=404)

	function HTMLScriptElement(from,doc) {
		return HTMLElement("SCRIPT",from,doc);
	}
	essential.set("HTMLScriptElement",HTMLScriptElement);

    var pastloadScripts = {};

	function delayedScriptOnload(scriptRel) {
		function delayedOnload(ev) {
			pastloadScripts[this.src.replace(baseUrl,"")] = true;
			console.log("loaded: "+this.src.replace(baseUrl,""));
			ApplicationConfig().justUpdateState();
		}
		return delayedOnload;       
	}

	function _queueDelayedAssets()
	{
		console.debug("loading phased scripts");
		var links = document.getElementsByTagName("link");
		//TODO phase
		for(var i=0,l; l=links[i]; ++i) if (l.rel == "pastload") {
			var attrsStr = l.getAttribute("attrs");
			var attrs = {};
			if (attrsStr) {
				eval("attrs = {" + attrsStr + "}");
			}
			attrs["type"] = "text/javascript";
			attrs["src"] = l.getAttribute("src");
			//attrs["id"] = l.getAttribute("script-id");
			attrs["onload"] = delayedScriptOnload(l.rel);
			var relSrc = attrs["src"].replace(baseUrl,"");
			pastloadScripts[relSrc] = false;
			document.body.appendChild(HTMLScriptElement(attrs));
		}
	}
	essential.set("_queueDelayedAssets",_queueDelayedAssets);


	var requiredConfigs = {};

	function configRequired(url)
	{
		requiredConfigs[url] = false;
	}
	essential.set("configRequired",configRequired);

	function configLoaded(url)
	{
		requiredConfigs[url] = true;
		console.debug("config loaded:"+url);
		ApplicationConfig().justUpdateState();
	}
	essential.set("configLoaded",configLoaded);


	function _makeEventCleaner(listeners,bubble)
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
		cleaner.listeners = listeners; // for removeEventListeners
		return cleaner;
	}

	function MutableEvent(sourceEvent) {
		function ClonedEvent() { }
		ClonedEvent.prototype = sourceEvent || window.event; // IE event support
		var ev = new ClonedEvent();
		if (sourceEvent == undefined) {		// IE event object
			ev.target = ev.srcElement;
			//TODO ev.button 1,2,3 vs 1,2,4
		}
		ev.withActionInfo = MutableEvent_withActionInfo;
		ev.withDefaultSubmit = MutableEvent_withDefaultSubmit;
		return ev;		
	}
	essential.declare("MutableEvent",MutableEvent)

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

		if (eControl.addEventListener) {
			for(var n in listeners) {
				eControl.addEventListener(n, listeners[n], bubble || false);
			}
			eControl._cleaners.push(_makeEventCleaner(listeners,bubble || false));
		} else {
			var listeners2 = {};
			for(var n in listeners) {
				listeners2[n] = makeIeListener(eControl,listeners[n]);
				eControl.attachEvent('on'+n,listeners2[n]);
			}
			eControl._cleaners.push(_makeEventCleaner(listeners2,bubble || false));
		}   
	}
	essential.declare("addEventListeners",addEventListeners);

	//TODO removeEventListeners (eControl, listeners, bubble)

	/**
	 * Cleans up registered event listeners and other references
	 * 
	 * @param {Element} el
	 */
	function callCleaners(el)
	{
		var _cleaners = el._cleaners;
		if (_cleaners != undefined) {
			for(var i=0,c; c = _cleaners[i]; ++i) {
				c.call(el);
			}
			_cleaners = undefined;
		}
	};

	//TODO recursive clean of element and children?
	function cleanRecursively(el) {
		for(var child=el.firstChild; child; child = child.nextSibling) {
			callCleaners(child);
			cleanRecursively(child);
		}
	}
	essential.declare("cleanRecursively",cleanRecursively);


	function DialogAction(actionName) {
		this.actionName = actionName;
	} 
	DialogAction.prototype.activateArea = activateArea; // shortcut to global essential function
	var DialogActionGenerator = essential.set("DialogAction",Generator(DialogAction));


	function resizeTriggersReflow(ev) {
		// debugger;
		DocumentRoles()._resize_descs();
	}

	function enhanceUnhandledElements() {
		// debugger;
		var statefuls = ApplicationConfig(); // Ensure that config is present
		var handlers = DocumentRoles.presets("handlers");
		//TODO listener to presets -> Doc Roles additional handlers
		DocumentRoles()._enhance_descs();
		//TODO time to default_enhance yet?
	}

	/*
		action buttons not caught by enhanced dialogs/navigations
	*/
	function defaultButtonClick(ev) {
		ev = MutableEvent(ev).withActionInfo();
		if (ev.commandElement) {

			//TODO action event filtering
			//TODO disabled
			fireAction(ev);
		}
	}

	function fireAction(ev) 
	{
		var el = ev.actionElement, action = ev.action, name = ev.commandName;
		if (! el.actionVariant) {
			if (action) {
				action = action.replace(baseUrl,"");
			} else {
				action = "submit";
			}

			el.actionVariant = DialogActionGenerator.variant(action)(action);
		}

		if (el.actionVariant[name]) el.actionVariant[name](el);
		else {
			var sn = name.replace("-","_").replace(" ","_");
			if (el.actionVariant[sn]) el.actionVariant[sn](el);
		}
		//TODO else dev_note("Submit of " submitName " unknown to DialogAction " action)
	}
	essential.declare("fireAction",fireAction);

	function _StatefulField(name,stateful) {

	}
	var StatefulField = essential.declare("StatefulField",Generator(_StatefulField));

	StatefulField.prototype.destroy = function() {};
	StatefulField.prototype.discard = function() {};

	function _TimeField() {

	}
	StatefulField.variant("input[type=time]",Generator(_TimeField,_StatefulField));

	function _CommandField(name,stateful,role) {

	}
	var CommandField = StatefulField.variant("*[role=link]",Generator(_CommandField,_StatefulField));
	StatefulField.variant("*[role=button]",Generator(_CommandField,_StatefulField));

	var arrayContains = essential("arrayContains");

	/* Enhance all stateful fields of a parent */
	function enhanceStatefulFields(parent) {

		for(var el = parent.firstChild; el; el = el.nextSibling) {
			var name = el.name || el.getAttribute("data-name") || el.getAttribute("name");
			if (name) {
				var role = el.getAttribute("role");
				var variants = [];
				if (role) {
					if (el.type) variants.push("*[role="+role+",type="+el.type+"]");
					variants.push("*[role="+role+"]");
				} else {
					if (el.type) variants.push(el.tagName.toLowerCase()+"[type="+el.type+"]");
					variants.push(el.tagName.toLowerCase());
				}

				var stateful = StatefulResolver(el,true);
				var field = stateful.setField(StatefulField.variant(variants)(name,stateful,role));

				//TODO add field for _cleaners element 
				if (el._cleaners == undefined) el._cleaners = [];
				if (!arrayContains(el._cleaners,statefulCleaner)) el._cleaners.push(statefulCleaner); 
			}

			enhanceStatefulFields(el); // enhance children
		}
	}
	essential.declare("enhanceStatefulFields",enhanceStatefulFields);

	function _DocumentRoles(handlers,doc) {
		this.handlers = handlers || this.handlers || { enhance:{}, discard:{}, layout:{} };
		this._on_event = [];
		doc = doc || document;
		
		//TODO configure reference as DI arg
		var statefuls = ApplicationConfig(); // Ensure that config is present

		if (window.addEventListener) {
			window.addEventListener("resize",resizeTriggersReflow,false);
			doc.body.addEventListener("orientationchange",resizeTriggersReflow,false);
			doc.body.addEventListener("click",defaultButtonClick,false);
		} else {
			window.attachEvent("onresize",resizeTriggersReflow);
			doc.body.attachEvent("onclick",defaultButtonClick);
		}

		if (doc.querySelectorAll) {
			this.descs = this._role_descs(doc.querySelectorAll("*[role]"));
		} else {
			this.descs = this._role_descs(doc.getElementsByTagName("*"));
		}
		this._enhance_descs();
	}
	var DocumentRoles = essential.set("DocumentRoles",Generator(_DocumentRoles));
	
	_DocumentRoles.args = [
		ObjectType({ name:"handlers" })
	];

	_DocumentRoles.prototype._enhance_descs = function() 
	{
		var statefuls = ApplicationConfig(); // Ensure that config is present
		var incomplete = false, enhancedCount = 0;

		for(var i=0,desc; desc=this.descs[i]; ++i) {
			if (!desc.enhanced && this.handlers.enhance[desc.role]) {
				desc.instance = this.handlers.enhance[desc.role].call(this,desc.el,desc.role,statefuls.getConfig(desc.el));
				desc.enhanced = desc.instance === false? false:true;
				++enhancedCount;
			}
			if (! desc.enhanced) incomplete = true;
		}
		
		if (! incomplete && enhancedCount > 0) {
			for(var i=0,oe; oe = this._on_event[i]; ++i) {
				var descs = [];
				for(var j=0,desc; desc=this.descs[j]; ++j) if (oe.role== null || oe.role==desc.role) descs.push(desc); 

				if (oe.type == "enhanced") oe.func.call(this, this, descs);
			}
		} 
	};

	_DocumentRoles.discarded = function(instance) {
		var statefuls = ApplicationConfig(); // Ensure that config is present

		for(var i=0,desc; desc=instance.descs[i]; ++i) {
			if (!desc.discarded) {
				if (instance.handlers.discard[desc.role]) {
					instance.handlers.discard[desc.role].call(instance,desc.el,desc.role,desc.instance);
				} else {
					_DocumentRoles.default_discard.call(instance,desc.el,desc.role,desc.instance);
				}
				desc.discarded = true;
				//TODO clean layouter/laidout
				callCleaners(desc);
			}
		}
	};

	_DocumentRoles.prototype._role_descs = function(elements) {
		var descs = [];
		for(var i=0,e; e=elements[i]; ++i) {
			var role = e.getAttribute("role");
			if (role) {
				descs.push({
					"role": role,
					"el": e,
					"instance": null,
					"layout": {},
					"enhanced": false,
					"discarded": false
				});
			}
		}
		return descs;
	};

	_DocumentRoles.prototype._resize_descs = function() {
		for(var i=0,desc; desc = this.descs[i]; ++i) {
			if (desc.enhanced && this.handlers.layout[desc.role]) {
				var ow = desc.el.offsetWidth, oh  = desc.el.offsetHeight;
				if (desc.layout.width != ow || desc.layout.height != oh) {
					desc.layout.width = ow;
					desc.layout.height = oh;
					this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
				}
			}
		}
	};

	_DocumentRoles.prototype._layout_descs = function() {
		for(var i=0,desc; desc = this.descs[i]; ++i) {
			if (desc.enhanced && this.handlers.layout[desc.role]) {
				var updateLayout = false;
				var ow = desc.el.offsetWidth, oh  = desc.el.offsetHeight;
				if (ow == 0 && oh == 0) {
					if (desc.layout.displayed) updateLayout = true;
					desc.layout.displayed = false;
				}
				if (desc.layout.width != ow || desc.layout.height != oh) {
					desc.layout.width = ow;
					desc.layout.height = oh;
					updateLayout = true
				}
				if (desc.layout.area != _activeAreaName) { 
					desc.layout.area = _activeAreaName;
					updateLayout = true;
				}
				if (updateLayout) this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
			}
		}
	};

	_DocumentRoles.prototype._area_changed_descs = function() {
		for(var i=0,desc; desc = this.descs[i]; ++i) {
			if (desc.enhanced && this.handlers.layout[desc.role]) {
				desc.layout.area = _activeAreaName;
				this.handlers.layout[desc.role].call(this,desc.el,desc.layout,desc.instance);
			}
		}
	};

	_DocumentRoles.prototype.on = function(name,role,func) {
		if (arguments.length == 2) func = role;
		
		//TODO
		this._on_event.push({ "type":name,"func":func,"name":name,"role":role });
	}
	
	// Element specific handlers
	DocumentRoles.presets.declare("handlers.enhance", {});
	DocumentRoles.presets.declare("handlers.layout", {});
	DocumentRoles.presets.declare("handlers.discard", {});


	function form_onsubmit(ev) {
		var frm = this;
		setTimeout(function(){
			frm.submit(ev);
		},0);
		return false;
	}
	function form_submit(ev) {
		if (document.activeElement) document.activeElement.blur();
		this.blur();

		dialog_submit.call(this,ev);
	}
	function dialog_submit(clicked) {
		if (clicked == undefined) clicked = MutableEvent().withDefaultSubmit(this);

		if (clicked.commandElement) {
			fireAction(clicked);
		} else {
			//TODO default submit when no submit button or event
		}
	}

	function MutableEvent_withDefaultSubmit(form) {
		var commandName = "trigger";
		var commandElement = null;

		if (form.elements) {
			for(var i=0,e; e=form.elements[i]; ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
		} else {
			var buttons = form.getElementsByTagName("button");
			for(var i=0,e; e=buttons[i]; ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
			var inputs = form.getElementsByTagName("input");
			if (commandElement) for(var i=0,e; e=inputs[i]; ++i) {
				if (e.type=="submit") { commandName = e.name; commandElement = e; break; }
			}
		}
		this.action = form.action;
		this.actionElement = form;
		this.commandElement = commandElement;
		this.commandName = commandName;

		return this;
	}

	function toolbar_submit(ev) {
		return dialog_submit.call(this,ev);
	}

	function form_blur() {
		for(var i=0,e; e=this.elements[i]; ++i) e.blur();
	}
	function form_focus() {
		for(var i=0,e; e=this.elements[i]; ++i) {
			var autofocus = e.getAttribute("autofocus");
			if (autofocus == undefined) continue;
			e.focus();
			break; 
		}
	}
	
	function MutableEvent_withActionInfo() {
		var element = this.target;
		// role of element or ancestor
		// TODO minor tags are traversed; Stop at document, header, aside etc
		
		while(element) {
			var role = element.getAttribute("role");
			switch(role) {
				case "button":
				case "link":
				case "menuitem":
					this.stateful = StatefulResolver(element,true); //TODO configuration option for if state class map
					this.commandRole = role;
					this.commandElement = element;
					this.ariaDisabled = element.getAttribute("aria-disabled") != null;

					//determine commandName within action object
					this.commandName = element.getAttribute("data-name") || element.getAttribute("name"); //TODO name or id
					//TODO should links deduct actions and name from href
					element = null;
					break;
				case null:
					switch(element.tagName) {
						case "BUTTON":
						case "button":
							//TODO if element.type == "submit" && element.tagName == "BUTTON", set commandElement
							break;
					}
					break;
			}
			element = element.parentNode;
		}
		if (this.commandElement == undefined) return this; // no command

		element = this.commandElement;
		while(element) {
			var action = element.getAttribute("action");
			if (action) {
				this.action = action;
				this.actionElement = element;
				element = null;
			}			
			element = element.parentNode;
		}

		return this;
	}

	function dialog_button_click(ev) {
		ev = MutableEvent(ev).withActionInfo();

		if (ev.commandElement) {
			if (ev.stateful("state.disabled")) return; // disable
			if (ev.ariaDisabled) return; //TODO fold into stateful

			this.submit(ev); //TODO action context
		}
	}

	DocumentRoles.enhance_dialog = _DocumentRoles.enhance_dialog = function (el,role,config) {
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

				el.submit = dialog_submit;
				// debugger;
				//TODO capture enter from inputs, tweak tab indexes
				break;
		}
		
		addEventListeners(el, {
			"click": dialog_button_click
		},false);

		return {};
	};

	DocumentRoles.layout_dialog = _DocumentRoles.layout_dialog = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_dialog = _DocumentRoles.discard_dialog = function (el,role,instance) {
	};

	/* convert listed button elements */
	function forceNoSubmitType(buttons) {

		for(var i=0,button; button = buttons[i]; ++i) if (button.type == "submit") {
			button.setAttribute("type","button");
			if (button.type == "submit") button.type = "submit";
		}
	}

	DocumentRoles.enhance_toolbar = _DocumentRoles.enhance_toolbar = function(el,role,config) {
		// make sure no submit buttons outside form, or enter key will fire the first one.
		forceNoSubmitType(el.getElementsByTagName("BUTTON"));

		el.submit = toolbar_submit;

		addEventListeners(el, {
			"click": dialog_button_click
		},false);

		return {};
	};

	DocumentRoles.layout_toolbar = _DocumentRoles.layout_toolbar = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_toolbar = _DocumentRoles.discard_toolbar = function(el,role,instance) {
		
	};

	DocumentRoles.enhance_sheet = _DocumentRoles.enhance_sheet = function(el,role,config) {
		
		return {};
	};

	DocumentRoles.layout_sheet = _DocumentRoles.layout_sheet = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_sheet = _DocumentRoles.discard_sheet = function(el,role,instance) {
		
	};

	DocumentRoles.enhance_spinner = _DocumentRoles.enhance_spinner = function(el,role,config) {
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
	};

	DocumentRoles.layout_spinner = _DocumentRoles.layout_spinner = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_spinner = _DocumentRoles.discard_spinner = function(el,role,instance) {
		instance.stop();
		el.innerHTML = "";
	};
	
	function _lookup_generator(name,resolver) {
		var constructor = Resolver(resolver || "default")(name,"null");
		
		return constructor? Generator(constructor) : null;
	}

	DocumentRoles.enhance_application = _DocumentRoles.enhance_application = function(el,role,config) {
		if (config.variant) {
//    		variant of generator (default ApplicationController)
		}
		if (config.generator) {
			var g = _lookup_generator(config.generator,config.resolver);
			if (g) {
				var instance = g(el,role,config);
				return instance;
			}
			else return false; // not yet ready
		}
		
		return {};
	};

	DocumentRoles.layout_application = _DocumentRoles.layout_application = function(el,layout,instance) {
		
	};
	DocumentRoles.discard_application = _DocumentRoles.discard_application = function(el,role,instance) {
		
	};

	_DocumentRoles.default_enhance = function(el,role,config) {
		
		return {};
	};

	_DocumentRoles.default_layout = function(el,layout,instance) {
		
	};
	
	_DocumentRoles.default_discard = function(el,role,instance) {
		
	};
	
	function Layouter(key,el,conf) {

	}
	var LayouterGenerator = essential.declare("Layouter",Generator(Layouter));

	var stages = [];

	function StageLayouter(key,el,conf) {
		this.key = key;
		this.type = conf.layouter;
		this.areaNames = conf["area-names"];
		this.activeArea = null;

		this.baseClass = conf["base-class"];
		if (this.baseClass) this.baseClass += " ";
		else this.baseClass = "";

		stages.push(this); // for area updates
	}
	var StageLayouterGenerator = essential.declare("StageLayouter",Generator(StageLayouter));
	LayouterGenerator.variant("area-stage",StageLayouterGenerator);

	StageLayouter.prototype.refreshClass = function(el) {
		var areaClasses = [];
		for(var i=0,a; a = this.areaNames[i]; ++i) {
			if (a == this.activeArea) areaClasses.push(a + "-area-active");
			else areaClasses.push(a + "-area-inactive");
		}
		var newClass = this.baseClass + areaClasses.join(" ")
		if (el.className != newClass) el.className = newClass;
	};

	StageLayouter.prototype.updateActiveArea = function(areaName) {
		this.activeArea = areaName;
		this.refreshClass(document.getElementById(this.key)); //TODO on delay	
	}

	function Laidout(key,el,conf) {

	}
	var LaidoutGenerator = essential.declare("Laidout",Generator(Laidout));

	function MemberLaidout(key,el,conf) {
		this.key = key;
		this.type = conf.laidout;
		this.areaNames = conf["area-names"];

		this.baseClass = conf["base-class"];
		if (this.baseClass) this.baseClass += " ";
		else this.baseClass = "";

		el.className = this.baseClass + el.className;
	}
	var MemberLaidoutGenerator = essential.declare("MemberLaidout",Generator(MemberLaidout));
	LaidoutGenerator.variant("area-member",MemberLaidoutGenerator);

	var _activeAreaName,_liveAreas=false;

	function activateArea(areaName) {
		if (! _liveAreas) {
			_activeAreaName = areaName;
			return;
		}
		
		for(var i=0,s; s = stages[i]; ++i) {
			s.updateActiveArea(areaName);
		}
		_activeAreaName = areaName;
		// only use DocumentRoles layout if DOM is ready
		if (document.body) DocumentRoles()._layout_descs();
	}
	essential.set("activateArea",activateArea);
	
	function getActiveArea() {
		return _activeAreaName;
	}
	essential.set("getActiveArea",getActiveArea);

	function bringLive() {
		var ap = ApplicationConfig();

		// Allow the browser to render the page, preventing initial transitions
		_liveAreas = true;
		ap.state.set("livepage",true);
		ap.reflectState();

		if (_activeAreaName) {
			activateArea(_activeAreaName);
		} else {
			if (ap.isPageState("authenticated")) activateArea(ap.getAuthenticatedArea());
			else activateArea(ap.getIntroductionArea());
		}
	}

	function onPageLoad(ev) {
		var ap = ApplicationConfig();
		_liveAreas = true;
		ap.state.set("livepage",true);
		ap.updateState();
	}

	if (window.addEventListener) window.addEventListener("load",onPageLoad,false);
	else if (window.attachEvent) window.attachEvent("onload",onPageLoad);


	function _ApplicationConfig() {
		this.resolver = pageResolver;

		// copy state presets for backwards compatibility
		var state = this.resolver.reference("state","undefined");
		for(var n in this.state) state.set(n,this.state[n]);

		document.body.stateful = pageResolver;
		//TODO reflect class on body

		this.config = this.resolver.reference("config","undefined");
		this.state = state;
		this._gather();
		this._apply();

		setTimeout(bringLive,60);
	}
//    _ApplicationConfig.args = [
// 	    ObjectType({ name:"state" })
// 	    ];

	var ApplicationConfig = Generator(_ApplicationConfig);
	essential.set("ApplicationConfig",ApplicationConfig).restrict({ "singleton":true, "lifecycle":"page" });
	
	// preset on instance (old api)
	ApplicationConfig.presets.declare("state", { });

	ApplicationConfig.prototype.isPageState = function(whichState) {
		return this.resolver("state."+whichState);
	};
	ApplicationConfig.prototype.setPageState = function(whichState,v) {
		this.resolver.set("state."+whichState,v);
		if (this.state("launched")) this.updateState();
	};
	ApplicationConfig.prototype.getAuthenticatedArea = function() {
		// return "edit";
		return "sp-explorer";
	};
	ApplicationConfig.prototype.getIntroductionArea = function() {
		//return "signup";
		return "sp-explorer";
	};

	ApplicationConfig.prototype.declare = function(key,value) {
		this.config.declare(key,value);
	};

	ApplicationConfig.prototype._apply = function() {
		for(var k in this.config()) {
			var conf = this.config()[k];
			var el = this.getElement(k);

			if (conf.layouter) {
				el.layouter = LayouterGenerator.variant(conf.layouter)(k,el,conf);
			}
			if (conf.laidout) {
				el.laidout = LaidoutGenerator.variant(conf.laidout)(k,el,conf);
			}
		}
	};

	var _singleQuotesRe = new RegExp("'","g");

	ApplicationConfig.prototype._getElementRoleConfig = function(element) {

		var dataRole = element.getAttribute("data-role");
		if (dataRole) try {
			var map = JSON.parse("{" + dataRole.replace(_singleQuotesRe,'"') + "}");
			//TODO extend this.config for elements with id?
			if (element.id) {
				this.config()[element.id] = map;
			}
			return map;
		} catch(ex) {
			console.debug("Invalid config: ",dataRole,ex);
			return { "invalid-config":dataRole };
		}
		return {};
	};

	ApplicationConfig.prototype.getConfig = function(element) {
		//TODO mixin data-role
		if (element.id) {
			return this.config()[element.id] || this._getElementRoleConfig(element);
		}
		var name = element.getAttribute("name");
		if (name) {
			var p = element.parentNode;
			while(p) {
				if (p.id) {
					return this.config()[p.id + "." + name] || this._getElementRoleConfig(element);
				} 
				p = p.parentNode;
			} 
		}
		return this._getElementRoleConfig(element);
	};

	ApplicationConfig.prototype.getElement = function(key) {
		var keys = key.split(".");
		var el = document.getElementById(keys[0]);
		if (keys.length > 1) el = el.getElementByName(keys[1]);
		return el;
	};

	ApplicationConfig.prototype.justUpdateState = function() 
	{   
		var loading = false,loadingScripts = false,loadingConfig = false;

		for(var n in pastloadScripts) {
			if (pastloadScripts[n] == false) { loading = true; loadingScripts = true; console.debug(n+" missing")}
		}
		for(var n in requiredConfigs) {
			if (requiredConfigs[n] == false) { loading = true; loadingConfig = true; console.debug(n+" missing")}
		}
		this.resolver.set("state.loading",loading);
		this.resolver.set("state.loadingScripts",loadingScripts);
		this.resolver.set("state.loadingConfig",loadingConfig);
		if (this.state("loading") == false && this.state("launched") == false) {
			if (document.body) essential("instantiatePageSingletons")();
		}
	};

	ApplicationConfig.prototype.updateState = function() 
	{   
		this.justUpdateState();

		if (this.state("loading") == false) {
			if (document.body) essential("instantiatePageSingletons")();
			enhanceUnhandledElements();
		}

		//TODO do this in justUpdateState as well?
		this.reflectState();
	};


	ApplicationConfig.prototype.reflectState = function()
	{
		if (document.body == null) return; // body not there yet

		var bodyClass = ArraySet.apply(null,document.body.className.split(" "));
		bodyClass.set("login",! this.state("authenticated"));
		bodyClass.set("authenticated",this.state("authenticated"));
		bodyClass.set("loading",this.state("loading"));
		bodyClass.set("login-error",this.state("loginError"));
		bodyClass.set("launched",this.state("launched"));
		bodyClass.set("launching",this.state("launching"));
		bodyClass.set("livepage",this.state("livepage"));
		console.debug("Changing body from '"+document.body.className+"' to '"+bodyClass.join(" ")+"'");
		document.body.className = bodyClass.join(" "); //TODO should work: String(bodyClass)
	};

})();

// need with context not supported in strict mode
Resolver("essential")("ApplicationConfig").prototype._gather = function() {
	var scripts = document.getElementsByTagName("script");
	for(var i=0,s; s = scripts[i]; ++i) {
		if (s.getAttribute("type") == "application/config") {
			with(this) eval(s.text);
		}
	}
};



if(!this.JSON){
JSON={};
}
(function(){
function f(n){
return n<10?'0'+n:n;
}
if(typeof Date.prototype.toJSON!=='function'){
Date.prototype.toJSON=function(key){
return this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z';
};
String.prototype.toJSON=
Number.prototype.toJSON=
Boolean.prototype.toJSON=function(key){
return this.valueOf();
};
}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
gap,
indent,
meta={
'\b':'\\b',
'\t':'\\t',
'\n':'\\n',
'\f':'\\f',
'\r':'\\r',
'"':'\\"',
'\\':'\\\\'
},
rep;
function quote(string){
escapable.lastIndex=0;
return escapable.test(string)?
'"'+string.replace(escapable,function(a){
var c=meta[a];
return typeof c==='string'?c:
'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);
})+'"':
'"'+string+'"';
}
function str(key,holder){
var i,
k,
v,
length,
mind=gap,
partial,
value=holder[key];
if(value&&typeof value==='object'&&
typeof value.toJSON==='function'){
value=value.toJSON(key);
}
if(typeof rep==='function'){
value=rep.call(holder,key,value);
}
switch(typeof value){
case'string':
return quote(value);
case'number':
return isFinite(value)?String(value):'null';
case'boolean':
case'null':
return String(value);
case'object':
if(!value){
return'null';
}
gap+=indent;
partial=[];
if(Object.prototype.toString.apply(value)==='[object Array]'){
length=value.length;
for(i=0;i<length;i+=1){
partial[i]=str(i,value)||'null';
}
v=partial.length===0?'[]':
gap?'[\n'+gap+
partial.join(',\n'+gap)+'\n'+
mind+']':
'['+partial.join(',')+']';
gap=mind;
return v;
}
if(rep&&typeof rep==='object'){
length=rep.length;
for(i=0;i<length;i+=1){
k=rep[i];
if(typeof k==='string'){
v=str(k,value);
if(v){
partial.push(quote(k)+(gap?': ':':')+v);
}
}
}
}else{
for(k in value){
if(Object.hasOwnProperty.call(value,k)){
v=str(k,value);
if(v){
partial.push(quote(k)+(gap?': ':':')+v);
}
}
}
}
v=partial.length===0?'{}':
gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+
mind+'}':'{'+partial.join(',')+'}';
gap=mind;
return v;
}
}
if(typeof JSON.stringify!=='function'){
JSON.stringify=function(value,replacer,space){
var i;
gap='';
indent='';
if(typeof space==='number'){
for(i=0;i<space;i+=1){
indent+=' ';
}
}else if(typeof space==='string'){
indent=space;
}
rep=replacer;
if(replacer&&typeof replacer!=='function'&&
(typeof replacer!=='object'||
typeof replacer.length!=='number')){
throw new Error('JSON.stringify');
}
return str('',{'':value});
};
}
if(typeof JSON.parse!=='function'){
JSON.parse=function(text,reviver){
var j;
function walk(holder,key){
var k,v,value=holder[key];
if(value&&typeof value==='object'){
for(k in value){
if(Object.hasOwnProperty.call(value,k)){
v=walk(value,k);
if(v!==undefined){
value[k]=v;
}else{
delete value[k];
}
}
}
}
return reviver.call(holder,key,value);
}
cx.lastIndex=0;
if(cx.test(text)){
text=text.replace(cx,function(a){
return'\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);
});
}
if(/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').
replace(/(?:^|:|,)(?:\s*\[)+/g,''))){
j=eval('('+text+')');
return typeof reviver==='function'?
walk({'':j},''):j;
}
throw new SyntaxError('JSON.parse');
};
}
})();

// Simple Set Clipboard System
// Author: Joseph Huckaby

var ZeroClipboard = {
	
	version: "1.0.7",
	clients: {}, // registered upload clients on page, indexed by id
	moviePath: 'ZeroClipboard.swf', // URL to movie
	nextId: 1, // ID of next movie
	
	$: function(thingy) {
		// simple DOM lookup utility function
		if (typeof(thingy) == 'string') thingy = document.getElementById(thingy);
		if (!thingy.addClass) {
			// extend element with a few useful methods
			thingy.hide = function() { this.style.display = 'none'; };
			thingy.show = function() { this.style.display = ''; };
			thingy.addClass = function(name) { this.removeClass(name); this.className += ' ' + name; };
			thingy.removeClass = function(name) {
				var classes = this.className.split(/\s+/);
				var idx = -1;
				for (var k = 0; k < classes.length; k++) {
					if (classes[k] == name) { idx = k; k = classes.length; }
				}
				if (idx > -1) {
					classes.splice( idx, 1 );
					this.className = classes.join(' ');
				}
				return this;
			};
			thingy.hasClass = function(name) {
				return !!this.className.match( new RegExp("\\s*" + name + "\\s*") );
			};
		}
		return thingy;
	},
	
	setMoviePath: function(path) {
		// set path to ZeroClipboard.swf
		this.moviePath = path;
	},
	
	dispatch: function(id, eventName, args) {
		// receive event from flash movie, send to client		
		var client = this.clients[id];
		if (client) {
			client.receiveEvent(eventName, args);
		}
	},
	
	register: function(id, client) {
		// register new client to receive events
		this.clients[id] = client;
	},
	
	getDOMObjectPosition: function(obj, stopObj) {
		// get absolute coordinates for dom element
		var info = {
			left: 0, 
			top: 0, 
			width: obj.width ? obj.width : obj.offsetWidth, 
			height: obj.height ? obj.height : obj.offsetHeight
		};

		while (obj && (obj != stopObj)) {
			info.left += obj.offsetLeft;
			info.top += obj.offsetTop;
			obj = obj.offsetParent;
		}

		return info;
	},
	
	Client: function(elem) {
		// constructor for new simple upload client
		this.handlers = {};
		
		// unique ID
		this.id = ZeroClipboard.nextId++;
		this.movieId = 'ZeroClipboardMovie_' + this.id;
		
		// register client with singleton to receive flash events
		ZeroClipboard.register(this.id, this);
		
		// create movie
		if (elem) this.glue(elem);
	}
};

ZeroClipboard.Client.prototype = {
	
	id: 0, // unique ID for us
	ready: false, // whether movie is ready to receive events or not
	movie: null, // reference to movie object
	clipText: '', // text to copy to clipboard
	handCursorEnabled: true, // whether to show hand cursor, or default pointer cursor
	cssEffects: true, // enable CSS mouse effects on dom container
	handlers: null, // user event handlers
	
	glue: function(elem, appendElem, stylesToAdd) {
		// glue to DOM element
		// elem can be ID or actual DOM element object
		this.domElement = ZeroClipboard.$(elem);
		
		// float just above object, or zIndex 99 if dom element isn't set
		var zIndex = 99;
		if (this.domElement.style.zIndex) {
			zIndex = parseInt(this.domElement.style.zIndex, 10) + 1;
		}
		
		if (typeof(appendElem) == 'string') {
			appendElem = ZeroClipboard.$(appendElem);
		}
		else if (typeof(appendElem) == 'undefined') {
			appendElem = document.getElementsByTagName('body')[0];
		}
		
		// find X/Y position of domElement
		var box = ZeroClipboard.getDOMObjectPosition(this.domElement, appendElem);
		
		// create floating DIV above element
		this.div = document.createElement('div');
		var style = this.div.style;
		style.position = 'absolute';
		style.left = '' + box.left + 'px';
		style.top = '' + box.top + 'px';
		style.width = '' + box.width + 'px';
		style.height = '' + box.height + 'px';
		style.zIndex = zIndex;
		
		if (typeof(stylesToAdd) == 'object') {
			for (addedStyle in stylesToAdd) {
				style[addedStyle] = stylesToAdd[addedStyle];
			}
		}
		
		// style.backgroundColor = '#f00'; // debug
		
		appendElem.appendChild(this.div);
		
		this.div.innerHTML = this.getHTML( box.width, box.height );
	},
	
	getHTML: function(width, height) {
		// return HTML for movie
		var html = '';
		var flashvars = 'id=' + this.id + 
			'&width=' + width + 
			'&height=' + height;
			
		if (navigator.userAgent.match(/MSIE/)) {
			// IE gets an OBJECT tag
			var protocol = location.href.match(/^https/i) ? 'https://' : 'http://';
			html += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="'+protocol+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="'+width+'" height="'+height+'" id="'+this.movieId+'" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="'+ZeroClipboard.moviePath+'" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="'+flashvars+'"/><param name="wmode" value="transparent"/></object>';
		}
		else {
			// all other browsers get an EMBED tag
			html += '<embed id="'+this.movieId+'" src="'+ZeroClipboard.moviePath+'" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="'+width+'" height="'+height+'" name="'+this.movieId+'" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+flashvars+'" wmode="transparent" />';
		}
		return html;
	},
	
	hide: function() {
		// temporarily hide floater offscreen
		if (this.div) {
			this.div.style.left = '-2000px';
		}
	},
	
	show: function() {
		// show ourselves after a call to hide()
		this.reposition();
	},
	
	destroy: function() {
		// destroy control and floater
		if (this.domElement && this.div) {
			this.hide();
			this.div.innerHTML = '';
			
			var body = document.getElementsByTagName('body')[0];
			try { body.removeChild( this.div ); } catch(e) {;}
			
			this.domElement = null;
			this.div = null;
		}
	},
	
	reposition: function(elem) {
		// reposition our floating div, optionally to new container
		// warning: container CANNOT change size, only position
		if (elem) {
			this.domElement = ZeroClipboard.$(elem);
			if (!this.domElement) this.hide();
		}
		
		if (this.domElement && this.div) {
			var box = ZeroClipboard.getDOMObjectPosition(this.domElement);
			var style = this.div.style;
			style.left = '' + box.left + 'px';
			style.top = '' + box.top + 'px';
		}
	},
	
	setText: function(newText) {
		// set text to be copied to clipboard
		this.clipText = newText;
		if (this.ready) this.movie.setText(newText);
	},
	
	addEventListener: function(eventName, func) {
		// add user event listener for event
		// event types: load, queueStart, fileStart, fileComplete, queueComplete, progress, error, cancel
		eventName = eventName.toString().toLowerCase().replace(/^on/, '');
		if (!this.handlers[eventName]) this.handlers[eventName] = [];
		this.handlers[eventName].push(func);
	},
	
	setHandCursor: function(enabled) {
		// enable hand cursor (true), or default arrow cursor (false)
		this.handCursorEnabled = enabled;
		if (this.ready) this.movie.setHandCursor(enabled);
	},
	
	setCSSEffects: function(enabled) {
		// enable or disable CSS effects on DOM container
		this.cssEffects = !!enabled;
	},
	
	receiveEvent: function(eventName, args) {
		// receive event from flash
		eventName = eventName.toString().toLowerCase().replace(/^on/, '');
				
		// special behavior for certain events
		switch (eventName) {
			case 'load':
				// movie claims it is ready, but in IE this isn't always the case...
				// bug fix: Cannot extend EMBED DOM elements in Firefox, must use traditional function
				this.movie = document.getElementById(this.movieId);
				if (!this.movie) {
					var self = this;
					setTimeout( function() { self.receiveEvent('load', null); }, 1 );
					return;
				}
				
				// firefox on pc needs a "kick" in order to set these in certain cases
				if (!this.ready && navigator.userAgent.match(/Firefox/) && navigator.userAgent.match(/Windows/)) {
					var self = this;
					setTimeout( function() { self.receiveEvent('load', null); }, 100 );
					this.ready = true;
					return;
				}
				
				this.ready = true;
				this.movie.setText( this.clipText );
				this.movie.setHandCursor( this.handCursorEnabled );
				break;
			
			case 'mouseover':
				if (this.domElement && this.cssEffects) {
					this.domElement.addClass('hover');
					if (this.recoverActive) this.domElement.addClass('active');
				}
				break;
			
			case 'mouseout':
				if (this.domElement && this.cssEffects) {
					this.recoverActive = false;
					if (this.domElement.hasClass('active')) {
						this.domElement.removeClass('active');
						this.recoverActive = true;
					}
					this.domElement.removeClass('hover');
				}
				break;
			
			case 'mousedown':
				if (this.domElement && this.cssEffects) {
					this.domElement.addClass('active');
				}
				break;
			
			case 'mouseup':
				if (this.domElement && this.cssEffects) {
					this.domElement.removeClass('active');
					this.recoverActive = false;
				}
				break;
		} // switch eventName
		
		if (this.handlers[eventName]) {
			for (var idx = 0, len = this.handlers[eventName].length; idx < len; idx++) {
				var func = this.handlers[eventName][idx];
			
				if (typeof(func) == 'function') {
					// actual function reference
					func(this, args);
				}
				else if ((typeof(func) == 'object') && (func.length == 2)) {
					// PHP style object + method, i.e. [myObject, 'myMethod']
					func[0][ func[1] ](this, args);
				}
				else if (typeof(func) == 'string') {
					// name of function
					window[func](this, args);
				}
			} // foreach event handler defined
		} // user defined handler for event
	}
	
};

ZeroClipboard.setMoviePath("js/ZeroClipboard.swf");
