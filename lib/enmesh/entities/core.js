var {Hazelcast} = require('hazelcast');
var {Entity} = require('./entity');

var exported = {
    create: function(id) {
        var entity = new Entity(id);
        
        entity.state = {
            active: true,
            invalid: false,
            last: null,
            next: Date.now(),
            created: Date.now()
        };
        
        entity.save();
        
        return entity;
    },
    
    load: function(id) {
        return new Entity(id);
    },
    
    all: function() {
        var ids = Hazelcast.engine.getMap('entities').keySet().toArray();
        return ids.map(function(id) exported.load(id));
    },
    
    local: function() {
        var ids = Hazelcast.engine.getMap('entities').localKeySet().toArray();
        return ids.map(function(id) exported.load(id));
    },
};

exported.Manager = require('./manager').Manager;
exported.Manager.core = exported;
exported.Events = require('./events').Events;

exports.Entities = exported;
