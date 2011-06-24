var scheduler = require('ringo/scheduler');
var {Hazelcast} = require('hazelcast');
var {Events} = require('./events');
var {core} = require('core');

var exported = {
    core: null,
    entities: [],
    
    start: function() {
        this.reloadEntities();
        this.migrationListener = Hazelcast.events.migration.listen({
            completed: this.migrationCompleted.bind(this)
        });
        
        this.entryListener = Hazelcast.events.entries.listen(Hazelcast.map('entities'), {
            added:   this.entryAdded.bind(this),
            removed: this.entryRemoved.bind(this),
            evicted: this.entryEvicted.bind(this)
        }, { local: true });

        this.entryConfigurationListener = Hazelcast.events.entries.listen(Hazelcast.map('entities/configuration'), {
            added:   this.entryAdded.bind(this),
            removed: this.entryRemoved.bind(this),
            updated: this.entryUpdated.bind(this),
            evicted: this.entryEvicted.bind(this)
        }, { local: true });
        
        this.eventListener = Events.listen(this.event.bind(this));
        
        this.timer = scheduler.setInterval(this.heartbeat.bind(this), 100);
    },
    
    stop: function() {
        scheduler.clearInterval(this.timer);
        this.eventListener.remove();
        this.entryConfigurationListener.remove();
        this.entryListener.remove();
        this.migrationListener.remove();
    },
    
    heartbeat: function() {
        var now = Date.now();
        
        core.values(this.entities, function(entity) {
            if (entity.state.active && entity.state.next && entity.state.next <= now) {
                entity.heartbeat();
            }
        });
    },
    
    event: function(event) {
        var entities = this.entities;
        (entities.byEventSubject[event.subject] || []).forEach(function(id) {
            var entity = entities[id];
            if (entity && entity.state.active) {
                entity.event(event);
            }
        });
    },
    
    reloadEntities: function() {
        var localEntries = this.core.local();
        
        this.entities = localEntries.reduce(function(map, entity) {
            map[entity.id] = entity;
            return map;
        }, {});
        
        var byEventSubject = this.entities.byEventSubject = {};
        core.values(this.entities, function(entity) {
            var events = (entity.configuration && entity.configuration.events) || {};
            Object.keys(events).forEach(function(subject) {
                byEventSubject[subject] = byEventSubject[subject] || [];
                byEventSubject[subject].push(entity.id);
            });
        });
    },
    
    migrationCompleted: function(event) {
        // TODO: be smarter about this
        this.reloadEntities();
    },
    
    entryAdded: function(event) {
        // TODO: be smarter about this
        this.reloadEntities();
    },
    
    entryUpdated: function(event) {
        // TODO: be smarter about this
        this.reloadEntities();
    },
    
    entryRemoved: function(event) {
        // TODO: be smarter about this
        this.reloadEntities();
    },
    
    entryEvicted: function(event) {
        // this should not happen
    }
};

exports.Manager = exported;

