@describe "resolver and generator" { 
    it "should do default resolves" {
        
		var shapes = Resolver()("my.shapes");
		var tools = Resolver()("my.tools");

		Resolver().set("my.tools.X",5);
		Resolver.default.namespace.my.tools.X should == 5;
		shapes should === Resolver.default.namespace.my.shapes;
		tools should === Resolver.default.namespace.my.tools;

		Resolver.default.namespace.my should != undefined;
	}
	it "should override default resolver" {
		Resolver("default").override({});
		Resolver.default.namespace.my should === undefined;

		Resolver()("my")
		Resolver.default.namespace.my should != undefined;
	}
	it "should provide resolver reference" {
		var my = Resolver().reference("my");
		my.get() should != undefined;

		var num = Resolver().reference("num");
		num.set(5);
		num.get() should == 5;

    }
}

@describe "generator" {
	it "should do default generation" {
		Generator() should instanceof Object;
	}
	
	it "should register base and variant constructors" {

		var NumberType = Generator(Resolver("essential")("Type"),"Number");

		var shapes = {};

		function Shape() {}
		Shape.arguments = [ ];

		function Rectangle(width,height) {
			
		}
		Rectangle.bases = [Shape];
		Rectangle.arguments = [ NumberType({name:"width",preset:true}), NumberType({name:"height",preset:true}) ]; //TODO NumberType({name:"width"}) optional: , default:  seed:
		Rectangle.prototype.earlyFunc = function() {};

		shapes.Shape = Generator(Shape);
		shapes.Rectangle = Generator(Rectangle);

		Rectangle.prototype.getWidth = function() {
			return this.width;
		};

		typeof shapes.Shape.info.options should == 'object'
		shapes.Rectangle.bases should == Rectangle.bases;
		shapes.Rectangle.arguments should == Rectangle.arguments

		var s = shapes.Shape();
		var r55 = shapes.Rectangle(5,5);
		r55 should be_instanceof(Rectangle);
		r55 should be_instanceof(shapes.Rectangle);
		r55 should be_instanceof(Shape);
		r55 should be_instanceof(shapes.Shape);

		shapes.Rectangle.prototype.getWidth should == Rectangle.prototype.getWidth
		typeof shapes.Rectangle.prototype.earlyFunc should == 'function'
		r55.width should == 5;
		r55.getWidth() should == 5;

		shapes.Shape.mixin({
			sides: 0
		});

		shapes.Rectangle.mixin({
			sides: 2,
			getRatio: function() { return this.width / this.height; }
		});

		Shape.prototype.sides should == 0;
		s.sides should == 0;
		Rectangle.prototype.sides should == 2;
		r55.sides should == 2;


		function Circle(diameter) {
			
		}
		Circle.prototype.earlyFunc = function() {};

		shapes.Circle = Generator(Circle,Shape,{
			arguments : [ NumberType({name:"diameter",preset:true}) ] //TODO NumberType({name:"width"}) optional: , default:  seed:
		});

		Circle.prototype.getWidth = function() {
			return this.diameter;
		};

		shapes.Circle.bases.length should == 1;
		shapes.Circle.bases[0] should == Shape;
		shapes.Circle.info.options.arguments.length should == 1;
		typeof shapes.Circle.info.options.arguments[0] should == 'object';
		Circle.prototype.sides should == 0;

		var c9 = shapes.Circle(9);
		c9 should be_instanceof(Circle);
		c9 should be_instanceof(shapes.Circle);
		c9 should be_instanceof(Shape);
		c9 should be_instanceof(shapes.Shape);
		c9.diameter should == 9;
		c9.getWidth() should == 9;

		//TODO Dialog.variant(({type:"bond"},BondDialog);
	}
	
	it "should make a simple type generator" {
		var Simple = Generator(function(v) { return v; }, { alloc: false });

		var s8 = Simple(8);
		s8 should == 8;
	}
	
	it "should generate same instance for singleton" {

		Generator(SingleBase).setSingleton();
		
		var instance = Generator(SingleBase)()
		//	assertTrue(instance.initCalled);
			
		Generator(SingleBase)() should == instance;
	}
}

