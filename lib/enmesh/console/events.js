var {Forthwith} = require('forthwith');
var {Hazelcast} = require('hazelcast');
var events = require('hazelcast/events');
var scheduler = require('ringo/scheduler');

Forthwith.connected = function(socket) {
    socket.listeners = {};
    scheduler.setTimeout(function() { socket.send({begin: true}); }, 100);
};

var local = Forthwith.local;

function notify() {
    var args = Array.prototype.slice.call(arguments);
    var method = args.shift();
    Forthwith.everyone.do(function(c) c.remote[method].apply(c.remote, args));
}

function memberAsJSON(member) {
    return {
        address: member.getInetSocketAddress().toString(),
        local: member.localMember(),
        client: member.isSuperClient()
    };
}

events.membership.listen({
    added: function(event) notify('member', 'added', memberAsJSON(event.getMember())),
    removed: function(event) notify('member', 'removed', memberAsJSON(event.getMember()))
});

local.members = function() {
    var members = Hazelcast.engine.getCluster().getMembers().toArray();
    this.remote.members(members.map(memberAsJSON));
};

function migrationEventAsJSON(event) {
    return {
        id: event.getPartitionId(),
        'new': event.getNewOwner() ? event.getNewOwner().getInetSocketAddress().toString() : null,
        old: event.getOldOwner() ? event.getOldOwner().getInetSocketAddress().toString() : null
    };
};

events.migration.listen({
    started: function(event) notify('migration', 'started', migrationEventAsJSON(event)),
    completed: function(event) notify('migration', 'completed', migrationEventAsJSON(event))
});

local.partitions = function() {
    var partitions = Hazelcast.engine.getPartitionService().getPartitions().toArray();
    this.remote.partitions(partitions.map(function(partition) {
        return {
            id: partition.getPartitionId(),
            owner: partition.getOwner().getInetSocketAddress().toString()
        };
    }));
};

function instanceAsJSON(instance) {
    return {
        name: instance.getName(),
        type: instance.getInstanceType().toString().toLowerCase()
    };
}

events.instances.listen({
    created: function(event) notify('instance', 'created', instanceAsJSON(event.getInstance())),
    destroyed: function(event) notify('instance', 'destroyed', instanceAsJSON(event.getInstance())),
});

local.instances = function() {
    var instances = Hazelcast.engine.getInstances().toArray();
    this.remote.instances(instances.map(instanceAsJSON).reduce(function(result, instance) {
        result[instance.name] = instance.type;
        return result;
    }, {}));
};

local.entries = function(map) {
    var partitionService = Hazelcast.engine.getPartitionService();
    var entries = new ScriptableList(Hazelcast.engine.getMap(map).entrySet());
    this.remote.entries(map, 
        entries.map(function(entry) {
            var value = entry.value;
            try { value = JSON.parse(entry.value) } catch (e) {};
            
            return {
                key: entry.key,
                value: value,
                partition: partitionService.getPartition(entry.key.toString()).getPartitionId()
            };
        })
    );
};

function entryEventAsJSON(event) {
    var value = event.getValue();
    try { value = JSON.parse(value); } catch(e) {};
    
    var old = event.getOldValue();
    try { old = JSON.parse(old); } catch(e) {};
    
    var partitionService = Hazelcast.engine.getPartitionService();
    var partitionId = partitionService.getPartition(event.getKey().toString()).getPartitionId();
    
    return {
        key: event.getKey(),
        value: value,
        partition: partitionId,
        old: old,
        member: event.getMember().getInetSocketAddress().toString()
    };
}

local.watch = function(type, name) {
    var key = [type, name].join(':');
    if (this.listeners[key]) return;
    
    var remote = this.remote;
    
    if (type == 'map') {
        var map = Hazelcast.engine.getMap(name)
        this.listeners[key] = events.entries.listen(map, {
            added: function(event) remote.entry('added', name, entryEventAsJSON(event)),
            removed: function(event) remote.entry('removed', name, entryEventAsJSON(event)),
            updated: function(event) remote.entry('updated', name, entryEventAsJSON(event)),
            evicted: function(event) remote.entry('evicted', name, entryEventAsJSON(event))
        }, {
            includeValue: true
        });
    } else if (type == 'topic') {
        var topic = Hazelcast.engine.getTopic(name);
        this.listeners[key] = events.messages.listen(topic, {
            on: function(message) {
                try { message = JSON.parse(message); } catch (e) {};
                remote.message(name, message);
            }
        });
    }
};

local.unwatch = function(type, name) {
    var key = [type, name].join(':');
    var listener = this.listeners[key];
    if (listener) listener.remove();
    delete this.listeners[key];
};

Forthwith.export();
