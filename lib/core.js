var fs = require('fs');
var Objects = require('ringo/utils/objects');

function stackTrace() {
    // TODO: is there not a better way to get this info in rhino/ringo?
    var ex = new Packages.org.mozilla.javascript.EvaluatorException("");
    ex.fillInStackTrace();
    return ex.getScriptStack();
}

exports.core = {
    get fileName() {
        // use the third frame as the first two are stackTrace helper and this getter.
        return stackTrace()[2].fileName;
    },
    
    get lineNumber() {
        // use the third frame as the first two are stackTrace helper and this getter.
        return stackTrace()[2].lineNumber;
    },
    
    path: function(base, relative) {
        return fs.resolve(fs.relative(base), relative);
    },
    
    json: function(data) {
        try {
            data = JSON.parse(data);
        } catch(e) {};
        return data;
    },
    
    // just like merge but in reverse (i.e. attributes on later arguments take precendence)
    extend: function() {
        var args = Array.prototype.slice.call(arguments);
        return Objects.merge.apply(Objects, args.reverse());
    },
    
    values: function(map, callback) {
        Object.keys(map).forEach(function(key, index) callback(map[key], index, key));
    }
};
