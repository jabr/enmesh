var {Forthwith} = require('forthwith');
var {Hazelcast} = require('hazelcast');
var events = require('hazelcast/events');
var scheduler = require('ringo/scheduler');

Forthwith.connected = function(socket) {
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
    added: function(event) notify('memberAdded', memberAsJSON(event.getMember())),
    removed: function(event) notify('memberRemoved', memberAsJSON(event.getMember()))
});

local.members = function() {
    var members = Hazelcast.engine.getCluster().getMembers().toArray();
    this.members(members.map(memberAsJSON));
};

function migrationEventAsJSON(event) {
    return {
        id: event.getPartitionId(),
        'new': event.getNewOwner() ? event.getNewOwner().getInetSocketAddress().toString() : null,
        old: event.getOldOwner() ? event.getOldOwner().getInetSocketAddress().toString() : null
    };
};

events.migration.listen({
    started: function(event) notify('migrationStarted', migrationEventAsJSON(event)),
    completed: function(event) notify('migrationCompleted', migrationEventAsJSON(event))
});

local.partitions = function() {
    var partitions = Hazelcast.engine.getPartitionService().getPartitions().toArray();
    this.partitions(partitions.map(function(partition) {
        return {
            id: partition.getPartitionId(),
            owner: partition.getOwner().getInetSocketAddress().toString()
        };
    }));
}

Forthwith.export();
