Resolver("essential::ApplicationConfig::").restrict({ "singleton":true, "lifecycle":"page" });
Resolver("essential::EnhancedDescriptor::").maintainer = setInterval(Resolver("essential::EnhancedDescriptor::").maintainAll,330); // minimum frequency 3 per sec
Resolver("essential::EnhancedDescriptor::").refresher = setInterval(Resolver("essential::EnhancedDescriptor::").refreshAll,160); // minimum frequency 3 per sec

//TODO clearInterval on unload