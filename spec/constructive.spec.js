@describe "resolver and generator" {
    it "should do default resolves" {
        
    }
}

@describe "generator" {
	it "should do default generation" {
		Generator() should instanceof Object;
	}
	
	it "should register base and variant constructors" {
		function Base()
		{
		};
		
		function Variant1()
		{
		};

		Generator.setVariant(Base,"one",Variant1);
		
		Generator(Base).constructor should == Base;
		Generator(Base,"one").constructor should == Variant1;
		Generator(Base,"unknown").constructor should == Base;
	}
	
	it "should generate same instance for singleton" {

		function SingleBase()
		{
		}
		Generator.setBase(SingleBase,{},[{ method:"init", args:[] }]);
		
		SingleBase.prototype.init = function()
		{
			this.initCalled = true;
		};
			
		generator.setSingleton(SingleBase);
		
		var instance = Generator(SingleBase)()
		//	assertTrue(instance.initCalled);
			
		Generator(SingleBase)() should == instance;
	}
}