var Objects = require('ringo/utils/objects');
var {core} = require('core');
var {Hazelcast} = require('hazelcast');
var rhino = require('ringo/engine').getRhinoEngine();

function get(suffix, id) core.json(Hazelcast.map('entities' + suffix).get(id));
function set(suffix, id, data) Hazelcast.map('entities' + suffix).put(id, JSON.stringify(data));

var klass = function(id) {
    this.id = id;
    this.reload();
};

klass.prototype = core.extend(klass.prototype, {
    reload: function() {
        this.state = get('', this.id);
        this.configuration = get('/configuration', this.id) || {};
        this.code = get('/configuration/code', this.id) || {};
        this.store = get('/store', this.id) || {};
        
        this.bindings = {
            heartbeat: function() { console.log('default heartbeart handler', this.id, this.now); },
            event: function() { console.log('default event handler', this.id, this.event.subject, this.event.time); }
        };
        
        if (this.code.heartbeat) {
            try {
                this.bindings.heartbeat = rhino.evaluateExpression('function(){' + this.code.heartbeat + ';};');
            } catch(e) {
                this.state.active = false;
                this.state.invalid = true;
                this.state.exception = e.toString();
                this.saveState();
            }
        }
                
        if (this.code.event) {
            try {
                this.bindings.event = rhino.evaluateExpression('function(){' + this.code.event + ';};');
            } catch(e) {
                this.state.active = false;
                this.state.invalid = true;
                this.state.exception = e.toString();
                this.saveState();
            }
        }
    },
    
    save: function() {
        this.saveState();
        this.saveStore();
        this.saveConfiguration();
    },
    
    saveState: function() {
        set('', this.id, this.state);
    },
    
    saveStore: function() {
        set('/store', this.id, this.store);
    },
    
    saveConfiguration: function() {
        this.configuration.modified = Date.now();
        set('/configuration', this.id, this.configuration);
        set('/configuration/code', this.id, this.code);
    },
    
    heartbeat: function() {
        var now = Date.now();
        
        try {
            var local = {id: this.id, store: this.store, last: this.state.last, now: now};
            this.bindings.heartbeat.apply(local);
            this.store = local.store;
            this.saveStore();
        } catch(e) {
            this.state.last = now;
            this.state.active = false;
            this.state.invalid = true;
            this.state.exception = e.toString();
            this.saveState();
            return;
        };
        
        if (this.configuration.interval) {
            this.state.next = this.state.next || now;
            this.state.next += this.configuration.interval;
            this.state.next = Math.max(this.state.next, now);
        } else {
            this.state.next = null;
        }
        
        this.state.last = now;
        this.saveState();
    },
    
    event: function(event) {
        try {
            var local = {id: this.id, store: this.store, event: event};
            this.bindings.event.apply(local);
            this.store = local.store;
            this.saveStore();
        } catch(e) {
            this.state.active = false;
            this.state.invalid = true;
            this.state.exception = e.toString();
            this.saveState();
            return;
        }
        
        this.state.event = event;
        this.saveState();
    }
});

exports.Entity = klass;
