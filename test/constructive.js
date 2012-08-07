function assert(b) {
	if (!eval(b)) alert("failed:"+ b);
}

// Generators

var NumberType = Generator(Resolver("essential")("Type"),"Number");

var shapes = {};

function Shape() {}
Shape.args = [ ];

function Rectangle(width,height) {
	
}
Rectangle.bases = [Shape];
Rectangle.args = [ NumberType({name:"width",preset:true}), NumberType({name:"height",preset:true}) ]; //TODO NumberType({name:"width"}) optional: , default:  seed:
Rectangle.prototype.earlyFunc = function() {};

shapes.Shape = Generator(Shape);
shapes.Rectangle = Generator(Rectangle);

Rectangle.prototype.getWidth = function() {
	return this.width;
};

assert("typeof shapes.Shape.info.options == 'object'");
assert("shapes.Rectangle.bases == Rectangle.bases");
assert("shapes.Rectangle.args == Rectangle.args");

var s = shapes.Shape();
var r55 = shapes.Rectangle(5,5);
assert("r55 instanceof Rectangle");
assert("r55 instanceof shapes.Rectangle");
assert("r55 instanceof Shape");
assert("r55 instanceof shapes.Shape");
assert("shapes.Rectangle.prototype.getWidth == Rectangle.prototype.getWidth");
assert("typeof shapes.Rectangle.prototype.earlyFunc == 'function'");
assert("5 == r55.width");
assert("5 == r55.getWidth()");

shapes.Shape.mixin({
	sides: 0
});

shapes.Rectangle.mixin({
	sides: 2,
	getRatio: function() { return this.width / this.height; }
});

assert("0 == Shape.prototype.sides");
assert("0 == s.sides");
assert("2 == Rectangle.prototype.sides");
assert("2 == r55.sides");


function Circle(diameter) {
	
}
Circle.prototype.earlyFunc = function() {};

shapes.Circle = Generator(Circle,Shape,{
	args : [ NumberType({name:"diameter",preset:true}) ] //TODO NumberType({name:"width"}) optional: , default:  seed:
});

Circle.prototype.getWidth = function() {
	return this.diameter;
};

assert("shapes.Circle.bases.length == 1");
assert("shapes.Circle.bases[0] == Shape");
assert("shapes.Circle.info.options.args.length == 1");
assert("typeof shapes.Circle.info.options.args[0] == 'object'");
assert("0 == Circle.prototype.sides");

var c9 = shapes.Circle(9);
assert("c9 instanceof Circle");
assert("c9 instanceof shapes.Circle");
assert("c9 instanceof Shape");
assert("c9 instanceof shapes.Shape");
assert("9 == c9.diameter");
assert("9 == c9.getWidth()");

var Simple = Generator(function(v) { return v; }, { alloc: false });

var s8 = Simple(8);
assert("s8 == 8");
