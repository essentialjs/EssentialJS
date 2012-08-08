module('Generator tests')

test('Non allocating generator',function() {
	var Simple = Generator(function(v) { return v; }, { alloc: false });

	var s8 = Simple(8);
	equal(s8, 8);

})

test('Generator inherit from constructor defined on main constructor',function(){

	var _Shape = sinon.spy();
	var _Rectangle = sinon.spy();
	_Rectangle.bases = [_Shape];

	var Shape = Generator(_Shape);
	var Rectangle = Generator(_Rectangle);

	ok(!! Shape.__generator__)
	ok(!! _Shape.__generator__)
	ok(!! Rectangle.__generator__)
	ok(!! _Rectangle.__generator__)
	equal(Rectangle.bases.length, 1)
	equal(Rectangle.bases[0], _Shape)

	Rectangle(1,2,3,4);
	equal(_Shape.callCount,1)
	equal(_Rectangle.callCount,1)
	ok(_Shape.calledWith(1,2,3,4))
	ok(_Rectangle.calledWith(1,2,3,4))
})

test('Generator inherit from generator defined on main constructor',function(){

	var _Shape = sinon.spy();
	var Shape = Generator(_Shape);

	var _Rectangle = sinon.spy();
	_Rectangle.bases = [Shape];

	var Rectangle = Generator(_Rectangle);

	ok(!! Shape.__generator__)
	ok(!! _Shape.__generator__)
	ok(!! Rectangle.__generator__)
	ok(!! _Rectangle.__generator__)
	equal(Rectangle.bases.length, 1)
	equal(Rectangle.bases[0], _Shape)

	Rectangle(1,2,3,4);
	equal(_Shape.callCount,1)
	equal(_Rectangle.callCount,1)
	ok(_Shape.calledWith(1,2,3,4))
	ok(_Rectangle.calledWith(1,2,3,4))
})

test('Shape generator with parameters',function() {

	var NumberType = Resolver("essential")("Type").variant("Number");

	function _Shape() {}
	_Shape.args = [ ];

	function _Rectangle(width,height) {
	
	}
	_Rectangle.bases = [_Shape];
	_Rectangle.args = [ NumberType({name:"width",preset:true}), NumberType({name:"height",preset:true}) ]; //TODO NumberType({name:"width"}) optional: , default:  seed:
	_Rectangle.prototype.earlyFunc = function() {};

	var Shape = Generator(_Shape);
	var Rectangle = Generator(_Rectangle);

	Rectangle.prototype.getWidth = function() {
		return this.width;
	};

	equal(typeof Shape.info.options,'object');
	equal(Rectangle.bases, _Rectangle.bases);
	equal(Rectangle.args, _Rectangle.args);

	var s = Shape();
	var r55 = Rectangle(5,5);
	ok(r55 instanceof _Rectangle);
	ok(r55 instanceof Rectangle);
	ok(r55 instanceof _Shape);
	ok(r55 instanceof Shape);
	equal(Rectangle.prototype.getWidth, _Rectangle.prototype.getWidth);
	equal(typeof Rectangle.prototype.earlyFunc, 'function');
	equal(r55.width, 5);
	equal(r55.getWidth(), 5);

	/*
	Shape.mixin({
		sides: 0
	});

	Rectangle.mixin({
		sides: 2,
		getRatio: function() { return this.width / this.height; }
	});

	equal(_Shape.prototype.sides, 0);
	equal(s.sides, 0);
	equal(Rectangle.prototype.sides, 2);
	equal(r55.sides, 2);
	*/

	function _Circle(diameter) {
	
	}
	_Circle.prototype.earlyFunc = function() {};

	var Circle = Generator(_Circle,Shape,{
		args : [ NumberType({name:"diameter",preset:true}) ] //TODO NumberType({name:"width"}) optional: , default:  seed:
	});

	Circle.prototype.getWidth = function() {
		return this.diameter;
	};

	equal(Circle.bases.length, 1);
	equal(Circle.bases[0], _Shape);
	equal(Circle.info.options.args.length, 1);
	equal(typeof Circle.info.options.args[0], 'object');
	//TODO equal(_Circle.prototype.sides, 0);

	var c9 = Circle(9);
	ok(c9 instanceof _Circle);
	ok(c9 instanceof Circle);
	ok(c9 instanceof _Shape);
	ok(c9 instanceof Shape);
	equal(c9.diameter, 9);
	equal(c9.getWidth(), 9);


})

// inherit from generator not constructor

