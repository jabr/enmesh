var Class = (function() {
    var isFunction = function(object) { return typeof object == "function"; };
    var C = function() {};
    C.create = function(prototype) {
        var k = function(magic) {
            // only call initialization if not created with our magic cookie.
            if (magic != isFunction && isFunction(this.initialize)) this.initialize.apply(this, arguments);
        };
        k.prototype = new this(isFunction); // use our private method as magic cookie
        for (key in prototype)
            (function(object, superObject) { // create a closure
                // override _super with actual prototype's corresponding method
                k.prototype[key] = !isFunction(object) || !isFunction(superObject) ? object : function() { this._super = superObject; return object.apply(this, arguments); };
            })(prototype[key], k.prototype[key]);
        k.prototype.constructor = k;
        k.extend = this.extend || this.create;
        return k;
    };
    return C;
})();

var __ = {};

var cluster = {};

head.js('data.js', 'interface.js');
