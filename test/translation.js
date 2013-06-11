module("Translation tests");

test("Default locale",function() {
	var translations = Resolver("translations");

	equal(translations("locale"),navigator.language || navigator.userLanguage);

	translations.setLocales(["en-US","en-GB"]);
	ok(translations(["locales","en-us"]));
	ok(translations(["locales","en-gb"]));
	ok(! translations(["locales","de-de"],"undefined"));
	ok(! translations(["locales","fr-fr"],"undefined"));

	equal(translations(["locales","en-us"]).chain,"en");
	equal(translations(["locales","en-gb"]).chain,"en");
})

!function(){
	var translations = Resolver("translations");
	var lcl = translations("locale");

	if (lcl != "en") translations.set(["locales",lcl],{ chain:"en" });
	translations.set(["locales","en-us"],{ chain:"en" });
	translations.set(["locales","en-gb"],{ chain:"en" });
	translations.set(["locales",navigator.language || navigator.userLanguage],{ chain:"en" });

	translations.declare(["keys",null,"abc","en"],"My ABC");
	translations.declare(["phrases",null,"my abc","en"],"My ABC");

	translations.declare(["keys",null,"url","begin"],"[");
	translations.declare(["keys",null,"url","end"],"]");
	translations.declare(["keys",null,"url","en"],"My URL [url]");
	translations.declare(["phrases",null,"my url","en"],"My URL [url]");

	translations.declare(["keys",null,"login.error","begin"],"[");
	translations.declare(["keys",null,"login.error","end"],"]");
	//TODO translations.declare(["keys",null,"login.error","defaults"],{ user:"?", url:"?"});
	translations.declare(["keys",null,"login.error","en"],"Not logged in with [user] URL [url]");
	translations.declare(["phrases",null,"login error","en"],"Not logged in with [user] URL [url]");

}();

test("Configuring translations",function() {
	var translations = Resolver("translations");
	var _ = Resolver("essential::translate::");

	function BucketGenerator() {
		return {};
	}
	translations.setKeysForLocale("en",null,{
		"some-key-1": "First Phrase",
		"some-key-2": "Second Phrase"
	},BucketGenerator);

	equal(_("some-key-1"),"First Phrase");
	equal(_("some-key-2"),"Second Phrase");

	translations.setKeysForLocale(translations("locale"),null,{
		"some-key-1": "First Phrase 2",
		"some-key-2": "Second Phrase 2"
	},BucketGenerator);

	equal(_("some-key-1"),"First Phrase 2");
	equal(_("some-key-2"),"Second Phrase 2");
});

test("Static Translations english",function(){
	var translations = Resolver("translations");
	var _ = Resolver("essential::translate::");

	equal(_("unmatched"),undefined,"Undefined for unmatched keys")
	equal(_({ key:"unmatched" }),undefined)
	equal(_({ phrase:"unmatched phrase" }),"unmatched phrase")

	equal(_("abc"),"My ABC","Phrase for matched key")
	equal(_({ key:"abc" }),"My ABC")
	equal(_({ phrase:"my abc" }),"My ABC")

	equal(_("url",{ url: "http://abc.com"}),"My URL http://abc.com")

	equal(_("login.error",{ url: "http://abc.com", user:"user1" }),"Not logged in with user1 URL http://abc.com")
	equal(_("login.error",{ url: "http://abc.com" }),"Not logged in with [user] URL http://abc.com")
	equal(_("login.error",{ user:"user1" }),"Not logged in with user1 URL [url]")

	translations.set("locale","en"); //TODO support chain

	//TODO equal(translations.reverseTranslate("My ABC").key,"abc");

	ok(1,"{cache:true, key:'abc' } saves resulting template on object")
	ok(1,"reverse translate, phrase -> key -> phrase")
})

test("Translation Subset",function(){
	var translations = Resolver("translations");

	function BucketGenerator() {
		return {};
	}
	translations.setKeysForLocale("en",null,{
		"prefix.a":"Prefix a",
		"prefix.b":"Prefix b",
		"1": "First Phrase",
		"2": "Second Phrase"
	},BucketGenerator);

	translations.setKeysForLocale("en","context",{
		"prefix.a":"Context a",
		"prefix.b":"Context b"
	},BucketGenerator);

	// using prefix
	var subset = translations.makeKeyTranslationSubset("prefix.");
	equal(subset.translate("prefix.a"),"Prefix a","Found 1 of 2 translations");
	equal(subset.translate("prefix.b"),"Prefix b","Found 2 of 2 translations");
	equal(subset.translate("prefix.c"),null,"Undefined translations handled");
	equal(subset.translate("1"),null,"Undefined translations handled");
	equal(subset.translate("2"),null,"Undefined translations handled");

	equal(subset.reverseTranslate("Prefix a").key,"prefix.a");
	equal(subset.reverseTranslate("Prefix b").key,"prefix.b");

	// using context
	var subset = translations.makeKeyTranslationSubset("context");
	equal(subset.translate("prefix.a"),"Context a","Found 1 of 2 translations (context)");
	equal(subset.translate("prefix.b"),"Context b","Found 2 of 2 translations (context)");

	//TODO en-US
})
