[EssentialJS](http://essentialjs.com/) - Essential Javascript
================================

Essential web page enhancements. It gives you the freedom to scale from fast loading HTML 5 web pages to full blown HTML 5 web applications.

## Resolver and Generator

Many languages have package and class concepts built in. Javascript has the global object, first order constructor functions, and function prototypes.
If your code is no more than a few thousand lines the built-in concepts a quite sufficient. 
When moving beyond that point many people try to replicate the package and class concepts with mixed success. We use a different approach which give you even more power.

    var core = Resolver().reference("appname.core");
    function DecimalFormatter(decimals) {
    }
    core.declare("formatters.DecimalFormatter",Generator(DecimalFormatter));

Here we define a class equivalent in the module `appname.core.formatters`. The module will be accessible globally.

If you want to create a DecimalFormatter instance simply call.

    var formatter = Resolver()("appname.core.formatters.DecimalFormatter")(2);

The really powerful part is that you can configure the resolution and generation somewhere else.

You can change the default resolver to use a private namespace keeping the global object unchanged.
You can configure the default variant for `appname.core.formatters.DecimalFormatter` to be a different constructor.

Of course there is much more to it, check out the [Wiki](http://github.com/essentialjs/EssentialJs/Wiki)
or the [Website](http://essentialjs.com)

## Building Essential and Essentials

First prepare for development

    npm install

Once you have the needed modules the source can be built with

    grunt build

This will build plain and minified versions.

The default grunt target will host a development web server.


## Building demo apps

    ./node_modules/.bin/lessc app/css/basic.less app/css/basic.css
    ./node_modules/.bin/lessc app/css/enhanced.less app/css/enhanced.css

## License

You are quite free to use the library in your own projects. It is covered by an MIT license.

The demos are intended to remain as such and are therefore covered by an AGPL license.


## Releases

Recent releases

### 0.6.0

Resolver("document") used to track document loading,modules,resources
document.onreadystatechange is used as the main loading progress mechanism.


### 0.5.0

The queuing of links and meta tags in the head is reworked to be more efficient.

Resolver("essential::console::")() gets active console. Custom console can be set.
Resolver("essential::console.logger::")(destination,level) gets specific console logger for destination
Destinations can be routed to custom queue dump or routing push method.


