module('Essential Fields');

test("Enhancing elements creating stateful fields",function() {

	//TODO revise all stateful fields, probably needs to be rethought

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
	// equal(linkField.prototype.destroy.callCount,2);
	// equal(linkField.prototype.discard.callCount,2);
	// equal(buttonField.prototype.destroy.callCount,4);
	// equal(buttonField.prototype.discard.callCount,4);
});

