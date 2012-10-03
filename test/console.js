module("Translation tests");

(function(){
	var translations = Resolver("translations");

	translations.declare(["keys",null,"abc","en"],"My ABC");
	translations.declare(["phrases",null,"my abc","en"],"My ABC");

	translations.declare(["keys",null,"url","begin"],"[");
	translations.declare(["keys",null,"url","end"],"]");
	translations.declare(["keys",null,"url","en"],"My URL [url]");
	translations.declare(["phrases",null,"my url","en"],"My URL [url]");

})()

test("Static Translations english",function(){
	var translations = Resolver("translations");
	var _ = Resolver("essential")("translate");

	equal(_("unmatched"),undefined,"Undefined for unmatched keys")
	equal(_({ key:"unmatched" }),undefined)
	equal(_({ phrase:"unmatched phrase" }),"unmatched phrase")

	equal(_("abc"),"My ABC","Phrase for matched key")
	equal(_({ key:"abc" }),"My ABC")
	equal(_({ phrase:"my abc" }),"My ABC")

	equal(_("url",{ url: "http://abc.com"}),"My URL http://abc.com")

	ok(1,"{cache:true, key:'abc' } saves resulting template on object")
})

module("Console tests");

test("Multi parameter logging",function(){
	ok(1)
})

//TODO eitherClass
// test("ArraySet as classList replacement",function(){
	
// })