var {Server} = require('ringo/httpserver');
var {Forthwith} = require('forthwith');
var {core} = require('core');

var exported = {
    server: null,
    start: function(port) {
        console.log('starting admin web console');
        
        this.server = new Server({port: port || 8765});
        
        var clientDirectory = core.path(core.fileName, './client');
        this.server.getDefaultContext().serveStatic(clientDirectory);
        
        Forthwith.start(this.server);
        this.server.start();
        
        require('./events');
    }
}

exports.Console = exported;
