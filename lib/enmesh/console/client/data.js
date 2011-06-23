cluster.data = {
    members: {},
    partitions: []
};

forthwith.connected = function() {
    this.members = function(members) {
        cluster.data.members = {};
        members.map(function(member) {
            cluster.data.members[member.address] = member;
        });
        cluster.interface.update.members();
    };
    this.memberAdded = function(member) {
        cluster.data.members[member.address] = member;
        cluster.interface.update.members();
    };
    this.memberRemoved = function(member) {
        delete cluster.data.members[member.address];
        cluster.interface.update.members();
    };
    
    this.partitions = function(partitions) {
        cluster.data.partitions = partitions;
        cluster.interface.update.partitions();
    };
    this.migrationStarted = function(event) {
        console.log('started', event.id, event.old, event.new);
        var entry = cluster.data.partitions[event.id];
        entry.from = event.old;
        entry.to = event.new;
        cluster.interface.update.partition(entry);
    };
    this.migrationCompleted = function(event) {
        console.log('completed', event.id, event.old, event.new);
        var entry = cluster.data.partitions[event.id];
        entry.previous = entry.owner;
        entry.from = event.old;
        entry.owner = event.new;
        entry.target = null;
        cluster.interface.update.partition(entry);
    };
};

forthwith.message = function(message) {
    console.log('message', message);
    if (message.begin) {
        forthwith.remote.members();
        forthwith.remote.partitions();
    }
};

forthwith.connect();
